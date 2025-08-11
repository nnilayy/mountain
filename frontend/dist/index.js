// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  companies;
  people;
  emailStats;
  constructor() {
    this.companies = /* @__PURE__ */ new Map();
    this.people = /* @__PURE__ */ new Map();
    this.emailStats = /* @__PURE__ */ new Map();
    this.seedData();
  }
  seedData() {
    const mockCompanies = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "OpenAI",
        website: "openai.com",
        linkedin: "https://linkedin.com/company/openai",
        crunchbase: "https://crunchbase.com/organization/openai",
        totalEmails: 4,
        totalPeople: 4,
        lastAttempt: "2024-07-31",
        hasOpened: true,
        openCount: 3,
        // Number of people who opened emails (max = totalPeople)
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 2,
        // Number of people who opened resumes (max = totalPeople)
        hasResponded: false,
        decision: null
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Anthropic",
        website: "anthropic.com",
        linkedin: "https://linkedin.com/company/anthropic",
        crunchbase: "https://crunchbase.com/organization/anthropic",
        totalEmails: 3,
        totalPeople: 3,
        lastAttempt: "2024-07-29",
        hasOpened: true,
        openCount: 2,
        // Number of people who opened emails
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 2,
        // Number of people who opened resumes
        hasResponded: false,
        decision: null
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        name: "Stripe",
        website: "stripe.com",
        linkedin: "https://linkedin.com/company/stripe",
        crunchbase: "https://crunchbase.com/organization/stripe",
        totalEmails: 6,
        totalPeople: 3,
        lastAttempt: "2024-07-26",
        hasOpened: true,
        openCount: 2,
        // Number of people who opened emails
        hasClicked: true,
        clickCount: 2,
        resumeOpenCount: 2,
        // Number of people who opened resumes
        hasResponded: true,
        decision: "Yes"
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440004",
        name: "Figma",
        website: "figma.com",
        linkedin: "https://linkedin.com/company/figma",
        crunchbase: "https://crunchbase.com/organization/figma",
        totalEmails: 2,
        totalPeople: 3,
        lastAttempt: "2024-08-01",
        hasOpened: true,
        openCount: 1,
        // Number of people who opened emails
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        // Number of people who opened resumes
        hasResponded: false,
        decision: null
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440005",
        name: "Microsoft",
        website: "microsoft.com",
        linkedin: "https://linkedin.com/company/microsoft",
        crunchbase: "https://crunchbase.com/organization/microsoft",
        totalEmails: 3,
        totalPeople: 2,
        lastAttempt: "2024-08-02",
        hasOpened: true,
        openCount: 1,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440006",
        name: "Google",
        website: "google.com",
        linkedin: "https://linkedin.com/company/google",
        crunchbase: "https://crunchbase.com/organization/google",
        totalEmails: 2,
        totalPeople: 3,
        lastAttempt: "2024-07-30",
        hasOpened: true,
        openCount: 2,
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 2,
        hasResponded: false,
        decision: null
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440007",
        name: "Meta",
        website: "meta.com",
        linkedin: "https://linkedin.com/company/meta",
        crunchbase: "https://crunchbase.com/organization/meta",
        totalEmails: 4,
        totalPeople: 2,
        lastAttempt: "2024-07-28",
        hasOpened: true,
        openCount: 2,
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 1,
        hasResponded: true,
        decision: "No"
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440008",
        name: "Apple",
        website: "apple.com",
        linkedin: "https://linkedin.com/company/apple",
        crunchbase: "https://crunchbase.com/organization/apple",
        totalEmails: 1,
        totalPeople: 4,
        lastAttempt: "2024-08-01",
        hasOpened: false,
        openCount: 0,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 0,
        hasResponded: false,
        decision: null
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440009",
        name: "Netflix",
        website: "netflix.com",
        linkedin: "https://linkedin.com/company/netflix",
        crunchbase: "https://crunchbase.com/organization/netflix",
        totalEmails: 3,
        totalPeople: 3,
        lastAttempt: "2024-07-25",
        hasOpened: true,
        openCount: 3,
        hasClicked: true,
        clickCount: 2,
        resumeOpenCount: 2,
        hasResponded: false,
        decision: null
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440010",
        name: "Spotify",
        website: "spotify.com",
        linkedin: "https://linkedin.com/company/spotify",
        crunchbase: "https://crunchbase.com/organization/spotify",
        totalEmails: 2,
        totalPeople: 2,
        lastAttempt: "2024-07-27",
        hasOpened: true,
        openCount: 1,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null
      },
      {
        id: "11",
        name: "Airbnb",
        website: "airbnb.com",
        linkedin: "https://linkedin.com/company/airbnb",
        crunchbase: "https://crunchbase.com/organization/airbnb",
        totalEmails: 3,
        totalPeople: 3,
        lastAttempt: "2024-07-29",
        hasOpened: true,
        openCount: 2,
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 2,
        hasResponded: false,
        decision: null
      },
      {
        id: "12",
        name: "Uber",
        website: "uber.com",
        linkedin: "https://linkedin.com/company/uber",
        crunchbase: "https://crunchbase.com/organization/uber",
        totalEmails: 2,
        totalPeople: 2,
        lastAttempt: "2024-07-26",
        hasOpened: true,
        openCount: 1,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null
      },
      {
        id: "13",
        name: "Slack",
        website: "slack.com",
        linkedin: "https://linkedin.com/company/slack",
        crunchbase: "https://crunchbase.com/organization/slack",
        totalEmails: 3,
        totalPeople: 3,
        lastAttempt: "2024-07-31",
        hasOpened: true,
        openCount: 2,
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 2,
        hasResponded: false,
        decision: null
      },
      {
        id: "14",
        name: "Discord",
        website: "discord.com",
        linkedin: "https://linkedin.com/company/discord",
        crunchbase: "https://crunchbase.com/organization/discord",
        totalEmails: 1,
        totalPeople: 2,
        lastAttempt: "2024-08-02",
        hasOpened: false,
        openCount: 0,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 0,
        hasResponded: false,
        decision: null
      },
      {
        id: "15",
        name: "Notion",
        website: "notion.so",
        linkedin: "https://linkedin.com/company/notion",
        crunchbase: "https://crunchbase.com/organization/notion",
        totalEmails: 2,
        totalPeople: 2,
        lastAttempt: "2024-07-30",
        hasOpened: true,
        openCount: 1,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null
      },
      {
        id: "16",
        name: "Linear",
        website: "linear.app",
        linkedin: "https://linkedin.com/company/linear",
        crunchbase: "https://crunchbase.com/organization/linear",
        totalEmails: 3,
        totalPeople: 2,
        lastAttempt: "2024-07-28",
        hasOpened: true,
        openCount: 2,
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null
      },
      {
        id: "17",
        name: "Vercel",
        website: "vercel.com",
        linkedin: "https://linkedin.com/company/vercel",
        crunchbase: "https://crunchbase.com/organization/vercel",
        totalEmails: 2,
        totalPeople: 3,
        lastAttempt: "2024-07-29",
        hasOpened: true,
        openCount: 1,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null
      },
      {
        id: "18",
        name: "Supabase",
        website: "supabase.com",
        linkedin: "https://linkedin.com/company/supabase",
        crunchbase: "https://crunchbase.com/organization/supabase",
        totalEmails: 1,
        totalPeople: 2,
        lastAttempt: "2024-08-01",
        hasOpened: false,
        openCount: 0,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 0,
        hasResponded: false,
        decision: null
      },
      {
        id: "19",
        name: "Retool",
        website: "retool.com",
        linkedin: "https://linkedin.com/company/retool",
        crunchbase: "https://crunchbase.com/organization/retool",
        totalEmails: 3,
        totalPeople: 2,
        lastAttempt: "2024-07-27",
        hasOpened: true,
        openCount: 2,
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 2,
        hasResponded: false,
        decision: null
      },
      {
        id: "20",
        name: "Airtable",
        website: "airtable.com",
        linkedin: "https://linkedin.com/company/airtable",
        crunchbase: "https://crunchbase.com/organization/airtable",
        totalEmails: 2,
        totalPeople: 3,
        lastAttempt: "2024-07-26",
        hasOpened: true,
        openCount: 2,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null
      },
      {
        id: "21",
        name: "Databricks",
        website: "databricks.com",
        linkedin: "https://linkedin.com/company/databricks",
        crunchbase: "https://crunchbase.com/organization/databricks",
        totalEmails: 3,
        totalPeople: 3,
        lastAttempt: "2024-07-25",
        hasOpened: true,
        openCount: 3,
        hasClicked: true,
        clickCount: 2,
        resumeOpenCount: 2,
        hasResponded: true,
        decision: "Yes"
      },
      {
        id: "22",
        name: "Snowflake",
        website: "snowflake.com",
        linkedin: "https://linkedin.com/company/snowflake",
        crunchbase: "https://crunchbase.com/organization/snowflake",
        totalEmails: 2,
        totalPeople: 2,
        lastAttempt: "2024-07-30",
        hasOpened: true,
        openCount: 1,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null
      },
      {
        id: "23",
        name: "Coinbase",
        website: "coinbase.com",
        linkedin: "https://linkedin.com/company/coinbase",
        crunchbase: "https://crunchbase.com/organization/coinbase",
        totalEmails: 1,
        totalPeople: 2,
        lastAttempt: "2024-08-02",
        hasOpened: false,
        openCount: 0,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 0,
        hasResponded: false,
        decision: null
      },
      {
        id: "24",
        name: "Plaid",
        website: "plaid.com",
        linkedin: "https://linkedin.com/company/plaid",
        crunchbase: "https://crunchbase.com/organization/plaid",
        totalEmails: 3,
        totalPeople: 2,
        lastAttempt: "2024-07-28",
        hasOpened: true,
        openCount: 2,
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null
      }
    ];
    mockCompanies.forEach((company) => {
      this.companies.set(company.id, company);
    });
    const mockPeople = [
      {
        id: "1",
        companyId: "550e8400-e29b-41d4-a716-446655440001",
        name: "Alice Smith",
        email: "alice@openai.com",
        position: "Senior Engineering Manager",
        linkedin: "https://linkedin.com/in/alice-smith",
        attempts: 2,
        lastEmailDate: "2024-07-31",
        opened: true,
        openCount: 3,
        clicked: true,
        clickCount: 1,
        resumeOpened: true,
        resumeOpenCount: 2,
        responded: false
      },
      {
        id: "2",
        companyId: "550e8400-e29b-41d4-a716-446655440001",
        name: "Bob Johnson",
        email: "bob@openai.com",
        position: "Technical Recruiter",
        linkedin: "https://linkedin.com/in/bob-johnson",
        attempts: 0,
        lastEmailDate: "",
        opened: false,
        openCount: 0,
        clicked: false,
        clickCount: 0,
        resumeOpened: false,
        resumeOpenCount: 0,
        responded: false
      },
      {
        id: "11",
        companyId: "550e8400-e29b-41d4-a716-446655440002",
        name: "Carol Davis",
        email: "carol@anthropic.com",
        position: "Head of Engineering",
        linkedin: "https://linkedin.com/in/carol-davis",
        attempts: 1,
        lastEmailDate: "2024-07-29",
        opened: true,
        openCount: 1,
        clicked: false,
        clickCount: 0,
        resumeOpened: true,
        resumeOpenCount: 1,
        responded: false
      },
      {
        id: "12",
        companyId: "3",
        name: "David Wilson",
        email: "david@stripe.com",
        position: "Software Engineer",
        linkedin: "https://linkedin.com/in/david-wilson",
        attempts: 3,
        lastEmailDate: "2024-07-25",
        opened: true,
        openCount: 2,
        clicked: true,
        clickCount: 2,
        resumeOpened: true,
        resumeOpenCount: 1,
        responded: true
      },
      {
        id: "13",
        companyId: "4",
        name: "Eve Brown",
        email: "eve@figma.com",
        position: "Design Engineer",
        linkedin: "https://linkedin.com/in/eve-brown",
        attempts: 1,
        lastEmailDate: "2024-08-01",
        opened: false,
        openCount: 0,
        clicked: false,
        clickCount: 0,
        resumeOpened: false,
        resumeOpenCount: 0,
        responded: false
      },
      // Additional OpenAI people
      {
        id: "3",
        companyId: "1",
        name: "Charlie Zhang",
        email: "charlie@openai.com",
        position: "AI Research Scientist",
        linkedin: "https://linkedin.com/in/charlie-zhang",
        attempts: 1,
        lastEmailDate: "2024-07-30",
        opened: true,
        openCount: 2,
        clicked: false,
        clickCount: 0,
        resumeOpened: true,
        resumeOpenCount: 1,
        responded: false
      },
      {
        id: "4",
        companyId: "1",
        name: "Diana Martinez",
        email: "diana@openai.com",
        position: "Product Manager",
        linkedin: "https://linkedin.com/in/diana-martinez",
        attempts: 1,
        lastEmailDate: "2024-07-31",
        opened: false,
        openCount: 0,
        clicked: false,
        clickCount: 0,
        resumeOpened: false,
        resumeOpenCount: 0,
        responded: false
      },
      // Additional Anthropic people
      {
        id: "5",
        companyId: "550e8400-e29b-41d4-a716-446655440002",
        name: "Frank Thompson",
        email: "frank@anthropic.com",
        position: "Senior Software Engineer",
        linkedin: "https://linkedin.com/in/frank-thompson",
        attempts: 0,
        lastEmailDate: "",
        opened: false,
        openCount: 0,
        clicked: false,
        clickCount: 0,
        resumeOpened: false,
        resumeOpenCount: 0,
        responded: false
      },
      {
        id: "6",
        companyId: "550e8400-e29b-41d4-a716-446655440002",
        name: "Grace Lee",
        email: "grace@anthropic.com",
        position: "AI Safety Researcher",
        linkedin: "https://linkedin.com/in/grace-lee",
        attempts: 1,
        lastEmailDate: "2024-07-28",
        opened: true,
        openCount: 1,
        clicked: true,
        clickCount: 1,
        resumeOpened: true,
        resumeOpenCount: 1,
        responded: false
      },
      // Additional Stripe people
      {
        id: "7",
        companyId: "3",
        name: "Hannah Garcia",
        email: "hannah@stripe.com",
        position: "Engineering Manager",
        linkedin: "https://linkedin.com/in/hannah-garcia",
        attempts: 2,
        lastEmailDate: "2024-07-24",
        opened: true,
        openCount: 3,
        clicked: true,
        clickCount: 1,
        resumeOpened: true,
        resumeOpenCount: 2,
        responded: false
      },
      {
        id: "8",
        companyId: "3",
        name: "Ian Rodriguez",
        email: "ian@stripe.com",
        position: "Platform Engineer",
        linkedin: "https://linkedin.com/in/ian-rodriguez",
        attempts: 1,
        lastEmailDate: "2024-07-26",
        opened: false,
        openCount: 0,
        clicked: false,
        clickCount: 0,
        resumeOpened: false,
        resumeOpenCount: 0,
        responded: false
      },
      // Additional Figma people
      {
        id: "9",
        companyId: "4",
        name: "Jack Kumar",
        email: "jack@figma.com",
        position: "Senior Product Designer",
        linkedin: "https://linkedin.com/in/jack-kumar",
        attempts: 0,
        lastEmailDate: "",
        opened: false,
        openCount: 0,
        clicked: false,
        clickCount: 0,
        resumeOpened: false,
        resumeOpenCount: 0,
        responded: false
      },
      {
        id: "10",
        companyId: "4",
        name: "Kelly Patel",
        email: "kelly@figma.com",
        position: "Frontend Engineer",
        linkedin: "https://linkedin.com/in/kelly-patel",
        attempts: 1,
        lastEmailDate: "2024-07-31",
        opened: true,
        openCount: 1,
        clicked: false,
        clickCount: 0,
        resumeOpened: true,
        resumeOpenCount: 1,
        responded: false
      }
    ];
    mockPeople.forEach((person) => this.people.set(person.id, person));
    const mockEmailStats = [
      {
        id: "1",
        personId: "1",
        companyId: "1",
        attemptNumber: 1,
        sentDate: "2024-07-28",
        openCount: 2,
        clickCount: 1,
        resumeOpenCount: 1,
        responded: false,
        subject: "Software Engineer Position - Let's Connect"
      },
      {
        id: "2",
        personId: "1",
        companyId: "1",
        attemptNumber: 2,
        sentDate: "2024-07-31",
        openCount: 1,
        clickCount: 0,
        resumeOpenCount: 1,
        responded: false,
        subject: "Following Up - Software Engineer Role"
      },
      {
        id: "3",
        personId: "3",
        companyId: "550e8400-e29b-41d4-a716-446655440002",
        attemptNumber: 1,
        sentDate: "2024-07-29",
        openCount: 1,
        clickCount: 0,
        resumeOpenCount: 1,
        responded: false,
        subject: "Exploring Opportunities at Anthropic"
      },
      {
        id: "4",
        personId: "4",
        companyId: "3",
        attemptNumber: 1,
        sentDate: "2024-07-20",
        openCount: 1,
        clickCount: 1,
        resumeOpenCount: 1,
        responded: false,
        subject: "Software Engineer - Stripe"
      },
      {
        id: "5",
        personId: "4",
        companyId: "3",
        attemptNumber: 2,
        sentDate: "2024-07-23",
        openCount: 1,
        clickCount: 1,
        resumeOpenCount: 0,
        responded: false,
        subject: "Re: Software Engineer - Stripe"
      },
      {
        id: "6",
        personId: "4",
        companyId: "3",
        attemptNumber: 3,
        sentDate: "2024-07-25",
        openCount: 0,
        clickCount: 0,
        resumeOpenCount: 0,
        responded: true,
        subject: "Final Follow-up - Stripe Opportunity"
      },
      {
        id: "7",
        personId: "5",
        companyId: "4",
        attemptNumber: 1,
        sentDate: "2024-08-02",
        openCount: 0,
        clickCount: 0,
        resumeOpenCount: 0,
        responded: false,
        subject: "Design Engineer Position at Figma"
      },
      {
        id: "8",
        personId: "6",
        companyId: "5",
        attemptNumber: 1,
        sentDate: "2024-08-03",
        openCount: 1,
        clickCount: 0,
        resumeOpenCount: 0,
        responded: false,
        subject: "Senior Software Engineer - Microsoft"
      }
    ];
    mockEmailStats.forEach((emailStat) => this.emailStats.set(emailStat.id, emailStat));
  }
  // Companies
  async getCompanies() {
    const companies2 = Array.from(this.companies.values());
    const companiesWithCrunchbase = companies2.map((company) => ({
      ...company,
      crunchbase: company.crunchbase || `https://crunchbase.com/organization/${company.name.toLowerCase().replace(/\s+/g, "-")}`
    }));
    return companiesWithCrunchbase;
  }
  async getCompany(id) {
    return this.companies.get(id);
  }
  async createCompany(insertCompany) {
    const id = randomUUID();
    const company = {
      ...insertCompany,
      id,
      linkedin: insertCompany.linkedin || null,
      crunchbase: insertCompany.crunchbase || null,
      totalEmails: insertCompany.totalEmails || 0,
      totalPeople: insertCompany.totalPeople || 0,
      lastAttempt: insertCompany.lastAttempt || null,
      hasOpened: insertCompany.hasOpened || false,
      openCount: insertCompany.openCount || 0,
      hasClicked: insertCompany.hasClicked || false,
      clickCount: insertCompany.clickCount || 0,
      resumeOpenCount: insertCompany.resumeOpenCount || 0,
      hasResponded: insertCompany.hasResponded || false,
      decision: insertCompany.decision || null
    };
    this.companies.set(id, company);
    return company;
  }
  async updateCompany(id, updates) {
    const company = this.companies.get(id);
    if (!company) return void 0;
    const updated = { ...company, ...updates };
    this.companies.set(id, updated);
    return updated;
  }
  async deleteCompany(id) {
    return this.companies.delete(id);
  }
  // People
  async getPeople() {
    return Array.from(this.people.values());
  }
  async getPeopleByCompany(companyId) {
    return Array.from(this.people.values()).filter((person) => person.companyId === companyId);
  }
  async getPerson(id) {
    return this.people.get(id);
  }
  async createPerson(insertPerson) {
    const id = randomUUID();
    const person = {
      ...insertPerson,
      id,
      position: insertPerson.position || null,
      linkedin: insertPerson.linkedin || null,
      attempts: insertPerson.attempts || 0,
      lastEmailDate: insertPerson.lastEmailDate || null,
      opened: insertPerson.opened || false,
      openCount: insertPerson.openCount || 0,
      clicked: insertPerson.clicked || false,
      clickCount: insertPerson.clickCount || 0,
      resumeOpened: insertPerson.resumeOpened || false,
      resumeOpenCount: insertPerson.resumeOpenCount || 0,
      responded: insertPerson.responded || false
    };
    this.people.set(id, person);
    return person;
  }
  async updatePerson(id, updates) {
    const person = this.people.get(id);
    if (!person) return void 0;
    const updated = { ...person, ...updates };
    this.people.set(id, updated);
    return updated;
  }
  async deletePerson(id) {
    return this.people.delete(id);
  }
  // Email Stats
  async getEmailStats() {
    return Array.from(this.emailStats.values());
  }
  async getEmailStatsByPerson(personId) {
    return Array.from(this.emailStats.values()).filter((stat) => stat.personId === personId);
  }
  async createEmailStat(insertEmailStat) {
    const id = randomUUID();
    const emailStat = {
      ...insertEmailStat,
      id,
      openCount: insertEmailStat.openCount || 0,
      clickCount: insertEmailStat.clickCount || 0,
      resumeOpenCount: insertEmailStat.resumeOpenCount || 0,
      responded: insertEmailStat.responded || false
    };
    this.emailStats.set(id, emailStat);
    return emailStat;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  website: text("website").notNull(),
  linkedin: text("linkedin"),
  crunchbase: text("crunchbase"),
  totalEmails: integer("total_emails").notNull().default(0),
  totalPeople: integer("total_people").notNull().default(0),
  lastAttempt: text("last_attempt"),
  hasOpened: boolean("has_opened").notNull().default(false),
  openCount: integer("open_count").notNull().default(0),
  hasClicked: boolean("has_clicked").notNull().default(false),
  clickCount: integer("click_count").notNull().default(0),
  resumeOpenCount: integer("resume_open_count").notNull().default(0),
  hasResponded: boolean("has_responded").notNull().default(false),
  decision: text("decision")
  // "yes", "no", or null for pending
});
var people = pgTable("people", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  position: text("position"),
  linkedin: text("linkedin"),
  city: text("city"),
  country: text("country"),
  attempts: integer("attempts").notNull().default(0),
  lastEmailDate: text("last_email_date"),
  opened: boolean("opened").notNull().default(false),
  openCount: integer("open_count").notNull().default(0),
  clicked: boolean("clicked").notNull().default(false),
  clickCount: integer("click_count").notNull().default(0),
  resumeOpened: boolean("resume_opened").notNull().default(false),
  resumeOpenCount: integer("resume_open_count").notNull().default(0),
  responded: boolean("responded").notNull().default(false)
});
var emailStats = pgTable("email_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personId: varchar("person_id").notNull(),
  companyId: varchar("company_id").notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  sentDate: text("sent_date").notNull(),
  openCount: integer("open_count").notNull().default(0),
  clickCount: integer("click_count").notNull().default(0),
  resumeOpenCount: integer("resume_open_count").notNull().default(0),
  responded: boolean("responded").notNull().default(false),
  subject: text("subject").notNull()
});
var insertCompanySchema = createInsertSchema(companies).omit({
  id: true
});
var insertPersonSchema = createInsertSchema(people).omit({
  id: true
});
var insertEmailStatSchema = createInsertSchema(emailStats).omit({
  id: true
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/companies", async (req, res) => {
    try {
      const companies2 = await storage.getCompanies();
      res.json(companies2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });
  app2.get("/api/companies/:id", async (req, res) => {
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
  app2.post("/api/companies", async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      res.status(400).json({ message: "Invalid company data" });
    }
  });
  app2.patch("/api/companies/:id", async (req, res) => {
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
  app2.delete("/api/companies/:id", async (req, res) => {
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
  app2.get("/api/people", async (req, res) => {
    try {
      const { companyId } = req.query;
      let people2;
      if (companyId) {
        people2 = await storage.getPeopleByCompany(companyId);
      } else {
        people2 = await storage.getPeople();
      }
      res.json(people2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch people" });
    }
  });
  app2.get("/api/people/:id", async (req, res) => {
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
  app2.post("/api/people", async (req, res) => {
    try {
      const validatedData = insertPersonSchema.parse(req.body);
      const person = await storage.createPerson(validatedData);
      res.status(201).json(person);
    } catch (error) {
      res.status(400).json({ message: "Invalid person data" });
    }
  });
  app2.patch("/api/people/:id", async (req, res) => {
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
  app2.delete("/api/people/:id", async (req, res) => {
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
  app2.get("/api/email-stats", async (req, res) => {
    try {
      const { personId } = req.query;
      let emailStats2;
      if (personId) {
        emailStats2 = await storage.getEmailStatsByPerson(personId);
      } else {
        emailStats2 = await storage.getEmailStats();
      }
      res.json(emailStats2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email stats" });
    }
  });
  app2.post("/api/email-stats", async (req, res) => {
    try {
      const validatedData = insertEmailStatSchema.parse(req.body);
      const emailStat = await storage.createEmailStat(validatedData);
      res.status(201).json(emailStat);
    } catch (error) {
      res.status(400).json({ message: "Invalid email stat data" });
    }
  });
  app2.get("/api/stats", async (req, res) => {
    try {
      const companies2 = await storage.getCompanies();
      const people2 = await storage.getPeople();
      const emailStats2 = await storage.getEmailStats();
      const totalEmails = companies2.reduce((sum, company) => sum + company.totalEmails, 0);
      const totalOpens = companies2.reduce((sum, company) => sum + company.openCount, 0);
      const totalClicks = companies2.reduce((sum, company) => sum + company.clickCount, 0);
      const totalResponses = companies2.filter((company) => company.hasResponded).length;
      res.json({
        totalEmails,
        totalOpens,
        totalClicks,
        totalResponses,
        companies: companies2,
        people: people2,
        emailStats: emailStats2
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  const nodeEnv = (process.env.NODE_ENV || "").trim();
  log(`NODE_ENV: "${nodeEnv}", app.get("env"): "${app.get("env")}"`);
  if (nodeEnv === "development") {
    log("Setting up Vite development server with hot reload");
    await setupVite(app, server);
  } else {
    log("Setting up static file serving for production");
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "localhost"
    // reusePort option is not supported on Windows
  }, () => {
    log(`serving on port ${port}`);
  });
})();
