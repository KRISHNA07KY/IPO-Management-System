CREATE VIEW allotment_report AS
SELECT 
    a.id AS applicant_id,
    a.name AS applicant_name,
    c.name AS company_name,
    ap.shares_requested,
    al.shares_allotted,
    r.refund_amount
FROM 
    Applicant a
JOIN 
    Application ap ON a.id = ap.applicant_id
JOIN 
    Allotment al ON ap.applicant_id = al.applicant_id
JOIN 
    Company c ON ap.ipo_id = c.ipo_id
LEFT JOIN 
    Refund r ON ap.applicant_id = r.applicant_id;