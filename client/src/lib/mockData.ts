export interface Company {
  id: number;
  name: string;
  website: string;
  linkedin: string;
  totalEmails: number;
  lastAttempt: string;
  hasOpened: boolean;
  openCount: number;
  hasClicked: boolean;
  clickCount: number;
  hasResponded: boolean;
}

export interface Person {
  id: number;
  companyId: number;
  name: string;
  email: string;
  position: string;
  linkedin: string;
  attempts: number;
  lastEmailDate: string;
  opened: boolean;
  openCount: number;
  clicked: boolean;
  clickCount: number;
  responded: boolean;
}

export interface EmailStat {
  id: number;
  personId: number;
  attemptNumber: number;
  sentDate: string;
  openCount: number;
  clickCount: number;
  responded: boolean;
  subject: string;
}

export const mockCompanies: Company[] = [
  {
    id: 1,
    name: 'OpenAI',
    website: 'openai.com',
    linkedin: 'https://linkedin.com/company/openai',
    totalEmails: 2,
    lastAttempt: 'Jul 31',
    hasOpened: true,
    openCount: 3,
    hasClicked: true,
    clickCount: 1,
    hasResponded: false,
  },
  {
    id: 2,
    name: 'Anthropic',
    website: 'anthropic.com',
    linkedin: 'https://linkedin.com/company/anthropic',
    totalEmails: 1,
    lastAttempt: 'Jul 29',
    hasOpened: true,
    openCount: 1,
    hasClicked: false,
    clickCount: 0,
    hasResponded: false,
  },
  {
    id: 3,
    name: 'Stripe',
    website: 'stripe.com',
    linkedin: 'https://linkedin.com/company/stripe',
    totalEmails: 3,
    lastAttempt: 'Jul 25',
    hasOpened: true,
    openCount: 2,
    hasClicked: true,
    clickCount: 2,
    hasResponded: true,
  },
  {
    id: 4,
    name: 'Figma',
    website: 'figma.com',
    linkedin: 'https://linkedin.com/company/figma',
    totalEmails: 1,
    lastAttempt: 'Aug 1',
    hasOpened: false,
    openCount: 0,
    hasClicked: false,
    clickCount: 0,
    hasResponded: false,
  },
];

export const mockPeople: Person[] = [
  {
    id: 1,
    companyId: 1,
    name: 'Alice Smith',
    email: 'alice@openai.com',
    position: 'Senior Engineering Manager',
    linkedin: 'https://linkedin.com/in/alice-smith',
    attempts: 2,
    lastEmailDate: '2024-07-31',
    opened: true,
    openCount: 3,
    clicked: true,
    clickCount: 1,
    responded: false,
  },
  {
    id: 2,
    companyId: 1,
    name: 'Bob Johnson',
    email: 'bob@openai.com',
    position: 'Technical Recruiter',
    linkedin: 'https://linkedin.com/in/bob-johnson',
    attempts: 0,
    lastEmailDate: '',
    opened: false,
    openCount: 0,
    clicked: false,
    clickCount: 0,
    responded: false,
  },
  {
    id: 3,
    companyId: 2,
    name: 'Carol Davis',
    email: 'carol@anthropic.com',
    position: 'Head of Engineering',
    linkedin: 'https://linkedin.com/in/carol-davis',
    attempts: 1,
    lastEmailDate: '2024-07-29',
    opened: true,
    openCount: 1,
    clicked: false,
    clickCount: 0,
    responded: false,
  },
  {
    id: 4,
    companyId: 3,
    name: 'David Wilson',
    email: 'david@stripe.com',
    position: 'Software Engineer',
    linkedin: 'https://linkedin.com/in/david-wilson',
    attempts: 3,
    lastEmailDate: '2024-07-25',
    opened: true,
    openCount: 2,
    clicked: true,
    clickCount: 2,
    responded: true,
  },
  {
    id: 5,
    companyId: 4,
    name: 'Eve Brown',
    email: 'eve@figma.com',
    position: 'Design Engineer',
    linkedin: 'https://linkedin.com/in/eve-brown',
    attempts: 1,
    lastEmailDate: '2024-08-01',
    opened: false,
    openCount: 0,
    clicked: false,
    clickCount: 0,
    responded: false,
  },
];

export const mockEmailStats: EmailStat[] = [
  {
    id: 1,
    personId: 1,
    attemptNumber: 1,
    sentDate: '2024-07-28',
    openCount: 2,
    clickCount: 1,
    responded: false,
    subject: 'Software Engineer Position - Let\'s Connect',
  },
  {
    id: 2,
    personId: 1,
    attemptNumber: 2,
    sentDate: '2024-07-31',
    openCount: 1,
    clickCount: 0,
    responded: false,
    subject: 'Following Up - Software Engineer Role',
  },
  {
    id: 3,
    personId: 3,
    attemptNumber: 1,
    sentDate: '2024-07-29',
    openCount: 1,
    clickCount: 0,
    responded: false,
    subject: 'Exploring Opportunities at Anthropic',
  },
  {
    id: 4,
    personId: 4,
    attemptNumber: 1,
    sentDate: '2024-07-20',
    openCount: 1,
    clickCount: 1,
    responded: false,
    subject: 'Software Engineer - Stripe',
  },
  {
    id: 5,
    personId: 4,
    attemptNumber: 2,
    sentDate: '2024-07-23',
    openCount: 1,
    clickCount: 1,
    responded: false,
    subject: 'Re: Software Engineer - Stripe',
  },
  {
    id: 6,
    personId: 4,
    attemptNumber: 3,
    sentDate: '2024-07-25',
    openCount: 0,
    clickCount: 0,
    responded: true,
    subject: 'Final Follow-up - Stripe Opportunity',
  },
];

export const mockStats = {
  totalEmails: 47,
  totalOpens: 32,
  totalClicks: 18,
  totalResponses: 5,
};
