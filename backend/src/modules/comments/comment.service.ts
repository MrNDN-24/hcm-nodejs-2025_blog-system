import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/comment.dto';
import { BaseI18nService } from '../shared/baseI18n.service';
import { I18nService } from 'nestjs-i18n';
import { RequestI18nContextService } from '@/common/context/i18nContext.service';
import { plainToInstance } from 'class-transformer';
import { CommentSerializer } from './serializers/comment.serializer';
import { PostService } from '../posts/post.service';
import { UserService } from '../users/user.service';
import { NotifyGateway } from '../notifications/notify.gateway';
import { Notification } from '../notifications/entities/notify.entity';

@Injectable()
export class CommentService extends BaseI18nService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly postService: PostService,
    private readonly userService: UserService,
    protected readonly i18n: I18nService,
    protected readonly context: RequestI18nContextService,
    private readonly notifyGateway: NotifyGateway,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {
    super(i18n, context);
  }

  async createComment(
    userId: number,
    dto: CreateCommentDto,
  ): Promise<CommentSerializer> {
    try {
      const post = await this.postService.findPost(dto.postId);
      const user = await this.userService.findUser(userId);

      const parent = dto.parentId
        ? await this.commentRepo.findOne({ where: { id: dto.parentId } })
        : null;

      if (dto.parentId && !parent) {
        throw new NotFoundException(await this.t('comments.parent_not_found'));
      }

      const comment = this.commentRepo.create({
        content: dto.content,
        post,
        user,
        parent: parent ?? undefined,
      });

      const saved = await this.commentRepo.save(comment);

      // --- Xử lý notification ---
      const authorUser = post.author.user; //instance User của tác giả

      if (authorUser.id !== userId) {
        const message = `${user.fullName || user.username} đã bình luận trên bài viết của bạn: ${post.title}`;

        const notify = this.notificationRepo.create({
          user: authorUser,
          message,
          post,
        });
        await this.notificationRepo.save(notify);

        this.notifyGateway.sendNotification(authorUser.id, {
          id: notify.id,
          message,
          postId: post.id,
        });
      }
      return plainToInstance(CommentSerializer, saved, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException(await this.t('comments.create_failed'));
    }
  }

  async getCommentsByPost(postId: number): Promise<CommentSerializer[]> {
    try {
      const comments = await this.commentRepo.find({
        where: { post: { id: postId }, parent: IsNull() },
        relations: [
          'user',
          'user.author',
          'parent',
          'replies',
          'replies.user',
          'replies.user.author',
          'replies.parent',
        ],
        order: { createdAt: 'DESC' },
      });

      return plainToInstance(CommentSerializer, comments, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      throw new BadRequestException(await this.t('comments.fetch_failed'));
    }
  }
}
