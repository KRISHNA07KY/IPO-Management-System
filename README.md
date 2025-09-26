# IPO Management System

A comprehensive full-stack web application for managing Initial Public Offerings (IPOs), built with React, TypeScript, Express.js, and SQLite.

## 🚀 Features

### For Companies
- **IPO Creation**: Launch new IPOs with total shares, pricing, and timeline
- **Application Management**: View and track all investor applications
- **Automated Allotment**: Pro-rata share allocation based on demand vs supply
- **Refund Calculation**: Automatic refund computation for excess applications
- **Comprehensive Reports**: Dashboard with oversubscription ratios, financial summaries

### For Investors
- **Application Submission**: Simple form to apply for IPO shares
- **PAN & Demat Validation**: Built-in validation for Indian financial identifiers
- **Application Status**: Track share requests, allotments, and refunds
- **Dashboard View**: Complete overview of application results

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **React Hook Form** with Zod validation
- **TanStack Query** for state management
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **better-sqlite3** for database operations
- **Zod** for API validation
- **Vite** for development server

### Database
- **SQLite** database stored at `db/ipo.db`
- Raw SQL queries (no ORM)
- Full ACID compliance

## 📊 Database Schema

```sql
-- Companies table
CREATE TABLE companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  total_shares INTEGER NOT NULL,
  price REAL NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL
);

-- Applicants table
CREATE TABLE applicants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  pan TEXT NOT NULL UNIQUE,
  demat_no TEXT NOT NULL UNIQUE
);

-- Applications table
CREATE TABLE applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  applicant_id INTEGER NOT NULL REFERENCES applicants(id),
  company_id INTEGER NOT NULL REFERENCES companies(id),
  shares_req INTEGER NOT NULL,
  amount REAL NOT NULL
);

-- Allotments table
CREATE TABLE allotments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL UNIQUE REFERENCES applications(id),
  shares_alloted INTEGER NOT NULL
);

-- Refunds table
CREATE TABLE refunds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  allotment_id INTEGER NOT NULL UNIQUE REFERENCES allotments(id),
  amount REAL NOT NULL
);
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IPOSystem
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   Navigate to `http://localhost:5000` in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript checks

## 🎯 Usage Guide

### 1. Initial Setup
1. Start the application
2. Configure system settings in the Settings page
3. Explore the dashboard to see overview metrics

### 2. Creating an IPO
1. Click "New IPO" button in dashboard
2. Fill in company details, shares, and pricing
3. Set IPO timeline (start and end dates)
4. Submit to create the IPO

### 3. Investor Applications
1. Navigate to "Apply for IPO"
2. Enter investor details:
   - Full name
   - PAN number (format: ABCDE1234F)
   - Demat account number (16 digits)
   - Number of shares requested
3. Submit application

### 4. Processing Allotments
1. Go to Dashboard or Allotments page
2. Click "Run Allotment Process"
   - If demand ≤ supply: Full allocation
   - If demand > supply: Pro-rata allocation
3. Click "Calculate Refunds" to process excess amounts

### 5. Viewing Reports
1. Navigate to "Reports" page
2. View comprehensive analytics:
   - Oversubscription ratios
   - Financial summaries
   - Detailed allotment results
3. Export reports as needed

## 🔍 Key Features Explained

### Pro-rata Allotment Logic
```javascript
if (totalDemand <= company.totalShares) {
  // Full allotment - everyone gets what they requested
  sharesAlloted = sharesRequested;
} else {
  // Pro-rata allotment based on oversubscription
  allotmentRatio = company.totalShares / totalDemand;
  sharesAlloted = Math.floor(sharesRequested * allotmentRatio);
}
```

### Refund Calculation
```javascript
refundAmount = (sharesRequested - sharesAlloted) * pricePerShare;
```

### Validation Rules
- **PAN Format**: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
- **Demat Number**: Minimum 16 characters
- **Unique Constraints**: PAN and Demat numbers must be unique
- **Share Requests**: Minimum 1 share required

## 📁 Project Structure

```
IPOSystem/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utilities and configurations
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   └── vite.ts            # Vite development setup
├── shared/                # Shared types and schemas
│   └── schema.ts          # Zod schemas and TypeScript types
├── db/                    # SQLite database
│   └── ipo.db            # Database file (auto-created)
└── package.json          # Dependencies and scripts
```

## 🔧 API Endpoints

### Company Management
- `POST /api/companies` - Create new IPO
- `GET /api/dashboard` - Get dashboard data

### Application Management
- `GET /api/applications` - Get all applications
- `POST /api/applications` - Submit new application

### Allotment Processing
- `POST /api/allotment` - Run allotment process
- `POST /api/refunds` - Calculate refunds
- `GET /api/allotments` - Get allotment results

### Configuration
- `GET /api/settings` - Get system settings
- `PUT /api/settings` - Update system settings

## 💡 Business Logic

### Validation Rules
1. **PAN Number**: Must follow Indian PAN format (AAAAA1111A)
2. **Demat Account**: Must be unique and at least 16 characters
3. **No Duplicate Applications**: Same PAN/Demat cannot apply twice
4. **Share Limits**: Minimum 1 share per application

### Allotment Process
1. **Calculate Total Demand**: Sum all share requests
2. **Compare with Supply**: Check against total available shares
3. **Allocation Logic**:
   - If demand ≤ supply: Full allocation
   - If demand > supply: Pro-rata based on ratio
4. **Refund Calculation**: Automatic for unallotted shares

## 🚀 Production Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
- `NODE_ENV`: Set to "production" for production builds
- `PORT`: Server port (default: 5000)

### Database
- SQLite database file at `db/database.sqlite`
- Can be opened with DB Browser for SQLite
- Automatic table creation on first run

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🛠️ Development Notes

### Hot Reloading
- Frontend changes automatically refresh
- Backend changes restart the server
- Database changes persist across restarts

### Debugging
- Use browser DevTools for frontend debugging
- Server logs show API request/response details
- SQLite database can be inspected with external tools

### Testing
- Manual testing through web interface
- API endpoints can be tested with curl/Postman
- Database integrity maintained through foreign keys

---

## 📞 Support

For questions or issues, please create an issue in the repository or contact the development team.

**Happy IPO Management! 🎉**