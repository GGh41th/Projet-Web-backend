import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great article!' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'I really enjoyed reading this post...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Parent article or comment ID',
  })
  @IsUUID()
  @IsNotEmpty()
  parentId: string;
}
