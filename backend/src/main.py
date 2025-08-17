from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Union, List, Optional
from pydantic import BaseModel, ValidationError
import uvicorn

from .models import (
    CompanyCreate, CompanyUpdate, Company,
    PersonCreate, Person,
    EmailStatCreate, EmailStat,
    StatsResponse,
    ProfileUpdate, Profile,
    ClientConnectionsUpdate, ClientConnections,
    NotificationSettingsUpdate, NotificationSettings,
    EmailDataUpdate, EmailData
)
from .database.storage import storage
from .holidays import Holidays
from .scheduler import Scheduler

app = FastAPI(
    title="Mountain Backend API",
    description="Backend API for Mountain job outreach and tracking application",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
holidays_service = Holidays()
scheduler_service = Scheduler()


# Stats response model
class StatsResponseModel(BaseModel):
    totalEmails: int
    totalOpens: int
    totalClicks: int
    totalResponses: int
    companies: List[Company]
    people: List[Person]
    emailStats: List[EmailStat]


# Pydantic models for scheduling (legacy feature)
class PersonLocation(BaseModel):
    person_id: str
    name: str
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"


class ScheduleRequest(BaseModel):
    people: List[PersonLocation]
    send_hour: int = 9
    send_minute: int = 0
    send_am_pm: str = "AM"  # "AM" or "PM"
    buffer_hours: int = 2
    start_date: Optional[str] = None  # Format: "YYYY-MM-DD"


# =============================================================================
# COMPANIES ENDPOINTS
# =============================================================================

@app.get("/api/companies", response_model=List[Company])
async def get_companies():
    """Get all companies."""
    try:
        companies = await storage.get_companies()
        return companies
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch companies")


@app.get("/api/companies/{company_id}", response_model=Company)
async def get_company(company_id: str):
    """Get a specific company by ID."""
    try:
        company = await storage.get_company(company_id)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        return company
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch company")


@app.post("/api/companies", response_model=Company, status_code=201)
async def create_company(company_data: CompanyCreate):
    """Create a new company."""
    try:
        company = await storage.create_company(company_data)
        return company
    except ValidationError as e:
        raise HTTPException(status_code=400, detail="Invalid company data")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create company")


@app.patch("/api/companies/{company_id}", response_model=Company)
async def update_company(company_id: str, updates: CompanyUpdate):
    """Update a company."""
    try:
        company = await storage.update_company(company_id, updates)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        return company
    except ValidationError as e:
        raise HTTPException(status_code=400, detail="Invalid update data")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update company")


@app.delete("/api/companies/{company_id}", status_code=204)
async def delete_company(company_id: str):
    """Delete a company."""
    try:
        deleted = await storage.delete_company(company_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Company not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete company")


# =============================================================================
# PEOPLE ENDPOINTS
# =============================================================================

@app.get("/api/people", response_model=List[Person])
async def get_people(companyId: Optional[str] = Query(None)):
    """Get all people, optionally filtered by company."""
    try:
        if companyId:
            people = await storage.get_people_by_company(companyId)
        else:
            people = await storage.get_people()
        return people
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch people")


@app.get("/api/people/{person_id}", response_model=Person)
async def get_person(person_id: str):
    """Get a specific person by ID."""
    try:
        person = await storage.get_person(person_id)
        if not person:
            raise HTTPException(status_code=404, detail="Person not found")
        return person
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch person")


@app.post("/api/people", response_model=Person, status_code=201)
async def create_person(person_data: PersonCreate):
    """Create a new person."""
    try:
        person = await storage.create_person(person_data)
        return person
    except ValidationError as e:
        raise HTTPException(status_code=400, detail="Invalid person data")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create person")


@app.patch("/api/people/{person_id}", response_model=Person)
async def update_person(person_id: str, updates: PersonCreate):
    """Update a person."""
    try:
        person = await storage.update_person(person_id, updates)
        if not person:
            raise HTTPException(status_code=404, detail="Person not found")
        return person
    except ValidationError as e:
        raise HTTPException(status_code=400, detail="Invalid update data")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update person")


@app.delete("/api/people/{person_id}", status_code=204)
async def delete_person(person_id: str):
    """Delete a person."""
    try:
        deleted = await storage.delete_person(person_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Person not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete person")


# =============================================================================
# EMAIL STATS ENDPOINTS
# =============================================================================

@app.get("/api/email-stats", response_model=List[EmailStat])
async def get_email_stats(personId: Optional[str] = Query(None)):
    """Get all email statistics, optionally filtered by person."""
    try:
        if personId:
            email_stats = await storage.get_email_stats_by_person(personId)
        else:
            email_stats = await storage.get_email_stats()
        return email_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch email stats")


@app.post("/api/email-stats", response_model=EmailStat, status_code=201)
async def create_email_stat(email_stat_data: EmailStatCreate):
    """Create a new email statistic."""
    try:
        email_stat = await storage.create_email_stat(email_stat_data)
        return email_stat
    except ValidationError as e:
        raise HTTPException(status_code=400, detail="Invalid email stat data")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create email stat")


# =============================================================================
# STATS ENDPOINT
# =============================================================================

@app.get("/api/stats", response_model=StatsResponseModel)
async def get_stats():
    """Get aggregated statistics for the dashboard."""
    try:
        companies = await storage.get_companies()
        people = await storage.get_people()
        email_stats = await storage.get_email_stats()

        # Calculate aggregated stats
        total_emails = sum(company.total_emails for company in companies)
        total_opens = sum(company.open_count for company in companies)
        total_clicks = sum(company.click_count for company in companies)
        total_responses = sum(1 for company in companies if company.has_responded)

        return StatsResponseModel(
            totalEmails=total_emails,
            totalOpens=total_opens,
            totalClicks=total_clicks,
            totalResponses=total_responses,
            companies=companies,
            people=people,
            emailStats=email_stats
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch stats")


# =============================================================================
# LEGACY SCHEDULING ENDPOINT
# =============================================================================

@app.post("/api/schedule")
async def create_schedule(request: ScheduleRequest):
    """
    Create email schedules for multiple people based on their locations.
    
    Args:
        request: ScheduleRequest containing people data and scheduling parameters
        
    Returns:
        Dictionary with scheduling results for each person
    """
    try:
        results = {}
        
        # Convert 12-hour format to 24-hour format for scheduler
        if request.send_am_pm.upper() == "PM" and request.send_hour != 12:
            send_hour_24 = request.send_hour + 12
        elif request.send_am_pm.upper() == "AM" and request.send_hour == 12:
            send_hour_24 = 0
        else:
            send_hour_24 = request.send_hour
        
        # Process each person
        holidays_data = {}  # Store holidays by location to avoid duplicates
        
        for person in request.people:
            try:
                # Get schedule and holidays for this person
                schedule_result = scheduler_service.get_email_schedule(
                    city=person.city,
                    state=person.state,
                    country=person.country,
                    start_date_str=request.start_date,
                    send_hour=send_hour_24,
                    buffer_hours=request.buffer_hours
                )
                
                # Store holidays data by location key to avoid duplicates
                location_key = f"{person.city or 'Unknown'}-{person.state or 'Unknown'}-{person.country}"
                if location_key not in holidays_data:
                    holidays_data[location_key] = {
                        "holidays": schedule_result["holidays"],
                        "location": schedule_result["location"]
                    }
                
                results[person.person_id] = {
                    "person_id": person.person_id,
                    "name": person.name,
                    "location": {
                        "city": person.city,
                        "state": person.state,
                        "country": person.country
                    },
                    "schedule_dates": schedule_result["scheduled_dates"],
                    "status": "success"
                }
                
            except Exception as person_error:
                results[person.person_id] = {
                    "person_id": person.person_id,
                    "name": person.name,
                    "location": {
                        "city": person.city,
                        "state": person.state,
                        "country": person.country
                    },
                    "schedule_dates": [],
                    "status": "error",
                    "error": str(person_error)
                }
        
        # Calculate summary
        successful_schedules = sum(1 for result in results.values() if result["status"] == "success")
        failed_schedules = len(results) - successful_schedules
        
        return {
            "results": results,
            "holidays": holidays_data,
            "summary": {
                "total_people": len(request.people),
                "successful_schedules": successful_schedules,
                "failed_schedules": failed_schedules,
                "schedule_parameters": {
                    "send_time": f"{request.send_hour}:{request.send_minute:02d} {request.send_am_pm}",
                    "buffer_hours": request.buffer_hours,
                    "start_date": request.start_date
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scheduling error: {str(e)}")


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Mountain Backend API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Mountain Backend API"}


@app.get("/api/holidays")
async def get_holidays(
    year: int,
    countries: Optional[str] = "all",
    include_mandate: bool = True,
    format: str = "json"
):
    """
    Get holidays for specified countries and year.
    
    Args:
        year: Year for which to fetch holidays
        countries: Country name, comma-separated list, or 'all' for all countries
        include_mandate: Whether to include mandate holidays
        format: Response format ('json' or 'csv')
    """
    try:
        # Parse countries parameter
        if countries == "all":
            countries_list = "all"
        else:
            countries_list = [country.strip() for country in countries.split(",")]
        
        # Fetch holidays
        df = holidays_service.get_holidays(
            year=year,
            countries=countries_list,
            include_mandate=include_mandate
        )
        
        if format.lower() == "csv":
            # Return CSV format
            csv_content = df.to_csv(index=False)
            return {"data": csv_content, "format": "csv", "count": len(df)}
        else:
            # Return JSON format
            holidays_data = df.to_dict("records")
            return {
                "data": holidays_data,
                "format": "json",
                "count": len(holidays_data),
                "year": year,
                "countries": countries
            }
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/holidays/{country}")
async def get_holidays_by_country(
    country: str,
    year: int,
    include_mandate: bool = True
):
    """
    Get holidays for a specific country.
    
    Args:
        country: Country name
        year: Year for which to fetch holidays
        include_mandate: Whether to include mandate holidays
    """
    try:
        df = holidays_service.get_holidays(
            year=year,
            countries=country,
            include_mandate=include_mandate
        )
        
        holidays_data = df.to_dict("records")
        return {
            "data": holidays_data,
            "count": len(holidays_data),
            "country": country,
            "year": year
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/countries")
async def get_supported_countries():
    """Get list of supported countries."""
    try:
        import pycountry
        countries = [
            {
                "name": country.name,
                "code": country.alpha_2,
                "common_name": next(
                    (k for k, v in holidays_service.country_name_mappings.items() if v == country.name),
                    country.name
                )
            }
            for country in pycountry.countries
        ]
        return {
            "data": countries,
            "count": len(countries)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# ================================
# Profile Endpoints
# ================================

from .database.storage import storage

@app.get("/api/profile", response_model=Profile)
async def get_profile():
    """Get user profile data."""
    try:
        profile_data = storage.get_profile()
        return Profile(**profile_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.patch("/api/profile", response_model=Profile)
async def update_profile(profile_update: ProfileUpdate):
    """Update user profile data."""
    try:
        # Convert Pydantic model to dict with aliases
        update_data = profile_update.model_dump(by_alias=True, exclude_unset=True)
        updated_profile = storage.update_profile(update_data)
        return Profile(**updated_profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/profile/client-connections", response_model=ClientConnections)
async def get_client_connections():
    """Get client connection status."""
    try:
        connections_data = storage.get_client_connections()
        return ClientConnections(**connections_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.patch("/api/profile/client-connections", response_model=ClientConnections)
async def update_client_connections(connections_update: ClientConnectionsUpdate):
    """Update client connection status."""
    try:
        # Convert Pydantic model to dict with aliases
        update_data = connections_update.model_dump(by_alias=True, exclude_unset=True)
        updated_connections = storage.update_client_connections(update_data)
        return ClientConnections(**updated_connections)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/profile/notification-settings", response_model=NotificationSettings)
async def get_notification_settings():
    """Get notification settings."""
    try:
        settings_data = storage.get_notification_settings()
        return NotificationSettings(**settings_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.patch("/api/profile/notification-settings", response_model=NotificationSettings)
async def update_notification_settings(settings_update: NotificationSettingsUpdate):
    """Update notification settings."""
    try:
        # Convert Pydantic model to dict with aliases
        update_data = settings_update.model_dump(by_alias=True, exclude_unset=True)
        updated_settings = storage.update_notification_settings(update_data)
        return NotificationSettings(**updated_settings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/profile/email-data", response_model=EmailData)
async def get_email_data():
    """Get email template data."""
    try:
        email_data = storage.get_email_data()
        return EmailData(**email_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.patch("/api/profile/email-data", response_model=EmailData)
async def update_email_data(email_update: EmailDataUpdate):
    """Update email template data."""
    try:
        # Convert Pydantic model to dict with aliases
        update_data = email_update.model_dump(by_alias=True, exclude_unset=True)
        updated_email_data = storage.update_email_data(update_data)
        return EmailData(**updated_email_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
