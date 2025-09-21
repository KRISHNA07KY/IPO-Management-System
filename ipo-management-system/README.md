# IPO Management System

A comprehensive database system for managing Initial Public Offerings (IPOs), including applications, allotments, and refund processing.

## 🎯 Project Overview

This IPO Management System handles the complete lifecycle of IPO applications, from initial application submission to final refund processing. It includes sophisticated logic for handling oversubscribed IPOs using various allotment methods.

## 📋 Features Implemented

### ✅ Phase 1: Setup
- **DBMS**: MySQL (with PostgreSQL/Oracle compatibility notes)
- **Database Structure**: Organized schema with proper indexing
- **Version Control**: Ready for GitHub integration

### ✅ Phase 2: Database Design
- **Company Table**: IPO details (ID, name, total shares, price, dates)
- **Applicant Table**: Investor details (ID, name, PAN, demat number)
- **Application Table**: Each bid (applicant ID, shares requested, amount)
- **Allotment Table**: Results of allotment (shares allotted, refund amount)
- **Refund Table**: Detailed refund processing information

### ✅ Phase 3: Data Insertion
- Sample IPO data (1000+ shares scenarios)
- Multiple applicants with varied investment profiles
- Oversubscribed and normal subscription scenarios
- Realistic test data for validation

### ✅ Phase 4: Validation Logic
- **PAN Validation**: Format verification (5 letters + 4 digits + 1 letter)
- **Demat Validation**: Format verification (IN + 12 digits)
- **Duplicate Prevention**: Unique application constraints
- **Share Limits**: Maximum shares per applicant validation
- **Date Validation**: IPO period and application timing checks

### ✅ Phase 5: Oversubscription & Allotment
- **Auto-Detection**: Automatically detects oversubscription
- **Pro-Rata Logic**: Proportional allotment when oversubscribed
- **Lottery System**: Random allotment for highly oversubscribed IPOs
- **Full Allotment**: Normal processing when not oversubscribed
- **Flexible Methods**: Admin can choose allotment strategy

### ✅ Phase 6: Refund Computation
- **Auto-Calculation**: Refund = (applied – allotted) × price
- **Processing Charges**: Configurable fee structure
- **Status Tracking**: Pending, Processed, Failed status management
- **Batch Processing**: Bulk refund processing capabilities
- **Retry Logic**: Failed refund retry mechanisms

### ✅ Phase 7: Reporting & Output
- **Comprehensive Views**: 9 different reporting views
- **Financial Summaries**: Complete money flow analysis
- **Oversubscription Reports**: Detailed subscription analysis
- **Export-Ready**: CSV-formatted query results
- **Dashboard Views**: Real-time status monitoring

## 🗂️ Project Structure

```
ipo-management-system/
├── database/
│   ├── schema/
│   │   ├── 01_create_tables.sql          # Core table definitions
│   │   └── 02_constraints_triggers.sql   # Validation logic
│   ├── procedures/
│   │   ├── allotment_procedures.sql      # Allotment processing
│   │   └── refund_procedures.sql         # Refund processing
│   ├── views/
│   │   └── reporting_views.sql           # Reporting views
│   ├── data/
│   │   └── sample_data.sql               # Test data
│   └── setup.sql                         # Master setup script
├── scripts/
│   └── example_usage.sql                 # Usage examples
└── README.md                             # This file
```

## 🚀 Quick Start

### Prerequisites
- MySQL 8.0+ (or PostgreSQL 13+/Oracle 19c+)
- Database admin privileges
- MySQL Workbench or similar tool (optional)

### Installation

1. **Create Database**
   ```sql
   CREATE DATABASE ipo_management_system;
   USE ipo_management_system;
   ```

2. **Execute Setup Scripts** (in order)
   ```sql
   SOURCE database/schema/01_create_tables.sql;
   SOURCE database/schema/02_constraints_triggers.sql;
   SOURCE database/procedures/allotment_procedures.sql;
   SOURCE database/procedures/refund_procedures.sql;
   SOURCE database/views/reporting_views.sql;
   SOURCE database/data/sample_data.sql;
   ```

3. **Verify Installation**
   ```sql
   SELECT * FROM vw_ipo_overview;
   ```

## 📊 Usage Examples

### Basic IPO Processing

```sql
-- 1. Check IPO status
SELECT * FROM vw_ipo_overview WHERE company_name = 'TechCorp Ltd';

-- 2. Process allotment
CALL process_ipo_allotment(1, 'AUTO');

-- 3. Check results
SELECT * FROM vw_allotment_report WHERE company_name = 'TechCorp Ltd';

-- 4. Process refunds
CALL auto_process_refunds_after_allotment(1);

-- 5. Generate reports
SELECT * FROM vw_refund_summary WHERE company_name = 'TechCorp Ltd';
```

### Advanced Analysis

```sql
-- Oversubscription analysis
SELECT * FROM vw_oversubscription_analysis ORDER BY oversubscription_ratio DESC;

-- Financial summary
SELECT * FROM vw_ipo_financial_summary;

-- Top investors
SELECT * FROM vw_top_applicants LIMIT 10;
```

