-- IPO Management System - Example Usage and Testing
-- Demonstration of all phases and functionality

-- ========================================
-- EXAMPLE 1: Complete IPO Process for TechCorp
-- ========================================

-- Check IPO overview
SELECT * FROM vw_ipo_overview WHERE company_name = 'TechCorp Ltd';

-- Check oversubscription status
SELECT * FROM vw_oversubscription_analysis WHERE company_name = 'TechCorp Ltd';

-- Process allotment for TechCorp (ipo_id = 1)
CALL process_ipo_allotment(1, 'AUTO');

-- Check allotment results
SELECT * FROM vw_allotment_report WHERE company_name = 'TechCorp Ltd';

-- Get allotment summary
CALL get_allotment_summary(1);

-- Process refunds
CALL auto_process_refunds_after_allotment(1);

-- Check refund summary
SELECT * FROM vw_refund_summary WHERE company_name = 'TechCorp Ltd';

-- Get financial summary
SELECT * FROM vw_ipo_financial_summary WHERE company_name = 'TechCorp Ltd';

-- ========================================
-- EXAMPLE 2: Normal Allotment for GreenEnergy
-- ========================================

-- Process allotment for GreenEnergy (ipo_id = 2) - Should be normal allotment
CALL process_ipo_allotment(2, 'AUTO');

-- Check results
SELECT * FROM vw_allotment_report WHERE company_name = 'GreenEnergy Solutions';

-- ========================================
-- EXAMPLE 3: Lottery Allotment for DataTech
-- ========================================

-- Force lottery allotment for DataTech (ipo_id = 4)
CALL process_ipo_allotment(4, 'LOTTERY');

-- Check results
SELECT * FROM vw_allotment_report WHERE company_name = 'DataTech Analytics';

-- ========================================
-- EXAMPLE 4: Comprehensive Reporting
-- ========================================

-- Overall dashboard view
SELECT * FROM vw_application_dashboard;

-- Performance metrics for all IPOs
SELECT * FROM vw_ipo_performance;

-- Top applicants by investment
SELECT * FROM vw_top_applicants LIMIT 10;

-- Daily activity summary
SELECT * FROM vw_daily_activity ORDER BY activity_date DESC;

-- ========================================
-- EXAMPLE 5: Error Handling and Validation
-- ========================================

-- Try to insert invalid PAN (should fail)
-- INSERT INTO Applicant (full_name, pan_number, demat_account_no) 
-- VALUES ('Test User', 'INVALID123', 'IN300123456789');

-- Try to apply for more than maximum shares (should fail)  
-- INSERT INTO Application (ipo_id, applicant_id, shares_requested, bid_amount)
-- VALUES (1, 1, 150, 15000.00); -- Exceeds max of 100 shares

-- Try to apply after IPO closes (should fail)
-- UPDATE Company SET status = 'CLOSED' WHERE ipo_id = 3;
-- INSERT INTO Application (ipo_id, applicant_id, shares_requested, bid_amount)
-- VALUES (3, 1, 10, 5000.00);

-- ========================================
-- EXAMPLE 6: Money Flow Analysis
-- ========================================

-- Calculate money flow for each IPO
CALL calculate_ipo_money_flow(1);
CALL calculate_ipo_money_flow(2);
CALL calculate_ipo_money_flow(4);

-- ========================================
-- EXAMPLE 7: Refund Processing Examples
-- ========================================

-- Check pending refunds
SELECT * FROM vw_refund_summary WHERE refund_status = 'PENDING';

-- Retry failed refunds for an IPO
CALL retry_failed_refunds(1);

-- Get detailed refund summary
CALL get_refund_summary(1);

-- ========================================
-- EXAMPLE 8: Rollback Scenarios
-- ========================================

-- If you need to rollback allotment for any reason:
-- CALL rollback_allotment(1);

-- ========================================
-- EXAMPLE 9: Custom Queries for Analysis
-- ========================================

-- Find most oversubscribed IPOs
SELECT 
    company_name,
    oversubscription_ratio,
    oversubscription_percentage
FROM vw_oversubscription_analysis 
ORDER BY oversubscription_ratio DESC;

-- Find applicants with highest success rates
SELECT 
    full_name,
    overall_success_rate,
    total_shares_requested,
    total_shares_allotted
FROM vw_top_applicants 
WHERE ipos_applied >= 2
ORDER BY overall_success_rate DESC;

-- Category-wise application analysis
SELECT 
    category,
    COUNT(*) as applications,
    SUM(shares_requested) as total_demand,
    AVG(shares_requested) as avg_demand,
    SUM(bid_amount) as total_amount
FROM Application a
JOIN Company c ON a.ipo_id = c.ipo_id
WHERE a.status != 'CANCELLED'
GROUP BY category;

-- IPO performance by subscription status
SELECT 
    subscription_status,
    COUNT(*) as ipo_count,
    AVG(subscription_ratio) as avg_subscription_ratio,
    AVG(total_applications) as avg_applications
FROM vw_ipo_overview
GROUP BY subscription_status;

-- ========================================
-- EXAMPLE 10: Export-Ready Queries
-- ========================================

-- Final allotment list for TechCorp (CSV ready)
SELECT 
    applicant_name,
    pan_number,
    shares_requested,
    shares_allotted,
    allotment_amount,
    allotment_status
FROM vw_allotment_report 
WHERE company_name = 'TechCorp Ltd'
ORDER BY applicant_name;

-- Refund list for processing (CSV ready)
SELECT 
    applicant_name,
    pan_number,
    net_refund,
    refund_reference_no,
    refund_status
FROM vw_refund_summary 
WHERE company_name = 'TechCorp Ltd' 
AND refund_amount > 0
ORDER BY net_refund DESC;