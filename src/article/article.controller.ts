import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ArticleService } from './article.service';

@ApiTags('Articles')
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  // Controller endpoints will be implemented in the next commits
}
