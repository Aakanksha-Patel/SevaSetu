-- =======================================================
-- SevaSetu MySQL Database Schema for MySQL Workbench
-- Project: SevaSetu - Social-Impact Ecosystem
-- Target DBMS: MySQL 8.0 / MariaDB 10.5+
-- Host Configuration: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
-- Database Name: sevasetu
-- =======================================================

CREATE DATABASE IF NOT EXISTS sevasetu
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sevasetu;

-- Safe teardown of existing tables in reverse dependency order
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS certificates;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS volunteer_applications;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS volunteers;
DROP TABLE IF EXISTS ngos;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- =======================================================
-- 1. USERS TABLE
-- Roles: user, volunteer, ngo, admin
-- Security Constraint: Admin role is NOT allowed via public registration!
-- =======================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(150) DEFAULT 'Mumbai, Maharashtra',
    profile_image VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    role ENUM('user', 'volunteer', 'ngo', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE users
    -> ADD COLUMN status ENUM('active', 'inactive')
    -> DEFAULT 'active';

-- =======================================================
-- 2. NGOS TABLE
-- Foreign Key: user_id -> users(id) ON DELETE CASCADE
-- Verification Status: pending, verified, rejected
-- =======================================================
CREATE TABLE ngos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    address VARCHAR(255),
    logo VARCHAR(500),
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ngos_user_id (user_id),
    INDEX idx_ngos_verification_status (verification_status),
    INDEX idx_ngos_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- 3. VOLUNTEERS TABLE
-- Foreign Key: user_id -> users(id) ON DELETE CASCADE
-- =======================================================
CREATE TABLE volunteers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skills VARCHAR(255),
    interests VARCHAR(255),
    availability VARCHAR(100) DEFAULT 'Weekends & Evenings',
    location VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_volunteers_user_id (user_id),
    INDEX idx_volunteers_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- 4. EVENTS TABLE
-- Foreign Key: ngo_id -> ngos(id) ON DELETE CASCADE
-- Status: pending, approved, rejected, completed
-- =======================================================
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ngo_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    location VARCHAR(150) NOT NULL,
    image VARCHAR(500),
    required_volunteers INT NOT NULL DEFAULT 10,
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE,
    INDEX idx_events_ngo_id (ngo_id),
    INDEX idx_events_status (status),
    INDEX idx_events_date (date),
    INDEX idx_events_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- 5. VOLUNTEER_APPLICATIONS TABLE
-- Foreign Keys: volunteer_id -> volunteers(id), event_id -> events(id)
-- Status: pending, accepted, rejected, completed
-- =======================================================
CREATE TABLE volunteer_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    volunteer_id INT NOT NULL,
    event_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_volunteer_event (volunteer_id, event_id),
    INDEX idx_va_volunteer_id (volunteer_id),
    INDEX idx_va_event_id (event_id),
    INDEX idx_va_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- 6. DONATIONS TABLE
-- Foreign Keys: user_id -> users(id), ngo_id -> ngos(id)
-- =======================================================
CREATE TABLE donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    ngo_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE,
    INDEX idx_donations_user_id (user_id),
    INDEX idx_donations_ngo_id (ngo_id),
    INDEX idx_donations_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- 7. FEEDBACK TABLE
-- Foreign Keys: user_id -> users(id), ngo_id -> ngos(id), event_id -> events(id)
-- Rating Range: 1 to 5
-- =======================================================
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ngo_id INT NOT NULL,
    event_id INT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    INDEX idx_feedback_user_id (user_id),
    INDEX idx_feedback_ngo_id (ngo_id),
    INDEX idx_feedback_event_id (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- 8. CERTIFICATES TABLE
-- Foreign Keys: volunteer_id -> volunteers(id), event_id -> events(id)
-- =======================================================
CREATE TABLE certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    volunteer_id INT NOT NULL,
    event_id INT NOT NULL,
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_cert_volunteer_id (volunteer_id),
    INDEX idx_cert_event_id (event_id),
    INDEX idx_cert_number (certificate_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- INITIAL DEMO DATA
-- Passwords below are hashed using bcrypt:
-- Admin: admin123
-- NGO: ngo123
-- Volunteer: volunteer123
-- User: user123
-- =======================================================

INSERT INTO users (id, name, email, password, phone, location, profile_image, role) VALUES
(1, 'System Administrator', 'admin@sevasetu.org', '$2a$10$wTqg.qZlQd1LpT6M3rXG6uC1n7F8H0uJ9x3K9yL1a4z2c8e6b7d2.', '+91 98110 00001', 'New Delhi', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', 'admin'),
(2, 'Aarogya Health Foundation', 'contact@aarogya.org', '$2a$10$wTqg.qZlQd1LpT6M3rXG6uC1n7F8H0uJ9x3K9yL1a4z2c8e6b7d2.', '+91 98220 11112', 'Mumbai, Maharashtra', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=200', 'ngo'),
(3, 'Vidya Jyoti Educational Trust', 'info@vidyajyoti.ngo', '$2a$10$wTqg.qZlQd1LpT6M3rXG6uC1n7F8H0uJ9x3K9yL1a4z2c8e6b7d2.', '+91 98111 88888', 'New Delhi', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=200', 'ngo'),
(4, 'Priya Sharma', 'priya.volunteer@gmail.com', '$2a$10$wTqg.qZlQd1LpT6M3rXG6uC1n7F8H0uJ9x3K9yL1a4z2c8e6b7d2.', '+91 98330 22223', 'Bengaluru, Karnataka', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', 'volunteer'),
(5, 'Rohan Mehta', 'rohan.volunteer@gmail.com', '$2a$10$wTqg.qZlQd1LpT6M3rXG6uC1n7F8H0uJ9x3K9yL1a4z2c8e6b7d2.', '+91 98441 55555', 'Pune, Maharashtra', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', 'volunteer'),
(6, 'Rahul Verma', 'rahul.user@gmail.com', '$2a$10$wTqg.qZlQd1LpT6M3rXG6uC1n7F8H0uJ9x3K9yL1a4z2c8e6b7d2.', '+91 98440 33334', 'Mumbai, Maharashtra', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', 'user'),
(7, 'Ananya Sen', 'ananya.user@gmail.com', '$2a$10$wTqg.qZlQd1LpT6M3rXG6uC1n7F8H0uJ9x3K9yL1a4z2c8e6b7d2.', '+91 98770 99999', 'Kolkata, West Bengal', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', 'user');

INSERT INTO ngos (id, user_id, name, email, phone, category, description, address, logo, registration_number, verification_status) VALUES
(1, 2, 'Aarogya Health Foundation', 'contact@aarogya.org', '+91 98220 11112', 'Healthcare', 'Dedicated to offering free rural medical camps, pediatric clinics, and emergency mobile healthcare van outreach across rural India.', '402 Lotus Business Park, Andheri West, Mumbai, MH 400053', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=200', 'MH/2018/009182', 'verified'),
(2, 3, 'Vidya Jyoti Educational Trust', 'info@vidyajyoti.ngo', '+91 98111 88888', 'Education', 'Bridging educational disparity through digital smart classrooms, rural STEM clubs, and girls scholarship initiatives.', '12 Institutional Area, Lodhi Road, New Delhi 110003', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=200', 'DL/2019/004321', 'verified');

INSERT INTO volunteers (id, user_id, skills, interests, availability, location) VALUES
(1, 4, 'Teaching, First Aid, Content Writing, Patient Triage', 'Child Education, Community Health, Emergency Response', 'Weekends (Saturday & Sunday)', 'Bengaluru, Karnataka'),
(2, 5, 'Graphic Design, Photography, Social Media, Event Logistics', 'Environmental Protection, Youth Literacy, Animal Welfare', 'Flexible Evenings & Sundays', 'Pune, Maharashtra');

INSERT INTO events (id, ngo_id, title, description, category, date, time, location, image, required_volunteers, status) VALUES
(1, 1, 'Emergency Rural Mobile Health Camp', 'Providing comprehensive health screenings, cataract diagnostics, vital checks, and free medicines for 300+ tribal villagers.', 'Healthcare', '2026-10-15', '09:00 AM - 04:00 PM', 'Tribal Welfare Center, Thane District, Maharashtra', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800', 15, 'approved'),
(2, 2, 'STEM & Robotics Workshop for Rural Girls', 'Interactive science experiments and robotics lab for 200 middle school girls to foster STEM curiosity and digital confidence.', 'Education', '2026-11-05', '10:00 AM - 02:00 PM', 'Zilla Parishad High School, Nashik, Maharashtra', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800', 10, 'approved'),
(3, 1, 'Warm Meals & Nutrition Ration Drive', 'Packaging and distribution of nutritious grain kits and hot lunches to homeless and migrant construction families.', 'Hunger Relief', '2026-09-28', '11:00 AM - 03:00 PM', 'Dharavi Sector 3, Mumbai, Maharashtra', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800', 8, 'approved'),
(4, 2, 'Clean Drinking Water & Sanitation Drive', 'Installation and testing of solar-powered reverse osmosis water filtration units in 12 rural government schools.', 'Disaster Relief', '2026-12-10', '09:30 AM - 01:30 PM', 'Sundarbans Coastal Delta, West Bengal', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=800', 6, 'completed');

INSERT INTO volunteer_applications (id, volunteer_id, event_id, status, applied_at) VALUES
(1, 1, 1, 'accepted', '2026-02-15 10:30:00'),
(2, 1, 4, 'completed', '2026-01-10 11:00:00'),
(3, 2, 2, 'pending', '2026-02-20 14:15:00'),
(4, 2, 3, 'accepted', '2026-02-25 09:45:00');

INSERT INTO donations (id, user_id, ngo_id, amount, status, donated_at) VALUES
(1, 6, 1, 2500.00, 'completed', '2026-02-28 15:20:00'),
(2, 6, 2, 1500.00, 'completed', '2026-03-01 11:10:00'),
(3, 7, 1, 5000.00, 'completed', '2026-03-02 17:40:00');

INSERT INTO feedback (id, user_id, ngo_id, event_id, rating, comment, created_at) VALUES
(1, 6, 1, 1, 5, 'Incredible grassroots impact! The medical camp was transparently managed and helped over 180 patients.', '2026-02-28 16:00:00'),
(2, 7, 2, 2, 5, 'Watching village students build their first solar circuit was deeply inspiring. Transparent NGO!', '2026-03-01 12:00:00'),
(3, 4, 1, 1, 5, 'Extremely well-organized volunteer coordination. Clear roles, safe environment, and immense community gratitude.', '2026-02-16 18:30:00');

INSERT INTO certificates (id, volunteer_id, event_id, certificate_number, issued_date) VALUES
(1, 1, 4, 'SEVA-2026-CERT-8841', '2026-01-15 10:30:00'),
(2, 1, 1, 'SEVA-2026-CERT-9124', '2026-02-01 14:00:00');
