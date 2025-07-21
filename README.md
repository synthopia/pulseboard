# Pulseboard

A modern, production-ready REST API template built with **Node.js**, **TypeScript**, **Express**, and **Prisma**. Features comprehensive security, testing, and development workflows out of the box.

## ✨ Features

- 🚀 **Modern Stack**: Node.js 20 + TypeScript + Express + Prisma
- 🛡️ **Security First**: Helmet, CORS, rate limiting, input validation
- 🧪 **Testing Ready**: Jest + Supertest with sample tests
- 📝 **Code Quality**: ESLint + Prettier + Husky pre-commit hooks
- 🐳 **Docker Ready**: Multi-stage builds with health checks
- 📊 **Monitoring**: Health check endpoint + structured logging
- 🔧 **Type Safety**: Strict TypeScript + Zod validation
- 📚 **API Docs**: Swagger/OpenAPI documentation
- 🏗️ **Production Ready**: Error handling + graceful shutdown

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Docker & Docker Compose (optional)

### Installation

1. **Clone & Install**

   ```bash
   git clone https://github.com/yourusername/pulseboard.git
   cd pulseboard
   pnpm install
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis URLs
   ```

3. **Database Setup**

   ```bash
   # Start PostgreSQL & Redis (optional)
   docker-compose up -d postgres redis

   # Generate Prisma client
   pnpm run prisma
   ```

4. **Start Development**
   ```bash
   pnpm run dev
   ```

Visit `http://localhost:8080/health` to verify it's running!

## 📖 API Documentation

- **Health Check**: `GET /health`
- **API Docs**: `GET /docs` (Swagger UI)
- **Test Endpoint**: `GET /api/v1/test/ping`

### Example Response

```bash
curl http://localhost:8080/api/v1/test/ping
```

```json
{
  "message": "pong",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm run dev          # Start with hot reload
pnpm run build        # Build for production
pnpm run start        # Start production server

# Code Quality
pnpm run lint         # Check code style
pnpm run lint:fix     # Auto-fix issues
pnpm run format       # Format with Prettier
pnpm run type-check   # TypeScript validation

# Testing
pnpm run test         # Run all tests
pnpm run test:watch   # Run tests in watch mode
pnpm run test:coverage # Generate coverage report

# Database
pnpm run prisma       # Generate Prisma client
```

### Project Structure

```
pulseboard/
├── src/
│   ├── config/          # Environment validation
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route handlers
│   │   └── v1/         # API version 1
│   ├── utils/          # Utilities (rate limiter, swagger)
│   ├── db/             # Database connection
│   └── index.ts        # Application entry point
├── prisma/             # Database schema
├── .husky/             # Git hooks
└── tests/              # Test configuration
```

### Environment Variables

Create a `.env` file:

```env
# Server
NODE_ENV=development
PORT=8080
API_VERSION=1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pulseboard

# Redis (optional)
REDIS_URL=redis://localhost:6379

# CORS (production only)
ALLOWED_ORIGINS=https://yourdomain.com
```

## 🐳 Docker

### Development with Docker

```bash
# Start all services
docker-compose up

# Or just the API
docker-compose up api
```

### Production Build

```bash
# Build image
docker build -t pulseboard .

# Run container
docker run -p 8080:8080 \
  -e DATABASE_URL="your-db-url" \
  pulseboard
```

## 🧪 Testing

The project includes comprehensive testing setup:

```bash
# Run all tests
pnpm test

# Watch mode during development
pnpm run test:watch

# Generate coverage report
pnpm run test:coverage
```

### Writing Tests

```typescript
import request from 'supertest';
import app from '../../../index';

describe('Your API', () => {
  it('should do something', async () => {
    const response = await request(app)
      .get('/api/v1/your-endpoint')
      .expect(200);

    expect(response.body).toEqual({
      success: true,
    });
  });
});
```

## 🔧 Configuration

### TypeScript

Modern TypeScript configuration with strict mode:

- ES2022 target
- Source maps enabled
- Declaration files generated
- Strict type checking

### ESLint + Prettier

Automated code formatting and linting:

- Pre-commit hooks ensure consistency
- TypeScript-aware rules
- Prettier integration

### Database

Using Prisma for type-safe database access:

```typescript
// Example model in schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 📦 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Traditional Hosting

```bash
# Build application
pnpm run build

# Start production server
pnpm start

