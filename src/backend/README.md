
# PS2 Estate Nexus Backend Implementation Guide

This comprehensive guide provides detailed instructions for implementing the backend functionality of the PS2 Estate Nexus real estate management system. It covers the database schema, API endpoints, file structure, and development workflow.

## Project Structure

The backend code follows this structure:

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
    ├── electron.d.ts     # Type definitions for Electron APIs
    ├── backupTypes.ts    # Type definitions for backup features
    └── documentTypes.ts  # Type definitions for document handling
```

## Where to Implement Backend Logic

### 1. Database Operations (src/backend/database.js)

The `database.js` file is the core database service that handles all data operations:

- **Authentication**: User login, token validation, and refresh functionality
- **CRUD Operations**: For layouts, plots, expenses, billings, clients, and documents
- **Reporting**: Analytics and statistics for dashboard and reports
- **Backup & Restore**: Data backup and recovery functionality

The DatabaseService class is already fully implemented with:
- SQLite database initialization and table creation
- User authentication with JWT tokens
- Complete CRUD operations for all entities
- Activity logging and notifications
- Backup and restore functionality
- Dashboard statistics and analytics

### 2. API Routes (src/backend/main.js)

The `main.js` file sets up Electron and handles all API routes through IPC (Inter-Process Communication):

- Creates and configures the application window
- Initializes the database
- Establishes IPC communication between frontend and backend
- Processes API requests from the frontend
- Handles file uploads and deletions

All route handlers are defined and connected:
- `/auth/*` - Authentication routes
- `/users/*` - User management
- `/layouts/*` - Layout operations
- `/plots/*` - Plot operations
- `/expenses/*` - Expense management
- `/billings/*` - Billing and payment operations
- `/clients/*` - Client management
- `/documents/*` - Document uploads and management
- `/analytics/*` - Data analytics and reporting
- `/backup/*` - Backup operations
- `/settings/*` - Settings management
- `/notifications/*` - Notification handling
- `/logs/*` - Activity logging
- `/ai/*` - AI features (placeholders)

### 3. Preload Script (src/backend/preload.js)

The `preload.js` file safely exposes Electron APIs to the renderer process:

- Sets up secure IPC communication
- Provides controlled access to filesystem operations
- Maintains proper context isolation

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

3. For frontend-only development (uses mock data):
```
npm start
```

4. Build the production version:
```
npm run build
```

## User Account Types

The system supports three user roles with different permissions:

1. **Staff (White)**
   - Basic operations: create layouts, manage clients, generate bills
   - Limited access to financial reports
   - Cannot approve expenses or access sensitive information

2. **Black**
   - All staff permissions plus:
   - Expense approval
   - Access to financial reports
   - Ability to manage "black" transactions (dual accounting)

3. **Admin**
   - Full system access
   - User management
   - System settings
   - Activity logs
   - Backup and restore functionality

## Database Schema

The backend implements these tables:

1. **users** - User accounts with role-based access control
2. **layouts** - Real estate project/layout information
3. **plots** - Individual plots within layouts
4. **expense_categories** - Categories for expense classification
5. **expenses** - Expense tracking with approval workflow
6. **clients** - Client personal and contact information
7. **billings** - Invoice records for clients
8. **payments** - Payment records for billings
9. **attachments** - Document and file attachments for all entities
10. **backup_logs** - Records of system backups
11. **activity_logs** - User activity tracking
12. **settings** - Application configuration
13. **notifications** - User notification system

## API Endpoints

All API endpoints are handled through IPC communication:

### Authentication
- `POST /auth/login` - User login with username/password
- `POST /auth/refresh` - Refresh authentication token
- `GET /auth/user` - Get current user information
- `POST /auth/logout` - User logout

### User Management
- `GET /users` - List all users (admin only)
- `GET /users/:id` - Get user details
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Layouts
- `GET /layouts` - List all layouts with filters
- `GET /layouts/:id` - Get layout details
- `POST /layouts` - Create new layout
- `PUT /layouts/:id` - Update layout
- `DELETE /layouts/:id` - Delete layout
- `GET /layouts/:id/plots` - Get plots for layout
- `GET /layouts/:id/analytics` - Get layout performance data

### Plots
- `GET /plots` - List all plots with filters
- `GET /plots/:id` - Get plot details
- `POST /plots` - Create new plot
- `PUT /plots/:id` - Update plot
- `DELETE /plots/:id` - Delete plot
- `GET /plots/:id/documents` - Get documents for plot
- `POST /plots/:id/documents` - Upload documents for plot

### Expenses
- `GET /expenses/categories` - List expense categories
- `GET /expenses` - List expenses with filters
- `GET /expenses/:id` - Get expense details
- `POST /expenses` - Create new expense
- `PUT /expenses/:id` - Update expense (includes approval)
- `DELETE /expenses/:id` - Delete expense

### Billings
- `GET /billings` - List all billings with filters
- `GET /billings/:id` - Get billing details
- `POST /billings` - Create new billing
- `PUT /billings/:id` - Update billing
- `DELETE /billings/:id` - Delete billing
- `POST /billings/:id/payments` - Add payment to billing
- `POST /billings/:id/generate-pdf` - Generate PDF invoice
- `POST /billings/:id/send-email` - Email invoice to client

### Clients
- `GET /clients` - List all clients with filters
- `GET /clients/:id` - Get client details
- `POST /clients` - Create new client
- `PUT /clients/:id` - Update client
- `DELETE /clients/:id` - Delete client
- `GET /clients/:id/interactions` - Get client interactions

### Documents
- `GET /documents` - List documents with filters
- `GET /documents/:id` - Get document details
- `POST /documents` - Upload new document
- `DELETE /documents/:id` - Delete document
- `GET /documents/search` - Search documents

### Analytics
- `GET /analytics/dashboard` - Get dashboard statistics
- `GET /analytics/sales` - Get sales performance data
- `GET /analytics/plots` - Get plots analytics
- `GET /analytics/layouts` - Get layout performance
- `GET /reports/generate` - Generate custom reports

### Settings
- `GET /settings` - Get application settings
- `PUT /settings` - Update settings

### Backup
- `GET /backup` - List available backups
- `POST /backup` - Create new backup
- `GET /backup/:id` - Download backup
- `POST /backup/:id/restore` - Restore from backup

### Notifications
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id` - Mark notification as read
- `DELETE /notifications/:id` - Delete notification

### Activity Logs
- `GET /logs` - Get activity logs with filters

### AI Features
- `POST /ai/search` - AI-powered search across all data
- `POST /ai/generate-brochure` - Generate marketing materials
- `POST /ai/whatsapp-template` - Generate WhatsApp templates in different languages

## File Upload Handling

Files are handled through the `upload-file` and `delete-file` IPC handlers:

### File Upload Process
1. Frontend selects file and sends to backend
2. File is copied to user data directory
3. Metadata is stored in attachments table
4. File is associated with appropriate entity (plot, client, etc.)

### File Storage Structure
Files are stored in a structured format:
```
{userData}/uploads/{entityType}/{entityId}/{timestamp}_{filename}
```

## Authentication System

Authentication uses JWT tokens with:

- `authenticateUser()` - Validates credentials and issues tokens
- `verifyToken()` - Validates tokens for protected routes 
- `refreshToken()` - Refreshes expired tokens

Security features:
- Password hashing with bcrypt
- Token-based authentication with JWT
- Role-based access control
- Activity logging for security audits

## Implementing Your Own Logic

To implement your own backend logic:

1. **Study the Database Schema**: Understand the table relationships and fields.
2. **Locate the Relevant Functions**: All functions are organized by entity type.
3. **Add Your Business Logic**: Enhance the functions as needed.
4. **Test API Endpoints**: Ensure proper functionality and error handling.

## Development Tips

1. **Use SQLite Studio**: Monitor the database during development.
2. **Check Activity Logs**: Monitor system usage and diagnose issues.
3. **Test Each Role**: Verify permissions work correctly for different user types.
4. **Handle Edge Cases**: Add validation and error handling for all operations.
5. **Implement Business Rules**: Add custom validation for your specific business needs.

## Building for Production

When ready for production:

```
cd src/backend
npm run build
```

This will package the Electron application with the React frontend.

## Support and Documentation

For additional assistance or technical questions, please refer to the PS2 Estate Nexus development team.
