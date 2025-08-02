import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertPersonSchema, insertEmailStatSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Companies routes
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      res.status(400).json({ message: "Invalid company data" });
    }
  });

  app.patch("/api/companies/:id", async (req, res) => {
    try {
      const updates = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(req.params.id, updates);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCompany(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // People routes
  app.get("/api/people", async (req, res) => {
    try {
      const { companyId } = req.query;
      let people;
      
      if (companyId) {
        people = await storage.getPeopleByCompany(companyId as string);
      } else {
        people = await storage.getPeople();
      }
      
      res.json(people);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch people" });
    }
  });

  app.get("/api/people/:id", async (req, res) => {
    try {
      const person = await storage.getPerson(req.params.id);
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      res.json(person);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch person" });
    }
  });

  app.post("/api/people", async (req, res) => {
    try {
      const validatedData = insertPersonSchema.parse(req.body);
      const person = await storage.createPerson(validatedData);
      res.status(201).json(person);
    } catch (error) {
      res.status(400).json({ message: "Invalid person data" });
    }
  });

  app.patch("/api/people/:id", async (req, res) => {
    try {
      const updates = insertPersonSchema.partial().parse(req.body);
      const person = await storage.updatePerson(req.params.id, updates);
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      res.json(person);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/people/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePerson(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Person not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete person" });
    }
  });

  // Email stats routes
  app.get("/api/email-stats", async (req, res) => {
    try {
      const { personId } = req.query;
      let emailStats;
      
      if (personId) {
        emailStats = await storage.getEmailStatsByPerson(personId as string);
      } else {
        emailStats = await storage.getEmailStats();
      }
      
      res.json(emailStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email stats" });
    }
  });

  app.post("/api/email-stats", async (req, res) => {
    try {
      const validatedData = insertEmailStatSchema.parse(req.body);
      const emailStat = await storage.createEmailStat(validatedData);
      res.status(201).json(emailStat);
    } catch (error) {
      res.status(400).json({ message: "Invalid email stat data" });
    }
  });

  // Stats endpoint for dashboard
  app.get("/api/stats", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      const people = await storage.getPeople();
      const emailStats = await storage.getEmailStats();

      const totalEmails = companies.reduce((sum, company) => sum + company.totalEmails, 0);
      const totalOpens = companies.reduce((sum, company) => sum + company.openCount, 0);
      const totalClicks = companies.reduce((sum, company) => sum + company.clickCount, 0);
      const totalResponses = companies.filter(company => company.hasResponded).length;

      res.json({
        totalEmails,
        totalOpens,
        totalClicks,
        totalResponses,
        companies,
        people,
        emailStats,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
