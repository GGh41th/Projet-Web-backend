import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SocketGateway } from './socket.gateway';

describe('SocketGateway', () => {
  let gateway: SocketGateway;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocketGateway,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test_secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    gateway = module.get<SocketGateway>(SocketGateway);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle ping message with authenticated user', () => {
    const mockClient = {
      id: 'test-client-123',
      user: {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
      },
    } as any;

    const result = gateway.handlePing({}, mockClient);

    expect(result).toHaveProperty('event', 'pong');
    expect(result.data).toHaveProperty('message', 'Pong!');
    expect(result.data).toHaveProperty('clientId', 'test-client-123');
    expect(result.data).toHaveProperty('user');
    expect(result.data.user).toEqual({
      userId: 'user-123',
      email: 'test@example.com',
      role: 'user',
    });
  });

  it('should return null user in ping response for unauthenticated client', () => {
    const mockClient = {
      id: 'test-client-456',
    } as any;

    const result = gateway.handlePing({}, mockClient);

    expect(result.data.user).toBeNull();
  });
});
