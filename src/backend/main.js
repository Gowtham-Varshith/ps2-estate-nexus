/**
 * PS2 Estate Nexus - Electron Main Process
 * 
 * This file serves as the entry point for the Electron application.
 * It sets up the main window, initializes the database, and establishes IPC communication.
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const DatabaseService = require('./database');

// Keep a global reference of objects to prevent garbage collection
let mainWindow;
let dbService;

// Create the main browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // Load the app
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../build/index.html'),
    protocol: 'file:',
    slashes: true
  });

  mainWindow.loadURL(startUrl);
  
  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize database and start app
async function init() {
  try {
    // Initialize database service
    dbService = new DatabaseService();
    await dbService.initialize();
    console.log('Database initialized successfully');
    
    // Create window
    createWindow();
  } catch (err) {
    console.error('Failed to initialize application:', err);
    dialog.showErrorBox(
      'Initialization Error',
      `Failed to initialize the application database: ${err.message}`
    );
    app.quit();
  }
}

// App lifecycle events
app.on('ready', init);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('quit', async () => {
  // Close database connection
  if (dbService) {
    await dbService.close();
  }
});

// IPC Handlers for API requests
ipcMain.handle('api-request', async (event, request) => {
  try {
    const { method, endpoint, data, token } = request;
    
    // Check if database is initialized
    if (!dbService || !dbService.initialized) {
      return { error: true, code: 'DATABASE_ERROR', message: 'Database not initialized' };
    }

    console.log(`API Request: ${method} ${endpoint}`);
    
    // Authentication routes
    if (endpoint.startsWith('/auth/')) {
      return handleAuthRequests(endpoint, method, data);
    }
    
    // For all other routes, verify token first
    if (!token) {
      return { error: true, code: 'UNAUTHORIZED', message: 'Authentication required' };
    }
    
    const decodedToken = dbService.verifyToken(token);
    
    if (!decodedToken) {
      return { error: true, code: 'UNAUTHORIZED', message: 'Invalid or expired token' };
    }
    
    // User routes
    if (endpoint.startsWith('/users/')) {
      return handleUserRequests(endpoint, method, data, decodedToken);
    }
    
    // Layout routes
    if (endpoint.startsWith('/layouts/')) {
      return handleLayoutRequests(endpoint, method, data, decodedToken);
    }
    
    // Plot routes
    if (endpoint.startsWith('/plots/')) {
      return handlePlotRequests(endpoint, method, data, decodedToken);
    }
    
    // Expense routes
    if (endpoint.startsWith('/expenses/')) {
      return handleExpenseRequests(endpoint, method, data, decodedToken);
    }
    
    // Billing routes
    if (endpoint.startsWith('/billings/')) {
      return handleBillingRequests(endpoint, method, data, decodedToken);
    }
    
    // Client routes
    if (endpoint.startsWith('/clients/')) {
      return handleClientRequests(endpoint, method, data, decodedToken);
    }
    
    // Document routes
    if (endpoint.startsWith('/documents/')) {
      return handleDocumentRequests(endpoint, method, data, decodedToken);
    }
    
    // Analytics routes
    if (endpoint.startsWith('/analytics/')) {
      return handleAnalyticsRequests(endpoint, method, data, decodedToken);
    }
    
    // Backup routes
    if (endpoint.startsWith('/backup/')) {
      return handleBackupRequests(endpoint, method, data, decodedToken);
    }
    
    // Settings routes
    if (endpoint.startsWith('/settings/')) {
      return handleSettingsRequests(endpoint, method, data, decodedToken);
    }
    
    // Notification routes
    if (endpoint.startsWith('/notifications/')) {
      return handleNotificationRequests(endpoint, method, data, decodedToken);
    }
    
    // Log routes
    if (endpoint.startsWith('/logs/')) {
      return handleLogRequests(endpoint, method, data, decodedToken);
    }
    
    // AI routes
    if (endpoint.startsWith('/ai/')) {
      return handleAIRequests(endpoint, method, data, decodedToken);
    }
    
    // Unknown endpoint
    return { error: true, code: 'NOT_FOUND', message: `Endpoint ${method} ${endpoint} not found` };
  } catch (err) {
    console.error('API request error:', err);
    return { error: true, code: 'INTERNAL_ERROR', message: err.message };
  }
});

// File upload handler
ipcMain.handle('upload-file', async (event, options) => {
  try {
    const { filePath, destination, entityType, entityId, userId } = options;
    
    if (!fs.existsSync(filePath)) {
      return { error: true, code: 'FILE_ERROR', message: 'File does not exist' };
    }
    
    const fileName = path.basename(filePath);
    const fileStats = fs.statSync(filePath);
    const fileSize = fileStats.size;
    
    // Determine file type
    const extname = path.extname(fileName).toLowerCase();
    let fileType = 'document';
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(extname)) {
      fileType = 'image';
    } else if (['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.webm'].includes(extname)) {
      fileType = 'video';
    }
    
    // Create destination directory if it doesn't exist
    const uploadDir = path.join(app.getPath('userData'), 'uploads', entityType, entityId.toString());
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Generate a unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;
    const destPath = path.join(uploadDir, uniqueFileName);
    
    // Copy the file
    fs.copyFileSync(filePath, destPath);
    
    // Add to database
    const result = await dbService.addAttachment(
      entityType,
      entityId,
      {
        filename: fileName,
        filepath: destPath,
        filetype: fileType,
        filesize: fileSize
      },
      userId
    );
    
    return result;
  } catch (err) {
    console.error('File upload error:', err);
    return { error: true, code: 'UPLOAD_ERROR', message: err.message };
  }
});

// File delete handler
ipcMain.handle('delete-file', async (event, options) => {
  try {
    const { id, userId } = options;
    
    const result = await dbService.deleteAttachment(id, userId);
    
    if (result.filepath && fs.existsSync(result.filepath)) {
      fs.unlinkSync(result.filepath);
    }
    
    return { success: true, changes: result.changes };
  } catch (err) {
    console.error('File delete error:', err);
    return { error: true, code: 'DELETE_ERROR', message: err.message };
  }
});

// Handle authentication requests
async function handleAuthRequests(endpoint, method, data) {
  try {
    if (endpoint === '/auth/login' && method === 'POST') {
      const { username, password, role } = data;
      return await dbService.authenticateUser(username, password, role);
    }
    
    if (endpoint === '/auth/refresh' && method === 'POST') {
      const { refreshToken } = data;
      return await dbService.refreshToken(refreshToken);
    }
    
    if (endpoint === '/auth/user' && method === 'GET') {
      // This is handled in the refresh token process
      return { error: true, code: 'UNAUTHORIZED', message: 'Invalid request' };
    }
    
    if (endpoint === '/auth/logout' && method === 'POST') {
      // Since we're not storing tokens server-side, just return success
      return { success: true };
    }
    
    return { error: true, code: 'NOT_FOUND', message: 'Auth endpoint not found' };
  } catch (err) {
    console.error('Auth API error:', err);
    return { error: true, code: 'AUTH_ERROR', message: err.message };
  }
}

// Handle user requests
async function handleUserRequests(endpoint, method, data, decodedToken) {
  try {
    // Check admin permissions
    if (decodedToken.role !== 'admin') {
      return { error: true, code: 'FORBIDDEN', message: 'Admin access required' };
    }
    
    // Get all users
    if (endpoint === '/users' && method === 'GET') {
      return await dbService.getUsers(data || {});
    }
    
    // Get single user
    if (endpoint.match(/^\/users\/\d+$/) && method === 'GET') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.getUserById(id);
    }
    
    // Create user
    if (endpoint === '/users' && method === 'POST') {
      return await dbService.createUser(data, decodedToken.id);
    }
    
    // Update user
    if (endpoint.match(/^\/users\/\d+$/) && method === 'PUT') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.updateUser(id, data, decodedToken.id);
    }
    
    // Delete user
    if (endpoint.match(/^\/users\/\d+$/) && method === 'DELETE') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.deleteUser(id, decodedToken.id);
    }
    
    return { error: true, code: 'NOT_FOUND', message: 'User endpoint not found' };
  } catch (err) {
    console.error('User API error:', err);
    return { error: true, code: 'USER_ERROR', message: err.message };
  }
}

// Handle layout requests
async function handleLayoutRequests(endpoint, method, data, decodedToken) {
  try {
    // Get all layouts
    if (endpoint === '/layouts' && method === 'GET') {
      return await dbService.getLayouts(data || {});
    }
    
    // Get single layout
    if (endpoint.match(/^\/layouts\/\d+$/) && method === 'GET') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.getLayoutById(id);
    }
    
    // Get layout plots
    if (endpoint.match(/^\/layouts\/\d+\/plots$/) && method === 'GET') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.getPlots({ layout_id: id });
    }
    
    // Create layout
    if (endpoint === '/layouts' && method === 'POST') {
      return await dbService.createLayout(data, decodedToken.id);
    }
    
    // Update layout
    if (endpoint.match(/^\/layouts\/\d+$/) && method === 'PUT') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.updateLayout(id, data, decodedToken.id);
    }
    
    // Delete layout
    if (endpoint.match(/^\/layouts\/\d+$/) && method === 'DELETE') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.deleteLayout(id, decodedToken.id);
    }
    
    return { error: true, code: 'NOT_FOUND', message: 'Layout endpoint not found' };
  } catch (err) {
    console.error('Layout API error:', err);
    return { error: true, code: 'LAYOUT_ERROR', message: err.message };
  }
}

// Handle plot requests
async function handlePlotRequests(endpoint, method, data, decodedToken) {
  try {
    // Get all plots
    if (endpoint === '/plots' && method === 'GET') {
      return await dbService.getPlots(data || {});
    }
    
    // Get single plot
    if (endpoint.match(/^\/plots\/\d+$/) && method === 'GET') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.getPlotById(id);
    }
    
    // Create plot
    if (endpoint === '/plots' && method === 'POST') {
      return await dbService.createPlot(data, decodedToken.id);
    }
    
    // Update plot
    if (endpoint.match(/^\/plots\/\d+$/) && method === 'PUT') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.updatePlot(id, data, decodedToken.id);
    }
    
    // Delete plot
    if (endpoint.match(/^\/plots\/\d+$/) && method === 'DELETE') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.deletePlot(id, decodedToken.id);
    }
    
    // Handle plot document operations
    if (endpoint.match(/^\/plots\/\d+\/documents$/) && method === 'GET') {
      const plotId = parseInt(endpoint.split('/')[2]);
      return await dbService.all(
        'SELECT * FROM attachments WHERE entity_type = ? AND entity_id = ?',
        ['plot', plotId]
      );
    }
    
    return { error: true, code: 'NOT_FOUND', message: 'Plot endpoint not found' };
  } catch (err) {
    console.error('Plot API error:', err);
    return { error: true, code: 'PLOT_ERROR', message: err.message };
  }
}

// Handle expense requests
async function handleExpenseRequests(endpoint, method, data, decodedToken) {
  try {
    // Get expense categories
    if (endpoint === '/expenses/categories' && method === 'GET') {
      return await dbService.getExpenseCategories();
    }
    
    // Get all expenses
    if (endpoint === '/expenses' && method === 'GET') {
      return await dbService.getExpenses(data || {});
    }
    
    // Get single expense
    if (endpoint.match(/^\/expenses\/\d+$/) && method === 'GET') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.getExpenseById(id);
    }
    
    // Create expense
    if (endpoint === '/expenses' && method === 'POST') {
      return await dbService.createExpense(data, decodedToken.id);
    }
    
    // Update expense
    if (endpoint.match(/^\/expenses\/\d+$/) && method === 'PUT') {
      const id = parseInt(endpoint.split('/')[2]);
      data.approved_by = data.status === 'approved' ? decodedToken.id : null;
      return await dbService.updateExpense(id, data, decodedToken.id);
    }
    
    // Delete expense
    if (endpoint.match(/^\/expenses\/\d+$/) && method === 'DELETE') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.deleteExpense(id, decodedToken.id);
    }
    
    return { error: true, code: 'NOT_FOUND', message: 'Expense endpoint not found' };
  } catch (err) {
    console.error('Expense API error:', err);
    return { error: true, code: 'EXPENSE_ERROR', message: err.message };
  }
}

// Handle billing requests
async function handleBillingRequests(endpoint, method, data, decodedToken) {
  try {
    // Get all billings
    if (endpoint === '/billings' && method === 'GET') {
      return await dbService.getBillings(data || {});
    }
    
    // Get single billing
    if (endpoint.match(/^\/billings\/\d+$/) && method === 'GET') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.getBillingById(id);
    }
    
    // Create billing
    if (endpoint === '/billings' && method === 'POST') {
      return await dbService.createBilling(data, decodedToken.id);
    }
    
    // Update billing
    if (endpoint.match(/^\/billings\/\d+$/) && method === 'PUT') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.updateBilling(id, data, decodedToken.id);
    }
    
    // Delete billing
    if (endpoint.match(/^\/billings\/\d+$/) && method === 'DELETE') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.deleteBilling(id, decodedToken.id);
    }
    
    // Add payment to billing
    if (endpoint.match(/^\/billings\/\d+\/payments$/) && method === 'POST') {
      const billingId = parseInt(endpoint.split('/')[2]);
      return await dbService.addPayment(billingId, data, decodedToken.id);
    }
    
    return { error: true, code: 'NOT_FOUND', message: 'Billing endpoint not found' };
  } catch (err) {
    console.error('Billing API error:', err);
    return { error: true, code: 'BILLING_ERROR', message: err.message };
  }
}

// Handle client requests
async function handleClientRequests(endpoint, method, data, decodedToken) {
  try {
    // Get all clients
    if (endpoint === '/clients' && method === 'GET') {
      return await dbService.getClients(data || {});
    }
    
    // Get single client
    if (endpoint.match(/^\/clients\/\d+$/) && method === 'GET') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.getClientById(id);
    }
    
    // Create client
    if (endpoint === '/clients' && method === 'POST') {
      return await dbService.createClient(data, decodedToken.id);
    }
    
    // Update client
    if (endpoint.match(/^\/clients\/\d+$/) && method === 'PUT') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.updateClient(id, data, decodedToken.id);
    }
    
    // Delete client
    if (endpoint.match(/^\/clients\/\d+$/) && method === 'DELETE') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.deleteClient(id, decodedToken.id);
    }
    
    return { error: true, code: 'NOT_FOUND', message: 'Client endpoint not found' };
  } catch (err) {
    console.error('Client API error:', err);
    return { error: true, code: 'CLIENT_ERROR', message: err.message };
  }
}

// Handle document requests
async function handleDocumentRequests(endpoint, method, data, decodedToken) {
  try {
    // Document operations will primarily use the upload-file and delete-file IPC handlers
    return { error: true, code: 'NOT_FOUND', message: 'Document endpoint not found' };
  } catch (err) {
    console.error('Document API error:', err);
    return { error: true, code: 'DOCUMENT_ERROR', message: err.message };
  }
}

// Handle analytics requests
async function handleAnalyticsRequests(endpoint, method, data, decodedToken) {
  try {
    // Get dashboard stats
    if (endpoint === '/analytics/dashboard' && method === 'GET') {
      return await dbService.getDashboardStats();
    }
    
    // Get plots sold chart data
    if (endpoint === '/analytics/plots-sold' && method === 'GET') {
      return await dbService.getPlotsSoldChartData(data?.period);
    }
    
    return { error: true, code: 'NOT_FOUND', message: 'Analytics endpoint not found' };
  } catch (err) {
    console.error('Analytics API error:', err);
    return { error: true, code: 'ANALYTICS_ERROR', message: err.message };
  }
}

// Handle backup requests
async function handleBackupRequests(endpoint, method, data, decodedToken) {
  try {
    // Create backup
    if (endpoint === '/backup' && method === 'POST') {
      return await dbService.createBackup(data?.type || 'local', decodedToken.id);
    }
    
    // Get backup logs
    if (endpoint === '/backup' && method === 'GET') {
      return await dbService.getBackupLogs();
    }
    
    // Restore from backup
    if (endpoint.match(/^\/backup\/\d+\/restore$/) && method === 'POST') {
      const logId = parseInt(endpoint.split('/')[2]);
      const backupLog = await dbService.get('SELECT filepath FROM backup_logs WHERE id = ?', [logId]);
      
      if (!backupLog || !backupLog.filepath) {
        return { error: true, code: 'NOT_FOUND', message: 'Backup not found' };
      }
      
      return await dbService.restoreFromBackup(backupLog.filepath, decodedToken.id);
    }
    
    return { error: true,code: 'NOT_FOUND', message: 'Backup endpoint not found' };
  } catch (err) {
    console.error('Backup API error:', err);
    return { error: true, code: 'BACKUP_ERROR', message: err.message };
  }
}

// Handle settings requests
async function handleSettingsRequests(endpoint, method, data, decodedToken) {
  try {
    // Get settings
    if (endpoint === '/settings' && method === 'GET') {
      return await dbService.getSettings();
    }
    
    // Update settings
    if (endpoint === '/settings' && method === 'PUT') {
      return await dbService.updateSettings(data, decodedToken.id);
    }
    
    return { error: true, code: 'NOT_FOUND', message: 'Settings endpoint not found' };
  } catch (err) {
    console.error('Settings API error:', err);
    return { error: true, code: 'SETTINGS_ERROR', message: err.message };
  }
}

// Handle notification requests
async function handleNotificationRequests(endpoint, method, data, decodedToken) {
  try {
    // Get user notifications
    if (endpoint === '/notifications' && method === 'GET') {
      return await dbService.getNotifications(decodedToken.id);
    }
    
    // Mark notification as read
    if (endpoint.match(/^\/notifications\/\d+$/) && method === 'PUT') {
      const id = parseInt(endpoint.split('/')[2]);
      return await dbService.markNotificationAsRead(id, decodedToken.id);
    }
    
    return { error: true, code: 'NOT_FOUND', message: 'Notification endpoint not found' };
  } catch (err) {
    console.error('Notification API error:', err);
    return { error: true, code: 'NOTIFICATION_ERROR', message: err.message };
  }
}

// Handle log requests
async function handleLogRequests(endpoint, method, data, decodedToken) {
  try {
    // Get activity logs
    if (endpoint === '/logs' && method === 'GET') {
      // Only admins can see all logs
      if (decodedToken.role !== 'admin') {
        data = { ...data, user_id: decodedToken.id };
      }
      
      return await dbService.getActivityLogs(data || {});
    }
    
    return { error: true, code: 'NOT_FOUND', message: 'Log endpoint not found' };
  } catch (err) {
    console.error('Log API error:', err);
    return { error: true, code: 'LOG_ERROR', message: err.message };
  }
}

// Handle AI requests
async function handleAIRequests(endpoint, method, data, decodedToken) {
  try {
    // AI features not implemented in the database layer
    // These would typically be external integrations
    return { error: true, code: 'NOT_IMPLEMENTED', message: 'AI features not implemented yet' };
  } catch (err) {
    console.error('AI API error:', err);
    return { error: true, code: 'AI_ERROR', message: err.message };
  }
}

// Export for testing
module.exports = app;
