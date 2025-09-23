const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = 8001;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
};

// Mock data for demonstration
const mockData = {
    stats: {
        total_ipos: 5,
        total_applicants: 1250,
        total_applications: 1250,
        total_allotments: 875,
        total_refund_amount: 25000000
    },
    ipos: [
        { id: 1, company_name: 'TechCorp Ltd', price_min: 100, price_max: 120, open_date: '2025-09-01', close_date: '2025-09-05', status: 'Closed' },
        { id: 2, company_name: 'GreenEnergy Inc', price_min: 250, price_max: 280, open_date: '2025-09-10', close_date: '2025-09-15', status: 'Open' },
        { id: 3, company_name: 'FinTech Solutions', price_min: 500, price_max: 550, open_date: '2025-09-20', close_date: '2025-09-25', status: 'Upcoming' }
    ],
    applications: [
        { id: 1, applicant_name: 'John Doe', ipo_id: 1, quantity: 100, bid_price: 110, status: 'Allocated' },
        { id: 2, applicant_name: 'Jane Smith', ipo_id: 1, quantity: 200, bid_price: 115, status: 'Pending' },
        { id: 3, applicant_name: 'Bob Johnson', ipo_id: 2, quantity: 50, bid_price: 260, status: 'Allocated' }
    ]
};

// API endpoint handlers
function handleApiRequest(req, res, pathname, query) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        switch (pathname) {
            case '/api/health':
            case '/api/health-check':
                res.writeHead(200);
                res.end(JSON.stringify({ 
                    status: 'success', 
                    message: 'API is working',
                    timestamp: new Date().toISOString(),
                    database: 'Mock data (PHP/MySQL not connected)',
                    endpoints: {
                        health: 'Working',
                        stats: 'Working',
                        ipos: 'Working',
                        applications: 'Working',
                        allotments: 'Working',
                        refunds: 'Working'
                    }
                }));
                break;

            case '/api/stats':
                console.log('Stats endpoint called, returning:', mockData.stats);
                res.writeHead(200);
                res.end(JSON.stringify({ 
                    status: 'success', 
                    data: mockData.stats 
                }));
                break;

            case '/api/ipos':
                console.log('IPOs endpoint called, returning:', mockData.ipos);
                res.writeHead(200);
                res.end(JSON.stringify({ 
                    status: 'success', 
                    data: mockData.ipos 
                }));
                break;

            case '/api/applications':
                res.writeHead(200);
                res.end(JSON.stringify({ 
                    status: 'success', 
                    data: mockData.applications 
                }));
                break;

            case '/api/allotments':
                res.writeHead(200);
                res.end(JSON.stringify({ 
                    status: 'success', 
                    data: mockData.applications.filter(app => app.status === 'Allocated')
                }));
                break;

            case '/api/refunds':
                res.writeHead(200);
                res.end(JSON.stringify({ 
                    status: 'success', 
                    data: []
                }));
                break;

            default:
                res.writeHead(404);
                res.end(JSON.stringify({ 
                    status: 'error', 
                    message: `API endpoint ${pathname} not found. Available endpoints: /api/health, /api/stats, /api/ipos, /api/applications, /api/allotments, /api/refunds` 
                }));
        }
    } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ 
            status: 'error', 
            message: 'Internal server error',
            error: error.message 
        }));
    }
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    console.log(`${req.method} ${pathname}`);

    // Handle API requests
    if (pathname.startsWith('/api/')) {
        handleApiRequest(req, res, pathname, query);
        return;
    }

    // Handle root request
    let requestPath = pathname;
    if (requestPath === '/') {
        requestPath = '/index.html';
    }

    const filePath = path.join(__dirname, requestPath);
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <h1>404 - File Not Found</h1>
                    <p>The requested file <code>${requestPath}</code> was not found.</p>
                    <p><a href="/index.html">Go to Main App</a> | <a href="/setup_demo.html">Go to Setup Demo</a></p>
                `);
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log('Available pages:');
    console.log(`  - http://localhost:${port}/setup_demo.html (Demo with setup instructions)`);
    console.log(`  - http://localhost:${port}/index.html (Full app - requires PHP backend)`);
    console.log('Press Ctrl+C to stop the server');
});