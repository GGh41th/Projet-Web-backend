import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SocketGateway');

  // In-memory user-socket mapping: userId -> Set of socket IDs
  private userSocketMap: Map<string, Set<string>> = new Map();

  // Socket-user mapping: socketId -> userId
  private socketUserMap: Map<string, string> = new Map();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Called after the gateway is initialized
   */
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.logger.log('JWT Authentication enabled for WebSocket connections');
  }

  /**
   * Called when a client connects to the WebSocket
   * Extracts and validates JWT token from handshake
   */
  async handleConnection(client: AuthenticatedSocket, ...args: any[]) {
    try {
      // Extract token from handshake query or auth header
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided (${client.id})`);
        client.disconnect();
        return;
      }

      // Verify and decode JWT token
      const user = await this.verifyToken(token);

      if (!user) {
        this.logger.warn(`Connection rejected: Invalid token (${client.id})`);
        client.disconnect();
        return;
      }

      // Attach user to socket
      client.user = user;

      // Store user-socket mapping
      this.addUserSocket(user.userId, client.id);

      this.logger.log(
        `Client connected: ${client.id} | User: ${user.email} (${user.userId})`,
      );
      this.logger.log(
        `Total clients connected: ${this.server.sockets.sockets.size}`,
      );
      this.logger.log(
        `User ${user.email} has ${this.getUserSockets(user.userId)?.size || 0} active connection(s)`,
      );

      // Send authentication success event to client
      client.emit('authenticated', {
        userId: user.userId,
        email: user.email,
        role: user.role,
        socketId: client.id,
      });
    } catch (error) {
      this.logger.error(
        `Connection error for client ${client.id}: ${error.message}`,
      );
      client.disconnect();
    }
  }

  /**
   * Called when a client disconnects from the WebSocket
   * Cleans up user-socket mappings
   */
  handleDisconnect(client: AuthenticatedSocket) {
    const userId = this.socketUserMap.get(client.id);

    if (userId) {
      // Remove socket from user's socket set
      this.removeUserSocket(userId, client.id);

      this.logger.log(
        `Client disconnected: ${client.id} | User: ${client.user?.email || userId}`,
      );
      this.logger.log(
        `User ${userId} has ${this.getUserSockets(userId)?.size || 0} remaining connection(s)`,
      );
    } else {
      this.logger.log(`Client disconnected: ${client.id} (unauthenticated)`);
    }

    this.logger.log(
      `Total clients connected: ${this.server.sockets.sockets.size}`,
    );
  }

  /**
   * Extract JWT token from socket handshake
   * Supports query parameter (?token=...) and authorization header
   */
  private extractTokenFromHandshake(client: Socket): string | null {
    // Try to extract from query parameters
    const tokenFromQuery = client.handshake.query?.token as string;
    if (tokenFromQuery) {
      return tokenFromQuery;
    }

    // Try to extract from authorization header
    const authHeader = client.handshake.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try to extract from auth object (some clients send it this way)
    const tokenFromAuth = client.handshake.auth?.token as string;
    if (tokenFromAuth) {
      return tokenFromAuth;
    }

    return null;
  }

  /**
   * Verify JWT token and extract user information
   */
  private async verifyToken(token: string): Promise<{
    userId: string;
    email: string;
    role: string;
  } | null> {
    try {
      const secret =
        this.configService.get<string>('JWT_SECRET') || 'jwt_secret_key';
      const payload = this.jwtService.verify<JwtPayload>(token, { secret });

      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      this.logger.error(`JWT verification failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Add socket to user's socket set
   */
  private addUserSocket(userId: string, socketId: string): void {
    // Add to userSocketMap
    if (!this.userSocketMap.has(userId)) {
      this.userSocketMap.set(userId, new Set());
    }
    this.userSocketMap.get(userId)!.add(socketId);

    // Add to socketUserMap
    this.socketUserMap.set(socketId, userId);
  }

  /**
   * Remove socket from user's socket set
   */
  private removeUserSocket(userId: string, socketId: string): void {
    // Remove from userSocketMap
    const userSockets = this.userSocketMap.get(userId);
    if (userSockets) {
      userSockets.delete(socketId);
      // If user has no more sockets, remove user entry
      if (userSockets.size === 0) {
        this.userSocketMap.delete(userId);
      }
    }

    // Remove from socketUserMap
    this.socketUserMap.delete(socketId);
  }

  /**
   * Get all socket IDs for a user
   */
  private getUserSockets(userId: string): Set<string> | undefined {
    return this.userSocketMap.get(userId);
  }

  /**
   * Get user ID for a socket
   */
  private getSocketUser(socketId: string): string | undefined {
    return this.socketUserMap.get(socketId);
  }

  /**
   * Handle incoming ping messages (for connection testing)
   */
  @SubscribeMessage('ping')
  handlePing(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): { event: string; data: any } {
    this.logger.log(
      `Received ping from client ${client.id} (User: ${client.user?.email || 'unknown'})`,
    );
    return {
      event: 'pong',
      data: {
        message: 'Pong!',
        timestamp: new Date().toISOString(),
        clientId: client.id,
        user: client.user
          ? {
              userId: client.user.userId,
              email: client.user.email,
              role: client.user.role,
            }
          : null,
      },
    };
  }

  /**
   * Broadcast a message to all connected clients
   */
  broadcastToAll(event: string, data: any) {
    this.logger.log(`Broadcasting event "${event}" to all clients`);
    this.server.emit(event, data);
  }

  /**
   * Send a message to a specific client
   */
  sendToClient(clientId: string, event: string, data: any) {
    this.logger.log(`Sending event "${event}" to client ${clientId}`);
    this.server.to(clientId).emit(event, data);
  }

  /**
   * Broadcast to all clients except one
   */
  broadcastExcept(clientId: string, event: string, data: any) {
    this.logger.log(`Broadcasting event "${event}" to all except ${clientId}`);
    this.server.except(clientId).emit(event, data);
  }

  /**
   * Send message to all sockets of a specific user
   */
  sendToUser(userId: string, event: string, data: any) {
    const userSockets = this.getUserSockets(userId);
    if (userSockets && userSockets.size > 0) {
      this.logger.log(
        `Sending event "${event}" to user ${userId} (${userSockets.size} socket(s))`,
      );
      userSockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    } else {
      this.logger.warn(`User ${userId} has no active connections`);
    }
  }

  /**
   * Check if user is online (has at least one active connection)
   */
  isUserOnline(userId: string): boolean {
    const userSockets = this.getUserSockets(userId);
    return userSockets !== undefined && userSockets.size > 0;
  }

  /**
   * Get count of online users
   */
  getOnlineUserCount(): number {
    return this.userSocketMap.size;
  }

  /**
   * Get list of all online user IDs
   */
  getOnlineUsers(): string[] {
    return Array.from(this.userSocketMap.keys());
  }
}
