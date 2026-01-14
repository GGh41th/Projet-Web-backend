# Users Module Structure

## Overview
The Users module handles all user-related operations including CRUD operations, profile management, and user search.

## Structure

```
src/users/
├── dto/                      # Data Transfer Objects (to be populated)
│   └── README.md
├── users.module.ts          # Module configuration with TypeORM
├── users.service.ts         # Business logic with Repository injection
├── users.controller.ts      # HTTP endpoints
├── users.service.spec.ts    # Service unit tests
└── users.controller.spec.ts # Controller unit tests
```

## Module Configuration

### Imports:
- `TypeOrmModule.forFeature([User])` - Registers User entity repository

### Exports:
- `UsersService` - Makes service available to other modules (needed for Auth)
- `TypeOrmModule` - Makes User repository available to other modules

### Dependencies:
- **User Entity** from `../entities/user.entity`
- **TypeORM Repository** for database operations

## Service
- Injects `Repository<User>` for database operations
- Methods will be implemented in Commit 7

## Controller
- Route prefix: `/users`
- Swagger tag: `Users`
- Endpoints will be implemented in Commit 7

## Next Steps (Commit 6)
- Create DTOs (CreateUserDto, UpdateUserDto, ChangePasswordDto)
- Add validation decorators
- Add API documentation decorators
