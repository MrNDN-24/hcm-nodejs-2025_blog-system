import { Controller, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponseData } from '@/common/interceptors/responseSwagger.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { TagSerializer } from '../tags/serializers/tag.serializer';
import { TagService } from './tag.service';

@ApiTags('Tags')
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}
  @Get('list')
  @ApiResponseData(TagSerializer, true)
  async getAllTags(): Promise<TagSerializer[]> {
    return this.tagService.getAllTags();
  }
}
