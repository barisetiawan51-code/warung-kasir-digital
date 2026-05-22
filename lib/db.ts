import mysql from "mysql2/promise";

const isCloud = process.env.DB_HOST?.includes('aivencloud.com') || process.env.DB_HOST?.includes('railway.app') || process.env.DB_HOST?.includes('aws');

const dbConfig: mysql.ConnectionOptions = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  ssl: isCloud ? { rejectUnauthorized: false } : undefined,
};

let pool: mysql.Pool | null = null;

export async function initDb(): Promise<mysql.Pool> {
  if (pool) return pool;

  try {
    const databaseName = process.env.DB_DATABASE || "warung_kasir";

    // 1. Establish temporary connection without database to create it if missing (for local dev)
    try {
      const tempConn = await mysql.createConnection({ ...dbConfig, ssl: undefined });
      await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
      await tempConn.end();
    } catch (err: any) {
      // Cloud databases like Aiven often restrict CREATE DATABASE permissions.
      // We log the warning and proceed, assuming the database (e.g., defaultdb) already exists.
      console.warn("Skipping CREATE DATABASE step (likely a cloud environment):", err.message);
    }

    // 2. Establish connection pool with correct database selection
    pool = mysql.createPool({
      ...dbConfig,
      database: databaseName,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
    });

    // 3. Initialize table schema
    // 3.1. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(100) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('Admin', 'Kasir') NOT NULL DEFAULT 'Kasir',
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_role (\`role\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3.2. Products Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`initials\` VARCHAR(5) NOT NULL,
        \`category\` VARCHAR(100) NOT NULL,
        \`image_url\` VARCHAR(255) DEFAULT NULL,
        \`purchase_price\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`price\` DECIMAL(12, 2) NOT NULL,
        \`stock\` INT NOT NULL DEFAULT 0,
        \`unit\` VARCHAR(50) NOT NULL,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_prod_category (\`category\`),
        INDEX idx_prod_name (\`name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Migration check: Ensure image_url column exists in products (for existing DB instances)
    try {
      const [cols]: any = await pool.query("SHOW COLUMNS FROM `products` LIKE 'image_url'");
      if (cols.length === 0) {
        console.log("Migrating products table: adding image_url column");
        await pool.query("ALTER TABLE `products` ADD COLUMN `image_url` VARCHAR(255) DEFAULT NULL AFTER `category`");
      }
    } catch (migErr) {
      console.error("Migration error for products.image_url:", migErr);
    }

    // Migration check: Ensure purchase_price column exists in products (for existing DB instances)
    try {
      const [cols]: any = await pool.query("SHOW COLUMNS FROM `products` LIKE 'purchase_price'");
      if (cols.length === 0) {
        console.log("Migrating products table: adding purchase_price column");
        await pool.query("ALTER TABLE `products` ADD COLUMN `purchase_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 AFTER `image_url`");
      }
    } catch (migErr) {
      console.error("Migration error for products.purchase_price:", migErr);
    }

    // 3.3. Transactions Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`transactions\` (
        \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
        \`user_id\` VARCHAR(50) NULL,
        \`timestamp\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`items_count\` INT NOT NULL DEFAULT 0,
        \`subtotal\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        \`total\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        \`cash_paid\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        \`change_amount\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'Lunas / Success',
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL,
        INDEX idx_trx_timestamp (\`timestamp\`),
        INDEX idx_trx_status (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Migration check: Ensure user_id column exists in transactions (for existing DB instances)
    try {
      const [cols]: any = await pool.query("SHOW COLUMNS FROM `transactions` LIKE 'user_id'");
      if (cols.length === 0) {
        console.log("Migrating transactions table: adding user_id column");
        await pool.query("ALTER TABLE `transactions` ADD COLUMN `user_id` VARCHAR(50) NULL AFTER `id`");
        // Check foreign key constraint or add it
        try {
          await pool.query("ALTER TABLE `transactions` ADD CONSTRAINT fk_transactions_user FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL");
        } catch (_) {
          // ignore if constraint exists
        }
      }
    } catch (migErr) {
      console.error("Migration error for transactions.user_id:", migErr);
    }

    // 3.4. Transaction Items Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`transaction_items\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`transaction_id\` VARCHAR(50) NOT NULL,
        \`product_id\` VARCHAR(50) NULL,
        \`product_name\` VARCHAR(255) NOT NULL,
        \`quantity\` INT NOT NULL DEFAULT 1,
        \`price\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        FOREIGN KEY (\`transaction_id\`) REFERENCES \`transactions\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE SET NULL,
        INDEX idx_item_trx (\`transaction_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3.5. Financial Reports Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`financial_reports\` (
        \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
        \`generated_by\` VARCHAR(50) NULL,
        \`report_date\` DATE NOT NULL,
        \`period_type\` VARCHAR(50) NOT NULL DEFAULT 'Daily',
        \`gross_revenue\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        \`transaction_volume\` INT NOT NULL DEFAULT 0,
        \`revenue_by_category\` JSON NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`generated_by\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL,
        UNIQUE INDEX uq_report_period (\`report_date\`, \`period_type\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Seed Default Users if empty
    const [userRows]: any = await pool.query("SELECT COUNT(*) as count FROM users");
    if (userRows && userRows[0] && userRows[0].count === 0) {
      // Seed default admin and cashier with precalculated bcrypt hashes (password: admin123, kasir123)
      const defaultUsers = [
        ['USR-ADMIN-1', 'Admin Warung', 'admin@warung.com', '$2a$12$Z.jG7lFk0.V1ZcQ6R7Tfpe0U9C.GgWdZgRpxbE4uKx572UbeI6WKy', 'Admin'],
        ['USR-KASIR-1', 'Kasir Warung', 'kasir@warung.com', '$2a$12$Z.jG7lFk0.V1ZcQ6R7Tfpe0U9C.GgWdZgRpxbE4uKx572UbeI6WKy', 'Kasir']
      ];
      for (const user of defaultUsers) {
        await pool.query(
          "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
          user
        );
      }
      console.log("Database default users seeded successfully.");
    }

    // 5. Seed default products if database products count is empty
    const [rows]: any = await pool.query("SELECT COUNT(*) as count FROM products");
    if (rows && rows[0] && rows[0].count === 0) {
      const defaultProducts = [
        ['1', 'Bayam Organik', 'BO', 'Sayuran', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', 10000.00, 12500.00, 15, '250G'],
        ['2', 'Beras Pandan', 'BP', 'Sembako', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', 70000.00, 79900.00, 24, '5KG'],
        ['3', 'Minyak Kelapa', 'MK', 'Minyak', 'https://images.unsplash.com/photo-1622484211148-716598e09141?w=400&q=80', 38000.00, 45000.00, 10, '1L'],
        ['4', 'Indomie Goreng', 'IG', 'Makanan', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&q=80', 2800.00, 3500.00, 120, '85G'],
        ['5', 'Kopi Susu', 'KS', 'Minuman', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80', 14000.00, 18000.00, 35, '250ML'],
        ['6', 'Teh Kotak', 'TK', 'Minuman', 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&q=80', 3500.00, 4500.00, 50, '300ML'],
        ['7', 'Gula Pasir', 'GP', 'Sembako', 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400&q=80', 15000.00, 17500.00, 0, '1KG'],
        ['8', 'Telur Ayam', 'TA', 'Sembako', 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&q=80', 24000.00, 28500.00, 40, '1KG'],
        ['9', 'Cabai Rawit', 'CR', 'Sayuran', 'https://images.unsplash.com/photo-1588252303782-cb80119cb665?w=400&q=80', 9000.00, 12000.00, 8, '100G'],
        ['10', 'Kecap Manis', 'KM', 'Minyak', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&q=80', 18000.00, 22000.00, 0, '520ML'],
        ['11', 'Keripik Singkong', 'KS', 'Makanan', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80', 11000.00, 14500.00, 18, '150G'],
        ['12', 'Bawang Merah', 'BM', 'Sayuran', 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=400&q=80', 15000.00, 19000.00, 25, '500G']
      ];
      
      for (const prod of defaultProducts) {
        await pool.query(
          "INSERT INTO products (id, name, initials, category, image_url, purchase_price, price, stock, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          prod
        );
      }
      console.log("Database products seeded successfully.");
    }

    console.log("MySQL Database configuration initialized successfully.");
    return pool;
  } catch (error) {
    console.error("MySQL Database connection pool error:", error);
    throw error;
  }
}

export async function executeQuery(sql: string, params?: any[]): Promise<any> {
  const activePool = await initDb();
  return activePool.query(sql, params);
}
