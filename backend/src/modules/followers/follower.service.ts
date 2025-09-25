import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follower } from './entities/follower.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Author } from '@/modules/authors/entities/author.entity';
import { BaseI18nService } from '../shared/baseI18n.service';
import { I18nService } from 'nestjs-i18n';
import { RequestI18nContextService } from '@/common/context/i18nContext.service';
import { FollowerSerializer } from './serializers/follower.serializer';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FollowersService extends BaseI18nService {
  constructor(
    @InjectRepository(Follower)
    private followerRepo: Repository<Follower>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Author)
    private authorRepo: Repository<Author>,
    i18n: I18nService,
    Context: RequestI18nContextService,
  ) {
    super(i18n, Context);
  }

  // Follow an author
  async followAuthor(userId: number, authorId: number) {
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      const author = await this.authorRepo.findOne({ where: { id: authorId } });

      if (!user || !author) {
        throw new NotFoundException(
          await this.t('followers.user_or_author_not_found'),
        );
      }

      const existing = await this.followerRepo.findOne({
        where: { user: { id: userId }, author: { id: authorId } },
      });

      if (existing) {
        throw new BadRequestException(await this.t('followers.already_follow'));
      }

      const follower = this.followerRepo.create({ user, author });
      return this.followerRepo.save(follower);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;

      throw new BadRequestException(await this.t('followers.follow_failed'));
    }
  }

  // Unfollow an author
  async unfollowAuthor(userId: number, authorId: number) {
    try {
      const follower = await this.followerRepo.findOne({
        where: { user: { id: userId }, author: { id: authorId } },
      });

      if (!follower) {
        throw new NotFoundException(
          await this.t('followers.follower_not_found'),
        );
      }

      await this.followerRepo.remove(follower);

      return { message: await this.t('followers.unfollow_success') };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new BadRequestException(await this.t('followers.unfollow_failed'));
    }
  }

  // Danh sách tác giả mà user đang follow
  async getFollowedAuthors(userId: number): Promise<FollowerSerializer[]> {
    try {
      const followers = await this.followerRepo.find({
        where: { user: { id: userId } },
        relations: ['author', 'author.user'],
      });
      return plainToInstance(FollowerSerializer, followers, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new BadRequestException(
        await this.t('followers.fetch_followed_authors_failed'),
      );
    }
  }

  async getFollowersByAuthor(authorId: number): Promise<Follower[]> {
    try {
      return await this.followerRepo.find({
        where: { author: { id: authorId } },
        relations: ['user'],
      });
    } catch (error) {
      throw new BadRequestException(
        await this.t('followers.fetch_followers_failed'),
      );
    }
  }
}
