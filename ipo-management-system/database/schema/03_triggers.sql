CREATE TRIGGER validate_pan
BEFORE INSERT ON Applicant
FOR EACH ROW
BEGIN
    IF NOT NEW.PAN REGEXP '^[A-Z]{5}[0-9]{4}[A-Z]{1}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid PAN number format';
    END IF;
END;

CREATE TRIGGER validate_demat_no
BEFORE INSERT ON Applicant
FOR EACH ROW
BEGIN
    IF NOT NEW.demat_no REGEXP '^[0-9]{16}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid Demat number format';
    END IF;
END;

CREATE TRIGGER prevent_duplicate_applications
BEFORE INSERT ON Application
FOR EACH ROW
BEGIN
    DECLARE existing_count INT;
    SELECT COUNT(*) INTO existing_count
    FROM Application
    WHERE applicant_id = NEW.applicant_id AND ipo_id = NEW.ipo_id;

    IF existing_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Duplicate application detected for this applicant';
    END IF;
END;

CREATE TRIGGER block_requests_above_max_limit
BEFORE INSERT ON Application
FOR EACH ROW
BEGIN
    DECLARE total_requested INT;
    DECLARE max_limit INT;

    SELECT total_shares INTO max_limit FROM Company WHERE ipo_id = NEW.ipo_id;
    SELECT SUM(shares_requested) INTO total_requested FROM Application WHERE ipo_id = NEW.ipo_id;

    IF (total_requested + NEW.shares_requested) > max_limit THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Request exceeds maximum limit of shares';
    END IF;
END;