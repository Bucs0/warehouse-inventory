// ===================================================================
// FILE: src/lib/db.js (NEW FILE)
// PURPOSE: Database connection configuration and utility functions
// ===================================================================

import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'warehouse_inventory',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Execute query with error handling
export const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error('Database query error:', error);
    return { success: false, error: error.message };
  }
};

// Transaction helper
export const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return { success: true, data: result };
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
};

export default pool;


// ===================================================================
// FILE: src/lib/api.js (NEW FILE)
// PURPOSE: API service layer for all database operations
// ===================================================================

import { query, transaction } from './db';

// ==================== INVENTORY OPERATIONS ====================

export const inventoryAPI = {
  // Get all inventory items
  getAll: async () => {
    const sql = `
      SELECT i.*, s.supplier_name, s.contact_email as supplier_email,
             c.category_name, l.location_name, l.description as location_description
      FROM inventory i
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN locations l ON i.location_id = l.id
      WHERE i.deleted_at IS NULL
      ORDER BY i.created_at DESC
    `;
    return await query(sql);
  },

  // Get single item by ID
  getById: async (id) => {
    const sql = `
      SELECT i.*, s.supplier_name, c.category_name, l.location_name
      FROM inventory i
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN locations l ON i.location_id = l.id
      WHERE i.id = ? AND i.deleted_at IS NULL
    `;
    const result = await query(sql, [id]);
    return result.success ? { ...result, data: result.data[0] } : result;
  },

  // Add new item
  add: async (itemData) => {
    const sql = `
      INSERT INTO inventory 
      (item_name, category_id, quantity, location_id, reorder_level, price, 
       supplier_id, damaged_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Good', NOW(), NOW())
    `;
    const params = [
      itemData.itemName,
      itemData.categoryId,
      itemData.quantity || 0,
      itemData.locationId,
      itemData.reorderLevel || 10,
      itemData.price || 0,
      itemData.supplierId || null
    ];
    return await query(sql, params);
  },

  // Update item
  update: async (id, itemData) => {
    const sql = `
      UPDATE inventory 
      SET item_name = ?, category_id = ?, quantity = ?, location_id = ?,
          reorder_level = ?, price = ?, supplier_id = ?, updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
    `;
    const params = [
      itemData.itemName,
      itemData.categoryId,
      itemData.quantity,
      itemData.locationId,
      itemData.reorderLevel,
      itemData.price,
      itemData.supplierId || null,
      id
    ];
    return await query(sql, params);
  },

  // Soft delete item
  delete: async (id) => {
    const sql = `UPDATE inventory SET deleted_at = NOW() WHERE id = ?`;
    return await query(sql, [id]);
  },

  // Get low stock items
  getLowStock: async () => {
    const sql = `
      SELECT i.*, s.supplier_name, c.category_name, l.location_name
      FROM inventory i
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN locations l ON i.location_id = l.id
      WHERE i.quantity <= i.reorder_level AND i.deleted_at IS NULL
      ORDER BY i.quantity ASC
    `;
    return await query(sql);
  }
};

// ==================== SUPPLIERS OPERATIONS ====================

