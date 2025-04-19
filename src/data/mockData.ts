// Mock data for PS2 Real Estate Management System

// User roles
export type UserRole = "staff" | "black" | "admin";

// User interface
export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  avatar: string;
}

// Layout interface
export interface Layout {
  id: number;
  name: string;
  location: string;
  totalAcres: number;
  totalPlots: number;
  govRatePerSqft: number;
  blackRatePerSqft: number;
  createdBy: number;
  createdAt: string;
  blueprint: string;
}

// Plot status type
export type PlotStatus = "available" | "reserved" | "sold" | "pending";

// Plot interface
export interface Plot {
  id: number;
  plotNo: string;
  layoutId: number;
  areaInSqft: number;
  status: PlotStatus;
  clientId: number | null;
  govValue: number;
  blackValue: number;
}

// Payment type
export type PaymentType = "full" | "advance";

// Ledger type
export type LedgerType = "white" | "black";

// Bill interface
export interface Bill {
  id: number;
  plotId: number;
  clientId: number;
  areaInSqft: number;
  govValue: number;
  blackValue: number | null;
  paymentType: PaymentType;
  ledgerType: LedgerType;
  paidAmount: number;
  dueAmount: number;
  dueDate: string | null;
  notes: string;
  createdBy: number;
  createdAt: string;
}

// Expense type
export type ExpenseType = "credit" | "debit";

// Expense visibility
export type ExpenseVisibility = "white" | "black" | "both";

// Expense interface
export interface Expense {
  id: number;
  date: string;
  plotId: number | null;
  layoutId: number | null;
  type: ExpenseType;
  amount: number;
  description: string;
  visibility: ExpenseVisibility;
  createdBy: number;
}

// Client interface
export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  createdAt: string;
}

// Document type
export type DocumentType = "layout" | "plot" | "client" | "bill" | "expense";

// Document interface
export interface Document {
  id: number;
  name: string;
  type: DocumentType;
  relatedId: number;
  fileUrl: string;
  uploadedBy: number;
  uploadedAt: string;
}

// Log action type
export type LogActionType = "created" | "edited" | "deleted" | "viewed";

// Log interface
export interface Log {
  id: number;
  userId: number;
  action: LogActionType;
  resourceType: string;
  resourceId: number;
  details: string;
  timestamp: string;
}

// Backup status type
export type BackupStatus = "success" | "warning" | "error";

// Backup type
export type BackupType = "local" | "external" | "cloud";

// Backup interface
export interface Backup {
  id: number;
  type: BackupType;
  status: BackupStatus;
  size: string;
  timestamp: string;
  createdBy: number;
}

// Mock Users Data
export const users: User[] = [
  {
    id: 1,
    username: "staff",
    password: "staff123",
    name: "Staff User",
    role: "staff",
    avatar: "https://ui-avatars.com/api/?name=Staff+User&background=FFFFFF&color=000",
  },
  {
    id: 2,
    username: "black",
    password: "black123",
    name: "Black User",
    role: "black",
    avatar: "https://ui-avatars.com/api/?name=Black+User&background=000000&color=fff",
  },
  {
    id: 3,
    username: "admin",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=9333EA&color=fff",
  },
];

// Mock Layouts Data
export const layouts: Layout[] = [
  {
    id: 1,
    name: "Green Valley",
    location: "North Suburbs",
    totalAcres: 50,
    totalPlots: 120,
    govRatePerSqft: 1500,
    blackRatePerSqft: 2000,
    createdBy: 3,
    createdAt: "2023-01-15T08:30:00Z",
    blueprint: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Riverside Estate",
    location: "East City",
    totalAcres: 35,
    totalPlots: 80,
    govRatePerSqft: 2000,
    blackRatePerSqft: 2800,
    createdBy: 2,
    createdAt: "2023-03-10T10:15:00Z",
    blueprint: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Skyline Heights",
    location: "Central District",
    totalAcres: 25,
    totalPlots: 60,
    govRatePerSqft: 2500,
    blackRatePerSqft: 3500,
    createdBy: 3,
    createdAt: "2023-05-22T14:45:00Z",
    blueprint: "/placeholder.svg",
  },
  {
    id: 4,
    name: "Meadow Gardens",
    location: "South Valley",
    totalAcres: 40,
    totalPlots: 100,
    govRatePerSqft: 1800,
    blackRatePerSqft: 2400,
    createdBy: 1,
    createdAt: "2023-07-05T09:20:00Z",
    blueprint: "/placeholder.svg",
  },
];

