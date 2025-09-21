-- Constraints for IPO Management System

-- Primary Keys
ALTER TABLE Company ADD CONSTRAINT pk_company PRIMARY KEY (ipo_id);
ALTER TABLE Applicant ADD CONSTRAINT pk_applicant PRIMARY KEY (id);
ALTER TABLE Application ADD CONSTRAINT pk_application PRIMARY KEY (applicant_id, shares_requested);
ALTER TABLE Allotment ADD CONSTRAINT pk_allotment PRIMARY KEY (applicant_id);
ALTER TABLE Refund ADD CONSTRAINT pk_refund PRIMARY KEY (applicant_id);

-- Unique Constraints
ALTER TABLE Applicant ADD CONSTRAINT uq_applicant_pan UNIQUE (pan);
ALTER TABLE Applicant ADD CONSTRAINT uq_applicant_demat UNIQUE (demat_no);

-- Foreign Keys
ALTER TABLE Application ADD CONSTRAINT fk_application_applicant FOREIGN KEY (applicant_id) REFERENCES Applicant(id);
ALTER TABLE Allotment ADD CONSTRAINT fk_allotment_application FOREIGN KEY (applicant_id) REFERENCES Application(applicant_id);
ALTER TABLE Refund ADD CONSTRAINT fk_refund_allotment FOREIGN KEY (applicant_id) REFERENCES Allotment(applicant_id);

-- Check Constraints
ALTER TABLE Applicant ADD CONSTRAINT chk_pan_format CHECK (pan REGEXP '^[A-Z]{5}[0-9]{4}[A-Z]{1}$');
ALTER TABLE Applicant ADD CONSTRAINT chk_demat_format CHECK (demat_no REGEXP '^[0-9]{16}$');