import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import {
  CreateArticleDto,
  UpdateArticleDto,
  CreateCommentDto,
  ArticleResponseDto,
} from './dto';

@ApiTags('articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({
    status: 201,
    description: 'Article created successfully',
    type: ArticleResponseDto,
  })
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(createArticleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all top-level articles' })
  @ApiResponse({
    status: 200,
    description: 'List of articles',
    type: [ArticleResponseDto],
  })
  findAll() {
    return this.articleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID with comments' })
  @ApiResponse({
    status: 200,
    description: 'Article found',
    type: ArticleResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an article' })
  @ApiResponse({
    status: 200,
    description: 'Article updated successfully',
    type: ArticleResponseDto,
  })
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an article' })
  @ApiResponse({ status: 204, description: 'Article deleted successfully' })
  remove(@Param('id') id: string) {
    return this.articleService.remove(id);
  }

  @Post('comments')
  @ApiOperation({ summary: 'Create a comment on an article' })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: ArticleResponseDto,
  })
  createComment(@Body() createCommentDto: CreateCommentDto) {
    return this.articleService.createComment(createCommentDto);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get all comments for an article' })
  @ApiResponse({
    status: 200,
    description: 'List of comments',
    type: [ArticleResponseDto],
  })
  findComments(@Param('id') id: string) {
    return this.articleService.findComments(id);
  }
}
