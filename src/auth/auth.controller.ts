import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiBody({ type: LoginDto })
  login(@Body() input: LoginDto) {
    return this.authService.authenticate(input);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getUserInfo(@Request() req) {
    return req.user;
  }
}