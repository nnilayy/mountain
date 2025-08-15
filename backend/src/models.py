from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# ================================
# Base Configuration
# ================================

class BaseConfig:
    validate_by_name = True  # Updated for Pydantic v2
    validate_assignment = True
    populate_by_name = True
    ser_by_alias = True  # Use aliases when serializing (Pydantic v2)

# ================================
# Company Models
# ================================

class CompanyBase(BaseModel):
    """Base company model with user-provided fields"""
    name: str = Field(..., description="Company name")
    website: str = Field(..., description="Company website URL")
    linkedin: Optional[str] = Field(None, description="LinkedIn company URL")
    crunchbase: Optional[str] = Field(None, description="Crunchbase company URL")
    company_size: Optional[str] = Field(None, alias="companySize", description="Company size: Small, Medium, Large, Enterprise")
    last_attempt: Optional[str] = Field(None, alias="lastAttempt", description="Last attempt date")
    decision: Optional[str] = Field(None, description="Decision: yes, no, or null for pending")
    
    class Config(BaseConfig):
        pass

class CompanyCreate(CompanyBase):
    """Model for creating a new company (POST requests)"""
    pass

class CompanyUpdate(BaseModel):
    """Model for updating a company (PATCH requests) - all fields optional"""
    name: Optional[str] = Field(None, description="Company name")
    website: Optional[str] = Field(None, description="Company website URL")
    linkedin: Optional[str] = Field(None, description="LinkedIn company URL")
    crunchbase: Optional[str] = Field(None, description="Crunchbase company URL")
    company_size: Optional[str] = Field(None, alias="companySize", description="Company size: Small, Medium, Large, Enterprise")
    last_attempt: Optional[str] = Field(None, alias="lastAttempt", description="Last attempt date")
    decision: Optional[str] = Field(None, description="Decision: yes, no, or null for pending")
    
    class Config(BaseConfig):
        pass

class Company(CompanyBase):
    """Complete company model with all fields (GET responses)"""
    id: str = Field(..., description="Unique company identifier")
    total_emails: int = Field(0, alias="totalEmails", description="Total emails sent to this company")
    total_people: int = Field(0, alias="totalPeople", description="Total people in this company")
    has_opened: bool = Field(False, alias="hasOpened", description="Whether any email was opened")
    open_count: int = Field(0, alias="openCount", description="Total email opens")
    has_clicked: bool = Field(False, alias="hasClicked", description="Whether any email was clicked")
    click_count: int = Field(0, alias="clickCount", description="Total email clicks")
    resume_open_count: int = Field(0, alias="resumeOpenCount", description="Total resume opens")
    has_responded: bool = Field(False, alias="hasResponded", description="Whether company has responded")

# ================================
# Person Models
# ================================

class PersonBase(BaseModel):
    """Base person model with user-provided fields"""
    company_id: str = Field(..., alias="companyId", description="ID of the company this person belongs to")
    name: str = Field(..., description="Person's full name")
    email: str = Field(..., description="Person's email address")
    position: Optional[str] = Field(None, description="Person's job position")
    linkedin: Optional[str] = Field(None, description="Person's LinkedIn URL")
    city: Optional[str] = Field(None, description="Person's city")
    country: Optional[str] = Field(None, description="Person's country")
    last_email_date: Optional[str] = Field(None, alias="lastEmailDate", description="Date of last email sent")
    
    class Config(BaseConfig):
        pass

class PersonCreate(PersonBase):
    """Model for creating a new person (POST requests)"""
    pass

class Person(PersonBase):
    """Complete person model with all fields (GET responses)"""
    id: str = Field(..., description="Unique person identifier")
    attempts: int = Field(0, description="Number of email attempts made")
    opened: bool = Field(False, description="Whether person opened any email")
    open_count: int = Field(0, alias="openCount", description="Total email opens by this person")
    clicked: bool = Field(False, description="Whether person clicked any email")
    click_count: int = Field(0, alias="clickCount", description="Total email clicks by this person")
    resume_opened: bool = Field(False, alias="resumeOpened", description="Whether person opened resume")
    resume_open_count: int = Field(0, alias="resumeOpenCount", description="Total resume opens by this person")
    responded: bool = Field(False, description="Whether person has responded")

# ================================
# Email Stats Models
# ================================

