# User Entity Documentation

## User Table Schema

The User entity represents registered users in the Bloggy platform.

### Fields:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Auto-generated unique identifier |
| email | String | Unique, Indexed | User's email address |
| username | String | Unique, Indexed | User's unique username |
| password | String | Required | Hashed password (bcrypt) |
| name | String | Nullable | User's first name |
| lastName | String | Nullable | User's last name |
| bio | Text | Nullable | User biography/description |
| role | Enum | Default: 'user' | User role (user, admin) |
| createdAt | Timestamp | Auto | Account creation timestamp |
| updatedAt | Timestamp | Auto | Last update timestamp |

### Indexes:
- **email**: Unique index for fast email lookups
- **username**: Unique index for fast username lookups

### Hooks:
- **@BeforeInsert**: Automatically hashes password before saving new user
- **@BeforeUpdate**: Automatically hashes password if it was changed

### Methods:
- **validatePassword(password: string)**: Compares plain text password with hashed password

### Security Features:
- Passwords are automatically hashed with bcrypt (10 salt rounds)
- Password hashing only occurs if password is not already hashed (prevents double hashing)
- Password validation uses secure bcrypt.compare method
