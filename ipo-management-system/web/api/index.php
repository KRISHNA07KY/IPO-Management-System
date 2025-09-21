<?php
// Database configuration
$config = [
    'host' => 'localhost',
    'username' => 'root',
    'password' => '', // Change this to your MySQL password
    'database' => 'ipo_management_system',
    'charset' => 'utf8mb4'
];

// Database connection
function getConnection() {
    global $config;
    
    try {
        $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        return new PDO($dsn, $config['username'], $config['password'], $options);
    } catch (PDOException $e) {
        throw new Exception("Database connection failed: " . $e->getMessage());
    }
}

// Set JSON content type
header('Content-Type: application/json');

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request URI and method
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Parse the request path
$path = parse_url($request_uri, PHP_URL_PATH);
$path_parts = array_filter(explode('/', $path));

// Remove 'api' from path if present
if (in_array('api', $path_parts)) {
    $key = array_search('api', $path_parts);
    unset($path_parts[$key]);
    $path_parts = array_values($path_parts);
}

// Route handler
try {
    $pdo = getConnection();
    
    if (empty($path_parts)) {
        // Default route - API info
        echo json_encode([
            'message' => 'IPO Management System API',
            'version' => '1.0',
            'endpoints' => [
                'GET /stats' => 'Get overview statistics',
                'GET /ipos' => 'Get all IPOs',
                'GET /ipos/detailed' => 'Get detailed IPO information',
                'GET /applications' => 'Get all applications',
                'GET /allotments' => 'Get all allotments',
                'POST /allotments/process' => 'Process IPO allotment',
                'GET /refunds' => 'Get all refunds',
                'POST /refunds/process' => 'Process refunds',
                'GET /health-check' => 'System health check',
                'GET /test/*' => 'Various test endpoints'
            ]
        ]);
        exit();
    }
    
    $endpoint = $path_parts[0];
    $sub_endpoint = isset($path_parts[1]) ? $path_parts[1] : null;
    
    switch ($endpoint) {
        case 'stats':
            handleStats($pdo);
            break;
            
        case 'ipos':
            if ($sub_endpoint === 'detailed') {
                handleIPOsDetailed($pdo);
            } else {
                handleIPOs($pdo);
            }
            break;
            
        case 'applications':
            handleApplications($pdo);
            break;
            
        case 'allotments':
            if ($sub_endpoint === 'process' && $request_method === 'POST') {
                handleProcessAllotment($pdo);
            } else {
                handleAllotments($pdo);
            }
            break;
            
        case 'refunds':
            if ($sub_endpoint === 'process' && $request_method === 'POST') {
                handleProcessRefunds($pdo);
            } else {
                handleRefunds($pdo);
            }
            break;
            
        case 'health-check':
            handleHealthCheck($pdo);
            break;
            
        case 'test':
            handleTests($pdo, $sub_endpoint);
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// Handler functions
function handleStats($pdo) {
    $stats = [];
    
    // Count IPOs
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM Company");
    $stats['total_ipos'] = $stmt->fetch()['count'];
    
    // Count Applicants
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM Applicant");
    $stats['total_applicants'] = $stmt->fetch()['count'];
    
    // Count Applications
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM Application");
    $stats['total_applications'] = $stmt->fetch()['count'];
    
    // Count Allotments
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM Allotment");
    $stats['total_allotments'] = $stmt->fetch()['count'];
    
    echo json_encode($stats);
}

function handleIPOs($pdo) {
    $stmt = $pdo->query("
        SELECT ipo_id, company_name, total_shares, price_per_share, 
               issue_start_date, issue_end_date, status
        FROM Company 
        ORDER BY ipo_id
    ");
    
    echo json_encode($stmt->fetchAll());
}

function handleIPOsDetailed($pdo) {
    $stmt = $pdo->query("SELECT * FROM vw_ipo_overview ORDER BY ipo_id");
    $ipos = $stmt->fetchAll();
    
    // Convert numeric fields
    foreach ($ipos as &$ipo) {
        $ipo['total_shares'] = (int)$ipo['total_shares'];
        $ipo['price_per_share'] = (float)$ipo['price_per_share'];
        $ipo['total_ipo_value'] = (float)$ipo['total_ipo_value'];
        $ipo['total_applications'] = (int)$ipo['total_applications'];
        $ipo['total_shares_applied'] = (int)$ipo['total_shares_applied'];
        $ipo['total_bid_amount'] = (float)$ipo['total_bid_amount'];
        $ipo['subscription_ratio'] = (float)$ipo['subscription_ratio'];
    }
    
    echo json_encode($ipos);
}

function handleApplications($pdo) {
    $stmt = $pdo->query("
        SELECT a.*, ap.full_name as applicant_name, c.company_name
        FROM Application a
        JOIN Applicant ap ON a.applicant_id = ap.applicant_id
        JOIN Company c ON a.ipo_id = c.ipo_id
        ORDER BY a.application_date DESC
    ");
    
    $applications = $stmt->fetchAll();
    
    // Convert numeric fields
    foreach ($applications as &$app) {
        $app['shares_requested'] = (int)$app['shares_requested'];
        $app['bid_amount'] = (float)$app['bid_amount'];
    }
    
    echo json_encode($applications);
}

function handleAllotments($pdo) {
    $stmt = $pdo->query("SELECT * FROM vw_allotment_report ORDER BY allotment_date DESC");
    $allotments = $stmt->fetchAll();
    
    // Convert numeric fields
    foreach ($allotments as &$allot) {
        $allot['shares_requested'] = (int)$allot['shares_requested'];
        $allot['shares_allotted'] = (int)$allot['shares_allotted'];
        $allot['bid_amount'] = (float)$allot['bid_amount'];
        $allot['allotment_amount'] = (float)$allot['allotment_amount'];
        $allot['allotment_ratio'] = (float)$allot['allotment_ratio'];
    }
    
    echo json_encode($allotments);
}

function handleProcessAllotment($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['ipo_id']) || !isset($input['method'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing ipo_id or method']);
        return;
    }
    
    $ipo_id = (int)$input['ipo_id'];
    $method = $input['method'];
    
    try {
        $stmt = $pdo->prepare("CALL process_ipo_allotment(?, ?)");
        $stmt->execute([$ipo_id, $method]);
        
        // Also process refunds automatically
        $stmt = $pdo->prepare("CALL auto_process_refunds_after_allotment(?)");
        $stmt->execute([$ipo_id]);
        
        echo json_encode(['success' => true, 'message' => 'Allotment processed successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Allotment processing failed: ' . $e->getMessage()]);
    }
}

function handleRefunds($pdo) {
    $stmt = $pdo->query("SELECT * FROM vw_refund_summary WHERE refund_amount > 0 ORDER BY refund_date DESC");
    $refunds = $stmt->fetchAll();
    
    // Convert numeric fields
    foreach ($refunds as &$refund) {
        $refund['original_bid'] = (float)$refund['original_bid'];
        $refund['amount_allocated'] = (float)$refund['amount_allocated'];
        $refund['gross_refund'] = (float)$refund['gross_refund'];
        $refund['processing_charges'] = (float)$refund['processing_charges'];
        $refund['net_refund'] = (float)$refund['net_refund'];
    }
    
    echo json_encode($refunds);
}

function handleProcessRefunds($pdo) {
    try {
        // Process refunds for all IPOs
        $stmt = $pdo->query("SELECT ipo_id FROM Company");
        $ipos = $stmt->fetchAll();
        
        foreach ($ipos as $ipo) {
            $stmt = $pdo->prepare("CALL bulk_process_refunds(?)");
            $stmt->execute([$ipo['ipo_id']]);
        }
        
        echo json_encode(['success' => true, 'message' => 'All refunds processed successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Refund processing failed: ' . $e->getMessage()]);
    }
}

function handleHealthCheck($pdo) {
    $checks = [];
    
    // Check database connection
    try {
        $stmt = $pdo->query("SELECT 1");
        $checks[] = [
            'component' => 'Database Connection',
            'status' => 'OK',
            'details' => 'Connected successfully'
        ];
    } catch (Exception $e) {
        $checks[] = [
            'component' => 'Database Connection',
            'status' => 'ERROR',
            'details' => $e->getMessage()
        ];
    }
    
    // Check tables exist
    $required_tables = ['Company', 'Applicant', 'Application', 'Allotment', 'Refund'];
    foreach ($required_tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
            $count = $stmt->fetch()['COUNT(*)'];
            $checks[] = [
                'component' => "Table: $table",
                'status' => 'OK',
                'details' => "$count records"
            ];
        } catch (Exception $e) {
            $checks[] = [
                'component' => "Table: $table",
                'status' => 'ERROR',
                'details' => $e->getMessage()
            ];
        }
    }
    
    // Check views exist
    $required_views = ['vw_ipo_overview', 'vw_allotment_report', 'vw_refund_summary'];
    foreach ($required_views as $view) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM $view");
            $count = $stmt->fetch()['COUNT(*)'];
            $checks[] = [
                'component' => "View: $view",
                'status' => 'OK',
                'details' => "$count records"
            ];
        } catch (Exception $e) {
            $checks[] = [
                'component' => "View: $view",
                'status' => 'ERROR',
                'details' => $e->getMessage()
            ];
        }
    }
    
    echo json_encode(['checks' => $checks]);
}

function handleTests($pdo, $test_type) {
    switch ($test_type) {
        case 'connection':
            try {
                $stmt = $pdo->query("SELECT VERSION() as version");
                $version = $stmt->fetch()['version'];
                echo json_encode([
                    'success' => true,
                    'message' => "Connected to MySQL version: $version"
                ]);
            } catch (Exception $e) {
                throw new Exception("Connection test failed: " . $e->getMessage());
            }
            break;
            
        case 'validation':
            $tests = [];
            
            // Test PAN validation
            try {
                $stmt = $pdo->prepare("INSERT INTO Applicant (full_name, pan_number, demat_account_no) VALUES (?, ?, ?)");
                $stmt->execute(['Test User', 'INVALID123', 'IN300123456789']);
                $tests[] = [
                    'name' => 'PAN Validation',
                    'passed' => false,
                    'result' => 'FAILED - Invalid PAN was accepted'
                ];
            } catch (Exception $e) {
                $tests[] = [
                    'name' => 'PAN Validation',
                    'passed' => true,
                    'result' => 'PASSED - Invalid PAN was rejected'
                ];
            }
            
            // Test Demat validation
            try {
                $stmt = $pdo->prepare("INSERT INTO Applicant (full_name, pan_number, demat_account_no) VALUES (?, ?, ?)");
                $stmt->execute(['Test User', 'ABCDE1234F', 'INVALID123']);
                $tests[] = [
                    'name' => 'Demat Validation',
                    'passed' => false,
                    'result' => 'FAILED - Invalid Demat was accepted'
                ];
            } catch (Exception $e) {
                $tests[] = [
                    'name' => 'Demat Validation',
                    'passed' => true,
                    'result' => 'PASSED - Invalid Demat was rejected'
                ];
            }
            
            echo json_encode(['tests' => $tests]);
            break;
            
        case 'procedures':
            $tests = [];
            
            // Test procedure exists
            $procedures = ['process_ipo_allotment', 'calculate_oversubscription_ratio', 'process_ipo_refunds'];
            foreach ($procedures as $proc) {
                try {
                    $stmt = $pdo->query("SHOW PROCEDURE STATUS WHERE Name = '$proc'");
                    $result = $stmt->fetch();
                    if ($result) {
                        $tests[] = [
                            'name' => "Procedure: $proc",
                            'passed' => true,
                            'result' => 'EXISTS'
                        ];
                    } else {
                        $tests[] = [
                            'name' => "Procedure: $proc",
                            'passed' => false,
                            'result' => 'NOT FOUND'
                        ];
                    }
                } catch (Exception $e) {
                    $tests[] = [
                        'name' => "Procedure: $proc",
                        'passed' => false,
                        'result' => 'ERROR: ' . $e->getMessage()
                    ];
                }
            }
            
            echo json_encode(['tests' => $tests]);
            break;
            
        case 'views':
            $tests = [];
            
            $views = ['vw_ipo_overview', 'vw_allotment_report', 'vw_refund_summary', 'vw_oversubscription_analysis'];
            foreach ($views as $view) {
                try {
                    $stmt = $pdo->query("SELECT COUNT(*) as count FROM $view");
                    $count = $stmt->fetch()['count'];
                    $tests[] = [
                        'name' => "View: $view",
                        'passed' => true,
                        'result' => "ACCESSIBLE ($count records)"
                    ];
                } catch (Exception $e) {
                    $tests[] = [
                        'name' => "View: $view",
                        'passed' => false,
                        'result' => 'ERROR: ' . $e->getMessage()
                    ];
                }
            }
            
            echo json_encode(['tests' => $tests]);
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Test type not found']);
            break;
    }
}
?>