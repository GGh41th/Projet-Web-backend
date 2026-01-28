import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from 'src/users/dto';
import { Role } from './enums/role.enum';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)  
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

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User registered and logged in successfully' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin-test')
  @ApiOperation({ summary: 'Admin only test endpoint' })
  @ApiResponse({ status: 200, description: 'You are admin!' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  adminOnly() {
    return { message: 'You are admin!' };
  }

}