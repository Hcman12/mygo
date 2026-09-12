import pg from 'pg';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const { Pool } = pg;

const rawUrl = process.env.DATABASE_URL || 'postgres://avnadmin:AVNS_PeY8pKq5zbGH-6Oko7B@pg-ce15165-mygo.l.aivencloud.com:15897/defaultdb';
const connectionString = rawUrl.replace('?sslmode=require', '').replace('&sslmode=require', '');

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 30000,
  keepAlive: true,
});

let schemaInitialized = false;

export async function initDb() {
  if (schemaInitialized) return;

  const client = await pool.connect();
  try {
    // 1. Evaluations table (Candidate intake & results)
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
        status VARCHAR(50) DEFAULT 'pending',
        admin_notes TEXT,
        photo_data TEXT,
        cv_filename VARCHAR(255),
        ip_address VARCHAR(100),
        city VARCHAR(100),
        country VARCHAR(100),
        country_code VARCHAR(10),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
      ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS admin_notes TEXT;
      ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    `);

    // 2. Page views table (Traffic analytics)
    await client.query(`
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
    `);

    // 3. Sent emails table (Email composer history)
    await client.query(`
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
    `);

    // 4. Inquiries & Inbound Messages table (Support desk & candidate inquiries)
    await client.query(`
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
    `);

    // Indexes for fast search
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_evaluations_tracking_id ON evaluations(tracking_id);
      CREATE INDEX IF NOT EXISTS idx_evaluations_email ON evaluations(email);
      CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);
      CREATE INDEX IF NOT EXISTS idx_evaluations_created ON evaluations(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
      CREATE INDEX IF NOT EXISTS idx_inquiries_tracking_id ON inquiries(tracking_id);
    `);

    schemaInitialized = true;
    console.log('✓ PostgreSQL database schema initialized successfully.');
  } catch (error) {
    console.error('Error initializing PostgreSQL database schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function query(text: string, params?: any[]) {
  await initDb();
  try {
    return await pool.query(text, params);
  } catch (err: any) {
    if (err.message && (err.message.includes('timeout') || err.message.includes('Connection terminated'))) {
      console.warn('Database query connection timeout, retrying once...');
      return await pool.query(text, params);
    }
    throw err;
  }
}
