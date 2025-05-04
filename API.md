
# PS2 Estate Nexus API Documentation

This document provides detailed specifications for the backend API endpoints needed to integrate with PS2 Estate Nexus.

## Authentication

### POST /api/auth/login
Authenticates a user and returns an access token.

**Request:**
```json
{
  "username": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### POST /api/auth/logout
Logs out the current user by invalidating their tokens.

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### GET /api/auth/user
Gets the current authenticated user's details.

**Response:**
```json
{
  "id": 1,
  "name": "User Name",
  "email": "user@example.com",
  "role": "admin",
  "permissions": ["read:all", "write:all"]
}
```

## Layouts

### GET /api/layouts
Retrieves a list of layouts with optional filtering parameters.

**Query Parameters:**
- `search` - Search term for layout name/description
- `location` - Filter by location
- `status` - Filter by status (active, inactive)
- `page` - Page number
- `limit` - Number of items per page

**Response:**
```json
{
  "total": 100,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": 1,
      "name": "PS2 Paradise",
      "location": "Outer Ring Road",
      "totalPlots": 120,
      "soldPlots": 45,
      "govRatePerSqft": 1200,
      "marketRatePerSqft": 1800,
      "totalArea": 240000,
      "status": "active",
      "createdAt": "2023-01-15T12:00:00Z"
    }
  ]
}
```

### GET /api/layouts/:id
Retrieves detailed information about a specific layout.

**Response:**
```json
{
  "id": 1,
  "name": "PS2 Paradise",
  "location": "Outer Ring Road",
  "description": "Premium layout with excellent connectivity",
  "totalPlots": 120,
  "soldPlots": 45,
  "availablePlots": 75,
  "govRatePerSqft": 1200,
  "marketRatePerSqft": 1800,
  "totalArea": 240000,
  "status": "active",
  "amenities": ["Clubhouse", "Park", "24/7 Security"],
  "images": ["url1", "url2"],
  "createdAt": "2023-01-15T12:00:00Z",
  "updatedAt": "2023-02-20T14:30:00Z"
}
```

### POST /api/layouts
Creates a new layout.

**Request:**
```json
{
  "name": "PS2 Heights",
  "location": "Electronic City",
  "description": "Premium layout with excellent connectivity",
  "govRatePerSqft": 1400,
  "marketRatePerSqft": 2100,
  "totalArea": 180000,
  "amenities": ["Clubhouse", "Park", "24/7 Security"]
}
```

**Response:**
```json
{
  "id": 2,
  "name": "PS2 Heights",
  "location": "Electronic City",
  "description": "Premium layout with excellent connectivity",
  "totalPlots": 0,
  "soldPlots": 0,
  "availablePlots": 0,
  "govRatePerSqft": 1400,
  "marketRatePerSqft": 2100,
  "totalArea": 180000,
  "status": "active",
  "amenities": ["Clubhouse", "Park", "24/7 Security"],
  "createdAt": "2023-05-20T10:15:00Z",
  "updatedAt": "2023-05-20T10:15:00Z"
}
```

## Plots

### GET /api/plots
Retrieves a list of plots with optional filtering parameters.

**Query Parameters:**
- `layoutId` - Filter by layout ID
- `status` - Filter by status (available, reserved, sold)
- `minArea` - Minimum area in square feet
- `maxArea` - Maximum area in square feet
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `facing` - Filter by facing direction
- `page` - Page number
- `limit` - Number of items per page

**Response:**
```json
{
  "total": 120,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": 1,
      "plotNumber": "PS2-A12",
      "layoutId": 1,
      "layoutName": "PS2 Paradise",
      "area": 1200,
      "areaUnit": "sqft",
      "dimensions": "40ft x 30ft",
      "facing": "East",
      "price": 4800000,
      "status": "available",
      "isPrime": true,
      "createdAt": "2023-01-20T12:00:00Z"
    }
  ]
}
```

### POST /api/plots/:id/documents
Upload documents to a specific plot.

**Request:**
Multipart form data with the following fields:
- `file` - The document file
- `type` - Document type (image, video, document)
- `description` - Optional description

**Response:**
```json
{
  "id": 1,
  "name": "Plot View Front.jpg",
  "size": "2.4 MB",
  "type": "image",
  "url": "/uploads/plots/1/plot-view-front.jpg",
  "uploadDate": "2023-04-12",
  "uploadedBy": "User Name"
}
```

## Expenses

### POST /api/expenses
Creates a new expense record.

**Request:**
```json
{
  "description": "Excavation for foundation",
  "category": "Construction",
  "vendor": "ABC Construction",
  "amount": 25000,
  "govPrice": 20000,
  "marketPrice": 25000,
  "date": "2023-05-15",
  "layoutId": 1,
  "plotNo": "PS2-A12",
  "isBlack": false,
  "paymentMode": "bank transfer",
  "notes": "First phase of construction",
  "attachments": []
}
```

**Response:**
```json
{
  "id": 1,
  "description": "Excavation for foundation",
  "category": "Construction",
  "vendor": "ABC Construction",
  "amount": 25000,
  "govPrice": 20000,
  "marketPrice": 25000,
  "date": "2023-05-15",
  "layoutId": 1,
  "layoutName": "PS2 Paradise", 
  "plotNo": "PS2-A12",
  "isBlack": false,
  "paymentMode": "bank transfer",
  "notes": "First phase of construction",
  "attachments": [],
  "status": "pending",
  "createdAt": "2023-05-15T14:30:00Z"
}
```

### GET /api/expenses/categories
Get all expense categories.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Construction",
    "icon": "building",
    "description": "Construction-related expenses"
  },
  {
    "id": 2,
    "name": "Legal",
    "icon": "scale",
    "description": "Legal fees and documentation expenses"
  }
]
```

