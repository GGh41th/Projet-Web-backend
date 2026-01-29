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
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

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

  /**
   * Called after the gateway is initialized
   */
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  /**
   * Called when a client connects to the WebSocket
   */
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    this.logger.log(`Total clients connected: ${this.server.sockets.sockets.size}`);
  }

  /**
   * Called when a client disconnects from the WebSocket
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.logger.log(`Total clients connected: ${this.server.sockets.sockets.size}`);
  }

  /**
   * Handle incoming ping messages (for connection testing)
   */
  @SubscribeMessage('ping')
  handlePing(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): { event: string; data: any } {
    this.logger.log(`Received ping from client ${client.id}`);
    return {
      event: 'pong',
      data: {
        message: 'Pong!',
        timestamp: new Date().toISOString(),
        clientId: client.id,
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
}
