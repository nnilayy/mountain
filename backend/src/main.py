from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Union, List, Optional
import pandas as pd
from .holidays import Holidays
import uvicorn

app = FastAPI(
    title="Mountain Backend API",
    description="Backend API for Mountain job outreach and tracking application",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize holidays service
holidays_service = Holidays()


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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
