import { Controller, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponseData } from '@/common/interceptors/responseSwagger.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { CategorySerializer } from '../categories/serializers/category.serializer';
import { CategoryService } from './category.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Get("list")
  @ApiResponseData(CategorySerializer, true)
  async getAllCategories(): Promise<CategorySerializer[]> {
    return this.categoryService.getAllCategories();
  }
}
