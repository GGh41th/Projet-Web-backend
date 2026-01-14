import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

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

  // Self-referencing relationship for comments
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

  @Column({ type: 'int', default: 0 })
  depth: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
