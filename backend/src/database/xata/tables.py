"""
Database Table Schemas
Contains all PostgreSQL table definitions for the Mountain application
"""

# Table schemas with proper TZ-aware timestamps and constraints
TABLE_SCHEMAS = {
    "profiles": """
        CREATE TABLE IF NOT EXISTS profiles (
            id SERIAL PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone_number TEXT,
            state_or_city TEXT,
            country TEXT,
            personal_profile_photo BYTEA,
            linkedin_url TEXT,
            github_url TEXT,
            twitter_url TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """,
    
    "companies": """
        CREATE TABLE IF NOT EXISTS companies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_name TEXT NOT NULL,
            company_size TEXT CHECK (company_size IN ('1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10,000','10,001+')),
            company_profile_photo BYTEA,
            website_url TEXT,
            linkedin_url TEXT,
            crunchbase_url TEXT,
            company_specific_resume TEXT,
            company_specific_cover_letter TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """,
    
    "holidays": """
        CREATE TABLE IF NOT EXISTS holidays (
            id SERIAL PRIMARY KEY,
            country TEXT NOT NULL,
            name TEXT NOT NULL,
            date DATE NOT NULL,
            holiday_type TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE (country, date, name)
        )
    """,
    
    "personal_data_resumes_and_cover_letters": """
        CREATE TABLE IF NOT EXISTS personal_data_resumes_and_cover_letters (
            id SERIAL PRIMARY KEY,
            profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            document_type TEXT NOT NULL CHECK (document_type IN ('resume','cover_letter')),
            category TEXT NOT NULL,
            link TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE (profile_id, document_type, category)
        )
    """,
    
    "personal_data_mails": """
        CREATE TABLE IF NOT EXISTS personal_data_mails (
            id SERIAL PRIMARY KEY,
            profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            campaign_number TEXT NOT NULL CHECK (campaign_number IN ('first','second','third')),
            subject TEXT,
            body TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE (profile_id, campaign_number)
        )
    """,
    
    "personal_notifications": """
        CREATE TABLE IF NOT EXISTS personal_notifications (
            id SERIAL PRIMARY KEY,
            profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            client TEXT NOT NULL CHECK (client IN ('whatsapp','signal','telegram','twitter','discord','mail','mountains')),
            notification_type TEXT NOT NULL CHECK (notification_type IN ('email_view','resume_view','response')),
            is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
            is_connected BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE (profile_id, client, notification_type)
        )
    """,
    
    "company_specific_mails": """
        CREATE TABLE IF NOT EXISTS company_specific_mails (
            id SERIAL PRIMARY KEY,
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            campaign_number TEXT NOT NULL CHECK (campaign_number IN ('first','second','third')),
            subject TEXT,
            body TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE (company_id, campaign_number)
        )
    """,
    
    "company_specific_resumes_and_cover_letters": """
        CREATE TABLE IF NOT EXISTS company_specific_resumes_and_cover_letters (
            id SERIAL PRIMARY KEY,
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            document_type TEXT NOT NULL CHECK (document_type IN ('resume','cover_letter')),
            category TEXT NOT NULL,
            link TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE (company_id, document_type, category)
        )
    """,
    
    "people": """
        CREATE TABLE IF NOT EXISTS people (
            id SERIAL PRIMARY KEY,
            company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
            email TEXT NOT NULL UNIQUE,
            linkedin_url TEXT,
            job_position TEXT,
            country TEXT,
            state_or_city TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """,
    
    "email_campaigns": """
        CREATE TABLE IF NOT EXISTS email_campaigns (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            campaign_number TEXT NOT NULL CHECK (campaign_number IN ('first','second','third')),
            thread_id TEXT,
            message_id TEXT,
            person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
            subject TEXT NOT NULL,
            body TEXT NOT NULL,
            is_scheduled BOOLEAN DEFAULT FALSE,
            is_sent BOOLEAN DEFAULT FALSE,
            sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            response_received BOOLEAN DEFAULT FALSE,
            response_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            responded_by TEXT,
            response_message TEXT,
            decision_received BOOLEAN DEFAULT FALSE,
            status TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE (person_id, campaign_number)
        )
    """,
    
    "trigger_events_for_resumes_and_cover_letters": """
        CREATE TABLE IF NOT EXISTS trigger_events_for_resumes_and_cover_letters (
            id SERIAL PRIMARY KEY,
            person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
            email UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
            campaign_number TEXT NOT NULL CHECK (campaign_number IN ('first','second','third')),
            event_type TEXT NOT NULL CHECK (event_type IN ('email_view','resume_view')),
            event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT,
            user_agent TEXT,
            referrer TEXT,
            triggered_url TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """
}

# Table creation order (respecting foreign key dependencies)
TABLE_CREATION_ORDER = [
    # Base tables (no foreign keys)
    "profiles",
    "companies", 
    "holidays",
    
    # Tables that reference profiles
    "personal_data_resumes_and_cover_letters",
    "personal_data_mails",
    "personal_notifications",
    
    # Tables that reference companies
    "company_specific_mails",
    "company_specific_resumes_and_cover_letters",
    "people",  # References companies
    
    # Tables that reference people
    "email_campaigns",  # References people
    
    # Tables that reference both people and email_campaigns
    "trigger_events_for_resumes_and_cover_letters"
]