// Mock Plots Data
export const plots: Plot[] = [
  // Green Valley Plots
  {
    id: 1,
    plotNo: "GV001",
    layoutId: 1,
    areaInSqft: 2000,
    status: "sold",
    clientId: 1,
    govValue: 3000000,
    blackValue: 4000000,
  },
  {
    id: 2,
    plotNo: "GV002",
    layoutId: 1,
    areaInSqft: 1800,
    status: "available",
    clientId: null,
    govValue: 2700000,
    blackValue: 3600000,
  },
  {
    id: 3,
    plotNo: "GV003",
    layoutId: 1,
    areaInSqft: 2200,
    status: "reserved",
    clientId: 2,
    govValue: 3300000,
    blackValue: 4400000,
  },
  {
    id: 4,
    plotNo: "GV004",
    layoutId: 1,
    areaInSqft: 1900,
    status: "pending",
    clientId: 3,
    govValue: 2850000,
    blackValue: 3800000,
  },
  
  // Riverside Estate Plots
  {
    id: 5,
    plotNo: "RE001",
    layoutId: 2,
    areaInSqft: 1500,
    status: "sold",
    clientId: 4,
    govValue: 3000000,
    blackValue: 4200000,
  },
  {
    id: 6,
    plotNo: "RE002",
    layoutId: 2,
    areaInSqft: 1600,
    status: "available",
    clientId: null,
    govValue: 3200000,
    blackValue: 4480000,
  },
  {
    id: 7,
    plotNo: "RE003",
    layoutId: 2,
    areaInSqft: 1700,
    status: "sold",
    clientId: 5,
    govValue: 3400000,
    blackValue: 4760000,
  },
  
  // Skyline Heights Plots
  {
    id: 8,
    plotNo: "SH001",
    layoutId: 3,
    areaInSqft: 1200,
    status: "sold",
    clientId: 6,
    govValue: 3000000,
    blackValue: 4200000,
  },
  {
    id: 9,
    plotNo: "SH002",
    layoutId: 3,
    areaInSqft: 1300,
    status: "pending",
    clientId: 7,
    govValue: 3250000,
    blackValue: 4550000,
  },
  
  // Meadow Gardens Plots
  {
    id: 10,
    plotNo: "MG001",
    layoutId: 4,
    areaInSqft: 1800,
    status: "available",
    clientId: null,
    govValue: 3240000,
    blackValue: 4320000,
  },
  {
    id: 11,
    plotNo: "MG002",
    layoutId: 4,
    areaInSqft: 1900,
    status: "reserved",
    clientId: 8,
    govValue: 3420000,
    blackValue: 4560000,
  },
];

