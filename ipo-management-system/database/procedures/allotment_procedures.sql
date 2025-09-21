-- IPO Management System - Allotment Procedures
-- Phase 5: Oversubscription & Allotment Logic
-- Stored procedures for handling normal and oversubscribed IPO allotments

DELIMITER //

-- Procedure 1: Calculate oversubscription ratio for an IPO
CREATE PROCEDURE calculate_oversubscription_ratio(
    IN p_ipo_id INT,
    OUT p_total_demand INT,
    OUT p_total_supply INT,
    OUT p_oversubscription_ratio DECIMAL(10,4),
    OUT p_is_oversubscribed BOOLEAN
)
BEGIN
    DECLARE v_total_shares INT;
    DECLARE v_total_applied INT;
    
    -- Get total shares available
    SELECT total_shares INTO v_total_shares
    FROM Company 
    WHERE ipo_id = p_ipo_id;
    
    -- Get total shares applied for
    SELECT IFNULL(SUM(shares_requested), 0) INTO v_total_applied
    FROM Application 
    WHERE ipo_id = p_ipo_id AND status IN ('PENDING', 'PROCESSED');
    
    -- Set output parameters
    SET p_total_supply = v_total_shares;
    SET p_total_demand = v_total_applied;
    SET p_oversubscription_ratio = v_total_applied / v_total_shares;
    SET p_is_oversubscribed = (v_total_applied > v_total_shares);
END//

