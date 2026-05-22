-- ============================================
-- MIDOS QUEST - MySQL Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS midos_quest;
USE midos_quest;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'creator') DEFAULT 'creator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin (password: admin123)
INSERT INTO users (username, password, role) VALUES 
('admin', '$2a$10$8K1p/a0dL1LXMc0pQ8K5/.xL9F5k5X5k5X5k5X5k5X5k5X5k5X5k5', 'admin');

-- ============================================
-- GOVERNORATES TABLE (removed sleep_place)
-- ============================================
CREATE TABLE IF NOT EXISTS governorates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    name_ar VARCHAR(50) NOT NULL,
    x_position DECIMAL(5,2) NOT NULL,
    y_position DECIMAL(5,2) NOT NULL,
    region ENUM('north', 'center', 'south') NOT NULL,
    visited TINYINT(1) DEFAULT 0,
    completed TINYINT(1) DEFAULT 0,
    visit_day INT NULL,
    story TEXT,
    youtube_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert all 24 governorates with positions for the SVG map
INSERT INTO governorates (name, name_ar, x_position, y_position, region) VALUES
('Tunis', 'تونس', 52, 12, 'north'),
('Ariana', 'أريانة', 54, 10, 'north'),
('Ben Arous', 'بن عروس', 51, 15, 'north'),
('Manouba', 'منوبة', 48, 11, 'north'),
('Nabeul', 'نابل', 60, 18, 'north'),
('Zaghouan', 'زغوان', 50, 20, 'north'),
('Bizerte', 'بنزرت', 50, 5, 'north'),
('Béja', 'باجة', 40, 12, 'north'),
('Jendouba', 'جندوبة', 32, 10, 'north'),
('Kef', 'الكاف', 32, 18, 'north'),
('Siliana', 'سليانة', 40, 22, 'north'),
('Sousse', 'سوسة', 58, 32, 'center'),
('Monastir', 'المنستير', 60, 35, 'center'),
('Mahdia', 'المهدية', 58, 40, 'center'),
('Kairouan', 'القيروان', 48, 32, 'center'),
('Kasserine', 'القصرين', 35, 32, 'center'),
('Sidi Bouzid', 'سيدي بوزيد', 42, 40, 'center'),
('Sfax', 'صفاقس', 54, 48, 'center'),
('Gabès', 'قابس', 50, 60, 'south'),
('Medenine', 'مدنين', 54, 68, 'south'),
('Tataouine', 'تطاوين', 50, 78, 'south'),
('Gafsa', 'قفصة', 35, 45, 'south'),
('Tozeur', 'توزر', 28, 52, 'south'),
('Kebili', 'قبلي', 38, 58, 'south');

-- ============================================
-- INVENTORY ITEMS TABLE (simplified - no category, no rarity, no weight)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image LONGTEXT,
    quantity INT DEFAULT 1,
    price DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- BALANCE LOGS TABLE (tracks all money movements)
-- ============================================
CREATE TABLE IF NOT EXISTS balance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_number INT NOT NULL,
    type ENUM('earned', 'spent') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    log_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- UPLOADED MEDIA TABLE (for videos count)
-- ============================================
CREATE TABLE IF NOT EXISTS uploaded_media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    governorate_id INT NULL,
    media_type ENUM('image', 'video') NOT NULL,
    url VARCHAR(500) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (governorate_id) REFERENCES governorates(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_governorates_visited ON governorates(visited);
CREATE INDEX idx_governorates_completed ON governorates(completed);
CREATE INDEX idx_balance_type ON balance_logs(type);
CREATE INDEX idx_balance_day ON balance_logs(day_number);

-- ============================================
-- GOVERNORATE GUESS POLLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS gov_polls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    goves JSON NOT NULL,
    votes JSON NOT NULL,
    next_gov_id INT DEFAULT NULL,
    image LONGTEXT DEFAULT NULL,
    end_time TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