// Mock Clients Data
export const clients: Client[] = [
  {
    id: 1,
    name: "John Doe",
    phone: "9876543210",
    email: "john.doe@example.com",
    address: "123 Main St, City",
    createdAt: "2023-02-10T09:30:00Z",
  },
  {
    id: 2,
    name: "Jane Smith",
    phone: "8765432109",
    email: "jane.smith@example.com",
    address: "456 Elm St, Town",
    createdAt: "2023-03-15T14:20:00Z",
  },
  {
    id: 3,
    name: "Michael Johnson",
    phone: "7654321098",
    email: "michael.j@example.com",
    address: "789 Oak St, Village",
    createdAt: "2023-04-05T11:45:00Z",
  },
  {
    id: 4,
    name: "Sarah Williams",
    phone: "6543210987",
    email: "sarah.w@example.com",
    address: "101 Pine St, County",
    createdAt: "2023-05-20T16:10:00Z",
  },
  {
    id: 5,
    name: "David Brown",
    phone: "5432109876",
    email: "david.b@example.com",
    address: "202 Maple St, District",
    createdAt: "2023-06-12T10:30:00Z",
  },
  {
    id: 6,
    name: "Lisa Davis",
    phone: "4321098765",
    email: "lisa.d@example.com",
    address: "303 Cedar St, Region",
    createdAt: "2023-07-08T13:15:00Z",
  },
  {
    id: 7,
    name: "Robert Miller",
    phone: "3210987654",
    email: "robert.m@example.com",
    address: "404 Birch St, Area",
    createdAt: "2023-08-18T15:40:00Z",
  },
  {
    id: 8,
    name: "Emily Wilson",
    phone: "2109876543",
    email: "emily.w@example.com",
    address: "505 Walnut St, Zone",
    createdAt: "2023-09-25T08:50:00Z",
  },
];

// Mock Bills Data
export const bills: Bill[] = [
  {
    id: 1,
    plotId: 1,
    clientId: 1,
    areaInSqft: 2000,
    govValue: 3000000,
    blackValue: 4000000,
    paymentType: "full",
    ledgerType: "white",
    paidAmount: 3000000,
    dueAmount: 0,
    dueDate: null,
    notes: "Full payment received",
    createdBy: 1,
    createdAt: "2023-02-15T10:30:00Z",
  },
  {
    id: 2,
    plotId: 3,
    clientId: 2,
    areaInSqft: 2200,
    govValue: 3300000,
    blackValue: 4400000,
    paymentType: "advance",
    ledgerType: "white",
    paidAmount: 1000000,
    dueAmount: 2300000,
    dueDate: "2023-08-15T00:00:00Z",
    notes: "Advance payment received",
    createdBy: 1,
    createdAt: "2023-03-20T14:15:00Z",
  },
  {
    id: 3,
    plotId: 4,
    clientId: 3,
    areaInSqft: 1900,
    govValue: 2850000,
    blackValue: 3800000,
    paymentType: "advance",
    ledgerType: "black",
    paidAmount: 1500000,
    dueAmount: 2300000,
    dueDate: "2023-09-30T00:00:00Z",
    notes: "Advance payment received #PS2",
    createdBy: 2,
    createdAt: "2023-04-10T11:45:00Z",
  },
  {
    id: 4,
    plotId: 5,
    clientId: 4,
    areaInSqft: 1500,
    govValue: 3000000,
    blackValue: 4200000,
    paymentType: "full",
    ledgerType: "white",
    paidAmount: 3000000,
    dueAmount: 0,
    dueDate: null,
    notes: "Full payment received",
    createdBy: 1,
    createdAt: "2023-05-25T09:20:00Z",
  },
  {
    id: 5,
    plotId: 7,
    clientId: 5,
    areaInSqft: 1700,
    govValue: 3400000,
    blackValue: 4760000,
    paymentType: "full",
    ledgerType: "black",
    paidAmount: 4760000,
    dueAmount: 0,
    dueDate: null,
    notes: "Full payment received #PS2",
    createdBy: 2,
    createdAt: "2023-06-18T15:30:00Z",
  },
  {
    id: 6,
    plotId: 8,
    clientId: 6,
    areaInSqft: 1200,
    govValue: 3000000,
    blackValue: 4200000,
    paymentType: "advance",
    ledgerType: "white",
    paidAmount: 1500000,
    dueAmount: 1500000,
    dueDate: "2023-12-20T00:00:00Z",
    notes: "Advance payment received",
    createdBy: 1,
    createdAt: "2023-07-05T13:10:00Z",
  },
];

