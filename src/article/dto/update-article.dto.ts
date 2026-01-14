import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateArticleDto {
  @ApiProperty({
    description: 'Article title',
    example: 'Updated: Introduction to NestJS',
    required: false,
    minLength: 3,
  })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title?: string;

  @ApiProperty({
    description: 'Article content',
    example: 'Updated content about NestJS...',
    required: false,
    minLength: 10,
  })
  @IsString()
  @IsOptional()
  @MinLength(10, { message: 'Content must be at least 10 characters long' })
  content?: string;
}