class EmailStatBase(BaseModel):
    """Base email stat model with user-provided fields"""
    person_id: str = Field(..., alias="personId", description="ID of the person this stat belongs to")
    company_id: str = Field(..., alias="companyId", description="ID of the company this stat belongs to")
    attempt_number: int = Field(..., alias="attemptNumber", description="Email attempt number (1, 2, 3)")
    sent_date: str = Field(..., alias="sentDate", description="Date when email was sent")
    subject: str = Field(..., description="Email subject line")
    
    class Config(BaseConfig):
        pass

class EmailStatCreate(EmailStatBase):
    """Model for creating a new email stat (POST requests)"""
    pass

class EmailStat(EmailStatBase):
    """Complete email stat model with all fields (GET responses)"""
    id: str = Field(..., description="Unique email stat identifier")
    open_count: int = Field(0, alias="openCount", description="Number of times email was opened")
    click_count: int = Field(0, alias="clickCount", description="Number of times email was clicked")
    resume_open_count: int = Field(0, alias="resumeOpenCount", description="Number of times resume was opened")
    responded: bool = Field(False, description="Whether this email received a response")

# ================================
# Profile Models
# ================================

class ProfileBase(BaseModel):
    """Base profile model with user-provided fields"""
    profile_image: Optional[str] = Field(None, alias="profileImage", description="Base64 encoded profile image or URL")
    email_categories: list[str] = Field(default_factory=lambda: ["Cold Outreach", "Follow-up", "Networking", "Application"], alias="emailCategories", description="Email template categories")
    resume_categories: list[str] = Field(default_factory=lambda: ["Tech Resume", "Executive Resume", "Creative Resume"], alias="resumeCategories", description="Resume categories")
    cover_letter_categories: list[str] = Field(default_factory=lambda: ["Tech Cover Letter", "Executive Cover Letter", "Creative Cover Letter"], alias="coverLetterCategories", description="Cover letter categories")
    
    class Config(BaseConfig):
        pass

class ProfileUpdate(BaseModel):
    """Model for updating profile (PATCH requests) - all fields optional"""
    profile_image: Optional[str] = Field(None, alias="profileImage", description="Base64 encoded profile image or URL")
    email_categories: Optional[list[str]] = Field(None, alias="emailCategories", description="Email template categories")
    resume_categories: Optional[list[str]] = Field(None, alias="resumeCategories", description="Resume categories")
    cover_letter_categories: Optional[list[str]] = Field(None, alias="coverLetterCategories", description="Cover letter categories")
    
    class Config(BaseConfig):
        pass

class Profile(ProfileBase):
    """Complete profile model with all fields (GET responses)"""
    id: str = Field(default="profile", description="Profile identifier (always 'profile')")

class ClientConnectionsBase(BaseModel):
    """Base model for client connection status"""
    whatsapp: bool = Field(True, alias="WhatsApp", description="WhatsApp connection status")
    signal: bool = Field(False, alias="Signal", description="Signal connection status")
    telegram: bool = Field(True, alias="Telegram", description="Telegram connection status")
    x: bool = Field(False, alias="X", description="X (Twitter) connection status")
    discord: bool = Field(False, alias="Discord", description="Discord connection status")
    mail: bool = Field(True, alias="Mail", description="Mail connection status")
    mountains: bool = Field(True, alias="Mountains", description="Mountains app connection status")
    
    class Config(BaseConfig):
        pass

class ClientConnectionsUpdate(BaseModel):
    """Model for updating client connections (PATCH requests) - all fields optional"""
    whatsapp: Optional[bool] = Field(None, alias="WhatsApp", description="WhatsApp connection status")
    signal: Optional[bool] = Field(None, alias="Signal", description="Signal connection status")
    telegram: Optional[bool] = Field(None, alias="Telegram", description="Telegram connection status")
    x: Optional[bool] = Field(None, alias="X", description="X (Twitter) connection status")
    discord: Optional[bool] = Field(None, alias="Discord", description="Discord connection status")
    mail: Optional[bool] = Field(None, alias="Mail", description="Mail connection status")
    mountains: Optional[bool] = Field(None, alias="Mountains", description="Mountains app connection status")
    
    class Config(BaseConfig):
        pass

class ClientConnections(ClientConnectionsBase):
    """Complete client connections model with all fields (GET responses)"""
    id: str = Field(default="client_connections", description="Client connections identifier")

