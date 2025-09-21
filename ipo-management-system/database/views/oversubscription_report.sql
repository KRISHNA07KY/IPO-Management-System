CREATE VIEW oversubscription_report AS
SELECT 
    c.ipo_id,
    c.name AS ipo_name,
    SUM(a.shares_requested) AS total_requested,
    c.total_shares,
    CASE 
        WHEN SUM(a.shares_requested) > c.total_shares THEN 'Yes'
        ELSE 'No'
    END AS is_oversubscribed,
    COALESCE(SUM(a.shares_requested) / c.total_shares, 0) AS oversubscription_ratio
FROM 
    Company c
JOIN 
    Application a ON c.ipo_id = a.ipo_id
GROUP BY 
    c.ipo_id, c.name;