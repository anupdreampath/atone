import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING ||
    'postgresql://neondb_owner:npg_HBER3nkU0spg@ep-quiet-dew-amnbcv6p-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'
});

app.use(cors());
app.use(express.json());

const generateToken = (adminId) => crypto.randomBytes(32).toString('hex');
const hashPassword = (password) => crypto.createHash('sha256').update(password + 'admin-salt').digest('hex');

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const result = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    const admin = result.rows[0];

    if (!admin) return res.status(401).json({ message: 'Invalid email or password' });

    const passwordHash = hashPassword(password);
    if (admin.password_hash !== passwordHash) return res.status(401).json({ message: 'Invalid email or password' });
    if (!admin.is_active) return res.status(401).json({ message: 'Admin account is inactive' });

    const token = generateToken(admin.id);
    await pool.query('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [admin.id]);

    res.json({
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: 'Email, password, and name required' });

    const checkResult = await pool.query('SELECT id FROM admin_users WHERE email = $1', [email]);
    if (checkResult.rows.length > 0) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = hashPassword(password);
    const result = await pool.query(
      `INSERT INTO admin_users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, role`,
      [email, passwordHash, name]
    );

    const admin = result.rows[0];
    const token = generateToken(admin.id);

    res.status(201).json({
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Signup failed' });
  }
});

app.post('/api/db/query', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const { sql, params = [] } = req.body;
    if (!sql) return res.status(400).json({ message: 'SQL query required' });

    const result = await pool.query(sql, params);
    res.json({ rows: result.rows, rowCount: result.rowCount });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ message: 'Query failed', error: error.message });
  }
});

const setupDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, name VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS query_logs (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), field_name VARCHAR(255), query_value TEXT, action VARCHAR(50), ip_address VARCHAR(45), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS admin_users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255), name VARCHAR(255), role VARCHAR(50) DEFAULT 'admin', is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, last_login TIMESTAMP);
      CREATE INDEX IF NOT EXISTS idx_query_logs_user_id ON query_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_query_logs_created_at ON query_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
    `);
    console.log('✅ Database tables created');
  } catch (error) {
    console.log('ℹ️  Tables exist');
  }
};

const createDemoAdmin = async () => {
  try {
    const result = await pool.query('SELECT id FROM admin_users WHERE email = $1', ['admin@demo.com']);
    if (result.rows.length === 0) {
      const passwordHash = hashPassword('admin123');
      await pool.query(`INSERT INTO admin_users (email, password_hash, name) VALUES ($1, $2, $3)`, ['admin@demo.com', passwordHash, 'Demo Admin']);
      console.log('✅ Demo admin created: admin@demo.com / admin123');
    } else {
      console.log('✅ Demo admin exists');
    }
  } catch (error) {
    console.log('ℹ️  Admin setup ok');
  }
};

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

const start = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Connected to Neon DB');
    await setupDatabase();
    await createDemoAdmin();
    app.listen(PORT, () => console.log(`✅ Admin server running on http://localhost:${PORT}`));
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
};

start();

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await pool.end();
  process.exit(0);
});
