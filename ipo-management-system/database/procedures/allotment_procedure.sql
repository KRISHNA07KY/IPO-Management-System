CREATE PROCEDURE allotment_procedure(IN ipo_id INT)
BEGIN
    DECLARE total_shares INT;
    DECLARE total_applications INT;
    DECLARE total_requested INT;
    DECLARE allotted_shares INT DEFAULT 0;
    DECLARE refund_amount DECIMAL(10, 2);
    
    -- Get total shares available for the IPO
    SELECT total_shares INTO total_shares FROM Company WHERE ipo_id = ipo_id;

    -- Get total applications for the IPO
    SELECT COUNT(*) INTO total_applications FROM Application WHERE ipo_id = ipo_id;

    -- Get total requested shares
    SELECT SUM(shares_requested) INTO total_requested FROM Application WHERE ipo_id = ipo_id;

    IF total_requested <= total_shares THEN
        -- Normal allotment
        UPDATE Application 
        SET allotted_shares = shares_requested 
        WHERE ipo_id = ipo_id;
        SET allotted_shares = total_requested;
    ELSE
        -- Oversubscription logic (basic pro-rata)
        DECLARE share_per_application DECIMAL(10, 2);
        SET share_per_application = total_shares / total_applications;

        UPDATE Application 
        SET allotted_shares = LEAST(shares_requested, share_per_application) 
        WHERE ipo_id = ipo_id;

        SET allotted_shares = total_shares;
    END IF;

    -- Calculate refunds and insert into Refund table
    INSERT INTO Refund (applicant_id, refund_amount)
    SELECT applicant_id, (shares_requested - allotted_shares) * (SELECT price FROM Company WHERE ipo_id = ipo_id)
    FROM Application
    WHERE ipo_id = ipo_id AND allotted_shares < shares_requested;

END;