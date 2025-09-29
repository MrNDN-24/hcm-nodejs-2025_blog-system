import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post } from './entities/post.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Category } from '../categories/entities/category.entity';
import { Author } from '../authors/entities/author.entity';
import { SharedModule } from '../shared/shared.module';
import { AuthorModule } from '../authors/author.module';
import { CategoryModule } from '../categories/category.module';
import { TagModule } from '../tags/tag.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Tag, Category, Author]),
    SharedModule,
    AuthorModule,
    CategoryModule,
    TagModule,
  ],
  providers: [PostService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
