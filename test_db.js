import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

console.log('Testing connection to Aiven PostgreSQL...');
console.log('Host:', process.env.PGHOST);

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000
});

async function test() {
  const client = await pool.connect();
  console.log('✓ Successfully connected to PostgreSQL server!');
  
  const res = await client.query('SELECT NOW() as current_time, version()');
  console.log('Current DB Time:', res.rows[0].current_time);
  console.log('Postgres Version:', res.rows[0].version.split(',')[0]);

  // Run schema creation
  console.log('Testing schema initialization...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id SERIAL PRIMARY KEY,
      tracking_id VARCHAR(50) UNIQUE NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(100),
      email VARCHAR(255) NOT NULL,
      age INTEGER,
      passport_number VARCHAR(100),
      address TEXT,
      marital_status VARCHAR(50),
      experience_years VARCHAR(50),
      job_category VARCHAR(100),
      start_timeline VARCHAR(50),
      preferred_destination VARCHAR(100),
      matched_country VARCHAR(100),
      matched_job_title VARCHAR(255),
      matched_processing_time VARCHAR(100),
      score INTEGER DEFAULT 95,
      photo_data TEXT,
      cv_filename VARCHAR(255),
      ip_address VARCHAR(100),
      city VARCHAR(100),
      country VARCHAR(100),
      country_code VARCHAR(10),
      user_agent TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS page_views (
      id SERIAL PRIMARY KEY,
      path VARCHAR(255) NOT NULL,
      title VARCHAR(255),
      ip_address VARCHAR(100),
      city VARCHAR(100),
      country VARCHAR(100),
      referrer TEXT,
      user_agent TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sent_emails (
      id SERIAL PRIMARY KEY,
      to_email VARCHAR(255) NOT NULL,
      to_name VARCHAR(255),
      subject VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      tracking_id VARCHAR(50),
      status VARCHAR(50) DEFAULT 'sent',
      error_message TEXT,
      sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_evaluations_tracking_id ON evaluations(tracking_id);
    CREATE INDEX IF NOT EXISTS idx_evaluations_email ON evaluations(email);
    CREATE INDEX IF NOT EXISTS idx_evaluations_created ON evaluations(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at DESC);
  `);
  console.log('✓ Tables created / verified successfully in PostgreSQL database!');

  client.release();
  await pool.end();
  console.log('--- ALL DB TESTS PASSED ---');
}

test().catch(err => {
  console.error('Connection failed:', err);
  process.exit(1);
});
