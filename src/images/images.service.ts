import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Image } from '../entities/image.entity';
import { Article } from '../entities/article.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly dataSource: DataSource,
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
   * Add new image to existing article
   * Uses transaction to ensure atomicity
   * @param file Multer file object
   * @param articleId Article ID to associate with image
   */
  async addImage(
    file: Express.Multer.File,
    articleId: string,
  ): Promise<Image> {
    // Validate file
    this.validateFile(file);

    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify article exists
      const article = await queryRunner.manager.findOne(Article, {
        where: { id: articleId },
      });

      if (!article) {
        throw new NotFoundException(`Article with ID ${articleId} not found`);
      }

      // Create image metadata
      const imagePath = path.join('uploads/images', file.filename).replace(/\\/g, '/');
      const image = queryRunner.manager.create(Image, {
        filename: file.filename,
        path: imagePath,
        mimetype: file.mimetype,
        size: file.size,
        articleId,
      });

      // Save to database
      const savedImage = await queryRunner.manager.save(image);

      // Commit transaction
      await queryRunner.commitTransaction();

      return savedImage;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      
      // Delete uploaded file if transaction failed
      await this.deletePhysicalFile(
        path.join('uploads/images', file.filename).replace(/\\/g, '/'),
      );

      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Update/replace existing image
   * Deletes old file and uploads new one with transaction
   * @param imageId Image ID to update
   * @param file New image file
   */
  async updateImage(
    imageId: string,
    file: Express.Multer.File,
  ): Promise<Image> {
    // Validate file
    this.validateFile(file);

    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find existing image
      const existingImage = await queryRunner.manager.findOne(Image, {
        where: { id: imageId },
      });

      if (!existingImage) {
        throw new NotFoundException(`Image with ID ${imageId} not found`);
      }

      // Store old path for deletion
      const oldPath = existingImage.path;

      // Update image metadata
      const newPath = path.join('uploads/images', file.filename).replace(/\\/g, '/');
      existingImage.filename = file.filename;
      existingImage.path = newPath;
      existingImage.mimetype = file.mimetype;
      existingImage.size = file.size;

      // Save updated image to database
      const updatedImage = await queryRunner.manager.save(existingImage);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Delete old physical file (after successful transaction)
      await this.deletePhysicalFile(oldPath);

      return updatedImage;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();

      // Delete new uploaded file if transaction failed
      await this.deletePhysicalFile(
        path.join('uploads/images', file.filename).replace(/\\/g, '/'),
      );

      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Delete image with cascade (removes from DB and disk)
   * Uses transaction to ensure atomicity
   * @param imageId Image ID to delete
   */
  async deleteImage(imageId: string): Promise<void> {
    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find image
      const image = await queryRunner.manager.findOne(Image, {
        where: { id: imageId },
      });

      if (!image) {
        throw new NotFoundException(`Image with ID ${imageId} not found`);
      }

      // Store path for deletion
      const imagePath = image.path;

      // Delete from database (cascade will handle relations)
      await queryRunner.manager.delete(Image, { id: imageId });

      // Commit transaction
      await queryRunner.commitTransaction();

      // Delete physical file (after successful transaction)
      await this.deletePhysicalFile(imagePath);
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
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
