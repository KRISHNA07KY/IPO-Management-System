import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { applicationFormSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const data = await storage.getDashboardData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard data", details: (error as Error).message });
    }
  });

  // Get all applications with details
  app.get("/api/applications", async (req, res) => {
    try {
      const applications = await storage.getApplicationsWithDetails();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications", details: (error as Error).message });
    }
  });

  // Submit new application
  app.post("/api/applications", async (req, res) => {
    try {
      const validatedData = applicationFormSchema.parse(req.body);
      
      // Check if PAN already exists
      const existingByPan = await storage.getApplicantByPan(validatedData.pan);
      if (existingByPan) {
        return res.status(400).json({ error: "PAN number already exists" });
      }

      // Check if Demat number already exists
      const existingByDemat = await storage.getApplicantByDemat(validatedData.dematNo);
      if (existingByDemat) {
        return res.status(400).json({ error: "Demat number already exists" });
      }

      // Get active company
      const company = await storage.getActiveCompany();
      if (!company) {
        return res.status(400).json({ error: "No active IPO found" });
      }

      // Create applicant
      const applicant = await storage.createApplicant({
        name: validatedData.name,
        pan: validatedData.pan,
        dematNo: validatedData.dematNo,
      });

      // Create application
      const application = await storage.createApplication({
        applicantId: applicant.id,
        companyId: company.id,
        sharesReq: validatedData.sharesReq,
        amount: validatedData.sharesReq * company.price,
      });

      res.json({ 
        success: true, 
        message: "Application submitted successfully",
        application 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Failed to submit application", details: (error as Error).message });
    }
  });

  // Run allotment process
  app.post("/api/allotment", async (req, res) => {
    try {
      const company = await storage.getActiveCompany();
      if (!company) {
        return res.status(400).json({ error: "No active IPO found" });
      }

      console.log(`Running allotment for company: ${company.name} (ID: ${company.id})`);
      
      // Check if there are applications
      const applications = await storage.getApplicationsByCompany(company.id);
      console.log(`Found ${applications.length} applications`);
      
      if (applications.length === 0) {
        return res.status(400).json({ error: "No applications found for allotment" });
      }

      await storage.calculateAllotments(company.id);
      res.json({ success: true, message: "Allotment process completed successfully" });
    } catch (error) {
      console.error('Allotment process error:', error);
      res.status(500).json({ error: "Failed to run allotment process", details: (error as Error).message });
    }
  });

  // Calculate refunds
  app.post("/api/refunds", async (req, res) => {
    try {
      const company = await storage.getActiveCompany();
      if (!company) {
        return res.status(400).json({ error: "No active IPO found" });
      }

      await storage.calculateRefunds(company.id);
      res.json({ success: true, message: "Refunds calculated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate refunds", details: (error as Error).message });
    }
  });

  // Get allotment results
  app.get("/api/allotments", async (req, res) => {
    try {
      const results = await storage.getAllotmentResults();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch allotment results", details: (error as Error).message });
    }
  });

  // Create new company/IPO
  app.post("/api/companies", async (req, res) => {
    try {
      const { name, totalShares, price, startDate, endDate } = req.body;
      
      if (!name || !totalShares || !price || !startDate || !endDate) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const company = await storage.createCompany({
        name,
        totalShares: parseInt(totalShares),
        price: parseFloat(price),
        startDate,
        endDate,
      });

      res.json({ success: true, message: "IPO created successfully", company });
    } catch (error) {
      res.status(500).json({ error: "Failed to create IPO", details: (error as Error).message });
    }
  });

  // Settings endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      res.status(500).json({ error: "Failed to fetch settings", details: (error as Error).message });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const settingsUpdate = req.body;
      
      // Update each section of settings
      for (const [key, value] of Object.entries(settingsUpdate)) {
        await storage.updateSettings(key, value);
      }
      
      // Return updated settings
      const updatedSettings = await storage.getSettings();
      res.json({ success: true, message: "Settings updated successfully", settings: updatedSettings });
    } catch (error) {
      console.error("Failed to update settings:", error);
      res.status(500).json({ error: "Failed to update settings", details: (error as Error).message });
    }
  });

  // Export data - all data
  app.get("/api/export", async (req, res) => {
    try {
      const data = {
        companies: await storage.getCompanies(),
        applications: await storage.getApplicationsWithDetails(),
        allotments: await storage.getAllotmentResults(),
        exportDate: new Date().toISOString(),
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="ipo-data-export.json"');
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to export data", details: (error as Error).message });
    }
  });

  // Export specific report type
  app.get("/api/export/:type", async (req, res) => {
    try {
      const { type } = req.params;
      let data: any = {};
      
      switch (type) {
        case 'allotments':
          data = {
            allotments: await storage.getAllotmentResults(),
            summary: {
              totalAllotted: 0,
              totalRequested: 0,
              totalRefunds: 0,
            },
            exportDate: new Date().toISOString(),
            reportType: 'Allotment Report'
          };
          
          const allotments = data.allotments;
          data.summary.totalAllotted = allotments.reduce((sum: number, item: any) => sum + (item.shares_alloted || 0), 0);
          data.summary.totalRequested = allotments.reduce((sum: number, item: any) => sum + item.shares_req, 0);
          data.summary.totalRefunds = allotments.reduce((sum: number, item: any) => sum + (item.refund_amount || 0), 0);
          break;
          
        case 'applications':
          data = {
            applications: await storage.getApplicationsWithDetails(),
            exportDate: new Date().toISOString(),
            reportType: 'Applications Report'
          };
          break;
          
        case 'refunds':
          const refundData = await storage.getAllotmentResults();
          data = {
            refunds: refundData.filter((item: any) => (item.refund_amount || 0) > 0),
            totalRefundAmount: refundData.reduce((sum: number, item: any) => sum + (item.refund_amount || 0), 0),
            exportDate: new Date().toISOString(),
            reportType: 'Refunds Report'
          };
          break;
          
        default:
          data = {
            companies: await storage.getCompanies(),
            applications: await storage.getApplicationsWithDetails(),
            allotments: await storage.getAllotmentResults(),
            exportDate: new Date().toISOString(),
            reportType: 'Overview Report'
          };
      }
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to export report", details: (error as Error).message });
    }
  });

  // Reset all data
  app.post("/api/reset", async (req, res) => {
    try {
      // Clear all data
      await storage.resetAllData();
      res.json({ success: true, message: "All data has been reset successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset data", details: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
