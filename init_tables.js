import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const rawUrl = process.env.DATABASE_URL || 'postgres://avnadmin:AVNS_PeY8pKq5zbGH-6Oko7B@pg-ce15165-mygo.l.aivencloud.com:15897/defaultdb';
const connectionString = rawUrl.replace('?sslmode=require', '').replace('&sslmode=require', '');

console.log('Connecting to PostgreSQL...');
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('Connected! Creating tables...');
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

      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        tracking_id VARCHAR(50),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        topic VARCHAR(100),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'unread',
        is_starred BOOLEAN DEFAULT false,
        admin_reply TEXT,
        replied_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_evaluations_tracking_id ON evaluations(tracking_id);
      CREATE INDEX IF NOT EXISTS idx_evaluations_email ON evaluations(email);
      CREATE INDEX IF NOT EXISTS idx_evaluations_created ON evaluations(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
    `);
    console.log('All tables created successfully!');
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Existing tables in public schema:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Error in main:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
