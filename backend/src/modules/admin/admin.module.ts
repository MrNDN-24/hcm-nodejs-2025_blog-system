import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Author } from '@/modules/authors/entities/author.entity';
import { SharedModule } from '../shared/shared.module';
import { Post } from '../posts/entities/post.entity';
import { FollowersModule } from '../followers/follower.module';
import { Notification } from '../notifications/entities/notify.entity';
import { NotificationModule } from '../notifications/notify.module';

@Module({
  imports: [TypeOrmModule.forFeature([Author, Post, Notification]), SharedModule, FollowersModule, NotificationModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
