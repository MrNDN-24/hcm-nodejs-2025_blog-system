import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostSerializer } from './serializers/post.serializer';
import { ApiResponseData } from '@/common/interceptors/responseSwagger.interceptor';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessageResponseDto } from '@/common/response/response_message';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiBody({ type: CreatePostDto })
  @ApiResponseData(PostSerializer)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Req() req,
    @Body() dto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<PostSerializer> {
    return this.postService.create(req.user.id, dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('authorPost')
  @ApiResponseData(PostSerializer, true)
  async getPostsByAuthor(@Req() req): Promise<PostSerializer[]> {
    return this.postService.getMyPosts(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('softDelete/:id')
  @ApiResponseData(MessageResponseDto)
  async softDelete(@Param('id') id: number) {
    return this.postService.softDeletePost(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  @ApiBody({ type: UpdatePostDto })
  @ApiResponseData(PostSerializer)
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: number,
    @Body() dto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<PostSerializer> {
    return this.postService.updatePost(id, dto, file);
  }

  @Get("postUser")
  @ApiResponseData(PostSerializer, true)
  async getAllPosts(@Query() filter: FilterPostDto): Promise<PostSerializer[]> {
    return this.postService.getAllPosts(filter);
  }
}