// Mock Expenses Data
export const expenses: Expense[] = [
  {
    id: 1,
    date: "2023-02-20T08:45:00Z",
    plotId: 1,
    layoutId: 1,
    type: "debit",
    amount: 500000,
    description: "Layout development expenses",
    visibility: "white",
    createdBy: 1,
  },
  {
    id: 2,
    date: "2023-03-25T10:30:00Z",
    plotId: 3,
    layoutId: 1,
    type: "debit",
    amount: 200000,
    description: "Road construction",
    visibility: "white",
    createdBy: 1,
  },
  {
    id: 3,
    date: "2023-04-15T14:20:00Z",
    plotId: null,
    layoutId: 2,
    type: "debit",
    amount: 300000,
    description: "Brokerage fee",
    visibility: "black",
    createdBy: 2,
  },
  {
    id: 4,
    date: "2023-05-30T09:15:00Z",
    plotId: 5,
    layoutId: 2,
    type: "credit",
    amount: 100000,
    description: "Refund from material supplier",
    visibility: "white",
    createdBy: 1,
  },
  {
    id: 5,
    date: "2023-06-22T11:40:00Z",
    plotId: null,
    layoutId: 3,
    type: "debit",
    amount: 450000,
    description: "Marketing expenses",
    visibility: "both",
    createdBy: 3,
  },
  {
    id: 6,
    date: "2023-07-10T16:30:00Z",
    plotId: 8,
    layoutId: 3,
    type: "debit",
    amount: 80000,
    description: "Legal fees",
    visibility: "black",
    createdBy: 2,
  },
];

// Mock Documents Data
export const documents: Document[] = [
  {
    id: 1,
    name: "Green Valley Blueprint.pdf",
    type: "layout",
    relatedId: 1,
    fileUrl: "/placeholder.svg",
    uploadedBy: 3,
    uploadedAt: "2023-01-20T09:30:00Z",
  },
  {
    id: 2,
    name: "Plot GV001 Deed.pdf",
    type: "plot",
    relatedId: 1,
    fileUrl: "/placeholder.svg",
    uploadedBy: 1,
    uploadedAt: "2023-02-18T14:15:00Z",
  },
  {
    id: 3,
    name: "John Doe ID Proof.pdf",
    type: "client",
    relatedId: 1,
    fileUrl: "/placeholder.svg",
    uploadedBy: 1,
    uploadedAt: "2023-02-18T14:20:00Z",
  },
  {
    id: 4,
    name: "Riverside Estate Approval.pdf",
    type: "layout",
    relatedId: 2,
    fileUrl: "/placeholder.svg",
    uploadedBy: 2,
    uploadedAt: "2023-03-15T11:45:00Z",
  },
  {
    id: 5,
    name: "Bill #3 Receipt.pdf",
    type: "bill",
    relatedId: 3,
    fileUrl: "/placeholder.svg",
    uploadedBy: 2,
    uploadedAt: "2023-04-12T10:30:00Z",
  },
  {
    id: 6,
    name: "Road Construction Invoice.pdf",
    type: "expense",
    relatedId: 2,
    fileUrl: "/placeholder.svg",
    uploadedBy: 1,
    uploadedAt: "2023-03-28T16:20:00Z",
  },
];