export const suppliersAPI = {
  getAll: async () => {
    const sql = `
      SELECT * FROM suppliers 
      WHERE deleted_at IS NULL 
      ORDER BY supplier_name ASC
    `;
    return await query(sql);
  },

  getById: async (id) => {
    const sql = `SELECT * FROM suppliers WHERE id = ? AND deleted_at IS NULL`;
    const result = await query(sql, [id]);
    return result.success ? { ...result, data: result.data[0] } : result;
  },

  add: async (supplierData) => {
    const sql = `
      INSERT INTO suppliers 
      (supplier_name, contact_person, contact_email, contact_phone, 
       address, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const params = [
      supplierData.supplierName,
      supplierData.contactPerson,
      supplierData.contactEmail || null,
      supplierData.contactPhone || null,
      supplierData.address || null,
      supplierData.isActive !== false
    ];
    return await query(sql, params);
  },

  update: async (id, supplierData) => {
    const sql = `
      UPDATE suppliers 
      SET supplier_name = ?, contact_person = ?, contact_email = ?,
          contact_phone = ?, address = ?, is_active = ?, updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
    `;
    const params = [
      supplierData.supplierName,
      supplierData.contactPerson,
      supplierData.contactEmail,
      supplierData.contactPhone,
      supplierData.address,
      supplierData.isActive,
      id
    ];
    return await query(sql, params);
  },

  delete: async (id) => {
    const sql = `UPDATE suppliers SET deleted_at = NOW() WHERE id = ?`;
    return await query(sql, [id]);
  }
};

// ==================== CATEGORIES OPERATIONS ====================

export const categoriesAPI = {
  getAll: async () => {
    const sql = `
      SELECT * FROM categories 
      WHERE deleted_at IS NULL 
      ORDER BY category_name ASC
    `;
    return await query(sql);
  },

  add: async (categoryData) => {
    const sql = `
      INSERT INTO categories (category_name, description, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
    `;
    return await query(sql, [categoryData.categoryName, categoryData.description || null]);
  },

  update: async (id, categoryData) => {
    const sql = `
      UPDATE categories 
      SET category_name = ?, description = ?, updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
    `;
    return await query(sql, [categoryData.categoryName, categoryData.description, id]);
  },

  delete: async (id) => {
    const sql = `UPDATE categories SET deleted_at = NOW() WHERE id = ?`;
    return await query(sql, [id]);
  }
};

// ==================== LOCATIONS OPERATIONS ====================

export const locationsAPI = {
  getAll: async () => {
    const sql = `
      SELECT * FROM locations 
      WHERE deleted_at IS NULL 
      ORDER BY location_name ASC
    `;
    return await query(sql);
  },

  add: async (locationData) => {
    const sql = `
      INSERT INTO locations (location_name, description, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
    `;
    return await query(sql, [locationData.locationName, locationData.description || null]);
  },

  update: async (id, locationData) => {
    const sql = `
      UPDATE locations 
      SET location_name = ?, description = ?, updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
    `;
    return await query(sql, [locationData.locationName, locationData.description, id]);
  },

  delete: async (id) => {
    const sql = `UPDATE locations SET deleted_at = NOW() WHERE id = ?`;
    return await query(sql, [id]);
  }
};

// ==================== TRANSACTIONS OPERATIONS ====================

export const transactionsAPI = {
  getAll: async () => {
    const sql = `
      SELECT t.*, i.item_name, u.name as user_name, u.role as user_role
      FROM transactions t
      JOIN inventory i ON t.item_id = i.id
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `;
    return await query(sql);
  },

  add: async (transactionData, userId) => {
    return await transaction(async (conn) => {
      // Insert transaction
      const [result] = await conn.execute(
        `INSERT INTO transactions 
         (item_id, transaction_type, quantity, reason, user_id, 
          stock_before, stock_after, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          transactionData.itemId,
          transactionData.transactionType,
          transactionData.quantity,
          transactionData.reason,
          userId,
          transactionData.stockBefore,
          transactionData.stockAfter
        ]
      );

      // Update inventory quantity
      await conn.execute(
        `UPDATE inventory SET quantity = ?, updated_at = NOW() WHERE id = ?`,
        [transactionData.stockAfter, transactionData.itemId]
      );

      // If damaged/discarded, add to damaged_items
      if (transactionData.reason === 'Damaged/Discarded') {
        await conn.execute(
          `INSERT INTO damaged_items 
           (item_id, quantity, location_id, reason, status, price, created_at)
           SELECT id, ?, location_id, 'Damaged/Discarded', 'Standby', price, NOW()
           FROM inventory WHERE id = ?`,
          [transactionData.quantity, transactionData.itemId]
        );
      }

      return result.insertId;
    });
  }
};

