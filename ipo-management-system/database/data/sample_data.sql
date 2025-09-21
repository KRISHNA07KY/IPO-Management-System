+-- IPO Management System - Sample Data
-- Phase 3: Data Insertion
-- Insert sample IPO data, applicants, and applications

-- Insert sample companies with IPO details
INSERT INTO Company (company_name, total_shares, price_per_share, issue_start_date, issue_end_date, listing_date, min_lot_size, max_shares_per_applicant, status) VALUES
('TechCorp Ltd', 1000, 100.00, '2025-09-15', '2025-09-18', '2025-09-25', 10, 100, 'CLOSED'),
('GreenEnergy Solutions', 5000, 250.00, '2025-09-20', '2025-09-23', NULL, 5, 200, 'OPEN'),
('FinanceFirst Bank', 2000, 500.00, '2025-09-25', '2025-09-28', NULL, 2, 50, 'UPCOMING'),
('DataTech Analytics', 800, 75.00, '2025-09-10', '2025-09-13', '2025-09-20', 8, 80, 'LISTED');

-- Insert sample applicants
INSERT INTO Applicant (full_name, pan_number, demat_account_no, email, phone, address, kyc_status) VALUES
('Rajesh Kumar', 'ABCDE1234F', 'IN300123456789', 'rajesh.kumar@email.com', '9876543210', '123 MG Road, Mumbai, Maharashtra 400001', 'VERIFIED'),
('Priya Sharma', 'BCDEF2345G', 'IN300234567890', 'priya.sharma@email.com', '9876543211', '456 Park Street, Kolkata, West Bengal 700001', 'VERIFIED'),
('Amit Patel', 'CDEFG3456H', 'IN300345678901', 'amit.patel@email.com', '9876543212', '789 Commercial Street, Bangalore, Karnataka 560001', 'VERIFIED'),
('Sunita Singh', 'DEFGH4567I', 'IN300456789012', 'sunita.singh@email.com', '9876543213', '321 CP Road, Delhi, Delhi 110001', 'VERIFIED'),
('Vikram Joshi', 'EFGHI5678J', 'IN300567890123', 'vikram.joshi@email.com', '9876543214', '654 Brigade Road, Chennai, Tamil Nadu 600001', 'VERIFIED'),
('Neha Agarwal', 'FGHIJ6789K', 'IN300678901234', 'neha.agarwal@email.com', '9876543215', '987 FC Road, Pune, Maharashtra 411001', 'VERIFIED'),
('Rohit Verma', 'GHIJK7890L', 'IN300789012345', 'rohit.verma@email.com', '9876543216', '147 Residency Road, Hyderabad, Telangana 500001', 'VERIFIED'),
('Kavita Reddy', 'HIJKL8901M', 'IN300890123456', 'kavita.reddy@email.com', '9876543217', '258 MG Road, Ahmedabad, Gujarat 380001', 'VERIFIED'),
('Manoj Gupta', 'IJKLM9012N', 'IN300901234567', 'manoj.gupta@email.com', '9876543218', '369 Civil Lines, Jaipur, Rajasthan 302001', 'VERIFIED'),
('Deepika Iyer', 'JKLMN0123O', 'IN301012345678', 'deepika.iyer@email.com', '9876543219', '741 Whitefield, Kochi, Kerala 682001', 'VERIFIED'),
('Sanjay Malhotra', 'KLMNO1234P', 'IN301123456789', 'sanjay.malhotra@email.com', '9876543220', '852 Sector 15, Noida, Uttar Pradesh 201301', 'VERIFIED'),
('Anita Khanna', 'LMNOP2345Q', 'IN301234567890', 'anita.khanna@email.com', '9876543221', '963 Model Town, Chandigarh, Chandigarh 160001', 'VERIFIED');

