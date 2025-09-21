-- IPO Management System - Reporting Views
-- Phase 7: SQL Views for comprehensive reporting
-- Views for allotment reports, oversubscription ratios, and refund summaries

-- View 1: Complete IPO Overview
CREATE OR REPLACE VIEW vw_ipo_overview AS
SELECT 
    c.ipo_id,
    c.company_name,
    c.total_shares,
    c.price_per_share,
    c.total_shares * c.price_per_share as total_ipo_value,
    c.issue_start_date,
    c.issue_end_date,
    c.listing_date,
    c.status as ipo_status,
    c.min_lot_size,
    c.max_shares_per_applicant,
    COUNT(DISTINCT a.application_id) as total_applications,
    IFNULL(SUM(a.shares_requested), 0) as total_shares_applied,
    IFNULL(SUM(a.bid_amount), 0) as total_bid_amount,
    ROUND(IFNULL(SUM(a.shares_requested), 0) / c.total_shares, 4) as subscription_ratio,
    CASE 
        WHEN IFNULL(SUM(a.shares_requested), 0) > c.total_shares THEN 'OVERSUBSCRIBED'
        WHEN IFNULL(SUM(a.shares_requested), 0) = c.total_shares THEN 'FULLY_SUBSCRIBED'
        ELSE 'UNDERSUBSCRIBED'
    END as subscription_status
FROM Company c
LEFT JOIN Application a ON c.ipo_id = a.ipo_id AND a.status != 'CANCELLED'
GROUP BY c.ipo_id;

-- View 2: Detailed Allotment Report
CREATE OR REPLACE VIEW vw_allotment_report AS
SELECT 
    c.ipo_id,
    c.company_name,
    ap.full_name as applicant_name,
    ap.pan_number,
    ap.demat_account_no,
    a.shares_requested,
    a.bid_amount,
    a.application_date,
    a.category,
    IFNULL(al.shares_allotted, 0) as shares_allotted,
    IFNULL(al.allotment_amount, 0) as allotment_amount,
    al.allotment_method,
    ROUND(IFNULL(al.allotment_ratio, 0), 4) as allotment_ratio,
    al.allotment_date,
    a.shares_requested - IFNULL(al.shares_allotted, 0) as shares_not_allotted,
    a.bid_amount - IFNULL(al.allotment_amount, 0) as refund_due,
    CASE 
        WHEN IFNULL(al.shares_allotted, 0) = a.shares_requested THEN 'FULL_ALLOTMENT'
        WHEN IFNULL(al.shares_allotted, 0) > 0 THEN 'PARTIAL_ALLOTMENT'
        ELSE 'NO_ALLOTMENT'
    END as allotment_status
FROM Company c
JOIN Application a ON c.ipo_id = a.ipo_id
JOIN Applicant ap ON a.applicant_id = ap.applicant_id
LEFT JOIN Allotment al ON a.application_id = al.application_id
WHERE a.status != 'CANCELLED'
ORDER BY c.ipo_id, a.application_date;

-- View 3: Oversubscription Analysis
CREATE OR REPLACE VIEW vw_oversubscription_analysis AS
SELECT 
    c.ipo_id,
    c.company_name,
    c.total_shares as shares_offered,
    c.price_per_share,
    COUNT(DISTINCT a.application_id) as total_applications,
    SUM(a.shares_requested) as total_demand,
    SUM(a.shares_requested) - c.total_shares as excess_demand,
    ROUND((SUM(a.shares_requested) / c.total_shares), 4) as oversubscription_ratio,
    ROUND(((SUM(a.shares_requested) - c.total_shares) / c.total_shares * 100), 2) as oversubscription_percentage,
    -- Category-wise analysis
    COUNT(CASE WHEN a.category = 'RETAIL' THEN 1 END) as retail_applications,
    SUM(CASE WHEN a.category = 'RETAIL' THEN a.shares_requested ELSE 0 END) as retail_demand,
    COUNT(CASE WHEN a.category = 'HNI' THEN 1 END) as hni_applications,
    SUM(CASE WHEN a.category = 'HNI' THEN a.shares_requested ELSE 0 END) as hni_demand,
    COUNT(CASE WHEN a.category = 'INSTITUTIONAL' THEN 1 END) as institutional_applications,
    SUM(CASE WHEN a.category = 'INSTITUTIONAL' THEN a.shares_requested ELSE 0 END) as institutional_demand,
    -- Allotment summary
    IFNULL(SUM(al.shares_allotted), 0) as total_shares_allotted,
    COUNT(CASE WHEN al.shares_allotted > 0 THEN 1 END) as successful_applicants,
    COUNT(CASE WHEN al.shares_allotted = 0 OR al.shares_allotted IS NULL THEN 1 END) as unsuccessful_applicants
