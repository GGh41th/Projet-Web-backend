import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { Article } from '../entities/article.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Article, User])],
  providers: [ArticleService],
  controllers: [ArticleController],
  exports: [ArticleService, TypeOrmModule],
})
export class ArticleModule {}
