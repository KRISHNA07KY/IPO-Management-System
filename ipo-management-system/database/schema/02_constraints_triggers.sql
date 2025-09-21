-- IPO Management System - Validation Logic
-- Phase 4: Constraints & Triggers
-- Create validation for PAN, demat numbers, duplicate prevention, and share limits

DELIMITER //

-- Trigger 1: Validate PAN format (should be 5 letters + 4 digits + 1 letter)
CREATE TRIGGER validate_pan_format
    BEFORE INSERT ON Applicant
    FOR EACH ROW
BEGIN
    IF NEW.pan_number NOT REGEXP '^[A-Z]{5}[0-9]{4}[A-Z]{1}$' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Invalid PAN format. PAN should be 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)';
    END IF;
END//

CREATE TRIGGER validate_pan_format_update
    BEFORE UPDATE ON Applicant
    FOR EACH ROW
BEGIN
    IF NEW.pan_number NOT REGEXP '^[A-Z]{5}[0-9]{4}[A-Z]{1}$' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Invalid PAN format. PAN should be 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)';
    END IF;
END//

-- Trigger 2: Validate Demat Account Number format (should start with IN followed by 12 digits)
CREATE TRIGGER validate_demat_format
    BEFORE INSERT ON Applicant
    FOR EACH ROW
BEGIN
    IF NEW.demat_account_no NOT REGEXP '^IN[0-9]{12}$' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Invalid Demat Account format. Should be IN followed by 12 digits (e.g., IN300123456789)';
    END IF;
END//

CREATE TRIGGER validate_demat_format_update
    BEFORE UPDATE ON Applicant
    FOR EACH ROW
BEGIN
    IF NEW.demat_account_no NOT REGEXP '^IN[0-9]{12}$' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Invalid Demat Account format. Should be IN followed by 12 digits (e.g., IN300123456789)';
    END IF;
END//

-- Trigger 3: Validate application against IPO limits and dates
CREATE TRIGGER validate_application_limits
    BEFORE INSERT ON Application
    FOR EACH ROW
BEGIN
    DECLARE v_max_shares INT;
    DECLARE v_min_lot_size INT;
    DECLARE v_price_per_share DECIMAL(10,2);
    DECLARE v_issue_start_date DATE;
    DECLARE v_issue_end_date DATE;
    DECLARE v_status VARCHAR(20);
    DECLARE v_total_shares INT;
    DECLARE v_total_applied INT DEFAULT 0;
    
    -- Get IPO details
    SELECT max_shares_per_applicant, min_lot_size, price_per_share, 
           issue_start_date, issue_end_date, status, total_shares
    INTO v_max_shares, v_min_lot_size, v_price_per_share, 
         v_issue_start_date, v_issue_end_date, v_status, v_total_shares
    FROM Company 
    WHERE ipo_id = NEW.ipo_id;
    
    -- Check if IPO exists
    IF v_max_shares IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'IPO not found';
    END IF;
    
    -- Check if IPO is open for applications
    IF v_status NOT IN ('OPEN', 'UPCOMING') THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'IPO is not open for applications';
    END IF;
    
    -- Check application date within IPO period
    IF CURDATE() < v_issue_start_date THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'IPO has not started yet';
    END IF;
    
    IF CURDATE() > v_issue_end_date THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'IPO application period has ended';
    END IF;
    
    -- Check minimum lot size
    IF NEW.shares_requested < v_min_lot_size THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = CONCAT('Minimum lot size is ', v_min_lot_size, ' shares');
    END IF;
    
    -- Check shares requested is multiple of lot size
    IF NEW.shares_requested % v_min_lot_size != 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = CONCAT('Shares requested must be multiple of lot size (', v_min_lot_size, ')');
    END IF;
    
    -- Check maximum shares limit per applicant
    IF v_max_shares IS NOT NULL AND NEW.shares_requested > v_max_shares THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = CONCAT('Maximum shares per applicant is ', v_max_shares);
    END IF;
    
    -- Validate bid amount matches shares requested * price
    IF ABS(NEW.bid_amount - (NEW.shares_requested * v_price_per_share)) > 0.01 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Bid amount does not match shares requested × price per share';
    END IF;
    
    -- Check total demand doesn't exceed available shares by too much (optional warning)
    SELECT IFNULL(SUM(shares_requested), 0) INTO v_total_applied
    FROM Application 
    WHERE ipo_id = NEW.ipo_id AND status != 'CANCELLED';
    
    -- Allow applications even if oversubscribed, but could add a warning system here
    
END//

-- Trigger 4: Update application status when IPO closes
CREATE TRIGGER update_ipo_status
    BEFORE UPDATE ON Company
    FOR EACH ROW
