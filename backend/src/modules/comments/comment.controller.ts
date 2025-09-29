import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/comment.dto';
import { CommentSerializer } from './serializers/comment.serializer';
import { ApiResponseData } from '@/common/interceptors/responseSwagger.interceptor';

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiResponseData(CommentSerializer)
  async createComment(
    @Req() req,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentSerializer> {
    return this.commentService.createComment(req.user.id, dto);
  }

  @Get('post/:postId')
  @ApiResponseData(CommentSerializer, true)
  async getCommentsByPost(
    @Param('postId') postId: number,
  ): Promise<CommentSerializer[]> {
    return this.commentService.getCommentsByPost(postId);
  }
}