// ==================== APPOINTMENTS OPERATIONS ====================

export const appointmentsAPI = {
  getAll: async () => {
    const sql = `
      SELECT a.*, s.supplier_name, s.contact_email, s.contact_phone,
             u.name as scheduled_by_name
      FROM appointments a
      JOIN suppliers s ON a.supplier_id = s.id
      JOIN users u ON a.scheduled_by = u.id
      WHERE a.deleted_at IS NULL
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `;
    return await query(sql);
  },

  getById: async (id) => {
    const appointmentResult = await query(
      `SELECT a.*, s.supplier_name 
       FROM appointments a 
       JOIN suppliers s ON a.supplier_id = s.id 
       WHERE a.id = ? AND a.deleted_at IS NULL`,
      [id]
    );

    if (!appointmentResult.success || appointmentResult.data.length === 0) {
      return appointmentResult;
    }

    const itemsResult = await query(
      `SELECT ai.*, i.item_name 
       FROM appointment_items ai 
       JOIN inventory i ON ai.item_id = i.id 
       WHERE ai.appointment_id = ?`,
      [id]
    );

    return {
      success: true,
      data: {
        ...appointmentResult.data[0],
        items: itemsResult.data
      }
    };
  },

  add: async (appointmentData, userId) => {
    return await transaction(async (conn) => {
      // Insert appointment
      const [result] = await conn.execute(
        `INSERT INTO appointments 
         (supplier_id, appointment_date, appointment_time, status, notes, 
          scheduled_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          appointmentData.supplierId,
          appointmentData.date,
          appointmentData.time,
          appointmentData.status || 'pending',
          appointmentData.notes || null,
          userId
        ]
      );

      const appointmentId = result.insertId;

      // Insert appointment items
      for (const item of appointmentData.items) {
        await conn.execute(
          `INSERT INTO appointment_items (appointment_id, item_id, quantity)
           VALUES (?, ?, ?)`,
          [appointmentId, item.itemId, item.quantity]
        );
      }

      return appointmentId;
    });
  },

  update: async (id, appointmentData) => {
    return await transaction(async (conn) => {
      await conn.execute(
        `UPDATE appointments 
         SET supplier_id = ?, appointment_date = ?, appointment_time = ?,
             status = ?, notes = ?, updated_at = NOW()
         WHERE id = ? AND deleted_at IS NULL`,
        [
          appointmentData.supplierId,
          appointmentData.date,
          appointmentData.time,
          appointmentData.status,
          appointmentData.notes,
          id
        ]
      );

      // Delete old items and insert new ones
      await conn.execute(`DELETE FROM appointment_items WHERE appointment_id = ?`, [id]);

      for (const item of appointmentData.items) {
        await conn.execute(
          `INSERT INTO appointment_items (appointment_id, item_id, quantity)
           VALUES (?, ?, ?)`,
          [id, item.itemId, item.quantity]
        );
      }

      return id;
    });
  },

  complete: async (id, userId) => {
    return await transaction(async (conn) => {
      // Get appointment items
      const [items] = await conn.execute(
        `SELECT ai.*, i.item_name, i.quantity as current_quantity
         FROM appointment_items ai
         JOIN inventory i ON ai.item_id = i.id
         WHERE ai.appointment_id = ?`,
        [id]
      );

      // Update each item quantity and create transaction
      for (const item of items) {
        const newQuantity = item.current_quantity + item.quantity;

        await conn.execute(
          `UPDATE inventory SET quantity = ?, updated_at = NOW() WHERE id = ?`,
          [newQuantity, item.item_id]
        );

        await conn.execute(
          `INSERT INTO transactions 
           (item_id, transaction_type, quantity, reason, user_id,
            stock_before, stock_after, created_at)
           VALUES (?, 'IN', ?, 'Restock from appointment', ?, ?, ?, NOW())`,
          [item.item_id, item.quantity, userId, item.current_quantity, newQuantity]
        );
      }

      // Mark appointment as completed
      await conn.execute(
        `UPDATE appointments SET status = 'completed', updated_at = NOW() WHERE id = ?`,
        [id]
      );

      return id;
    });
  },

  cancel: async (id) => {
    const sql = `
      UPDATE appointments 
      SET status = 'cancelled', updated_at = NOW() 
      WHERE id = ? AND deleted_at IS NULL
    `;
    return await query(sql, [id]);
  },

  delete: async (id) => {
    const sql = `UPDATE appointments SET deleted_at = NOW() WHERE id = ?`;
    return await query(sql, [id]);
  }
};

// ==================== ACTIVITY LOGS OPERATIONS ====================

export const activityLogsAPI = {
  getAll: async (filters = {}) => {
    let sql = `
      SELECT al.*, u.name as user_name, u.role as user_role
      FROM activity_logs al
      JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.action && filters.action !== 'all') {
      sql += ` AND al.action = ?`;
      params.push(filters.action);
    }

    if (filters.month && filters.month !== 'all') {
      sql += ` AND MONTH(al.created_at) = ?`;
      params.push(parseInt(filters.month));
    }

    if (filters.year && filters.year !== 'all') {
      sql += ` AND YEAR(al.created_at) = ?`;
      params.push(parseInt(filters.year));
    }

    sql += ` ORDER BY al.created_at DESC`;

    return await query(sql, params);
  },

  add: async (logData, userId) => {
    const sql = `
      INSERT INTO activity_logs 
      (item_name, action, user_id, details, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    return await query(sql, [
      logData.itemName,
      logData.action,
      userId,
      logData.details || null
    ]);
  }
};

// ==================== DAMAGED ITEMS OPERATIONS ====================

export const damagedItemsAPI = {
  getAll: async () => {
    const sql = `
      SELECT di.*, i.item_name, l.location_name
      FROM damaged_items di
      JOIN inventory i ON di.item_id = i.id
      JOIN locations l ON di.location_id = l.id
      WHERE di.deleted_at IS NULL
      ORDER BY di.created_at DESC
    `;
    return await query(sql);
  },

  update: async (id, updateData) => {
    const sql = `
      UPDATE damaged_items 
      SET status = ?, notes = ?, updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
    `;
    return await query(sql, [updateData.status, updateData.notes || null, id]);
  },

  delete: async (id) => {
    const sql = `UPDATE damaged_items SET deleted_at = NOW() WHERE id = ?`;
    return await query(sql, [id]);
  }
};

// ==================== USERS OPERATIONS ====================

export const usersAPI = {
  getByCredentials: async (usernameOrEmail, password) => {
    const sql = `
      SELECT * FROM users 
      WHERE (username = ? OR email = ?) 
        AND password = ? 
        AND status = 'approved' 
        AND deleted_at IS NULL
    `;
    const result = await query(sql, [usernameOrEmail, usernameOrEmail, password]);
    return result.success ? { ...result, data: result.data[0] } : result;
  },

  getPending: async () => {
    const sql = `
      SELECT * FROM users 
      WHERE status = 'pending' AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    return await query(sql);
  },

  getApproved: async () => {
    const sql = `
      SELECT * FROM users 
      WHERE status = 'approved' AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    return await query(sql);
  },

  add: async (userData) => {
    const sql = `
      INSERT INTO users 
      (username, email, password, name, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())
    `;
    return await query(sql, [
      userData.username,
      userData.email,
      userData.password,
      userData.name,
      userData.role || 'Staff'
    ]);
  },

  approve: async (id) => {
    const sql = `UPDATE users SET status = 'approved', updated_at = NOW() WHERE id = ?`;
    return await query(sql, [id]);
  },

  reject: async (id) => {
    const sql = `UPDATE users SET deleted_at = NOW() WHERE id = ?`;
    return await query(sql, [id]);
  }
};