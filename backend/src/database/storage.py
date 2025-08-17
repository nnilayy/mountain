import json
import os
from typing import List, Optional, Dict, Any
from uuid import uuid4
from pathlib import Path

from ..models import (
    Company, CompanyCreate, CompanyUpdate,
    Person, PersonCreate,
    EmailStat, EmailStatCreate
)


class JSONStorage:
    """JSON file-based storage implementation matching the original TypeScript interface."""
    
    def __init__(self, data_dir: str = None):
        if data_dir is None:
            data_dir = os.path.join(os.path.dirname(__file__), "data")
        
        self.data_dir = Path(data_dir)
        self.companies_file = self.data_dir / "companies.json"
        self.people_file = self.data_dir / "people.json"
        self.email_stats_file = self.data_dir / "email_stats.json"
        self.profile_file = self.data_dir / "profile.json"
        
        # Ensure data directory exists
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize files if they don't exist
        self._init_files()
        self._ensure_profile_file()
    
    def _init_files(self):
        """Initialize JSON files with empty arrays if they don't exist."""
        for file_path in [self.companies_file, self.people_file, self.email_stats_file]:
            if not file_path.exists():
                self._write_json(file_path, [])
    
    def _read_json(self, file_path: Path) -> List[Dict[str, Any]]:
        """Read and parse JSON file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    
    def _write_json(self, file_path: Path, data: List[Dict[str, Any]]):
        """Write data to JSON file."""
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def _ensure_profile_file(self):
        """Ensure profile.json exists with default data"""
        if not self.profile_file.exists():
            default_data = {
                "profile": {
                    "id": "profile",
                    "profileImage": None,
                    "emailCategories": ["Cold Outreach", "Follow-up", "Networking", "Application"],
                    "resumeCategories": ["Tech Resume", "Executive Resume", "Creative Resume"],
                    "coverLetterCategories": ["Tech Cover Letter", "Executive Cover Letter", "Creative Cover Letter"]
                },
                "clientConnections": {
                    "id": "client_connections",
                    "WhatsApp": True,
                    "Signal": False,
                    "Telegram": True,
                    "X": False,
                    "Discord": False,
                    "Mail": True,
                    "Mountains": True
                },
                "notificationSettings": {
                    "id": "notification_settings",
                    "WhatsApp": {"emailViews": True, "resumeViews": True, "responses": False},
                    "Signal": {"emailViews": True, "resumeViews": True, "responses": False},
                    "Telegram": {"emailViews": True, "resumeViews": True, "responses": False},
                    "X": {"emailViews": True, "resumeViews": True, "responses": False},
                    "Discord": {"emailViews": True, "resumeViews": True, "responses": False},
                    "Mail": {"emailViews": True, "resumeViews": True, "responses": False},
                    "Mountains": {"emailViews": True, "resumeViews": True, "responses": False}
                },
                "emailData": {
                    "id": "email_data",
                    "templateType": "Cold Outreach",
                    "subject": "",
                    "body": ""
                }
            }
            with open(self.profile_file, 'w', encoding='utf-8') as f:
                json.dump(default_data, f, indent=2, ensure_ascii=False)
    
    def _load_profile_data(self) -> Dict[str, Any]:
        """Load profile data from JSON file"""
        try:
            with open(self.profile_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            self._ensure_profile_file()
            with open(self.profile_file, 'r', encoding='utf-8') as f:
                return json.load(f)
    
    def _save_profile_data(self, data: Dict[str, Any]):
        """Save profile data to JSON file"""
        with open(self.profile_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def _calculate_company_stats(self, company_id: str) -> Dict[str, Any]:
        """Calculate statistics for a company based on people and email data."""
        people_data = self._read_json(self.people_file)
        email_stats_data = self._read_json(self.email_stats_file)
        
        # Get people for this company
        company_people = [p for p in people_data if p.get('companyId') == company_id]
        
        # Get email stats for this company
        company_emails = [e for e in email_stats_data if e.get('companyId') == company_id]
        
        # Calculate stats
        total_people = len(company_people)
        total_emails = len(company_emails)
        
        # Calculate opens, clicks, responses
        has_opened = any(p.get('opened', False) for p in company_people)
        open_count = sum(p.get('openCount', 0) for p in company_people)
        has_clicked = any(p.get('clicked', False) for p in company_people)
        click_count = sum(p.get('clickCount', 0) for p in company_people)
        resume_open_count = sum(p.get('resumeOpenCount', 0) for p in company_people)
        has_responded = any(p.get('responded', False) for p in company_people)
        
        return {
            'total_people': total_people,
            'total_emails': total_emails,
            'has_opened': has_opened,
            'open_count': open_count,
            'has_clicked': has_clicked,
            'click_count': click_count,
            'resume_open_count': resume_open_count,
            'has_responded': has_responded
        }
    
    def _normalize_website_url(self, url: str) -> str:
        """Normalize website URL to include https:// protocol."""
        if not url:
            return url
        if url.startswith(('http://', 'https://')):
            return url
        return f"https://{url}"
    
    # Companies
    async def get_companies(self) -> List[Company]:
        """Get all companies."""
        companies_data = self._read_json(self.companies_file)
        companies = []
        
        for company_data in companies_data:
            # Ensure crunchbase field is included
            if not company_data.get('crunchbase'):
                name = company_data.get('name', '').lower().replace(' ', '-')
                company_data['crunchbase'] = f"https://crunchbase.com/organization/{name}"
            
            # Calculate and add current stats
            stats = self._calculate_company_stats(company_data['id'])
            company_data.update(stats)
            
            companies.append(Company(**company_data))
        
        return companies
    
    async def get_company(self, company_id: str) -> Optional[Company]:
        """Get a company by ID."""
        companies_data = self._read_json(self.companies_file)
        
        for company_data in companies_data:
            if company_data['id'] == company_id:
                # Calculate and add current stats
                stats = self._calculate_company_stats(company_id)
                company_data.update(stats)
                return Company(**company_data)
        
        return None
    
    async def create_company(self, company: CompanyCreate) -> Company:
        """Create a new company."""
        companies_data = self._read_json(self.companies_file)
        
        # Generate new ID
        new_id = str(uuid4())
        
        # Get the input data with aliases
        input_data = company.model_dump(by_alias=True)
        
        # Create company data with proper defaults
        company_data = {
            "id": new_id,
            "name": input_data["name"],
            "website": self._normalize_website_url(input_data["website"]),
            "linkedin": input_data.get("linkedin"),
            "crunchbase": input_data.get("crunchbase"),
            "companySize": input_data.get("companySize"),
            "lastAttempt": input_data.get("lastAttempt"),
            "decision": input_data.get("decision"),
            # Default calculated fields
            "totalEmails": 0,
            "totalPeople": 0,
            "hasOpened": False,
            "openCount": 0,
            "hasClicked": False,
            "clickCount": 0,
            "resumeOpenCount": 0,
            "hasResponded": False,
        }
        
        companies_data.append(company_data)
        self._write_json(self.companies_file, companies_data)
        
        return Company(**company_data)
    
    async def update_company(self, company_id: str, updates: CompanyUpdate) -> Optional[Company]:
        """Update a company."""
        companies_data = self._read_json(self.companies_file)
        
        for i, company_data in enumerate(companies_data):
            if company_data['id'] == company_id:
                # Update the company data
                update_data = updates.model_dump(exclude_unset=True, by_alias=True)
                if 'website' in update_data:
                    update_data['website'] = self._normalize_website_url(update_data['website'])
                
                companies_data[i].update(update_data)
                self._write_json(self.companies_file, companies_data)
                
                return Company(**companies_data[i])
        
        return None
    
    async def delete_company(self, company_id: str) -> bool:
        """Delete a company."""
        companies_data = self._read_json(self.companies_file)
        
        for i, company_data in enumerate(companies_data):
            if company_data['id'] == company_id:
                companies_data.pop(i)
                self._write_json(self.companies_file, companies_data)
                return True
        
        return False
    
    # People
    async def get_people(self) -> List[Person]:
        """Get all people."""
        people_data = self._read_json(self.people_file)
        return [Person(**person_data) for person_data in people_data]
    
    async def get_people_by_company(self, company_id: str) -> List[Person]:
        """Get all people for a specific company."""
        people_data = self._read_json(self.people_file)
        
        company_people = []
        for person_data in people_data:
            if person_data['companyId'] == company_id:
                company_people.append(Person(**person_data))
        
        return company_people
    
    async def get_person(self, person_id: str) -> Optional[Person]:
        """Get a person by ID."""
        people_data = self._read_json(self.people_file)
        
        for person_data in people_data:
            if person_data['id'] == person_id:
                return Person(**person_data)
        
        return None
    
    async def create_person(self, person: PersonCreate) -> Person:
        """Create a new person."""
        people_data = self._read_json(self.people_file)
        
        # Generate new ID
        new_id = str(uuid4())
        
        # Create person data
        person_data = {
            **person.model_dump(),
            "id": new_id,
            "position": person.position,
            "linkedin": person.linkedin,
            "city": person.city,
            "country": person.country,
            "attempts": person.attempts or 0,
            "lastEmailDate": person.lastEmailDate,
            "opened": person.opened or False,
            "openCount": person.openCount or 0,
            "clicked": person.clicked or False,
            "clickCount": person.clickCount or 0,
            "resumeOpened": person.resumeOpened or False,
            "resumeOpenCount": person.resumeOpenCount or 0,
            "responded": person.responded or False,
        }
        
        people_data.append(person_data)
        self._write_json(self.people_file, person_data)
        
        return Person(**person_data)
    
    async def update_person(self, person_id: str, updates: PersonCreate) -> Optional[Person]:
        """Update a person."""
        people_data = self._read_json(self.people_file)
        
        for i, person_data in enumerate(people_data):
            if person_data['id'] == person_id:
                # Update the person data
                update_data = updates.model_dump(exclude_unset=True)
                people_data[i].update(update_data)
                self._write_json(self.people_file, people_data)
                
                return Person(**people_data[i])
        
        return None
    
    async def delete_person(self, person_id: str) -> bool:
        """Delete a person."""
        people_data = self._read_json(self.people_file)
        
        for i, person_data in enumerate(people_data):
            if person_data['id'] == person_id:
                people_data.pop(i)
                self._write_json(self.people_file, people_data)
                return True
        
        return False
    
    # Email Stats
    async def get_email_stats(self) -> List[EmailStat]:
        """Get all email statistics."""
        email_stats_data = self._read_json(self.email_stats_file)
        return [EmailStat(**stat_data) for stat_data in email_stats_data]
    
    async def get_email_stats_by_person(self, person_id: str) -> List[EmailStat]:
        """Get email statistics for a specific person."""
        email_stats_data = self._read_json(self.email_stats_file)
        
        person_stats = []
        for stat_data in email_stats_data:
            if stat_data['personId'] == person_id:
                person_stats.append(EmailStat(**stat_data))
        
        return person_stats
    
    async def create_email_stat(self, email_stat: EmailStatCreate) -> EmailStat:
        """Create a new email statistic."""
        email_stats_data = self._read_json(self.email_stats_file)
        
        # Generate new ID
        new_id = str(uuid4())
        
        # Create email stat data
        stat_data = {
            **email_stat.model_dump(),
            "id": new_id,
            "openCount": email_stat.openCount or 0,
            "clickCount": email_stat.clickCount or 0,
            "resumeOpenCount": email_stat.resumeOpenCount or 0,
            "responded": email_stat.responded or False,
        }
        
        email_stats_data.append(stat_data)
        self._write_json(self.email_stats_file, email_stats_data)
        
        return EmailStat(**stat_data)

    # Profile operations
    def get_profile(self) -> Dict[str, Any]:
        """Get profile data"""
        data = self._load_profile_data()
        return data.get("profile", {})
    
    def update_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update profile data"""
        data = self._load_profile_data()
        if "profile" not in data:
            data["profile"] = {"id": "profile"}
        
        # Update only provided fields
        for key, value in profile_data.items():
            if value is not None:
                data["profile"][key] = value
        
        self._save_profile_data(data)
        return data["profile"]
    
    # Client connections operations
    def get_client_connections(self) -> Dict[str, Any]:
        """Get client connections data"""
        data = self._load_profile_data()
        return data.get("clientConnections", {})
    
    def update_client_connections(self, connections_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update client connections data"""
        data = self._load_profile_data()
        if "clientConnections" not in data:
            data["clientConnections"] = {"id": "client_connections"}
        
        # Update only provided fields
        for key, value in connections_data.items():
            if value is not None:
                data["clientConnections"][key] = value
        
        self._save_profile_data(data)
        return data["clientConnections"]
    
    # Notification settings operations
    def get_notification_settings(self) -> Dict[str, Any]:
        """Get notification settings data"""
        data = self._load_profile_data()
        return data.get("notificationSettings", {})
    
    def update_notification_settings(self, settings_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update notification settings data"""
        data = self._load_profile_data()
        if "notificationSettings" not in data:
            data["notificationSettings"] = {"id": "notification_settings"}
        
        # Update only provided fields
        for key, value in settings_data.items():
            if value is not None:
                data["notificationSettings"][key] = value
        
        self._save_profile_data(data)
        return data["notificationSettings"]
    
    # Email data operations
    def get_email_data(self) -> Dict[str, Any]:
        """Get email template data"""
        data = self._load_profile_data()
        return data.get("emailData", {})
    
    def update_email_data(self, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update email template data"""
        data = self._load_profile_data()
        if "emailData" not in data:
            data["emailData"] = {"id": "email_data"}
        
        # Update only provided fields
        for key, value in email_data.items():
            if value is not None:
                data["emailData"][key] = value
        
        self._save_profile_data(data)
        return data["emailData"]


# Global storage instance
storage = JSONStorage()
