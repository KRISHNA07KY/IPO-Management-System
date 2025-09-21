-- IPO Management System - Refund Computation
-- Phase 6: Automated refund calculation and processing
-- Procedures and triggers for handling refund calculations

DELIMITER //

-- Procedure 1: Calculate refund for a specific allotment
CREATE PROCEDURE calculate_individual_refund(
    IN p_allotment_id INT,
    OUT p_refund_amount DECIMAL(12,2),
    OUT p_processing_charges DECIMAL(8,2),
    OUT p_net_refund DECIMAL(12,2)
)
BEGIN
    DECLARE v_bid_amount DECIMAL(12,2);
    DECLARE v_allotment_amount DECIMAL(12,2);
    DECLARE v_base_processing_charge DECIMAL(8,2) DEFAULT 10.00; -- Base processing charge
    DECLARE v_percentage_charge DECIMAL(5,4) DEFAULT 0.0050; -- 0.5% processing charge
    
    -- Get bid amount and allotment amount
    SELECT a.bid_amount, al.allotment_amount
    INTO v_bid_amount, v_allotment_amount
    FROM Allotment al
    JOIN Application a ON al.application_id = a.application_id
    WHERE al.allotment_id = p_allotment_id;
    
    -- Calculate refund amount
    SET p_refund_amount = v_bid_amount - v_allotment_amount;
    
    -- Calculate processing charges (minimum of base charge or percentage of refund)
    IF p_refund_amount > 0 THEN
        SET p_processing_charges = GREATEST(v_base_processing_charge, p_refund_amount * v_percentage_charge);
        -- Cap processing charges at 2% of refund amount
        SET p_processing_charges = LEAST(p_processing_charges, p_refund_amount * 0.02);
    ELSE
        SET p_processing_charges = 0;
    END IF;
    
    -- Calculate net refund
    SET p_net_refund = p_refund_amount - p_processing_charges;
    
END//

