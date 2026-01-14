import { ApiProperty } from '@nestjs/swagger';

export class AvailabilityResponseDto {
  @ApiProperty({
    description: 'Indicates whether the email or username is already taken',
    example: false,
    type: Boolean,
  })
  isTaken: boolean;
}
