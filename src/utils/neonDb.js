import { Client } from '@neondatabase/serverless';

const connectionString = import.meta.env.VITE_NEON_CONNECTION_STRING;

if (!connectionString) {
  console.warn('VITE_NEON_CONNECTION_STRING not configured');
}

const getClient = () => new Client({ connectionString });

export async function query(sqlQuery, params = []) {
  const client = getClient();
  try {
    await client.connect();
    const result = await client.query(sqlQuery, params);
    return { rows: result.rows || [], rowCount: result.rowCount || 0 };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

export async function getUsers() {
  try {
    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    return result;
  } catch (error) {
    console.error('Error fetching users:', error);
    return { rows: [], rowCount: 0 };
  }
}

export async function getQueryLogs() {
  try {
    const result = await query('SELECT * FROM query_logs ORDER BY created_at DESC');
    return result;
  } catch (error) {
    console.error('Error fetching logs:', error);
    return { rows: [], rowCount: 0 };
  }
}

export async function logQuery(userId, fieldName, queryValue, action, ipAddress) {
  try {
    const result = await query(
      'INSERT INTO query_logs (user_id, field_name, query_value, action, ip_address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, fieldName, queryValue, action, ipAddress]
    );
    return result;
  } catch (error) {
    console.error('Error logging query:', error);
    throw error;
  }
}

export async function createUser(email, name) {
  try {
    const result = await query(
      'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
      [email, name]
    );
    return result;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function createAdmin(email, passwordHash, name) {
  try {
    const result = await query(
      'INSERT INTO admin_users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, role',
      [email, passwordHash, name]
    );
    return result;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
}

export async function getAdmin(email) {
  try {
    const result = await query('SELECT * FROM admin_users WHERE email = $1', [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching admin:', error);
    return null;
  }
}

export async function updateAdminPassword(email, newPasswordHash) {
  try {
    const result = await query(
      'UPDATE admin_users SET password_hash = $1 WHERE email = $2 RETURNING id, email, name, role',
      [newPasswordHash, email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating admin password:', error);
    throw error;
  }
}
