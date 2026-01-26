import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';


@Module({
  imports: [UsersModule, JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get('JWT_EXPIRATION') || '24h',
        } as const,
      }),
      inject: [ConfigService],
    }),],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], 
})
export class AuthModule {}