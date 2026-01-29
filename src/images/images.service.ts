import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async create(imageData: Partial<Image>): Promise<Image> {
    const image = this.imageRepository.create(imageData);
    return await this.imageRepository.save(image);
  }

  async findAll(): Promise<Image[]> {
    return await this.imageRepository.find({
      relations: ['article'],
    });
  }

  async findOne(id: string): Promise<Image | null> {
    return await this.imageRepository.findOne({
      where: { id },
      relations: ['article'],
    });
  }

  async findByArticleId(articleId: string): Promise<Image[]> {
    return await this.imageRepository.find({
      where: { articleId },
    });
  }

  async remove(id: string): Promise<void> {
    const image = await this.findOne(id);
    if (image) {
      await this.deletePhysicalFile(image.path);
      await this.imageRepository.delete(id);
    }
  }

  /**
   * Save file metadata to database
   * @param file Multer file object
   * @param articleId Article ID to associate with image
   */
  async saveImageMetadata(
    file: Express.Multer.File,
    articleId: string,
  ): Promise<Image> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const imagePath = path.join('uploads/images', file.filename).replace(/\\/g, '/');

    return await this.create({
      filename: file.filename,
      path: imagePath,
      mimetype: file.mimetype,
      size: file.size,
      articleId,
    } as Partial<Image>);
  }

  /**
   * Save multiple files metadata to database
   * @param files Array of Multer file objects
   * @param articleId Article ID to associate with images
   */
  async saveMultipleImages(
    files: Express.Multer.File[],
    articleId: string,
  ): Promise<Image[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Process all files in parallel for better performance
    const imagePromises = files.map((file) => {
      const imagePath = path.join('uploads/images', file.filename).replace(/\\/g, '/');
      
      return this.create({
        filename: file.filename,
        path: imagePath,
        mimetype: file.mimetype,
        size: file.size,
        articleId,
      } as Partial<Image>);
    });

    return await Promise.all(imagePromises);
  }

  /**
   * Delete physical file from disk
   * @param filePath Path to the file
   */
  async deletePhysicalFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error(`Failed to delete file at ${filePath}:`, error);
      // Don't throw - file might already be deleted or path might be invalid
    }
  }

  /**
   * Validate file before processing
   * @param file File to validate
   */
  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxFileSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed',
      );
    }
  }
}