-- Procedure 2: Process normal allotment (when not oversubscribed)
CREATE PROCEDURE process_normal_allotment(IN p_ipo_id INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_application_id INT;
    DECLARE v_shares_requested INT;
    DECLARE v_price_per_share DECIMAL(10,2);
    DECLARE v_allotment_amount DECIMAL(12,2);
    
    -- Cursor to iterate through all applications
    DECLARE cur CURSOR FOR 
        SELECT a.application_id, a.shares_requested
        FROM Application a
        WHERE a.ipo_id = p_ipo_id AND a.status = 'PROCESSED'
        ORDER BY a.application_date ASC;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Get price per share
    SELECT price_per_share INTO v_price_per_share
    FROM Company WHERE ipo_id = p_ipo_id;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_application_id, v_shares_requested;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Calculate allotment amount
        SET v_allotment_amount = v_shares_requested * v_price_per_share;
        
        -- Insert full allotment (normal case)
        INSERT INTO Allotment (
            application_id, 
            shares_allotted, 
            allotment_amount, 
            allotment_method,
            allotment_ratio
        ) VALUES (
            v_application_id, 
            v_shares_requested, 
            v_allotment_amount, 
            'FULL',
            1.0000
        );
        
    END LOOP;
    
    CLOSE cur;
END//

-- Procedure 3: Process pro-rata allotment (when oversubscribed)
CREATE PROCEDURE process_pro_rata_allotment(IN p_ipo_id INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_application_id INT;
    DECLARE v_shares_requested INT;
    DECLARE v_total_shares INT;
    DECLARE v_total_demand INT;
    DECLARE v_allotment_ratio DECIMAL(10,4);
    DECLARE v_shares_allotted INT;
    DECLARE v_price_per_share DECIMAL(10,2);
    DECLARE v_allotment_amount DECIMAL(12,2);
    
    -- Cursor to iterate through all applications
    DECLARE cur CURSOR FOR 
        SELECT a.application_id, a.shares_requested
        FROM Application a
        WHERE a.ipo_id = p_ipo_id AND a.status = 'PROCESSED'
        ORDER BY a.application_date ASC;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Calculate allotment ratio
    SELECT total_shares INTO v_total_shares
    FROM Company WHERE ipo_id = p_ipo_id;
    
    SELECT SUM(shares_requested) INTO v_total_demand
    FROM Application 
    WHERE ipo_id = p_ipo_id AND status = 'PROCESSED';
    
    SET v_allotment_ratio = v_total_shares / v_total_demand;
    
    -- Get price per share
    SELECT price_per_share INTO v_price_per_share
    FROM Company WHERE ipo_id = p_ipo_id;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_application_id, v_shares_requested;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Calculate shares to allot (rounded down to ensure we don't exceed total)
        SET v_shares_allotted = FLOOR(v_shares_requested * v_allotment_ratio);
        
        -- Ensure minimum of 0 shares
        IF v_shares_allotted < 0 THEN
            SET v_shares_allotted = 0;
        END IF;
        
        -- Calculate allotment amount
        SET v_allotment_amount = v_shares_allotted * v_price_per_share;
        
        -- Insert pro-rata allotment
        INSERT INTO Allotment (
            application_id, 
            shares_allotted, 
            allotment_amount, 
            allotment_method,
            allotment_ratio
        ) VALUES (
            v_application_id, 
            v_shares_allotted, 
            v_allotment_amount, 
            'PRO_RATA',
            v_allotment_ratio
        );
        
    END LOOP;
    
    CLOSE cur;
END//

-- Procedure 4: Process lottery allotment (alternative for oversubscription)
CREATE PROCEDURE process_lottery_allotment(
    IN p_ipo_id INT,
    IN p_lottery_percentage DECIMAL(5,2) DEFAULT 50.00
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_application_id INT;
    DECLARE v_shares_requested INT;
    DECLARE v_total_shares INT;
    DECLARE v_lucky_number DECIMAL(5,2);
    DECLARE v_shares_allotted INT;
    DECLARE v_price_per_share DECIMAL(10,2);
    DECLARE v_allotment_amount DECIMAL(12,2);
    DECLARE v_min_lot_size INT;
    
    -- Cursor to iterate through all applications
    DECLARE cur CURSOR FOR 
        SELECT a.application_id, a.shares_requested
        FROM Application a
        WHERE a.ipo_id = p_ipo_id AND a.status = 'PROCESSED'
        ORDER BY RAND(); -- Random order for lottery
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Get IPO details
    SELECT total_shares, price_per_share, min_lot_size 
    INTO v_total_shares, v_price_per_share, v_min_lot_size
    FROM Company WHERE ipo_id = p_ipo_id;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_application_id, v_shares_requested;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Generate random number for lottery
        SET v_lucky_number = RAND() * 100;
        
        -- Determine allotment based on lottery
        IF v_lucky_number <= p_lottery_percentage THEN
            -- Winner gets minimum lot size or requested shares (whichever is smaller)
            SET v_shares_allotted = LEAST(v_shares_requested, v_min_lot_size);
        ELSE
            -- No allotment
            SET v_shares_allotted = 0;
        END IF;
        
        -- Calculate allotment amount
        SET v_allotment_amount = v_shares_allotted * v_price_per_share;
        
        -- Insert lottery allotment
        INSERT INTO Allotment (
            application_id, 
            shares_allotted, 
            allotment_amount, 
            allotment_method,
            allotment_ratio
        ) VALUES (
            v_application_id, 
            v_shares_allotted, 
            v_allotment_amount, 
            'LOTTERY',
            v_shares_allotted / v_shares_requested
        );
        
    END LOOP;
    
    CLOSE cur;
END//

-- Procedure 5: Main allotment processing procedure
CREATE PROCEDURE process_ipo_allotment(
    IN p_ipo_id INT,
    IN p_allotment_method VARCHAR(20) DEFAULT 'AUTO' -- AUTO, PRO_RATA, LOTTERY
)
BEGIN
    DECLARE v_total_demand INT;
    DECLARE v_total_supply INT;
    DECLARE v_oversubscription_ratio DECIMAL(10,4);
    DECLARE v_is_oversubscribed BOOLEAN;
    DECLARE v_final_method VARCHAR(20);
    
    -- Check if allotment already exists
    IF EXISTS (
        SELECT 1 FROM Allotment al
        JOIN Application ap ON al.application_id = ap.application_id
        WHERE ap.ipo_id = p_ipo_id
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Allotment already processed for this IPO';
    END IF;
    
    -- Update IPO status to closed and application status to processed
    UPDATE Company SET status = 'CLOSED' WHERE ipo_id = p_ipo_id;
    UPDATE Application SET status = 'PROCESSED' 
    WHERE ipo_id = p_ipo_id AND status = 'PENDING';
    
    -- Calculate oversubscription
    CALL calculate_oversubscription_ratio(
        p_ipo_id, 
        v_total_demand, 
        v_total_supply, 
        v_oversubscription_ratio, 
        v_is_oversubscribed
    );
    
    -- Determine allotment method
    IF p_allotment_method = 'AUTO' THEN
        IF v_is_oversubscribed THEN
            IF v_oversubscription_ratio > 5.0 THEN
                SET v_final_method = 'LOTTERY';
            ELSE
                SET v_final_method = 'PRO_RATA';
            END IF;
        ELSE
            SET v_final_method = 'FULL';
        END IF;
    ELSE
        SET v_final_method = p_allotment_method;
    END IF;
    
    -- Process allotment based on method
    CASE v_final_method
        WHEN 'FULL' THEN
            CALL process_normal_allotment(p_ipo_id);
        WHEN 'PRO_RATA' THEN
            CALL process_pro_rata_allotment(p_ipo_id);
        WHEN 'LOTTERY' THEN
            CALL process_lottery_allotment(p_ipo_id, 40.0); -- 40% success rate
        ELSE
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Invalid allotment method';
    END CASE;
    
    -- Log the allotment completion
    INSERT INTO Company (company_name, total_shares, price_per_share, issue_start_date, issue_end_date, status)
    SELECT 
        CONCAT('ALLOTMENT_LOG_', p_ipo_id, '_', NOW()),
        v_total_supply,
        0,
        CURDATE(),
        CURDATE(),
        CONCAT('Method:', v_final_method, ',Ratio:', v_oversubscription_ratio)
    WHERE FALSE; -- This is just for logging - won't actually insert
    
END//

-- Procedure 6: Rollback allotment (in case of errors)
CREATE PROCEDURE rollback_allotment(IN p_ipo_id INT)
BEGIN
    -- Delete refunds first (due to foreign key constraints)
    DELETE r FROM Refund r
    JOIN Allotment al ON r.allotment_id = al.allotment_id
    JOIN Application ap ON al.application_id = ap.application_id
    WHERE ap.ipo_id = p_ipo_id;
    
    -- Delete allotments
    DELETE al FROM Allotment al
    JOIN Application ap ON al.application_id = ap.application_id
    WHERE ap.ipo_id = p_ipo_id;
    
    -- Reset application status
    UPDATE Application SET status = 'PENDING' 
    WHERE ipo_id = p_ipo_id;
    
    -- Reset IPO status
    UPDATE Company SET status = 'OPEN' 
    WHERE ipo_id = p_ipo_id;
END//

-- Procedure 7: Generate allotment summary
CREATE PROCEDURE get_allotment_summary(IN p_ipo_id INT)
BEGIN
    SELECT 
        c.company_name,
        c.total_shares,
        c.price_per_share,
        COUNT(DISTINCT a.application_id) as total_applications,
        SUM(a.shares_requested) as total_demand,
        SUM(al.shares_allotted) as total_allotted,
        ROUND(SUM(a.shares_requested) / c.total_shares, 4) as oversubscription_ratio,
        ROUND(AVG(al.allotment_ratio), 4) as avg_allotment_ratio,
        al.allotment_method,
        COUNT(CASE WHEN al.shares_allotted > 0 THEN 1 END) as successful_applicants,
        COUNT(CASE WHEN al.shares_allotted = 0 THEN 1 END) as unsuccessful_applicants
    FROM Company c
    JOIN Application a ON c.ipo_id = a.ipo_id
    JOIN Allotment al ON a.application_id = al.application_id
    WHERE c.ipo_id = p_ipo_id
    GROUP BY c.ipo_id, al.allotment_method;
END//

DELIMITER ;