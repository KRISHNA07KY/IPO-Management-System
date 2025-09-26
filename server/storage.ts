import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { 
  type Company, 
  type Applicant, 
  type Application, 
  type Allotment, 
  type Refund,
  type InsertCompany,
  type InsertApplicant,
  type InsertApplication,
  type InsertAllotment,
  type InsertRefund
} from "@shared/schema";

export interface IStorage {
  // Company methods
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  getActiveCompany(): Promise<Company | undefined>;
  
  // Applicant methods
  getApplicant(id: number): Promise<Applicant | undefined>;
  getApplicantByPan(pan: string): Promise<Applicant | undefined>;
  getApplicantByDemat(dematNo: string): Promise<Applicant | undefined>;
  createApplicant(applicant: InsertApplicant): Promise<Applicant>;
  
  // Application methods
  getApplication(id: number): Promise<Application | undefined>;
  getApplications(): Promise<Application[]>;
  getApplicationsByCompany(companyId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  
  // Allotment methods
  getAllotment(id: number): Promise<Allotment | undefined>;
  getAllotmentByApplication(applicationId: number): Promise<Allotment | undefined>;
  getAllotments(): Promise<Allotment[]>;
  createAllotment(allotment: InsertAllotment): Promise<Allotment>;
  
  // Refund methods
  getRefund(id: number): Promise<Refund | undefined>;
  getRefundByAllotment(allotmentId: number): Promise<Refund | undefined>;
  getRefunds(): Promise<Refund[]>;
  createRefund(refund: InsertRefund): Promise<Refund>;
  
  // Dashboard data
  getDashboardData(): Promise<any>;
  getApplicationsWithDetails(): Promise<any[]>;
  getAllotmentResults(): Promise<any[]>;
  
  // Settings methods
  getSettings(): Promise<any>;
  updateSettings(key: string, value: any): Promise<void>;
  
  // Utility methods
  calculateAllotments(companyId: number): Promise<void>;
  calculateRefunds(companyId: number): Promise<void>;
  getCompanies(): Promise<Company[]>;
  resetAllData(): Promise<void>;
}

export class SqliteStorage implements IStorage {
  private db: Database.Database;

  constructor() {
    // Ensure db directory exists
    const dbDir = path.resolve(process.cwd(), "db");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.resolve(dbDir, "database.sqlite");
    this.db = new Database(dbPath);
    this.initTables();
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        total_shares INTEGER NOT NULL,
        price REAL NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS applicants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        pan TEXT NOT NULL UNIQUE,
        demat_no TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        applicant_id INTEGER NOT NULL REFERENCES applicants(id),
        company_id INTEGER NOT NULL REFERENCES companies(id),
        shares_req INTEGER NOT NULL,
        amount REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS allotments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL UNIQUE REFERENCES applications(id),
        shares_alloted INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS refunds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        allotment_id INTEGER NOT NULL UNIQUE REFERENCES allotments(id),
        amount REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        name,
        total_shares as totalShares,
        price,
        start_date as startDate,
        end_date as endDate
      FROM companies 
      WHERE id = ?
    `);
    return stmt.get(id) as Company | undefined;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const stmt = this.db.prepare(`
      INSERT INTO companies (name, total_shares, price, start_date, end_date)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(company.name, company.totalShares, company.price, company.startDate, company.endDate);
    return { id: result.lastInsertRowid as number, ...company };
  }

  async getActiveCompany(): Promise<Company | undefined> {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        name,
        total_shares as totalShares,
        price,
        start_date as startDate,
        end_date as endDate
      FROM companies 
      ORDER BY id DESC 
      LIMIT 1
    `);
    return stmt.get() as Company | undefined;
  }

  async getApplicant(id: number): Promise<Applicant | undefined> {
    const stmt = this.db.prepare("SELECT * FROM applicants WHERE id = ?");
    return stmt.get(id) as Applicant | undefined;
  }

  async getApplicantByPan(pan: string): Promise<Applicant | undefined> {
    const stmt = this.db.prepare("SELECT * FROM applicants WHERE pan = ?");
    return stmt.get(pan) as Applicant | undefined;
  }

  async getApplicantByDemat(dematNo: string): Promise<Applicant | undefined> {
    const stmt = this.db.prepare("SELECT * FROM applicants WHERE demat_no = ?");
    return stmt.get(dematNo) as Applicant | undefined;
  }

  async createApplicant(applicant: InsertApplicant): Promise<Applicant> {
    const stmt = this.db.prepare(`
      INSERT INTO applicants (name, pan, demat_no)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(applicant.name, applicant.pan, applicant.dematNo);
    return { id: result.lastInsertRowid as number, ...applicant };
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const stmt = this.db.prepare("SELECT * FROM applications WHERE id = ?");
    return stmt.get(id) as Application | undefined;
  }

  async getApplications(): Promise<Application[]> {
    const stmt = this.db.prepare("SELECT * FROM applications");
    return stmt.all() as Application[];
  }

