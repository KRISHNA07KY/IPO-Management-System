CREATE PROCEDURE calculate_refund()
BEGIN
    DECLARE v_applied INT;
    DECLARE v_allotted INT;
    DECLARE v_price DECIMAL(10, 2);
    DECLARE v_refund DECIMAL(10, 2);
    
    DECLARE cur CURSOR FOR 
        SELECT a.shares_requested, a.amount, c.price
        FROM Application a
        JOIN Company c ON a.ipo_id = c.ipo_id
        WHERE a.status = 'completed';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO v_applied, v_allotted, v_price;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SET v_refund = (v_applied - v_allotted) * v_price;

        INSERT INTO Refund (applicant_id, refund_amount)
        VALUES (a.applicant_id, v_refund);
    END LOOP;

    CLOSE cur;
END;