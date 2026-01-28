import { ApiProperty } from '@nestjs/swagger';

export class ArticleAuthorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;
}

export class ArticleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: ArticleAuthorDto })
  author: ArticleAuthorDto;

  @ApiProperty()
  authorId: string;

  @ApiProperty({ nullable: true })
  parentId: string | null;

  @ApiProperty()
  depth: number;

  @ApiProperty({ type: [ArticleResponseDto] })
  comments: ArticleResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
