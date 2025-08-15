const API_BASE_URL = 'http://localhost:8000/api';

// Profile API types
export interface Profile {
  id: string;
  profileImage: string | null;
  emailCategories: string[];
  resumeCategories: string[];
  coverLetterCategories: string[];
}

export interface ClientConnections {
  id: string;
  WhatsApp: boolean;
  Signal: boolean;
  Telegram: boolean;
  X: boolean;
  Discord: boolean;
  Mail: boolean;
  Mountains: boolean;
}

export interface NotificationSettingsClient {
  emailViews: boolean;
  resumeViews: boolean;
  responses: boolean;
}

export interface NotificationSettings {
  id: string;
  WhatsApp: NotificationSettingsClient;
  Signal: NotificationSettingsClient;
  Telegram: NotificationSettingsClient;
  X: NotificationSettingsClient;
  Discord: NotificationSettingsClient;
  Mail: NotificationSettingsClient;
  Mountains: NotificationSettingsClient;
}

export interface EmailData {
  id: string;
  "Cold Outreach": string[];
  "Follow-up": string[];
  "Networking": string[];
  "Application": string[];
}

// Profile API functions
export const profileApi = {
  // Get profile data
  async getProfile(): Promise<Profile> {
    const response = await fetch(`${API_BASE_URL}/profile`);
    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }
    return response.json();
  },

  // Update profile data
  async updateProfile(profileData: Partial<Omit<Profile, 'id'>>): Promise<Profile> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.statusText}`);
    }
    return response.json();
  },

  // Get client connections
  async getClientConnections(): Promise<ClientConnections> {
    const response = await fetch(`${API_BASE_URL}/profile/client-connections`);
    if (!response.ok) {
      throw new Error(`Failed to fetch client connections: ${response.statusText}`);
    }
    return response.json();
  },

  // Update client connections
  async updateClientConnections(connectionsData: Partial<Omit<ClientConnections, 'id'>>): Promise<ClientConnections> {
    const response = await fetch(`${API_BASE_URL}/profile/client-connections`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(connectionsData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update client connections: ${response.statusText}`);
    }
    return response.json();
  },

  // Get notification settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await fetch(`${API_BASE_URL}/profile/notification-settings`);
    if (!response.ok) {
      throw new Error(`Failed to fetch notification settings: ${response.statusText}`);
    }
    return response.json();
  },

  // Update notification settings
  async updateNotificationSettings(settingsData: Partial<Omit<NotificationSettings, 'id'>>): Promise<NotificationSettings> {
    const response = await fetch(`${API_BASE_URL}/profile/notification-settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update notification settings: ${response.statusText}`);
    }
    return response.json();
  },

  // Get email template data
  async getEmailData(): Promise<EmailData> {
    const response = await fetch(`${API_BASE_URL}/profile/email-data`);
    if (!response.ok) {
      throw new Error(`Failed to fetch email data: ${response.statusText}`);
    }
    return response.json();
  },

  // Update email template data
  async updateEmailData(emailData: Partial<Omit<EmailData, 'id'>>): Promise<EmailData> {
    const response = await fetch(`${API_BASE_URL}/profile/email-data`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update email data: ${response.statusText}`);
    }
    return response.json();
  },
};
