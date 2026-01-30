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
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateArticleDto,
  UpdateArticleDto,
  CreateCommentDto,
  ArticleResponseDto,
  SearchArticleDto,
} from './dto';

@ApiTags('articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({
    status: 201,
    description: 'Article created successfully',
    type: ArticleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @CurrentUser() user: { userId: string; email: string },
    @Body() createArticleDto: CreateArticleDto,
  ) {
    return this.articleService.create(user.userId, createArticleDto);
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

  @Get('search')
  @ApiOperation({ summary: 'Search and filter articles with pagination' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query for title and content' })
  @ApiQuery({ name: 'authorId', required: false, description: 'Filter by author UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts at 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'updatedAt', 'title'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: 200,
    description: 'Paginated search results',
    schema: {
      example: {
        data: [],
        total: 100,
        page: 1,
        limit: 10,
      },
    },
  })
  search(@Query() searchDto: SearchArticleDto) {
    return this.articleService.search(searchDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an article' })
  @ApiResponse({
    status: 200,
    description: 'Article updated successfully',
    type: ArticleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not article owner' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; email: string },
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articleService.update(id, user.userId, updateArticleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an article' })
  @ApiResponse({ status: 204, description: 'Article deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not article owner' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; email: string },
  ) {
    return this.articleService.remove(id, user.userId);
  }

  @Post('comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a comment on an article' })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: ArticleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createComment(
    @CurrentUser() user: { userId: string; email: string },
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.articleService.createComment(user.userId, createCommentDto);
  }

  @Post(':id/upvote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Upvote an article',
    description: 'Toggle upvote (if already upvoted, removes it). If downvoted, switches to upvote.'
  })
  @ApiResponse({
    status: 200,
    description: 'Vote registered successfully',
    schema: {
      example: {
        upvoted: true,
        upvoteCount: 5,
        downvoteCount: 2,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  upvote(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; email: string },
  ) {
    return this.articleService.upvote(id, user.userId);
  }

  @Post(':id/downvote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Downvote an article',
    description: 'Toggle downvote (if already downvoted, removes it). If upvoted, switches to downvote.'
  })
  @ApiResponse({
    status: 200,
    description: 'Vote registered successfully',
    schema: {
      example: {
        downvoted: true,
        upvoteCount: 4,
        downvoteCount: 3,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  downvote(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; email: string },
  ) {
    return this.articleService.downvote(id, user.userId);
  }

  @Get(':id/votes')
  @ApiOperation({ summary: 'Get vote counts for an article' })
  @ApiResponse({
    status: 200,
    description: 'Vote counts retrieved successfully',
    schema: {
      example: {
        upvoteCount: 10,
        downvoteCount: 3,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  getVotes(@Param('id') id: string) {
    return this.articleService.getVoteCounts(id);
  }

  @Get('full/:id')
  @ApiOperation({ 
    summary: 'Get article with nested comments sorted by votes',
    description: 'Load article with recursively nested comments up to specified depth, sorted by vote score'
  })
  @ApiQuery({ 
    name: 'depth', 
    required: false, 
    type: Number, 
    description: 'Comment nesting depth (default: 2, max recommended: 5)' 
  })
  @ApiResponse({
    status: 200,
    description: 'Article with nested comments',
    type: ArticleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  findOneWithNestedComments(
    @Param('id') id: string,
    @Query('depth') depth?: string,
  ) {
    const maxDepth = depth ? parseInt(depth, 10) : 2;
    return this.articleService.findOneWithNestedComments(id, maxDepth);
  }

  @Get('comments/:commentId/replies')
  @ApiOperation({ 
    summary: 'Load nested replies for a specific comment',
    description: 'On-demand loading of replies to show deeper conversation threads'
  })
  @ApiQuery({ 
    name: 'depth', 
    required: false, 
    type: Number, 
    description: 'Max depth to load (default: 2)' 
  })
  @ApiResponse({
    status: 200,
    description: 'Nested replies',
    type: [ArticleResponseDto],
  })
  loadCommentReplies(
    @Param('commentId') commentId: string,
    @Query('depth') depth?: string,
  ) {
    const maxDepth = depth ? parseInt(depth, 10) : 2;
    return this.articleService.loadCommentReplies(commentId, maxDepth);
  }
}
