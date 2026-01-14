# User Search & Validation (Commit 13)

## New Endpoints

### 1. Find User by Email
**GET** `/users/email/:email`

**Description**: Search for a user by their email address

**URL Parameters**:
- `email` (required): User's email address

**Example Request**:
```
GET /users/email/john.doe@example.com
```

**Success Response** (200):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "name": "John",
  "lastName": "Doe",
  "bio": "Developer",
  "role": "user",
  "createdAt": "2024-01-14T10:30:00Z",
  "updatedAt": "2024-01-14T10:30:00Z"
}
```

**Error Responses**:
- `404 Not Found`: User with specified email doesn't exist

**Use Cases**:
- User lookup during login
- Email verification
- Duplicate email check
- User profile search

---

### 2. Find User by Username
**GET** `/users/username/:username`

**Description**: Search for a user by their username

**URL Parameters**:
- `username` (required): User's username

**Example Request**:
```
GET /users/username/johndoe
```

**Success Response** (200):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "name": "John",
  "lastName": "Doe",
  "bio": "Developer",
  "role": "user",
  "createdAt": "2024-01-14T10:30:00Z",
  "updatedAt": "2024-01-14T10:30:00Z"
}
```

**Error Responses**:
- `404 Not Found`: User with specified username doesn't exist

**Use Cases**:
- User profile lookup
- @ mention functionality
- Username search
- Author information display

---

## Service Methods

### `findByEmail(email: string): Promise<User | null>`

**Purpose**: Find a user by their email address

**Implementation**:
```typescript
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
```

**Features**:
- Case-sensitive email search
- Password excluded from selection
- Throws NotFoundException if not found
- Returns full user profile (except password)

---

### `findByUsername(username: string): Promise<User | null>`

**Purpose**: Find a user by their username

**Implementation**:
```typescript
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
```

**Features**:
- Case-sensitive username search
- Password excluded from selection
- Throws NotFoundException if not found
- Returns full user profile (except password)

---

## Route Ordering

**Important**: The search routes MUST be defined before the `:id` route to avoid conflicts.

**Correct Order**:
1. `GET /users` - List all users
2. `GET /users/email/:email` - Search by email
3. `GET /users/username/:username` - Search by username
4. `GET /users/:id` - Get by ID

**Why?** If `:id` comes first, requests to `/users/email/test@test.com` would match `:id` route with `id="email"`.

---

## Security Considerations

1. **Password Protection**: Passwords are NEVER returned, even in search results
2. **Selection Control**: Explicitly select only safe fields to return
3. **Error Messages**: Clear error messages when user not found
4. **No Partial Matches**: Only exact matches are returned (no LIKE queries)

---

## Database Performance

- **Indexed Fields**: Both `email` and `username` have database indexes
- **Fast Lookups**: O(log n) time complexity due to B-tree indexes
- **Single Query**: Each method performs only one database query
- **Selective Loading**: Only necessary fields loaded from database

---

## Integration Points

These methods will be used by:
- **Authentication Module**: Login by email
- **Article Module**: Author information display
- **Comment Module**: User mentions
- **Notification Module**: Recipient lookup

---

## Testing

### Test Cases:
1. ✅ Find existing user by valid email
2. ✅ Find existing user by valid username
3. ✅ Handle 404 for non-existent email
4. ✅ Handle 404 for non-existent username
5. ✅ Verify password is excluded from response
6. ✅ Verify case sensitivity

### Example Test:
```typescript
describe('User Search', () => {
  it('should find user by email', async () => {
    const user = await usersService.findByEmail('test@example.com');
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBeUndefined();
  });
});
```

---

## Next Commit (14)
- Username/Email availability check endpoint
- Returns `{ isTaken: boolean }`
- Used for real-time validation during registration
