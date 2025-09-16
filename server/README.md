# License Management System API

A robust backend system for managing software licenses, users, agents, and transactions.

## Features

- **User Management**: Register, authenticate, and manage users with role-based access control
- **License Management**: Generate, validate, and manage software licenses
- **Agent System**: Track agents, their sales, and commissions
- **Transaction Tracking**: Record all financial transactions and commissions
- **RESTful API**: Well-documented endpoints for easy integration

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with refresh tokens
- **Validation**: class-validator
- **Logging**: Winston
- **API Documentation**: Swagger/OpenAPI (coming soon)

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration

4. **Database setup**
   - Create a new PostgreSQL database
   - Update the database connection details in `.env`

5. **Run migrations**
   ```bash
   npm run migrate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update profile

### Licenses

- `GET /api/licenses` - List all licenses (with filters)
- `POST /api/licenses` - Create a new license
- `POST /api/licenses/bulk` - Generate multiple licenses
- `GET /api/licenses/:id` - Get license by ID
- `PUT /api/licenses/:id` - Update license
- `DELETE /api/licenses/:id/revoke` - Revoke a license
- `POST /api/licenses/activate` - Activate a license
- `GET /api/licenses/validate` - Validate a license
- `GET /api/licenses/stats` - Get license statistics

## Database Schema

![Database Schema](docs/database-schema.png)

## Authentication

All protected routes require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Error Handling

Errors are returned in the following format:

```json
{
  "success": false,
  "status": "error",
  "message": "Error message",
  "stack": "Error stack trace (development only)"
}
```

## Rate Limiting

API is rate limited to 100 requests per 15 minutes by default. This can be configured in the `.env` file.

## Logging

Logs are stored in the `logs/` directory with daily rotation in production.

## Testing

Run tests:

```bash
npm test
```

## Deployment

### Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Docker

```bash
docker-compose up --build
```

## Environment Variables

See `.env.example` for all available environment variables.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
