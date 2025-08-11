import { type Company, type InsertCompany, type Person, type InsertPerson, type EmailStat, type InsertEmailStat } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Companies
  getCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<boolean>;

  // People
  getPeople(): Promise<Person[]>;
  getPeopleByCompany(companyId: string): Promise<Person[]>;
  getPerson(id: string): Promise<Person | undefined>;
  createPerson(person: InsertPerson): Promise<Person>;
  updatePerson(id: string, person: Partial<InsertPerson>): Promise<Person | undefined>;
  deletePerson(id: string): Promise<boolean>;

  // Email Stats
  getEmailStats(): Promise<EmailStat[]>;
  getEmailStatsByPerson(personId: string): Promise<EmailStat[]>;
  createEmailStat(emailStat: InsertEmailStat): Promise<EmailStat>;
}

export class MemStorage implements IStorage {
  private companies: Map<string, Company>;
  private people: Map<string, Person>;
  private emailStats: Map<string, EmailStat>;

  constructor() {
    this.companies = new Map();
    this.people = new Map();
    this.emailStats = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed companies
    const mockCompanies = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "OpenAI",
        website: "https://openai.com",
        linkedin: "https://linkedin.com/company/openai",
        crunchbase: "https://crunchbase.com/organization/openai",
        companySize: "501–1,000",
        totalEmails: 4,
        totalPeople: 4,
        lastAttempt: "2024-07-31",
        hasOpened: true,
        openCount: 3, // Number of people who opened emails (max = totalPeople)
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 2, // Number of people who opened resumes (max = totalPeople)
        hasResponded: false,
        decision: null,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Anthropic",
        website: "https://anthropic.com",
        linkedin: "https://linkedin.com/company/anthropic",
        crunchbase: "https://crunchbase.com/organization/anthropic",
        companySize: "101–250",
        totalEmails: 3,
        totalPeople: 3,
        lastAttempt: "2024-07-29",
        hasOpened: true,
        openCount: 2, // Number of people who opened emails
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 2, // Number of people who opened resumes
        hasResponded: false,
        decision: null,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        name: "Stripe",
        website: "https://stripe.com",
        linkedin: "https://linkedin.com/company/stripe",
        crunchbase: "https://crunchbase.com/organization/stripe",
        companySize: "1,001–5,000",
        totalEmails: 6,
        totalPeople: 3,
        lastAttempt: "2024-07-26",
        hasOpened: true,
        openCount: 2, // Number of people who opened emails
        hasClicked: true,
        clickCount: 2,
        resumeOpenCount: 2, // Number of people who opened resumes
        hasResponded: true,
        decision: "Yes",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440004",
        name: "Figma",
        website: "https://figma.com",
        linkedin: "https://linkedin.com/company/figma",
        crunchbase: "https://crunchbase.com/organization/figma",
        companySize: "251–500",
        totalEmails: 2,
        totalPeople: 3,
        lastAttempt: "2024-08-01",
        hasOpened: true,
        openCount: 1, // Number of people who opened emails
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1, // Number of people who opened resumes
        hasResponded: false,
        decision: null,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440005",
        name: "Microsoft",
        website: "https://microsoft.com",
        linkedin: "https://linkedin.com/company/microsoft",
        crunchbase: "https://crunchbase.com/organization/microsoft",
        companySize: "10,001+",
        totalEmails: 3,
        totalPeople: 2,
        lastAttempt: "2024-08-02",
        hasOpened: true,
        openCount: 1,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440006",
        name: "Google",
        website: "https://google.com",
        linkedin: "https://linkedin.com/company/google",
        crunchbase: "https://crunchbase.com/organization/google",
        companySize: "10,001+",
        totalEmails: 2,
        totalPeople: 3,
        lastAttempt: "2024-07-30",
        hasOpened: true,
        openCount: 2,
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 2,
        hasResponded: false,
        decision: null,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440007",
        name: "Meta",
        website: "https://meta.com",
        linkedin: "https://linkedin.com/company/meta",
        crunchbase: "https://crunchbase.com/organization/meta",
        companySize: "10,001+",
        totalEmails: 4,
        totalPeople: 2,
        lastAttempt: "2024-07-28",
        hasOpened: true,
        openCount: 2,
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 1,
        hasResponded: true,
        decision: "No",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440008",
        name: "Apple",
        website: "https://apple.com",
        linkedin: "https://linkedin.com/company/apple",
        crunchbase: "https://crunchbase.com/organization/apple",
        companySize: "10,001+",
        totalEmails: 1,
        totalPeople: 4,
        lastAttempt: "2024-08-01",
        hasOpened: false,
        openCount: 0,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 0,
        hasResponded: false,
        decision: null,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440009",
        name: "Netflix",
        website: "https://netflix.com",
        linkedin: "https://linkedin.com/company/netflix",
        crunchbase: "https://crunchbase.com/organization/netflix",
        companySize: "5,001–10,000",
        totalEmails: 3,
        totalPeople: 3,
        lastAttempt: "2024-07-25",
        hasOpened: true,
        openCount: 3,
        hasClicked: true,
        clickCount: 2,
        resumeOpenCount: 2,
        hasResponded: false,
        decision: null,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440010",
        name: "Spotify",
        website: "https://spotify.com",
        linkedin: "https://linkedin.com/company/spotify",
        crunchbase: "https://crunchbase.com/organization/spotify",
        companySize: "1,001–5,000",
        totalEmails: 2,
        totalPeople: 2,
        lastAttempt: "2024-07-27",
        hasOpened: true,
        openCount: 1,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null,
      },
      {
        id: "11",
        name: "Airbnb",
        website: "https://airbnb.com",
        linkedin: "https://linkedin.com/company/airbnb",
        crunchbase: "https://crunchbase.com/organization/airbnb",
        companySize: "1,001–5,000",
        totalEmails: 3,
        totalPeople: 3,
        lastAttempt: "2024-07-29",
        hasOpened: true,
        openCount: 2,
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 2,
        hasResponded: false,
        decision: null,
      },
      {
        id: "12",
        name: "Uber",
        website: "https://uber.com",
        linkedin: "https://linkedin.com/company/uber",
        crunchbase: "https://crunchbase.com/organization/uber",
        companySize: "10,001+",
        totalEmails: 2,
        totalPeople: 2,
        lastAttempt: "2024-07-26",
        hasOpened: true,
        openCount: 1,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null,
      },
      {
        id: "13",
        name: "Slack",
        website: "https://slack.com",
        linkedin: "https://linkedin.com/company/slack",
        crunchbase: "https://crunchbase.com/organization/slack",
        companySize: "501–1,000",
        totalEmails: 3,
        totalPeople: 3,
        lastAttempt: "2024-07-31",
        hasOpened: true,
        openCount: 2,
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 2,
        hasResponded: false,
        decision: null,
      },
      {
        id: "14",
        name: "Discord",
        website: "https://discord.com",
        linkedin: "https://linkedin.com/company/discord",
        crunchbase: "https://crunchbase.com/organization/discord",
        companySize: "251–500",
        totalEmails: 1,
        totalPeople: 2,
        lastAttempt: "2024-08-02",
        hasOpened: false,
        openCount: 0,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 0,
        hasResponded: false,
        decision: null,
      },
      {
        id: "15",
        name: "Notion",
        website: "https://notion.so",
        linkedin: "https://linkedin.com/company/notion",
        crunchbase: "https://crunchbase.com/organization/notion",
        companySize: "51–100",
        totalEmails: 2,
        totalPeople: 2,
        lastAttempt: "2024-07-30",
        hasOpened: true,
        openCount: 1,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null,
      },
      {
        id: "16",
        name: "Linear",
        website: "https://linear.app",
        linkedin: "https://linkedin.com/company/linear",
        crunchbase: "https://crunchbase.com/organization/linear",
        companySize: "11–50",
        totalEmails: 3,
        totalPeople: 2,
        lastAttempt: "2024-07-28",
        hasOpened: true,
        openCount: 2,
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null,
      },
      {
        id: "17",
        name: "Vercel",
        website: "vercel.com",
        linkedin: "https://linkedin.com/company/vercel",
        crunchbase: "https://crunchbase.com/organization/vercel",
        companySize: "101–250",
        totalEmails: 2,
        totalPeople: 3,
        lastAttempt: "2024-07-29",
        hasOpened: true,
        openCount: 1,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null,
      },
      {
        id: "18",
        name: "Supabase",
        website: "supabase.com",
        linkedin: "https://linkedin.com/company/supabase",
        crunchbase: "https://crunchbase.com/organization/supabase",
        companySize: "51–100",
        totalEmails: 1,
        totalPeople: 2,
        lastAttempt: "2024-08-01",
        hasOpened: false,
        openCount: 0,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 0,
        hasResponded: false,
        decision: null,
      },
      {
        id: "19",
        name: "Retool",
        website: "retool.com",
        linkedin: "https://linkedin.com/company/retool",
        crunchbase: "https://crunchbase.com/organization/retool",
        companySize: "251–500",
        totalEmails: 3,
        totalPeople: 2,
        lastAttempt: "2024-07-27",
        hasOpened: true,
        openCount: 2,
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 2,
        hasResponded: false,
        decision: null,
      },
      {
        id: "20",
        name: "Airtable",
        website: "airtable.com",
        linkedin: "https://linkedin.com/company/airtable",
        crunchbase: "https://crunchbase.com/organization/airtable",
        companySize: "501–1,000",
        totalEmails: 2,
        totalPeople: 3,
        lastAttempt: "2024-07-26",
        hasOpened: true,
        openCount: 2,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null,
      },
      {
        id: "21",
        name: "Databricks",
        website: "databricks.com",
        linkedin: "https://linkedin.com/company/databricks",
        crunchbase: "https://crunchbase.com/organization/databricks",
        companySize: "1,001–5,000",
        totalEmails: 3,
        totalPeople: 3,
        lastAttempt: "2024-07-25",
        hasOpened: true,
        openCount: 3,
        hasClicked: true,
        clickCount: 2,
        resumeOpenCount: 2,
        hasResponded: true,
        decision: "Yes",
      },
      {
        id: "22",
        name: "Snowflake",
        website: "snowflake.com",
        linkedin: "https://linkedin.com/company/snowflake",
        crunchbase: "https://crunchbase.com/organization/snowflake",
        companySize: "5,001–10,000",
        totalEmails: 2,
        totalPeople: 2,
        lastAttempt: "2024-07-30",
        hasOpened: true,
        openCount: 1,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null,
      },
      {
        id: "23",
        name: "Coinbase",
        website: "coinbase.com",
        linkedin: "https://linkedin.com/company/coinbase",
        crunchbase: "https://crunchbase.com/organization/coinbase",
        companySize: "1,001–5,000",
        totalEmails: 1,
        totalPeople: 2,
        lastAttempt: "2024-08-02",
        hasOpened: false,
        openCount: 0,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 0,
        hasResponded: false,
        decision: null,
      },
      {
        id: "24",
        name: "Plaid",
        website: "plaid.com",
        linkedin: "https://linkedin.com/company/plaid",
        crunchbase: "https://crunchbase.com/organization/plaid",
        companySize: "501–1,000",
        totalEmails: 3,
        totalPeople: 2,
        lastAttempt: "2024-07-28",
        hasOpened: true,
        openCount: 2,
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null,
      },

    ];

    mockCompanies.forEach(company => {
      this.companies.set(company.id, company as Company);
    });

    // Seed people
    const mockPeople = [
      {
        id: "1",
        companyId: "550e8400-e29b-41d4-a716-446655440001",
        name: "Alice Smith",
        email: "alice@openai.com",
        position: "Senior Engineering Manager",
        linkedin: "https://linkedin.com/in/alice-smith",
        city: "San Francisco",
        country: "USA",
        attempts: 2,
        lastEmailDate: "2024-07-31",
        opened: true,
        openCount: 3,
        clicked: true,
        clickCount: 1,
        resumeOpened: true,
        resumeOpenCount: 2,
        responded: false,
      },
      {
        id: "2",
        companyId: "550e8400-e29b-41d4-a716-446655440001",
        name: "Bob Johnson",
        email: "bob@openai.com",
        position: "Technical Recruiter",
        linkedin: "https://linkedin.com/in/bob-johnson",
        city: "San Francisco",
        country: "USA",
        attempts: 0,
        lastEmailDate: "",
        opened: false,
        openCount: 0,
        clicked: false,
        clickCount: 0,
        resumeOpened: false,
        resumeOpenCount: 0,
        responded: false,
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
        responded: false,
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
        responded: true,
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
        responded: false,
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
        responded: false,
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
        responded: false,
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
        responded: false,
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
        responded: false,
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
        responded: false,
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
        responded: false,
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
        responded: false,
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
        responded: false,
      },
    ];

    mockPeople.forEach(person => {
      // Ensure city and country are set for compatibility
      const personWithLocation = {
        ...person,
        city: person.city || null,
        country: person.country || null,
        position: person.position || null,
        linkedin: person.linkedin || null,
        lastEmailDate: person.lastEmailDate || null
      };
      this.people.set(person.id, personWithLocation);
    });

    // Seed email stats
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
        subject: "Software Engineer Position - Let's Connect",
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
        subject: "Following Up - Software Engineer Role",
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
        subject: "Exploring Opportunities at Anthropic",
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
        subject: "Software Engineer - Stripe",
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
        subject: "Re: Software Engineer - Stripe",
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
        subject: "Final Follow-up - Stripe Opportunity",
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
        subject: "Design Engineer Position at Figma",
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
        subject: "Senior Software Engineer - Microsoft",
      },
    ];

    mockEmailStats.forEach(emailStat => this.emailStats.set(emailStat.id, emailStat));
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    const companies = Array.from(this.companies.values());
    
    // Ensure crunchbase field is included
    const companiesWithCrunchbase = companies.map(company => ({
      ...company,
      crunchbase: company.crunchbase || `https://crunchbase.com/organization/${company.name.toLowerCase().replace(/\s+/g, '-')}`
    }));
    
    return companiesWithCrunchbase;
  }

  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  private normalizeWebsiteUrl(url: string): string {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = randomUUID();
    const company: Company = { 
      ...insertCompany, 
      id,
      website: this.normalizeWebsiteUrl(insertCompany.website),
      linkedin: insertCompany.linkedin || null,
      crunchbase: insertCompany.crunchbase || null,
      companySize: insertCompany.companySize || null,
      totalEmails: insertCompany.totalEmails || 0,
      totalPeople: insertCompany.totalPeople || 0,
      lastAttempt: insertCompany.lastAttempt || null,
      hasOpened: insertCompany.hasOpened || false,
      openCount: insertCompany.openCount || 0,
      hasClicked: insertCompany.hasClicked || false,
      clickCount: insertCompany.clickCount || 0,
      resumeOpenCount: insertCompany.resumeOpenCount || 0,
      hasResponded: insertCompany.hasResponded || false,
      decision: insertCompany.decision || null,
    };
    this.companies.set(id, company);
    return company;
  }

  async updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updatedData = { ...updates };
    if (updates.website) {
      updatedData.website = this.normalizeWebsiteUrl(updates.website);
    }
    
    const updated = { ...company, ...updatedData };
    this.companies.set(id, updated);
    return updated;
  }

  async deleteCompany(id: string): Promise<boolean> {
    return this.companies.delete(id);
  }

  // People
  async getPeople(): Promise<Person[]> {
    return Array.from(this.people.values());
  }

  async getPeopleByCompany(companyId: string): Promise<Person[]> {
    return Array.from(this.people.values()).filter(person => person.companyId === companyId);
  }

  async getPerson(id: string): Promise<Person | undefined> {
    return this.people.get(id);
  }

  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    const id = randomUUID();
    const person: Person = { 
      ...insertPerson, 
      id,
      position: insertPerson.position || null,
      linkedin: insertPerson.linkedin || null,
      city: insertPerson.city || null,
      country: insertPerson.country || null,
      attempts: insertPerson.attempts || 0,
      lastEmailDate: insertPerson.lastEmailDate || null,
      opened: insertPerson.opened || false,
      openCount: insertPerson.openCount || 0,
      clicked: insertPerson.clicked || false,
      clickCount: insertPerson.clickCount || 0,
      resumeOpened: insertPerson.resumeOpened || false,
      resumeOpenCount: insertPerson.resumeOpenCount || 0,
      responded: insertPerson.responded || false,
    };
    this.people.set(id, person);
    return person;
  }

  async updatePerson(id: string, updates: Partial<InsertPerson>): Promise<Person | undefined> {
    const person = this.people.get(id);
    if (!person) return undefined;
    
    const updated = { ...person, ...updates };
    this.people.set(id, updated);
    return updated;
  }

  async deletePerson(id: string): Promise<boolean> {
    return this.people.delete(id);
  }

  // Email Stats
  async getEmailStats(): Promise<EmailStat[]> {
    return Array.from(this.emailStats.values());
  }

  async getEmailStatsByPerson(personId: string): Promise<EmailStat[]> {
    return Array.from(this.emailStats.values()).filter(stat => stat.personId === personId);
  }

  async createEmailStat(insertEmailStat: InsertEmailStat): Promise<EmailStat> {
    const id = randomUUID();
    const emailStat: EmailStat = { 
      ...insertEmailStat, 
      id,
      openCount: insertEmailStat.openCount || 0,
      clickCount: insertEmailStat.clickCount || 0,
      resumeOpenCount: insertEmailStat.resumeOpenCount || 0,
      responded: insertEmailStat.responded || false,
    };
    this.emailStats.set(id, emailStat);
    return emailStat;
  }
}

export const storage = new MemStorage();
