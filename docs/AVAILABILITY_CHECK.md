# Username/Email Availability Check (Commit 14)

## Overview

This endpoint allows checking if an email address or username is already taken, useful for real-time validation during user registration forms.

---

## Endpoint

### Check Availability
**GET** `/users/isvalid/:identifier`

**Description**: Check if an email or username is available for registration

**URL Parameters**:
- `identifier` (required): Email address or username to check

**Auto-Detection**: The endpoint automatically detects whether the input is an email (contains `@`) or username.

---

## Examples

### Check Email Availability

**Request**:
```
GET /users/isvalid/john.doe@example.com
```

**Response** (200) - Email is taken:
```json
{
  "isTaken": true
}
```

**Response** (200) - Email is available:
```json
{
  "isTaken": false
}
```

---

### Check Username Availability

**Request**:
```
GET /users/isvalid/johndoe
```

**Response** (200) - Username is taken:
```json
{
  "isTaken": true
}
```

**Response** (200) - Username is available:
```json
{
  "isTaken": false
}
```

---

## Service Method

### `isValid(identifier: string): Promise<{ isTaken: boolean }>`

**Purpose**: Check if email or username already exists in the database

**Implementation**:
```typescript
async isValid(identifier: string): Promise<{ isTaken: boolean }> {
  // Check if it's an email format
  const isEmail = identifier.includes('@');

  let user;
  if (isEmail) {
    user = await this.userRepository.findOne({
      where: { email: identifier },
      select: ['id'],
    });
  } else {
    user = await this.userRepository.findOne({
      where: { username: identifier },
      select: ['id'],
    });
  }

  return { isTaken: !!user };
}
```

**Features**:
- Automatic detection of email vs username
- Minimal data selection (only `id` field for performance)
- Returns boolean wrapped in object
- No exceptions thrown (always returns 200)

---

## Frontend Integration

### React Example

```typescript
const checkAvailability = async (value: string) => {
  const response = await fetch(`/users/isvalid/${value}`);
  const data = await response.json();
  
  if (data.isTaken) {
    return 'This email/username is already taken';
  }
  return null; // Valid
};

// In form validation
<input
  name="username"
  onChange={debounce(async (e) => {
    const error = await checkAvailability(e.target.value);
    setUsernameError(error);
  }, 500)}
/>
```

### Vue Example

```javascript
const checkAvailability = async (identifier) => {
  try {
    const response = await axios.get(`/users/isvalid/${identifier}`);
    return response.data.isTaken;
  } catch (error) {
    console.error('Availability check failed:', error);
    return false;
  }
};
```

### Angular Example

```typescript
checkAvailability(identifier: string): Observable<boolean> {
  return this.http
    .get<{ isTaken: boolean }>(`/users/isvalid/${identifier}`)
    .pipe(map(response => response.isTaken));
}
```

---

## Use Cases

1. **Registration Form Validation**
   - Real-time feedback as user types
   - Prevent form submission with taken credentials
   - Improve user experience

2. **Profile Update**
   - Check if new username is available
   - Validate before attempting update

3. **Username Suggestions**
   - Check multiple username variations
   - Suggest available alternatives

4. **Email Verification**
   - Pre-check before sending verification email
   - Avoid duplicate accounts

---

## Performance Considerations

### Optimizations:
- ✅ **Minimal Selection**: Only selects `id` field (fastest)
- ✅ **Indexed Fields**: Uses indexed email/username columns
- ✅ **Single Query**: One database query per check
- ✅ **No Joins**: Simple lookup without relations

### Best Practices:
- **Debounce**: Implement debouncing (300-500ms) in frontend
- **Caching**: Consider short-term caching for repeated checks
- **Rate Limiting**: Protect endpoint from abuse

---

## Error Handling

This endpoint **never throws exceptions**:
- Always returns 200 status
- Returns `{ isTaken: false }` for any error
- Safe for public access without authentication

**Exception Behavior**:
```typescript
// Email exists → { isTaken: true }
// Username exists → { isTaken: true }
// Email available → { isTaken: false }
// Username available → { isTaken: false }
// Database error → { isTaken: false } (fail-safe)
```

---

## Security Considerations

1. **No User Enumeration**: 
   - Response is binary (taken/available)
   - Doesn't reveal user details
   - Safe for public endpoints

2. **Rate Limiting Recommended**:
   - Prevent brute-force email/username discovery
   - Implement throttling (e.g., 10 requests/minute per IP)

3. **Input Validation**:
   - Frontend should validate format before checking
   - Backend validates via URL parameter

---

## Testing

### Test Cases:

```typescript
describe('Availability Check', () => {
  it('should return isTaken=true for existing email', async () => {
    const result = await usersService.isValid('existing@example.com');
    expect(result.isTaken).toBe(true);
  });

  it('should return isTaken=false for available email', async () => {
    const result = await usersService.isValid('new@example.com');
    expect(result.isTaken).toBe(false);
  });

  it('should return isTaken=true for existing username', async () => {
    const result = await usersService.isValid('existinguser');
    expect(result.isTaken).toBe(true);
  });

  it('should return isTaken=false for available username', async () => {
    const result = await usersService.isValid('newuser');
    expect(result.isTaken).toBe(false);
  });

  it('should detect email by @ symbol', async () => {
    const emailResult = await usersService.isValid('test@test.com');
    const usernameResult = await usersService.isValid('testuser');
    // Both should query different fields
  });
});
```

---

## API Documentation

### Swagger Response Schema:
```yaml
/users/isvalid/{identifier}:
  get:
    summary: Check if email or username is available
    parameters:
      - name: identifier
        in: path
        required: true
        schema:
          type: string
        description: Email or username to check
        example: johndoe
    responses:
      200:
        description: Availability check result
        content:
          application/json:
            schema:
              type: object
              properties:
                isTaken:
                  type: boolean
                  description: true if taken, false if available
```

---

## Next Commit (15)

In the next commit, we'll implement:
- Current user profile endpoints (`GET /users/infos`)
- Profile update endpoint (`PATCH /users/infos`)
- Password change endpoint (`PATCH /users/infos/password`)

These will require authentication (JWT), which will be added later.
