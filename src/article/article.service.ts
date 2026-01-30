import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
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
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => SocketGateway))
    private socketGateway: SocketGateway,
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

    const savedArticle = await this.articleRepository.save(article);

    // Emit real-time event for article creation
    if (this.socketGateway) {
      this.socketGateway.emitArticleCreated(savedArticle);
    }

    return savedArticle;
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
      relations: ['author', 'comments', 'comments.author', 'images'],
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

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
    const updatedArticle = await this.articleRepository.save(article);

    // Emit real-time event for article update
    if (this.socketGateway) {
      this.socketGateway.emitArticleUpdated(id, updatedArticle);
    }

    return updatedArticle;
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

    // Emit real-time event for article deletion
    if (this.socketGateway) {
      this.socketGateway.emitArticleDeleted(id, userId);
    }
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

    const savedComment = await this.articleRepository.save(comment);

    // Emit real-time event for new comment
    if (this.socketGateway) {
      this.socketGateway.emitCommentCreated(parentId, savedComment);
    }

    return savedComment;
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
}
