import { Expose, Type } from 'class-transformer';
import { CategorySerializer } from '@/modules/categories/serializers/category.serializer';
import { TagSerializer } from '@/modules/tags/serializers/tag.serializer';
import { AuthorSerializer } from '@/modules/authors/serializers/author.serializer';
import { ApiProperty } from '@nestjs/swagger';

export class PostSerializer {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  imageUrl: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  // Relations
  @ApiProperty({ type: CategorySerializer })
  @Expose()
  @Type(() => CategorySerializer)
  category?: CategorySerializer;

  @ApiProperty({ type: [TagSerializer] })
  @Expose()
  @Type(() => TagSerializer)
  tags?: TagSerializer[];

  @ApiProperty({ type: AuthorSerializer })
  @Expose()
  @Type(() => AuthorSerializer)
  author: AuthorSerializer;
}
