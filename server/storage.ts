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
        id: "1",
        name: "OpenAI",
        website: "openai.com",
        linkedin: "https://linkedin.com/company/openai",
        totalEmails: 2,
        totalPeople: 2,
        lastAttempt: "Jul 31",
        hasOpened: true,
        openCount: 3,
        hasClicked: true,
        clickCount: 1,
        resumeOpenCount: 2,
        hasResponded: false,
        decision: null,
      },
      {
        id: "2",
        name: "Anthropic",
        website: "anthropic.com",
        linkedin: "https://linkedin.com/company/anthropic",
        totalEmails: 1,
        totalPeople: 1,
        lastAttempt: "Jul 29",
        hasOpened: true,
        openCount: 1,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 1,
        hasResponded: false,
        decision: null,
      },
      {
        id: "3",
        name: "Stripe",
        website: "stripe.com",
        linkedin: "https://linkedin.com/company/stripe",
        totalEmails: 3,
        totalPeople: 1,
        lastAttempt: "Jul 25",
        hasOpened: true,
        openCount: 2,
        hasClicked: true,
        clickCount: 2,
        resumeOpenCount: 1,
        hasResponded: true,
        decision: "Yes",
      },
      {
        id: "4",
        name: "Figma",
        website: "figma.com",
        linkedin: "https://linkedin.com/company/figma",
        totalEmails: 1,
        totalPeople: 1,
        lastAttempt: "Aug 1",
        hasOpened: false,
        openCount: 0,
        hasClicked: false,
        clickCount: 0,
        resumeOpenCount: 0,
        hasResponded: false,
        decision: null,
      },
    ];

    mockCompanies.forEach(company => this.companies.set(company.id, company));

    // Seed people
    const mockPeople = [
      {
        id: "1",
        companyId: "1",
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
        responded: false,
      },
      {
        id: "2",
        companyId: "1",
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
        responded: false,
      },
      {
        id: "3",
        companyId: "2",
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
        id: "4",
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
        id: "5",
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
    ];

    mockPeople.forEach(person => this.people.set(person.id, person));

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
        companyId: "2",
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
        sentDate: "2024-08-01",
        openCount: 0,
        clickCount: 0,
        resumeOpenCount: 0,
        responded: false,
        subject: "Design Engineer Position at Figma",
      },
    ];

    mockEmailStats.forEach(emailStat => this.emailStats.set(emailStat.id, emailStat));
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = randomUUID();
    const company: Company = { ...insertCompany, id };
    this.companies.set(id, company);
    return company;
  }

  async updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updated = { ...company, ...updates };
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
    const person: Person = { ...insertPerson, id };
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
    const emailStat: EmailStat = { ...insertEmailStat, id };
    this.emailStats.set(id, emailStat);
    return emailStat;
  }
}

export const storage = new MemStorage();
