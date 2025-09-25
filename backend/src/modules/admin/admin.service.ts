import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like } from 'typeorm';
import { Author } from '@/modules/authors/entities/author.entity';
import { ApprovalAuthorDto } from './dto/approval-author.dto';
import { BaseI18nService } from '../shared/baseI18n.service';
import { I18nService } from 'nestjs-i18n';
import { RequestI18nContextService } from '@/common/context/i18nContext.service';
import { AuthorSerializer } from '../authors/serializers/author.serializer';
import { AuthorStatus } from '@/modules/authors/entities/author.entity';
import { ApprovalPostDto } from './dto/approval-post.dto';
import { Post } from '../posts/entities/post.entity';
import { PostStatus } from '../posts/entities/post.entity';
import { plainToInstance } from 'class-transformer';
import { PostSerializer } from '../posts/serializers/post.serializer';
import { FilterPostDto } from '../posts/dto/filter-post.dto';
import { FollowersService } from '../followers/follower.service';
import { Notification } from '../notifications/entities/notify.entity';
import { NotifyGateway } from '../notifications/notify.gateway';

@Injectable()
export class AdminService extends BaseI18nService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    i18n: I18nService,
    context: RequestI18nContextService,
    private readonly followersService: FollowersService,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly notifyGateway: NotifyGateway,
  ) {
    super(i18n, context);
  }

  async getPendingAuthors(): Promise<AuthorSerializer[]> {
    try {
      const authors = await this.authorRepository.find({
        where: { isApproved: AuthorStatus.PENDING },
        relations: ['user'],
      });

      return plainToInstance(AuthorSerializer, authors, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new BadRequestException(await this.t('author.get_pending_failed'));
    }
  }

  async approvalAuthor(
    authorId: number,
    dto: ApprovalAuthorDto,
  ): Promise<{ message: string }> {
    try {
      const author = await this.authorRepository.findOne({
        where: { id: authorId, isApproved: AuthorStatus.PENDING },
        relations: ['user'],
      });

      if (!author) {
        throw new NotFoundException(await this.t('author.author_not_found'));
      }

      author.isApproved = dto.isApproved;
      await this.authorRepository.save(author);

      return {
        message:
          dto.isApproved === AuthorStatus.APPROVED
            ? await this.t('author.approval_success')
            : await this.t('author.update_success'),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        await this.t('author.update_approval_failed'),
      );
    }
  }

  async approvalPost(
    postId: number,
    dto: ApprovalPostDto,
  ): Promise<{ message: string }> {
    try {
      const post = await this.postRepo.findOne({
        where: { id: postId, deletedAt: IsNull(), status: PostStatus.PENDING },
        relations: ['author', 'author.user', 'category', 'tags'],
      });

      if (!post) {
        throw new NotFoundException(await this.t('post.not_found'));
      }

      post.status = dto.status;

      // Nếu reject
      if (dto.status === PostStatus.REJECTED) {
        if (!dto.rejectionReason) {
          throw new BadRequestException(
            await this.t('post.reject_reason_required'),
          );
        }
        post.rejectionReason = dto.rejectionReason;
      } else {
        post.rejectionReason = null;
      }

      await this.postRepo.save(post);

      if (dto.status === PostStatus.APPROVED) {
        // Lấy danh sách follower
        const followers = await this.followersService.getFollowersByAuthor(
          post.author.id,
        );

        const notifications = followers.map((f) => {
          // Tạo message trực tiếp
          const message = `Tác giả ${post.author.penName} vừa đăng một bài viết mới: "${post.title}"`;

          return this.notificationRepo.create({
            user: f.user,
            post: post,
            message,
          });
        });

        const savedNotifs = await this.notificationRepo.save(notifications);
        // Phát realtime qua socket
        savedNotifs.forEach((notif) => {
          this.notifyGateway.sendNotification(notif.user.id, {
            id: notif.id,
            message: notif.message,
            postId: post.id,
          });
        });
      }

      return {
        message:
          dto.status === PostStatus.APPROVED
            ? await this.t('post.approval_success')
            : await this.t('post.reject_success'),
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException(
        await this.t('post.update_failed'),
      );
    }
  }

  async getAllAuthors(): Promise<AuthorSerializer[]> {
    try {
      const authors = await this.authorRepository.find({
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });

      return plainToInstance(AuthorSerializer, authors, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        await this.t('author.fetch_failed'),
      );
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
        .orderBy('post.createdAt', 'DESC');

      query.andWhere('post.status = :status', {
        status: filter.status ?? 'pending',
      });

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
      throw new InternalServerErrorException(await this.t('post.fetch_failed'));
    }
  }
}
