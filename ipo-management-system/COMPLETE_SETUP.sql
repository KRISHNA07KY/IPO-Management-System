-- IPO Management System - Complete Setup in One File
-- Copy and paste this entire file into MySQL to set everything up

-- Create database
CREATE DATABASE IF NOT EXISTS ipo_management_system;
USE ipo_management_system;

-- Set SQL mode for proper behavior
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- TABLES (from 01_create_tables.sql)
-- ========================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS Refund;
DROP TABLE IF EXISTS Allotment;
DROP TABLE IF EXISTS Application;
DROP TABLE IF EXISTS Applicant;
DROP TABLE IF EXISTS Company;

-- Company Table - IPO details
CREATE TABLE Company (
    ipo_id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(100) NOT NULL,
    total_shares INT NOT NULL CHECK (total_shares > 0),
    price_per_share DECIMAL(10,2) NOT NULL CHECK (price_per_share > 0),
    issue_start_date DATE NOT NULL,
    issue_end_date DATE NOT NULL,
    listing_date DATE,
    min_lot_size INT DEFAULT 1 CHECK (min_lot_size > 0),
    max_shares_per_applicant INT CHECK (max_shares_per_applicant > 0),
    status ENUM('UPCOMING', 'OPEN', 'CLOSED', 'LISTED') DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (issue_end_date >= issue_start_date),
    CHECK (listing_date IS NULL OR listing_date > issue_end_date)
);

-- Applicant Table - Investor details
CREATE TABLE Applicant (
    applicant_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    pan_number VARCHAR(10) NOT NULL UNIQUE,
    demat_account_no VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    phone VARCHAR(15),
    address TEXT,
    kyc_status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Application Table - Each bid
CREATE TABLE Application (
    application_id INT PRIMARY KEY AUTO_INCREMENT,
    ipo_id INT NOT NULL,
    applicant_id INT NOT NULL,
    shares_requested INT NOT NULL CHECK (shares_requested > 0),
    bid_amount DECIMAL(12,2) NOT NULL CHECK (bid_amount > 0),
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'PROCESSED', 'CANCELLED') DEFAULT 'PENDING',
    category ENUM('RETAIL', 'HNI', 'INSTITUTIONAL') DEFAULT 'RETAIL',
    FOREIGN KEY (ipo_id) REFERENCES Company(ipo_id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES Applicant(applicant_id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (ipo_id, applicant_id)
);

-- Allotment Table - Result of allotment
CREATE TABLE Allotment (
    allotment_id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    shares_allotted INT NOT NULL DEFAULT 0 CHECK (shares_allotted >= 0),
    allotment_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (allotment_amount >= 0),
    allotment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    allotment_method ENUM('LOTTERY', 'PRO_RATA', 'FULL') DEFAULT 'FULL',
    allotment_ratio DECIMAL(5,4) DEFAULT 1.0000,
    FOREIGN KEY (application_id) REFERENCES Application(application_id) ON DELETE CASCADE
);

-- Refund Table - Refund details
CREATE TABLE Refund (
    refund_id INT PRIMARY KEY AUTO_INCREMENT,
    allotment_id INT NOT NULL,
    refund_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (refund_amount >= 0),
    refund_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    refund_status ENUM('PENDING', 'PROCESSED', 'FAILED') DEFAULT 'PENDING',
    refund_reference_no VARCHAR(50),
    processing_charges DECIMAL(8,2) DEFAULT 0,
    net_refund_amount DECIMAL(12,2) GENERATED ALWAYS AS (refund_amount - processing_charges) STORED,
    FOREIGN KEY (allotment_id) REFERENCES Allotment(allotment_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_company_status ON Company(status);
CREATE INDEX idx_company_dates ON Company(issue_start_date, issue_end_date);
CREATE INDEX idx_applicant_pan ON Applicant(pan_number);
CREATE INDEX idx_applicant_demat ON Applicant(demat_account_no);
CREATE INDEX idx_application_ipo ON Application(ipo_id);
CREATE INDEX idx_application_date ON Application(application_date);
CREATE INDEX idx_allotment_date ON Allotment(allotment_date);
CREATE INDEX idx_refund_status ON Refund(refund_status);

-- ========================================
-- INSERT SAMPLE DATA
-- ========================================

-- Insert sample companies
INSERT INTO Company (company_name, total_shares, price_per_share, issue_start_date, issue_end_date, listing_date, min_lot_size, max_shares_per_applicant, status) VALUES
('TechCorp Ltd', 1000, 100.00, '2025-09-15', '2025-09-18', '2025-09-25', 10, 100, 'CLOSED'),
('GreenEnergy Solutions', 5000, 250.00, '2025-09-20', '2025-09-23', NULL, 5, 200, 'OPEN');

-- Insert sample applicants
INSERT INTO Applicant (full_name, pan_number, demat_account_no, email, phone, address, kyc_status) VALUES
('Rajesh Kumar', 'ABCDE1234F', 'IN300123456789', 'rajesh.kumar@email.com', '9876543210', '123 MG Road, Mumbai', 'VERIFIED'),
('Priya Sharma', 'BCDEF2345G', 'IN300234567890', 'priya.sharma@email.com', '9876543211', '456 Park Street, Kolkata', 'VERIFIED'),
('Amit Patel', 'CDEFG3456H', 'IN300345678901', 'amit.patel@email.com', '9876543212', '789 Commercial Street, Bangalore', 'VERIFIED');

-- Insert sample applications (for TechCorp - creating oversubscription)
INSERT INTO Application (ipo_id, applicant_id, shares_requested, bid_amount, category) VALUES
(1, 1, 50, 5000.00, 'RETAIL'),
(1, 2, 80, 8000.00, 'HNI'),
(1, 3, 100, 10000.00, 'HNI');
-- Total: 230 shares requested vs 1000 available (not oversubscribed, but good for testing)

-- Success message
SELECT 'IPO Management System Setup Complete!' as Status,
       'Run: SELECT * FROM Company; to verify installation' as NextStep;