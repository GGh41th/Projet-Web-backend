import { ApiProperty } from '@nestjs/swagger';

export class ArticleResponseDto {
  @ApiProperty({
    description: 'Article unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Article title',
    example: 'Introduction to NestJS',
  })
  title: string;

  @ApiProperty({
    description: 'Article content',
    example: 'NestJS is a progressive Node.js framework...',
  })
  content: string;

  @ApiProperty({
    description: 'Author user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  authorId: string;

  @ApiProperty({
    description: 'Author information',
  })
  author?: {
    id: string;
    username: string;
    name?: string;
    lastName?: string;
  };

  @ApiProperty({
    description: 'Parent article ID (null for standalone articles)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    nullable: true,
  })
  parentId: string | null;

  @ApiProperty({
    description: 'Nesting depth (0 for articles, 1+ for comments)',
    example: 0,
  })
  depth: number;

  @ApiProperty({
    description: 'Nested comments',
    isArray: true,
  })
  comments?: ArticleResponseDto[];

  @ApiProperty({
    description: 'Article creation timestamp',
    example: '2024-01-14T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-14T10:30:00Z',
  })
  updatedAt: Date;
}
