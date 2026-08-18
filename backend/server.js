// File: backend/server.js (PostgreSQL with connection string support)
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection - Support both connection string and individual params
let pool;

try {
  // If DATABASE_URL is provided, use it (recommended)
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    console.log('📊 Using DATABASE_URL connection string');
  } else {
    // Otherwise use individual parameters
    pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'estishara',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 5432,
    });
    console.log('📊 Using individual connection parameters');
  }
} catch (error) {
  console.error('❌ Error creating pool:', error);
  process.exit(1);
}

// Test database connection and create tables
pool.connect(async (err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure PostgreSQL is installed and running');
    console.log('2. Check your credentials in .env file');
    console.log('3. Try connecting with psql: psql -U postgres -d postgres');
    console.log('4. If you forgot your password, reset it using pgAdmin');
    console.log('5. Or use DATABASE_URL format: postgresql://user:password@localhost:5432/estishara\n');
    process.exit(1);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
    // Initialize database tables
    await initializeDatabase();
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// ==================== DATABASE INITIALIZATION ====================

async function initializeDatabase() {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'client',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created/verified');

    // Create visa_types table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visa_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Visa types table created/verified');

    // Create appointments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        visa_type VARCHAR(255) NOT NULL,
        date VARCHAR(50) NOT NULL,
        time VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        price DECIMAL(10, 2) DEFAULT 30.00,  -- Added price column here
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Appointments table created/verified');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    console.log('✅ Database indexes created/verified');

    // Seed initial data
    await seedInitialData();
    
    console.log('✅ Database initialization complete');
    console.log(`🚀 Server ready on port ${port}`);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

// ==================== SEED INITIAL DATA ====================

async function seedInitialData() {
  try {
    // Check if visa types exist
    const visaResult = await pool.query('SELECT COUNT(*) FROM visa_types');
    if (parseInt(visaResult.rows[0].count) === 0) {
      const visaTypes = [
        ['Tourist (Schengen)', 'fa-umbrella-beach', 'Short stay up to 90 days'],
        ['Business', 'fa-briefcase', 'Meetings, conferences'],
        ['Student', 'fa-graduation-cap', 'Study / exchange'],
        ['Work', 'fa-hard-hat', 'Employment visa'],
        ['Family Reunion', 'fa-people-arrows', 'Relatives of residents'],
        ['Golden Visa', 'fa-crown', 'Investment residency'],
      ];
      
      for (const [name, icon, description] of visaTypes) {
        await pool.query(
          'INSERT INTO visa_types (name, icon, description) VALUES ($1, $2, $3)',
          [name, icon, description]
        );
      }
      console.log('✅ Initial visa types seeded');
    }

    // Check if admin user exists
    const adminResult = await pool.query('SELECT COUNT(*) FROM users WHERE email = $1', ['admin@estishara.com']);
    if (parseInt(adminResult.rows[0].count) === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        ['admin@estishara.com', hashedPassword, 'admin']
      );
      console.log('✅ Admin user created (admin@estishara.com / admin123)');
    }

    // Check if demo client exists
    const clientResult = await pool.query('SELECT COUNT(*) FROM users WHERE email = $1', ['client@demo.com']);
    if (parseInt(clientResult.rows[0].count) === 0) {
      const hashedPassword = await bcrypt.hash('client123', 10);
      await pool.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        ['client@demo.com', hashedPassword, 'client']
      );
      console.log('✅ Demo client created (client@demo.com / client123)');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// ==================== MIDDLEWARE ====================

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, role || 'client']
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// ==================== VISA TYPE ROUTES ====================

// Get all visa types
app.get('/api/visa-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visa_types ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create visa type (admin only)
app.post('/api/visa-types', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, icon, desc } = req.body;
    const result = await pool.query(
      'INSERT INTO visa_types (name, icon, description) VALUES ($1, $2, $3) RETURNING *',
      [name, icon, desc]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== APPOINTMENT ROUTES ====================

// Get all appointments (admin sees all, clients see their own)
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
        // CHANGE the SELECT query to include meeting_link
    let query = 'SELECT id, client_name, client_email, visa_type, date, time, status, price, meeting_link FROM appointments';
    const params = [];
    
  if (req.user.role !== 'admin') {
  query += ' WHERE user_id = $1';
  params.push(req.user.id);
}
    
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== AVAILABILITY ROUTE ====================

// Get already booked time slots for a specific date
app.get('/api/availability/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    console.log("🔍 BACKEND RECEIVED DATE:", date);
    
    const result = await pool.query(
      `SELECT time FROM appointments WHERE date = $1 AND status != 'cancelled'`,
      [date]
    );
    
    const bookedTimes = result.rows.map(row => row.time);
    console.log("✅ FOUND BOOKED TIMES:", bookedTimes);
    res.json(bookedTimes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DASHBOARD STATS ROUTE ====================

// Get dashboard statistics (Admin only)
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Query for Total Clients, Total Appointments, Confirmed, Pending, and Total Price
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'client') AS total_clients,
        (SELECT COUNT(*) FROM appointments) AS total_appointments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'confirmed') AS confirmed_appointments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'pending') AS pending_appointments,
        (SELECT COALESCE(SUM(price), 0) FROM appointments WHERE status = 'confirmed') AS total_profit
    `;
    
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];

    // Fetch the latest 5 appointments to show in the dashboard
    const recentApptsQuery = `
      SELECT a.id, a.client_name, a.client_email, a.visa_type, a.date, a.time, a.status, a.price, u.email as admin_email
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `;
    
    const recentApptsResult = await pool.query(recentApptsQuery);

    res.json({
      stats: {
        totalClients: parseInt(stats.total_clients),
        totalAppointments: parseInt(stats.total_appointments),
        confirmedAppointments: parseInt(stats.confirmed_appointments),
        pendingAppointments: parseInt(stats.pending_appointments),
        totalProfit: parseFloat(stats.total_profit)
      },
      recentAppointments: recentApptsResult.rows
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create appointment
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    // Note: We do NOT destructure meetingLink here because a new appointment shouldn't have a link yet.
    const { clientName, clientEmail, meetingPlatform, date, time } = req.body;
    
    const defaultPrice = 30.00;

    const result = await pool.query(
      `INSERT INTO appointments (client_name, client_email, visa_type, date, time, user_id, price) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [clientName, clientEmail, meetingPlatform, date, time, req.user.id, defaultPrice] 
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { 
      return res.status(409).json({ error: 'This time slot is already taken. Please choose another time.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update appointment (admin can update any, client can update their own)
app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    
    // Get appointment to check permissions
    const appointmentResult = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [appointmentId]
    );
    
    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    const appointment = appointmentResult.rows[0];
    
    // Check permissions
    if (req.user.role !== 'admin' && appointment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this appointment' });
    }
    
    // READ THE BODY FIELDS (Add meetingLink here)
    const { clientName, clientEmail, visaType, date, time, status, price, meetingLink } = req.body;
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    // CHECK FOR UNDEFINED SO PRICE CAN BE $0.00
    if (clientName !== undefined) {
      updates.push(`client_name = $${paramCount++}`);
      values.push(clientName);
    }
    if (clientEmail !== undefined) {
      updates.push(`client_email = $${paramCount++}`);
      values.push(clientEmail);
    }
    if (visaType !== undefined) {
      updates.push(`visa_type = $${paramCount++}`);
      values.push(visaType);
    }
    if (date !== undefined) {
      updates.push(`date = $${paramCount++}`);
      values.push(date);
    }
    if (time !== undefined) {
      updates.push(`time = $${paramCount++}`);
      values.push(time);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(price);
    }
    // ADD THIS BLOCK TO HANDLE THE MEETING LINK
    if (meetingLink !== undefined) {
      updates.push(`meeting_link = $${paramCount++}`);
      values.push(meetingLink);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(appointmentId);
    const result = await pool.query(
      `UPDATE appointments SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message });
  }
});
// Delete appointment (admin can delete any, client can delete their own)
app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    
    // Get appointment to check permissions
    const appointmentResult = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [appointmentId]
    );
    
    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    const appointment = appointmentResult.rows[0];
    
    // Check permissions
    if (req.user.role !== 'admin' && appointment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this appointment' });
    }
    
    await pool.query('DELETE FROM appointments WHERE id = $1', [appointmentId]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== START SERVER ====================
app.listen(port, () => {
  console.log(`🚀 Estishara backend running on port ${port}`);
  console.log(`📊 PostgreSQL database: ${process.env.DB_NAME || 'estishara'}`);
  console.log(`🔐 JWT Secret: ${JWT_SECRET ? 'Configured' : '⚠️ Using default secret'}`);
});