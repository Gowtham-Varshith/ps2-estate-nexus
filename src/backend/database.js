
/**
 * PS2 Estate Nexus - Backend Database Service
 * 
 * This file contains the database service for the PS2 Estate Nexus application.
 * It provides all the necessary functionality for interacting with the SQLite database.
 * 
 * This is intended to be used in the Electron main process.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { app } = require('electron');

// Constants
const JWT_SECRET = 'ps2-estate-nexus-secret-key'; // In production, use environment variables
const JWT_EXPIRE = '24h';
const REFRESH_TOKEN_EXPIRE = '30d';
const SALT_ROUNDS = 10;
const DB_VERSION = 1;

class DatabaseService {
  constructor() {
    this.db = null;
    this.initialized = false;
    this.dbPath = path.join(app.getPath('userData'), 'ps2_estate_nexus.db');
  }

  // Initialize database connection and set up schema
  async initialize() {
    try {
      if (!fs.existsSync(path.dirname(this.dbPath))) {
        fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
      }

      return new Promise((resolve, reject) => {
        this.db = new sqlite3.Database(this.dbPath, async (err) => {
          if (err) {
            console.error('Failed to connect to database:', err);
            return reject(err);
          }

          console.log('Connected to SQLite database at:', this.dbPath);
          
          // Enable foreign keys
          this.db.run('PRAGMA foreign_keys = ON', async (err) => {
            if (err) {
              console.error('Failed to enable foreign keys:', err);
              return reject(err);
            }

            try {
              await this.setupSchema();
              await this.checkMigrations();
              await this.setupAdminUser();
              this.initialized = true;
              resolve(this);
            } catch (err) {
              console.error('Failed to initialize database:', err);
              reject(err);
            }
          });
        });
      });
    } catch (err) {
      console.error('Error during database initialization:', err);
      throw err;
    }
  }

  // Create database schema
  async setupSchema() {
    const tables = [
      // Version table for migrations
      `CREATE TABLE IF NOT EXISTS version (
        id INTEGER PRIMARY KEY,
        version INTEGER NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        role TEXT NOT NULL CHECK(role IN ('admin', 'staff', 'black')) DEFAULT 'staff',
        status TEXT NOT NULL CHECK(status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
        permissions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Layouts table
      `CREATE TABLE IF NOT EXISTS layouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT,
        gov_rate_per_sqft REAL NOT NULL,
        market_rate_per_sqft REAL NOT NULL,
        total_area REAL NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('active', 'inactive', 'completed')) DEFAULT 'active',
        amenities TEXT,
        images TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Plots table
      `CREATE TABLE IF NOT EXISTS plots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plot_number TEXT NOT NULL,
        layout_id INTEGER NOT NULL REFERENCES layouts(id),
        area REAL NOT NULL,
        area_unit TEXT NOT NULL DEFAULT 'sqft',
        dimensions TEXT,
        facing TEXT,
        price REAL NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('available', 'reserved', 'sold')) DEFAULT 'available',
        is_prime INTEGER DEFAULT 0,
        features TEXT,
        sold_to_client_id INTEGER REFERENCES clients(id),
        sold_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Expense Categories table
      `CREATE TABLE IF NOT EXISTS expense_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Expenses table
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        category_id INTEGER NOT NULL REFERENCES expense_categories(id),
        vendor TEXT,
        amount REAL NOT NULL,
        gov_price REAL,
        market_price REAL,
        is_black INTEGER DEFAULT 0,
        date TEXT NOT NULL,
        notes TEXT,
        payment_mode TEXT,
        layout_id INTEGER REFERENCES layouts(id),
        plot_id INTEGER REFERENCES plots(id),
        approved_by INTEGER REFERENCES users(id),
        created_by INTEGER REFERENCES users(id),
        status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
        tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Attachments table (for expenses, plots, etc.)
      `CREATE TABLE IF NOT EXISTS attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        filetype TEXT NOT NULL,
        filesize INTEGER NOT NULL,
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Clients table
      `CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT,
        notes TEXT,
        status TEXT NOT NULL CHECK(status IN ('active', 'inactive', 'lead')) DEFAULT 'active',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Client Interactions table
      `CREATE TABLE IF NOT EXISTS client_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL REFERENCES clients(id),
        interaction_type TEXT NOT NULL,
        notes TEXT,
        date TIMESTAMP NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Billings table
      `CREATE TABLE IF NOT EXISTS billings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_number TEXT NOT NULL UNIQUE,
        client_id INTEGER NOT NULL REFERENCES clients(id),
        layout_id INTEGER NOT NULL REFERENCES layouts(id),
        plot_id INTEGER NOT NULL REFERENCES plots(id),
        total_amount REAL NOT NULL,
        gov_amount REAL NOT NULL,
        is_black INTEGER DEFAULT 0,
        payment_type TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('generated', 'paid', 'cancelled')) DEFAULT 'generated',
        notes TEXT,
        generated_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Payments table
      `CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        billing_id INTEGER NOT NULL REFERENCES billings(id),
        amount REAL NOT NULL,
        date TIMESTAMP NOT NULL,
        payment_mode TEXT NOT NULL,
        reference TEXT,
        notes TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Documents table
      `CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        size INTEGER NOT NULL,
        filepath TEXT NOT NULL,
        layout_id INTEGER REFERENCES layouts(id),
        plot_id INTEGER REFERENCES plots(id),
        client_id INTEGER REFERENCES clients(id),
        tags TEXT,
        uploaded_by INTEGER REFERENCES users(id),
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Backup Logs table
      `CREATE TABLE IF NOT EXISTS backup_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('local', 'external', 'cloud')) DEFAULT 'local',
        status TEXT NOT NULL CHECK(status IN ('success', 'warning', 'error')) DEFAULT 'success',
        size INTEGER,
        filepath TEXT,
        notes TEXT,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Activity Logs table
      `CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id INTEGER,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Settings table
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY,
        company_name TEXT,
        company_address TEXT,
        company_phone TEXT,
        company_email TEXT,
        company_logo TEXT,
        backup_schedule TEXT DEFAULT 'daily',
        backup_location TEXT,
        backup_retention INTEGER DEFAULT 7,
        updated_by INTEGER REFERENCES users(id),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Notifications table
      `CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        type TEXT NOT NULL,
        action_label TEXT,
        action_url TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    // Execute all table creation queries in sequence
    for (const table of tables) {
      await this.run(table);
    }
    
    console.log('Database schema has been set up successfully');
  }

  // Check if migrations are needed
  async checkMigrations() {
    try {
      // Check if version record exists
      const version = await this.get('SELECT version FROM version LIMIT 1');
      
      if (!version) {
        // No version record, initialize it
        await this.run('INSERT INTO version (version) VALUES (?)', [DB_VERSION]);
        console.log('Initialized database version to', DB_VERSION);
        return;
      }
      
      // If current version is lower than DB_VERSION, run migrations
      if (version.version < DB_VERSION) {
        await this.runMigrations(version.version);
        await this.run('UPDATE version SET version = ?, updated_at = CURRENT_TIMESTAMP', [DB_VERSION]);
        console.log('Updated database version to', DB_VERSION);
      }
    } catch (err) {
      console.error('Error checking migrations:', err);
      throw err;
    }
  }

  // Run migrations based on version
  async runMigrations(currentVersion) {
    try {
      console.log(`Running migrations from version ${currentVersion} to ${DB_VERSION}`);
      
      // Add migration steps here as needed
      // Example:
      // if (currentVersion < 2) {
      //   await this.run('ALTER TABLE users ADD COLUMN new_column TEXT');
      // }
      // if (currentVersion < 3) {
      //   await this.run('CREATE TABLE new_table (...)');
      // }
      
      console.log('Migrations completed successfully');
    } catch (err) {
      console.error('Error running migrations:', err);
      throw err;
    }
  }

  // Set up admin user if none exists
  async setupAdminUser() {
    try {
      const adminExists = await this.get('SELECT id FROM users WHERE role = "admin" LIMIT 1');
      
      if (!adminExists) {
        // Create default admin user
        const hashedPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
        
        await this.run(
          'INSERT INTO users (username, password, name, email, role, permissions) VALUES (?, ?, ?, ?, ?, ?)',
          ['admin', hashedPassword, 'Admin User', 'admin@ps2estate.com', 'admin', 'read:all,write:all,delete:all']
        );
        
        console.log('Default admin user created');
      }
    } catch (err) {
      console.error('Error setting up admin user:', err);
      throw err;
    }
  }

  // Helper method to run SQL queries
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('SQL Error:', sql, params, err);
          return reject(err);
        }
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  // Helper method to get a single row
  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('SQL Error:', sql, params, err);
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  // Helper method to get multiple rows
  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('SQL Error:', sql, params, err);
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  // Helper to run queries within a transaction
  async transaction(callback) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        Promise.resolve()
          .then(() => callback())
          .then((result) => {
            this.db.run('COMMIT', (err) => {
              if (err) {
                console.error('Error committing transaction:', err);
                return reject(err);
              }
              resolve(result);
            });
          })
          .catch((err) => {
            console.error('Error in transaction:', err);
            this.db.run('ROLLBACK', (rollbackErr) => {
              if (rollbackErr) {
                console.error('Error rolling back transaction:', rollbackErr);
              }
              reject(err);
            });
          });
      });
    });
  }

  // Close the database connection
  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
            return reject(err);
          }
          console.log('Database connection closed');
          this.initialized = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  // Authentication methods
  async authenticateUser(username, password) {
    try {
      const user = await this.get(
        'SELECT id, username, password, name, email, role, permissions, status FROM users WHERE username = ?',
        [username]
      );

      if (!user) {
        return { error: 'User not found' };
      }

      if (user.status !== 'active') {
        return { error: 'User account is not active' };
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return { error: 'Invalid password' };
      }

      // Generate JWT tokens
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRE }
      );

      // Log the login activity
      await this.logActivity(user.id, 'LOGIN', 'auth', null, {});

      return {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions ? user.permissions.split(',') : []
        },
        accessToken,
        refreshToken
      };
    } catch (err) {
      console.error('Authentication error:', err);
      return { error: 'Authentication failed' };
    }
  }

  // Refresh token
  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const user = await this.get(
        'SELECT id, username, name, email, role, permissions, status FROM users WHERE id = ?',
        [decoded.id]
      );

      if (!user || user.status !== 'active') {
        return { error: 'Invalid token or inactive user' };
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      return { accessToken };
    } catch (err) {
      console.error('Token refresh error:', err);
      return { error: 'Invalid token' };
    }
  }

  // Verify token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return null;
    }
  }

  // Users CRUD operations
  async getUsers(filters = {}) {
    try {
      let sql = 'SELECT id, username, name, email, role, status, created_at FROM users';
      const params = [];
      
      const whereConditions = [];
      
      if (filters.role) {
        whereConditions.push('role = ?');
        params.push(filters.role);
      }
      
      if (filters.status) {
        whereConditions.push('status = ?');
        params.push(filters.status);
      }
      
      if (filters.search) {
        whereConditions.push('(username LIKE ? OR name LIKE ? OR email LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      if (whereConditions.length > 0) {
        sql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      sql += ' ORDER BY created_at DESC';
      
      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          sql += ' OFFSET ?';
          params.push(parseInt(filters.offset));
        }
      }
      
      const users = await this.all(sql, params);
      
      // Count total users for pagination
      let countSql = 'SELECT COUNT(*) as total FROM users';
      
      if (whereConditions.length > 0) {
        countSql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      const countResult = await this.get(countSql, params.slice(0, whereConditions.length));
      
      return {
        total: countResult.total,
        data: users
      };
    } catch (err) {
      console.error('Error getting users:', err);
      throw err;
    }
  }

  async getUserById(id) {
    try {
      return await this.get(
        'SELECT id, username, name, email, role, status, permissions, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
    } catch (err) {
      console.error('Error getting user by ID:', err);
      throw err;
    }
  }

  async createUser(userData, createdBy) {
    try {
      const { username, password, name, email, role, status, permissions } = userData;
      
      // Check if username or email already exists
      const existingUser = await this.get(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email]
      );
      
      if (existingUser) {
        return { error: 'Username or email already exists' };
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      
      // Insert new user
      const result = await this.run(
        'INSERT INTO users (username, password, name, email, role, status, permissions) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, name, email, role, status || 'active', permissions ? permissions.join(',') : null]
      );
      
      // Log activity
      await this.logActivity(createdBy, 'CREATE', 'user', result.lastID, { username, name, role });
      
      return { id: result.lastID };
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  async updateUser(id, userData, updatedBy) {
    try {
      const { name, email, role, status, permissions, password } = userData;
      
      // Build update query dynamically
      const fields = [];
      const params = [];
      
      if (name !== undefined) {
        fields.push('name = ?');
        params.push(name);
      }
      
      if (email !== undefined) {
        fields.push('email = ?');
        params.push(email);
      }
      
      if (role !== undefined) {
        fields.push('role = ?');
        params.push(role);
      }
      
      if (status !== undefined) {
        fields.push('status = ?');
        params.push(status);
      }
      
      if (permissions !== undefined) {
        fields.push('permissions = ?');
        params.push(permissions.join(','));
      }
      
      if (password !== undefined) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        fields.push('password = ?');
        params.push(hashedPassword);
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      
      if (fields.length === 0) {
        return { error: 'No fields to update' };
      }
      
      // Add ID to params
      params.push(id);
      
      const result = await this.run(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        params
      );
      
      // Log activity
      await this.logActivity(updatedBy, 'UPDATE', 'user', id, { fields: Object.keys(userData) });
      
      return { changes: result.changes };
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }

  async deleteUser(id, deletedBy) {
    try {
      // Check if user exists
      const user = await this.getUserById(id);
      
      if (!user) {
        return { error: 'User not found' };
      }
      
      // Don't allow deleting the last admin user
      if (user.role === 'admin') {
        const adminCount = await this.get('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
        
        if (adminCount.count === 1) {
          return { error: 'Cannot delete the last admin user' };
        }
      }
      
      // Delete user
      const result = await this.run('DELETE FROM users WHERE id = ?', [id]);
      
      // Log activity
      await this.logActivity(deletedBy, 'DELETE', 'user', id, { username: user.username });
      
      return { changes: result.changes };
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }

  // Layouts CRUD operations
  async getLayouts(filters = {}) {
    try {
      // Base query to get layout details with calculated fields
      let sql = `
        SELECT 
          l.*,
          (SELECT COUNT(*) FROM plots WHERE layout_id = l.id) AS total_plots,
          (SELECT COUNT(*) FROM plots WHERE layout_id = l.id AND status = 'sold') AS sold_plots,
          (SELECT COUNT(*) FROM plots WHERE layout_id = l.id AND status = 'available') AS available_plots
        FROM layouts l
      `;
      
      const params = [];
      const whereConditions = [];
      
      if (filters.search) {
        whereConditions.push('(l.name LIKE ? OR l.location LIKE ? OR l.description LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      if (filters.location) {
        whereConditions.push('l.location LIKE ?');
        params.push(`%${filters.location}%`);
      }
      
      if (filters.status) {
        whereConditions.push('l.status = ?');
        params.push(filters.status);
      }
      
      if (whereConditions.length > 0) {
        sql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      // Order by clause
      sql += ' ORDER BY l.created_at DESC';
      
      // Pagination
      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          sql += ' OFFSET ?';
          params.push(parseInt(filters.offset));
        }
      }
      
      const layouts = await this.all(sql, params);
      
      // Parse JSON fields
      layouts.forEach(layout => {
        if (layout.amenities) layout.amenities = JSON.parse(layout.amenities);
        if (layout.images) layout.images = JSON.parse(layout.images);
      });
      
      // Get total count for pagination
      let countSql = 'SELECT COUNT(*) as total FROM layouts l';
      
      if (whereConditions.length > 0) {
        countSql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      const countResult = await this.get(countSql, params.slice(0, whereConditions.length));
      
      return {
        total: countResult.total,
        data: layouts
      };
    } catch (err) {
      console.error('Error getting layouts:', err);
      throw err;
    }
  }

  async getLayoutById(id) {
    try {
      // Get basic layout info
      const layout = await this.get(`
        SELECT 
          l.*,
          (SELECT COUNT(*) FROM plots WHERE layout_id = l.id) AS total_plots,
          (SELECT COUNT(*) FROM plots WHERE layout_id = l.id AND status = 'sold') AS sold_plots,
          (SELECT COUNT(*) FROM plots WHERE layout_id = l.id AND status = 'available') AS available_plots,
          (SELECT name FROM users WHERE id = l.created_by) AS created_by_name
        FROM layouts l
        WHERE l.id = ?
      `, [id]);
      
      if (!layout) {
        return null;
      }
      
      // Parse JSON fields
      if (layout.amenities) layout.amenities = JSON.parse(layout.amenities);
      if (layout.images) layout.images = JSON.parse(layout.images);
      
      return layout;
    } catch (err) {
      console.error('Error getting layout by ID:', err);
      throw err;
    }
  }

  async createLayout(layoutData, createdBy) {
    try {
      const {
        name,
        location,
        description,
        gov_rate_per_sqft,
        market_rate_per_sqft,
        total_area,
        status,
        amenities,
        images
      } = layoutData;
      
      // Convert arrays to JSON strings
      const amenitiesJson = amenities ? JSON.stringify(amenities) : null;
      const imagesJson = images ? JSON.stringify(images) : null;
      
      const result = await this.run(
        `INSERT INTO layouts (
          name, location, description, gov_rate_per_sqft, market_rate_per_sqft,
          total_area, status, amenities, images, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, location, description, gov_rate_per_sqft, market_rate_per_sqft,
          total_area, status || 'active', amenitiesJson, imagesJson, createdBy
        ]
      );
      
      // Log activity
      await this.logActivity(createdBy, 'CREATE', 'layout', result.lastID, { name, location });
      
      return { id: result.lastID };
    } catch (err) {
      console.error('Error creating layout:', err);
      throw err;
    }
  }

  async updateLayout(id, layoutData, updatedBy) {
    try {
      const {
        name,
        location,
        description,
        gov_rate_per_sqft,
        market_rate_per_sqft,
        total_area,
        status,
        amenities,
        images
      } = layoutData;
      
      // Build update query dynamically
      const fields = [];
      const params = [];
      
      if (name !== undefined) {
        fields.push('name = ?');
        params.push(name);
      }
      
      if (location !== undefined) {
        fields.push('location = ?');
        params.push(location);
      }
      
      if (description !== undefined) {
        fields.push('description = ?');
        params.push(description);
      }
      
      if (gov_rate_per_sqft !== undefined) {
        fields.push('gov_rate_per_sqft = ?');
        params.push(gov_rate_per_sqft);
      }
      
      if (market_rate_per_sqft !== undefined) {
        fields.push('market_rate_per_sqft = ?');
        params.push(market_rate_per_sqft);
      }
      
      if (total_area !== undefined) {
        fields.push('total_area = ?');
        params.push(total_area);
      }
      
      if (status !== undefined) {
        fields.push('status = ?');
        params.push(status);
      }
      
      if (amenities !== undefined) {
        fields.push('amenities = ?');
        params.push(JSON.stringify(amenities));
      }
      
      if (images !== undefined) {
        fields.push('images = ?');
        params.push(JSON.stringify(images));
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      
      if (fields.length === 0) {
        return { error: 'No fields to update' };
      }
      
      // Add ID to params
      params.push(id);
      
      const result = await this.run(
        `UPDATE layouts SET ${fields.join(', ')} WHERE id = ?`,
        params
      );
      
      // Log activity
      await this.logActivity(updatedBy, 'UPDATE', 'layout', id, { fields: Object.keys(layoutData) });
      
      return { changes: result.changes };
    } catch (err) {
      console.error('Error updating layout:', err);
      throw err;
    }
  }

  async deleteLayout(id, deletedBy) {
    try {
      // Check if layout has any plots
      const plotsCount = await this.get('SELECT COUNT(*) as count FROM plots WHERE layout_id = ?', [id]);
      
      if (plotsCount.count > 0) {
        return { error: 'Cannot delete layout with associated plots' };
      }
      
      // Get layout info for activity log
      const layout = await this.get('SELECT name FROM layouts WHERE id = ?', [id]);
      
      if (!layout) {
        return { error: 'Layout not found' };
      }
      
      // Delete layout
      const result = await this.run('DELETE FROM layouts WHERE id = ?', [id]);
      
      // Log activity
      await this.logActivity(deletedBy, 'DELETE', 'layout', id, { name: layout.name });
      
      return { changes: result.changes };
    } catch (err) {
      console.error('Error deleting layout:', err);
      throw err;
    }
  }

  // Plots CRUD operations
  async getPlots(filters = {}) {
    try {
      let sql = `
        SELECT 
          p.*,
          l.name as layout_name,
          c.name as client_name
        FROM plots p
        LEFT JOIN layouts l ON p.layout_id = l.id
        LEFT JOIN clients c ON p.sold_to_client_id = c.id
      `;
      
      const params = [];
      const whereConditions = [];
      
      if (filters.layout_id) {
        whereConditions.push('p.layout_id = ?');
        params.push(filters.layout_id);
      }
      
      if (filters.status) {
        whereConditions.push('p.status = ?');
        params.push(filters.status);
      }
      
      if (filters.min_area) {
        whereConditions.push('p.area >= ?');
        params.push(parseFloat(filters.min_area));
      }
      
      if (filters.max_area) {
        whereConditions.push('p.area <= ?');
        params.push(parseFloat(filters.max_area));
      }
      
      if (filters.min_price) {
        whereConditions.push('p.price >= ?');
        params.push(parseFloat(filters.min_price));
      }
      
      if (filters.max_price) {
        whereConditions.push('p.price <= ?');
        params.push(parseFloat(filters.max_price));
      }
      
      if (filters.facing) {
        whereConditions.push('p.facing = ?');
        params.push(filters.facing);
      }
      
      if (filters.is_prime !== undefined) {
        whereConditions.push('p.is_prime = ?');
        params.push(filters.is_prime ? 1 : 0);
      }
      
      if (filters.search) {
        whereConditions.push('(p.plot_number LIKE ? OR l.name LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }
      
      if (whereConditions.length > 0) {
        sql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      // Order by clause
      sql += ' ORDER BY p.created_at DESC';
      
      // Pagination
      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          sql += ' OFFSET ?';
          params.push(parseInt(filters.offset));
        }
      }
      
      const plots = await this.all(sql, params);
      
      // Parse JSON fields
      plots.forEach(plot => {
        if (plot.features) plot.features = JSON.parse(plot.features);
      });
      
      // Get total count for pagination
      let countSql = `
        SELECT COUNT(*) as total 
        FROM plots p
        LEFT JOIN layouts l ON p.layout_id = l.id
      `;
      
      if (whereConditions.length > 0) {
        countSql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      const countResult = await this.get(countSql, params.slice(0, whereConditions.length));
      
      return {
        total: countResult.total,
        data: plots
      };
    } catch (err) {
      console.error('Error getting plots:', err);
      throw err;
    }
  }

  async getPlotById(id) {
    try {
      const plot = await this.get(`
        SELECT 
          p.*,
          l.name as layout_name,
          c.name as client_name,
          c.phone as client_phone,
          c.email as client_email
        FROM plots p
        LEFT JOIN layouts l ON p.layout_id = l.id
        LEFT JOIN clients c ON p.sold_to_client_id = c.id
        WHERE p.id = ?
      `, [id]);
      
      if (!plot) {
        return null;
      }
      
      // Parse JSON fields
      if (plot.features) plot.features = JSON.parse(plot.features);
      
      // Get associated documents
      const documents = await this.all(`
        SELECT * FROM attachments
        WHERE entity_type = 'plot' AND entity_id = ?
        ORDER BY created_at DESC
      `, [id]);
      
      plot.documents = documents;
      
      return plot;
    } catch (err) {
      console.error('Error getting plot by ID:', err);
      throw err;
    }
  }

  async createPlot(plotData, createdBy) {
    try {
      const {
        plot_number,
        layout_id,
        area,
        area_unit,
        dimensions,
        facing,
        price,
        status,
        is_prime,
        features
      } = plotData;
      
      // Check if layout exists
      const layout = await this.get('SELECT id FROM layouts WHERE id = ?', [layout_id]);
      
      if (!layout) {
        return { error: 'Layout does not exist' };
      }
      
      // Check if plot number already exists in this layout
      const existingPlot = await this.get(
        'SELECT id FROM plots WHERE plot_number = ? AND layout_id = ?',
        [plot_number, layout_id]
      );
      
      if (existingPlot) {
        return { error: 'Plot number already exists in this layout' };
      }
      
      // Convert arrays to JSON strings
      const featuresJson = features ? JSON.stringify(features) : null;
      
      const result = await this.run(
        `INSERT INTO plots (
          plot_number, layout_id, area, area_unit, dimensions,
          facing, price, status, is_prime, features
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          plot_number, layout_id, area, area_unit || 'sqft', dimensions,
          facing, price, status || 'available', is_prime ? 1 : 0, featuresJson
        ]
      );
      
      // Log activity
      await this.logActivity(createdBy, 'CREATE', 'plot', result.lastID, { plot_number, layout_id });
      
      return { id: result.lastID };
    } catch (err) {
      console.error('Error creating plot:', err);
      throw err;
    }
  }

  async updatePlot(id, plotData, updatedBy) {
    try {
      const {
        plot_number,
        layout_id,
        area,
        area_unit,
        dimensions,
        facing,
        price,
        status,
        is_prime,
        features,
        sold_to_client_id,
        sold_date
      } = plotData;
      
      // Build update query dynamically
      const fields = [];
      const params = [];
      
      if (plot_number !== undefined) {
        // Check if plot number already exists in this layout
        if (layout_id !== undefined) {
          const existingPlot = await this.get(
            'SELECT id FROM plots WHERE plot_number = ? AND layout_id = ? AND id != ?',
            [plot_number, layout_id, id]
          );
          
          if (existingPlot) {
            return { error: 'Plot number already exists in this layout' };
          }
        }
        
        fields.push('plot_number = ?');
        params.push(plot_number);
      }
      
      if (layout_id !== undefined) {
        // Check if layout exists
        const layout = await this.get('SELECT id FROM layouts WHERE id = ?', [layout_id]);
        
        if (!layout) {
          return { error: 'Layout does not exist' };
        }
        
        fields.push('layout_id = ?');
        params.push(layout_id);
      }
      
      if (area !== undefined) {
        fields.push('area = ?');
        params.push(area);
      }
      
      if (area_unit !== undefined) {
        fields.push('area_unit = ?');
        params.push(area_unit);
      }
      
      if (dimensions !== undefined) {
        fields.push('dimensions = ?');
        params.push(dimensions);
      }
      
      if (facing !== undefined) {
        fields.push('facing = ?');
        params.push(facing);
      }
      
      if (price !== undefined) {
        fields.push('price = ?');
        params.push(price);
      }
      
      if (status !== undefined) {
        fields.push('status = ?');
        params.push(status);
        
        // If status changed to sold, update client and sold date
        if (status === 'sold') {
          if (sold_to_client_id === undefined) {
            return { error: 'Client ID is required when status is set to sold' };
          }
          
          fields.push('sold_to_client_id = ?');
          params.push(sold_to_client_id);
          
          fields.push('sold_date = ?');
          params.push(sold_date || new Date().toISOString());
        }
      }
      
      if (is_prime !== undefined) {
        fields.push('is_prime = ?');
        params.push(is_prime ? 1 : 0);
      }
      
      if (features !== undefined) {
        fields.push('features = ?');
        params.push(JSON.stringify(features));
      }
      
      if (sold_to_client_id !== undefined && status !== 'sold') {
        fields.push('sold_to_client_id = ?');
        params.push(sold_to_client_id);
      }
      
      if (sold_date !== undefined && status !== 'sold') {
        fields.push('sold_date = ?');
        params.push(sold_date);
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      
      if (fields.length === 0) {
        return { error: 'No fields to update' };
      }
      
      // Add ID to params
      params.push(id);
      
      const result = await this.run(
        `UPDATE plots SET ${fields.join(', ')} WHERE id = ?`,
        params
      );
      
      // Log activity
      await this.logActivity(updatedBy, 'UPDATE', 'plot', id, { fields: Object.keys(plotData) });
      
      return { changes: result.changes };
    } catch (err) {
      console.error('Error updating plot:', err);
      throw err;
    }
  }

  async deletePlot(id, deletedBy) {
    try {
      // Check if plot exists
      const plot = await this.get('SELECT plot_number, status FROM plots WHERE id = ?', [id]);
      
      if (!plot) {
        return { error: 'Plot not found' };
      }
      
      // Check if plot is sold or has billings
      if (plot.status === 'sold') {
        return { error: 'Cannot delete a sold plot' };
      }
      
      const billingCount = await this.get(
        'SELECT COUNT(*) as count FROM billings WHERE plot_id = ?',
        [id]
      );
      
      if (billingCount.count > 0) {
        return { error: 'Cannot delete plot with associated billings' };
      }
      
      // Delete plot attachments
      await this.run('DELETE FROM attachments WHERE entity_type = "plot" AND entity_id = ?', [id]);
      
      // Delete plot
      const result = await this.run('DELETE FROM plots WHERE id = ?', [id]);
      
      // Log activity
      await this.logActivity(deletedBy, 'DELETE', 'plot', id, { plot_number: plot.plot_number });
      
      return { changes: result.changes };
    } catch (err) {
      console.error('Error deleting plot:', err);
      throw err;
    }
  }

  // Expenses API methods
  async getExpenseCategories() {
    try {
      return await this.all('SELECT * FROM expense_categories ORDER BY name');
    } catch (err) {
      console.error('Error getting expense categories:', err);
      throw err;
    }
  }

  async getExpenses(filters = {}) {
    try {
      let sql = `
        SELECT 
          e.*,
          c.name as category_name,
          l.name as layout_name,
          p.plot_number,
          u.name as approved_by_name,
          cu.name as created_by_name
        FROM expenses e
        LEFT JOIN expense_categories c ON e.category_id = c.id
        LEFT JOIN layouts l ON e.layout_id = l.id
        LEFT JOIN plots p ON e.plot_id = p.id
        LEFT JOIN users u ON e.approved_by = u.id
        LEFT JOIN users cu ON e.created_by = cu.id
      `;
      
      const params = [];
      const whereConditions = [];
      
      if (filters.category_id) {
        whereConditions.push('e.category_id = ?');
        params.push(filters.category_id);
      }
      
      if (filters.layout_id) {
        whereConditions.push('e.layout_id = ?');
        params.push(filters.layout_id);
      }
      
      if (filters.start_date) {
        whereConditions.push('e.date >= ?');
        params.push(filters.start_date);
      }
      
      if (filters.end_date) {
        whereConditions.push('e.date <= ?');
        params.push(filters.end_date);
      }
      
      if (filters.min_amount) {
        whereConditions.push('e.amount >= ?');
        params.push(parseFloat(filters.min_amount));
      }
      
      if (filters.max_amount) {
        whereConditions.push('e.amount <= ?');
        params.push(parseFloat(filters.max_amount));
      }
      
      if (filters.status) {
        whereConditions.push('e.status = ?');
        params.push(filters.status);
      }
      
      if (filters.is_black !== undefined) {
        whereConditions.push('e.is_black = ?');
        params.push(filters.is_black ? 1 : 0);
      }
      
      if (filters.search) {
        whereConditions.push('(e.description LIKE ? OR e.vendor LIKE ? OR l.name LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      if (whereConditions.length > 0) {
        sql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      // Order by clause
      sql += ' ORDER BY e.date DESC';
      
      // Pagination
      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          sql += ' OFFSET ?';
          params.push(parseInt(filters.offset));
        }
      }
      
      const expenses = await this.all(sql, params);
      
      // Parse JSON fields
      expenses.forEach(expense => {
        if (expense.tags) expense.tags = JSON.parse(expense.tags);
      });
      
      // Get total count for pagination
      let countSql = `
        SELECT COUNT(*) as total 
        FROM expenses e
        LEFT JOIN layouts l ON e.layout_id = l.id
      `;
      
      if (whereConditions.length > 0) {
        countSql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      const countResult = await this.get(countSql, params.slice(0, whereConditions.length));
      
      // Get total sum of filtered expenses
      let sumSql = `
        SELECT SUM(amount) as total_amount
        FROM expenses e
        LEFT JOIN layouts l ON e.layout_id = l.id
      `;
      
      if (whereConditions.length > 0) {
        sumSql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      const sumResult = await this.get(sumSql, params.slice(0, whereConditions.length));
      
      return {
        total: countResult.total,
        total_amount: sumResult.total_amount || 0,
        data: expenses
      };
    } catch (err) {
      console.error('Error getting expenses:', err);
      throw err;
    }
  }

  async getExpenseById(id) {
    try {
      const expense = await this.get(`
        SELECT 
          e.*,
          c.name as category_name,
          l.name as layout_name,
          p.plot_number,
          u.name as approved_by_name,
          cu.name as created_by_name
        FROM expenses e
        LEFT JOIN expense_categories c ON e.category_id = c.id
        LEFT JOIN layouts l ON e.layout_id = l.id
        LEFT JOIN plots p ON e.plot_id = p.id
        LEFT JOIN users u ON e.approved_by = u.id
        LEFT JOIN users cu ON e.created_by = cu.id
        WHERE e.id = ?
      `, [id]);
      
      if (!expense) {
        return null;
      }
      
      // Parse JSON fields
      if (expense.tags) expense.tags = JSON.parse(expense.tags);
      
      // Get attachments
      const attachments = await this.all(`
        SELECT * FROM attachments
        WHERE entity_type = 'expense' AND entity_id = ?
        ORDER BY created_at DESC
      `, [id]);
      
      expense.attachments = attachments;
      
      return expense;
    } catch (err) {
      console.error('Error getting expense by ID:', err);
      throw err;
    }
  }

  async createExpense(expenseData, createdBy) {
    try {
      const {
        description,
        category_id,
        vendor,
        amount,
        gov_price,
        market_price,
        is_black,
        date,
        notes,
        payment_mode,
        layout_id,
        plot_id,
        status,
        tags
      } = expenseData;
      
      // Check if category exists
      if (category_id) {
        const category = await this.get('SELECT id FROM expense_categories WHERE id = ?', [category_id]);
        if (!category) {
          return { error: 'Category does not exist' };
        }
      }
      
      // Check if layout exists
      if (layout_id) {
        const layout = await this.get('SELECT id FROM layouts WHERE id = ?', [layout_id]);
        if (!layout) {
          return { error: 'Layout does not exist' };
        }
      }
      
      // Check if plot exists
      if (plot_id) {
        const plot = await this.get('SELECT id FROM plots WHERE id = ?', [plot_id]);
        if (!plot) {
          return { error: 'Plot does not exist' };
        }
      }
      
      // Convert arrays to JSON strings
      const tagsJson = tags ? JSON.stringify(tags) : null;
      
      const result = await this.run(
        `INSERT INTO expenses (
          description, category_id, vendor, amount, gov_price, market_price,
          is_black, date, notes, payment_mode, layout_id, plot_id,
          status, tags, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          description, category_id, vendor, amount, gov_price, market_price,
          is_black ? 1 : 0, date, notes, payment_mode, layout_id, plot_id,
          status || 'pending', tagsJson, createdBy
        ]
      );
      
      // Log activity
      await this.logActivity(createdBy, 'CREATE', 'expense', result.lastID, { description, amount });
      
      return { id: result.lastID };
    } catch (err) {
      console.error('Error creating expense:', err);
      throw err;
    }
  }

  async updateExpense(id, expenseData, updatedBy) {
    try {
      const {
        description,
        category_id,
        vendor,
        amount,
        gov_price,
        market_price,
        is_black,
        date,
        notes,
        payment_mode,
        layout_id,
        plot_id,
        status,
        approved_by,
        tags
      } = expenseData;
      
      // Build update query dynamically
      const fields = [];
      const params = [];
      
      if (description !== undefined) {
        fields.push('description = ?');
        params.push(description);
      }
      
      if (category_id !== undefined) {
        // Check if category exists
        const category = await this.get('SELECT id FROM expense_categories WHERE id = ?', [category_id]);
        if (!category) {
          return { error: 'Category does not exist' };
        }
        
        fields.push('category_id = ?');
        params.push(category_id);
      }
      
      if (vendor !== undefined) {
        fields.push('vendor = ?');
        params.push(vendor);
      }
      
      if (amount !== undefined) {
        fields.push('amount = ?');
        params.push(amount);
      }
      
      if (gov_price !== undefined) {
        fields.push('gov_price = ?');
        params.push(gov_price);
      }
      
      if (market_price !== undefined) {
        fields.push('market_price = ?');
        params.push(market_price);
      }
      
      if (is_black !== undefined) {
        fields.push('is_black = ?');
        params.push(is_black ? 1 : 0);
      }
      
      if (date !== undefined) {
        fields.push('date = ?');
        params.push(date);
      }
      
      if (notes !== undefined) {
        fields.push('notes = ?');
        params.push(notes);
      }
      
      if (payment_mode !== undefined) {
        fields.push('payment_mode = ?');
        params.push(payment_mode);
      }
      
      if (layout_id !== undefined) {
        // Check if layout exists
        if (layout_id !== null) {
          const layout = await this.get('SELECT id FROM layouts WHERE id = ?', [layout_id]);
          if (!layout) {
            return { error: 'Layout does not exist' };
          }
        }
        
        fields.push('layout_id = ?');
        params.push(layout_id);
      }
      
      if (plot_id !== undefined) {
        // Check if plot exists
        if (plot_id !== null) {
          const plot = await this.get('SELECT id FROM plots WHERE id = ?', [plot_id]);
          if (!plot) {
            return { error: 'Plot does not exist' };
          }
        }
        
        fields.push('plot_id = ?');
        params.push(plot_id);
      }
      
      if (status !== undefined) {
        fields.push('status = ?');
        params.push(status);
        
        // If status is approved, set approved_by
        if (status === 'approved' && approved_by !== undefined) {
          fields.push('approved_by = ?');
          params.push(approved_by);
        }
      }
      
      if (approved_by !== undefined && status !== 'approved') {
        fields.push('approved_by = ?');
        params.push(approved_by);
      }
      
      if (tags !== undefined) {
        fields.push('tags = ?');
        params.push(JSON.stringify(tags));
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      
      if (fields.length === 0) {
        return { error: 'No fields to update' };
      }
      
      // Add ID to params
      params.push(id);
      
      const result = await this.run(
        `UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`,
        params
      );
      
      // Log activity
      await this.logActivity(updatedBy, 'UPDATE', 'expense', id, { fields: Object.keys(expenseData) });
      
      return { changes: result.changes };
    } catch (err) {
      console.error('Error updating expense:', err);
      throw err;
    }
  }

  async deleteExpense(id, deletedBy) {
    try {
      // Check if expense exists
      const expense = await this.get('SELECT description FROM expenses WHERE id = ?', [id]);
      
      if (!expense) {
        return { error: 'Expense not found' };
      }
      
      // Delete attachments
      await this.run('DELETE FROM attachments WHERE entity_type = "expense" AND entity_id = ?', [id]);
      
      // Delete expense
      const result = await this.run('DELETE FROM expenses WHERE id = ?', [id]);
      
      // Log activity
      await this.logActivity(deletedBy, 'DELETE', 'expense', id, { description: expense.description });
      
      return { changes: result.changes };
    } catch (err) {
      console.error('Error deleting expense:', err);
      throw err;
    }
  }

  // Attachments/Documents API methods
  async addAttachment(entityType, entityId, fileData, uploadedBy) {
    try {
      const { filename, filepath, filetype, filesize } = fileData;
      
      const result = await this.run(
        'INSERT INTO attachments (entity_type, entity_id, filename, filepath, filetype, filesize, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [entityType, entityId, filename, filepath, filetype, filesize, uploadedBy]
      );
      
      // Log activity
      await this.logActivity(uploadedBy, 'UPLOAD', entityType, entityId, { filename });
      
      return {
        id: result.lastID,
        filename,
        filepath,
        filetype,
        filesize,
        uploaded_by: uploadedBy,
        created_at: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error adding attachment:', err);
      throw err;
    }
  }

  async deleteAttachment(id, deletedBy) {
    try {
      // Get attachment info for activity log
      const attachment = await this.get(
        'SELECT entity_type, entity_id, filename, filepath FROM attachments WHERE id = ?',
        [id]
      );
      
      if (!attachment) {
        return { error: 'Attachment not found' };
      }
      
      // Delete attachment record
      const result = await this.run('DELETE FROM attachments WHERE id = ?', [id]);
      
      // Log activity
      await this.logActivity(
        deletedBy,
        'DELETE',
        'attachment',
        id,
        {
          entityType: attachment.entity_type,
          entityId: attachment.entity_id,
          filename: attachment.filename
        }
      );
      
      return {
        changes: result.changes,
        filepath: attachment.filepath
      };
    } catch (err) {
      console.error('Error deleting attachment:', err);
      throw err;
    }
  }

  // Client API methods
  async getClients(filters = {}) {
    try {
      let sql = `
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM plots WHERE sold_to_client_id = c.id) as plots_purchased,
          (SELECT SUM(b.total_amount) FROM billings b WHERE b.client_id = c.id) as total_spent
        FROM clients c
      `;
      
      const params = [];
      const whereConditions = [];
      
      if (filters.status) {
        whereConditions.push('c.status = ?');
        params.push(filters.status);
      }
      
      if (filters.search) {
        whereConditions.push('(c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      if (whereConditions.length > 0) {
        sql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      // Order by clause
      sql += ' ORDER BY c.created_at DESC';
      
      // Pagination
      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          sql += ' OFFSET ?';
          params.push(parseInt(filters.offset));
        }
      }
      
      const clients = await this.all(sql, params);
      
      // Get total count for pagination
      let countSql = 'SELECT COUNT(*) as total FROM clients c';
      
      if (whereConditions.length > 0) {
        countSql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      const countResult = await this.get(countSql, params.slice(0, whereConditions.length));
      
      return {
        total: countResult.total,
        data: clients
      };
    } catch (err) {
      console.error('Error getting clients:', err);
      throw err;
    }
  }

  async getClientById(id) {
    try {
      const client = await this.get(`
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM plots WHERE sold_to_client_id = c.id) as plots_purchased,
          (SELECT SUM(b.total_amount) FROM billings b WHERE b.client_id = c.id) as total_spent,
          (SELECT name FROM users WHERE id = c.created_by) as created_by_name
        FROM clients c
        WHERE c.id = ?
      `, [id]);
      
      if (!client) {
        return null;
      }
      
      // Get plots purchased by client
      const plots = await this.all(`
        SELECT 
          p.*,
          l.name as layout_name
        FROM plots p
        JOIN layouts l ON p.layout_id = l.id
        WHERE p.sold_to_client_id = ?
      `, [id]);
      
      client.plots = plots;
      
      // Get billings for client
      const billings = await this.all(`
        SELECT 
          b.*,
          l.name as layout_name,
          p.plot_number
        FROM billings b
        JOIN layouts l ON b.layout_id = l.id
        JOIN plots p ON b.plot_id = p.id
        WHERE b.client_id = ?
        ORDER BY b.created_at DESC
      `, [id]);
      
      client.billings = billings;
      
      // Get client interactions
      const interactions = await this.all(`
        SELECT 
          ci.*,
          u.name as created_by_name
        FROM client_interactions ci
        LEFT JOIN users u ON ci.created_by = u.id
        WHERE ci.client_id = ?
        ORDER BY ci.date DESC
      `, [id]);
      
      client.interactions = interactions;
      
      // Get client documents
      const documents = await this.all(`
        SELECT * FROM attachments
        WHERE entity_type = 'client' AND entity_id = ?
        ORDER BY created_at DESC
      `, [id]);
      
      client.documents = documents;
      
      return client;
    } catch (err) {
      console.error('Error getting client by ID:', err);
      throw err;
    }
  }

  async createClient(clientData, createdBy) {
    try {
      const { name, phone, email, address, notes, status } = clientData;
      
      // Check if phone number already exists
      const existingClient = await this.get('SELECT id FROM clients WHERE phone = ?', [phone]);
      
      if (existingClient) {
        return { error: 'Phone number already exists' };
      }
      
      // Check if email already exists (if provided)
      if (email) {
        const existingEmail = await this.get('SELECT id FROM clients WHERE email = ?', [email]);
        
        if (existingEmail) {
          return { error: 'Email already exists' };
        }
      }
      
      const result = await this.run(
        'INSERT INTO clients (name, phone, email, address, notes, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, phone, email, address, notes, status || 'active', createdBy]
      );
      
      // Log activity
      await this.logActivity(createdBy, 'CREATE', 'client', result.lastID, { name, phone });
      
      return { id: result.lastID };
    } catch (err) {
      console.error('Error creating client:', err);
      throw err;
    }
  }

  async updateClient(id, clientData, updatedBy) {
    try {
      const { name, phone, email, address, notes, status } = clientData;
      
      // Build update query dynamically
      const fields = [];
      const params = [];
      
      if (name !== undefined) {
        fields.push('name = ?');
        params.push(name);
      }
      
      if (phone !== undefined) {
        // Check if phone number already exists
        const existingClient = await this.get('SELECT id FROM clients WHERE phone = ? AND id != ?', [phone, id]);
        
        if (existingClient) {
          return { error: 'Phone number already exists' };
        }
        
        fields.push('phone = ?');
        params.push(phone);
      }
      
      if (email !== undefined) {
        // Check if email already exists
        if (email) {
          const existingEmail = await this.get('SELECT id FROM clients WHERE email = ? AND id != ?', [email, id]);
          
          if (existingEmail) {
            return { error: 'Email already exists' };
          }
        }
        
        fields.push('email = ?');
        params.push(email);
      }
      
      if (address !== undefined) {
        fields.push('address = ?');
        params.push(address);
      }
      
      if (notes !== undefined) {
        fields.push('notes = ?');
        params.push(notes);
      }
      
      if (status !== undefined) {
        fields.push('status = ?');
        params.push(status);
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      
      if (fields.length === 0) {
        return { error: 'No fields to update' };
      }
      
      // Add ID to params
      params.push(id);
      
      const result = await this.run(
        `UPDATE clients SET ${fields.join(', ')} WHERE id = ?`,
        params
      );
      
      // Log activity
      await this.logActivity(updatedBy, 'UPDATE', 'client', id, { fields: Object.keys(clientData) });
      
      return { changes: result.changes };
    } catch (err) {
      console.error('Error updating client:', err);
      throw err;
    }
  }

  async deleteClient(id, deletedBy) {
    try {
      // Check if client exists
      const client = await this.get('SELECT name FROM clients WHERE id = ?', [id]);
      
      if (!client) {
        return { error: 'Client not found' };
      }
      
      // Check if client has any plots
      const plotsCount = await this.get('SELECT COUNT(*) as count FROM plots WHERE sold_to_client_id = ?', [id]);
      
      if (plotsCount.count > 0) {
        return { error: 'Cannot delete client with purchased plots' };
      }
      
      // Check if client has any billings
      const billingsCount = await this.get('SELECT COUNT(*) as count FROM billings WHERE client_id = ?', [id]);
      
      if (billingsCount.count > 0) {
        return { error: 'Cannot delete client with billing records' };
      }
      
      // Delete client interactions
      await this.run('DELETE FROM client_interactions WHERE client_id = ?', [id]);
      
      // Delete attachments
      await this.run('DELETE FROM attachments WHERE entity_type = "client" AND entity_id = ?', [id]);
      
      // Delete client
      const result = await this.run('DELETE FROM clients WHERE id = ?', [id]);
      
      // Log activity
      await this.logActivity(deletedBy, 'DELETE', 'client', id, { name: client.name });
      
      return { changes: result.changes };
    } catch (err) {
      console.error('Error deleting client:', err);
      throw err;
    }
  }

  // Billing API methods
  async getBillings(filters = {}) {
    try {
      let sql = `
        SELECT 
          b.*,
          c.name as client_name,
          c.phone as client_phone,
          l.name as layout_name,
          p.plot_number,
          u.name as generated_by_name
        FROM billings b
        JOIN clients c ON b.client_id = c.id
        JOIN layouts l ON b.layout_id = l.id
        JOIN plots p ON b.plot_id = p.id
        LEFT JOIN users u ON b.generated_by = u.id
      `;
      
      const params = [];
      const whereConditions = [];
      
      if (filters.layout_id) {
        whereConditions.push('b.layout_id = ?');
        params.push(filters.layout_id);
      }
      
      if (filters.client_id) {
        whereConditions.push('b.client_id = ?');
        params.push(filters.client_id);
      }
      
      if (filters.plot_id) {
        whereConditions.push('b.plot_id = ?');
        params.push(filters.plot_id);
      }
      
      if (filters.status) {
        whereConditions.push('b.status = ?');
        params.push(filters.status);
      }
      
      if (filters.start_date) {
        whereConditions.push('b.created_at >= ?');
        params.push(filters.start_date);
      }
      
      if (filters.end_date) {
        whereConditions.push('b.created_at <= ?');
        params.push(filters.end_date);
      }
      
      if (filters.search) {
        whereConditions.push('(b.bill_number LIKE ? OR c.name LIKE ? OR c.phone LIKE ? OR l.name LIKE ? OR p.plot_number LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      if (whereConditions.length > 0) {
        sql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      // Order by clause
      sql += ' ORDER BY b.created_at DESC';
      
      // Pagination
      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          sql += ' OFFSET ?';
          params.push(parseInt(filters.offset));
        }
      }
      
      const billings = await this.all(sql, params);
      
      // Get total count for pagination
      let countSql = `
        SELECT COUNT(*) as total 
        FROM billings b
        JOIN clients c ON b.client_id = c.id
        JOIN layouts l ON b.layout_id = l.id
        JOIN plots p ON b.plot_id = p.id
      `;
      
      if (whereConditions.length > 0) {
        countSql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      const countResult = await this.get(countSql, params.slice(0, whereConditions.length));
      
      // Get total amount for filtered billings
      let sumSql = `
        SELECT SUM(total_amount) as total_amount, SUM(gov_amount) as total_gov_amount
        FROM billings b
        JOIN clients c ON b.client_id = c.id
        JOIN layouts l ON b.layout_id = l.id
        JOIN plots p ON b.plot_id = p.id
      `;
      
      if (whereConditions.length > 0) {
        sumSql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      const sumResult = await this.get(sumSql, params.slice(0, whereConditions.length));
      
      return {
        total: countResult.total,
        total_amount: sumResult.total_amount || 0,
        total_gov_amount: sumResult.total_gov_amount || 0,
        data: billings
      };
    } catch (err) {
      console.error('Error getting billings:', err);
      throw err;
    }
  }

  async getBillingById(id) {
    try {
      const billing = await this.get(`
        SELECT 
          b.*,
          c.name as client_name,
          c.phone as client_phone,
          c.email as client_email,
          l.name as layout_name,
          p.plot_number,
          p.area,
          p.area_unit,
          u.name as generated_by_name
        FROM billings b
        JOIN clients c ON b.client_id = c.id
        JOIN layouts l ON b.layout_id = l.id
        JOIN plots p ON b.plot_id = p.id
        LEFT JOIN users u ON b.generated_by = u.id
        WHERE b.id = ?
      `, [id]);
      
      if (!billing) {
        return null;
      }
      
      // Get payments
      const payments = await this.all(`
        SELECT 
          pay.*,
          u.name as created_by_name
        FROM payments pay
        LEFT JOIN users u ON pay.created_by = u.id
        WHERE pay.billing_id = ?
        ORDER BY pay.date DESC
      `, [id]);
      
      billing.payments = payments;
      
      // Get attachments
      const attachments = await this.all(`
        SELECT * FROM attachments
        WHERE entity_type = 'billing' AND entity_id = ?
        ORDER BY created_at DESC
      `, [id]);
      
      billing.attachments = attachments;
      
      return billing;
    } catch (err) {
      console.error('Error getting billing by ID:', err);
      throw err;
    }
  }

  async createBilling(billingData, generatedBy) {
    try {
      const {
        client_id,
        layout_id,
        plot_id,
        total_amount,
        gov_amount,
        is_black,
        payment_type,
        status,
        notes
      } = billingData;
      
      // Check if client exists
      const client = await this.get('SELECT id FROM clients WHERE id = ?', [client_id]);
      
      if (!client) {
        return { error: 'Client does not exist' };
      }
      
      // Check if layout exists
      const layout = await this.get('SELECT id FROM layouts WHERE id = ?', [layout_id]);
      
      if (!layout) {
        return { error: 'Layout does not exist' };
      }
      
      // Check if plot exists
      const plot = await this.get('SELECT id, status FROM plots WHERE id = ?', [plot_id]);
      
      if (!plot) {
        return { error: 'Plot does not exist' };
      }
      
      // Generate bill number
      const billNumberPrefix = 'PS2-B';
      const lastBilling = await this.get('SELECT bill_number FROM billings ORDER BY id DESC LIMIT 1');
      
      let billNumber;
      if (lastBilling) {
        const lastNumber = parseInt(lastBilling.bill_number.replace(billNumberPrefix, ''), 10);
        billNumber = `${billNumberPrefix}${(lastNumber + 1).toString().padStart(3, '0')}`;
      } else {
        billNumber = `${billNumberPrefix}001`;
      }
      
      // Create transaction
      return await this.transaction(async () => {
        // Create billing record
        const result = await this.run(
          `INSERT INTO billings (
            bill_number, client_id, layout_id, plot_id,
            total_amount, gov_amount, is_black, payment_type,
            status, notes, generated_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            billNumber, client_id, layout_id, plot_id,
            total_amount, gov_amount, is_black ? 1 : 0, payment_type,
            status || 'generated', notes, generatedBy
          ]
        );
        
        const billingId = result.lastID;
        
        // Update plot status to sold if billing is successful
        if (plot.status !== 'sold') {
          await this.run(
            'UPDATE plots SET status = ?, sold_to_client_id = ?, sold_date = CURRENT_TIMESTAMP WHERE id = ?',
            ['sold', client_id, plot_id]
          );
        }
        
        // Log activity
        await this.logActivity(generatedBy, 'CREATE', 'billing', billingId, { bill_number: billNumber });
        
        return {
          id: billingId,
          bill_number: billNumber
        };
      });
    } catch (err) {
      console.error('Error creating billing:', err);
      throw err;
    }
  }

  async updateBilling(id, billingData, updatedBy) {
    try {
      const {
        client_id,
        layout_id,
        plot_id,
        total_amount,
        gov_amount,
        is_black,
        payment_type,
        status,
        notes
      } = billingData;
      
      // Build update query dynamically
      const fields = [];
      const params = [];
      
      if (client_id !== undefined) {
        // Check if client exists
        const client = await this.get('SELECT id FROM clients WHERE id = ?', [client_id]);
        
        if (!client) {
          return { error: 'Client does not exist' };
        }
        
        fields.push('client_id = ?');
        params.push(client_id);
      }
      
      if (layout_id !== undefined) {
        // Check if layout exists
        const layout = await this.get('SELECT id FROM layouts WHERE id = ?', [layout_id]);
        
        if (!layout) {
          return { error: 'Layout does not exist' };
        }
        
        fields.push('layout_id = ?');
        params.push(layout_id);
      }
      
      if (plot_id !== undefined) {
        // Check if plot exists
        const plot = await this.get('SELECT id FROM plots WHERE id = ?', [plot_id]);
        
        if (!plot) {
          return { error: 'Plot does not exist' };
        }
        
        fields.push('plot_id = ?');
        params.push(plot_id);
      }
      
      if (total_amount !== undefined) {
        fields.push('total_amount = ?');
        params.push(total_amount);
      }
      
      if (gov_amount !== undefined) {
        fields.push('gov_amount = ?');
        params.push(gov_amount);
      }
      
      if (is_black !== undefined) {
        fields.push('is_black = ?');
        params.push(is_black ? 1 : 0);
      }
      
      if (payment_type !== undefined) {
        fields.push('payment_type = ?');
        params.push(payment_type);
      }
      
      if (status !== undefined) {
        fields.push('status = ?');
        params.push(status);
      }
      
      if (notes !== undefined) {
        fields.push('notes = ?');
        params.push(notes);
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      
      if (fields.length === 0) {
        return { error: 'No fields to update' };
      }
      
      // Add ID to params
      params.push(id);
      
      const result = await this.run(
        `UPDATE billings SET ${fields.join(', ')} WHERE id = ?`,
        params
      );
      
      // Log activity
      await this.logActivity(updatedBy, 'UPDATE', 'billing', id, { fields: Object.keys(billingData) });
      
      return { changes: result.changes };
    } catch (err) {
      console.error('Error updating billing:', err);
      throw err;
    }
  }

  async deleteBilling(id, deletedBy) {
    try {
      // Check if billing exists
      const billing = await this.get(
        'SELECT bill_number, plot_id, status FROM billings WHERE id = ?',
        [id]
      );
      
      if (!billing) {
        return { error: 'Billing not found' };
      }
      
      // Cannot delete completed billings
      if (billing.status === 'paid') {
        return { error: 'Cannot delete paid billing' };
      }
      
      // Create transaction
      return await this.transaction(async () => {
        // Delete payments
        await this.run('DELETE FROM payments WHERE billing_id = ?', [id]);
        
        // Delete attachments
        await this.run('DELETE FROM attachments WHERE entity_type = "billing" AND entity_id = ?', [id]);
        
        // Delete billing
        const result = await this.run('DELETE FROM billings WHERE id = ?', [id]);
        
        // If there are no other billings for this plot, update its status back to available
        const otherBillings = await this.get(
          'SELECT COUNT(*) as count FROM billings WHERE plot_id = ? AND id != ?',
          [billing.plot_id, id]
        );
        
        if (otherBillings.count === 0) {
          await this.run(
            'UPDATE plots SET status = ?, sold_to_client_id = NULL, sold_date = NULL WHERE id = ?',
            ['available', billing.plot_id]
          );
        }
        
        // Log activity
        await this.logActivity(deletedBy, 'DELETE', 'billing', id, { bill_number: billing.bill_number });
        
        return { changes: result.changes };
      });
    } catch (err) {
      console.error('Error deleting billing:', err);
      throw err;
    }
  }

  // Payment API methods
  async addPayment(billingId, paymentData, createdBy) {
    try {
      const { amount, date, payment_mode, reference, notes } = paymentData;
      
      // Check if billing exists
      const billing = await this.get('SELECT id, status FROM billings WHERE id = ?', [billingId]);
      
      if (!billing) {
        return { error: 'Billing not found' };
      }
      
      // Add payment record
      const result = await this.run(
        'INSERT INTO payments (billing_id, amount, date, payment_mode, reference, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [billingId, amount, date, payment_mode, reference, notes, createdBy]
      );
      
      // Update billing status if needed
      const totalPaid = await this.get(
        'SELECT SUM(amount) as total FROM payments WHERE billing_id = ?',
        [billingId]
      );
      
      if (totalPaid.total) {
        const billingDetails = await this.get('SELECT total_amount FROM billings WHERE id = ?', [billingId]);
        
        if (totalPaid.total >= billingDetails.total_amount) {
          await this.run(
            'UPDATE billings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['paid', billingId]
          );
        }
      }
      
      // Log activity
      await this.logActivity(
        createdBy,
        'ADD_PAYMENT',
        'billing',
        billingId,
        { amount, payment_mode }
      );
      
      return { id: result.lastID };
    } catch (err) {
      console.error('Error adding payment:', err);
      throw err;
    }
  }

  // Activity logging
  async logActivity(userId, action, entity, entityId, details) {
    try {
      await this.run(
        'INSERT INTO activity_logs (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [userId, action, entity, entityId, JSON.stringify(details)]
      );
    } catch (err) {
      console.error('Error logging activity:', err);
      // Don't throw, just log the error
    }
  }

  // Analytics methods
  async getDashboardStats() {
    try {
      const stats = {
        layouts: {},
        plots: {},
        revenue: {},
        expenses: {}
      };
      
      // Layouts stats
      const layoutsCount = await this.get('SELECT COUNT(*) as count FROM layouts');
      stats.layouts.total = layoutsCount.count;
      
      // Plots stats
      const plotsStats = await this.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold,
          SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
          SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved
        FROM plots
      `);
      
      stats.plots = {
        total: plotsStats.total,
        sold: plotsStats.sold,
        available: plotsStats.available,
        reserved: plotsStats.reserved
      };
      
      // Revenue stats
      const revenueStats = await this.get(`
        SELECT 
          SUM(total_amount) as total,
          SUM(gov_amount) as gov
        FROM billings
        WHERE status = 'paid'
      `);
      
      stats.revenue = {
        total: revenueStats.total || 0,
        gov: revenueStats.gov || 0,
        black: (revenueStats.total || 0) - (revenueStats.gov || 0)
      };
      
      // Expenses stats
      const expensesStats = await this.get(`
        SELECT 
          SUM(amount) as total,
          SUM(CASE WHEN is_black = 1 THEN amount ELSE 0 END) as black,
          SUM(CASE WHEN is_black = 0 THEN amount ELSE 0 END) as gov
        FROM expenses
        WHERE status = 'approved'
      `);
      
      stats.expenses = {
        total: expensesStats.total || 0,
        black: expensesStats.black || 0,
        gov: expensesStats.gov || 0
      };
      
      // Monthly revenue for the last 12 months
      const monthlyRevenue = await this.all(`
        SELECT 
          strftime('%Y-%m', created_at) as month,
          SUM(total_amount) as amount
        FROM billings
        WHERE status = 'paid'
          AND created_at >= datetime('now', '-12 months')
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month
      `);
      
      stats.revenue.monthly = monthlyRevenue;
      
      // Recent billings
      const recentBillings = await this.all(`
        SELECT 
          b.id,
          b.bill_number,
          b.total_amount,
          b.gov_amount,
          b.status,
          b.created_at,
          c.name as client_name,
          l.name as layout_name,
          p.plot_number
        FROM billings b
        JOIN clients c ON b.client_id = c.id
        JOIN layouts l ON b.layout_id = l.id
        JOIN plots p ON b.plot_id = p.id
        ORDER BY b.created_at DESC
        LIMIT 5
      `);
      
      stats.recentBillings = recentBillings;
      
      // Recent expenses
      const recentExpenses = await this.all(`
        SELECT 
          e.id,
          e.description,
          e.amount,
          e.date,
          e.status,
          c.name as category_name,
          l.name as layout_name
        FROM expenses e
        LEFT JOIN expense_categories c ON e.category_id = c.id
        LEFT JOIN layouts l ON e.layout_id = l.id
        ORDER BY e.date DESC
        LIMIT 5
      `);
      
      stats.recentExpenses = recentExpenses;
      
      // Top performing layouts
      const topLayouts = await this.all(`
        SELECT 
          l.id,
          l.name,
          COUNT(p.id) as plots_sold,
          SUM(b.total_amount) as revenue
        FROM layouts l
        JOIN plots p ON p.layout_id = l.id AND p.status = 'sold'
        JOIN billings b ON b.plot_id = p.id
        GROUP BY l.id
        ORDER BY revenue DESC
        LIMIT 5
      `);
      
      stats.topLayouts = topLayouts;
      
      return stats;
    } catch (err) {
      console.error('Error getting dashboard stats:', err);
      throw err;
    }
  }

  async getPlotsSoldChartData(period = 'year') {
    try {
      let sql, format;
      
      // Determine SQL query based on period
      if (period === 'month') {
        // Data for current month, daily
        sql = `
          SELECT 
            strftime('%d', p.sold_date) as name,
            COUNT(*) as sold,
            30 as target
          FROM plots p
          WHERE p.status = 'sold'
            AND p.sold_date >= datetime('now', 'start of month')
          GROUP BY strftime('%d', p.sold_date)
          ORDER BY name
        `;
        format = '%d'; // Day of month
      } else if (period === 'quarter') {
        // Data for current quarter, weekly
        sql = `
          SELECT 
            'Week ' || ((strftime('%j', p.sold_date) - strftime('%j', date(p.sold_date, 'start of year', '+3 months', '-3 months', '-7 days')) + 7) / 7) as name,
            COUNT(*) as sold,
            20 as target
          FROM plots p
          WHERE p.status = 'sold'
            AND p.sold_date >= datetime('now', 'start of month', '-2 months')
            AND p.sold_date <= datetime('now', 'start of month', '+1 month', '-1 day')
          GROUP BY ((strftime('%j', p.sold_date) - strftime('%j', date(p.sold_date, 'start of year', '+3 months', '-3 months', '-7 days')) + 7) / 7)
          ORDER BY ((strftime('%j', p.sold_date) - strftime('%j', date(p.sold_date, 'start of year', '+3 months', '-3 months', '-7 days')) + 7) / 7)
        `;
      } else {
        // Data for current year, monthly
        sql = `
          SELECT 
            CASE 
              WHEN strftime('%m', p.sold_date) = '01' THEN 'Jan'
              WHEN strftime('%m', p.sold_date) = '02' THEN 'Feb'
              WHEN strftime('%m', p.sold_date) = '03' THEN 'Mar'
              WHEN strftime('%m', p.sold_date) = '04' THEN 'Apr'
              WHEN strftime('%m', p.sold_date) = '05' THEN 'May'
              WHEN strftime('%m', p.sold_date) = '06' THEN 'Jun'
              WHEN strftime('%m', p.sold_date) = '07' THEN 'Jul'
              WHEN strftime('%m', p.sold_date) = '08' THEN 'Aug'
              WHEN strftime('%m', p.sold_date) = '09' THEN 'Sep'
              WHEN strftime('%m', p.sold_date) = '10' THEN 'Oct'
              WHEN strftime('%m', p.sold_date) = '11' THEN 'Nov'
              WHEN strftime('%m', p.sold_date) = '12' THEN 'Dec'
            END as name,
            COUNT(*) as sold,
            15 as target
          FROM plots p
          WHERE p.status = 'sold'
            AND p.sold_date >= datetime('now', 'start of year')
          GROUP BY strftime('%m', p.sold_date)
          ORDER BY strftime('%m', p.sold_date)
        `;
        format = '%b'; // Month name abbreviated
      }
      
      const data = await this.all(sql);
      
      // Fill in missing periods with zeros
      const result = [];
      
      if (period === 'month') {
        // Fill in days of month
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        
        for (let i = 1; i <= daysInMonth; i++) {
          const day = i.toString().padStart(2, '0');
          const existingData = data.find(d => d.name === day);
          
          if (existingData) {
            result.push(existingData);
          } else {
            result.push({ name: day, sold: 0, target: 30 });
          }
        }
      } else if (period === 'quarter') {
        // Fill in weeks of quarter (roughly 13 weeks)
        for (let i = 1; i <= 13; i++) {
          const week = `Week ${i}`;
          const existingData = data.find(d => d.name === week);
          
          if (existingData) {
            result.push(existingData);
          } else {
            result.push({ name: week, sold: 0, target: 20 });
          }
        }
      } else {
        // Fill in months of year
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for (const month of months) {
          const existingData = data.find(d => d.name === month);
          
          if (existingData) {
            result.push(existingData);
          } else {
            result.push({ name: month, sold: 0, target: 15 });
          }
        }
      }
      
      return result;
    } catch (err) {
      console.error('Error getting plots sold chart data:', err);
      throw err;
    }
  }

  // Backup methods
  async createBackup(backupType, userId) {
    try {
      const date = new Date();
      const timestamp = date.toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(app.getPath('userData'), 'backups');
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const backupPath = path.join(backupDir, `ps2_estate_nexus_backup_${timestamp}.db`);
      
      // Create backup by copying the current database file
      return new Promise((resolve, reject) => {
        const rd = fs.createReadStream(this.dbPath);
        const wr = fs.createWriteStream(backupPath);
        
        rd.on('error', reject);
        wr.on('error', reject);
        
        wr.on('finish', async () => {
          try {
            // Get file size
            const stats = fs.statSync(backupPath);
            const fileSizeInBytes = stats.size;
            const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
            
            // Log backup
            const result = await this.run(
              'INSERT INTO backup_logs (type, status, size, filepath, user_id) VALUES (?, ?, ?, ?, ?)',
              [backupType, 'success', fileSizeInBytes, backupPath, userId]
            );
            
            resolve({
              id: result.lastID,
              path: backupPath,
              size: `${fileSizeInMB} MB`,
              timestamp: date.toISOString()
            });
          } catch (err) {
            reject(err);
          }
        });
        
        rd.pipe(wr);
      });
    } catch (err) {
      console.error('Error creating backup:', err);
      
      // Log failed backup attempt
      await this.run(
        'INSERT INTO backup_logs (type, status, notes, user_id) VALUES (?, ?, ?, ?)',
        [backupType, 'error', err.message, userId]
      );
      
      throw err;
    }
  }

  async getBackupLogs() {
    try {
      return await this.all(`
        SELECT 
          b.*,
          u.name as user_name
        FROM backup_logs b
        LEFT JOIN users u ON b.user_id = u.id
        ORDER BY b.created_at DESC
      `);
    } catch (err) {
      console.error('Error getting backup logs:', err);
      throw err;
    }
  }

  async restoreFromBackup(backupPath, userId) {
    try {
      // Validate that the backup file exists
      if (!fs.existsSync(backupPath)) {
        return { error: 'Backup file not found' };
      }
      
      // Close current database connection
      await this.close();
      
      // Create a backup of current database before restoring
      const currentBackupPath = `${this.dbPath}.before_restore.${Date.now()}.db`;
      fs.copyFileSync(this.dbPath, currentBackupPath);
      
      // Replace current database with backup
      fs.copyFileSync(backupPath, this.dbPath);
      
      // Re-initialize database connection
      await this.initialize();
      
      // Log restore activity
      await this.logActivity(userId, 'RESTORE_BACKUP', 'system', null, { backup_path: backupPath });
      
      return { success: true, message: 'Database restored successfully' };
    } catch (err) {
      console.error('Error restoring from backup:', err);
      
      // Try to re-initialize if restore failed
      try {
        await this.initialize();
      } catch (initErr) {
        console.error('Failed to re-initialize database after restore failure:', initErr);
      }
      
      throw err;
    }
  }

  // Settings methods
  async getSettings() {
    try {
      let settings = await this.get('SELECT * FROM settings WHERE id = 1');
      
      if (!settings) {
        // Initialize settings if they don't exist
        await this.run('INSERT INTO settings (id) VALUES (1)');
        settings = await this.get('SELECT * FROM settings WHERE id = 1');
      }
      
      return settings;
    } catch (err) {
      console.error('Error getting settings:', err);
      throw err;
    }
  }

  async updateSettings(settingsData, updatedBy) {
    try {
      const {
        company_name,
        company_address,
        company_phone,
        company_email,
        company_logo,
        backup_schedule,
        backup_location,
        backup_retention
      } = settingsData;
      
      // Build update query dynamically
      const fields = [];
      const params = [];
      
      if (company_name !== undefined) {
        fields.push('company_name = ?');
        params.push(company_name);
      }
      
      if (company_address !== undefined) {
        fields.push('company_address = ?');
        params.push(company_address);
      }
      
      if (company_phone !== undefined) {
        fields.push('company_phone = ?');
        params.push(company_phone);
      }
      
      if (company_email !== undefined) {
        fields.push('company_email = ?');
        params.push(company_email);
      }
      
      if (company_logo !== undefined) {
        fields.push('company_logo = ?');
        params.push(company_logo);
      }
      
      if (backup_schedule !== undefined) {
        fields.push('backup_schedule = ?');
        params.push(backup_schedule);
      }
      
      if (backup_location !== undefined) {
        fields.push('backup_location = ?');
        params.push(backup_location);
      }
      
      if (backup_retention !== undefined) {
        fields.push('backup_retention = ?');
        params.push(backup_retention);
      }
      
      fields.push('updated_by = ?');
      params.push(updatedBy);
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      
      if (fields.length === 0) {
        return { error: 'No fields to update' };
      }
      
      // Add ID to params
      params.push(1); // Settings always have ID = 1
      
      const result = await this.run(
        `UPDATE settings SET ${fields.join(', ')} WHERE id = ?`,
        params
      );
      
      // Log activity
      await this.logActivity(updatedBy, 'UPDATE', 'settings', 1, { fields: Object.keys(settingsData) });
      
      return { changes: result.changes };
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  }

  // Notification methods
  async getNotifications(userId) {
    try {
      return await this.all(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
    } catch (err) {
      console.error('Error getting notifications:', err);
      throw err;
    }
  }

  async markNotificationAsRead(id, userId) {
    try {
      const result = await this.run(
        'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      return { changes: result.changes };
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }

  // Activity log methods
  async getActivityLogs(filters = {}) {
    try {
      let sql = `
        SELECT 
          al.*,
          u.name as user_name
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
      `;
      
      const params = [];
      const whereConditions = [];
      
      if (filters.user_id) {
        whereConditions.push('al.user_id = ?');
        params.push(filters.user_id);
      }
      
      if (filters.action) {
        whereConditions.push('al.action = ?');
        params.push(filters.action);
      }
      
      if (filters.entity) {
        whereConditions.push('al.entity = ?');
        params.push(filters.entity);
      }
      
      if (filters.start_date) {
        whereConditions.push('al.created_at >= ?');
        params.push(filters.start_date);
      }
      
      if (filters.end_date) {
        whereConditions.push('al.created_at <= ?');
        params.push(filters.end_date);
      }
      
      if (whereConditions.length > 0) {
        sql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      // Order by clause
      sql += ' ORDER BY al.created_at DESC';
      
      // Pagination
      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          sql += ' OFFSET ?';
          params.push(parseInt(filters.offset));
        }
      }
      
      const logs = await this.all(sql, params);
      
      // Parse JSON details
      logs.forEach(log => {
        if (log.details) log.details = JSON.parse(log.details);
      });
      
      // Get total count for pagination
      let countSql = 'SELECT COUNT(*) as total FROM activity_logs al';
      
      if (whereConditions.length > 0) {
        countSql += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      const countResult = await this.get(countSql, params.slice(0, whereConditions.length));
      
      return {
        total: countResult.total,
        data: logs
      };
    } catch (err) {
      console.error('Error getting activity logs:', err);
      throw err;
    }
  }
}

module.exports = DatabaseService;
