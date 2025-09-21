-- This file contains SQL commands to export the results of the reports as CSV or PDF.

-- Export Allotment Report
COPY (SELECT * FROM allotment_report) TO '/path/to/export/allotment_report.csv' WITH CSV HEADER;

-- Export Oversubscription Report
COPY (SELECT * FROM oversubscription_report) TO '/path/to/export/oversubscription_report.csv' WITH CSV HEADER;

-- Export Refund Summary
COPY (SELECT * FROM refund_summary) TO '/path/to/export/refund_summary.csv' WITH CSV HEADER;

-- Note: Adjust the file paths as necessary for your environment.