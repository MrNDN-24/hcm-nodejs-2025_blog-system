import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, IsNull } from 'typeorm';
import { Post, PostStatus } from './entities/post.entity';
import { Category } from '@/modules/categories/entities/category.entity';
import { Tag } from '@/modules/tags/entities/tag.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { I18nService } from 'nestjs-i18n';
import { RequestI18nContextService } from '@/common/context/i18nContext.service';
import { BaseI18nService } from '../shared/baseI18n.service';
import { PostSerializer } from './serializers/post.serializer';
import { plainToInstance } from 'class-transformer';
import { CloudinaryService } from '../shared/cloudinary.service';
import { formatName } from '@/common/utils/formatName.util';
import { AuthorService } from '../authors/author.service';
import { CategoryService } from '../categories/category.service';
import { TagService } from '../tags/tag.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';

@Injectable()
export class PostService extends BaseI18nService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    i18n: I18nService,
    Context: RequestI18nContextService,
    private readonly AuthorService: AuthorService,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    super(i18n, Context);
  }

  async create(
    userId: number,
    dto: CreatePostDto,
    file?: Express.Multer.File,
  ): Promise<PostSerializer> {
    const queryRunner = this.dataSource.createQueryRunner();

    // 1. Kết nối và bắt đầu transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Lấy Author
      const author = await this.AuthorService.getAuthorByUserId(
        userId,
        queryRunner.manager,
      );
      // 3. Handle Category
      const category = await this.handleCategory(dto, queryRunner.manager);

      // 4. Handle Tags
      const tags = await this.handleTags(dto, queryRunner.manager);

      //5. Upload File
      let imageUrl = dto.imageUrl || undefined;
      if (file) {
        imageUrl = await this.cloudinaryService.uploadImage(file);
      }

      // 6. Tạo Post
      const post = queryRunner.manager.create(Post, {
        title: dto.title,
        content: dto.content,
        author,
        category,
        tags,
        imageUrl,
      });
      const savedPost = await queryRunner.manager.save(post);

      // 7. Commit transaction
      await queryRunner.commitTransaction();

      return plainToInstance(PostSerializer, savedPost, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      // Rollback nếu có lỗi
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        await this.t('post.create_failed'),
      );
    } finally {
      // Giải phóng connection
      await queryRunner.release();
    }
  }

  private async handleCategory(
    dto: CreatePostDto,
    manager: EntityManager,
  ): Promise<Category | undefined> {
    const { category } = dto;
    if (!category) return undefined;

    if (category.id) {
      return this.categoryService.findById(category.id, manager);
    }

    const formattedName = formatName(category.name);
    const existingCategory = await this.categoryService.findByName(
      formattedName,
      manager,
    );

    if (existingCategory) {
      throw new BadRequestException(
        await this.t('post.category_already_exists'),
      );
    }

    const newCategory = manager.create(Category, {
      name: formattedName,
    });
    return manager.save(newCategory);
  }

  private async handleTags(
    dto: CreatePostDto,
    manager: EntityManager,
  ): Promise<Tag[]> {
    const tags: Tag[] = [];
    if (!dto.tags?.length) return tags;

    for (const tagDto of dto.tags) {
      if (tagDto.id) {
        const existingTags = await this.tagService.findByIds(
          [tagDto.id],
          manager,
        );
        const existingTag = existingTags[0];

        if (!existingTag) {
          throw new BadRequestException(await this.t('post.tag_not_found'));
        }
        tags.push(existingTag);
      } else {
        const formattedName = formatName(tagDto.name);
        const existingTag = await this.tagService.findByName(
          formattedName,
          manager,
        );

        if (existingTag) {
          throw new BadRequestException(
            await this.t('post.tag_already_exists'),
          );
        }
        const newTag = manager.create(Tag, { name: formattedName });
        await manager.save(newTag);
        tags.push(newTag);
      }
    }
    return tags;
  }

  async getMyPosts(userId: number): Promise<PostSerializer[]> {
    try {
      const author = await this.AuthorService.getAuthorByUserId(userId);
      const posts = await this.postRepo.find({
        where: {
          author: { id: author.id },
          deletedAt: IsNull(),
        },
        relations: ['author', 'category', 'tags'],
        order: { createdAt: 'DESC' },
      });

      return plainToInstance(PostSerializer, posts, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(await this.t('post.fetch_failed'));
    }
  }

  async softDeletePost(postId: number): Promise<{ message: string }> {
    try {
      const post = await this.postRepo.findOne({
        where: { id: postId, deletedAt: IsNull() },
      });
      if (!post) {
        throw new NotFoundException(await this.t('post.not_found'));
      }

      post.deletedAt = new Date();
      await this.postRepo.save(post);

      return { message: await this.t('post.deleted_success') };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        await this.t('post.delete_failed'),
      );
    }
  }

  async updatePost(
    postId: number,
    dto: UpdatePostDto,
    file?: Express.Multer.File,
  ): Promise<PostSerializer> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const post = await queryRunner.manager.findOne(Post, {
        where: { id: postId, deletedAt: IsNull() },
        relations: ['category', 'tags', 'author'],
      });

      if (!post) {
        throw new NotFoundException(await this.t('post.not_found'));
      }

      // 1. Gán trực tiếp, không cần check if
      post.title = dto.title ?? post.title;
      post.content = dto.content ?? post.content;

      // 2. Gán image
      post.imageUrl = file
        ? await this.cloudinaryService.uploadImage(file)
        : (dto.imageUrl ?? post.imageUrl);

      // 3. Category
      const category = await this.handleCategory(
        dto as any,
        queryRunner.manager,
      );
      if (category) {
        post.category = category;
      }

      // 4. Tags
      const tags = await this.handleTags(dto as any, queryRunner.manager);
      post.tags = tags;

      // 5. Lưu post
      const updatedPost = await queryRunner.manager.save(post);

      await queryRunner.commitTransaction();

      return plainToInstance(PostSerializer, updatedPost, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;

      throw new InternalServerErrorException(
        await this.t('post.update_failed'),
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getAllPosts(filter: FilterPostDto): Promise<PostSerializer[]> {
    try {
      const query = this.postRepo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.category', 'category')
        .leftJoinAndSelect('post.tags', 'tags')
        .where('post.deletedAt IS NULL')
        .andWhere('post.status = :status', { status: PostStatus.APPROVED })
        .orderBy('post.createdAt', 'DESC');

      // Map các filter field sang column và value
      const filterMap: Record<string, { column: string; value?: string }> = {
        title: { column: 'post.title', value: filter.title },
        authorName: { column: 'author.penName', value: filter.authorName },
        categoryName: { column: 'category.name', value: filter.categoryName },
        tagName: { column: 'tags.name', value: filter.tagName },
      };

      // Loop qua filterMap và thêm dynamic AND WHERE
      Object.entries(filterMap).forEach(([key, { column, value }]) => {
        if (value) {
          query.andWhere(`${column} LIKE :${key}`, { [key]: `%${value}%` });
        }
      });

      const posts = await query.getMany();

      return plainToInstance(PostSerializer, posts, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(await this.t('post.fetch_failed'));
    }
  }

  async getPostDetail(postId: number): Promise<PostSerializer> {
    try {
      const post = await this.postRepo.findOne({
        where: { id: postId, deletedAt: IsNull(), status: PostStatus.APPROVED },
        relations: ['author', 'category', 'tags'],
      });

      if (!post) {
        throw new NotFoundException(await this.t('post.not_found'));
      }

      return plainToInstance(PostSerializer, post, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(await this.t('post.fetch_failed'));
    }
  }

  async findPost(postId: number): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id: postId, deletedAt: IsNull(), status: PostStatus.APPROVED },
      relations: ['author', 'category', 'tags', 'author.user'],
    });

    if (!post) {
      throw new NotFoundException(await this.t('post.not_found'));
    }
    return post;
  }
}
