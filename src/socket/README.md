# Socket Module

WebSocket module for real-time communication using Socket.IO.

## Features

- ✅ WebSocket Gateway with Socket.IO
- ✅ CORS configuration for WebSocket connections
- ✅ Connection/Disconnection logging
- ✅ Ping/Pong message handler
- ✅ Broadcast capabilities
- ✅ Client-specific messaging

## Configuration

The WebSocket server is configured in `socket.gateway.ts` with:
- **CORS**: Enabled for all origins (`*` - change in production)
- **Credentials**: Enabled for cookie-based authentication

## API

### Gateway Methods

#### `broadcastToAll(event: string, data: any)`
Broadcast a message to all connected clients.

#### `sendToClient(clientId: string, event: string, data: any)`
Send a message to a specific client.

#### `broadcastExcept(clientId: string, event: string, data: any)`
Broadcast to all clients except one.

### Events

#### `ping`
Test event to verify WebSocket connection.

**Request:**
```javascript
socket.emit('ping', {});
```

**Response:**
```javascript
{
  event: 'pong',
  data: {
    message: 'Pong!',
    timestamp: '2026-01-29T10:00:00.000Z',
    clientId: 'client-socket-id'
  }
}
```

## Client Usage

### JavaScript/TypeScript

```javascript
import { io } from 'socket.io-client';

// Connect to WebSocket server
const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  withCredentials: true,
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
  console.log('Client ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

// Test connection with ping
socket.emit('ping', {});

socket.on('pong', (data) => {
  console.log('Received pong:', data);
});

// Listen for custom events
socket.on('customEvent', (data) => {
  console.log('Received custom event:', data);
});
```

### HTML Test Page

```html
<!DOCTYPE html>
<html>
<head>
  <title>WebSocket Test</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <h1>WebSocket Connection Test</h1>
  <div id="status">Connecting...</div>
  <button onclick="testPing()">Test Ping</button>
  <div id="messages"></div>

  <script>
    const socket = io('http://localhost:3000');
    
    socket.on('connect', () => {
      document.getElementById('status').textContent = 'Connected! Client ID: ' + socket.id;
    });
    
    socket.on('disconnect', () => {
      document.getElementById('status').textContent = 'Disconnected';
    });
    
    socket.on('pong', (data) => {
      const div = document.createElement('div');
      div.textContent = 'PONG: ' + JSON.stringify(data);
      document.getElementById('messages').appendChild(div);
    });
    
    function testPing() {
      socket.emit('ping', {});
    }
  </script>
</body>
</html>
```

## Testing

Run the test suite:
```bash
npm test socket.gateway.spec.ts
```

## Integration

To use the Socket Gateway in other modules:

```typescript
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class YourService {
  constructor(private socketGateway: SocketGateway) {}

  notifyUsers(data: any) {
    this.socketGateway.broadcastToAll('notification', data);
  }
}
```

## Connection URL

- **Development**: `http://localhost:3000`
- **Production**: Update CORS origin in `socket.gateway.ts`

## Logging

All connection events and messages are logged with the `SocketGateway` logger prefix.
