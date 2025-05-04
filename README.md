
# PS2 Estate Nexus - Real Estate Management System

PS2 Estate Nexus is a comprehensive real estate management platform designed for real estate developers, brokers, and agencies to streamline property management operations, including layout planning, plot sales, expense tracking, and client information management.

## Features

- **Dashboard**: View key metrics, recent transactions, and plot sales data
- **Layout Management**: Create, view, and manage real estate development layouts
- **Plot Management**: Track plot details, status, and associated documents
- **Expense Tracking**: Monitor expenses with categorization and status tracking
- **Billing System**: Generate and manage bills for plot sales
- **Client Information Management**: Maintain a database of clients and prospects
- **Document Storage**: Upload and organize layout and plot-related documents
- **AI-Powered Features**: Generate brochures, send customized messages, and perform intelligent searches
- **Dual Accounting System**: Track both official (white) and unofficial (black) transactions separately
- **Role-based Access Control**: Different permission levels for staff, admin, and black roles

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: React Router
- **State Management**: React Context API and TanStack Query
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd ps2-estate-nexus
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## API Endpoints for Backend Integration

Below are the recommended API endpoints needed for integrating with a backend service:

### Authentication
- `POST /api/auth/login` - Authenticate user and get access token
- `POST /api/auth/logout` - Invalidate user session
- `GET /api/auth/user` - Get current user details
- `POST /api/auth/refresh` - Refresh authentication token

### Layouts
- `GET /api/layouts` - Get all layouts with optional filtering
- `GET /api/layouts/:id` - Get specific layout details
- `POST /api/layouts` - Create a new layout
- `PUT /api/layouts/:id` - Update an existing layout
- `DELETE /api/layouts/:id` - Delete a layout (soft delete)
- `GET /api/layouts/:id/plots` - Get all plots for a specific layout
- `GET /api/layouts/:id/analytics` - Get sales and performance analytics for a layout

### Plots
- `GET /api/plots` - Get all plots with optional filtering
- `GET /api/plots/:id` - Get specific plot details
- `POST /api/plots` - Create a new plot
- `PUT /api/plots/:id` - Update an existing plot
- `DELETE /api/plots/:id` - Delete a plot (soft delete)
- `GET /api/plots/:id/documents` - Get all documents for a specific plot
- `POST /api/plots/:id/documents` - Upload documents to a plot
- `DELETE /api/plots/:id/documents/:documentId` - Remove a document from a plot

### Expenses
- `GET /api/expenses` - Get all expenses with optional filtering
- `GET /api/expenses/:id` - Get specific expense details
- `POST /api/expenses` - Create a new expense
- `PUT /api/expenses/:id` - Update an existing expense
- `DELETE /api/expenses/:id` - Delete an expense (soft delete)
- `GET /api/expenses/categories` - Get expense categories
- `POST /api/expenses/categories` - Create a new expense category

### Billing
- `GET /api/billings` - Get all billings with optional filtering
- `GET /api/billings/:id` - Get specific billing details
- `POST /api/billings` - Create a new billing
- `PUT /api/billings/:id` - Update an existing billing
- `DELETE /api/billings/:id` - Delete a billing (soft delete)
- `POST /api/billings/:id/generate-pdf` - Generate a PDF for a specific billing
- `POST /api/billings/:id/send-email` - Send billing details via email

### Clients/Info Management
- `GET /api/clients` - Get all clients with optional filtering
- `GET /api/clients/:id` - Get specific client details
- `POST /api/clients` - Create a new client
- `PUT /api/clients/:id` - Update an existing client
- `DELETE /api/clients/:id` - Delete a client (soft delete)
- `GET /api/clients/:id/interactions` - Get client interaction history

### Documents
- `GET /api/documents` - Get all documents with optional filtering
- `GET /api/documents/:id` - Get a specific document
- `POST /api/documents` - Upload a new document
- `DELETE /api/documents/:id` - Delete a document
- `GET /api/documents/search` - Search for documents by content/metadata

### Analytics & Reporting
- `GET /api/analytics/dashboard` - Get data for the dashboard
- `GET /api/analytics/sales` - Get sales performance data
- `GET /api/analytics/plots` - Get plot sales statistics
- `GET /api/analytics/layouts` - Get layout performance metrics
- `GET /api/reports/generate` - Generate custom reports based on parameters

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete a notification

### Settings & System
- `GET /api/settings` - Get application settings
- `PUT /api/settings` - Update application settings
- `POST /api/backup` - Create a new backup
- `GET /api/backup` - Get list of backups
- `GET /api/backup/:id` - Download a specific backup
- `GET /api/logs` - Get activity logs

### AI Features
- `POST /api/ai/search` - Perform AI-powered search
- `POST /api/ai/generate-brochure` - Generate AI brochure for plots
- `POST /api/ai/whatsapp-template` - Generate WhatsApp message templates

## Data Models

The backend should implement models for:

1. Users (with role-based permissions)
2. Layouts
3. Plots
4. Expenses
5. Billings
6. Clients
7. Documents
8. Notifications
9. Activity Logs
10. Backups

## Security Considerations

- Implement JWT authentication
- Use role-based access control
- Ensure separate databases or strong isolation for "white" and "black" accounting data
- Encrypt sensitive data both at rest and in transit
- Implement proper rate limiting for API endpoints
- Set up CORS properly for production

## Contributing

Please read the contribution guidelines before submitting pull requests.

## License

This project is licensed under the [MIT License](LICENSE).
