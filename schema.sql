-- SQL Schema definition for Warung Kasir Digital (MySQL & MariaDB Compatible)
-- Includes Users, Products, Transactions, Transaction Items, and Financial Reports

CREATE DATABASE IF NOT EXISTS `warung_kasir`;
USE `warung_kasir`;

-- 1. Table for Users (Auth & Roles)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('Admin', 'Kasir') NOT NULL DEFAULT 'Kasir',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_role (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table for Products
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `initials` VARCHAR(5) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `purchase_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (`purchase_price` >= 0.00),
  `price` DECIMAL(12, 2) NOT NULL CHECK (`price` >= 0.00),
  `stock` INT NOT NULL DEFAULT 0 CHECK (`stock` >= 0),
  `unit` VARCHAR(50) NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_prod_category (`category`),
  INDEX idx_prod_name (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table for Transactions Log
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(50) NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `items_count` INT NOT NULL DEFAULT 0,
  `subtotal` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `cash_paid` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `change_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Lunas / Success',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX idx_trx_timestamp (`timestamp`),
  INDEX idx_trx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table for Transaction Items Breakdown
CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transaction_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1 CHECK (`quantity` > 0),
  `price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (`price` >= 0.00),
  FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL,
  INDEX idx_item_trx (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Table for Financial Reports
CREATE TABLE IF NOT EXISTS `financial_reports` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `generated_by` VARCHAR(50) NULL,
  `report_date` DATE NOT NULL,
  `period_type` VARCHAR(50) NOT NULL DEFAULT 'Daily',
  `gross_revenue` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `transaction_volume` INT NOT NULL DEFAULT 0,
  `revenue_by_category` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`generated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  UNIQUE INDEX uq_report_period (`report_date`, `period_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Products
INSERT INTO `products` (`id`, `name`, `initials`, `category`, `purchase_price`, `price`, `stock`, `unit`) VALUES
('1', 'Bayam Organik', 'BO', 'Sayuran', 10000.00, 12500.00, 15, '250G'),
('2', 'Beras Pandan', 'BP', 'Sembako', 70000.00, 79900.00, 24, '5KG'),
('3', 'Minyak Kelapa', 'MK', 'Minyak', 38000.00, 45000.00, 10, '1L'),
('4', 'Indomie Goreng', 'IG', 'Makanan', 2800.00, 3500.00, 120, '85G'),
('5', 'Kopi Susu', 'KS', 'Minuman', 14000.00, 18000.00, 35, '250ML'),
('6', 'Teh Kotak', 'TK', 'Minuman', 3500.00, 4500.00, 50, '300ML'),
('7', 'Gula Pasir', 'GP', 'Sembako', 15000.00, 17500.00, 0, '1KG'),
('8', 'Telur Ayam', 'TA', 'Sembako', 24000.00, 28500.00, 40, '1KG'),
('9', 'Cabai Rawit', 'CR', 'Sayuran', 9000.00, 12000.00, 8, '100G'),
('10', 'Kecap Manis', 'KM', 'Minyak', 18000.00, 22000.00, 0, '520ML'),
('11', 'Keripik Singkong', 'KS', 'Makanan', 11000.00, 14500.00, 18, '150G'),
('12', 'Bawang Merah', 'BM', 'Sayuran', 15000.00, 19000.00, 25, '500G')
ON DUPLICATE KEY UPDATE 
`name`=VALUES(`name`), `initials`=VALUES(`initials`), `category`=VALUES(`category`), `purchase_price`=VALUES(`purchase_price`), `price`=VALUES(`price`), `stock`=VALUES(`stock`), `unit`=VALUES(`unit`);
