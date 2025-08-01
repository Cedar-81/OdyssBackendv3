# OdyssBackend

A NestJS-based backend API for the Odyss platform, providing authentication, user management, playbook functionality, and AI-powered itinerary planning.

## 🚀 Features

- **Authentication & Authorization**: Clerk-based authentication with JWT verification
- **User Management**: User profiles and KYC (Know Your Customer) verification
- **Playbook System**: Create, manage, and update travel playbooks
- **Wallet & Pockets**: Financial management for travel expenses
- **AI Planning**: AI-powered itinerary generation and planning
- **Database Integration**: Supabase for data persistence
- **Real-time Updates**: WebSocket support for live updates

## 🏗️ Architecture

### Core Technologies
- **Framework**: NestJS (Node.js)
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript
- **Validation**: class-validator, class-transformer

### Project Structure
```
src/
├── auth/                 # Authentication & authorization
│   ├── guards/          # Route protection guards
│   ├── clerk.strategy.ts # Passport strategy for Clerk
│   └── auth.module.ts   # Auth module configuration
├── users/               # User management
├── playbooks/           # Playbook CRUD operations
├── playbook-data/       # Playbook data management
├── wallets/             # Wallet operations
├── pockets/             # Pocket management
├── kyc/                 # KYC verification
├── ai-planner/          # AI itinerary planning
├── supabase/            # Database service
├── providers/           # External service providers
├── interceptors/        # Request/response interceptors
├── decorators/          # Custom decorators
└── middleware/          # HTTP middleware
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- Yarn package manager
- Supabase account and project
- Clerk account and application

### Environment Variables
Create a `.env` file in the root directory:

```env
# Clerk Configuration
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_JWT_VERIFICATION_KEY=your_clerk_jwt_verification_key

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
PORT=3000
NODE_ENV=development
```

### Installation
```bash
# Install dependencies
yarn install

# Development mode
yarn start:dev

# Production build
yarn build
yarn start:prod
```

## 🔐 Authentication Flow

### Overview
The application uses Clerk for authentication with the following flow:

1. **Client Authentication**: Users authenticate through Clerk's frontend SDK
2. **JWT Token**: Client sends JWT token in Authorization header
3. **Token Verification**: Backend verifies token using Clerk's verification key
4. **User Sync**: User data is synced with Supabase database
5. **Request Context**: User information is attached to request for route handlers

### Implementation Details

#### Clerk Strategy (`src/auth/clerk.strategy.ts`)
- Extracts JWT from Authorization header
- Verifies token using Clerk's verification key
- Fetches user data from Clerk API
- Returns user object for Passport

#### Authentication Guard (`src/auth/guards/clerk.guard.ts`)
- Global guard applied to all routes
- Checks for `@Public()` decorator to bypass authentication
- Uses Passport's 'clerk' strategy for authentication

#### Supabase User Interceptor (`src/interceptors/supabase-user.interceptor.ts`)
- Runs after authentication
- Syncs Clerk user with Supabase database
- Attaches Supabase user to request context

## 📚 API Documentation

### Authentication Endpoints
All endpoints require authentication unless marked with `@Public()` decorator.

### User Management
- `GET /users` - Get current user profile
- `PUT /users/kyc-status` - Update KYC status

### Playbooks
- `GET /playbooks` - List user's playbooks
- `POST /playbooks` - Create new playbook
- `PUT /playbooks/:id` - Update playbook
- `DELETE /playbooks/:id` - Delete playbook

### Playbook Data
- `GET /playbook-data` - Get playbook data
- `PUT /playbook-data` - Update playbook data

### Wallets & Pockets
- `GET /wallets` - Get user wallet
- `POST /pockets/fund` - Fund pocket

### KYC
- `POST /kyc` - Submit KYC information
- `GET /kyc` - Get KYC status

### AI Planning
- `POST /ai-planner/generate-itinerary` - Generate AI itinerary

## 🛠️ Development

### Code Style
- ESLint for code linting
- Prettier for code formatting
- TypeScript strict mode enabled

### Testing
```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

### Database Migrations
The application uses Supabase for database management. Schema changes should be made through Supabase migrations.

### Adding New Modules
1. Create module directory in `src/`
2. Implement controller, service, and DTOs
3. Add module to `app.module.ts` imports
4. Apply authentication guard as needed
5. Add Supabase user interceptor if user context is required

## 🔒 Security

### Authentication
- JWT tokens verified using Clerk's verification key
- All routes protected by default
- Public routes explicitly marked with `@Public()` decorator

### Database
- Supabase Row Level Security (RLS) enabled
- Service role key used for backend operations
- User data isolated by user ID

### Environment Variables
- Sensitive keys stored in environment variables
- No hardcoded secrets in source code
- Different keys for development and production

## 🚀 Deployment

### Production Build
```bash
yarn build
yarn start:prod
```

### Environment Configuration
Ensure all environment variables are properly set in production environment.

### Database Setup
- Supabase project configured with proper RLS policies
- Required tables and relationships established
- Clerk application configured with correct redirect URLs

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [NestJS documentation](https://docs.nestjs.com/)
- Review Clerk and Supabase documentation
- Open an issue in the repository
