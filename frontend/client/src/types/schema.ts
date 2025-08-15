// Types for frontend - copied from the FastAPI backend models

export interface Company {
  id: string;
  name: string;
  website?: string;
  linkedin?: string;
  crunchbase?: string;
  companySize?: string;
  totalEmails: number;
  totalPeople: number;
  lastAttempt?: string;
  decision?: string;
  hasOpened: boolean;
  openCount: number;
  hasClicked: boolean;
  clickCount: number;
  resumeOpenCount: number;
  hasResponded: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Person {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role?: string;
  linkedin?: string;
  status: string;
  emailStatus: string;
  lastContact: string;
  notes?: string;
  city?: string;
  state?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailStat {
  id: string;
  personId: string;
  companyId?: string; // Add for dashboard filtering
  subject: string;
  status: string;
  sentAt: string;
  sentDate?: string; // Alias for compatibility
  openedAt?: string;
  clickedAt?: string;
  respondedAt?: string;
  responded?: boolean; // Computed field for compatibility
  attemptNumber?: number; // Add for dashboard logic
  openCount?: number; // Add for dashboard logic
  resumeOpenCount?: number; // Add for dashboard logic
  createdAt?: string;
  updatedAt?: string;
}

// Insert types for creating new records
export type InsertCompany = Omit<Company, 'id' | 'totalEmails' | 'totalPeople' | 'hasOpened' | 'openCount' | 'hasClicked' | 'clickCount' | 'resumeOpenCount' | 'hasResponded' | 'createdAt' | 'updatedAt'>;
export type InsertPerson = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertEmailStat = Omit<EmailStat, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'sentDate' | 'responded' | 'attemptNumber' | 'openCount' | 'resumeOpenCount'>;
