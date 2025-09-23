# IPO Management System Setup Instructions

## Current Issue
The web application is trying to connect to a PHP API server that isn't running because PHP is not installed on your system.

## Solutions

### Option 1: Install PHP (Recommended)

1. **Download PHP for Windows:**
   - Go to https://windows.php.net/download/
   - Download "Thread Safe" version (latest 8.x)
   - Extract to `C:\php`

2. **Add PHP to System PATH:**
   - Open System Properties → Advanced → Environment Variables
   - Edit PATH variable and add `C:\php`
   - Restart Command Prompt/PowerShell

3. **Test PHP Installation:**
   ```powershell
   php -v
   ```

4. **Start the Server:**
   ```powershell
   cd "c:\Users\HP\OneDrive\Documents\dbproject\ipo-management-system\web"
   php -S localhost:8000
   ```

5. **Access the Application:**
   - Open browser and go to: http://localhost:8000

### Option 2: Use XAMPP (Easier Alternative)

1. **Download XAMPP:**
   - Go to https://www.apachefriends.org/download.html
   - Download and install XAMPP

2. **Copy Project to XAMPP:**
   - Copy the entire `ipo-management-system` folder to `C:\xampp\htdocs\`

3. **Start XAMPP:**
   - Open XAMPP Control Panel
   - Start Apache and MySQL services

4. **Access the Application:**
   - Open browser and go to: http://localhost/ipo-management-system/web/

### Option 3: Modify for Static Testing (Temporary)

If you want to test the frontend without the backend temporarily, I can modify the code to use mock data.

## Database Setup Required

Before the API will work properly, you also need to:

1. **Setup MySQL Database:**
   - Install MySQL or use XAMPP's MySQL
   - Create a database named `ipo_management`
   - Run all the SQL files in the `database` folder in order:
     ```sql
     -- Run these files in order:
     database/schema/01_create_tables.sql
     database/schema/02_constraints_triggers.sql
     database/procedures/allotment_procedures.sql
     database/views/reporting_views.sql
     database/test_data/sample_data.sql
     ```

2. **Configure Database Connection:**
   - Edit `web/api/index.php` if needed to match your database credentials

## Next Steps

Choose one of the options above and let me know which approach you'd like to take!