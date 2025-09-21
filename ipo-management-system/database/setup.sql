-- IPO Management System - Master Setup Script
-- Complete database setup and initialization script
-- Run this script to set up the entire IPO Management System

-- Create database
CREATE DATABASE IF NOT EXISTS ipo_management_system;
USE ipo_management_system;

-- Enable foreign key checks and set SQL mode
SET FOREIGN_KEY_CHECKS = 1;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- Source all schema files
-- Note: In a real environment, you would execute these files in order:

-- 1. Create tables
-- SOURCE database/schema/01_create_tables.sql;

-- 2. Create constraints and triggers  
-- SOURCE database/schema/02_constraints_triggers.sql;

-- 3. Create stored procedures
-- SOURCE database/procedures/allotment_procedures.sql;
-- SOURCE database/procedures/refund_procedures.sql;

-- 4. Create views
-- SOURCE database/views/reporting_views.sql;

-- 5. Insert sample data
-- SOURCE database/data/sample_data.sql;

-- Verify installation
SELECT 'IPO Management System Database Setup Complete' as status;

-- Show all tables
SHOW TABLES;

-- Show table statistics
SELECT 
    table_name,
    table_rows,
    data_length,
    index_length
FROM information_schema.tables 
WHERE table_schema = 'ipo_management_system'
ORDER BY table_name;