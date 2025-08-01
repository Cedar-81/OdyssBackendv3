# Odyss NestJS Backend

A NestJS backend for the Odyss platform, providing CRUD operations for playbooks and playbook data management.

## Features

- ✅ **PlaybooksModule** - Complete CRUD operations for playbooks
- ✅ **Playbook Data Management** - JSONB data handling for flexible playbook content
- ✅ **TypeORM Integration** - Database operations with PostgreSQL
- ✅ **Validation** - Request validation using class-validator
- ✅ **RESTful API** - Standard HTTP endpoints

## Database Schema

Based on Supabase schema:

### Tables
- `playbooks` - Main playbook information
- `playbookdata` - JSONB data storage for playbook content
- `playbookparticipants` - User participation in playbooks

## API Endpoints

### Playbooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/playbooks` | Create a new playbook |
| `GET` | `/api/playbooks` | Get all playbooks |
| `GET` | `/api/playbooks/:id` | Get a specific playbook |
| `PATCH` | `/api/playbooks/:id` | Update a playbook |
| `DELETE` | `/api/playbooks/:id` | Delete a playbook |

### Playbook Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/playbooks/data` | Create playbook data |
| `GET` | `/api/playbooks/:playbookId/data` | Get all data for a playbook |
| `PATCH` | `/api/playbooks/data/:id` | Update playbook data |
| `DELETE` | `/api/playbooks/data/:id` | Delete playbook data |

## Request/Response Examples

### Create Playbook
```bash
POST /api/playbooks
Content-Type: application/json

{
  "title": "Paris Adventure",
  "ownerId": "123e4567-e89b-12d3-a456-426614174000",
  "destination": "Paris, France",
  "startDate": "2025-08-03",
  "endDate": "2025-08-21"
}
```

### Create Playbook Data
```bash
POST /api/playbooks/data
Content-Type: application/json

{
  "playbookId": "123e4567-e89b-12d3-a456-426614174000",
  "data": {
    "type": "itinerary",
    "activities": [
      {
        "day": 1,
        "activity": "Visit Eiffel Tower",
        "time": "09:00",
        "location": "Champ de Mars"
      }
    ]
  }
}
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=odyss
   NODE_ENV=development
   ```

3. **Database Setup**
   - Ensure PostgreSQL is running
   - Create database named `odyss`
   - Tables will be auto-created by TypeORM

4. **Run the Application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production build
   npm run build
   npm run start:prod
   ```

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts          # Root module
└── playbooks/
    ├── playbooks.module.ts
    ├── playbooks.controller.ts
    ├── playbooks.service.ts
    ├── dto/
    │   ├── create-playbook.dto.ts
    │   ├── update-playbook.dto.ts
    │   └── create-playbook-data.dto.ts
    └── entities/
        ├── playbook.entity.ts
        ├── playbook-data.entity.ts
        └── playbook-participant.entity.ts
```

## Development

- **Port**: 3000 (configurable via PORT env var)
- **API Prefix**: `/api`
- **CORS**: Enabled for all origins
- **Validation**: Automatic request validation
- **Error Handling**: Standardized error responses

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
``` 