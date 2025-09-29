import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type, Transform } from 'class-transformer';
import { UserSerializer } from '@/modules/users/serializers/user.serializer';
import { AuthorSerializer } from '@/modules/authors/serializers/author.serializer';

export class CommentSerializer {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: () => UserSerializer })
  @Expose()
  @Type(() => UserSerializer)
  user: UserSerializer;

  @ApiProperty({ type: () => AuthorSerializer, required: false })
  @Expose()
  @Transform(({ obj }) => obj.user?.author || null)
  author: AuthorSerializer | null;

  @ApiProperty({ type: () => CommentSerializer, isArray: true })
  @Expose()
  @Type(() => CommentSerializer)
  replies: CommentSerializer[];

  // Thêm parent
  @ApiProperty({ type: () => CommentSerializer, required: false })
  @Expose()
  @Type(() => CommentSerializer)
  parent?: CommentSerializer;
}