## Billing

### POST /api/billings
Creates a new billing record.

**Request:**
```json
{
  "clientName": "John Doe",
  "clientPhone": "9988776655",
  "layoutId": 1,
  "plotId": 12,
  "area": 1200,
  "govRate": 1200,
  "totalGovValue": 1440000,
  "paymentType": "full",
  "includePoundPS2": true,
  "notes": "Payment received by cheque"
}
```

**Response:**
```json
{
  "id": 1,
  "billNumber": "PS2-B001",
  "clientName": "John Doe",
  "clientPhone": "9988776655",
  "layoutId": 1,
  "layoutName": "PS2 Paradise",
  "plotId": 12,
  "plotNumber": "PS2-A12",
  "area": 1200,
  "govRate": 1200,
  "totalGovValue": 1440000,
  "paymentType": "full",
  "status": "generated",
  "notes": "Payment received by cheque",
  "isBlack": true,
  "generatedBy": "User Name",
  "createdAt": "2023-05-20T15:45:00Z"
}
```

## AI Features

### POST /api/ai/search
Performs an AI-powered search across the system.

**Request:**
```json
{
  "query": "layouts with river view",
  "filters": {
    "type": ["layout", "plot"],
    "location": "Outer Ring Road"
  }
}
```

**Response:**
```json
{
  "query": "layouts with river view",
  "totalMatches": 5,
  "results": [
    {
      "type": "layout",
      "id": 3,
      "name": "PS2 Riverfront",
      "description": "Premium layout with river view",
      "matchScore": 0.92,
      "url": "/layouts/3"
    },
    {
      "type": "plot",
      "id": 45,
      "name": "PS2-C08",
      "description": "Corner plot with direct river view",
      "matchScore": 0.89,
      "url": "/plots/45"
    }
  ],
  "suggestion": "Try searching for 'waterfront properties'"
}
```

### POST /api/ai/generate-brochure
Generates an AI brochure for a plot.

**Request:**
```json
{
  "plotId": 12,
  "style": "premium",
  "includeMap": true,
  "includePhotos": true,
  "includeAmenities": true,
  "includePricing": true
}
```

**Response:**
```json
{
  "id": 1,
  "name": "PS2-A12_AI_Brochure.pdf",
  "size": "2.1 MB",
  "type": "document",
  "url": "/documents/brochures/PS2-A12_AI_Brochure.pdf",
  "generatedAt": "2023-05-20T16:30:00Z"
}
```

## Error Handling

All API endpoints should return appropriate HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses should follow this format:

```json
{
  "error": true,
  "code": "INVALID_INPUT",
  "message": "The request contains invalid parameters",
  "details": {
    "field": "email",
    "issue": "Must be a valid email address"
  }
}
```