## 🔧 Key Procedures

| Procedure | Purpose |
|-----------|---------|
| `process_ipo_allotment(ipo_id, method)` | Main allotment processing |
| `calculate_oversubscription_ratio(ipo_id)` | Check subscription status |
| `auto_process_refunds_after_allotment(ipo_id)` | Complete refund processing |
| `get_allotment_summary(ipo_id)` | Allotment statistics |
| `calculate_ipo_money_flow(ipo_id)` | Financial analysis |

## 📈 Reporting Views

| View | Purpose |
|------|---------|
| `vw_ipo_overview` | Complete IPO summary |
| `vw_allotment_report` | Detailed allotment results |
| `vw_oversubscription_analysis` | Subscription analysis |
| `vw_refund_summary` | Refund processing status |
| `vw_ipo_financial_summary` | Financial metrics |
| `vw_application_dashboard` | Application status |
| `vw_top_applicants` | Investor analysis |
| `vw_daily_activity` | Daily statistics |
| `vw_ipo_performance` | Performance metrics |

## 🛡️ Security Features

- **Input Validation**: Comprehensive format checking
- **Constraint Enforcement**: Database-level data integrity
- **Transaction Safety**: ACID compliance for critical operations
- **Error Handling**: Graceful error management
- **Audit Trail**: Complete activity logging

## 🎨 Customization Options

### Allotment Methods
- **AUTO**: System chooses best method based on oversubscription
- **PRO_RATA**: Proportional allocation
- **LOTTERY**: Random selection with configurable success rates
- **FULL**: Complete allocation (when not oversubscribed)

### Processing Charges
- Configurable base charges and percentage rates
- Automatic calculation with caps
- Transparent fee structure

## 📋 Sample Data Included

- **4 Sample IPOs**: Various subscription scenarios
- **17 Sample Applicants**: Diverse investment profiles
- **25+ Applications**: Realistic application patterns
- **Oversubscribed Scenarios**: TechCorp Ltd (117% subscribed)
- **Normal Scenarios**: GreenEnergy Solutions
- **Test Cases**: Comprehensive validation examples

## 🔍 Validation Features

- **PAN Format**: ABCDE1234F pattern validation
- **Demat Format**: IN300123456789 pattern validation
- **Email Validation**: Standard email format checking
- **Phone Validation**: Indian mobile number format
- **Date Validation**: IPO period compliance
- **Amount Validation**: Bid amount vs share calculation
- **Duplicate Prevention**: One application per IPO per applicant

## 📊 Performance Features

- **Optimized Indexes**: Strategic indexing for fast queries
- **Efficient Procedures**: Bulk processing capabilities
- **Memory Management**: Cursor-based processing for large datasets
- **Scalable Design**: Handles thousands of applications

## 🚀 Future Enhancements

- **Web Interface**: Frontend application
- **API Layer**: RESTful API for external integration
- **Real-time Processing**: Live application tracking
- **Payment Gateway**: Direct bank integration
- **Mobile App**: Investor mobile application
- **Analytics Dashboard**: Advanced reporting interface

## 📝 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues:
- Check the example usage file
- Review the validation triggers
- Consult the comprehensive views
- Examine the stored procedures

---

**Built with ❤️ for efficient IPO management**

## Project Structure
The project is organized into several directories, each serving a specific purpose:

- **database/**: Contains all database-related files.
  - **schema/**: SQL files for creating tables, defining constraints, and triggers.
  - **data/**: Sample data files for populating the database with initial records.
  - **procedures/**: Stored procedures for allotment and refund calculations.
  - **views/**: SQL views for reporting purposes.

- **scripts/**: Contains SQL scripts for setting up the database and exporting reports.

- **docs/**: Documentation related to the database design.

## Setup Instructions
1. **Database Setup**:
   - Run the `setup.sql` script located in the `scripts/` directory to create the necessary tables and insert sample data.
   - Ensure that your DBMS (MySQL/PostgreSQL/Oracle) is properly configured.

2. **Data Insertion**:
   - Sample data for companies, applicants, and applications can be found in the `database/data/` directory. You can modify these files as needed.

3. **Executing Procedures**:
   - Use the stored procedures in the `database/procedures/` directory to manage allotments and refunds.

4. **Generating Reports**:
   - SQL views for allotment reports, oversubscription ratios, and refund summaries are located in the `database/views/` directory. You can query these views to get the required information.

5. **Exporting Reports**:
   - Use the `export_reports.sql` script in the `scripts/` directory to export the results as CSV or PDF.

## Usage
- The system allows users to apply for shares in various IPOs, track their applications, and receive refunds if applicable.
- Reports can be generated to analyze the performance of IPOs and the distribution of shares among applicants.

## Contribution
Feel free to contribute to the project by adding features, fixing bugs, or improving documentation. Please create a pull request for any changes you wish to propose.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.