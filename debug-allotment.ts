// Debug script to check current database state and allotment process
import { SqliteStorage } from "./server/storage.js";

async function debugAllotmentIssue() {
  const storage = new SqliteStorage();
  
  console.log("=== Database State Analysis ===\n");
  
  try {
    // Get current company
    const company = await storage.getActiveCompany();
    console.log("Active Company:", company);
    
    if (company) {
      // Get applications
      const applications = await storage.getApplicationsByCompany(company.id);
      console.log(`\nApplications for company ${company.id}:`, applications.length);
      applications.forEach((app, index) => {
        console.log(`  ${index + 1}. ID: ${app.id}, Applicant: ${app.applicantId}, Shares: ${app.sharesReq}`);
      });
      
      // Get existing allotments
      const allotments = await storage.getAllotmentResults();
      console.log(`\nExisting Allotments:`, allotments.length);
      allotments.forEach((allot, index) => {
        console.log(`  ${index + 1}. App ID: ${allot.application_id}, Shares Allotted: ${allot.shares_alloted}`);
      });
      
      // Calculate total demand
      const totalDemand = applications.reduce((sum, app) => sum + app.sharesReq, 0);
      console.log(`\nTotal Demand: ${totalDemand}`);
      console.log(`Available Shares: ${company.totalShares}`);
      console.log(`Oversubscription Ratio: ${(totalDemand / company.totalShares).toFixed(2)}x`);
      
      // Try to run allotment calculation with detailed logging
      console.log("\n=== Testing Allotment Process ===");
      await storage.calculateAllotments(company.id);
      console.log("✅ Allotment process completed successfully!");
      
      // Get updated allotments
      const newAllotments = await storage.getAllotmentResults();
      console.log(`\nNew Allotments:`, newAllotments.length);
      newAllotments.forEach((allot, index) => {
        console.log(`  ${index + 1}. App ID: ${allot.application_id}, Shares Allotted: ${allot.shares_alloted}`);
      });
      
    } else {
      console.log("No active company found");
    }
    
  } catch (error) {
    console.error("❌ Error during analysis:", error);
    console.error("Error details:", (error as Error).message);
    console.error("Stack trace:", (error as Error).stack);
  }
}

debugAllotmentIssue().catch(console.error);