-- This script sets up the IPO management database by creating tables, inserting sample data, and setting up constraints and triggers.

-- Create tables
SOURCE ../database/schema/01_create_tables.sql;

-- Insert sample data
SOURCE ../database/data/sample_companies.sql;
SOURCE ../database/data/sample_applicants.sql;
SOURCE ../database/data/sample_applications.sql;

-- Set up constraints
SOURCE ../database/schema/02_constraints.sql;

-- Set up triggers
SOURCE ../database/schema/03_triggers.sql;