BEGIN
    -- If IPO is being closed, update all pending applications to processed
    IF OLD.status != 'CLOSED' AND NEW.status = 'CLOSED' THEN
        UPDATE Application 
        SET status = 'PROCESSED' 
        WHERE ipo_id = NEW.ipo_id AND status = 'PENDING';
    END IF;
END//

-- Trigger 5: Validate allotment doesn't exceed application
CREATE TRIGGER validate_allotment
    BEFORE INSERT ON Allotment
    FOR EACH ROW
BEGIN
    DECLARE v_shares_requested INT;
    DECLARE v_applicant_id INT;
    DECLARE v_ipo_id INT;
    
    -- Get application details
    SELECT a.shares_requested, a.applicant_id, a.ipo_id
    INTO v_shares_requested, v_applicant_id, v_ipo_id
    FROM Application a
    WHERE a.application_id = NEW.application_id;
    
    -- Check if application exists
    IF v_shares_requested IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Application not found';
    END IF;
    
    -- Check allotted shares don't exceed requested shares
    IF NEW.shares_allotted > v_shares_requested THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Allotted shares cannot exceed requested shares';
    END IF;
    
    -- Auto-calculate allotment amount based on shares allotted
    IF NEW.allotment_amount = 0 THEN
        SELECT NEW.shares_allotted * c.price_per_share INTO NEW.allotment_amount
        FROM Application a
        JOIN Company c ON a.ipo_id = c.ipo_id
        WHERE a.application_id = NEW.application_id;
    END IF;
END//

-- Trigger 6: Auto-create refund entry when allotment is created
CREATE TRIGGER auto_create_refund
    AFTER INSERT ON Allotment
    FOR EACH ROW
BEGIN
    DECLARE v_bid_amount DECIMAL(12,2);
    DECLARE v_refund_amount DECIMAL(12,2);
    
    -- Get original bid amount
    SELECT bid_amount INTO v_bid_amount
    FROM Application
    WHERE application_id = NEW.application_id;
    
    -- Calculate refund amount
    SET v_refund_amount = v_bid_amount - NEW.allotment_amount;
    
    -- Create refund entry only if there's a refund amount
    IF v_refund_amount > 0 THEN
        INSERT INTO Refund (allotment_id, refund_amount, refund_status)
        VALUES (NEW.allotment_id, v_refund_amount, 'PENDING');
    END IF;
END//

-- Trigger 7: Validate email format
CREATE TRIGGER validate_email_format
    BEFORE INSERT ON Applicant
    FOR EACH ROW
BEGIN
    IF NEW.email IS NOT NULL AND NEW.email NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Invalid email format';
    END IF;
END//

CREATE TRIGGER validate_email_format_update
    BEFORE UPDATE ON Applicant
    FOR EACH ROW
BEGIN
    IF NEW.email IS NOT NULL AND NEW.email NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Invalid email format';
    END IF;
END//

-- Trigger 8: Validate phone number format (Indian mobile numbers)
CREATE TRIGGER validate_phone_format
    BEFORE INSERT ON Applicant
    FOR EACH ROW
BEGIN
    IF NEW.phone IS NOT NULL AND NEW.phone NOT REGEXP '^[6-9][0-9]{9}$' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Invalid phone format. Should be 10 digits starting with 6-9';
    END IF;
END//

CREATE TRIGGER validate_phone_format_update
    BEFORE UPDATE ON Applicant
    FOR EACH ROW
BEGIN
    IF NEW.phone IS NOT NULL AND NEW.phone NOT REGEXP '^[6-9][0-9]{9}$' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Invalid phone format. Should be 10 digits starting with 6-9';
    END IF;
END//

-- Function to check if an applicant can apply for more shares
CREATE FUNCTION can_apply_more_shares(p_ipo_id INT, p_applicant_id INT, p_additional_shares INT)
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_max_shares INT;
    DECLARE v_current_shares INT DEFAULT 0;
    
    -- Get maximum shares allowed
    SELECT max_shares_per_applicant INTO v_max_shares
    FROM Company WHERE ipo_id = p_ipo_id;
    
    -- Get current total shares applied by this applicant
    SELECT IFNULL(SUM(shares_requested), 0) INTO v_current_shares
    FROM Application 
    WHERE ipo_id = p_ipo_id AND applicant_id = p_applicant_id AND status != 'CANCELLED';
    
    -- Check if additional shares can be applied
    IF v_max_shares IS NULL OR (v_current_shares + p_additional_shares) <= v_max_shares THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END//

DELIMITER ;

-- Create additional indexes for validation performance
CREATE INDEX idx_application_status ON Application(status);
CREATE INDEX idx_allotment_application ON Allotment(application_id);
CREATE INDEX idx_refund_allotment ON Refund(allotment_id);