  async getApplicationsByCompany(companyId: number): Promise<Application[]> {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        applicant_id as applicantId,
        company_id as companyId,
        shares_req as sharesReq,
        amount
      FROM applications 
      WHERE company_id = ?
    `);
    return stmt.all(companyId) as Application[];
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const stmt = this.db.prepare(`
      INSERT INTO applications (applicant_id, company_id, shares_req, amount)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(application.applicantId, application.companyId, application.sharesReq, application.amount);
    return { id: result.lastInsertRowid as number, ...application };
  }

  async getAllotment(id: number): Promise<Allotment | undefined> {
    const stmt = this.db.prepare("SELECT * FROM allotments WHERE id = ?");
    return stmt.get(id) as Allotment | undefined;
  }

  async getAllotmentByApplication(applicationId: number): Promise<Allotment | undefined> {
    const stmt = this.db.prepare("SELECT * FROM allotments WHERE application_id = ?");
    return stmt.get(applicationId) as Allotment | undefined;
  }

  async getAllotments(): Promise<Allotment[]> {
    const stmt = this.db.prepare("SELECT * FROM allotments");
    return stmt.all() as Allotment[];
  }

  async createAllotment(allotment: InsertAllotment): Promise<Allotment> {
    // Validate inputs
    if (!allotment.applicationId || allotment.sharesAlloted == null || allotment.sharesAlloted < 0) {
      throw new Error(`Invalid allotment data: applicationId=${allotment.applicationId}, sharesAlloted=${allotment.sharesAlloted}`);
    }

    const stmt = this.db.prepare(`
      INSERT INTO allotments (application_id, shares_alloted)
      VALUES (?, ?)
    `);
    
    try {
      const result = stmt.run(allotment.applicationId, allotment.sharesAlloted);
      return { id: result.lastInsertRowid as number, ...allotment };
    } catch (error) {
      console.error('Error creating allotment:', error);
      console.error('Allotment data:', allotment);
      throw error;
    }
  }

  async getRefund(id: number): Promise<Refund | undefined> {
    const stmt = this.db.prepare("SELECT * FROM refunds WHERE id = ?");
    return stmt.get(id) as Refund | undefined;
  }

  async getRefundByAllotment(allotmentId: number): Promise<Refund | undefined> {
    const stmt = this.db.prepare("SELECT * FROM refunds WHERE allotment_id = ?");
    return stmt.get(allotmentId) as Refund | undefined;
  }

  async getRefunds(): Promise<Refund[]> {
    const stmt = this.db.prepare("SELECT * FROM refunds");
    return stmt.all() as Refund[];
  }

  async createRefund(refund: InsertRefund): Promise<Refund> {
    const stmt = this.db.prepare(`
      INSERT INTO refunds (allotment_id, amount)
      VALUES (?, ?)
    `);
    const result = stmt.run(refund.allotmentId, refund.amount);
    return { id: result.lastInsertRowid as number, ...refund };
  }

  async getDashboardData(): Promise<any> {
    const company = await this.getActiveCompany();
    if (!company) return null;

    const totalApplicationsStmt = this.db.prepare("SELECT COUNT(*) as count FROM applications WHERE company_id = ?");
    const totalSharesReqStmt = this.db.prepare("SELECT SUM(shares_req) as total FROM applications WHERE company_id = ?");
    const totalAmountStmt = this.db.prepare("SELECT SUM(amount) as total FROM applications WHERE company_id = ?");
    const totalRefundsStmt = this.db.prepare(`
      SELECT SUM(r.amount) as total FROM refunds r
      JOIN allotments a ON r.allotment_id = a.id
      JOIN applications app ON a.application_id = app.id
      WHERE app.company_id = ?
    `);

    const totalApplications = (totalApplicationsStmt.get(company.id) as any)?.count || 0;
    const totalSharesReq = (totalSharesReqStmt.get(company.id) as any)?.total || 0;
    const totalAmount = (totalAmountStmt.get(company.id) as any)?.total || 0;
    const totalRefunds = (totalRefundsStmt.get(company.id) as any)?.total || 0;

    const oversubscriptionRatio = company.totalShares > 0 ? (totalSharesReq / company.totalShares) : 0;

    return {
      company,
      totalApplications,
      totalSharesReq,
      totalAmount,
      totalRefunds,
      oversubscriptionRatio,
    };
  }

  async getApplicationsWithDetails(): Promise<any[]> {
    const stmt = this.db.prepare(`
      SELECT 
        app.id,
        app.applicant_id,
        app.company_id,
        app.shares_req,
        app.amount,
        applicant.name as applicant_name,
        applicant.pan,
        applicant.demat_no,
        c.name as company_name,
        c.price,
        allot.shares_alloted,
        ref.amount as refund_amount
      FROM applications app
      JOIN applicants applicant ON app.applicant_id = applicant.id
      JOIN companies c ON app.company_id = c.id
      LEFT JOIN allotments allot ON app.id = allot.application_id
      LEFT JOIN refunds ref ON allot.id = ref.allotment_id
      ORDER BY app.id DESC
    `);
    return stmt.all();
  }

