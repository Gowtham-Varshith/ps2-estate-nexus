
# PS2 Estate Nexus Backend Guide

This document provides instructions on how to get started with backend development for the PS2 Estate Nexus application.

## Project Structure

The backend code is located in the `src/backend` directory and follows this structure:

```
src/
├── backend/
│   ├── main.js           # Main Electron entry point with API routes
│   ├── database.js       # Database operations and SQL queries
│   ├── preload.js        # Exposes Electron APIs to the renderer
│   └── package.json      # Backend dependencies
├── api/
│   ├── backendService.ts # Frontend service for API communication
│   └── apiClient.ts      # API client with IPC communication
└── types/
    └── electron.d.ts     # Type definitions for Electron APIs
```

## Where to Implement Backend Logic

### 1. Database Operations (src/backend/database.js)

This file contains all database operations like CRUD operations for:
- Users and authentication
- Layouts and plots
- Expenses and billings
- Clients and documents
- Backups and settings

**Implementation Instructions:**
- The file structure is already set up with function stubs
- Implement the SQL queries and database logic inside each function
- Focus on proper error handling and data validation

### 2. API Routes (src/backend/main.js)

This file contains all the API route handlers that process requests from the frontend:

**Implementation Instructions:**
- API route handlers are already defined but need business logic
- Add your implementation to each handler function (`handleAuthRequests`, `handleLayoutRequests`, etc.)
- Follow the response format patterns established in the stub code

## Getting Started with Development

### Prerequisites
- Node.js 14+ and npm
- Electron
- SQLite3

### Installation Steps

1. Install backend dependencies:
```
cd src/backend
npm install
```

2. Start development environment (runs React frontend + Electron backend):
```
npm run dev
```

3. For frontend-only development (mocked data):
```
npm start
```

4. Build the production version:
```
npm run build
```

## Database Schema Implementation

The database schema is defined in `src/backend/database.js`. You'll need to implement the following tables:

- `users` - User accounts and authentication
- `layouts` - Layout/project information
- `plots` - Plot details within layouts
- `expenses` - Expense tracking
- `expense_categories` - Categories for expenses
- `billings` - Billing records
- `payments` - Payment records for billings
- `clients` - Client information
- `attachments` - Document and file attachments
- `backup_logs` - Backup history
- `activity_logs` - User activity tracking
- `settings` - Application settings
- `notifications` - User notifications

## API Endpoints

The frontend expects the following API endpoints, which you'll need to implement in the backend:

- `/auth/*` - Authentication endpoints
- `/users/*` - User management
- `/layouts/*` - Layout operations
- `/plots/*` - Plot operations
- `/expenses/*` - Expense tracking
- `/billings/*` - Billing operations
- `/clients/*` - Client management
- `/documents/*` - Document management
- `/analytics/*` - Data analytics
- `/backup/*` - Backup operations
- `/settings/*` - Settings management
- `/notifications/*` - Notification handling
- `/logs/*` - Activity logging
- `/ai/*` - AI feature endpoints

## IPC Communication

The application uses Electron's IPC (Inter-Process Communication) mechanism for communication between the frontend and backend:

- Main process: `src/backend/main.js`
- Preload script: `src/backend/preload.js`
- Renderer process: `src/api/backendService.ts`

## File Uploads

File uploads are handled through the `upload-file` IPC handler defined in `main.js`. Files are stored in the user's data directory and referenced in the database.

## Authentication

The authentication system uses JWT tokens with:
- `authenticateUser()` - Validates credentials and issues tokens
- `verifyToken()` - Validates tokens for protected routes
- `refreshToken()` - Refreshes expired tokens

## Building for Production

When ready for production:

```
cd src/backend
npm run build
```

This will package the Electron application with the React frontend.

## Troubleshooting

If you encounter issues:

1. Check the Electron logs for errors
2. Verify SQLite database connections
3. Ensure proper permissions for file operations
4. Check JWT token validation

## Support

For questions or support, refer to the PS2 Estate Nexus documentation or contact the development team.
