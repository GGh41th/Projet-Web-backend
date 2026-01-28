import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Article } from '../entities/article.entity';
import { User } from '../entities/user.entity';
import {
  CreateArticleDto,
  UpdateArticleDto,
  CreateCommentDto,
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
      relations: ['author', 'comments', 'comments.author'],
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
}
