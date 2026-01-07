// ===================================================================
// FILE: backend/server.js
// PURPOSE: Express API server for MySQL database operations
// SETUP: 
// 1. Create a 'backend' folder in your project root
// 2. Run: npm init -y
// 3. Run: npm install express mysql2 cors dotenv body-parser
// 4. Create .env file with your database credentials
// 5. Run: node server.js
// ===================================================================

import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'warehouse_inventory',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// ==================== UTILITY FUNCTIONS ====================

const executeQuery = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error('Query error:', error);
    return { success: false, error: error.message };
  }
};

// ==================== INVENTORY ENDPOINTS ====================

// GET all inventory items
app.get('/api/inventory', async (req, res) => {
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
  const result = await executeQuery(sql);
  res.json(result);
});

// GET single inventory item
app.get('/api/inventory/:id', async (req, res) => {
  const sql = `
    SELECT i.*, s.supplier_name, c.category_name, l.location_name
    FROM inventory i
    LEFT JOIN suppliers s ON i.supplier_id = s.id
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN locations l ON i.location_id = l.id
    WHERE i.id = ? AND i.deleted_at IS NULL
  `;
  const result = await executeQuery(sql, [req.params.id]);
  res.json({ ...result, data: result.data?.[0] });
});

// POST new inventory item
app.post('/api/inventory', async (req, res) => {
  const { itemName, categoryId, quantity, locationId, reorderLevel, price, supplierId } = req.body;
  const sql = `
    INSERT INTO inventory 
    (item_name, category_id, quantity, location_id, reorder_level, price, 
     supplier_id, damaged_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Good', NOW(), NOW())
  `;
  const params = [itemName, categoryId, quantity || 0, locationId, reorderLevel || 10, price || 0, supplierId || null];
  const result = await executeQuery(sql, params);
  res.json(result);
});

// PUT update inventory item
app.put('/api/inventory/:id', async (req, res) => {
  const { itemName, categoryId, quantity, locationId, reorderLevel, price, supplierId } = req.body;
  const sql = `
    UPDATE inventory 
    SET item_name = ?, category_id = ?, quantity = ?, location_id = ?,
        reorder_level = ?, price = ?, supplier_id = ?, updated_at = NOW()
    WHERE id = ? AND deleted_at IS NULL
  `;
  const params = [itemName, categoryId, quantity, locationId, reorderLevel, price, supplierId || null, req.params.id];
  const result = await executeQuery(sql, params);
  res.json(result);
});

// DELETE inventory item (soft delete)
app.delete('/api/inventory/:id', async (req, res) => {
  const sql = `UPDATE inventory SET deleted_at = NOW() WHERE id = ?`;
  const result = await executeQuery(sql, [req.params.id]);
  res.json(result);
});

// ==================== SUPPLIERS ENDPOINTS ====================

app.get('/api/suppliers', async (req, res) => {
  const sql = `SELECT * FROM suppliers WHERE deleted_at IS NULL ORDER BY supplier_name ASC`;
  const result = await executeQuery(sql);
  res.json(result);
});

