# 🌐 IPO Management System - Complete Web Setup Guide

## 📋 What You'll Get

A fully functional web interface to test your IPO Management System with:
- **Real-time Dashboard** with live statistics
- **IPO Management** interface 
- **Application Processing** tools
- **Allotment Processing** with multiple methods
- **Refund Management** system
- **Comprehensive Testing** suite

## 🚀 Quick Start (3 Steps)

### Step 1: Setup Database
```sql
-- Run these in MySQL:
CREATE DATABASE ipo_management_system;
USE ipo_management_system;

-- Then execute all your SQL files in order:
-- 01_create_tables.sql
-- 02_constraints_triggers.sql
-- allotment_procedures.sql
-- refund_procedures.sql
-- reporting_views.sql
-- sample_data.sql
```

### Step 2: Configure Web Files
1. **Update Database Password** in `web\api\index.php`:
   ```php
   $config = [
       'host' => 'localhost',
       'username' => 'root',
       'password' => 'YOUR_MYSQL_PASSWORD_HERE', // ← Change this
       'database' => 'ipo_management_system'
   ];
   ```

### Step 3: Start Web Server
Choose one method:

**Option A: Using XAMPP (Easiest)**
1. Install XAMPP from https://www.apachefriends.org/
2. Copy `web` folder to `C:\xampp\htdocs\ipo-system\`
3. Start Apache & MySQL in XAMPP Control Panel
4. Open: http://localhost/ipo-system/

**Option B: Using PHP Built-in Server**
1. Navigate to web folder in Command Prompt
2. Run: `php -S localhost:8000`
3. Open: http://localhost:8000/

**Option C: Double-click `start_server.bat`**
1. Just double-click the batch file
2. Open: http://localhost:8000/

## 🔧 Detailed Setup Instructions

### Prerequisites
- ✅ MySQL 8.0+ installed and running
- ✅ PHP 7.4+ with PDO MySQL extension
- ✅ Web server (Apache/Nginx) OR PHP built-in server

### Database Setup (Complete)
```bash
# Start MySQL command line
mysql -u root -p

# Create database and tables
CREATE DATABASE ipo_management_system;
USE ipo_management_system;

# Execute files in this exact order:
SOURCE path/to/01_create_tables.sql;
SOURCE path/to/02_constraints_triggers.sql;
SOURCE path/to/allotment_procedures.sql;
SOURCE path/to/refund_procedures.sql;
SOURCE path/to/reporting_views.sql;
SOURCE path/to/sample_data.sql;
```

### File Structure
```
web/
├── index.html              # Main dashboard interface
├── api/
│   └── index.php          # Backend API (update DB config here)
├── config-check.php       # Configuration checker
├── start_server.bat       # Quick server starter (Windows)
└── README.md              # Setup instructions
```

### Configuration Check
Before using the main interface:
1. Open: http://localhost:8000/config-check.php
2. Verify all checks pass ✅
3. Fix any red ❌ items

## 🎯 Testing Your System

### Test 1: Basic Connectivity
1. Open the main dashboard
2. Check connection status (should be green)
3. Verify statistics show data

### Test 2: IPO Processing
1. Go to "Allotments" tab
2. Select "TechCorp Ltd" (oversubscribed scenario)
3. Choose "AUTO" method
4. Process allotment
5. Verify results appear

### Test 3: Refund Processing
1. After allotment, go to "Refunds" tab
2. Click "Process All Pending Refunds"
3. Check refund amounts and status

### Test 4: System Validation
1. Go to "Tests" tab
2. Run all test categories
3. Ensure all tests pass ✅

## 🎨 Website Features

### 📊 Dashboard Overview
- **Live Statistics**: IPOs, Applicants, Applications, Allotments
- **Connection Status**: Real-time database connectivity
- **Health Check**: Comprehensive system validation

### 🏢 IPO Management
- **View All IPOs**: Complete list with status
- **Subscription Analysis**: Oversubscription ratios
- **Status Tracking**: Open, Closed, Listed states

### 📝 Application Processing
- **Application List**: All investor applications
- **Category Filtering**: Retail, HNI, Institutional
- **Status Monitoring**: Pending, Processed, Cancelled

### 🎲 Allotment Processing
- **Multiple Methods**:
  - AUTO: System decides based on oversubscription
  - PRO_RATA: Proportional allocation
  - LOTTERY: Random selection
  - FULL: Complete allocation
- **Real-time Results**: Immediate allotment feedback

### 💰 Refund Management
- **Automated Processing**: Bulk refund calculations
- **Status Tracking**: Pending → Processed → Failed
- **Charge Calculation**: Processing fees included

### 🧪 System Testing
- **Connection Tests**: Database connectivity
- **Validation Tests**: PAN/Demat format checking
- **Procedure Tests**: Stored procedure verification
- **View Tests**: Database view accessibility

## 🔍 Troubleshooting

### "Database connection failed"
- ✅ Check MySQL is running
- ✅ Verify credentials in `api/index.php`
- ✅ Ensure database exists
- ✅ Test with config-check.php

### "No data showing"
- ✅ Run database setup scripts
- ✅ Insert sample data
- ✅ Check table permissions

### "API not found" errors
- ✅ Check PHP is installed
- ✅ Verify server is running
- ✅ Check file paths

### "CORS errors" in browser
- ✅ Access via localhost (not file://)
- ✅ Use proper web server
- ✅ Check browser console

## 🎉 Expected Results

**When everything works correctly:**
- 🟢 Green connection indicator
- 📈 Statistics: ~4 IPOs, ~17 Applicants, ~25+ Applications
- 🔴 TechCorp shows as "OVERSUBSCRIBED"
- ✅ All system tests pass
- 💸 Refund processing completes successfully

**Performance Benchmarks:**
- Dashboard loads in < 2 seconds
- API calls respond in < 500ms
- Allotment processing completes in < 5 seconds
- Database queries return results quickly

## 🚀 Advanced Usage

### Custom IPO Processing
1. Add new companies via database
2. Process applications through the interface
3. Test different allotment methods
4. Analyze results in real-time

### Data Export
- Most tables can be exported to CSV
- Use browser developer tools to copy table data
- Generate reports through the dashboard

### API Integration
The backend provides REST API endpoints:
```
GET  /api/stats              # Overview statistics
GET  /api/ipos               # List all IPOs
POST /api/allotments/process # Process allotments
GET  /api/refunds            # View refunds
POST /api/refunds/process    # Process refunds
```

## 📞 Support

If you encounter issues:
1. **Check config-check.php** first
2. **Review browser console** for JavaScript errors
3. **Verify database setup** with sample queries
4. **Test API endpoints** directly
5. **Check file permissions** and paths

## 🎖️ Success Indicators

Your system is working perfectly when:
- ✅ Dashboard loads without errors
- ✅ All statistics show realistic numbers
- ✅ IPO processing completes successfully
- ✅ Refund calculations are accurate
- ✅ All tests pass in the test suite
- ✅ Real-time updates work smoothly

**Congratulations! Your IPO Management System is now fully functional with a professional web interface! 🎉**