// Mock Logs Data
export const logs: Log[] = [
  {
    id: 1,
    userId: 3,
    action: "created",
    resourceType: "layout",
    resourceId: 1,
    details: "Created new layout: Green Valley",
    timestamp: "2023-01-15T08:30:00Z",
  },
  {
    id: 2,
    userId: 1,
    action: "created",
    resourceType: "bill",
    resourceId: 1,
    details: "Created new bill for plot GV001",
    timestamp: "2023-02-15T10:30:00Z",
  },
  {
    id: 3,
    userId: 1,
    action: "edited",
    resourceType: "plot",
    resourceId: 1,
    details: "Changed plot status from 'available' to 'sold'",
    timestamp: "2023-02-15T10:35:00Z",
  },
  {
    id: 4,
    userId: 2,
    action: "created",
    resourceType: "bill",
    resourceId: 3,
    details: "Created new bill for plot GV004 with black ledger entry",
    timestamp: "2023-04-10T11:45:00Z",
  },
  {
    id: 5,
    userId: 1,
    action: "created",
    resourceType: "expense",
    resourceId: 1,
    details: "Added new expense for layout development",
    timestamp: "2023-02-20T08:45:00Z",
  },
  {
    id: 6,
    userId: 3,
    action: "viewed",
    resourceType: "document",
    resourceId: 3,
    details: "Viewed client document: John Doe ID Proof.pdf",
    timestamp: "2023-03-05T09:15:00Z",
  },
  {
    id: 7,
    userId: 2,
    action: "deleted",
    resourceType: "document",
    resourceId: 0,
    details: "Deleted document: Plot RE004 Draft.pdf",
    timestamp: "2023-05-10T14:30:00Z",
  },
];

// Mock Backups Data
export const backups: Backup[] = [
  {
    id: 1,
    type: "local",
    status: "success",
    size: "250 MB",
    timestamp: "2023-04-01T00:00:00Z",
    createdBy: 3,
  },
  {
    id: 2,
    type: "external",
    status: "success",
    size: "250 MB",
    timestamp: "2023-04-01T00:15:00Z",
    createdBy: 3,
  },
  {
    id: 3,
    type: "cloud",
    status: "success",
    size: "250 MB",
    timestamp: "2023-04-01T00:30:00Z",
    createdBy: 3,
  },
  {
    id: 4,
    type: "local",
    status: "success",
    size: "275 MB",
    timestamp: "2023-05-01T00:00:00Z",
    createdBy: 3,
  },
  {
    id: 5,
    type: "external",
    status: "warning",
    size: "275 MB",
    timestamp: "2023-05-01T00:15:00Z",
    createdBy: 3,
  },
  {
    id: 6,
    type: "cloud",
    status: "success",
    size: "275 MB",
    timestamp: "2023-05-01T00:30:00Z",
    createdBy: 3,
  },
  {
    id: 7,
    type: "local",
    status: "success",
    size: "300 MB",
    timestamp: "2023-06-01T00:00:00Z",
    createdBy: 1,
  },
  {
    id: 8,
    type: "external",
    status: "success",
    size: "300 MB",
    timestamp: "2023-06-01T00:15:00Z",
    createdBy: 1,
  },
  {
    id: 9,
    type: "cloud",
    status: "error",
    size: "0 MB",
    timestamp: "2023-06-01T00:30:00Z",
    createdBy: 1,
  },
];

// Add these interfaces to match what components expect
export interface BillingForDisplay {
  id: number;
  date: string;
  invoiceNumber: string;
  clientName: string;
  layoutId: number;
  plotNumber: string;
  areaSqft: number;
  amount: number;
  ratePerSqft: number;
  isPaid: boolean;
  isBlackEntry: boolean;
  dueDate?: string;
  notes?: string;
  paymentType: string;
  transactions?: any[];
  clientPhone?: string;
  clientAddress?: string;
  clientGSTIN?: string;
}

export interface ClientForDisplay extends Client {
  plotsPurchased: number;
  totalSpent: number;
  dueAmount: number;
  status: 'active' | 'pending' | 'inactive';
}

export interface DocumentForDisplay extends Document {
  category: string;
  fileType: string;
  size: string;
  uploadDate: string;
  tags?: string[];
  layoutId?: number;
}

export interface ExpenseForDisplay extends Expense {
  layout: string;
  addedBy: string;
}

// Now update the getter functions to transform the data

// Get layouts
export const getLayouts = () => {
  return layouts;
};

