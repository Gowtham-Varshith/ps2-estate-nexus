
/**
 * PS2 Estate Nexus - Database Operations
 * 
 * This file provides the database interface and operations for the application.
 * It handles authentication, CRUD operations, and database management.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class DatabaseService {
  constructor() {
    this.db = null;
    this.initialized = false;
    this.JWT_SECRET = 'ps2-estate-nexus-secret-key';
    this.JWT_REFRESH_SECRET = 'ps2-estate-nexus-refresh-secret-key';
    this.TOKEN_EXPIRY = '1h';
    this.REFRESH_TOKEN_EXPIRY = '7d';
  }

  /**
   * Initialize the database connection and create tables if they don't exist
   */
  async initialize() {
    // Create user data directory if it doesn't exist
    const userDataPath = app.getPath('userData');
    const dbDir = path.join(userDataPath, 'database');
    
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    const dbPath = path.join(dbDir, 'ps2_estate.db');
    
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, async (err) => {
        if (err) {
          console.error('Database connection error:', err);
          reject(err);
          return;
        }
        
        // Enable foreign keys
        this.db.run('PRAGMA foreign_keys = ON');
        
        try {
          // Create all necessary tables
          await this.createTables();
          
          // Add default data if tables are empty
          await this.seedDefaultData();
          
          this.initialized = true;
          resolve();
        } catch (err) {
          console.error('Database initialization error:', err);
          reject(err);
        }
      });
    });
  }
  
  /**
   * Create all necessary database tables
   */
  async createTables() {
    return new Promise((resolve, reject) => {
      // SQL for creating tables
      const createTablesSql = `
        -- Users table for authentication and user management
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          role TEXT CHECK(role IN ('admin', 'black', 'staff')) NOT NULL,
          avatar TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP
        );

        -- Layouts table for storing layout/project information
        CREATE TABLE IF NOT EXISTS layouts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          location TEXT NOT NULL,
          total_area REAL NOT NULL,
          total_plots INTEGER NOT NULL,
          gst_number TEXT,
          registration_number TEXT,
          owner TEXT,
          survey_number TEXT,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_by INTEGER,
          updated_at TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (id)
        );

        -- Plots table for storing plot details within layouts
        CREATE TABLE IF NOT EXISTS plots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          layout_id INTEGER NOT NULL,
          plot_number TEXT NOT NULL,
          area REAL NOT NULL,
          unit TEXT CHECK(unit IN ('sqft', 'sqyd', 'sqm', 'acre', 'bigha', 'hectare')) NOT NULL DEFAULT 'sqft',
          facing TEXT,
          dimensions TEXT,
          price_per_unit REAL,
          total_price REAL,
          status TEXT CHECK(status IN ('available', 'booked', 'sold', 'hold', 'blocked')) NOT NULL DEFAULT 'available',
          client_id INTEGER,
          booking_date TIMESTAMP,
          sold_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP,
          description TEXT,
          FOREIGN KEY (layout_id) REFERENCES layouts (id) ON DELETE CASCADE,
          FOREIGN KEY (client_id) REFERENCES clients (id)
        );

        -- Expense categories for categorizing expenses
        CREATE TABLE IF NOT EXISTS expense_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Expenses table for expense tracking
        CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL NOT NULL,
          category_id INTEGER,
          description TEXT NOT NULL,
          expense_date TIMESTAMP NOT NULL,
          payment_mode TEXT,
          vendor TEXT,
          layout_id INTEGER,
          created_by INTEGER NOT NULL,
          approved_by INTEGER,
          status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP,
          notes TEXT,
          is_black BOOLEAN DEFAULT 0,
          market_price REAL,
          gov_price REAL,
          FOREIGN KEY (category_id) REFERENCES expense_categories (id),
          FOREIGN KEY (layout_id) REFERENCES layouts (id) ON DELETE SET NULL,
          FOREIGN KEY (created_by) REFERENCES users (id),
          FOREIGN KEY (approved_by) REFERENCES users (id)
        );

        -- Clients table for client information
        CREATE TABLE IF NOT EXISTS clients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          address TEXT,
          city TEXT,
          state TEXT,
          postal_code TEXT,
          pan_card TEXT,
          aadhar_number TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_by INTEGER,
          updated_at TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (id)
        );

        -- Billings table for billing records
        CREATE TABLE IF NOT EXISTS billings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id INTEGER NOT NULL,
          plot_id INTEGER,
          amount REAL NOT NULL,
          bill_date TIMESTAMP NOT NULL,
          due_date TIMESTAMP,
          status TEXT CHECK(status IN ('pending', 'paid', 'partial', 'overdue', 'cancelled')) NOT NULL DEFAULT 'pending',
          description TEXT,
          created_by INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES clients (id),
          FOREIGN KEY (plot_id) REFERENCES plots (id) ON DELETE SET NULL,
          FOREIGN KEY (created_by) REFERENCES users (id)
        );

        -- Payments table for payment records
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          billing_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          payment_date TIMESTAMP NOT NULL,
          payment_mode TEXT,
          reference_number TEXT,
          notes TEXT,
          created_by INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (billing_id) REFERENCES billings (id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users (id)
        );

        -- Attachments for documents and file attachments
        CREATE TABLE IF NOT EXISTS attachments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entity_type TEXT NOT NULL,
          entity_id INTEGER NOT NULL,
          filename TEXT NOT NULL,
          filepath TEXT NOT NULL,
          filetype TEXT NOT NULL,
          filesize INTEGER NOT NULL,
          uploaded_by INTEGER,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          description TEXT,
          FOREIGN KEY (uploaded_by) REFERENCES users (id)
        );

        -- Backup logs for backup history
        CREATE TABLE IF NOT EXISTS backup_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          backup_date TIMESTAMP NOT NULL,
          filepath TEXT NOT NULL,
          filesize INTEGER NOT NULL,
          backup_type TEXT NOT NULL,
          status TEXT NOT NULL,
          created_by INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          notes TEXT,
          FOREIGN KEY (created_by) REFERENCES users (id)
        );

        -- Activity logs for user activity tracking
        CREATE TABLE IF NOT EXISTS activity_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          action TEXT NOT NULL,
          entity_type TEXT,
          entity_id INTEGER,
          details TEXT,
          ip_address TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );

        -- Settings for application settings
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT NOT NULL,
          description TEXT,
          updated_by INTEGER,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (updated_by) REFERENCES users (id)
        );

        -- Notifications for user notifications
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          type TEXT CHECK(type IN ('bill', 'payment', 'reminder', 'alert', 'warning', 'info', 'success', 'error', 'expense')) NOT NULL,
          is_read BOOLEAN DEFAULT 0,
          action TEXT,
          action_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
      `;
      
      this.db.exec(createTablesSql, (err) => {
        if (err) {
          console.error('Error creating tables:', err);
          reject(err);
        } else {
          console.log('Database tables created successfully');
          resolve();
        }
      });
    });
  }
  
  /**
   * Seed default data into the database
   */
  async seedDefaultData() {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if users table is empty
        const userCount = await this.count('SELECT COUNT(*) FROM users');
        
        if (userCount === 0) {
          // Add default user accounts
          const saltRounds = 10;
          const adminHash = await bcrypt.hash('admin123', saltRounds);
          const blackHash = await bcrypt.hash('black123', saltRounds);
          const staffHash = await bcrypt.hash('staff123', saltRounds);
          
          await this.run(
            'INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)',
            ['admin', adminHash, 'Administrator', 'admin@ps2estate.com', 'admin']
          );
          
          await this.run(
            'INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)',
            ['black', blackHash, 'Black User', 'black@ps2estate.com', 'black']
          );
          
          await this.run(
            'INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)',
            ['staff', staffHash, 'Staff User', 'staff@ps2estate.com', 'staff']
          );
          
          console.log('Default users created');
        }
        
        // Check if expense categories table is empty
        const categoryCount = await this.count('SELECT COUNT(*) FROM expense_categories');
        
        if (categoryCount === 0) {
          // Add default expense categories
          const categories = [
            ['Labor', 'Wages and salaries for workers'],
            ['Materials', 'Construction and development materials'],
            ['Equipment', 'Tools and machinery'],
            ['Legal', 'Legal fees, documentation, and permits'],
            ['Marketing', 'Advertising and promotion'],
            ['Travel', 'Transportation and travel expenses'],
            ['Office', 'Office supplies and expenses'],
            ['Utilities', 'Electricity, water, and other utilities'],
            ['Maintenance', 'Property maintenance and repairs'],
            ['Miscellaneous', 'Other uncategorized expenses']
          ];
          
          for (const [name, description] of categories) {
            await this.run(
              'INSERT INTO expense_categories (name, description) VALUES (?, ?)',
              [name, description]
            );
          }
          
          console.log('Default expense categories created');
        }
        
        // Check if settings table is empty
        const settingsCount = await this.count('SELECT COUNT(*) FROM settings');
        
        if (settingsCount === 0) {
          // Add default settings
          const settings = [
            ['company_name', 'PS2 Estate Nexus', 'Company name displayed in the app'],
            ['default_measurement_unit', 'sqft', 'Default unit for area measurement'],
            ['currency_symbol', '₹', 'Currency symbol used throughout the app'],
            ['backup_frequency', 'daily', 'How often automatic backups should be created'],
            ['backup_retention', '30', 'Number of days to keep backups'],
            ['enable_notifications', 'true', 'Whether to enable system notifications'],
            ['auto_logout_minutes', '30', 'Minutes of inactivity before automatic logout']
          ];
          
          for (const [key, value, description] of settings) {
            await this.run(
              'INSERT INTO settings (key, value, description) VALUES (?, ?, ?)',
              [key, value, description]
            );
          }
          
          console.log('Default settings created');
        }
        
        resolve();
      } catch (err) {
        console.error('Error seeding default data:', err);
        reject(err);
      }
    });
  }
  
  /**
   * Close the database connection
   */
  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            this.db = null;
            this.initialized = false;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
  
  /**
   * Execute a database query with error handling
   */
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }
  
  /**
   * Execute a query and get the first row
   */
  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
  
  /**
   * Execute a query and get all rows
   */
  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  
  /**
   * Count rows from a query
   */
  async count(sql, params = []) {
    const result = await this.get(sql, params);
    return result ? Object.values(result)[0] : 0;
  }
  
  /**
   * Begin a transaction
   */
  async beginTransaction() {
    return this.run('BEGIN TRANSACTION');
  }
  
  /**
   * Commit a transaction
   */
  async commitTransaction() {
    return this.run('COMMIT');
  }
  
  /**
   * Rollback a transaction
   */
  async rollbackTransaction() {
    return this.run('ROLLBACK');
  }
  
  /**
   * Log user activity
   */
  async logActivity(userId, action, entityType, entityId, details) {
    return this.run(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, action, entityType, entityId, details, '127.0.0.1']
    );
  }
  
  /**
   * Authenticate a user and generate JWT token
   */
  async authenticateUser(username, password, role) {
    try {
      // Get user by username
      const user = await this.get('SELECT * FROM users WHERE username = ? AND role = ?', [username, role]);
      
      if (!user) {
        return { error: true, code: 'AUTH_FAILED', message: 'Invalid username or role' };
      }
      
      // Compare password
      const match = await bcrypt.compare(password, user.password);
      
      if (!match) {
        return { error: true, code: 'AUTH_FAILED', message: 'Invalid password' };
      }
      
      // Update last login time
      await this.run(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );
      
      // Generate tokens
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        this.JWT_SECRET,
        { expiresIn: this.TOKEN_EXPIRY }
      );
      
      const refreshToken = jwt.sign(
        { id: user.id, username: user.username },
        this.JWT_REFRESH_SECRET,
        { expiresIn: this.REFRESH_TOKEN_EXPIRY }
      );
      
      // Log activity
      await this.logActivity(user.id, 'login', 'user', user.id, 'User logged in');
      
      // Return user info and tokens
      return {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        accessToken,
        refreshToken
      };
    } catch (err) {
      console.error('Authentication error:', err);
      return { error: true, code: 'AUTH_ERROR', message: err.message };
    }
  }
  
  /**
   * Verify a JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (err) {
      return null;
    }
  }
  
  /**
   * Refresh an expired token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET);
      
      // Get user
      const user = await this.get('SELECT * FROM users WHERE id = ?', [decoded.id]);
      
      if (!user) {
        return { error: true, code: 'AUTH_FAILED', message: 'User not found' };
      }
      
      // Generate new access token
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        this.JWT_SECRET,
        { expiresIn: this.TOKEN_EXPIRY }
      );
      
      return {
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      };
    } catch (err) {
      return { error: true, code: 'AUTH_FAILED', message: 'Invalid refresh token' };
    }
  }
  
  /**
   * Get all users
   */
  async getUsers(filters = {}) {
    let sql = 'SELECT id, username, name, email, role, avatar, created_at, last_login FROM users';
    const params = [];
    const whereClauses = [];
    
    if (filters.role) {
      whereClauses.push('role = ?');
      params.push(filters.role);
    }
    
    if (filters.search) {
      whereClauses.push('(username LIKE ? OR name LIKE ? OR email LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    sql += ' ORDER BY name ASC';
    
    const users = await this.all(sql, params);
    return { users };
  }
  
  /**
   * Get user by ID
   */
  async getUserById(id) {
    const user = await this.get(
      'SELECT id, username, name, email, role, avatar, created_at, last_login FROM users WHERE id = ?',
      [id]
    );
    
    if (!user) {
      return { error: true, code: 'NOT_FOUND', message: 'User not found' };
    }
    
    return { user };
  }
  
  /**
   * Create a new user
   */
  async createUser(userData, createdById) {
    try {
      // Check if username or email already exists
      const existingUser = await this.get(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [userData.username, userData.email]
      );
      
      if (existingUser) {
        return { error: true, code: 'DUPLICATE', message: 'Username or email already exists' };
      }
      
      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);
      
      // Insert user
      const result = await this.run(
        'INSERT INTO users (username, password, name, email, role, avatar) VALUES (?, ?, ?, ?, ?, ?)',
        [
          userData.username,
          passwordHash,
          userData.name,
          userData.email,
          userData.role,
          userData.avatar || null
        ]
      );
      
      // Log activity
      await this.logActivity(
        createdById,
        'create',
        'user',
        result.lastID,
        `User ${userData.username} created`
      );
      
      return { id: result.lastID, success: true };
    } catch (err) {
      console.error('Error creating user:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Update a user
   */
  async updateUser(id, userData, updatedById) {
    try {
      // Check if user exists
      const user = await this.get('SELECT id FROM users WHERE id = ?', [id]);
      
      if (!user) {
        return { error: true, code: 'NOT_FOUND', message: 'User not found' };
      }
      
      // Check if email already exists for another user
      if (userData.email) {
        const existingUser = await this.get(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [userData.email, id]
        );
        
        if (existingUser) {
          return { error: true, code: 'DUPLICATE', message: 'Email already in use by another user' };
        }
      }
      
      // Construct update query dynamically
      const fields = [];
      const values = [];
      
      if (userData.name) {
        fields.push('name = ?');
        values.push(userData.name);
      }
      
      if (userData.email) {
        fields.push('email = ?');
        values.push(userData.email);
      }
      
      if (userData.role) {
        fields.push('role = ?');
        values.push(userData.role);
      }
      
      if (userData.avatar !== undefined) {
        fields.push('avatar = ?');
        values.push(userData.avatar);
      }
      
      if (userData.password) {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(userData.password, saltRounds);
        fields.push('password = ?');
        values.push(passwordHash);
      }
      
      if (fields.length === 0) {
        return { error: true, code: 'INVALID_DATA', message: 'No valid fields to update' };
      }
      
      // Add ID to values
      values.push(id);
      
      // Update user
      const result = await this.run(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      // Log activity
      await this.logActivity(
        updatedById,
        'update',
        'user',
        id,
        `User ID ${id} updated`
      );
      
      return { success: true, changes: result.changes };
    } catch (err) {
      console.error('Error updating user:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Delete a user
   */
  async deleteUser(id, deletedById) {
    try {
      // Check if user exists
      const user = await this.get('SELECT id, username FROM users WHERE id = ?', [id]);
      
      if (!user) {
        return { error: true, code: 'NOT_FOUND', message: 'User not found' };
      }
      
      // Delete user
      const result = await this.run('DELETE FROM users WHERE id = ?', [id]);
      
      // Log activity
      await this.logActivity(
        deletedById,
        'delete',
        'user',
        id,
        `User ${user.username} deleted`
      );
      
      return { success: true, changes: result.changes };
    } catch (err) {
      console.error('Error deleting user:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Get all layouts
   */
  async getLayouts(filters = {}) {
    let sql = `
      SELECT l.*, COUNT(p.id) as plot_count, 
      SUM(CASE WHEN p.status = 'available' THEN 1 ELSE 0 END) as available_plots,
      SUM(CASE WHEN p.status = 'sold' THEN 1 ELSE 0 END) as sold_plots,
      u.name as created_by_name
      FROM layouts l
      LEFT JOIN plots p ON l.id = p.layout_id
      LEFT JOIN users u ON l.created_by = u.id
    `;
    
    const params = [];
    const whereClauses = [];
    
    if (filters.search) {
      whereClauses.push('(l.name LIKE ? OR l.location LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (filters.owner) {
      whereClauses.push('l.owner LIKE ?');
      params.push(`%${filters.owner}%`);
    }
    
    if (filters.location) {
      whereClauses.push('l.location LIKE ?');
      params.push(`%${filters.location}%`);
    }
    
    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    sql += ' GROUP BY l.id ORDER BY l.name ASC';
    
    const layouts = await this.all(sql, params);
    return { layouts };
  }
  
  /**
   * Get layout by ID
   */
  async getLayoutById(id) {
    const layout = await this.get(
      `SELECT l.*, u.name as created_by_name 
      FROM layouts l
      LEFT JOIN users u ON l.created_by = u.id
      WHERE l.id = ?`,
      [id]
    );
    
    if (!layout) {
      return { error: true, code: 'NOT_FOUND', message: 'Layout not found' };
    }
    
    // Get plot statistics
    const stats = await this.get(
      `SELECT 
        COUNT(id) as total_plots,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_plots,
        SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold_plots,
        SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked_plots,
        SUM(CASE WHEN status = 'hold' THEN 1 ELSE 0 END) as hold_plots,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked_plots,
        SUM(CASE WHEN status = 'sold' THEN total_price ELSE 0 END) as total_sales
      FROM plots
      WHERE layout_id = ?`,
      [id]
    );
    
    return { layout: { ...layout, stats } };
  }
  
  /**
   * Create a new layout
   */
  async createLayout(layoutData, createdById) {
    try {
      // Insert layout
      const result = await this.run(
        `INSERT INTO layouts (
          name, location, total_area, total_plots, gst_number, registration_number, 
          owner, survey_number, description, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          layoutData.name,
          layoutData.location,
          layoutData.total_area,
          layoutData.total_plots,
          layoutData.gst_number || null,
          layoutData.registration_number || null,
          layoutData.owner || null,
          layoutData.survey_number || null,
          layoutData.description || null,
          createdById
        ]
      );
      
      // Log activity
      await this.logActivity(
        createdById,
        'create',
        'layout',
        result.lastID,
        `Layout ${layoutData.name} created`
      );
      
      return { id: result.lastID, success: true };
    } catch (err) {
      console.error('Error creating layout:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Update a layout
   */
  async updateLayout(id, layoutData, updatedById) {
    try {
      // Check if layout exists
      const layout = await this.get('SELECT id FROM layouts WHERE id = ?', [id]);
      
      if (!layout) {
        return { error: true, code: 'NOT_FOUND', message: 'Layout not found' };
      }
      
      // Construct update query dynamically
      const fields = [];
      const values = [];
      
      const updateableFields = [
        'name', 'location', 'total_area', 'total_plots', 'gst_number', 
        'registration_number', 'owner', 'survey_number', 'description'
      ];
      
      updateableFields.forEach(field => {
        if (layoutData[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(layoutData[field]);
        }
      });
      
      if (fields.length === 0) {
        return { error: true, code: 'INVALID_DATA', message: 'No valid fields to update' };
      }
      
      // Add updated_at
      fields.push('updated_at = CURRENT_TIMESTAMP');
      
      // Add ID to values
      values.push(id);
      
      // Update layout
      const result = await this.run(
        `UPDATE layouts SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      // Log activity
      await this.logActivity(
        updatedById,
        'update',
        'layout',
        id,
        `Layout ID ${id} updated`
      );
      
      return { success: true, changes: result.changes };
    } catch (err) {
      console.error('Error updating layout:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Delete a layout
   */
  async deleteLayout(id, deletedById) {
    try {
      // Check if layout exists
      const layout = await this.get('SELECT id, name FROM layouts WHERE id = ?', [id]);
      
      if (!layout) {
        return { error: true, code: 'NOT_FOUND', message: 'Layout not found' };
      }
      
      // Start transaction
      await this.beginTransaction();
      
      try {
        // Delete associated plots
        await this.run('DELETE FROM plots WHERE layout_id = ?', [id]);
        
        // Delete layout
        const result = await this.run('DELETE FROM layouts WHERE id = ?', [id]);
        
        // Log activity
        await this.logActivity(
          deletedById,
          'delete',
          'layout',
          id,
          `Layout ${layout.name} deleted`
        );
        
        // Commit transaction
        await this.commitTransaction();
        
        return { success: true, changes: result.changes };
      } catch (err) {
        // Rollback transaction on error
        await this.rollbackTransaction();
        throw err;
      }
    } catch (err) {
      console.error('Error deleting layout:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Get all plots
   */
  async getPlots(filters = {}) {
    let sql = `
      SELECT p.*, l.name as layout_name, c.name as client_name
      FROM plots p
      LEFT JOIN layouts l ON p.layout_id = l.id
      LEFT JOIN clients c ON p.client_id = c.id
    `;
    
    const params = [];
    const whereClauses = [];
    
    if (filters.layout_id) {
      whereClauses.push('p.layout_id = ?');
      params.push(filters.layout_id);
    }
    
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        whereClauses.push(`p.status IN (${filters.status.map(() => '?').join(', ')})`);
        params.push(...filters.status);
      } else {
        whereClauses.push('p.status = ?');
        params.push(filters.status);
      }
    }
    
    if (filters.client_id) {
      whereClauses.push('p.client_id = ?');
      params.push(filters.client_id);
    }
    
    if (filters.min_price) {
      whereClauses.push('p.total_price >= ?');
      params.push(filters.min_price);
    }
    
    if (filters.max_price) {
      whereClauses.push('p.total_price <= ?');
      params.push(filters.max_price);
    }
    
    if (filters.search) {
      whereClauses.push('(p.plot_number LIKE ? OR l.name LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    sql += ' ORDER BY p.layout_id, p.plot_number';
    
    const plots = await this.all(sql, params);
    return { plots };
  }
  
  /**
   * Get plot by ID
   */
  async getPlotById(id) {
    const plot = await this.get(
      `SELECT p.*, l.name as layout_name, c.name as client_name, c.phone as client_phone, c.email as client_email
      FROM plots p
      LEFT JOIN layouts l ON p.layout_id = l.id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.id = ?`,
      [id]
    );
    
    if (!plot) {
      return { error: true, code: 'NOT_FOUND', message: 'Plot not found' };
    }
    
    // Get documents related to the plot
    const documents = await this.all(
      `SELECT * FROM attachments WHERE entity_type = 'plot' AND entity_id = ?`,
      [id]
    );
    
    // Get transactions related to the plot
    const transactions = await this.all(
      `SELECT b.*, c.name as client_name, p.amount as payment_amount, p.payment_date, p.payment_mode
      FROM billings b
      LEFT JOIN clients c ON b.client_id = c.id
      LEFT JOIN payments p ON b.id = p.billing_id
      WHERE b.plot_id = ?
      ORDER BY b.bill_date DESC`,
      [id]
    );
    
    return { plot: { ...plot, documents, transactions } };
  }
  
  /**
   * Create a new plot
   */
  async createPlot(plotData, createdById) {
    try {
      // Check if layout exists
      const layout = await this.get('SELECT id FROM layouts WHERE id = ?', [plotData.layout_id]);
      
      if (!layout) {
        return { error: true, code: 'NOT_FOUND', message: 'Layout not found' };
      }
      
      // Insert plot
      const result = await this.run(
        `INSERT INTO plots (
          layout_id, plot_number, area, unit, facing, dimensions, price_per_unit, total_price,
          status, client_id, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          plotData.layout_id,
          plotData.plot_number,
          plotData.area,
          plotData.unit || 'sqft',
          plotData.facing || null,
          plotData.dimensions || null,
          plotData.price_per_unit || null,
          plotData.total_price || null,
          plotData.status || 'available',
          plotData.client_id || null,
          plotData.description || null
        ]
      );
      
      // If status is sold or booked, update the dates
      if (plotData.status === 'sold' || plotData.status === 'booked') {
        await this.run(
          `UPDATE plots SET 
            ${plotData.status === 'sold' ? 'sold_date' : 'booking_date'} = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [result.lastID]
        );
      }
      
      // Log activity
      await this.logActivity(
        createdById,
        'create',
        'plot',
        result.lastID,
        `Plot ${plotData.plot_number} created in layout ID ${plotData.layout_id}`
      );
      
      return { id: result.lastID, success: true };
    } catch (err) {
      console.error('Error creating plot:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Update a plot
   */
  async updatePlot(id, plotData, updatedById) {
    try {
      // Check if plot exists
      const plot = await this.get('SELECT id, status FROM plots WHERE id = ?', [id]);
      
      if (!plot) {
        return { error: true, code: 'NOT_FOUND', message: 'Plot not found' };
      }
      
      // Construct update query dynamically
      const fields = [];
      const values = [];
      
      const updateableFields = [
        'area', 'unit', 'facing', 'dimensions', 'price_per_unit', 'total_price',
        'client_id', 'description'
      ];
      
      updateableFields.forEach(field => {
        if (plotData[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(plotData[field]);
        }
      });
      
      // Special handling for status changes
      if (plotData.status !== undefined && plotData.status !== plot.status) {
        fields.push('status = ?');
        values.push(plotData.status);
        
        // If new status is sold or booked, update the dates
        if (plotData.status === 'sold') {
          fields.push('sold_date = CURRENT_TIMESTAMP');
        } else if (plotData.status === 'booked') {
          fields.push('booking_date = CURRENT_TIMESTAMP');
        }
      }
      
      if (fields.length === 0) {
        return { error: true, code: 'INVALID_DATA', message: 'No valid fields to update' };
      }
      
      // Add updated_at
      fields.push('updated_at = CURRENT_TIMESTAMP');
      
      // Add ID to values
      values.push(id);
      
      // Update plot
      const result = await this.run(
        `UPDATE plots SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      // Log activity
      await this.logActivity(
        updatedById,
        'update',
        'plot',
        id,
        `Plot ID ${id} updated`
      );
      
      return { success: true, changes: result.changes };
    } catch (err) {
      console.error('Error updating plot:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Delete a plot
   */
  async deletePlot(id, deletedById) {
    try {
      // Check if plot exists
      const plot = await this.get(
        'SELECT id, plot_number, layout_id FROM plots WHERE id = ?',
        [id]
      );
      
      if (!plot) {
        return { error: true, code: 'NOT_FOUND', message: 'Plot not found' };
      }
      
      // Check if plot has billings
      const billingCount = await this.count(
        'SELECT COUNT(*) FROM billings WHERE plot_id = ?',
        [id]
      );
      
      if (billingCount > 0) {
        return {
          error: true,
          code: 'CONSTRAINT',
          message: 'Cannot delete plot with associated billings'
        };
      }
      
      // Start transaction
      await this.beginTransaction();
      
      try {
        // Delete attachments
        await this.run(
          'DELETE FROM attachments WHERE entity_type = ? AND entity_id = ?',
          ['plot', id]
        );
        
        // Delete plot
        const result = await this.run('DELETE FROM plots WHERE id = ?', [id]);
        
        // Log activity
        await this.logActivity(
          deletedById,
          'delete',
          'plot',
          id,
          `Plot ${plot.plot_number} deleted from layout ID ${plot.layout_id}`
        );
        
        // Commit transaction
        await this.commitTransaction();
        
        return { success: true, changes: result.changes };
      } catch (err) {
        // Rollback transaction on error
        await this.rollbackTransaction();
        throw err;
      }
    } catch (err) {
      console.error('Error deleting plot:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Get all expense categories
   */
  async getExpenseCategories() {
    const categories = await this.all('SELECT * FROM expense_categories ORDER BY name');
    return { categories };
  }
  
  /**
   * Create a new expense category
   */
  async createExpenseCategory(categoryData, createdById) {
    try {
      // Check if category name already exists
      const existing = await this.get(
        'SELECT id FROM expense_categories WHERE name = ?',
        [categoryData.name]
      );
      
      if (existing) {
        return { error: true, code: 'DUPLICATE', message: 'Category name already exists' };
      }
      
      // Insert category
      const result = await this.run(
        'INSERT INTO expense_categories (name, description) VALUES (?, ?)',
        [categoryData.name, categoryData.description || null]
      );
      
      // Log activity
      await this.logActivity(
        createdById,
        'create',
        'expense_category',
        result.lastID,
        `Expense category ${categoryData.name} created`
      );
      
      return { id: result.lastID, success: true };
    } catch (err) {
      console.error('Error creating expense category:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Get all expenses
   */
  async getExpenses(filters = {}) {
    let sql = `
      SELECT e.*, c.name as category_name, l.name as layout_name, 
        u1.name as created_by_name, u2.name as approved_by_name
      FROM expenses e
      LEFT JOIN expense_categories c ON e.category_id = c.id
      LEFT JOIN layouts l ON e.layout_id = l.id
      LEFT JOIN users u1 ON e.created_by = u1.id
      LEFT JOIN users u2 ON e.approved_by = u2.id
    `;
    
    const params = [];
    const whereClauses = [];
    
    if (filters.layout_id) {
      whereClauses.push('e.layout_id = ?');
      params.push(filters.layout_id);
    }
    
    if (filters.category_id) {
      if (Array.isArray(filters.category_id)) {
        whereClauses.push(`e.category_id IN (${filters.category_id.map(() => '?').join(', ')})`);
        params.push(...filters.category_id);
      } else {
        whereClauses.push('e.category_id = ?');
        params.push(filters.category_id);
      }
    }
    
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        whereClauses.push(`e.status IN (${filters.status.map(() => '?').join(', ')})`);
        params.push(...filters.status);
      } else {
        whereClauses.push('e.status = ?');
        params.push(filters.status);
      }
    }
    
    if (filters.start_date) {
      whereClauses.push('date(e.expense_date) >= date(?)');
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      whereClauses.push('date(e.expense_date) <= date(?)');
      params.push(filters.end_date);
    }
    
    if (filters.min_amount) {
      whereClauses.push('e.amount >= ?');
      params.push(filters.min_amount);
    }
    
    if (filters.max_amount) {
      whereClauses.push('e.amount <= ?');
      params.push(filters.max_amount);
    }
    
    if (filters.is_black !== undefined) {
      whereClauses.push('e.is_black = ?');
      params.push(filters.is_black ? 1 : 0);
    }
    
    if (filters.search) {
      whereClauses.push('(e.description LIKE ? OR e.vendor LIKE ? OR c.name LIKE ? OR l.name LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    sql += ' ORDER BY e.expense_date DESC';
    
    const expenses = await this.all(sql, params);
    return { expenses };
  }
  
  /**
   * Get expense by ID
   */
  async getExpenseById(id) {
    const expense = await this.get(
      `SELECT e.*, c.name as category_name, l.name as layout_name, 
        u1.name as created_by_name, u2.name as approved_by_name
      FROM expenses e
      LEFT JOIN expense_categories c ON e.category_id = c.id
      LEFT JOIN layouts l ON e.layout_id = l.id
      LEFT JOIN users u1 ON e.created_by = u1.id
      LEFT JOIN users u2 ON e.approved_by = u2.id
      WHERE e.id = ?`,
      [id]
    );
    
    if (!expense) {
      return { error: true, code: 'NOT_FOUND', message: 'Expense not found' };
    }
    
    // Get attachments
    const attachments = await this.all(
      'SELECT * FROM attachments WHERE entity_type = ? AND entity_id = ?',
      ['expense', id]
    );
    
    return { expense: { ...expense, attachments } };
  }
  
  /**
   * Create a new expense
   */
  async createExpense(expenseData, createdById) {
    try {
      // Insert expense
      const result = await this.run(
        `INSERT INTO expenses (
          amount, category_id, description, expense_date, payment_mode,
          vendor, layout_id, created_by, status, notes, is_black, market_price, gov_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          expenseData.amount,
          expenseData.category_id || null,
          expenseData.description,
          expenseData.expense_date || new Date().toISOString(),
          expenseData.payment_mode || null,
          expenseData.vendor || null,
          expenseData.layout_id || null,
          createdById,
          expenseData.status || 'pending',
          expenseData.notes || null,
          expenseData.is_black ? 1 : 0,
          expenseData.market_price || null,
          expenseData.gov_price || null
        ]
      );
      
      // Log activity
      await this.logActivity(
        createdById,
        'create',
        'expense',
        result.lastID,
        `Expense of ${expenseData.amount} created`
      );
      
      // If expense requires approval, create notification for admins and black roles
      if (expenseData.status === 'pending') {
        const admins = await this.all(
          'SELECT id FROM users WHERE role IN (?, ?)',
          ['admin', 'black']
        );
        
        for (const admin of admins) {
          await this.run(
            `INSERT INTO notifications (
              user_id, title, description, type, action, action_url
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              admin.id,
              'Expense approval required',
              `A new expense of ${expenseData.amount} needs your approval`,
              'expense',
              'View expense',
              `/expenses/${result.lastID}`
            ]
          );
        }
      }
      
      return { id: result.lastID, success: true };
    } catch (err) {
      console.error('Error creating expense:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Update an expense
   */
  async updateExpense(id, expenseData, updatedById) {
    try {
      // Check if expense exists
      const expense = await this.get('SELECT id, status FROM expenses WHERE id = ?', [id]);
      
      if (!expense) {
        return { error: true, code: 'NOT_FOUND', message: 'Expense not found' };
      }
      
      // Construct update query dynamically
      const fields = [];
      const values = [];
      
      const updateableFields = [
        'amount', 'category_id', 'description', 'expense_date', 'payment_mode',
        'vendor', 'layout_id', 'notes', 'is_black', 'market_price', 'gov_price'
      ];
      
      updateableFields.forEach(field => {
        if (expenseData[field] !== undefined) {
          if (field === 'is_black') {
            fields.push(`${field} = ?`);
            values.push(expenseData[field] ? 1 : 0);
          } else {
            fields.push(`${field} = ?`);
            values.push(expenseData[field]);
          }
        }
      });
      
      // Special handling for status changes
      if (expenseData.status !== undefined && expenseData.status !== expense.status) {
        fields.push('status = ?');
        values.push(expenseData.status);
        
        // If expense is approved, add approved_by
        if (expenseData.status === 'approved') {
          fields.push('approved_by = ?');
          values.push(updatedById);
        }
      }
      
      if (fields.length === 0) {
        return { error: true, code: 'INVALID_DATA', message: 'No valid fields to update' };
      }
      
      // Add updated_at
      fields.push('updated_at = CURRENT_TIMESTAMP');
      
      // Add ID to values
      values.push(id);
      
      // Update expense
      const result = await this.run(
        `UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      // Log activity
      await this.logActivity(
        updatedById,
        'update',
        'expense',
        id,
        `Expense ID ${id} updated`
      );
      
      // If expense status changed, create notification for the creator
      if (expenseData.status !== undefined && expenseData.status !== expense.status) {
        const expenseDetails = await this.get(
          'SELECT created_by, amount FROM expenses WHERE id = ?',
          [id]
        );
        
        await this.run(
          `INSERT INTO notifications (
            user_id, title, description, type, action, action_url
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            expenseDetails.created_by,
            `Expense ${expenseData.status}`,
            `Your expense of ${expenseDetails.amount} has been ${expenseData.status}`,
            'expense',
            'View expense',
            `/expenses/${id}`
          ]
        );
      }
      
      return { success: true, changes: result.changes };
    } catch (err) {
      console.error('Error updating expense:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Delete an expense
   */
  async deleteExpense(id, deletedById) {
    try {
      // Check if expense exists
      const expense = await this.get('SELECT id FROM expenses WHERE id = ?', [id]);
      
      if (!expense) {
        return { error: true, code: 'NOT_FOUND', message: 'Expense not found' };
      }
      
      // Start transaction
      await this.beginTransaction();
      
      try {
        // Delete attachments
        await this.run(
          'DELETE FROM attachments WHERE entity_type = ? AND entity_id = ?',
          ['expense', id]
        );
        
        // Delete expense
        const result = await this.run('DELETE FROM expenses WHERE id = ?', [id]);
        
        // Log activity
        await this.logActivity(
          deletedById,
          'delete',
          'expense',
          id,
          `Expense ID ${id} deleted`
        );
        
        // Commit transaction
        await this.commitTransaction();
        
        return { success: true, changes: result.changes };
      } catch (err) {
        // Rollback transaction on error
        await this.rollbackTransaction();
        throw err;
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Get all clients
   */
  async getClients(filters = {}) {
    let sql = `
      SELECT c.*, 
      COUNT(DISTINCT p.id) as plots_count,
      COUNT(DISTINCT b.id) as billings_count,
      u.name as created_by_name
      FROM clients c
      LEFT JOIN plots p ON c.id = p.client_id
      LEFT JOIN billings b ON c.id = b.client_id
      LEFT JOIN users u ON c.created_by = u.id
    `;
    
    const params = [];
    const whereClauses = [];
    
    if (filters.search) {
      whereClauses.push('(c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (filters.city) {
      whereClauses.push('c.city LIKE ?');
      params.push(`%${filters.city}%`);
    }
    
    if (filters.state) {
      whereClauses.push('c.state LIKE ?');
      params.push(`%${filters.state}%`);
    }
    
    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    sql += ' GROUP BY c.id ORDER BY c.name ASC';
    
    const clients = await this.all(sql, params);
    return { clients };
  }
  
  /**
   * Get client by ID
   */
  async getClientById(id) {
    const client = await this.get(
      `SELECT c.*, u.name as created_by_name
      FROM clients c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?`,
      [id]
    );
    
    if (!client) {
      return { error: true, code: 'NOT_FOUND', message: 'Client not found' };
    }
    
    // Get plots associated with the client
    const plots = await this.all(
      `SELECT p.*, l.name as layout_name
      FROM plots p
      LEFT JOIN layouts l ON p.layout_id = l.id
      WHERE p.client_id = ?
      ORDER BY p.sold_date DESC, p.booking_date DESC`,
      [id]
    );
    
    // Get billings for the client
    const billings = await this.all(
      `SELECT b.*, p.plot_number, l.name as layout_name,
        COALESCE(SUM(pay.amount), 0) as paid_amount
      FROM billings b
      LEFT JOIN plots p ON b.plot_id = p.id
      LEFT JOIN layouts l ON p.layout_id = l.id
      LEFT JOIN payments pay ON b.id = pay.billing_id
      WHERE b.client_id = ?
      GROUP BY b.id
      ORDER BY b.bill_date DESC`,
      [id]
    );
    
    // Get documents related to the client
    const documents = await this.all(
      'SELECT * FROM attachments WHERE entity_type = ? AND entity_id = ?',
      ['client', id]
    );
    
    return { client: { ...client, plots, billings, documents } };
  }
  
  /**
   * Create a new client
   */
  async createClient(clientData, createdById) {
    try {
      // Insert client
      const result = await this.run(
        `INSERT INTO clients (
          name, email, phone, address, city, state, postal_code,
          pan_card, aadhar_number, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clientData.name,
          clientData.email || null,
          clientData.phone || null,
          clientData.address || null,
          clientData.city || null,
          clientData.state || null,
          clientData.postal_code || null,
          clientData.pan_card || null,
          clientData.aadhar_number || null,
          clientData.notes || null,
          createdById
        ]
      );
      
      // Log activity
      await this.logActivity(
        createdById,
        'create',
        'client',
        result.lastID,
        `Client ${clientData.name} created`
      );
      
      return { id: result.lastID, success: true };
    } catch (err) {
      console.error('Error creating client:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Update a client
   */
  async updateClient(id, clientData, updatedById) {
    try {
      // Check if client exists
      const client = await this.get('SELECT id FROM clients WHERE id = ?', [id]);
      
      if (!client) {
        return { error: true, code: 'NOT_FOUND', message: 'Client not found' };
      }
      
      // Construct update query dynamically
      const fields = [];
      const values = [];
      
      const updateableFields = [
        'name', 'email', 'phone', 'address', 'city', 'state', 'postal_code',
        'pan_card', 'aadhar_number', 'notes'
      ];
      
      updateableFields.forEach(field => {
        if (clientData[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(clientData[field]);
        }
      });
      
      if (fields.length === 0) {
        return { error: true, code: 'INVALID_DATA', message: 'No valid fields to update' };
      }
      
      // Add updated_at
      fields.push('updated_at = CURRENT_TIMESTAMP');
      
      // Add ID to values
      values.push(id);
      
      // Update client
      const result = await this.run(
        `UPDATE clients SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      // Log activity
      await this.logActivity(
        updatedById,
        'update',
        'client',
        id,
        `Client ID ${id} updated`
      );
      
      return { success: true, changes: result.changes };
    } catch (err) {
      console.error('Error updating client:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Delete a client
   */
  async deleteClient(id, deletedById) {
    try {
      // Check if client exists
      const client = await this.get('SELECT id, name FROM clients WHERE id = ?', [id]);
      
      if (!client) {
        return { error: true, code: 'NOT_FOUND', message: 'Client not found' };
      }
      
      // Check if client has plots
      const plotsCount = await this.count(
        'SELECT COUNT(*) FROM plots WHERE client_id = ?',
        [id]
      );
      
      if (plotsCount > 0) {
        return {
          error: true,
          code: 'CONSTRAINT',
          message: 'Cannot delete client with associated plots'
        };
      }
      
      // Check if client has billings
      const billingsCount = await this.count(
        'SELECT COUNT(*) FROM billings WHERE client_id = ?',
        [id]
      );
      
      if (billingsCount > 0) {
        return {
          error: true,
          code: 'CONSTRAINT',
          message: 'Cannot delete client with associated billings'
        };
      }
      
      // Start transaction
      await this.beginTransaction();
      
      try {
        // Delete attachments
        await this.run(
          'DELETE FROM attachments WHERE entity_type = ? AND entity_id = ?',
          ['client', id]
        );
        
        // Delete client
        const result = await this.run('DELETE FROM clients WHERE id = ?', [id]);
        
        // Log activity
        await this.logActivity(
          deletedById,
          'delete',
          'client',
          id,
          `Client ${client.name} deleted`
        );
        
        // Commit transaction
        await this.commitTransaction();
        
        return { success: true, changes: result.changes };
      } catch (err) {
        // Rollback transaction on error
        await this.rollbackTransaction();
        throw err;
      }
    } catch (err) {
      console.error('Error deleting client:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Get all billings
   */
  async getBillings(filters = {}) {
    let sql = `
      SELECT b.*, c.name as client_name, c.phone as client_phone, 
        p.plot_number, l.name as layout_name, 
        COALESCE(SUM(pay.amount), 0) as paid_amount,
        u.name as created_by_name
      FROM billings b
      LEFT JOIN clients c ON b.client_id = c.id
      LEFT JOIN plots p ON b.plot_id = p.id
      LEFT JOIN layouts l ON p.layout_id = l.id
      LEFT JOIN payments pay ON b.id = pay.billing_id
      LEFT JOIN users u ON b.created_by = u.id
    `;
    
    const params = [];
    const whereClauses = [];
    
    if (filters.client_id) {
      whereClauses.push('b.client_id = ?');
      params.push(filters.client_id);
    }
    
    if (filters.plot_id) {
      whereClauses.push('b.plot_id = ?');
      params.push(filters.plot_id);
    }
    
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        whereClauses.push(`b.status IN (${filters.status.map(() => '?').join(', ')})`);
        params.push(...filters.status);
      } else {
        whereClauses.push('b.status = ?');
        params.push(filters.status);
      }
    }
    
    if (filters.start_date) {
      whereClauses.push('date(b.bill_date) >= date(?)');
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      whereClauses.push('date(b.bill_date) <= date(?)');
      params.push(filters.end_date);
    }
    
    if (filters.min_amount) {
      whereClauses.push('b.amount >= ?');
      params.push(filters.min_amount);
    }
    
    if (filters.max_amount) {
      whereClauses.push('b.amount <= ?');
      params.push(filters.max_amount);
    }
    
    if (filters.search) {
      whereClauses.push('(c.name LIKE ? OR p.plot_number LIKE ? OR l.name LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    sql += ' GROUP BY b.id ORDER BY b.bill_date DESC';
    
    const billings = await this.all(sql, params);
    return { billings };
  }
  
  /**
   * Get billing by ID
   */
  async getBillingById(id) {
    const billing = await this.get(
      `SELECT b.*, c.name as client_name, c.phone as client_phone, c.email as client_email,
        p.plot_number, p.area as plot_area, p.unit as plot_unit, l.name as layout_name,
        u.name as created_by_name
      FROM billings b
      LEFT JOIN clients c ON b.client_id = c.id
      LEFT JOIN plots p ON b.plot_id = p.id
      LEFT JOIN layouts l ON p.layout_id = l.id
      LEFT JOIN users u ON b.created_by = u.id
      WHERE b.id = ?`,
      [id]
    );
    
    if (!billing) {
      return { error: true, code: 'NOT_FOUND', message: 'Billing not found' };
    }
    
    // Get payments associated with the billing
    const payments = await this.all(
      `SELECT p.*, u.name as created_by_name
      FROM payments p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.billing_id = ?
      ORDER BY p.payment_date DESC`,
      [id]
    );
    
    // Calculate total paid amount
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Get attachments
    const attachments = await this.all(
      'SELECT * FROM attachments WHERE entity_type = ? AND entity_id = ?',
      ['billing', id]
    );
    
    return {
      billing: {
        ...billing,
        payments,
        paid_amount: totalPaid,
        balance: billing.amount - totalPaid,
        attachments
      }
    };
  }
  
  /**
   * Create a new billing
   */
  async createBilling(billingData, createdById) {
    try {
      // Check if client exists
      const client = await this.get('SELECT id FROM clients WHERE id = ?', [billingData.client_id]);
      
      if (!client) {
        return { error: true, code: 'NOT_FOUND', message: 'Client not found' };
      }
      
      // Check if plot exists (if provided)
      if (billingData.plot_id) {
        const plot = await this.get('SELECT id FROM plots WHERE id = ?', [billingData.plot_id]);
        
        if (!plot) {
          return { error: true, code: 'NOT_FOUND', message: 'Plot not found' };
        }
      }
      
      // Insert billing
      const result = await this.run(
        `INSERT INTO billings (
          client_id, plot_id, amount, bill_date, due_date,
          status, description, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          billingData.client_id,
          billingData.plot_id || null,
          billingData.amount,
          billingData.bill_date || new Date().toISOString(),
          billingData.due_date || null,
          billingData.status || 'pending',
          billingData.description || null,
          createdById
        ]
      );
      
      // Log activity
      await this.logActivity(
        createdById,
        'create',
        'billing',
        result.lastID,
        `Billing for ${billingData.amount} created for client ID ${billingData.client_id}`
      );
      
      // Create notification for the client
      await this.run(
        `INSERT INTO notifications (
          user_id, title, description, type, action, action_url
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          createdById, // Notify the creator for now; in a real app we would have user accounts for clients
          'New billing created',
          `A new billing of ${billingData.amount} has been created`,
          'bill',
          'View bill',
          `/billing/${result.lastID}`
        ]
      );
      
      return { id: result.lastID, success: true };
    } catch (err) {
      console.error('Error creating billing:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Update a billing
   */
  async updateBilling(id, billingData, updatedById) {
    try {
      // Check if billing exists
      const billing = await this.get('SELECT id, status FROM billings WHERE id = ?', [id]);
      
      if (!billing) {
        return { error: true, code: 'NOT_FOUND', message: 'Billing not found' };
      }
      
      // Construct update query dynamically
      const fields = [];
      const values = [];
      
      const updateableFields = [
        'client_id', 'plot_id', 'amount', 'bill_date', 'due_date', 'description'
      ];
      
      updateableFields.forEach(field => {
        if (billingData[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(billingData[field]);
        }
      });
      
      // Special handling for status changes
      if (billingData.status !== undefined && billingData.status !== billing.status) {
        fields.push('status = ?');
        values.push(billingData.status);
      }
      
      if (fields.length === 0) {
        return { error: true, code: 'INVALID_DATA', message: 'No valid fields to update' };
      }
      
      // Add updated_at
      fields.push('updated_at = CURRENT_TIMESTAMP');
      
      // Add ID to values
      values.push(id);
      
      // Update billing
      const result = await this.run(
        `UPDATE billings SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      // Log activity
      await this.logActivity(
        updatedById,
        'update',
        'billing',
        id,
        `Billing ID ${id} updated`
      );
      
      return { success: true, changes: result.changes };
    } catch (err) {
      console.error('Error updating billing:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Delete a billing
   */
  async deleteBilling(id, deletedById) {
    try {
      // Check if billing exists
      const billing = await this.get('SELECT id FROM billings WHERE id = ?', [id]);
      
      if (!billing) {
        return { error: true, code: 'NOT_FOUND', message: 'Billing not found' };
      }
      
      // Start transaction
      await this.beginTransaction();
      
      try {
        // Delete payments
        await this.run('DELETE FROM payments WHERE billing_id = ?', [id]);
        
        // Delete attachments
        await this.run(
          'DELETE FROM attachments WHERE entity_type = ? AND entity_id = ?',
          ['billing', id]
        );
        
        // Delete billing
        const result = await this.run('DELETE FROM billings WHERE id = ?', [id]);
        
        // Log activity
        await this.logActivity(
          deletedById,
          'delete',
          'billing',
          id,
          `Billing ID ${id} deleted`
        );
        
        // Commit transaction
        await this.commitTransaction();
        
        return { success: true, changes: result.changes };
      } catch (err) {
        // Rollback transaction on error
        await this.rollbackTransaction();
        throw err;
      }
    } catch (err) {
      console.error('Error deleting billing:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Add a payment to a billing
   */
  async addPayment(billingId, paymentData, createdById) {
    try {
      // Check if billing exists
      const billing = await this.get(
        'SELECT b.*, c.name as client_name FROM billings b LEFT JOIN clients c ON b.client_id = c.id WHERE b.id = ?',
        [billingId]
      );
      
      if (!billing) {
        return { error: true, code: 'NOT_FOUND', message: 'Billing not found' };
      }
      
      // Get total paid amount before this payment
      const paidBefore = await this.get(
        'SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE billing_id = ?',
        [billingId]
      );
      
      const totalPaidBefore = paidBefore.total_paid;
      
      // Insert payment
      const result = await this.run(
        `INSERT INTO payments (
          billing_id, amount, payment_date, payment_mode,
          reference_number, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          billingId,
          paymentData.amount,
          paymentData.payment_date || new Date().toISOString(),
          paymentData.payment_mode || null,
          paymentData.reference_number || null,
          paymentData.notes || null,
          createdById
        ]
      );
      
      // Calculate total paid after this payment
      const totalPaidAfter = totalPaidBefore + paymentData.amount;
      
      // Update billing status if necessary
      let newStatus = billing.status;
      
      if (totalPaidAfter >= billing.amount) {
        newStatus = 'paid';
      } else if (totalPaidAfter > 0) {
        newStatus = 'partial';
      }
      
      if (newStatus !== billing.status) {
        await this.run(
          'UPDATE billings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [newStatus, billingId]
        );
      }
      
      // Log activity
      await this.logActivity(
        createdById,
        'create',
        'payment',
        result.lastID,
        `Payment of ${paymentData.amount} added to billing ID ${billingId}`
      );
      
      // Create notification
      await this.run(
        `INSERT INTO notifications (
          user_id, title, description, type, action, action_url
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          createdById, // Notify the creator for now
          'Payment recorded',
          `A payment of ${paymentData.amount} has been recorded for ${billing.client_name}`,
          'payment',
          'View payment',
          `/billing/${billingId}`
        ]
      );
      
      return { 
        id: result.lastID, 
        success: true, 
        billing_status: newStatus,
        paid_amount: totalPaidAfter,
        balance: billing.amount - totalPaidAfter
      };
    } catch (err) {
      console.error('Error adding payment:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Add an attachment
   */
  async addAttachment(entityType, entityId, fileData, uploadedById) {
    try {
      // Insert attachment
      const result = await this.run(
        `INSERT INTO attachments (
          entity_type, entity_id, filename, filepath, filetype, filesize,
          uploaded_by, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entityType,
          entityId,
          fileData.filename,
          fileData.filepath,
          fileData.filetype,
          fileData.filesize,
          uploadedById,
          fileData.description || null
        ]
      );
      
      // Log activity
      await this.logActivity(
        uploadedById,
        'create',
        'attachment',
        result.lastID,
        `Attachment ${fileData.filename} added to ${entityType} ID ${entityId}`
      );
      
      return { id: result.lastID, success: true };
    } catch (err) {
      console.error('Error adding attachment:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Delete an attachment
   */
  async deleteAttachment(id, deletedById) {
    try {
      // Check if attachment exists
      const attachment = await this.get(
        'SELECT id, filepath, entity_type, entity_id FROM attachments WHERE id = ?',
        [id]
      );
      
      if (!attachment) {
        return { error: true, code: 'NOT_FOUND', message: 'Attachment not found' };
      }
      
      // Delete attachment from database
      const result = await this.run('DELETE FROM attachments WHERE id = ?', [id]);
      
      // Log activity
      await this.logActivity(
        deletedById,
        'delete',
        'attachment',
        id,
        `Attachment ID ${id} deleted from ${attachment.entity_type} ID ${attachment.entity_id}`
      );
      
      return { 
        success: true, 
        changes: result.changes,
        filepath: attachment.filepath
      };
    } catch (err) {
      console.error('Error deleting attachment:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Create a backup
   */
  async createBackup(backupType, createdById) {
    try {
      // Create backup directory if it doesn't exist
      const userDataPath = app.getPath('userData');
      const backupDir = path.join(userDataPath, 'backups');
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // Generate backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `ps2_estate_${timestamp}_${backupType}.db`;
      const backupFilepath = path.join(backupDir, backupFilename);
      
      // Create backup
      await new Promise((resolve, reject) => {
        const backup = fs.createWriteStream(backupFilepath);
        
        backup.on('error', (err) => {
          reject(err);
        });
        
        backup.on('finish', () => {
          resolve();
        });
        
        // Copy database file
        const dbPath = this.db.filename;
        fs.createReadStream(dbPath).pipe(backup);
      });
      
      // Get backup file size
      const stats = fs.statSync(backupFilepath);
      const filesize = stats.size;
      
      // Insert backup log
      const result = await this.run(
        `INSERT INTO backup_logs (
          backup_date, filepath, filesize, backup_type, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          new Date().toISOString(),
          backupFilepath,
          filesize,
          backupType,
          'completed',
          createdById
        ]
      );
      
      // Log activity
      await this.logActivity(
        createdById,
        'create',
        'backup',
        result.lastID,
        `Database backup created (${backupType})`
      );
      
      return { 
        id: result.lastID, 
        success: true, 
        filepath: backupFilepath,
        size: filesize
      };
    } catch (err) {
      console.error('Error creating backup:', err);
      
      // Log failed backup attempt
      await this.run(
        `INSERT INTO backup_logs (
          backup_date, filepath, filesize, backup_type, status, created_by, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          new Date().toISOString(),
          '',
          0,
          backupType,
          'failed',
          createdById,
          err.message
        ]
      );
      
      return { error: true, code: 'BACKUP_ERROR', message: err.message };
    }
  }
  
  /**
   * Get backup logs
   */
  async getBackupLogs() {
    const logs = await this.all(
      `SELECT b.*, u.name as created_by_name
      FROM backup_logs b
      LEFT JOIN users u ON b.created_by = u.id
      ORDER BY b.backup_date DESC`
    );
    
    return { logs };
  }
  
  /**
   * Restore from backup
   */
  async restoreFromBackup(backupFilepath, restoredById) {
    try {
      // Check if backup file exists
      if (!fs.existsSync(backupFilepath)) {
        return { error: true, code: 'NOT_FOUND', message: 'Backup file not found' };
      }
      
      // Close current database connection
      await this.close();
      
      // Get current database path
      const userDataPath = app.getPath('userData');
      const dbDir = path.join(userDataPath, 'database');
      const dbPath = path.join(dbDir, 'ps2_estate.db');
      
      // Backup current database before restore
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const preRestoreBackup = path.join(dbDir, `pre_restore_${timestamp}.db`);
      
      fs.copyFileSync(dbPath, preRestoreBackup);
      
      // Restore from backup
      fs.copyFileSync(backupFilepath, dbPath);
      
      // Reconnect to database
      await this.initialize();
      
      // Log activity
      await this.logActivity(
        restoredById,
        'restore',
        'backup',
        0,
        `Database restored from backup: ${path.basename(backupFilepath)}`
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error restoring from backup:', err);
      
      // Try to reinitialize database
      try {
        await this.initialize();
      } catch (initErr) {
        console.error('Failed to reinitialize database after restore error:', initErr);
      }
      
      return { error: true, code: 'RESTORE_ERROR', message: err.message };
    }
  }
  
  /**
   * Get settings
   */
  async getSettings() {
    const settings = await this.all('SELECT * FROM settings');
    
    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    return { settings: settingsObj };
  }
  
  /**
   * Update settings
   */
  async updateSettings(settingsData, updatedById) {
    try {
      // Start transaction
      await this.beginTransaction();
      
      try {
        // Update each setting
        for (const [key, value] of Object.entries(settingsData)) {
          // Check if setting exists
          const setting = await this.get('SELECT key FROM settings WHERE key = ?', [key]);
          
          if (setting) {
            // Update existing setting
            await this.run(
              'UPDATE settings SET value = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
              [value, updatedById, key]
            );
          } else {
            // Insert new setting
            await this.run(
              'INSERT INTO settings (key, value, updated_by) VALUES (?, ?, ?)',
              [key, value, updatedById]
            );
          }
        }
        
        // Log activity
        await this.logActivity(
          updatedById,
          'update',
          'settings',
          0,
          `Settings updated: ${Object.keys(settingsData).join(', ')}`
        );
        
        // Commit transaction
        await this.commitTransaction();
        
        return { success: true };
      } catch (err) {
        // Rollback transaction on error
        await this.rollbackTransaction();
        throw err;
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Get notifications for a user
   */
  async getNotifications(userId) {
    const notifications = await this.all(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    return { notifications };
  }
  
  /**
   * Mark notification as read
   */
  async markNotificationAsRead(id, userId) {
    try {
      // Check if notification exists and belongs to the user
      const notification = await this.get(
        'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (!notification) {
        return { error: true, code: 'NOT_FOUND', message: 'Notification not found' };
      }
      
      // Mark as read
      const result = await this.run(
        'UPDATE notifications SET is_read = 1 WHERE id = ?',
        [id]
      );
      
      return { success: true, changes: result.changes };
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Get activity logs
   */
  async getActivityLogs(filters = {}) {
    let sql = `
      SELECT a.*, u.name as user_name
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
    `;
    
    const params = [];
    const whereClauses = [];
    
    if (filters.user_id) {
      whereClauses.push('a.user_id = ?');
      params.push(filters.user_id);
    }
    
    if (filters.action) {
      if (Array.isArray(filters.action)) {
        whereClauses.push(`a.action IN (${filters.action.map(() => '?').join(', ')})`);
        params.push(...filters.action);
      } else {
        whereClauses.push('a.action = ?');
        params.push(filters.action);
      }
    }
    
    if (filters.entity_type) {
      whereClauses.push('a.entity_type = ?');
      params.push(filters.entity_type);
    }
    
    if (filters.start_date) {
      whereClauses.push('date(a.created_at) >= date(?)');
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      whereClauses.push('date(a.created_at) <= date(?)');
      params.push(filters.end_date);
    }
    
    if (filters.search) {
      whereClauses.push('(a.action LIKE ? OR a.entity_type LIKE ? OR a.details LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    sql += ' ORDER BY a.created_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const logs = await this.all(sql, params);
    return { logs };
  }
  
  /**
   * Get dashboard stats
   */
  async getDashboardStats() {
    try {
      // Get plot stats
      const plotStats = await this.get(`
        SELECT 
          COUNT(*) as total_plots,
          SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_plots,
          SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold_plots,
          SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked_plots,
          SUM(CASE WHEN status = 'sold' THEN total_price ELSE 0 END) as total_sales_amount
        FROM plots
      `);
      
      // Get layout stats
      const layoutStats = await this.get(`
        SELECT COUNT(*) as total_layouts FROM layouts
      `);
      
      // Get client stats
      const clientStats = await this.get(`
        SELECT COUNT(*) as total_clients FROM clients
      `);
      
      // Get billing stats
      const billingStats = await this.get(`
        SELECT 
          COUNT(*) as total_billings,
          SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_billings,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_billings,
          SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_billings,
          SUM(amount) as total_billed_amount
        FROM billings
      `);
      
      // Get payment stats
      const paymentStats = await this.get(`
        SELECT SUM(amount) as total_payments_received FROM payments
      `);
      
      // Get expense stats
      const expenseStats = await this.get(`
        SELECT 
          COUNT(*) as total_expenses,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_expenses,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_expenses,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_expenses,
          SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as total_expense_amount
        FROM expenses
      `);
      
      // Recent activities
      const recentActivities = await this.all(`
        SELECT a.*, u.name as user_name
        FROM activity_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 10
      `);
      
      return {
        plot_stats: plotStats,
        layout_stats: layoutStats,
        client_stats: clientStats,
        billing_stats: billingStats,
        payment_stats: paymentStats,
        expense_stats: expenseStats,
        recent_activities: recentActivities,
        stats_calculated_at: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error getting dashboard stats:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
  
  /**
   * Get plots sold chart data
   */
  async getPlotsSoldChartData(period = 'monthly') {
    try {
      let groupFormat;
      let dateFormat;
      
      switch(period) {
        case 'weekly':
          groupFormat = "strftime('%Y-%W', sold_date)";
          dateFormat = "strftime('%Y Week %W', sold_date)";
          break;
        case 'daily':
          groupFormat = "date(sold_date)";
          dateFormat = "date(sold_date)";
          break;
        case 'yearly':
          groupFormat = "strftime('%Y', sold_date)";
          dateFormat = "strftime('%Y', sold_date)";
          break;
        case 'monthly':
        default:
          groupFormat = "strftime('%Y-%m', sold_date)";
          dateFormat = "strftime('%Y-%m', sold_date)";
          break;
      }
      
      const chartData = await this.all(`
        SELECT 
          ${dateFormat} as label,
          COUNT(*) as plot_count,
          SUM(total_price) as total_price
        FROM plots
        WHERE status = 'sold' AND sold_date IS NOT NULL
        GROUP BY ${groupFormat}
        ORDER BY sold_date
        LIMIT 12
      `);
      
      return {
        chart_data: chartData,
        period: period
      };
    } catch (err) {
      console.error('Error getting plots sold chart data:', err);
      return { error: true, code: 'DB_ERROR', message: err.message };
    }
  }
}

module.exports = DatabaseService;
