import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';

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

  async findOne(id: string): Promise<Image> {
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
    await this.imageRepository.delete(id);
  }
}
