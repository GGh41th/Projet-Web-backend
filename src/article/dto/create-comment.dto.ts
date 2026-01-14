import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example: 'Great article! Very informative.',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  @MinLength(1, { message: 'Content cannot be empty' })
  content: string;

  @ApiProperty({
    description: 'Author user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Author ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Author ID is required' })
  authorId: string;

  @ApiProperty({
    description: 'Parent article/comment ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID('4', { message: 'Parent ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Parent ID is required' })
  parentId: string;

  @ApiProperty({
    description: 'Comment title (optional, defaults to "Re: [parent title]")',
    example: 'Re: Introduction to NestJS',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;
}
