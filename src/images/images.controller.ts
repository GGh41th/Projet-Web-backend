import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { Image } from '../entities/image.entity';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a single image' })
  @ApiBody({
    description: 'Image file and article ID',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, GIF, WebP, max 5MB)',
        },
        articleId: {
          type: 'string',
          description: 'Article ID to associate with the image',
        },
      },
      required: ['file', 'articleId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: Image,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or missing articleId',
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('articleId') articleId: string,
  ): Promise<Image> {
    if (!articleId) {
      throw new BadRequestException('articleId is required');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file
    this.imagesService.validateFile(file);

    // Save metadata to database
    return await this.imagesService.saveImageMetadata(file, articleId);
  }

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
