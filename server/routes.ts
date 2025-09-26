import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { applicationFormSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed sample data
  app.post("/api/seed", async (req, res) => {
    try {
      await storage.seedData();
      res.json({ success: true, message: "Sample data seeded successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to seed data", details: (error as Error).message });
    }
  });

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

      await storage.calculateAllotments(company.id);
      res.json({ success: true, message: "Allotment process completed successfully" });
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
