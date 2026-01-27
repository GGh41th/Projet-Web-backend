import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Create new user (password will be hashed by entity hook)
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  /**
   * Find all users with optional transformation
   */
  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'username', 'name', 'lastName', 'bio', 'role', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
    });
    return users;
  }

  /**
   * Find a user by ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'username', 'name', 'lastName', 'bio', 'role', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'username', 'name', 'lastName', 'bio', 'role', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  /**
   * Find a user by username
   */
  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      select: ['id', 'email', 'username', 'name', 'lastName', 'bio', 'role', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return user;
  }

  /**
   * Check if an identifier (email or username) is available
   * Returns { isTaken: boolean }
   */
  async isValid(identifier: string): Promise<{ isTaken: boolean }> {
    // Try to find by email first
    const userByEmail = await this.userRepository.findOne({
      where: { email: identifier },
    });

    if (userByEmail) {
      return { isTaken: true };
    }

    // Then try to find by username
    const userByUsername = await this.userRepository.findOne({
      where: { username: identifier },
    });

    if (userByUsername) {
      return { isTaken: true };
    }

    // If neither found, it's available
    return { isTaken: false };
  }

  /**
   * Update a user by ID
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if username is being changed and if it's already taken
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    // Update user fields
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  /**
   * Remove a user by ID
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  /**
   * Get current authenticated user's profile
   * Returns user without password
   */
  async getCurrentUser(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.findOne(userId);
    const { password, ...result } = user;
    return result as Omit<User, 'password'>;
  }

  /**
   * Change password for authenticated user
   * Requires verification of old password
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verify old password
    const isPasswordValid = await user.validatePassword(oldPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password (will be hashed by @BeforeUpdate hook)
    user.password = newPassword;
    await this.userRepository.save(user);
  }
}

