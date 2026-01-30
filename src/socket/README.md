# Socket Module

WebSocket module for real-time communication using Socket.IO with JWT authentication.

## Features

- ✅ WebSocket Gateway with Socket.IO
- ✅ **JWT Authentication** for secure connections
- ✅ User-socket mapping (in-memory)
- ✅ CORS configuration for WebSocket connections
- ✅ Connection/Disconnection logging with user info
- ✅ Automatic cleanup on disconnection
- ✅ Ping/Pong message handler
- ✅ Broadcast capabilities
- ✅ User-specific messaging
- ✅ Online user tracking

## Configuration

The WebSocket server is configured in `socket.gateway.ts` with:
- **CORS**: Enabled for all origins (`*` - change in production)
- **Credentials**: Enabled for cookie-based authentication
- **JWT Authentication**: Required for all connections

## Authentication

### How It Works

1. Client must provide a valid JWT token when connecting
2. Token is extracted from query parameter, auth header, or auth object
3. Token is verified using the same JWT_SECRET as the REST API
4. User information is attached to the socket
5. User-socket mapping is maintained for targeted messaging

### Token Formats Supported

```javascript
// 1. Query parameter (recommended)
const socket = io('http://localhost:3000', {
  query: { token: 'your-jwt-token' }
});

// 2. Authorization header
const socket = io('http://localhost:3000', {
  extraHeaders: {
    Authorization: 'Bearer your-jwt-token'
  }
});

// 3. Auth object
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});
```

### Connection Rejection

Connections are rejected if:
- No token is provided
- Token is invalid or expired
- Token verification fails

## API

### Gateway Methods

#### `broadcastToAll(event: string, data: any)`
Broadcast a message to all connected clients.

#### `sendToClient(clientId: string, event: string, data: any)`
Send a message to a specific client by socket ID.

#### `sendToUser(userId: string, event: string, data: any)`
Send a message to all sockets of a specific user.

#### `broadcastExcept(clientId: string, event: string, data: any)`
Broadcast to all clients except one.

#### `isUserOnline(userId: string): boolean`
Check if a user has at least one active connection.

#### `getOnlineUserCount(): number`
Get the total number of online users.

#### `getOnlineUsers(): string[]`
Get array of all online user IDs.

### Events

#### `authenticated`
Sent to client immediately after successful authentication.

**Automatic emission on connection:**
```javascript
{
  userId: 'user-uuid',
  email: 'user@example.com',
  role: 'user',
  socketId: 'socket-id'
}
```

#### `joinArticle`
Join an article room to receive real-time updates for that article.

**Request:**
```javascript
socket.emit('joinArticle', { articleId: 'article-uuid' });
```

**Response:**
```javascript
{
  event: 'joinedArticle',
  data: {
    articleId: 'article-uuid',
    message: 'Joined article article-uuid',
    subscriberCount: 5
  }
}
```

#### `leaveArticle`
Leave an article room to stop receiving updates.

**Request:**
```javascript
socket.emit('leaveArticle', { articleId: 'article-uuid' });
```

**Response:**
```javascript
{
  event: 'leftArticle',
  data: {
    articleId: 'article-uuid',
    message: 'Left article article-uuid'
  }
}
```

#### `articleCreated`
Broadcast when a new article is created (sent to all connected clients).

**Automatic emission:**
```javascript
{
  article: { /* article object with author */ },
  timestamp: '2026-01-30T10:00:00.000Z'
}
```

#### `articleUpdated`
Sent to article room when an article is updated.

**Automatic emission:**
```javascript
{
  article: { /* updated article object */ },
  timestamp: '2026-01-30T10:00:00.000Z'
}
```

#### `articleDeleted`
Broadcast when an article is deleted.

**Automatic emission:**
```javascript
{
  articleId: 'article-uuid',
  userId: 'user-uuid',
  timestamp: '2026-01-30T10:00:00.000Z'
}
```

#### `commentCreated`
Sent to article room when a new comment is added.

