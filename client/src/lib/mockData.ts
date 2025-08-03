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
    totalEmails: 4, // 4 people contacted
    lastAttempt: 'Jul 31',
    hasOpened: true,
    openCount: 5, // Combined opens from all people
    hasClicked: true,
    clickCount: 1,
    hasResponded: false,
  },
  {
    id: 2,
    name: 'Anthropic',
    website: 'anthropic.com',
    linkedin: 'https://linkedin.com/company/anthropic',
    totalEmails: 3, // 3 people contacted
    lastAttempt: 'Jul 29',
    hasOpened: true,
    openCount: 3, // Combined opens from all people
    hasClicked: true,
    clickCount: 1,
    hasResponded: false,
  },
  {
    id: 3,
    name: 'Stripe',
    website: 'stripe.com',
    linkedin: 'https://linkedin.com/company/stripe',
    totalEmails: 6, // 3 people, multiple attempts
    lastAttempt: 'Jul 26',
    hasOpened: true,
    openCount: 5, // Combined opens from all people
    hasClicked: true,
    clickCount: 3,
    hasResponded: true,
  },
  {
    id: 4,
    name: 'Figma',
    website: 'figma.com',
    linkedin: 'https://linkedin.com/company/figma',
    totalEmails: 2, // 2 people contacted
    lastAttempt: 'Aug 1',
    hasOpened: true,
    openCount: 1,
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


  // OpenAI - Additional people (id 3 & 4 for OpenAI)
  {
    id: 3,
    companyId: 1,
    name: 'Charlie Zhang',
    email: 'charlie@openai.com',
    position: 'AI Research Scientist',
    linkedin: 'https://linkedin.com/in/charlie-zhang',
    attempts: 1,
    lastEmailDate: '2024-07-30',
    opened: true,
    openCount: 2,
    clicked: false,
    clickCount: 0,
    responded: false,
  },
  {
    id: 4,
    companyId: 1,
    name: 'Diana Martinez',
    email: 'diana@openai.com',
    position: 'Product Manager',
    linkedin: 'https://linkedin.com/in/diana-martinez',
    attempts: 1,
    lastEmailDate: '2024-07-31',
    opened: false,
    openCount: 0,
    clicked: false,
    clickCount: 0,
    responded: false,
  },
  // Anthropic - Additional people (id 5, 6, 7 for Anthropic)
  {
    id: 5,
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
    id: 6,
    companyId: 2,
    name: 'Frank Thompson',
    email: 'frank@anthropic.com',
    position: 'Senior Software Engineer',
    linkedin: 'https://linkedin.com/in/frank-thompson',
    attempts: 0,
    lastEmailDate: '',
    opened: false,
    openCount: 0,
    clicked: false,
    clickCount: 0,
    responded: false,
  },
  {
    id: 7,
    companyId: 2,
    name: 'Grace Lee',
    email: 'grace@anthropic.com',
    position: 'AI Safety Researcher',
    linkedin: 'https://linkedin.com/in/grace-lee',
    attempts: 1,
    lastEmailDate: '2024-07-28',
    opened: true,
    openCount: 1,
    clicked: true,
    clickCount: 1,
    responded: false,
  },
  // Stripe - Additional people (id 8, 9, 10 for Stripe)
  {
    id: 8,
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
    id: 9,
    companyId: 3,
    name: 'Hannah Garcia',
    email: 'hannah@stripe.com',
    position: 'Engineering Manager',
    linkedin: 'https://linkedin.com/in/hannah-garcia',
    attempts: 2,
    lastEmailDate: '2024-07-24',
    opened: true,
    openCount: 3,
    clicked: true,
    clickCount: 1,
    responded: false,
  },
  {
    id: 10,
    companyId: 3,
    name: 'Ian Rodriguez',
    email: 'ian@stripe.com',
    position: 'Platform Engineer',
    linkedin: 'https://linkedin.com/in/ian-rodriguez',
    attempts: 1,
    lastEmailDate: '2024-07-26',
    opened: false,
    openCount: 0,
    clicked: false,
    clickCount: 0,
    responded: false,
  },
  // Figma - Additional people (id 11, 12, 13 for Figma)
  {
    id: 11,
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
  {
    id: 12,
    companyId: 4,
    name: 'Jack Kumar',
    email: 'jack@figma.com',
    position: 'Senior Product Designer',
    linkedin: 'https://linkedin.com/in/jack-kumar',
    attempts: 0,
    lastEmailDate: '',
    opened: false,
    openCount: 0,
    clicked: false,
    clickCount: 0,
    responded: false,
  },
  {
    id: 13,
    companyId: 4,
    name: 'Kelly Patel',
    email: 'kelly@figma.com',
    position: 'Frontend Engineer',
    linkedin: 'https://linkedin.com/in/kelly-patel',
    attempts: 1,
    lastEmailDate: '2024-07-31',
    opened: true,
    openCount: 1,
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
    personId: 8,
    attemptNumber: 3,
    sentDate: '2024-07-25',
    openCount: 0,
    clickCount: 0,
    responded: true,
    subject: 'Final Follow-up - Stripe Opportunity',
  },
  // Additional email stats for new people
  {
    id: 7,
    personId: 3,
    attemptNumber: 1,
    sentDate: '2024-07-30',
    openCount: 2,
    clickCount: 0,
    responded: false,
    subject: 'AI Research Position - OpenAI',
  },
  {
    id: 8,
    personId: 4,
    attemptNumber: 1,
    sentDate: '2024-07-31',
    openCount: 0,
    clickCount: 0,
    responded: false,
    subject: 'Product Manager Role - Let\'s Connect',
  },
  {
    id: 9,
    personId: 5,
    attemptNumber: 1,
    sentDate: '2024-07-29',
    openCount: 1,
    clickCount: 0,
    responded: false,
    subject: 'Engineering Leadership - Anthropic',
  },
  {
    id: 10,
    personId: 7,
    attemptNumber: 1,
    sentDate: '2024-07-28',
    openCount: 1,
    clickCount: 1,
    responded: false,
    subject: 'AI Safety Research Position',
  },
  {
    id: 11,
    personId: 9,
    attemptNumber: 1,
    sentDate: '2024-07-24',
    openCount: 2,
    clickCount: 1,
    responded: false,
    subject: 'Engineering Manager - Stripe',
  },
  {
    id: 12,
    personId: 9,
    attemptNumber: 2,
    sentDate: '2024-07-24',
    openCount: 1,
    clickCount: 0,
    responded: false,
    subject: 'Follow-up: Engineering Manager Role',
  },
  {
    id: 13,
    personId: 10,
    attemptNumber: 1,
    sentDate: '2024-07-26',
    openCount: 0,
    clickCount: 0,
    responded: false,
    subject: 'Platform Engineer Opportunity',
  },
  {
    id: 14,
    personId: 11,
    attemptNumber: 1,
    sentDate: '2024-08-01',
    openCount: 0,
    clickCount: 0,
    responded: false,
    subject: 'Design Engineer Position - Figma',
  },
  {
    id: 15,
    personId: 13,
    attemptNumber: 1,
    sentDate: '2024-07-31',
    openCount: 1,
    clickCount: 0,
    responded: false,
    subject: 'Frontend Engineer Role',
  },
];

export const mockStats = {
  totalEmails: 47,
  totalOpens: 32,
  totalClicks: 18,
  totalResponses: 5,
};
