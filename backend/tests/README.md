# DilemmHub Backend Tests

## Test Setup

The test suite uses:
- **Jest** - Test framework
- **ts-jest** - TypeScript support
- **Supertest** - HTTP assertions
- **@jest/globals** - Jest globals for ESM

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Test Structure

### Integration Tests (`tests/integration.test.ts`)
Full API endpoint testing with real HTTP requests:

**Auth Endpoints:**
- ✅ `POST /api/auth/register` - Register new user
- ✅ `POST /api/auth/login` - Login with credentials

**Dilemma Endpoints:**
- `POST /api/dilemmas` - Create dilemma (requires auth)
- `GET /api/dilemmas` - Get all dilemmas
- `GET /api/dilemmas/:id` - Get specific dilemma
- `PUT /api/dilemmas/:id` - Update dilemma (requires auth + ownership)
- `GET /api/dilemmas/search` - Search dilemmas

**Vote Endpoints:**
- `POST /api/votes` - Cast vote (requires auth)
- Duplicate vote prevention

**Comment Endpoints:**
- `POST /api/comments` - Add comment (requires auth)
- `GET /api/comments/dilemma/:id` - Get dilemma comments

### Unit Tests (`tests/dilemmaController.test.ts`, `tests/commentController.test.ts`)
Controller function testing with mocked requests/responses.

## Test Utilities (`tests/testUtils.ts`)

### Database Helpers
```typescript
testDb.cleanAll()        // Clear all test data
testDb.createUser()      // Create test user
testDb.createDilemma()   // Create test dilemma
testDb.createVote()      // Create test vote
testDb.createComment()   // Create test comment
testDb.disconnect()      // Close Prisma connection
```

### Mock Factories
```typescript
mockRequest()   // Create mock Express request
mockResponse()  // Create mock Express response
```

## Known Issues

1. **Cookie Authentication** - Integration tests currently have issues with cookie-based JWT authentication when using supertest. The auth middleware expects cookies in a specific format.

2. **Unit Tests** - Some unit tests are calling controller functions without proper auth context, causing Prisma validation errors.

3. **Test Database** - Currently using the same database as development. Should ideally use a separate test database.

## Improvements Needed

1. **Mock JWT middleware** - For integration tests, either:
   - Use a test JWT secret and generate valid tokens
   - Mock the auth middleware completely
   - Use session-based testing with supertest agent

2. **Separate test database** - Create a `.env.test` file with separate DATABASE_URL

3. **More test coverage:**
   - Auth routes (register, login, refresh, logout, profile update, password change)
   - Vote controller unit tests
   - Error scenarios (invalid IDs, malformed requests)
   - Edge cases (empty search, missing fields)

4. **Setup/Teardown** - Better isolation between tests to prevent side effects

## Current Test Status

```
✅ Integration Tests: Basic auth flow working
⚠️  Unit Tests: Need auth context fixes
⚠️  Cookie auth: Needs proper supertest configuration
```

## Example Working Test

```typescript
it("should register a new user", async () => {
  const res = await request(app).post("/api/auth/register").send({
    username: "testuser",
    email: "test@example.com",
    password: "password123",
  });

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("user");
  expect(res.headers["set-cookie"]).toBeDefined();
});
```
