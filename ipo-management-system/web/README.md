# IPO Management System - Web Test Interface

## 🌐 How to Run the Test Website

### Method 1: Using XAMPP (Recommended for Windows)

1. **Download and Install XAMPP**
   - Download from: https://www.apachefriends.org/
   - Install with Apache, MySQL, and PHP enabled

2. **Setup the Project**
   ```
   Copy the entire 'web' folder to: C:\xampp\htdocs\ipo-system\
   ```

3. **Start Services**
   - Open XAMPP Control Panel
   - Start Apache and MySQL

4. **Configure Database**
   - Open phpMyAdmin: http://localhost/phpmyadmin
   - Create database 'ipo_management_system'
   - Run your SQL setup scripts

5. **Update Database Credentials**
   - Edit `web\api\index.php`
   - Update the database configuration:
   ```php
   $config = [
       'host' => 'localhost',
       'username' => 'root',
       'password' => 'your_mysql_password',
       'database' => 'ipo_management_system'
   ];
   ```

6. **Access the Website**
   - Open browser: http://localhost/ipo-system/

### Method 2: Using Built-in PHP Server

1. **Install PHP 8.0+**
   - Download from: https://www.php.net/downloads

2. **Navigate to Web Folder**
   ```cmd
   cd "C:\Users\HP\OneDrive\Documents\dbproject\ipo-management-system\web"
   ```

3. **Start PHP Server**
   ```cmd
   php -S localhost:8000
   ```

4. **Access Website**
   - Open browser: http://localhost:8000/

### Method 3: Using WAMP/MAMP

1. **Install WAMP (Windows) or MAMP (Mac)**
2. **Copy project to www folder**
3. **Start services and access via localhost**

## 🔧 Configuration

### Database Configuration
Update the database settings in `web\api\index.php`:

```php
$config = [
    'host' => 'localhost',        // Your MySQL host
    'username' => 'root',         // Your MySQL username  
    'password' => 'your_password', // Your MySQL password
    'database' => 'ipo_management_system'
];
```

### Troubleshooting

**Problem: "Database connection failed"**
- Check MySQL is running
- Verify database credentials
- Ensure database exists
- Check if PHP has MySQL extension enabled

**Problem: "404 Not Found"**
- Check Apache is running
- Verify file paths
- Check .htaccess if using Apache

**Problem: "CORS errors"**
- API includes CORS headers
- Try accessing directly via localhost (not file://)

## 🚀 Website Features

### Dashboard Overview
- Real-time database connection status
- System statistics (IPOs, Applicants, Applications, Allotments)
- Health check functionality

### IPO Management
- View all IPOs with detailed information
- Check subscription status and ratios
- Real-time status updates

### Application Management
- View all applications by applicants
- Filter by IPO, category, status
- Application timeline tracking

### Allotment Processing
- Process IPO allotments with different methods:
  - AUTO: System decides based on oversubscription
  - PRO_RATA: Proportional allocation
  - LOTTERY: Random selection
  - FULL: Complete allocation
- View allotment results and statistics

### Refund Management
- Process refunds automatically
- Track refund status (Pending/Processed/Failed)
- View refund summaries with processing charges

### System Testing
- Database connection testing
- Data validation testing
- Stored procedure testing
- Database view testing

## 🎯 Test Scenarios

### Test 1: Basic Functionality
1. Open the website
2. Check if dashboard loads with statistics
3. Navigate through all tabs
4. Verify data is displayed correctly

### Test 2: IPO Processing
1. Go to Allotments tab
2. Select "TechCorp Ltd" (should be oversubscribed)
3. Choose "AUTO" method
4. Click "Process Allotment"
5. Check results in allotment list

### Test 3: Refund Processing
1. After processing allotments
2. Go to Refunds tab
3. Click "Process All Pending Refunds"
4. View refund status and amounts

### Test 4: System Validation
1. Go to Tests tab
2. Run each test category:
   - Database Connection
   - Data Validation
   - Stored Procedures
   - Database Views
3. Verify all tests pass

## 📊 Expected Results

**If everything is working correctly:**
- ✅ Green connection status
- ✅ Statistics show: 4 IPOs, 17+ Applicants, 25+ Applications
- ✅ TechCorp shows as oversubscribed
- ✅ Allotment processing works without errors
- ✅ Refunds are calculated and processed
- ✅ All tests pass

**If there are issues:**
- ❌ Red connection status = Database connection problem
- ❌ Zero statistics = Data not loaded properly
- ❌ API errors = Backend PHP issues
- ❌ Failed tests = Database setup incomplete

## 🔍 Debugging

### Check Browser Console
- Press F12 to open developer tools
- Look for JavaScript errors in Console tab
- Check Network tab for API call failures

### Check PHP Errors
- Look at Apache error logs
- Enable PHP error reporting
- Check database query results

### Verify Database
- Use phpMyAdmin or MySQL Workbench
- Confirm all tables exist and have data
- Test queries manually

## 📁 File Structure

```
web/
├── index.html              # Main website interface
├── api/
│   └── index.php          # Backend API handler
└── README.md              # This file
```

## 🎉 Success Indicators

When everything is working:
1. Dashboard shows live statistics
2. All tabs load data correctly  
3. Allotment processing completes successfully
4. Refunds are calculated properly
5. All system tests pass
6. No console errors

This test website will help you verify that your IPO Management System database is working correctly and all features are functional!