FROM Company c
JOIN Application a ON c.ipo_id = a.ipo_id
LEFT JOIN Allotment al ON a.application_id = al.application_id
WHERE a.status != 'CANCELLED'
GROUP BY c.ipo_id
ORDER BY oversubscription_ratio DESC;

-- View 4: Comprehensive Refund Summary
CREATE OR REPLACE VIEW vw_refund_summary AS
SELECT 
    c.ipo_id,
    c.company_name,
    ap.full_name as applicant_name,
    ap.pan_number,
    a.bid_amount as original_bid,
    IFNULL(al.allotment_amount, 0) as amount_allocated,
    IFNULL(r.refund_amount, 0) as gross_refund,
    IFNULL(r.processing_charges, 0) as processing_charges,
    IFNULL(r.net_refund_amount, 0) as net_refund,
    r.refund_status,
    r.refund_reference_no,
    r.refund_date,
    DATEDIFF(r.refund_date, al.allotment_date) as refund_processing_days,
    CASE 
        WHEN r.refund_amount IS NULL THEN 'NO_REFUND_DUE'
        WHEN r.refund_status = 'PENDING' THEN 'REFUND_PENDING'
        WHEN r.refund_status = 'PROCESSED' THEN 'REFUND_COMPLETED'
        WHEN r.refund_status = 'FAILED' THEN 'REFUND_FAILED'
        ELSE 'UNKNOWN'
    END as refund_status_description
FROM Company c
JOIN Application a ON c.ipo_id = a.ipo_id
JOIN Applicant ap ON a.applicant_id = ap.applicant_id
LEFT JOIN Allotment al ON a.application_id = al.application_id
LEFT JOIN Refund r ON al.allotment_id = r.allotment_id
WHERE a.status != 'CANCELLED'
ORDER BY c.ipo_id, r.refund_date DESC;

-- View 5: IPO Financial Summary
CREATE OR REPLACE VIEW vw_ipo_financial_summary AS
SELECT 
    c.ipo_id,
    c.company_name,
    c.total_shares * c.price_per_share as target_amount,
    SUM(a.bid_amount) as total_money_collected,
    SUM(IFNULL(al.allotment_amount, 0)) as total_money_allocated,
    SUM(IFNULL(r.refund_amount, 0)) as total_gross_refund,
    SUM(IFNULL(r.processing_charges, 0)) as total_processing_charges,
    SUM(CASE WHEN r.refund_status = 'PROCESSED' THEN r.net_refund_amount ELSE 0 END) as total_refunded,
    SUM(CASE WHEN r.refund_status = 'PENDING' THEN r.net_refund_amount ELSE 0 END) as pending_refunds,
    SUM(CASE WHEN r.refund_status = 'FAILED' THEN r.net_refund_amount ELSE 0 END) as failed_refunds,
    -- Calculate net position
    SUM(a.bid_amount) - SUM(CASE WHEN r.refund_status = 'PROCESSED' THEN r.net_refund_amount ELSE 0 END) as current_net_position,
    SUM(IFNULL(al.allotment_amount, 0)) + SUM(IFNULL(r.processing_charges, 0)) as expected_final_position,
    -- Ratios
    ROUND((SUM(IFNULL(al.allotment_amount, 0)) / (c.total_shares * c.price_per_share)) * 100, 2) as fill_percentage,
    ROUND((SUM(IFNULL(r.processing_charges, 0)) / SUM(IFNULL(r.refund_amount, 0))) * 100, 2) as processing_fee_percentage
FROM Company c
JOIN Application a ON c.ipo_id = a.ipo_id
LEFT JOIN Allotment al ON a.application_id = al.application_id
LEFT JOIN Refund r ON al.allotment_id = r.allotment_id
WHERE a.status != 'CANCELLED'
GROUP BY c.ipo_id
ORDER BY c.ipo_id;

-- View 6: Application Status Dashboard
CREATE OR REPLACE VIEW vw_application_dashboard AS
SELECT 
    c.ipo_id,
    c.company_name,
    c.status as ipo_status,
    COUNT(a.application_id) as total_applications,
    COUNT(CASE WHEN a.status = 'PENDING' THEN 1 END) as pending_applications,
    COUNT(CASE WHEN a.status = 'PROCESSED' THEN 1 END) as processed_applications,
    COUNT(CASE WHEN a.status = 'CANCELLED' THEN 1 END) as cancelled_applications,
    -- Allotment status
    COUNT(CASE WHEN al.allotment_id IS NOT NULL THEN 1 END) as allotted_applications,
    COUNT(CASE WHEN al.shares_allotted > 0 THEN 1 END) as successful_allotments,
    COUNT(CASE WHEN al.shares_allotted = 0 THEN 1 END) as zero_allotments,
    -- Refund status
    COUNT(CASE WHEN r.refund_id IS NOT NULL THEN 1 END) as refund_entries,
    COUNT(CASE WHEN r.refund_status = 'PENDING' THEN 1 END) as pending_refunds,
    COUNT(CASE WHEN r.refund_status = 'PROCESSED' THEN 1 END) as processed_refunds,
    COUNT(CASE WHEN r.refund_status = 'FAILED' THEN 1 END) as failed_refunds,
    -- Progress percentage
    ROUND((COUNT(CASE WHEN a.status = 'PROCESSED' THEN 1 END) / COUNT(a.application_id)) * 100, 2) as processing_progress,
    ROUND((COUNT(CASE WHEN r.refund_status = 'PROCESSED' THEN 1 END) / GREATEST(COUNT(CASE WHEN r.refund_id IS NOT NULL THEN 1 END), 1)) * 100, 2) as refund_progress
