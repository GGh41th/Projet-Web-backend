import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Image } from './image.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => Article, (article) => article.comments, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Article;

  @Column({ nullable: true })
  parentId: string | null;

  @OneToMany(() => Article, (article) => article.parent)
  comments: Article[];

  @OneToMany(() => Image, (image) => image.article, { eager: true })
  images: Image[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'article_upvoters_user',
    joinColumn: { name: 'articleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  upvoters: User[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'article_downvoters_user',
    joinColumn: { name: 'articleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  downvoters: User[];

  @Column({ type: 'int', default: 0 })
  depth: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
