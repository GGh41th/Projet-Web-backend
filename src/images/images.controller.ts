import { Controller, Get, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { Image } from '../entities/image.entity';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all images' })
  @ApiResponse({
    status: 200,
    description: 'List of all images',
    type: [Image],
  })
  async findAll(): Promise<Image[]> {
    return this.imagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get image by ID' })
  @ApiParam({ name: 'id', description: 'Image ID' })
  @ApiResponse({
    status: 200,
    description: 'Image details',
    type: Image,
  })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async findOne(@Param('id') id: string): Promise<Image> {
    return this.imagesService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete image' })
  @ApiParam({ name: 'id', description: 'Image ID' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.imagesService.remove(id);
    return { message: 'Image deleted successfully' };
  }
}
