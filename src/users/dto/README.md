# User DTOs (Data Transfer Objects)

This folder contains DTOs for the Users module, providing validation and API documentation.

## DTOs Overview

### 1. CreateUserDto
**Purpose**: Validate user registration data

**Required Fields**:
- `email` - Valid email format, unique
- `password` - Minimum 6 characters
- `username` - 3-20 characters, unique

**Optional Fields**:
- `name` - First name
- `lastName` - Last name
- `bio` - User biography

**Validations**:
- Email format validation
- Password minimum length (6 chars)
- Username length constraints (3-20 chars)
- All optional fields are strings

---

### 2. UpdateUserDto
**Purpose**: Validate profile update data

**All Fields Optional**:
- `name` - Update first name
- `lastName` - Update last name
- `bio` - Update biography
- `username` - Update username (3-20 chars)

**Validations**:
- Username length if provided (3-20 chars)
- All fields are optional strings

**Note**: Email and password cannot be updated through this DTO

---

### 3. ChangePasswordDto
**Purpose**: Validate password change requests

**Required Fields**:
- `oldPassword` - Current password for verification
- `newPassword` - New password (minimum 6 characters)

**Validations**:
- Both fields required
- New password minimum length (6 chars)

**Security**: Old password must be verified before updating

---

### 4. UserResponseDto
**Purpose**: Define the structure for user data responses

**Fields**:
- `id` - UUID
- `email` - User email
- `username` - Username
- `name` - First name (optional)
- `lastName` - Last name (optional)
- `bio` - Biography (optional)
- `role` - User role (user/admin)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Note**: Password is NEVER included in responses

---

## Validation Rules Summary

| Field | Type | Min | Max | Required | Unique |
|-------|------|-----|-----|----------|--------|
| email | string | - | - | Yes (create) | Yes |
| password | string | 6 | - | Yes (create) | No |
| username | string | 3 | 20 | Yes (create) | Yes |
| name | string | - | - | No | No |
| lastName | string | - | - | No | No |
| bio | string | - | - | No | No |
| oldPassword | string | - | - | Yes (change pwd) | No |
| newPassword | string | 6 | - | Yes (change pwd) | No |

---

## Usage Examples

### Creating a User
```typescript
const createDto: CreateUserDto = {
  email: 'john@example.com',
  password: 'secure123',
  username: 'johndoe',
  name: 'John',
  lastName: 'Doe',
  bio: 'Developer'
};
```

### Updating a User
```typescript
const updateDto: UpdateUserDto = {
  name: 'Jonathan',
  bio: 'Senior Developer'
};
```

### Changing Password
```typescript
const changePasswordDto: ChangePasswordDto = {
  oldPassword: 'current123',
  newPassword: 'newsecure456'
};
```