**Automatic emission:**
```javascript
{
  comment: { /* comment object with author */ },
  articleId: 'article-uuid',
  timestamp: '2026-01-30T10:00:00.000Z'
}
```

#### `commentUpdated`
Sent to article room when a comment is updated.

**Automatic emission:**
```javascript
{
  comment: { /* updated comment object */ },
  articleId: 'article-uuid',
  timestamp: '2026-01-30T10:00:00.000Z'
}
```

#### `commentDeleted`
Sent to article room when a comment is deleted.

**Automatic emission:**
```javascript
{
  commentId: 'comment-uuid',
  articleId: 'article-uuid',
  timestamp: '2026-01-30T10:00:00.000Z'
}
```

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
    timestamp: '2026-01-30T10:00:00.000Z',
    clientId: 'client-socket-id',
    user: {
      userId: 'user-uuid',
      email: 'user@example.com',
      role: 'user'
    }
  }
}
```

## Client Usage

### JavaScript/TypeScript with Authentication

```javascript
import { io } from 'socket.io-client';

// Get JWT token from your auth system
const token = localStorage.getItem('accessToken');

// Connect to WebSocket server with authentication
const socket = io('http://localhost:3000', {
  query: { token }, // Pass token in query
  transports: ['websocket'],
  withCredentials: true,
});

