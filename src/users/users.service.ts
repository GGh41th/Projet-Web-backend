import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

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
  async findAll(transform?: boolean): Promise<User[]> {
    const users = await this.userRepository.find({
      select: transform
        ? ['id', 'email', 'username', 'name', 'lastName', 'bio', 'role', 'createdAt', 'updatedAt']
        : undefined,
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
   * Find a user by email address
   */
  async findByEmail(email: string): Promise<User | null> {
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
  async findByUsername(username: string): Promise<User | null> {
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
   * Check if email or username is already taken
   * @param identifier - Email or username to check
   * @returns Object with isTaken boolean
   */
  async isValid(identifier: string): Promise<{ isTaken: boolean }> {
    // Check if it's an email format
    const isEmail = identifier.includes('@');

    let user;
    if (isEmail) {
      user = await this.userRepository.findOne({
        where: { email: identifier },
        select: ['id'],
      });
    } else {
      user = await this.userRepository.findOne({
        where: { username: identifier },
        select: ['id'],
      });
    }

    return { isTaken: !!user };
  }
}

