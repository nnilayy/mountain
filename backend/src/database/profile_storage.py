import json
import os
from typing import Dict, Any, Optional
from pathlib import Path

class ProfileStorage:
    def __init__(self, data_dir: str = None):
        if data_dir is None:
            # Use path relative to this file's location
            current_file_dir = Path(__file__).parent
            self.data_dir = current_file_dir / "data"
        else:
            self.data_dir = Path(data_dir)
        self.profile_file = self.data_dir / "profile.json"
        self._ensure_data_directory()
        self._ensure_profile_file()
    
    def _ensure_data_directory(self):
        """Ensure the data directory exists"""
        self.data_dir.mkdir(exist_ok=True)
    
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
                    "Cold Outreach": [
                        "Hi [Name], I came across your profile and would love to connect...",
                        "Following up on my previous message about [Topic]...",
                        "I hope this email finds you well. I'm reaching out because..."
                    ],
                    "Follow-up": [
                        "Thank you for taking the time to speak with me yesterday...",
                        "I wanted to follow up on our conversation about [Topic]...",
                        "Just checking in to see if you had any thoughts on..."
                    ],
                    "Networking": [
                        "I'd love to connect and learn more about your experience at [Company]...",
                        "Would you be open to a brief coffee chat to discuss [Industry]?",
                        "I'm always interested in connecting with fellow professionals..."
                    ],
                    "Application": [
                        "I am writing to express my strong interest in the [Position] role...",
                        "I am excited to submit my application for [Position] at [Company]...",
                        "Thank you for considering my application for the [Position] position..."
                    ]
                }
            }
            self._save_data(default_data)
    
    def _load_data(self) -> Dict[str, Any]:
        """Load profile data from JSON file"""
        try:
            with open(self.profile_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            # Return default data if file doesn't exist or is corrupted
            self._ensure_profile_file()
            with open(self.profile_file, 'r', encoding='utf-8') as f:
                return json.load(f)
    
    def _save_data(self, data: Dict[str, Any]):
        """Save profile data to JSON file"""
        with open(self.profile_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Profile operations
    def get_profile(self) -> Dict[str, Any]:
        """Get profile data"""
        data = self._load_data()
        return data.get("profile", {})
    
    def update_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update profile data"""
        data = self._load_data()
        if "profile" not in data:
            data["profile"] = {"id": "profile"}
        
        # Update only provided fields
        for key, value in profile_data.items():
            if value is not None:
                data["profile"][key] = value
        
        self._save_data(data)
        return data["profile"]
    
    # Client connections operations
    def get_client_connections(self) -> Dict[str, Any]:
        """Get client connections data"""
        data = self._load_data()
        return data.get("clientConnections", {})
    
    def update_client_connections(self, connections_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update client connections data"""
        data = self._load_data()
        if "clientConnections" not in data:
            data["clientConnections"] = {"id": "client_connections"}
        
        # Update only provided fields
        for key, value in connections_data.items():
            if value is not None:
                data["clientConnections"][key] = value
        
        self._save_data(data)
        return data["clientConnections"]
    
    # Notification settings operations
    def get_notification_settings(self) -> Dict[str, Any]:
        """Get notification settings data"""
        data = self._load_data()
        return data.get("notificationSettings", {})
    
    def update_notification_settings(self, settings_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update notification settings data"""
        data = self._load_data()
        if "notificationSettings" not in data:
            data["notificationSettings"] = {"id": "notification_settings"}
        
        # Update only provided fields
        for key, value in settings_data.items():
            if value is not None:
                data["notificationSettings"][key] = value
        
        self._save_data(data)
        return data["notificationSettings"]
    
    # Email data operations
    def get_email_data(self) -> Dict[str, Any]:
        """Get email template data"""
        data = self._load_data()
        return data.get("emailData", {})
    
    def update_email_data(self, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update email template data"""
        data = self._load_data()
        if "emailData" not in data:
            data["emailData"] = {"id": "email_data"}
        
        # Update only provided fields
        for key, value in email_data.items():
            if value is not None:
                data["emailData"][key] = value
        
        self._save_data(data)
        return data["emailData"]

# Create global instance
profile_storage = ProfileStorage()
