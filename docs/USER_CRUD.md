# User CRUD Operations

## Implemented Endpoints

### 1. Create User
**POST** `/users`

**Description**: Register a new user in the system

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "secure123",
  "username": "johndoe",
  "name": "John",
  "lastName": "Doe",
  "bio": "Developer"
}
```

**Success Response** (201):
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
- `409 Conflict`: Email or username already exists
- `400 Bad Request`: Invalid input data

**Security**: Password is automatically hashed and never returned in response

---

### 2. Get All Users
**GET** `/users?transform=true`

**Description**: Retrieve a list of all users

**Query Parameters**:
- `transform` (optional, boolean): If true, excludes sensitive data

**Success Response** (200):
```json
[
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
]
```

**Features**:
- Users ordered by creation date (newest first)
- Password always excluded from response
- Optional transformation for additional filtering

---

### 3. Get User by ID
**GET** `/users/:id`

**Description**: Retrieve a specific user by their UUID

**URL Parameters**:
- `id` (required): User UUID

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
- `404 Not Found`: User with specified ID doesn't exist

---

### 4. Update User
**PATCH** `/users/:id`

**Description**: Update user information (profile fields only)

**URL Parameters**:
- `id` (required): User UUID

**Request Body** (all fields optional):
```json
{
  "name": "Jonathan",
  "lastName": "Doe Jr.",
  "bio": "Senior Developer",
  "username": "johndoe_new"
}
```

**Success Response** (200):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "username": "johndoe_new",
  "name": "Jonathan",
  "lastName": "Doe Jr.",
  "bio": "Senior Developer",
  "role": "user",
  "createdAt": "2024-01-14T10:30:00Z",
  "updatedAt": "2024-01-14T11:45:00Z"
}
```

**Error Responses**:
- `404 Not Found`: User doesn't exist
- `409 Conflict`: New username already taken

**Note**: Email and password cannot be updated through this endpoint

---

### 5. Delete User
**DELETE** `/users/:id`

**Description**: Permanently delete a user

**URL Parameters**:
- `id` (required): User UUID

**Success Response** (204): No content

**Error Responses**:
- `404 Not Found`: User doesn't exist

**Warning**: This is a hard delete and cannot be undone

---

## Service Methods

### `create(createUserDto)`
- Validates email uniqueness
- Validates username uniqueness
- Creates user (password auto-hashed by entity hook)
- Returns created user

### `findAll(transform?)`
- Retrieves all users
- Orders by creation date descending
- Optionally transforms data
- Password excluded from selection

### `findOne(id)`
- Finds user by UUID
- Throws NotFoundException if not found
- Password excluded from selection

### `update(id, updateUserDto)`
- Finds user by ID
- Validates username uniqueness if changed
- Updates allowed fields
- Returns updated user

### `remove(id)`
- Finds user by ID
- Permanently deletes user
- Returns void

---

## Security Features

1. **Password Protection**: Passwords are NEVER returned in any response
2. **Automatic Hashing**: Passwords automatically hashed before saving
3. **Unique Constraints**: Email and username uniqueness enforced
4. **Validation**: All inputs validated against DTOs
5. **Error Handling**: Descriptive error messages for conflicts

---

## Database Operations

- **Create**: Uses `repository.create()` + `repository.save()`
- **Read**: Uses `repository.find()` and `repository.findOne()`
- **Update**: Uses `Object.assign()` + `repository.save()`
- **Delete**: Uses `repository.remove()`

All operations use TypeORM Repository pattern for type safety.

---

## Next Steps (Commit 8+)
- Add authentication endpoints
- Add password change functionality
- Add user search by email/username
- Add username/email availability check
- Add current user profile endpoints