FROM Company c
LEFT JOIN Application a ON c.ipo_id = a.ipo_id
LEFT JOIN Allotment al ON a.application_id = al.application_id
LEFT JOIN Refund r ON al.allotment_id = r.allotment_id
GROUP BY c.ipo_id
ORDER BY c.ipo_id;

-- View 7: Top Applicants by Investment
CREATE OR REPLACE VIEW vw_top_applicants AS
SELECT 
    ap.applicant_id,
    ap.full_name,
    ap.pan_number,
    COUNT(DISTINCT a.ipo_id) as ipos_applied,
    SUM(a.shares_requested) as total_shares_requested,
    SUM(a.bid_amount) as total_bid_amount,
    SUM(IFNULL(al.shares_allotted, 0)) as total_shares_allotted,
    SUM(IFNULL(al.allotment_amount, 0)) as total_amount_invested,
    SUM(IFNULL(r.net_refund_amount, 0)) as total_refunds_received,
    ROUND((SUM(IFNULL(al.shares_allotted, 0)) / SUM(a.shares_requested)) * 100, 2) as overall_success_rate,
    AVG(IFNULL(al.allotment_ratio, 0)) as avg_allotment_ratio
FROM Applicant ap
JOIN Application a ON ap.applicant_id = a.applicant_id
LEFT JOIN Allotment al ON a.application_id = al.application_id
LEFT JOIN Refund r ON al.allotment_id = r.allotment_id
WHERE a.status != 'CANCELLED'
GROUP BY ap.applicant_id
HAVING COUNT(a.application_id) > 0
ORDER BY total_bid_amount DESC;

-- View 8: Daily IPO Activity Summary
CREATE OR REPLACE VIEW vw_daily_activity AS
SELECT 
    DATE(a.application_date) as activity_date,
    COUNT(DISTINCT a.ipo_id) as active_ipos,
    COUNT(a.application_id) as applications_received,
    SUM(a.shares_requested) as shares_requested,
    SUM(a.bid_amount) as total_bid_amount,
    AVG(a.bid_amount) as avg_bid_amount,
    COUNT(CASE WHEN a.category = 'RETAIL' THEN 1 END) as retail_applications,
    COUNT(CASE WHEN a.category = 'HNI' THEN 1 END) as hni_applications,
    COUNT(CASE WHEN a.category = 'INSTITUTIONAL' THEN 1 END) as institutional_applications
FROM Application a
WHERE a.status != 'CANCELLED'
GROUP BY DATE(a.application_date)
ORDER BY activity_date DESC;

-- View 9: IPO Performance Metrics
CREATE OR REPLACE VIEW vw_ipo_performance AS
SELECT 
    c.ipo_id,
    c.company_name,
    ov.subscription_ratio,
    ov.subscription_status,
    -- Application metrics
    ov.total_applications,
    ROUND(ov.total_applications / GREATEST(DATEDIFF(c.issue_end_date, c.issue_start_date), 1), 2) as avg_applications_per_day,
    -- Success metrics
    da.successful_applicants,
    ROUND((da.successful_applicants / ov.total_applications) * 100, 2) as success_rate_percentage,
    -- Financial metrics
    fs.target_amount,
    fs.total_money_collected,
    fs.current_net_position,
    fs.fill_percentage,
    -- Timing metrics
    DATEDIFF(c.issue_end_date, c.issue_start_date) + 1 as subscription_period_days,
    CASE 
        WHEN c.listing_date IS NOT NULL THEN DATEDIFF(c.listing_date, c.issue_end_date)
        ELSE NULL 
    END as days_to_listing
FROM Company c
JOIN vw_ipo_overview ov ON c.ipo_id = ov.ipo_id
JOIN vw_application_dashboard da ON c.ipo_id = da.ipo_id
JOIN vw_ipo_financial_summary fs ON c.ipo_id = fs.ipo_id
ORDER BY c.ipo_id;