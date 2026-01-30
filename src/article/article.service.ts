import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like } from 'typeorm';
import { Article } from '../entities/article.entity';
import { User } from '../entities/user.entity';
import {
  CreateArticleDto,
  UpdateArticleDto,
  CreateCommentDto,
  SearchArticleDto,
} from './dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userId: string, createArticleDto: CreateArticleDto): Promise<Article> {
    const { parentId, ...articleData } = createArticleDto;

    const author = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!author) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    let depth = 0;
    if (parentId) {
      const parent = await this.articleRepository.findOne({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent article with ID ${parentId} not found`);
      }
      depth = parent.depth + 1;
    }

    const article = this.articleRepository.create({
      ...articleData,
      authorId: userId,
      parentId,
      depth,
    });

    return this.articleRepository.save(article);
  }

  async findAll(): Promise<Article[]> {
    return this.articleRepository.find({
      where: { parentId: IsNull() },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.author', 'comments.upvoters', 'comments.downvoters', 'images'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    article.comments = article.comments
      .map(comment => ({
        ...comment,
        voteScore: comment.upvoters.length - comment.downvoters.length,
      }))
      .sort((a, b) => {
        if (b.voteScore !== a.voteScore) {
          return b.voteScore - a.voteScore;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    return article;
  }

  async update(id: string, userId: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { id } });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('You can only update your own articles');
    }

    Object.assign(article, updateArticleDto);
    return this.articleRepository.save(article);
  }

  async remove(id: string, userId: string): Promise<void> {
    const article = await this.articleRepository.findOne({ where: { id } });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own articles');
    }

    await this.articleRepository.remove(article);
  }

  async createComment(userId: string, createCommentDto: CreateCommentDto): Promise<Article> {
    const { parentId, ...commentData } = createCommentDto;

    const author = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!author) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const parent = await this.articleRepository.findOne({
      where: { id: parentId },
    });
    if (!parent) {
      throw new NotFoundException(`Parent article with ID ${parentId} not found`);
    }

    const comment = this.articleRepository.create({
      ...commentData,
      authorId: userId,
      parentId,
      depth: parent.depth + 1,
    });

    return this.articleRepository.save(comment);
  }

  async findComments(articleId: string): Promise<Article[]> {
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    return this.articleRepository.find({
      where: { parentId: articleId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async search(searchDto: SearchArticleDto): Promise<{ data: Article[]; total: number; page: number; limit: number }> {
    const { q, authorId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = searchDto;

    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .where('article.parentId IS NULL');

    if (q) {
      queryBuilder.andWhere(
        '(article.title ILIKE :query OR article.content ILIKE :query)',
        { query: `%${q}%` }
      );
    }

    if (authorId) {
      queryBuilder.andWhere('article.authorId = :authorId', { authorId });
    }

    queryBuilder.orderBy(`article.${sortBy}`, sortOrder);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async upvote(articleId: string, userId: string): Promise<{
    upvoted: boolean;
    upvoteCount: number;
    downvoteCount: number;
  }> {
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
      relations: ['upvoters', 'downvoters'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    const hasUpvoted = article.upvoters.some(u => u.id === userId);
    const hasDownvoted = article.downvoters.some(u => u.id === userId);

    if (hasUpvoted) {
      await this.articleRepository
        .createQueryBuilder()
        .relation(Article, 'upvoters')
        .of(articleId)
        .remove(userId);

      const updatedArticle = await this.articleRepository.findOne({
        where: { id: articleId },
        relations: ['upvoters', 'downvoters'],
      });

      return {
        upvoted: false,
        upvoteCount: updatedArticle?.upvoters.length || 0,
        downvoteCount: updatedArticle?.downvoters.length || 0,
      };
    }

    if (hasDownvoted) {
      await this.articleRepository
        .createQueryBuilder()
        .relation(Article, 'downvoters')
        .of(articleId)
        .remove(userId);
    }

    await this.articleRepository
      .createQueryBuilder()
      .relation(Article, 'upvoters')
      .of(articleId)
      .add(userId);

    const updatedArticle = await this.articleRepository.findOne({
      where: { id: articleId },
      relations: ['upvoters', 'downvoters'],
    });

    return {
      upvoted: true,
      upvoteCount: updatedArticle?.upvoters.length || 0,
      downvoteCount: updatedArticle?.downvoters.length || 0,
    };
  }

  async downvote(articleId: string, userId: string): Promise<{
    downvoted: boolean;
    upvoteCount: number;
    downvoteCount: number;
  }> {
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
      relations: ['upvoters', 'downvoters'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    const hasUpvoted = article.upvoters.some(u => u.id === userId);
    const hasDownvoted = article.downvoters.some(u => u.id === userId);

    if (hasDownvoted) {
      await this.articleRepository
        .createQueryBuilder()
        .relation(Article, 'downvoters')
        .of(articleId)
        .remove(userId);

      const updatedArticle = await this.articleRepository.findOne({
        where: { id: articleId },
        relations: ['upvoters', 'downvoters'],
      });

      return {
        downvoted: false,
        upvoteCount: updatedArticle?.upvoters.length || 0,
        downvoteCount: updatedArticle?.downvoters.length || 0,
      };
    }

    if (hasUpvoted) {
      await this.articleRepository
        .createQueryBuilder()
        .relation(Article, 'upvoters')
        .of(articleId)
        .remove(userId);
    }

    await this.articleRepository
      .createQueryBuilder()
      .relation(Article, 'downvoters')
      .of(articleId)
      .add(userId);

    const updatedArticle = await this.articleRepository.findOne({
      where: { id: articleId },
      relations: ['upvoters', 'downvoters'],
    });

    return {
      downvoted: true,
      upvoteCount: updatedArticle?.upvoters.length || 0,
      downvoteCount: updatedArticle?.downvoters.length || 0,
    };
  }

  async getVoteCounts(articleId: string): Promise<{
    upvoteCount: number;
    downvoteCount: number;
  }> {
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
      relations: ['upvoters', 'downvoters'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    return {
      upvoteCount: article.upvoters.length,
      downvoteCount: article.downvoters.length,
    };
  }

  async findOneWithNestedComments(
    id: string,
    maxDepth: number = 2,
  ): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author', 'images'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    article.comments = await this.loadCommentsRecursively(id, 0, maxDepth);

    return article;
  }

  async loadCommentReplies(
    commentId: string,
    maxDepth: number = 2,
  ): Promise<Article[]> {
    return this.loadCommentsRecursively(commentId, 0, maxDepth);
  }

  private async loadCommentsRecursively(
    parentId: string,
    currentDepth: number,
    maxDepth: number,
  ): Promise<Article[]> {
    if (currentDepth >= maxDepth) {
      return [];
    }

    const comments = await this.articleRepository.find({
      where: { parentId },
      relations: ['author', 'upvoters', 'downvoters'],
    });

    const sortedComments = comments
      .map(comment => ({
        ...comment,
        voteScore: comment.upvoters.length - comment.downvoters.length,
      }))
      .sort((a, b) => {
        if (b.voteScore !== a.voteScore) {
          return b.voteScore - a.voteScore;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    for (const comment of sortedComments) {
      comment.comments = await this.loadCommentsRecursively(
        comment.id,
        currentDepth + 1,
        maxDepth,
      );
    }

    return sortedComments;
  }
}