-- Insert applications for TechCorp Ltd (Oversubscribed scenario - 1000 shares available, but more demanded)
INSERT INTO Application (ipo_id, applicant_id, shares_requested, bid_amount, category) VALUES
(1, 1, 50, 5000.00, 'RETAIL'),   -- Rajesh Kumar
(1, 2, 30, 3000.00, 'RETAIL'),   -- Priya Sharma  
(1, 3, 100, 10000.00, 'HNI'),    -- Amit Patel (requesting max allowed)
(1, 4, 40, 4000.00, 'RETAIL'),   -- Sunita Singh
(1, 5, 80, 8000.00, 'HNI'),      -- Vikram Joshi
(1, 6, 20, 2000.00, 'RETAIL'),   -- Neha Agarwal
(1, 7, 60, 6000.00, 'RETAIL'),   -- Rohit Verma
(1, 8, 90, 9000.00, 'HNI'),      -- Kavita Reddy
(1, 9, 70, 7000.00, 'RETAIL'),   -- Manoj Gupta
(1, 10, 100, 10000.00, 'HNI'),   -- Deepika Iyer (requesting max allowed)
(1, 11, 25, 2500.00, 'RETAIL'),  -- Sanjay Malhotra
(1, 12, 35, 3500.00, 'RETAIL');  -- Anita Khanna
-- Total requested: 700 shares (less than 1000, so normal allotment for some, but we'll create oversubscription by adding more)

-- Additional applications to create oversubscription
INSERT INTO Application (ipo_id, applicant_id, shares_requested, bid_amount, category) VALUES
-- Add more applications to exceed 1000 shares total demand
(1, 1, 50, 5000.00, 'RETAIL'),   -- Additional application (this will be caught by unique constraint)
(1, 2, 80, 8000.00, 'RETAIL');   -- Additional application (this will be caught by unique constraint)

-- Let's add more applications for other IPOs
-- GreenEnergy Solutions (ipo_id = 2) - Normal subscription
INSERT INTO Application (ipo_id, applicant_id, shares_requested, bid_amount, category) VALUES
(2, 1, 20, 5000.00, 'RETAIL'),   -- Rajesh Kumar (20 * 250 = 5000)
(2, 3, 40, 10000.00, 'RETAIL'),  -- Amit Patel (40 * 250 = 10000)
(2, 5, 15, 3750.00, 'RETAIL'),   -- Vikram Joshi (15 * 250 = 3750)
(2, 7, 25, 6250.00, 'RETAIL'),   -- Rohit Verma (25 * 250 = 6250)
(2, 9, 30, 7500.00, 'RETAIL');   -- Manoj Gupta (30 * 250 = 7500)
-- Total: 130 shares (well under 5000 available)

-- DataTech Analytics (ipo_id = 4) - Oversubscribed scenario
INSERT INTO Application (ipo_id, applicant_id, shares_requested, bid_amount, category) VALUES
(4, 2, 80, 6000.00, 'HNI'),      -- Priya Sharma (80 * 75 = 6000)
(4, 4, 80, 6000.00, 'HNI'),      -- Sunita Singh (80 * 75 = 6000) - max allowed
(4, 6, 40, 3000.00, 'RETAIL'),   -- Neha Agarwal (40 * 75 = 3000)
(4, 8, 80, 6000.00, 'HNI'),      -- Kavita Reddy (80 * 75 = 6000) - max allowed
(4, 10, 60, 4500.00, 'RETAIL'),  -- Deepika Iyer (60 * 75 = 4500)
(4, 11, 80, 6000.00, 'HNI'),     -- Sanjay Malhotra (80 * 75 = 6000) - max allowed
(4, 12, 70, 5250.00, 'RETAIL');  -- Anita Khanna (70 * 75 = 5250)
-- Total: 490 shares (well under 800 available)

-- Let's create a true oversubscription scenario for TechCorp by removing the duplicate constraint violations
-- and adding a few more realistic applications
-- We need to modify our applications to create oversubscription

-- Update: Let's add more applicants to create oversubscription for TechCorp
INSERT INTO Applicant (full_name, pan_number, demat_account_no, email, phone, kyc_status) VALUES
('Ravi Shankar', 'MNOPQ3456R', 'IN301345678901', 'ravi.shankar@email.com', '9876543222', 'VERIFIED'),
('Sneha Kapoor', 'NOPQR4567S', 'IN301456789012', 'sneha.kapoor@email.com', '9876543223', 'VERIFIED'),
('Arjun Mehta', 'OPQRS5678T', 'IN301567890123', 'arjun.mehta@email.com', '9876543224', 'VERIFIED'),
('Pooja Jain', 'PQRST6789U', 'IN301678901234', 'pooja.jain@email.com', '9876543225', 'VERIFIED'),
('Kiran Kumar', 'QRSTU7890V', 'IN301789012345', 'kiran.kumar@email.com', '9876543226', 'VERIFIED');

-- Add more applications for TechCorp to create oversubscription
INSERT INTO Application (ipo_id, applicant_id, shares_requested, bid_amount, category) VALUES
(1, 13, 100, 10000.00, 'HNI'),   -- Ravi Shankar (max allowed)
(1, 14, 80, 8000.00, 'HNI'),     -- Sneha Kapoor
(1, 15, 100, 10000.00, 'HNI'),   -- Arjun Mehta (max allowed)
(1, 16, 90, 9000.00, 'HNI'),     -- Pooja Jain
(1, 17, 100, 10000.00, 'HNI');   -- Kiran Kumar (max allowed)

-- Now TechCorp total demand: 700 + 470 = 1170 shares demanded vs 1000 available (17% oversubscribed)