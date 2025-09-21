-- Quick Start Examples for IPO Management System
-- Run these commands after setting up the database

-- ====================================
-- STEP 1: Check Initial Data
-- ====================================

-- View all IPOs
SELECT * FROM vw_ipo_overview;

-- Check applications for TechCorp (should show oversubscription)
SELECT 
    company_name,
    total_applications,
    total_shares_applied,
    subscription_ratio,
    subscription_status
FROM vw_ipo_overview 
WHERE company_name = 'TechCorp Ltd';

-- ====================================
-- STEP 2: Process Your First IPO Allotment
-- ====================================

-- Process TechCorp IPO (oversubscribed scenario)
CALL process_ipo_allotment(1, 'AUTO');

-- Check allotment results
SELECT 
    applicant_name,
    shares_requested,
    shares_allotted,
    allotment_amount,
    allotment_method,
    allotment_status
FROM vw_allotment_report 
WHERE company_name = 'TechCorp Ltd'
ORDER BY shares_allotted DESC;

-- ====================================
-- STEP 3: View Financial Summary
-- ====================================

-- Check money flow for TechCorp
CALL calculate_ipo_money_flow(1);

-- View refund summary
SELECT 
    applicant_name,
    original_bid,
    amount_allocated,
    gross_refund,
    net_refund,
    refund_status
FROM vw_refund_summary 
WHERE company_name = 'TechCorp Ltd'
AND refund_amount > 0;

-- ====================================
-- STEP 4: Process More IPOs
-- ====================================

-- Process GreenEnergy (normal subscription)
CALL process_ipo_allotment(2, 'AUTO');

-- Process DataTech with lottery method
CALL process_ipo_allotment(4, 'LOTTERY');

-- ====================================
-- STEP 5: Generate Reports
-- ====================================

-- Overall dashboard
SELECT * FROM vw_application_dashboard;

-- Oversubscription analysis
SELECT 
    company_name,
    oversubscription_ratio,
    oversubscription_percentage,
    successful_applicants,
    unsuccessful_applicants
FROM vw_oversubscription_analysis;

-- Top applicants by investment
SELECT 
    full_name,
    total_bid_amount,
    total_amount_invested,
    overall_success_rate
FROM vw_top_applicants 
ORDER BY total_bid_amount DESC
LIMIT 10;

-- ====================================
-- STEP 6: Test Error Handling
-- ====================================

-- Try to insert invalid PAN (should fail)
-- INSERT INTO Applicant (full_name, pan_number, demat_account_no) 
-- VALUES ('Test User', 'INVALID123', 'IN300123456789');

-- Try to apply for shares exceeding limit (should fail)
-- INSERT INTO Application (ipo_id, applicant_id, shares_requested, bid_amount)
-- VALUES (1, 1, 150, 15000.00);

-- ====================================
-- SUCCESS! Your IPO Management System is working!
-- ====================================