class NotificationSettingsClient(BaseModel):
    """Notification settings for a single client"""
    email_views: bool = Field(True, alias="emailViews", description="Notify on email views")
    resume_views: bool = Field(True, alias="resumeViews", description="Notify on resume views")
    responses: bool = Field(False, description="Notify on responses")
    
    class Config(BaseConfig):
        pass

class NotificationSettingsBase(BaseModel):
    """Base model for notification settings"""
    whatsapp: NotificationSettingsClient = Field(default_factory=NotificationSettingsClient, alias="WhatsApp")
    signal: NotificationSettingsClient = Field(default_factory=NotificationSettingsClient, alias="Signal")
    telegram: NotificationSettingsClient = Field(default_factory=NotificationSettingsClient, alias="Telegram")
    x: NotificationSettingsClient = Field(default_factory=NotificationSettingsClient, alias="X")
    discord: NotificationSettingsClient = Field(default_factory=NotificationSettingsClient, alias="Discord")
    mail: NotificationSettingsClient = Field(default_factory=NotificationSettingsClient, alias="Mail")
    mountains: NotificationSettingsClient = Field(default_factory=NotificationSettingsClient, alias="Mountains")
    
    class Config(BaseConfig):
        pass

class NotificationSettingsUpdate(BaseModel):
    """Model for updating notification settings (PATCH requests) - all fields optional"""
    whatsapp: Optional[NotificationSettingsClient] = Field(None, alias="WhatsApp")
    signal: Optional[NotificationSettingsClient] = Field(None, alias="Signal")
    telegram: Optional[NotificationSettingsClient] = Field(None, alias="Telegram")
    x: Optional[NotificationSettingsClient] = Field(None, alias="X")
    discord: Optional[NotificationSettingsClient] = Field(None, alias="Discord")
    mail: Optional[NotificationSettingsClient] = Field(None, alias="Mail")
    mountains: Optional[NotificationSettingsClient] = Field(None, alias="Mountains")
    
    class Config(BaseConfig):
        pass

class NotificationSettings(NotificationSettingsBase):
    """Complete notification settings model with all fields (GET responses)"""
    id: str = Field(default="notification_settings", description="Notification settings identifier")

class EmailDataBase(BaseModel):
    """Base model for email template data"""
    cold_outreach: list[str] = Field(
        default_factory=lambda: [
            "Hi [Name], I came across your profile and would love to connect...",
            "Following up on my previous message about [Topic]...",
            "I hope this email finds you well. I'm reaching out because..."
        ],
        alias="Cold Outreach"
    )
    follow_up: list[str] = Field(
        default_factory=lambda: [
            "Thank you for taking the time to speak with me yesterday...",
            "I wanted to follow up on our conversation about [Topic]...",
            "Just checking in to see if you had any thoughts on..."
        ],
        alias="Follow-up"
    )
    networking: list[str] = Field(
        default_factory=lambda: [
            "I'd love to connect and learn more about your experience at [Company]...",
            "Would you be open to a brief coffee chat to discuss [Industry]?",
            "I'm always interested in connecting with fellow professionals..."
        ],
        alias="Networking"
    )
    application: list[str] = Field(
        default_factory=lambda: [
            "I am writing to express my strong interest in the [Position] role...",
            "I am excited to submit my application for [Position] at [Company]...",
            "Thank you for considering my application for the [Position] position..."
        ],
        alias="Application"
    )
    
    class Config(BaseConfig):
        pass

class EmailDataUpdate(BaseModel):
    """Model for updating email template data (PATCH requests) - all fields optional"""
    cold_outreach: Optional[list[str]] = Field(None, alias="Cold Outreach")
    follow_up: Optional[list[str]] = Field(None, alias="Follow-up")
    networking: Optional[list[str]] = Field(None, alias="Networking")
    application: Optional[list[str]] = Field(None, alias="Application")
    
    class Config(BaseConfig):
        pass

class EmailData(EmailDataBase):
    """Complete email template data model with all fields (GET responses)"""
    id: str = Field(default="email_data", description="Email data identifier")

# ================================
# API Response Models
# ================================

class StatsResponse(BaseModel):
    """Response model for the /api/stats endpoint"""
    total_emails: int
    total_opens: int
    total_clicks: int
    total_responses: int
    companies: list[Company]
    people: list[Person]
    email_stats: list[EmailStat]
