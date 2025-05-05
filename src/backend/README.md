
# PS2 Estate Nexus Backend

This directory contains the Electron backend for the PS2 Estate Nexus application. It provides a complete API for the frontend to interact with, managing users, layouts, plots, expenses, billings, and other functionality.

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- Electron
- SQLite3

### Installation

1. Install dependencies:
```
cd src/backend
npm install
```

2. Run the development version (with React frontend):
```
npm run dev
```

3. Build the production version:
```
npm run build
```

## Architecture

The backend is built with Electron and uses SQLite3 for the database. It communicates with the React frontend using Electron's IPC (Inter-Process Communication) mechanism.

### Components:

- `main.js`: The entry point for the Electron application, sets up windows and IPC handlers
- `database.js`: Manages all database operations and provides an API for the frontend
- `preload.js`: Safely exposes Electron APIs to the renderer process

### Database Schema

The database is designed to handle all aspects of real estate management, including:

- Users and authentication
- Layouts and plots
- Expenses and billings
- Clients and documents
- Backups and settings

## API Endpoints

All API endpoints are handled through the IPC channel 'api-request'. See the API.md file in the project root for detailed documentation of all available endpoints.

## File Uploads

File uploads are handled through the IPC channel 'upload-file'. Files are stored in the user's data directory and referenced in the database.

## Security

The backend implements security best practices:
- JWT for authentication
- Password hashing using bcrypt
- Role-based access control
- Input validation

## Customizing the Backend

To modify the backend functionality, you can:

1. Add or modify API endpoints in `main.js`
2. Extend database functionality in `database.js`
3. Update the database schema as needed

## License

This software is proprietary and confidential. Unauthorized copying, transferring or reproduction of the contents, via any medium is strictly prohibited.