# Or use PM2
pm2 start dist/index.js --name pulseboard
```

## 🩺 Status Monitoring

Pulseboard includes a built-in status page backend:

- Periodically pings all services defined in `src/config/services.ts` (default: every 30s)
- Saves results (status, response time, error, etc.) in the database
- Exposes an API to fetch all services and their latest check results

### Database Models

- **Service**: Stores service config (name, url, method, headers, etc.)
- **ServiceCheck**: Stores each check result (status, response time, error, category, etc.)

### API Endpoints

- `GET /api/v1/status` — List all services and their latest check results
- `GET /api/v1/status/:id` — Details for a single service (optional)

### Status Categories

- `ok`: HTTP 2xx
- `warn`: HTTP 4xx
- `err`: HTTP 5xx or network error

### Adding a Service

1. Edit `src/config/services.ts` and add your service config.
2. The CRON job will automatically pick it up and start monitoring.

### Example Service Config

```ts
{
  name: 'My API',
  url: 'https://api.example.com',
  method: 'GET',
  headers: { 'Authorization': 'Bearer ...' },
}
```

### Example API Response

```json
[
  {
    "id": 1,
    "name": "App",
    "url": "https://skilltap.net",
    "method": "GET",
    "latestCheck": {
      "status": 200,
      "responseTime": 123,
      "category": "ok",
      "checkedAt": "2024-01-20T10:30:00.000Z"
    }
  },
  ...
]
```

## 🤝 Contributing New Service Checks

Want to add a new service or integration? Just edit `src/config/services.ts` and submit a pull request!

- Please include a description and test your config.
- If you want to add new result fields, update the Prisma schema and API as needed.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [Prisma](https://prisma.io/) - Next-generation ORM
- [TypeScript](https://typescriptlang.org/) - JavaScript with types
- [Jest](https://jestjs.io/) - JavaScript testing framework

## 📞 Support

- 🐛 [Report Bugs](https://github.com/yourusername/pulseboard/issues)
- 💡 [Request Features](https://github.com/yourusername/pulseboard/issues)
- 💬 [Discussions](https://github.com/yourusername/pulseboard/discussions)

---

**Built with ❤️ for the developer community**

## 🏗️ Self-Hosted Setup

### 1. Clone & Install

```sh
git clone https://github.com/yourusername/pulseboard.git
cd pulseboard
pnpm install
```

### 2. Configure Environment

- Copy `.env.example` to `.env` and edit as needed:
  ```sh
  cp .env.example .env
  # Edit .env for your DB, user, password, etc.
  ```
- Example `.env`:
  ```env
  POSTGRES_USER=pulseboard
  POSTGRES_PASSWORD=password
  POSTGRES_DB=pulseboard
  NODE_ENV=production
  PORT=8080
  PERIOD=60000 # check interval in ms
  ```

### 3. Start with Docker Compose

```sh
docker-compose up --build
```

- This will start both the Node.js app and PostgreSQL database.
- The app will be available at [http://localhost:8080](http://localhost:8080)

### 4. Database Schema Sync

- On container startup, the app will automatically run:
  ```sh
  pnpm exec prisma db push
  ```
- This ensures your database schema is always up to date with your code and `.env` settings.
- No need to run migrations manually for basic setups.

### 5. Dynamic DATABASE_URL

- The app and database are networked together in Docker Compose.
- `DATABASE_URL` is built dynamically from your `.env`:
  ```env
  DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
  ```
- Change any value in `.env` and restart for it to take effect.

### 6. Static Files

- All static files in `src/public` are served automatically.
- Add or edit files there and rebuild/restart the container to update.

### 7. Health & Status

- Health check: [http://localhost:8080/health](http://localhost:8080/health)
- Status dashboard: [http://localhost:8080/](http://localhost:8080/)

---

## 🐳 Docker Compose Example

```yaml
version: '3.9'
services:
  db:
    image: postgres:16-alpine
    env_file:
      - .env
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-pulseboard}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
      POSTGRES_DB: ${POSTGRES_DB:-pulseboard}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - pulseboard-net
    restart: unless-stopped

  app:
    build: .
    env_file:
      - .env
    environment:
      DATABASE_URL: postgres://${POSTGRES_USER:-pulseboard}:${POSTGRES_PASSWORD:-password}@db:5432/${POSTGRES_DB:-pulseboard}
    ports:
      - '8080:8080'
    depends_on:
      - db
    networks:
      - pulseboard-net
    restart: unless-stopped
    command: ['sh', '-c', 'pnpm exec prisma db push && pnpm start']

volumes:
  postgres_data:

networks:
  pulseboard-net:
    driver: bridge
```

---

## 📝 Notes

- For production, use strong DB credentials and secure your `.env`.
- For custom check intervals, set `PERIOD` in `.env` (in ms).
- To update the schema, just edit `prisma/schema.prisma` and restart the app.
- For advanced migrations, use `prisma migrate` instead of `db push`.
