# Contributing to Pulseboard

Thank you for your interest in contributing to Pulseboard! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you're expected to uphold this code.

## 🚀 Getting Started

### Development Setup

1. **Fork & Clone**

   ```bash
   git clone https://github.com/yourusername/pulseboard.git
   cd pulseboard
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Database Setup**

   ```bash
   docker-compose up -d postgres redis
   pnpm run prisma
   ```

5. **Start Development**
   ```bash
   pnpm run dev
   ```

### Development Workflow

1. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make Changes**
   - Write your code
   - Add/update tests
   - Update documentation if needed

3. **Test Your Changes**

   ```bash
   pnpm run test          # Run tests
   pnpm run lint          # Check code style
   pnpm run type-check    # TypeScript validation
   ```

4. **Commit**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **Push & PR**
   ```bash
   git push origin feature/your-feature-name
   # Then create a Pull Request on GitHub
   ```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat: add user authentication endpoint
fix: resolve database connection timeout
docs: update API documentation
test: add integration tests for auth flow
```

## 🧪 Testing

### Writing Tests

We use Jest + Supertest for testing:

```typescript
// src/routes/v1/example/example.test.ts
import request from 'supertest';
import app from '../../../index';

describe('Example API', () => {
  describe('GET /api/v1/example', () => {
    it('should return example data', async () => {
      const response = await request(app).get('/api/v1/example').expect(200);

      expect(response.body).toEqual({
        message: 'Hello World',
        timestamp: expect.any(String),
      });
    });

    it('should handle errors gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/example/invalid')
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });
});
```

### Test Coverage

Maintain test coverage above 80%:

```bash
pnpm run test:coverage
```

## 🎯 Pull Request Guidelines

### Before Submitting

- [ ] Tests pass (`pnpm test`)
- [ ] Code is linted (`pnpm run lint`)
- [ ] Types are valid (`pnpm run type-check`)
- [ ] Documentation updated (if needed)
- [ ] CHANGELOG.md updated (for notable changes)

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
```

## 🏗️ Project Structure

```
pulseboard/
├── src/
│   ├── config/          # Configuration & environment
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   │   └── v1/         # API version 1
│   │       └── example/
│   │           ├── router.ts      # Route definitions
│   │           ├── service.ts     # Business logic
│   │           ├── service.test.ts # Tests
│   │           └── docs.yaml      # API documentation
│   ├── utils/          # Shared utilities
│   ├── db/             # Database connection
│   └── index.ts        # App entry point
├── prisma/             # Database schema & migrations
├── .github/            # GitHub templates & workflows
└── docs/               # Additional documentation
```

## 🔧 Adding New Features

### 1. API Endpoints

Create new route modules in `src/routes/v1/`:

```typescript
// src/routes/v1/users/router.ts
import { Router } from 'express';
import { asyncHandler } from '../../../middleware/error-handler';
import UserService from './service';

const router: Router = Router();
const userService = new UserService();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const users = await userService.getUsers();
    res.json(users);
  })
);

export default router;
```

### 2. Database Models

Add models to `prisma/schema.prisma`:

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}
```

### 3. Middleware

Add custom middleware in `src/middleware/`:

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { createError } from './error-handler';

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw createError('Authentication required', 401);
  }

  // Validate token logic here
  next();
};
```

## 📋 Code Style

### TypeScript

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper error handling with custom error types
- Avoid `any` types

### Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Classes**: PascalCase (`UserService`)
- **Functions/Variables**: camelCase (`getUserById`)
- **Constants**: UPPER_SNAKE_CASE (`API_VERSION`)
- **Database**: snake_case (`user_id`)

### Code Organization

- Keep functions small and focused
- Use dependency injection where appropriate
- Separate business logic from route handlers
- Add JSDoc comments for public APIs

## 🐛 Reporting Issues

### Bug Reports

Include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS, etc.)
- Relevant code snippets or logs

### Feature Requests

Include:

- Use case description
- Proposed solution
- Alternative solutions considered
- Implementation notes (if any)

## 📚 Documentation

### API Documentation

Update OpenAPI specs in `src/routes/v1/*/docs.yaml`:

```yaml
/users:
  get:
    summary: Get all users
    tags: [Users]
    responses:
      200:
        description: List of users
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/User'
```

### Code Comments

```typescript
/**
 * Retrieves user by ID with error handling
 * @param id - User ID to lookup
 * @returns Promise resolving to user data
 * @throws {AppError} When user not found
 */
async getUserById(id: number): Promise<User> {
  // Implementation
}
```

## 🏆 Recognition

Contributors are recognized in:

- GitHub contributors page
- CHANGELOG.md for notable contributions
- README.md acknowledgments

## 📞 Getting Help

- 💬 [GitHub Discussions](https://github.com/yourusername/pulseboard/discussions)
- 🐛 [Issues](https://github.com/yourusername/pulseboard/issues)
- 📧 Email: maintainer@example.com

---

Thank you for contributing to Pulseboard! 🚀

## 🩺 Contributing Service Monitors

To add a new service to be monitored:

1. Edit `src/config/services.ts` and add your service config (see README for format).
2. Submit a pull request with your change.
3. If you need new result fields, update `prisma/schema.prisma` and the API.
4. Add/adjust tests if you add new logic.

## 🛠️ Troubleshooting Local Setup

- Make sure your Postgres and Redis containers are running (`docker-compose up -d postgres redis`)
- If you get a database access error, check your `.env` and ensure the user/password matches your local Postgres setup.
- Run `pnpm exec prisma migrate dev` after updating the schema.
