CREATE VIEW refund_summary AS
SELECT 
    a.id AS applicant_id,
    a.name AS applicant_name,
    r.refund_amount,
    c.name AS company_name,
    c.ipo_id
FROM 
    Refund r
JOIN 
    Application app ON r.application_id = app.id
JOIN 
    Applicant a ON app.applicant_id = a.id
JOIN 
    Company c ON app.ipo_id = c.ipo_id;