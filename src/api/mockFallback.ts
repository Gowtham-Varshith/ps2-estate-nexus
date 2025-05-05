import { 
  users, 
  layouts, 
  plots, 
  expenses, 
  bills, 
  clients, 
  documents, 
  logs, 
  backups 
} from "@/data/mockData";

import { 
  getLayouts, 
  getClients, 
  getBillings, 
  getExpenses, 
  getDocuments,
  getDashboardStats, 
  getTopPerformingLayouts, 
  getActivityLogs, 
  getBackupLogs, 
  getPlotsSoldPerLayout
} from "@/data/mockData";

import { DocumentType } from "@/types/documentTypes";

const determineDocumentType = (filename: string): DocumentType => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'mkv'];
  
  if (imageExtensions.includes(extension)) {
    return 'image';
  } else if (videoExtensions.includes(extension)) {
    return 'video';
  } else {
    return 'document';
  }
};

// Mock API implementation that uses the mock data
// This is used when the app is not running in Electron or when the API is not available
export const mockData = {
  auth: {
    login: (data: any) => {
      const { username, password, role } = data;
      const user = users.find(
        (u) => u.username === username && u.password === password && u.role === role
      );
      
      if (user) {
        return {
          accessToken: "mock_access_token",
          refreshToken: "mock_refresh_token",
          user: { ...user, password: undefined }
        };
      }
      
      throw new Error("Invalid credentials");
    },
    
    logout: () => ({ success: true, message: "Successfully logged out" }),
    
    user: () => {
      // Get first user as mock
      const user = { ...users[0], password: undefined };
      return user;
    },
    
    refresh: () => ({
      accessToken: "new_mock_access_token",
      refreshToken: "mock_refresh_token",
    })
  },
  
  layouts: {
    '': (filters: any = {}) => {
      let result = [...layouts];
      
      // Apply filters if provided
      if (filters) {
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          result = result.filter(layout => 
            layout.name.toLowerCase().includes(searchTerm) || 
            layout.location.toLowerCase().includes(searchTerm)
          );
        }
        
        if (filters.location) {
          result = result.filter(layout => 
            layout.location.toLowerCase().includes(filters.location.toLowerCase())
          );
        }
        
        if (filters.status) {
          // Mock implementation - we don't have status in our mock data
        }
      }
      
      // Pagination
      const page = filters.page ? parseInt(filters.page) : 1;
      const limit = filters.limit ? parseInt(filters.limit) : 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      
      const paginatedResult = result.slice(start, end);
      
      return {
        total: result.length,
        page,
        limit,
        data: paginatedResult
      };
    },
    
    '[id]': ({ id }: { id: number }) => {
      const layout = layouts.find(l => l.id === Number(id));
      if (!layout) throw new Error("Layout not found");
      
      const layoutPlots = plots.filter(p => p.layoutId === Number(id));
      const soldPlots = layoutPlots.filter(p => p.status === 'sold').length;
      
      return {
        ...layout,
        availablePlots: layoutPlots.length - soldPlots,
        soldPlots,
        totalPlots: layoutPlots.length,
        amenities: ["Clubhouse", "Park", "24/7 Security"],
        images: ["/placeholder.svg", "/placeholder.svg"],
        updatedAt: new Date().toISOString()
      };
    },
    
    '[id]/plots': ({ id }: { id: number }) => {
      return plots.filter(plot => plot.layoutId === Number(id));
    },
    
    '[id]/analytics': ({ id }: { id: number }) => {
      const layout = layouts.find(l => l.id === Number(id));
      if (!layout) throw new Error("Layout not found");
      
      const layoutPlots = plots.filter(p => p.layoutId === Number(id));
      const soldPlots = layoutPlots.filter(p => p.status === 'sold').length;
      const reservedPlots = layoutPlots.filter(p => p.status === 'reserved').length;
      
      return {
        totalPlots: layoutPlots.length,
        soldPlots,
        reservedPlots,
        availablePlots: layoutPlots.length - soldPlots - reservedPlots,
        salesByMonth: [
          { month: 'Jan', plots: Math.floor(Math.random() * 5) },
          { month: 'Feb', plots: Math.floor(Math.random() * 5) },
          { month: 'Mar', plots: Math.floor(Math.random() * 5) },
          { month: 'Apr', plots: Math.floor(Math.random() * 5) },
          { month: 'May', plots: Math.floor(Math.random() * 5) },
          { month: 'Jun', plots: Math.floor(Math.random() * 5) }
        ],
        revenue: {
          gov: layout.govRatePerSqft * layout.totalAcres * 43560 * 0.6, // 60% of total area
          black: layout.blackRatePerSqft * layout.totalAcres * 43560 * 0.6 // 60% of total area
        }
      };
    }
  },
  
  plots: {
    '': (filters: any = {}) => {
      let result = [...plots];
      
      // Apply filters if provided
      if (filters) {
        if (filters.layoutId) {
          result = result.filter(plot => plot.layoutId === Number(filters.layoutId));
        }
        
        if (filters.status) {
          if (Array.isArray(filters.status)) {
            result = result.filter(plot => filters.status.includes(plot.status));
          } else {
            result = result.filter(plot => plot.status === filters.status);
          }
        }
        
        if (filters.minArea) {
          result = result.filter(plot => plot.areaInSqft >= Number(filters.minArea));
        }
        
        if (filters.maxArea) {
          result = result.filter(plot => plot.areaInSqft <= Number(filters.maxArea));
        }

        if (filters.minPrice) {
          result = result.filter(plot => plot.govValue >= Number(filters.minPrice));
        }
        
        if (filters.maxPrice) {
          result = result.filter(plot => plot.govValue <= Number(filters.maxPrice));
        }
        
        if (filters.facing) {
          // Mock implementation - we don't have facing in our mock data
        }
      }
      
      // Add layout name to each plot
      const enrichedPlots = result.map(plot => {
        const layout = layouts.find(l => l.id === plot.layoutId);
        return {
          ...plot,
          layoutName: layout ? layout.name : "Unknown",
        };
      });
      
      // Pagination
      const page = filters.page ? parseInt(filters.page) : 1;
      const limit = filters.limit ? parseInt(filters.limit) : 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      
      const paginatedResult = enrichedPlots.slice(start, end);
      
      return {
        total: result.length,
        page,
        limit,
        data: paginatedResult
      };
    },
    
    '[id]': ({ id }: { id: number }) => {
      const plot = plots.find(p => p.id === Number(id));
      if (!plot) throw new Error("Plot not found");
      
      const layout = layouts.find(l => l.id === plot.layoutId);
      const client = plot.clientId ? clients.find(c => c.id === plot.clientId) : null;
      
      // Generate more detailed plot data
      return {
        ...plot,
        dimensions: `${Math.floor(Math.sqrt(plot.areaInSqft))}ft x ${Math.ceil(plot.areaInSqft / Math.floor(Math.sqrt(plot.areaInSqft)))}ft`,
        facing: ["North", "South", "East", "West"][Math.floor(Math.random() * 4)],
        isPrime: Math.random() > 0.5,
        description: "Premium plot with excellent connectivity and amenities nearby.",
        layout: {
          id: layout?.id || 0,
          name: layout?.name || "Unknown",
          location: layout?.location || "Unknown",
        },
        client: client ? {
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email
        } : null,
        documents: documents
          .filter(doc => doc.type === "plot" && doc.relatedId === Number(id))
          .map(doc => ({
            id: doc.id,
            name: doc.name,
            size: `${Math.floor(Math.random() * 10) + 1} MB`,
            type: determineDocumentType(doc.name),
            url: doc.fileUrl,
            uploadDate: doc.uploadedAt.split('T')[0]
          })),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString()
      };
    },
    
    '[id]/documents': ({ id }: { id: number }) => {
      return documents
        .filter(doc => doc.type === "plot" && doc.relatedId === Number(id))
        .map(doc => ({
          id: doc.id,
          name: doc.name,
          size: `${Math.floor(Math.random() * 10) + 1} MB`,
          type: determineDocumentType(doc.name),
          url: doc.fileUrl,
          uploadDate: doc.uploadedAt.split('T')[0]
        }));
    }
  },
  
  expenses: {
    '': (filters: any = {}) => {
      let result = [...expenses];
      
      // Apply filters if provided
      if (filters) {
        if (filters.startDate) {
          result = result.filter(expense => 
            new Date(expense.date) >= new Date(filters.startDate)
          );
        }
        
        if (filters.endDate) {
          result = result.filter(expense => 
            new Date(expense.date) <= new Date(filters.endDate)
          );
        }
        
        if (filters.category && filters.category.length) {
          // Mock implementation - we don't have categories in our mock data
        }
        
        if (filters.vendor && filters.vendor.length) {
          // Mock implementation - we don't have vendors in our mock data
        }
        
        if (filters.minAmount) {
          result = result.filter(expense => expense.amount >= Number(filters.minAmount));
        }
        
        if (filters.maxAmount) {
          result = result.filter(expense => expense.amount <= Number(filters.maxAmount));
        }
        
        if (filters.layout && filters.layout.length) {
          result = result.filter(expense => 
            filters.layout.includes(String(expense.layoutId))
          );
        }
        
        if (filters.status && filters.status.length) {
          // Mock implementation - we don't have status in our mock data
        }
      }
      
      // Pagination
      const page = filters.page ? parseInt(filters.page) : 1;
      const limit = filters.limit ? parseInt(filters.limit) : 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      
      const enrichedExpenses = result.map(expense => {
        const layout = expense.layoutId ? layouts.find(l => l.id === expense.layoutId) : null;
        const plot = expense.plotId ? plots.find(p => p.id === expense.plotId) : null;
        const user = users.find(u => u.id === expense.createdBy);
        
        return {
          ...expense,
          layoutName: layout ? layout.name : null,
          plotNumber: plot ? plot.plotNo : null,
          createdByName: user ? user.name : "Unknown",
          vendor: ["ABC Constructions", "XYZ Suppliers", "City Materials", "Tech Solutions"][Math.floor(Math.random() * 4)],
          status: ["pending", "approved", "rejected"][Math.floor(Math.random() * 3)],
        };
      });
      
      const paginatedResult = enrichedExpenses.slice(start, end);
      
      return {
        total: result.length,
        page,
        limit,
        data: paginatedResult
      };
    },
    
    '[id]': ({ id }: { id: number }) => {
      const expense = expenses.find(e => e.id === Number(id));
      if (!expense) throw new Error("Expense not found");
      
      const layout = expense.layoutId ? layouts.find(l => l.id === expense.layoutId) : null;
      const plot = expense.plotId ? plots.find(p => p.id === expense.plotId) : null;
      const user = users.find(u => u.id === expense.createdBy);
      
      return {
        ...expense,
        layoutName: layout ? layout.name : null,
        plotNumber: plot ? plot.plotNo : null,
        createdByName: user ? user.name : "Unknown",
        vendor: ["ABC Constructions", "XYZ Suppliers", "City Materials", "Tech Solutions"][Math.floor(Math.random() * 4)],
        status: ["pending", "approved", "rejected"][Math.floor(Math.random() * 3)],
        attachments: documents
          .filter(doc => doc.type === "expense" && doc.relatedId === Number(id))
          .map(doc => doc.fileUrl),
        tags: ["important", "urgent", "reviewed"].filter(() => Math.random() > 0.5),
        govPrice: expense.amount * 0.8,
        marketPrice: expense.amount,
        isBlack: expense.visibility === "black" || expense.visibility === "both"
      };
    },
    
    'categories': () => {
      return [
        {
          id: 1,
          name: "Construction",
          icon: "building",
          description: "Construction-related expenses"
        },
        {
          id: 2,
          name: "Legal",
          icon: "scale",
          description: "Legal fees and documentation expenses"
        },
        {
          id: 3,
          name: "Marketing",
          icon: "megaphone",
          description: "Marketing and promotion expenses"
        },
        {
          id: 4,
          name: "Administrative",
          icon: "file-text",
          description: "Office and administrative expenses"
        },
        {
          id: 5,
          name: "Labor",
          icon: "users",
          description: "Labor and workforce expenses"
        },
        {
          id: 6,
          name: "Materials",
          icon: "package",
          description: "Building and construction materials"
        },
        {
          id: 7,
          name: "Utilities",
          icon: "zap",
          description: "Water, electricity, and other utilities"
        },
        {
          id: 8,
          name: "Transportation",
          icon: "truck",
          description: "Transportation and logistics expenses"
        },
        {
          id: 9,
          name: "Miscellaneous",
          icon: "more-horizontal",
          description: "Other miscellaneous expenses"
        }
      ];
    }
  },
  
  billings: {
    '': (filters: any = {}) => {
      let result = [...bills];
      
      // Apply filters if provided
      if (filters) {
        if (filters.startDate) {
          result = result.filter(bill => 
            new Date(bill.createdAt) >= new Date(filters.startDate)
          );
        }
        
        if (filters.endDate) {
          result = result.filter(bill => 
            new Date(bill.createdAt) <= new Date(filters.endDate)
          );
        }
        
        if (filters.clientId) {
          result = result.filter(bill => bill.clientId === Number(filters.clientId));
        }
        
        if (filters.layoutId) {
          result = result.filter(bill => {
            const plot = plots.find(p => p.id === bill.plotId);
            return plot && plot.layoutId === Number(filters.layoutId);
          });
        }
        
        if (filters.status) {
          if (filters.status === 'paid') {
            result = result.filter(bill => bill.dueAmount === 0);
          } else if (filters.status === 'due') {
            result = result.filter(bill => bill.dueAmount > 0);
          }
        }
        
        if (filters.ledgerType) {
          result = result.filter(bill => bill.ledgerType === filters.ledgerType);
        }
      }
      
      // Enrich billing data with related information
      const enrichedBills = result.map(bill => {
        const plot = plots.find(p => p.id === bill.plotId);
        const client = clients.find(c => c.id === bill.clientId);
        const layout = plot ? layouts.find(l => l.id === plot.layoutId) : null;
        
        return {
          ...bill,
          invoiceNumber: `INV-${bill.id.toString().padStart(4, '0')}`,
          plotNumber: plot ? plot.plotNo : "Unknown",
          clientName: client ? client.name : "Unknown",
          layoutName: layout ? layout.name : "Unknown",
          paid: bill.dueAmount === 0,
          transaction: {
            date: bill.createdAt,
            amount: bill.paidAmount,
            method: ["Bank Transfer", "Cash", "Cheque"][Math.floor(Math.random() * 3)],
            reference: `REF${bill.id}${Math.floor(Math.random() * 10000)}`
          }
        };
      });
      
      // Pagination
      const page = filters.page ? parseInt(filters.page) : 1;
      const limit = filters.limit ? parseInt(filters.limit) : 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      
      const paginatedResult = enrichedBills.slice(start, end);
      
      return {
        total: result.length,
        page,
        limit,
        data: paginatedResult
      };
    },
    
    '[id]': ({ id }: { id: number }) => {
      const bill = bills.find(b => b.id === Number(id));
      if (!bill) throw new Error("Bill not found");
      
      const plot = plots.find(p => p.id === bill.plotId);
      const client = clients.find(c => c.id === bill.clientId);
      const layout = plot ? layouts.find(l => l.id === plot.layoutId) : null;
      
      return {
        ...bill,
        invoiceNumber: `INV-${bill.id.toString().padStart(4, '0')}`,
        plotNumber: plot ? plot.plotNo : "Unknown",
        clientName: client ? client.name : "Unknown",
        clientPhone: client ? client.phone : "Unknown",
        clientAddress: client ? client.address : "Unknown",
        layoutName: layout ? layout.name : "Unknown",
        transactions: [
          {
            id: 1,
            date: bill.createdAt,
            amount: bill.paidAmount,
            method: ["Bank Transfer", "Cash", "Cheque"][Math.floor(Math.random() * 3)],
            reference: `REF${bill.id}${Math.floor(Math.random() * 10000)}`,
            notes: "Initial payment"
          }
        ]
      };
    }
  },
  
  clients: {
    '': (filters: any = {}) => {
      let result = [...clients];
      
      // Apply filters if provided
      if (filters) {
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          result = result.filter(client => 
            client.name.toLowerCase().includes(searchTerm) || 
            client.phone.toLowerCase().includes(searchTerm) ||
            (client.email && client.email.toLowerCase().includes(searchTerm))
          );
        }
      }
      
      // Enrich client data
      const enrichedClients = result.map(client => {
        const clientPlots = plots.filter(plot => plot.clientId === client.id);
        const plotsInfo = clientPlots.map(plot => {
          const layout = layouts.find(l => l.id === plot.layoutId);
          return {
            plotId: plot.id,
            plotNumber: plot.plotNo,
            layoutId: plot.layoutId,
            layoutName: layout ? layout.name : "Unknown",
            status: plot.status,
            value: plot.govValue
          };
        });
        
        const clientBillings = bills.filter(bill => bill.clientId === client.id);
        const totalSpent = clientBillings.reduce((sum, bill) => sum + bill.paidAmount, 0);
        const dueAmount = clientBillings.reduce((sum, bill) => sum + bill.dueAmount, 0);
        
        return {
          ...client,
          plotsCount: clientPlots.length,
          plots: plotsInfo,
          totalSpent,
          dueAmount,
          status: dueAmount > 0 ? 'pending' : 'active'
        };
      });
      
      // Pagination
      const page = filters.page ? parseInt(filters.page) : 1;
      const limit = filters.limit ? parseInt(filters.limit) : 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      
      const paginatedResult = enrichedClients.slice(start, end);
      
      return {
        total: result.length,
        page,
        limit,
        data: paginatedResult
      };
    },
    
    '[id]': ({ id }: { id: number }) => {
      const client = clients.find(c => c.id === Number(id));
      if (!client) throw new Error("Client not found");
      
      const clientPlots = plots.filter(plot => plot.clientId === client.id);
      const plotsInfo = clientPlots.map(plot => {
        const layout = layouts.find(l => l.id === plot.layoutId);
        return {
          plotId: plot.id,
          plotNumber: plot.plotNo,
          layoutId: plot.layoutId,
          layoutName: layout ? layout.name : "Unknown",
          status: plot.status,
          value: plot.govValue,
          areaInSqft: plot.areaInSqft
        };
      });
      
      const clientBillings = bills.filter(bill => bill.clientId === client.id);
      const totalSpent = clientBillings.reduce((sum, bill) => sum + bill.paidAmount, 0);
      const dueAmount = clientBillings.reduce((sum, bill) => sum + bill.dueAmount, 0);
      
      return {
        ...client,
        plotsCount: clientPlots.length,
        plots: plotsInfo,
        billings: clientBillings.map(bill => {
          const plot = plots.find(p => p.id === bill.plotId);
          return {
            id: bill.id,
            invoiceNumber: `INV-${bill.id.toString().padStart(4, '0')}`,
            date: bill.createdAt,
            plotNumber: plot ? plot.plotNo : "Unknown",
            amount: bill.paidAmount + bill.dueAmount,
            paidAmount: bill.paidAmount,
            dueAmount: bill.dueAmount,
            dueDate: bill.dueDate,
            status: bill.dueAmount === 0 ? 'paid' : 'due'
          };
        }),
        totalSpent,
        dueAmount,
        status: dueAmount > 0 ? 'pending' : 'active',
        documents: documents
          .filter(doc => doc.type === 'client' && doc.relatedId === Number(id))
          .map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.name.endsWith('.pdf') ? 'document' : 
                 doc.name.endsWith('.jpg') || doc.name.endsWith('.png') ? 'image' : 'other',
            url: doc.fileUrl,
            uploadDate: doc.uploadedAt.split('T')[0]
          })),
        interactions: Array(Math.floor(Math.random() * 5) + 1).fill(null).map((_, i) => ({
          id: i + 1,
          date: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
          type: ['call', 'meeting', 'email', 'site-visit'][Math.floor(Math.random() * 4)],
          notes: `Client ${['inquired about', 'showed interest in', 'requested details for', 'visited'][Math.floor(Math.random() * 4)]} ${['plot availability', 'pricing', 'payment options', 'amenities'][Math.floor(Math.random() * 4)]}.`,
          user: users[Math.floor(Math.random() * users.length)].name
        }))
      };
    },
    
    '[id]/interactions': ({ id }: { id: number }) => {
      const client = clients.find(c => c.id === Number(id));
      if (!client) throw new Error("Client not found");
      
      return Array(Math.floor(Math.random() * 10) + 1).fill(null).map((_, i) => ({
        id: i + 1,
        date: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
        type: ['call', 'meeting', 'email', 'site-visit'][Math.floor(Math.random() * 4)],
        notes: `Client ${['inquired about', 'showed interest in', 'requested details for', 'visited'][Math.floor(Math.random() * 4)]} ${['plot availability', 'pricing', 'payment options', 'amenities'][Math.floor(Math.random() * 4)]}.`,
        user: users[Math.floor(Math.random() * users.length)].name
      }));
    }
  },
  
  documents: {
    '': (filters: any = {}) => {
      let result = [...documents];
      
      // Apply filters
      if (filters) {
        if (filters.type) {
          result = result.filter(doc => doc.type === filters.type);
        }
        
        if (filters.relatedId) {
          result = result.filter(doc => doc.relatedId === Number(filters.relatedId));
        }
      }
      
      // Enrich document data
      const enrichedDocs = result.map(doc => {
        const user = users.find(u => u.id === doc.uploadedBy);
        let relatedName = "";
        
        switch (doc.type) {
          case "layout":
            const layout = layouts.find(l => l.id === doc.relatedId);
            relatedName = layout ? layout.name : "Unknown Layout";
            break;
          case "plot":
            const plot = plots.find(p => p.id === doc.relatedId);
            relatedName = plot ? plot.plotNo : "Unknown Plot";
            break;
          case "client":
            const client = clients.find(c => c.id === doc.relatedId);
            relatedName = client ? client.name : "Unknown Client";
            break;
          default:
            relatedName = `${doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} #${doc.relatedId}`;
        }
        
        return {
          ...doc,
          size: `${Math.floor(Math.random() * 10) + 1} MB`,
          uploadedByName: user ? user.name : "Unknown",
          relatedName,
          fileType: doc.name.split('.').pop() || 'unknown',
          thumbnailUrl: doc.fileUrl
        };
      });
      
      // Pagination
      const page = filters.page ? parseInt(filters.page) : 1;
      const limit = filters.limit ? parseInt(filters.limit) : 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      
      const paginatedResult = enrichedDocs.slice(start, end);
      
      return {
        total: result.length,
        page,
        limit,
        data: paginatedResult
      };
    },
    
    '[id]': ({ id }: { id: number }) => {
      const doc = documents.find(d => d.id === Number(id));
      if (!doc) throw new Error("Document not found");
      
      const user = users.find(u => u.id === doc.uploadedBy);
      let relatedName = "";
      let relatedUrl = "";
      
      switch (doc.type) {
        case "layout":
          const layout = layouts.find(l => l.id === doc.relatedId);
          relatedName = layout ? layout.name : "Unknown Layout";
          relatedUrl = `/layouts/${doc.relatedId}`;
          break;
        case "plot":
          const plot = plots.find(p => p.id === doc.relatedId);
          relatedName = plot ? plot.plotNo : "Unknown Plot";
          relatedUrl = `/plots/${doc.relatedId}`;
          break;
        case "client":
          const client = clients.find(c => c.id === doc.relatedId);
          relatedName = client ? client.name : "Unknown Client";
          relatedUrl = `/clients/${doc.relatedId}`;
          break;
        default:
          relatedName = `${doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} #${doc.relatedId}`;
          relatedUrl = `/${doc.type}s/${doc.relatedId}`;
      }
      
      return {
        ...doc,
        size: `${Math.floor(Math.random() * 10) + 1} MB`,
        uploadedByName: user ? user.name : "Unknown",
        relatedName,
        relatedUrl,
        fileType: doc.name.split('.').pop() || 'unknown',
        thumbnailUrl: doc.fileUrl,
        metadata: {
          dimensions: doc.type === 'image' ? `${Math.floor(Math.random() * 1000) + 500}x${Math.floor(Math.random() * 1000) + 500}` : null,
          duration: doc.type === 'video' ? `${Math.floor(Math.random() * 10) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : null,
          pages: doc.type === 'document' ? Math.floor(Math.random() * 20) + 1 : null
        }
      };
    }
  },
  
  analytics: {
    dashboard: () => {
      return {
        stats: getDashboardStats('admin'),
        topLayouts: getTopPerformingLayouts(),
        recentBillings: getBillings().slice(0, 5),
        recentExpenses: getExpenses().slice(0, 5),
        plotsSold: getPlotsSoldPerLayout(),
        todayActivities: getActivityLogs().slice(0, 5)
      };
    },
    
    sales: (filters: any = {}) => {
      // Mock sales data for charts
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      
      const monthlySales = months.map((month, index) => {
        // Generate more realistic data - higher values for recent months
        const factor = index <= currentMonth ? 
          1 - (0.05 * (currentMonth - index)) : 
          0.7 - (0.1 * (index - currentMonth));
        
        return {
          month,
          sales: Math.floor(Math.random() * 15 * Math.max(0.3, factor)) + 1,
          revenue: Math.floor((Math.random() * 5000000 * Math.max(0.3, factor)) / 100000) * 100000
        };
      });
      
      return {
        overall: {
          totalSales: monthlySales.reduce((sum, m) => sum + m.sales, 0),
          totalRevenue: monthlySales.reduce((sum, m) => sum + m.revenue, 0),
          targetAchievement: Math.floor(Math.random() * 30) + 70 // 70-100%
        },
        monthly: monthlySales,
        byLayout: layouts.map(layout => ({
          id: layout.id,
          name: layout.name,
          sales: Math.floor(Math.random() * 20) + 1,
          revenue: Math.floor((Math.random() * 10000000) / 100000) * 100000
        }))
      };
    },
    
    plots: (filters: any = {}) => {
      return {
        status: {
          available: plots.filter(p => p.status === 'available').length,
          reserved: plots.filter(p => p.status === 'reserved').length,
          sold: plots.filter(p => p.status === 'sold').length,
          pending: plots.filter(p => p.status === 'pending').length,
        },
        averagePrice: {
          gov: Math.floor(plots.reduce((sum, p) => sum + p.govValue, 0) / plots.length),
          black: Math.floor(plots.reduce((sum, p) => sum + (p.blackValue || 0), 0) / plots.length),
        },
        sizeDistribution: {
          small: plots.filter(p => p.areaInSqft < 1500).length,
          medium: plots.filter(p => p.areaInSqft >= 1500 && p.areaInSqft < 2000).length,
          large: plots.filter(p => p.areaInSqft >= 2000).length,
        },
        monthlySales: Array(12).fill(0).map((_, i) => ({
          month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
          count: Math.floor(Math.random() * 10)
        }))
      };
    },
    
    layouts: (filters: any = {}) => {
      return {
        total: layouts.length,
        occupancyRate: layouts.map(layout => {
          const layoutPlots = plots.filter(p => p.layoutId === layout.id);
          const soldPlots = layoutPlots.filter(p => p.status === 'sold').length;
          
          return {
            id: layout.id,
            name: layout.name,
            occupancy: layoutPlots.length > 0 ? Math.round((soldPlots / layoutPlots.length) * 100) : 0
          };
        }),
        revenue: layouts.map(layout => {
          const layoutPlots = plots.filter(p => p.layoutId === layout.id);
          const soldPlots = layoutPlots.filter(p => p.status === 'sold');
          
          return {
            id: layout.id,
            name: layout.name,
            govRevenue: soldPlots.reduce((sum, p) => sum + p.govValue, 0),
            blackRevenue: soldPlots.reduce((sum, p) => sum + (p.blackValue || 0), 0)
          };
        })
      };
    }
  },
  
  notifications: {
    '': () => {
      // Generate mock notifications
      return Array(10).fill(null).map((_, i) => ({
        id: i + 1,
        title: [
          "New plot sale completed",
          "Bill payment due tomorrow",
          "Layout report ready",
          "Expense approval needed",
          "Client meeting reminder",
          "Document uploaded",
          "Price update suggested",
          "Staff payment pending"
        ][Math.floor(Math.random() * 8)],
        description: `Notification details for item #${i + 1}`,
        date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.4 ? 'read' : 'unread',
        type: ["bill", "payment", "reminder", "alert", "expense", "warning", "info", "success", "error"][Math.floor(Math.random() * 9)],
        actionLabel: Math.random() > 0.5 ? "View Details" : undefined,
        actionUrl: Math.random() > 0.5 ? "/dashboard" : undefined,
        read: Math.random() > 0.4,
        action: Math.random() > 0.5 ? {
          label: "View Details",
          url: "/dashboard"
        } : undefined
      }));
    }
  },
  
  ai: {
    search: (data: any) => {
      const { query, filters } = data;
      
      let results: any[] = [];
      
      if (query.toLowerCase().includes('layout') || query.toLowerCase().includes('ps2')) {
        results.push({
          type: 'layout',
          id: 1,
          name: "PS2 Paradise",
          description: "Premium layout with river view",
          matchScore: 0.92,
          results: [
            { id: 1, title: "Green Valley", description: "Best-selling layout", url: "/layouts/1" },
            { id: 2, title: "Riverside Estate", description: "Luxury layout", url: "/layouts/2" }
          ]
        });
      }
      
      if (query.toLowerCase().includes('plot') || query.toLowerCase().includes('ps2')) {
        results.push({
          type: 'plot',
          id: 45,
          name: "PS2-C08",
          description: "Corner plot with direct river view",
          matchScore: 0.89,
          results: [
            { id: 1, title: "GV001", description: "Corner plot", url: "/plots/1" },
            { id: 2, title: "RE001", description: "Premium plot", url: "/plots/5" }
          ]
        });
      }
      
      if (query.toLowerCase().includes('expense') || query.toLowerCase().includes('bill')) {
        results.push({
          type: 'expense',
          id: 1,
          name: "Layout development expenses",
          description: "Major expenses for layout development",
          matchScore: 0.85,
          results: [
            { id: 1, title: "Layout development", description: "₹500,000", url: "/expenses/1" },
            { id: 2, title: "Road construction", description: "₹200,000", url: "/expenses/2" }
          ]
        });
      }
      
      if (query.toLowerCase().includes('client') || query.toLowerCase().includes('customer')) {
        results.push({
          type: 'client',
          id: 1,
          name: "John Doe",
          description: "Purchased plot GV001",
          matchScore: 0.82,
          results: [
            { id: 1, title: "John Doe", description: "Phone: 9876543210", url: "/clients/1" },
            { id: 2, title: "Jane Smith", description: "Phone: 8765432109", url: "/clients/2" }
          ]
        });
      }
      
      // If no specific results, provide generic ones
      if (results.length === 0) {
        results = [
          {
            type: 'layout',
            count: 3,
            results: [
              { id: 1, title: "Green Valley", description: "Best-selling layout", url: "/layouts/1" }
            ]
          },
          {
            type: 'plot',
            count: 5,
            results: [
              { id: 1, title: "GV001", description: "Corner plot", url: "/plots/1" }
            ]
          },
          {
            type: 'expense',
            count: 2,
            results: [
              { id: 1, title: "Layout development", description: "₹500,000", url: "/expenses/1" }
            ]
          }
        ];
      }
      
      return {
        query: query,
        results: results,
        suggestion: "Try searching for 'waterfront plots in PS2 layout'",
        totalMatches: results.reduce((sum, r) => sum + (r.results ? r.results.length : (r.count || 1)), 0)
      };
    },
    
    'generate-brochure': (data: any) => {
      const { plotId, style } = data;
      
      return {
        id: Math.floor(Math.random() * 1000) + 1,
        name: `Plot_${plotId}_AI_Brochure.pdf`,
        size: "2.1 MB",
        type: "document",
        url: "/documents/brochures/Plot_AI_Brochure.pdf",
        generatedAt: new Date().toISOString()
      };
    },
    
    'whatsapp-template': (data: any) => {
      return {
        message: `Template message for ${data.plotId || 'your plot'} in ${data.language || 'English'}`,
        preview: "This is how your message will look",
        success: true
      };
    }
  },
  
  backup: {
    '': () => {
      return getBackupLogs().map(backup => ({
        id: backup.id,
        type: backup.type,
        status: backup.status,
        size: backup.size,
        timestamp: `${backup.date} ${backup.time}`,
        createdBy: backup.user
      }));
    }
  },
  
  logs: {
    '': (filters: any = {}) => {
      return getActivityLogs().slice(0, 50);
    }
  }
};

export default mockData;