-- Procedure 2: Process refunds for all allotments of an IPO
CREATE PROCEDURE process_ipo_refunds(IN p_ipo_id INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_allotment_id INT;
    DECLARE v_refund_amount DECIMAL(12,2);
    DECLARE v_processing_charges DECIMAL(8,2);
    DECLARE v_net_refund DECIMAL(12,2);
    DECLARE v_refund_reference VARCHAR(50);
    
    -- Cursor to iterate through all allotments for the IPO
    DECLARE cur CURSOR FOR 
        SELECT al.allotment_id
        FROM Allotment al
        JOIN Application a ON al.application_id = a.application_id
        WHERE a.ipo_id = p_ipo_id
        AND NOT EXISTS (
            SELECT 1 FROM Refund r WHERE r.allotment_id = al.allotment_id
        );
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_allotment_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Calculate refund for this allotment
        CALL calculate_individual_refund(
            v_allotment_id, 
            v_refund_amount, 
            v_processing_charges, 
            v_net_refund
        );
        
        -- Generate refund reference number
        SET v_refund_reference = CONCAT('REF', p_ipo_id, '_', v_allotment_id, '_', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'));
        
        -- Insert refund record only if there's a refund amount
        IF v_refund_amount > 0 THEN
            INSERT INTO Refund (
                allotment_id, 
                refund_amount, 
                processing_charges,
                refund_reference_no,
                refund_status
            ) VALUES (
                v_allotment_id, 
                v_refund_amount, 
                v_processing_charges,
                v_refund_reference,
                'PENDING'
            );
        END IF;
        
    END LOOP;
    
    CLOSE cur;
END//

-- Procedure 3: Update refund status (simulate bank processing)
CREATE PROCEDURE update_refund_status(
    IN p_refund_id INT,
    IN p_new_status VARCHAR(20)
)
BEGIN
    DECLARE v_current_status VARCHAR(20);
    
    -- Get current status
    SELECT refund_status INTO v_current_status
    FROM Refund WHERE refund_id = p_refund_id;
    
    -- Validate status transition
    IF v_current_status = 'PROCESSED' AND p_new_status != 'PROCESSED' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Cannot change status of already processed refund';
    END IF;
    
    -- Update status
    UPDATE Refund 
    SET refund_status = p_new_status,
        refund_date = CASE 
            WHEN p_new_status = 'PROCESSED' THEN NOW()
            ELSE refund_date
        END
    WHERE refund_id = p_refund_id;
    
END//

-- Procedure 4: Bulk process refunds (simulate payment gateway)
CREATE PROCEDURE bulk_process_refunds(IN p_ipo_id INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_refund_id INT;
    DECLARE v_processing_success_rate DECIMAL(3,2) DEFAULT 0.95; -- 95% success rate
    DECLARE v_random_number DECIMAL(3,2);
    
    -- Cursor for pending refunds
    DECLARE cur CURSOR FOR 
        SELECT r.refund_id
        FROM Refund r
        JOIN Allotment al ON r.allotment_id = al.allotment_id
        JOIN Application a ON al.application_id = a.application_id
        WHERE a.ipo_id = p_ipo_id 
        AND r.refund_status = 'PENDING';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_refund_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Simulate processing with some random failures
        SET v_random_number = RAND();
        
        IF v_random_number <= v_processing_success_rate THEN
            CALL update_refund_status(v_refund_id, 'PROCESSED');
        ELSE
            CALL update_refund_status(v_refund_id, 'FAILED');
        END IF;
        
    END LOOP;
    
    CLOSE cur;
    
END//

-- Procedure 5: Get refund summary for an IPO
CREATE PROCEDURE get_refund_summary(IN p_ipo_id INT)
BEGIN
    SELECT 
        c.company_name,
        COUNT(r.refund_id) as total_refunds,
        SUM(r.refund_amount) as total_refund_amount,
        SUM(r.processing_charges) as total_processing_charges,
        SUM(r.net_refund_amount) as total_net_refund,
        AVG(r.refund_amount) as avg_refund_amount,
        COUNT(CASE WHEN r.refund_status = 'PENDING' THEN 1 END) as pending_refunds,
        COUNT(CASE WHEN r.refund_status = 'PROCESSED' THEN 1 END) as processed_refunds,
        COUNT(CASE WHEN r.refund_status = 'FAILED' THEN 1 END) as failed_refunds,
        SUM(CASE WHEN r.refund_status = 'PROCESSED' THEN r.net_refund_amount ELSE 0 END) as processed_amount,
        SUM(CASE WHEN r.refund_status = 'PENDING' THEN r.net_refund_amount ELSE 0 END) as pending_amount
    FROM Company c
    JOIN Application a ON c.ipo_id = a.ipo_id
    JOIN Allotment al ON a.application_id = al.application_id
    LEFT JOIN Refund r ON al.allotment_id = r.allotment_id
    WHERE c.ipo_id = p_ipo_id
    GROUP BY c.ipo_id;
END//

-- Procedure 6: Retry failed refunds
CREATE PROCEDURE retry_failed_refunds(IN p_ipo_id INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_refund_id INT;
    DECLARE v_retry_success_rate DECIMAL(3,2) DEFAULT 0.80; -- 80% success rate on retry
    DECLARE v_random_number DECIMAL(3,2);
    
    -- Cursor for failed refunds
    DECLARE cur CURSOR FOR 
        SELECT r.refund_id
        FROM Refund r
        JOIN Allotment al ON r.allotment_id = al.allotment_id
        JOIN Application a ON al.application_id = a.application_id
        WHERE a.ipo_id = p_ipo_id 
        AND r.refund_status = 'FAILED';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_refund_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Simulate retry processing
        SET v_random_number = RAND();
        
        IF v_random_number <= v_retry_success_rate THEN
            CALL update_refund_status(v_refund_id, 'PROCESSED');
        END IF;
        -- If still failed, leave status as 'FAILED'
        
    END LOOP;
    
    CLOSE cur;
    
END//

-- Procedure 7: Calculate total money flow for an IPO
CREATE PROCEDURE calculate_ipo_money_flow(IN p_ipo_id INT)
BEGIN
    SELECT 
        c.company_name,
        c.total_shares * c.price_per_share as total_ipo_value,
        SUM(a.bid_amount) as total_money_received,
        SUM(al.allotment_amount) as total_money_allocated,
        SUM(IFNULL(r.refund_amount, 0)) as total_refund_due,
        SUM(IFNULL(r.processing_charges, 0)) as total_processing_charges,
        SUM(CASE WHEN r.refund_status = 'PROCESSED' THEN r.net_refund_amount ELSE 0 END) as total_money_refunded,
        SUM(a.bid_amount) - SUM(CASE WHEN r.refund_status = 'PROCESSED' THEN r.net_refund_amount ELSE 0 END) as net_money_retained,
        COUNT(CASE WHEN IFNULL(r.refund_status, 'NONE') = 'PENDING' THEN 1 END) as pending_refund_count
    FROM Company c
    JOIN Application a ON c.ipo_id = a.ipo_id
    JOIN Allotment al ON a.application_id = al.application_id
    LEFT JOIN Refund r ON al.allotment_id = r.allotment_id
    WHERE c.ipo_id = p_ipo_id
    GROUP BY c.ipo_id;
END//

-- Procedure 8: Auto-process refunds after allotment (called automatically)
CREATE PROCEDURE auto_process_refunds_after_allotment(IN p_ipo_id INT)
BEGIN
    -- Step 1: Process all refunds for the IPO
    CALL process_ipo_refunds(p_ipo_id);
    
    -- Step 2: Simulate bulk processing (in real world, this would be triggered by payment gateway)
    CALL bulk_process_refunds(p_ipo_id);
    
    -- Step 3: Retry any failed refunds once
    CALL retry_failed_refunds(p_ipo_id);
    
END//

-- Enhanced trigger: Auto-process refunds when allotment method is set
DROP TRIGGER IF EXISTS auto_create_refund//

CREATE TRIGGER auto_process_refund_enhanced
    AFTER INSERT ON Allotment
    FOR EACH ROW
BEGIN
    DECLARE v_ipo_id INT;
    DECLARE v_bid_amount DECIMAL(12,2);
    DECLARE v_refund_amount DECIMAL(12,2);
    DECLARE v_processing_charges DECIMAL(8,2);
    DECLARE v_refund_reference VARCHAR(50);
    
    -- Get IPO ID and bid amount
    SELECT a.ipo_id, a.bid_amount INTO v_ipo_id, v_bid_amount
    FROM Application a
    WHERE a.application_id = NEW.application_id;
    
    -- Calculate refund amount
    SET v_refund_amount = v_bid_amount - NEW.allotment_amount;
    
    -- Create refund entry only if there's a refund amount
    IF v_refund_amount > 0 THEN
        -- Calculate processing charges
        SET v_processing_charges = GREATEST(10.00, v_refund_amount * 0.005);
        SET v_processing_charges = LEAST(v_processing_charges, v_refund_amount * 0.02);
        
        -- Generate refund reference
        SET v_refund_reference = CONCAT('REF', v_ipo_id, '_', NEW.allotment_id, '_', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'));
        
        INSERT INTO Refund (
            allotment_id, 
            refund_amount, 
            processing_charges,
            refund_reference_no,
            refund_status
        ) VALUES (
            NEW.allotment_id, 
            v_refund_amount, 
            v_processing_charges,
            v_refund_reference,
            'PENDING'
        );
    END IF;
END//

DELIMITER ;