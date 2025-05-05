
# PS2 Estate Nexus - Backend Implementation Guide

## Project Overview

PS2 Estate Nexus is a comprehensive real estate management system built with Electron and React. The application provides tools for managing layouts, plots, expenses, billings, clients, documents, and more, with role-based access control for different user types.

## Backend Architecture

The application uses Electron for the desktop application framework, with a React frontend and a Node.js backend. SQLite is used as the database, providing a portable, file-based database solution that does not require a separate database server.

### Key Backend Files

1. **src/backend/main.js** - The main Electron process that initializes the application, sets up IPC communication, and handles API routes.
2. **src/backend/database.js** - Core database service with all SQL operations and business logic.
3. **src/backend/preload.js** - Exposes selected Node.js APIs to the renderer process safely.
4. **src/backend/package.json** - Backend dependencies and build configuration.

### Frontend-Backend Communication

Communication between the frontend and backend is handled through Electron's Inter-Process Communication (IPC) mechanism:

- Frontend → Backend: `ipcRenderer.invoke('api-request', { method, endpoint, data, token })`
- Backend → Frontend: Response returned through the Promise resolution
- File operations: Dedicated IPC channels for uploads and downloads

## Getting Started with Development

### Setting Up Your Development Environment

1. **Clone the Repository**
   ```
   git clone <repository-url>
   cd ps2-estate-nexus
   ```

2. **Install Dependencies**
   ```
   npm install            # Install frontend dependencies
   cd src/backend
   npm install            # Install backend dependencies
   ```

3. **Start the Development Environment**
   ```
   npm run dev            # Starts both frontend and backend in development mode
   ```

4. **Build for Production**
   ```
   npm run build          # Creates production build for distribution
   ```

## Backend Implementation Guide

### 1. Database Schema (src/backend/database.js)

The `database.js` file contains the `DatabaseService` class, which handles all database operations. This file is already set up with the necessary table creation and basic CRUD operations for all entities.

You'll need to implement the business logic in the following functions:

- **Authentication**: Enhance the token validation and refresh logic.
- **Layouts & Plots**: Add validation for plot creation and status changes.
- **Expenses**: Implement the approval workflow and notification system.
- **Billings**: Add payment validation and balance calculation.
- **Reporting**: Create custom aggregation queries for analytics.
- **AI Features**: Connect to external services for AI-powered search.

### 2. API Routes (src/backend/main.js)

The `main.js` file contains route handlers for all API endpoints. These handlers validate requests, call the appropriate database functions, and format the responses.

Focus on implementing these handler functions:

- `handleAuthRequests` - Authentication and user session management
- `handleLayoutRequests` - Layout and plot operations
- `handleExpenseRequests` - Expense management with approval workflow
- `handleBillingRequests` - Invoice and payment processing
- `handleClientRequests` - Client management and interaction history
- `handleAnalyticsRequests` - Reporting and data visualization
- `handleAIRequests` - AI-powered features (search, templates)

### 3. File Handling

File upload and download operations are handled through dedicated IPC channels:

- `upload-file` - For uploading files to the application's data directory
- `delete-file` - For removing files from storage

You'll need to implement:
- File validation and scanning
- Storage optimization
- Cleanup for orphaned files

## Role-Based Access Control

The application supports three user roles with different permissions:

1. **Staff (White Role)**
   - Basic operations: create layouts, manage clients, generate bills
   - Limited access to financial reports
   - Cannot approve expenses or access sensitive information

2. **Black (Higher Privileges)**
   - All staff permissions plus:
   - Expense approval
   - Access to financial reports
   - Ability to manage "black" transactions (dual accounting)

3. **Admin (Full Access)**
   - Full system access
   - User management
   - System settings
   - Activity logs
   - Backup and restore functionality

You'll need to implement permission checking in each API handler based on the user's role.

## Implementing Advanced Features

### 1. Backup and Restore

The backup system creates full database backups that can be restored if needed:

- Implement scheduled automatic backups
- Add integrity verification for backup files
- Create a cleanup mechanism for old backups

### 2. AI Features

AI features can be implemented by connecting to external APIs:

- **Smart Search**: Implement NLP processing of user queries
- **WhatsApp Templates**: Create templates in different languages
- **Document Analysis**: Extract data from uploaded documents

### 3. Reporting

Enhance the reporting system with:

- Custom report generation
- Export to PDF, Excel, and CSV
- Scheduled report delivery

## Testing Your Implementation

1. **Database Testing**
   - Use SQLite Studio to inspect the database structure and data
   - Write test queries to verify complex operations

2. **API Testing**
   - Use Electron's Developer Tools to monitor IPC communication
   - Test each endpoint with different user roles

3. **Integration Testing**
   - Test complete workflows from frontend to backend
   - Verify data integrity across operations

## Deployment Considerations

When deploying the application:

1. **Database Security**
   - Implement encryption for sensitive data
   - Add regular integrity checks

2. **Updates**
   - Create a mechanism for seamless database schema updates
   - Handle data migration between versions

3. **Performance**
   - Add indexes for frequently queried fields
   - Optimize large queries with proper pagination

## Need Help?

For additional assistance or technical questions, refer to the project's documentation or contact the development team.