  async getAllotmentResults(): Promise<any[]> {
    const stmt = this.db.prepare(`
      SELECT 
        app.id,
        app.applicant_id,
        app.company_id,
        app.shares_req,
        app.amount,
        applicant.name as applicant_name,
        applicant.pan,
        applicant.demat_no,
        c.price,
        allot.application_id,
        allot.shares_alloted,
        ref.amount as refund_amount,
        CASE 
          WHEN allot.id IS NULL THEN 'Pending'
          WHEN ref.id IS NULL THEN 'Allotted'
          ELSE 'Processed'
        END as status
      FROM applications app
      JOIN applicants applicant ON app.applicant_id = applicant.id
      JOIN companies c ON app.company_id = c.id
      LEFT JOIN allotments allot ON app.id = allot.application_id
      LEFT JOIN refunds ref ON allot.id = ref.allotment_id
      ORDER BY app.id DESC
    `);
    return stmt.all();
  }

  async calculateAllotments(companyId: number): Promise<void> {
    const company = await this.getCompany(companyId);
    if (!company) throw new Error("Company not found");

    // Clear existing allotments and refunds for this company first
    const clearRefundsStmt = this.db.prepare(`
      DELETE FROM refunds 
      WHERE allotment_id IN (
        SELECT allot.id FROM allotments allot
        JOIN applications app ON allot.application_id = app.id
        WHERE app.company_id = ?
      )
    `);
    clearRefundsStmt.run(companyId);

    const clearAllotmentsStmt = this.db.prepare(`
      DELETE FROM allotments 
      WHERE application_id IN (
        SELECT id FROM applications WHERE company_id = ?
      )
    `);
    clearAllotmentsStmt.run(companyId);

    const applications = await this.getApplicationsByCompany(companyId);
    const totalDemand = applications.reduce((sum, app) => sum + app.sharesReq, 0);

    if (totalDemand <= company.totalShares) {
      // Full allotment
      for (const app of applications) {
        await this.createAllotment({
          applicationId: app.id,
          sharesAlloted: app.sharesReq,
        });
      }
    } else {
      // Pro-rata allotment
      const allotmentRatio = company.totalShares / totalDemand;
      
      for (const app of applications) {
        const sharesAlloted = Math.floor(app.sharesReq * allotmentRatio);
        await this.createAllotment({
          applicationId: app.id,
          sharesAlloted: sharesAlloted, // Ensure we're passing a valid number
        });
      }
    }
  }

  async calculateRefunds(companyId: number): Promise<void> {
    const company = await this.getCompany(companyId);
    if (!company) throw new Error("Company not found");

    const stmt = this.db.prepare(`
      SELECT 
        app.*,
        allot.shares_alloted
      FROM applications app
      JOIN allotments allot ON app.id = allot.application_id
      WHERE app.company_id = ?
    `);
    
    const allottedApplications = stmt.all(companyId);

    for (const app of allottedApplications) {
      const appData = app as any;
      const refundShares = appData.sharesReq - appData.shares_alloted;
      if (refundShares > 0) {
        const refundAmount = refundShares * company.price;
        
        const allotment = await this.getAllotmentByApplication(appData.id);
        if (allotment) {
          await this.createRefund({
            allotmentId: allotment.id,
            amount: refundAmount,
          });
        }
      }
    }
  }

  async getCompanies(): Promise<Company[]> {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        name,
        total_shares as totalShares,
        price,
        start_date as startDate,
        end_date as endDate
      FROM companies 
      ORDER BY id DESC
    `);
    return stmt.all() as Company[];
  }

  async resetAllData(): Promise<void> {
    this.db.exec(`
      DELETE FROM refunds;
      DELETE FROM allotments;
      DELETE FROM applications;
      DELETE FROM applicants;
      DELETE FROM companies;
      DELETE FROM settings;
    `);
  }

  async getSettings(): Promise<any> {
    const stmt = this.db.prepare("SELECT key, value FROM settings");
    const rows = stmt.all() as { key: string; value: string }[];
    
    // Default settings structure
    const defaultSettings = {
      company: {
        companyName: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        defaultIpoPrice: 100,
        defaultIpoShares: 100000,
      },
      system: {
        enableNotifications: true,
        autoAllotment: false,
        autoRefunds: false,
        emailNotifications: false,
        maxApplicationsPerUser: 1,
        defaultAllotmentMode: "pro-rata",
        theme: "system",
      },
      security: {
        requireStrongPassword: true,
        sessionTimeout: 60,
        enableTwoFactor: false,
        auditLogging: true,
      },
    };

    // Merge stored settings with defaults
    const settings = { ...defaultSettings };
    rows.forEach(row => {
      try {
        const [section, field] = row.key.split('.');
        if (settings[section as keyof typeof settings] && field) {
          (settings[section as keyof typeof settings] as any)[field] = JSON.parse(row.value);
        }
      } catch (error) {
        console.warn(`Failed to parse setting ${row.key}:`, error);
      }
    });

    return settings;
  }

  async updateSettings(key: string, value: any): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    if (typeof value === 'object') {
      // Handle nested settings objects
      for (const [subKey, subValue] of Object.entries(value)) {
        stmt.run(`${key}.${subKey}`, JSON.stringify(subValue));
      }
    } else {
      stmt.run(key, JSON.stringify(value));
    }
  }
}

export const storage = new SqliteStorage();
