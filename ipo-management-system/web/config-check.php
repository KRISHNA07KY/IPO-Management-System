<?php
// Configuration Checker for IPO Management System
echo "<h1>IPO Management System - Configuration Checker</h1>";

echo "<h2>PHP Configuration</h2>";
echo "<table border='1' cellpadding='5'>";
echo "<tr><th>Setting</th><th>Value</th><th>Status</th></tr>";

// PHP Version
$php_version = phpversion();
$php_ok = version_compare($php_version, '7.4', '>=');
echo "<tr><td>PHP Version</td><td>$php_version</td><td>" . ($php_ok ? "✅ OK" : "❌ Need 7.4+") . "</td></tr>";

// PDO MySQL Extension
$pdo_mysql = extension_loaded('pdo_mysql');
echo "<tr><td>PDO MySQL Extension</td><td>" . ($pdo_mysql ? "Loaded" : "Not Loaded") . "</td><td>" . ($pdo_mysql ? "✅ OK" : "❌ Required") . "</td></tr>";

// JSON Extension
$json = extension_loaded('json');
echo "<tr><td>JSON Extension</td><td>" . ($json ? "Loaded" : "Not Loaded") . "</td><td>" . ($json ? "✅ OK" : "❌ Required") . "</td></tr>";

echo "</table>";

echo "<h2>Database Connection Test</h2>";

// Database configuration (you can modify these)
$config = [
    'host' => 'localhost',
    'username' => 'root',
    'password' => '', // Change this to your MySQL password
    'database' => 'ipo_management_system'
];

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset=utf8mb4";
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    echo "<p style='color: green;'>✅ Database connection successful!</p>";
    
    // Check if tables exist
    echo "<h3>Database Tables</h3>";
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Table</th><th>Records</th><th>Status</th></tr>";
    
    $tables = ['Company', 'Applicant', 'Application', 'Allotment', 'Refund'];
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $count = $stmt->fetch()['count'];
            echo "<tr><td>$table</td><td>$count</td><td>✅ OK</td></tr>";
        } catch (Exception $e) {
            echo "<tr><td>$table</td><td>-</td><td>❌ " . $e->getMessage() . "</td></tr>";
        }
    }
    echo "</table>";
    
    // Check if views exist
    echo "<h3>Database Views</h3>";
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>View</th><th>Records</th><th>Status</th></tr>";
    
    $views = ['vw_ipo_overview', 'vw_allotment_report', 'vw_refund_summary'];
    foreach ($views as $view) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $view");
            $count = $stmt->fetch()['count'];
            echo "<tr><td>$view</td><td>$count</td><td>✅ OK</td></tr>";
        } catch (Exception $e) {
            echo "<tr><td>$view</td><td>-</td><td>❌ " . $e->getMessage() . "</td></tr>";
        }
    }
    echo "</table>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Database connection failed: " . $e->getMessage() . "</p>";
    echo "<p><strong>To fix this:</strong></p>";
    echo "<ul>";
    echo "<li>Make sure MySQL is running</li>";
    echo "<li>Verify database credentials in the configuration</li>";
    echo "<li>Ensure the database 'ipo_management_system' exists</li>";
    echo "<li>Run the database setup scripts</li>";
    echo "</ul>";
}

echo "<h2>File Permissions</h2>";
$files_to_check = ['index.html', 'api/index.php'];
echo "<table border='1' cellpadding='5'>";
echo "<tr><th>File</th><th>Exists</th><th>Readable</th><th>Status</th></tr>";

foreach ($files_to_check as $file) {
    $exists = file_exists($file);
    $readable = $exists ? is_readable($file) : false;
    $status = ($exists && $readable) ? "✅ OK" : "❌ Problem";
    
    echo "<tr><td>$file</td><td>" . ($exists ? "Yes" : "No") . "</td><td>" . ($readable ? "Yes" : "No") . "</td><td>$status</td></tr>";
}
echo "</table>";

echo "<h2>Next Steps</h2>";
echo "<ol>";
echo "<li>If all checks pass, access the main website at <a href='index.html'>index.html</a></li>";
echo "<li>If database connection failed, update credentials in api/index.php</li>";
echo "<li>If tables are missing, run the database setup scripts</li>";
echo "<li>If PHP extensions are missing, install them or use XAMPP</li>";
echo "</ol>";

echo "<hr>";
echo "<p><small>Configuration Checker for IPO Management System | " . date('Y-m-d H:i:s') . "</small></p>";
?>