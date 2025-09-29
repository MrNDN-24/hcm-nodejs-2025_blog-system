import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { SharedModule } from '../shared/shared.module';
import { PostModule } from '../posts/post.module';
import { UserModule } from '../users/user.module';
import { Notification } from '../notifications/entities/notify.entity';
import { NotificationModule } from '../notifications/notify.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Notification]), SharedModule, PostModule, UserModule, NotificationModule],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
