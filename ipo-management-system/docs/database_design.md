# Database Design Documentation

## Overview
This document outlines the database design for the IPO Management System. It includes the schema, relationships between tables, and relevant notes regarding constraints and triggers.

## Schema

### Tables

1. **Company**
   - **IPO ID** (Primary Key): Unique identifier for each IPO.
   - **Name**: Name of the company.
   - **Total Shares**: Total number of shares available for the IPO.
   - **Price**: Price per share.
   - **Dates**: Important dates related to the IPO (e.g., opening and closing dates).

2. **Applicant**
   - **ID** (Primary Key): Unique identifier for each applicant.
   - **Name**: Name of the investor.
   - **PAN**: Permanent Account Number (must be unique and valid).
   - **Demat No**: Dematerialized account number (must be unique and valid).

3. **Application**
   - **Applicant ID** (Foreign Key): References the ID in the Applicant table.
   - **Shares Requested**: Number of shares the applicant wishes to bid for.
   - **Amount**: Total amount bid by the applicant.

4. **Allotment**
   - **Shares Allotted**: Number of shares allotted to the applicant.
   - **Refund Amount**: Amount to be refunded to the applicant if applicable.

5. **Refund**
   - **ID** (Primary Key): Unique identifier for each refund record.
   - **Applicant ID** (Foreign Key): References the ID in the Applicant table.
   - **Refund Amount**: Amount to be refunded to the applicant.

## Relationships
- The **Company** table is independent and does not have foreign key relationships.
- The **Applicant** table is linked to the **Application** table through the Applicant ID.
- The **Application** table is linked to the **Allotment** table to record the results of the allotment process.
- The **Refund** table is linked to the **Applicant** table to track refunds for each applicant.

## Constraints
- Unique constraints on PAN and Demat No in the Applicant table to prevent duplicates.
- Foreign key constraints to maintain referential integrity between tables.
- Validation triggers to ensure that PAN and Demat numbers are valid formats.
- Logic to prevent applications that exceed the maximum limit of shares.

## Notes
- The design allows for easy tracking of IPO applications, allotments, and refunds.
- The system is designed to handle oversubscription scenarios through a lottery or pro-rata allotment process.
- Refund calculations are automated based on the difference between shares applied for and shares allotted.

This document serves as a reference for developers and database administrators involved in the IPO Management System project.