// Get clients with additional display properties
export const getClients = (): ClientForDisplay[] => {
  return clients.map(client => {
    // Count plots purchased by this client
    const clientPlots = plots.filter(plot => plot.clientId === client.id);
    
    // Calculate total spent
    const clientBills = bills.filter(bill => bill.clientId === client.id);
    const totalSpent = clientBills.reduce((sum, bill) => sum + bill.paidAmount, 0);
    
    // Calculate due amount
    const dueAmount = clientBills.reduce((sum, bill) => sum + bill.dueAmount, 0);
    
    // Determine status based on arbitrary criteria
    let status: 'active' | 'pending' | 'inactive' = 'active';
    if (dueAmount > 0) status = 'pending';
    if (clientPlots.length === 0) status = 'inactive';
    
    return {
      ...client,
      plotsPurchased: clientPlots.length,
      totalSpent,
      dueAmount,
      status
    };
  });
};

// Get billings in format needed for display
export const getBillings = (): BillingForDisplay[] => {
  return bills.map(bill => {
    const plot = plots.find(p => p.id === bill.plotId);
    const client = clients.find(c => c.id === bill.clientId);
    const layout = plot ? layouts.find(l => l.id === plot.layoutId) : undefined;
    
    return {
      id: bill.id,
      date: bill.createdAt,
      invoiceNumber: `INV-${bill.id.toString().padStart(4, '0')}`,
      clientName: client?.name || "Unknown Client",
      layoutId: layout?.id || 0,
      plotNumber: plot?.plotNo || "Unknown",
      areaSqft: bill.areaInSqft,
      amount: bill.ledgerType === "white" ? bill.govValue : (bill.blackValue || 0),
      ratePerSqft: bill.areaInSqft > 0 ? 
        Math.round((bill.ledgerType === "white" ? bill.govValue : (bill.blackValue || 0)) / bill.areaInSqft) : 0,
      isPaid: bill.dueAmount === 0,
      isBlackEntry: bill.ledgerType === "black",
      paymentType: bill.paymentType,
      dueDate: bill.dueDate,
      notes: bill.notes,
      clientPhone: client?.phone,
      clientAddress: client?.address,
      clientGSTIN: client?.email,
      // Add mock transactions for some bills
      transactions: bill.id % 3 === 0 ? [
        {
          date: bill.createdAt,
          amount: bill.paidAmount,
          method: "Bank Transfer",
          reference: `REF${bill.id}${Math.floor(Math.random() * 10000)}`
        }
      ] : []
    };
  });
};

// Get expenses with formatted data
export const getExpenses = (): ExpenseForDisplay[] => {
  return expenses.map(expense => {
    const plot = expense.plotId ? plots.find(p => p.id === expense.plotId) : null;
    const layout = expense.layoutId 
      ? layouts.find(l => l.id === expense.layoutId) 
      : (plot ? layouts.find(l => l.id === plot.layoutId) : null);
    const user = users.find(u => u.id === expense.createdBy);
    
    return {
      ...expense,
      layout: layout ? layout.name : "General",
      addedBy: user ? user.name : "Unknown"
    };
  });
};

// Get documents with additional display properties
export const getDocuments = (): DocumentForDisplay[] => {
  const documentCategories: Record<DocumentType, string> = {
    'layout': 'layout',
    'plot': 'layout',
    'client': 'client',
    'bill': 'billing',
    'expense': 'expense'
  };
  
  const fileTypeMap: Record<string, string> = {
    '.pdf': 'pdf',
    '.jpg': 'image',
    '.png': 'image',
    '.xlsx': 'excel',
    '.csv': 'excel',
    '.doc': 'document',
    '.docx': 'document'
  };
  
  return documents.map(doc => {
    // Extract file extension from URL
    const fileExt = doc.fileUrl.substring(doc.fileUrl.lastIndexOf('.')) || '.pdf';
    const fileType = fileTypeMap[fileExt] || 'document';
    
    // Generate random size
    const size = `${Math.floor(Math.random() * 10) + 1} MB`;
    
    // Check if this is associated with a layout
    let layoutId;
    if (doc.type === 'layout') {
      layoutId = doc.related