// Authentication success
socket.on('authenticated', (data) => {
  console.log('Authenticated as:', data.email);
  console.log('User ID:', data.userId);
  console.log('Socket ID:', data.socketId);
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  if (reason === 'io server disconnect') {
    // Server disconnected (probably auth failure)
    console.log('Authentication failed or token expired');
  }
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

// Test connection with ping
socket.emit('ping', {});

socket.on('pong', (data) => {
  console.log('Received pong:', data);
  console.log('Authenticated user:', data.user);
});

// Listen for custom events
socket.on('customEvent', (data) => {
  console.log('Received custom event:', data);
});

// Join article room to receive updates
socket.emit('joinArticle', { articleId: 'article-123' });

socket.on('joinedArticle', (data) => {
  console.log('Joined article room:', data);
});

// Listen for article updates
socket.on('articleUpdated', (data) => {
  console.log('Article updated:', data.article);
});

// Listen for new comments
socket.on('commentCreated', (data) => {
  console.log('New comment on article:', data.comment);
});

// Leave article room when done
socket.on('beforeunload', () => {
  socket.emit('leaveArticle', { articleId: 'article-123' });
});
```

### Real-time Article Updates Example

```javascript
import { io } from 'socket.io-client';

const token = localStorage.getItem('accessToken');
const socket = io('http://localhost:3000', {
  query: { token }
});

// Monitor a specific article
function watchArticle(articleId) {
  // Join article room
  socket.emit('joinArticle', { articleId });
  
  // Handle join confirmation
  socket.on('joinedArticle', (data) => {
    console.log(`Watching article ${articleId}`);
    console.log(`${data.subscriberCount} users watching this article`);
  });
  
  // Listen for article updates
  socket.on('articleUpdated', ({ article, timestamp }) => {
    console.log('Article updated:', article);
    updateArticleUI(article);
  });
  
  // Listen for new comments
  socket.on('commentCreated', ({ comment, articleId: updatedArticleId }) => {
    if (updatedArticleId === articleId) {
      console.log('New comment:', comment);
      addCommentToUI(comment);
    }
  });
  
  // Listen for deleted comments
  socket.on('commentDeleted', ({ commentId, articleId: updatedArticleId }) => {
    if (updatedArticleId === articleId) {
      console.log('Comment deleted:', commentId);
      removeCommentFromUI(commentId);
    }
  });
}

// Stop watching when leaving page
function unwatchArticle(articleId) {
  socket.emit('leaveArticle', { articleId });
}

// Listen for globally broadcast events
socket.on('articleCreated', ({ article }) => {
  console.log('New article published:', article);
  addArticleToFeed(article);
});

socket.on('articleDeleted', ({ articleId }) => {
  console.log('Article deleted:', articleId);
  removeArticleFromUI(articleId);
});
```

### HTML Test Page with Authentication

```html
<!DOCTYPE html>
<html>
<head>
  <title>WebSocket Test (JWT Auth)</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <h1>WebSocket Connection Test (JWT Authentication)</h1>
  
  <div>
    <label>JWT Token:</label>
    <input type="text" id="token" placeholder="Paste your JWT token here" style="width: 400px;">
    <button onclick="connect()">Connect</button>
    <button onclick="disconnect()">Disconnect</button>
  </div>
  
  <div id="status">Not connected</div>
  <div id="userInfo"></div>
  <button onclick="testPing()" disabled id="pingBtn">Test Ping</button>
  <div id="messages"></div>

  <script>
    let socket = null;
    
    function connect() {
      const token = document.getElementById('token').value;
      
      if (!token) {
        alert('Please enter a JWT token');
        return;
      }
      
      // Connect with token in query parameter
      socket = io('http://localhost:3000', {
        query: { token },
        transports: ['websocket']
      });
      
      socket.on('connect', () => {
        document.getElementById('status').textContent = 'Connected! Socket ID: ' + socket.id;
        document.getElementById('pingBtn').disabled = false;
      });
      
      socket.on('authenticated', (data) => {
        document.getElementById('userInfo').innerHTML = `
          <strong>Authenticated as:</strong><br>
          Email: ${data.email}<br>
          User ID: ${data.userId}<br>
          Role: ${data.role}
        `;
      });
      
      socket.on('disconnect', (reason) => {
        document.getElementById('status').textContent = 'Disconnected: ' + reason;
        document.getElementById('pingBtn').disabled = true;
        if (reason === 'io server disconnect') {
          alert('Authentication failed! Check your token.');
        }
      });
      
      socket.on('connect_error', (error) => {
        document.getElementById('status').textContent = 'Connection error: ' + error.message;
      });
      
      socket.on('pong', (data) => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>PONG:</strong> ${JSON.stringify(data, null, 2)}`;
        document.getElementById('messages').appendChild(div);
      });
    }
    
    function disconnect() {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    }
    
    function testPing() {
      if (socket && socket.connected) {
        socket.emit('ping', {});
      }
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
export class NotificationService {
  constructor(private socketGateway: SocketGateway) {}

  // Send to all users
  notifyAll(data: any) {
    this.socketGateway.broadcastToAll('notification', data);
  }

  // Send to specific user (all their connections)
  notifyUser(userId: string, data: any) {
    this.socketGateway.sendToUser(userId, 'notification', data);
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.socketGateway.isUserOnline(userId);
  }

  // Get online users
  getOnlineUsers(): string[] {
    return this.socketGateway.getOnlineUsers();
  }
}
```

## User-Socket Mapping

The gateway maintains two in-memory maps:

1. **userSocketMap**: `Map<userId, Set<socketId>>`
   - Maps user IDs to their socket IDs
   - One user can have multiple connections (multiple tabs/devices)

2. **socketUserMap**: `Map<socketId, userId>`
   - Reverse mapping for quick lookups
   - Enables efficient cleanup on disconnection

### Multi-Device Support

Users can connect from multiple devices/tabs:
- Each connection gets a unique socket ID
- All sockets are associated with the user ID
- `sendToUser()` sends to all user's connections
- Cleanup happens automatically when each socket disconnects

## Security Considerations

1. **JWT Validation**: Every connection must provide a valid JWT token
2. **Token Expiration**: Expired tokens are rejected
3. **Connection Rejection**: Invalid connections are immediately disconnected
4. **User Isolation**: Each user can only receive messages sent to their userId

## Environment Variables

```env
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=1d
```

## Connection URL

- **Development**: `http://localhost:3000`
- **Production**: Update CORS origin in `socket.gateway.ts`

## Logging

All connection events and messages are logged with the `SocketGateway` logger prefix, including:
- Connection attempts with user information
- Authentication success/failure
- Disconnections with cleanup details
- Message routing
- Online user statistics
