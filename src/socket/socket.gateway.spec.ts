import { Test, TestingModule } from '@nestjs/testing';
import { SocketGateway } from './socket.gateway';

describe('SocketGateway', () => {
  let gateway: SocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketGateway],
    }).compile();

    gateway = module.get<SocketGateway>(SocketGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle ping message', () => {
    const mockClient = {
      id: 'test-client-123',
    } as any;

    const result = gateway.handlePing({}, mockClient);

    expect(result).toHaveProperty('event', 'pong');
    expect(result.data).toHaveProperty('message', 'Pong!');
    expect(result.data).toHaveProperty('clientId', 'test-client-123');
    expect(result.data).toHaveProperty('timestamp');
  });
});
