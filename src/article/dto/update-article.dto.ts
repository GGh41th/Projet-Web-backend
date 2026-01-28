import { PartialType } from '@nestjs/swagger';
import { CreateArticleDto } from './create-article.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateArticleDto extends PartialType(
  OmitType(CreateArticleDto, ['authorId', 'parentId'] as const),
) {}