app.post('/api/suppliers', async (req, res) => {
  const { supplierName, contactPerson, contactEmail, contactPhone, address, isActive } = req.body;
  const sql = `
    INSERT INTO suppliers 
    (supplier_name, contact_person, contact_email, contact_phone, address, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;
  const params = [supplierName, contactPerson, contactEmail || null, contactPhone || null, address || null, isActive !== false];
  const result = await executeQuery(sql, params);
  res.json(result);
});

app.put('/api/suppliers/:id', async (req, res) => {
  const { supplierName, contactPerson, contactEmail, contactPhone, address, isActive } = req.body;
  const sql = `
    UPDATE suppliers 
    SET supplier_name = ?, contact_person = ?, contact_email = ?,
        contact_phone = ?, address = ?, is_active = ?, updated_at = NOW()
    WHERE id = ? AND deleted_at IS NULL
  `;
  const params = [supplierName, contactPerson, contactEmail, contactPhone, address, isActive, req.params.id];
  const result = await executeQuery(sql, params);
  res.json(result);
});

app.delete('/api/suppliers/:id', async (req, res) => {
  const sql = `UPDATE suppliers SET deleted_at = NOW() WHERE id = ?`;
  const result = await executeQuery(sql, [req.params.id]);
  res.json(result);
});

// ==================== CATEGORIES ENDPOINTS ====================

app.get('/api/categories', async (req, res) => {
  const sql = `SELECT * FROM categories WHERE deleted_at IS NULL ORDER BY category_name ASC`;
  const result = await executeQuery(sql);
  res.json(result);
});

app.post('/api/categories', async (req, res) => {
  const { categoryName, description } = req.body;
  const sql = `INSERT INTO categories (category_name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`;
  const result = await executeQuery(sql, [categoryName, description || null]);
  res.json(result);
});

app.put('/api/categories/:id', async (req, res) => {
  const { categoryName, description } = req.body;
  const sql = `UPDATE categories SET category_name = ?, description = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
  const result = await executeQuery(sql, [categoryName, description, req.params.id]);
  res.json(result);
});

app.delete('/api/categories/:id', async (req, res) => {
  const sql = `UPDATE categories SET deleted_at = NOW() WHERE id = ?`;
  const result = await executeQuery(sql, [req.params.id]);
  res.json(result);
});

// ==================== LOCATIONS ENDPOINTS ====================

app.get('/api/locations', async (req, res) => {
  const sql = `SELECT * FROM locations WHERE deleted_at IS NULL ORDER BY location_name ASC`;
  const result = await executeQuery(sql);
  res.json(result);
});

app.post('/api/locations', async (req, res) => {
  const { locationName, description } = req.body;
  const sql = `INSERT INTO locations (location_name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`;
  const result = await executeQuery(sql, [locationName, description || null]);
  res.json(result);
});

app.put('/api/locations/:id', async (req, res) => {
  const { locationName, description } = req.body;
  const sql = `UPDATE locations SET location_name = ?, description = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
  const result = await executeQuery(sql, [locationName, description, req.params.id]);
  res.json(result);
});

app.delete('/api/locations/:id', async (req, res) => {
  const sql = `UPDATE locations SET deleted_at = NOW() WHERE id = ?`;
  const result = await executeQuery(sql, [req.params.id]);
  res.json(result);
});

// ==================== TRANSACTIONS ENDPOINTS ====================

app.get('/api/transactions', async (req, res) => {
  const sql = `
    SELECT t.*, i.item_name, u.name as user_name, u.role as user_role
    FROM transactions t
    JOIN inventory i ON t.item_id = i.id
    JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
  `;
  const result = await executeQuery(sql);
  res.json(result);
});

app.post('/api/transactions', async (req, res) => {
  const { itemId, transactionType, quantity, reason, userId, stockBefore, stockAfter } = req.body;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert transaction
    await connection.execute(
      `INSERT INTO transactions 
       (item_id, transaction_type, quantity, reason, user_id, stock_before, stock_after, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [itemId, transactionType, quantity, reason, userId, stockBefore, stockAfter]
    );

    // Update inventory
    await connection.execute(
      `UPDATE inventory SET quantity = ?, updated_at = NOW() WHERE id = ?`,
      [stockAfter, itemId]
    );

    // If damaged/discarded, add to damaged_items
    if (reason === 'Damaged/Discarded') {
      await connection.execute(
        `INSERT INTO damaged_items 
         (item_id, quantity, location_id, reason, status, price, created_at)
         SELECT id, ?, location_id, 'Damaged/Discarded', 'Standby', price, NOW()
         FROM inventory WHERE id = ?`,
        [quantity, itemId]
      );
    }

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// ==================== APPOINTMENTS ENDPOINTS ====================

app.get('/api/appointments', async (req, res) => {
  const sql = `
    SELECT a.*, s.supplier_name, s.contact_email, s.contact_phone,
           u.name as scheduled_by_name
    FROM appointments a
    JOIN suppliers s ON a.supplier_id = s.id
    JOIN users u ON a.scheduled_by = u.id
    WHERE a.deleted_at IS NULL
    ORDER BY a.appointment_date ASC, a.appointment_time ASC
  `;
  const result = await executeQuery(sql);
  res.json(result);
});

app.get('/api/appointments/:id', async (req, res) => {
  const appointmentSql = `
    SELECT a.*, s.supplier_name 
    FROM appointments a 
    JOIN suppliers s ON a.supplier_id = s.id 
    WHERE a.id = ? AND a.deleted_at IS NULL
  `;
  const appointmentResult = await executeQuery(appointmentSql, [req.params.id]);
  
  if (!appointmentResult.success || appointmentResult.data.length === 0) {
    return res.json(appointmentResult);
  }

  const itemsSql = `
    SELECT ai.*, i.item_name 
    FROM appointment_items ai 
    JOIN inventory i ON ai.item_id = i.id 
    WHERE ai.appointment_id = ?
  `;
  const itemsResult = await executeQuery(itemsSql, [req.params.id]);

  res.json({
    success: true,
    data: {
      ...appointmentResult.data[0],
      items: itemsResult.data
    }
  });
});

app.post('/api/appointments', async (req, res) => {
  const { supplierId, date, time, status, notes, items, userId } = req.body;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO appointments 
       (supplier_id, appointment_date, appointment_time, status, notes, scheduled_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [supplierId, date, time, status || 'pending', notes || null, userId]
    );

    const appointmentId = result.insertId;

    for (const item of items) {
      await connection.execute(
        `INSERT INTO appointment_items (appointment_id, item_id, quantity) VALUES (?, ?, ?)`,
        [appointmentId, item.itemId, item.quantity]
      );
    }

    await connection.commit();
    res.json({ success: true, data: { id: appointmentId } });
  } catch (error) {
    await connection.rollback();
    res.json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  const { supplierId, date, time, status, notes, items } = req.body;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute(
      `UPDATE appointments 
       SET supplier_id = ?, appointment_date = ?, appointment_time = ?,
           status = ?, notes = ?, updated_at = NOW()
       WHERE id = ? AND deleted_at IS NULL`,
      [supplierId, date, time, status, notes, req.params.id]
    );

    await connection.execute(`DELETE FROM appointment_items WHERE appointment_id = ?`, [req.params.id]);

    for (const item of items) {
      await connection.execute(
        `INSERT INTO appointment_items (appointment_id, item_id, quantity) VALUES (?, ?, ?)`,
        [req.params.id, item.itemId, item.quantity]
      );
    }

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

app.post('/api/appointments/:id/complete', async (req, res) => {
  const { userId } = req.body;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [items] = await connection.execute(
      `SELECT ai.*, i.item_name, i.quantity as current_quantity
       FROM appointment_items ai
       JOIN inventory i ON ai.item_id = i.id
       WHERE ai.appointment_id = ?`,
      [req.params.id]
    );

    for (const item of items) {
      const newQuantity = item.current_quantity + item.quantity;

      await connection.execute(
        `UPDATE inventory SET quantity = ?, updated_at = NOW() WHERE id = ?`,
        [newQuantity, item.item_id]
      );

      await connection.execute(
        `INSERT INTO transactions 
         (item_id, transaction_type, quantity, reason, user_id, stock_before, stock_after, created_at)
         VALUES (?, 'IN', ?, 'Restock from appointment', ?, ?, ?, NOW())`,
        [item.item_id, item.quantity, userId, item.current_quantity, newQuantity]
      );
    }

    await connection.execute(
      `UPDATE appointments SET status = 'completed', updated_at = NOW() WHERE id = ?`,
      [req.params.id]
    );

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    res.json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

app.put('/api/appointments/:id/cancel', async (req, res) => {
  const sql = `UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
  const result = await executeQuery(sql, [req.params.id]);
  res.json(result);
});

// ==================== ACTIVITY LOGS ENDPOINTS ====================

app.get('/api/activity-logs', async (req, res) => {
  const { action, month, year } = req.query;
  let sql = `
    SELECT al.*, u.name as user_name, u.role as user_role
    FROM activity_logs al
    JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (action && action !== 'all') {
    sql += ` AND al.action = ?`;
    params.push(action);
  }

  if (month && month !== 'all') {
    sql += ` AND MONTH(al.created_at) = ?`;
    params.push(parseInt(month));
  }

  if (year && year !== 'all') {
    sql += ` AND YEAR(al.created_at) = ?`;
    params.push(parseInt(year));
  }

  sql += ` ORDER BY al.created_at DESC`;

  const result = await executeQuery(sql, params);
  res.json(result);
});

app.post('/api/activity-logs', async (req, res) => {
  const { itemName, action, userId, details } = req.body;
  const sql = `
    INSERT INTO activity_logs (item_name, action, user_id, details, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;
  const result = await executeQuery(sql, [itemName, action, userId, details || null]);
  res.json(result);
});

// ==================== DAMAGED ITEMS ENDPOINTS ====================

app.get('/api/damaged-items', async (req, res) => {
  const sql = `
    SELECT di.*, i.item_name, l.location_name
    FROM damaged_items di
    JOIN inventory i ON di.item_id = i.id
    JOIN locations l ON di.location_id = l.id
    WHERE di.deleted_at IS NULL
    ORDER BY di.created_at DESC
  `;
  const result = await executeQuery(sql);
  res.json(result);
});

app.put('/api/damaged-items/:id', async (req, res) => {
  const { status, notes } = req.body;
  const sql = `UPDATE damaged_items SET status = ?, notes = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
  const result = await executeQuery(sql, [status, notes || null, req.params.id]);
  res.json(result);
});

app.delete('/api/damaged-items/:id', async (req, res) => {
  const sql = `UPDATE damaged_items SET deleted_at = NOW() WHERE id = ?`;
  const result = await executeQuery(sql, [req.params.id]);
  res.json(result);
});

// ==================== USERS ENDPOINTS ====================

app.post('/api/users/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  const sql = `
    SELECT * FROM users 
    WHERE (username = ? OR email = ?) AND password = ? AND status = 'approved' AND deleted_at IS NULL
  `;
  const result = await executeQuery(sql, [usernameOrEmail, usernameOrEmail, password]);
  res.json({ ...result, data: result.data?.[0] });
});

app.get('/api/users/pending', async (req, res) => {
  const sql = `SELECT * FROM users WHERE status = 'pending' AND deleted_at IS NULL ORDER BY created_at DESC`;
  const result = await executeQuery(sql);
  res.json(result);
});

app.get('/api/users/approved', async (req, res) => {
  const sql = `SELECT * FROM users WHERE status = 'approved' AND deleted_at IS NULL ORDER BY created_at DESC`;
  const result = await executeQuery(sql);
  res.json(result);
});

app.post('/api/users', async (req, res) => {
  const { username, email, password, name, role } = req.body;
  const sql = `
    INSERT INTO users (username, email, password, name, role, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())
  `;
  const result = await executeQuery(sql, [username, email, password, name, role || 'Staff']);
  res.json(result);
});

app.put('/api/users/:id/approve', async (req, res) => {
  const sql = `UPDATE users SET status = 'approved', updated_at = NOW() WHERE id = ?`;
  const result = await executeQuery(sql, [req.params.id]);
  res.json(result);
});

app.delete('/api/users/:id/reject', async (req, res) => {
  const sql = `UPDATE users SET deleted_at = NOW() WHERE id = ?`;
  const result = await executeQuery(sql, [req.params.id]);
  res.json(result);
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${dbConfig.database}`);
  console.log(`🔌 API endpoints available at http://localhost:${PORT}/api`);
});