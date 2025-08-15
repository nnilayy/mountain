import requests
import pycountry
import pandas as pd
import time
from tqdm import tqdm
from typing import Union, List, Dict, Any


class Holidays:
    """
    A class to fetch and manage holiday data for different countries.
    Uses the 11holidays API to retrieve holiday information.
    """
    
    def __init__(self):
        """Initialize the Holidays class with configuration data."""
        
        # Mapping for common country name variants to ISO official names
        self.country_name_mappings = {
            # Common US variations
            "US": "United States",
            "USA": "United States",
            "United States of America": "United States",
            "America": "United States",
            
            # Common UK variations
            "UK": "United Kingdom",
            "Great Britain": "United Kingdom",
            "Britain": "United Kingdom",
            "England": "United Kingdom",
            
            # Common other variations
            "Germany": "Germany",
            "DE": "Germany",
            "Deutschland": "Germany",
            
            "India": "India",
            "IN": "India",
            
            "Canada": "Canada",
            "CA": "Canada",
            
            "Australia": "Australia",
            "AU": "Australia",
            
            "France": "France",
            "FR": "France",
            
            "Japan": "Japan",
            "JP": "Japan",
            
            "China": "China",
            "CN": "China",
            
            # Existing mappings
            "Turkey": "Türkiye",
            "South Korea": "Korea, Republic of",
            "North Korea": "Korea, Democratic People's Republic of",
            "Vietnam": "Viet Nam",
            "Russia": "Russian Federation",
            "Iran": "Iran, Islamic Republic of",
            "Syria": "Syrian Arab Republic",
            "Laos": "Lao People's Democratic Republic",
            "Moldova": "Moldova, Republic of",
            "Venezuela": "Venezuela, Bolivarian Republic of",
            "Bolivia": "Bolivia, Plurinational State of",
            "Tanzania": "Tanzania, United Republic of",
            "Palestine": "Palestine, State of",
            "Brunei": "Brunei Darussalam",
            "Micronesia": "Micronesia, Federated States of",
            "Vatican City": "Holy See (Vatican City State)",
            "Taiwan": "Taiwan, Province of China",
            "U.S. Virgin Islands": "Virgin Islands, U.S.",
            "British Virgin Islands": "Virgin Islands, British",
            "Sint Maarten": "Sint Maarten (Dutch part)",
            "DR Congo": "Congo, The Democratic Republic of the",
            "Saint Helena": "Saint Helena, Ascension and Tristan da Cunha"
        }

        # Accepted holiday types for filtering
        self.accepted_holiday_types = [
            "Public Holiday",
            "National Holiday",
            "Local Holiday",
            "Observance, Christian",
            "Christian",
            "Restricted Holiday",
            "Gazetted Holiday",
            "District Holiday",
            "Bank/Public Sector Holiday",
            "Common State holiday",
            "Local holiday",
            "Bank / working holiday",
            "Observance, Hebrew",
            "National Holiday, Hebrew",
            "Sporting Event",
            "Local Bank Holiday",
            "State holiday",
            "De facto holiday",
            "State Legal Holiday",
            "Half Day",
            "Half-day",
            "Public Sector Holiday",
            "Municipal Holiday",
            "State Holiday",
            "Public holiday",
            "National holiday",
            "National Holiday, Christian",
            "Bank holiday",
            "National Holiday, Orthodox",
            "Federal Public Holiday",
            "Suspended National Holiday",
            "Official holiday",
            "Statutory Holiday",
            "Regular Holiday",
            "National/Legal Holiday",
            "Bank Holiday",
            "Obligatory Holiday",
            "Silent Day",
            "Special Non-working Holiday",
            "De Facto Holiday",
            "Half Day Holiday",
            "Half day holiday",
            "Government holiday",
            "Government Holiday",
            "De facto and Bank holiday",
            "Local de facto holiday",
            "Substitute Holiday",
            "National Day",
            "De Facto Half Holiday",
            "Bank and government holiday",
            "Non Compulsory Payment Holiday",
            "Private sector holiday",
            "Private Sector Holiday",
            "Half Day for Public Employees",
            "National Holiday, Flag Day",
            "Regional Holiday",
            "National Holiday, Muslim",
            "Half Day Restricted Trading Day",
            "Silent Day, public holiday",
            "Federal Territory Holiday",
            "Muslim, Common Local Holiday",
            "National Holiday, Hinduism"
        ]

        # Global mandate holidays (name, (month, day))
        self.global_mandate_holidays = [
            ("New Year's Day", (1, 1)),
            ("Day After New Year", (1, 2)),
            ("Christmas Eve", (12, 24)),
            ("Christmas Day", (12, 25)),
            ("Boxing Day", (12, 26)),
            ("New Year's Eve", (12, 31)),
        ]

    @staticmethod
    def get_country_name_from_code(code: str) -> str:
        """Convert ISO alpha-2 code to full country name."""
        try:
            return pycountry.countries.get(alpha_2=code).name
        except:
            return code  # fallback

    @staticmethod
    def fetch_holidays_for_country(country_code: str, year: int) -> List[Dict[str, Any]]:
        """Fetch holiday data from 11holidays API for a specific country."""
        url = f"https://api.11holidays.com/v1/holidays?country={country_code}&year={year}"
        try:
            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                return []
            holidays = response.json()
            return [
                {
                    "country": country_code,
                    "name": entry.get("name", "UNKNOWN"),
                    "date": entry.get("date", "UNKNOWN"),
                    "type": entry.get("type", "UNKNOWN")
                }
                for entry in holidays
            ]
        except:
            return []

    def fetch_holiday_data(self, year: int, countries: Union[str, List[str]] = "all", sleep_time: float = 0.1) -> pd.DataFrame:
        """
        Fetch holiday data for all or specific countries.

        Args:
            year (int): Year for which to fetch holidays.
            countries (str or list): 'all', a single country name, or a list of country names.
            sleep_time (float): Optional sleep between requests.

        Returns:
            pd.DataFrame: Combined holiday data.
        """
        all_data = []

        if countries == "all":
            country_codes = [country.alpha_2 for country in pycountry.countries]
        elif isinstance(countries, str):
            iso_name = self.country_name_mappings.get(countries, countries)
            country_obj = pycountry.countries.get(name=iso_name)
            if not country_obj:
                raise ValueError(f"Invalid country name: {countries}")
            country_codes = [country_obj.alpha_2]
        elif isinstance(countries, list):
            country_codes = []
            for name in countries:
                iso_name = self.country_name_mappings.get(name, name)
                country_obj = pycountry.countries.get(name=iso_name)
                if not country_obj:
                    raise ValueError(f"Invalid country name in list: {name}")
                country_codes.append(country_obj.alpha_2)
        else:
            raise TypeError("countries must be 'all', a string, or a list of strings")

        for code in tqdm(country_codes, desc="Fetching holiday data"):
            holidays = self.fetch_holidays_for_country(code, year)
            all_data.extend(holidays)
            time.sleep(sleep_time)

        df = pd.DataFrame(all_data)
        if not df.empty:
            df["country"] = df["country"].apply(self.get_country_name_from_code)
        return df

    def filter_by_type(self, df: pd.DataFrame, allowed_types: List[str] = None) -> pd.DataFrame:
        """Filter the holidays by allowed types only."""
        if allowed_types is None:
            allowed_types = self.accepted_holiday_types
        return df[df["type"].isin(allowed_types)].copy()

    def append_mandate_holidays(self, df: pd.DataFrame, year: int) -> pd.DataFrame:
        """
        For each country present in the DataFrame, append known global mandate holidays
        like New Year's Day, Christmas, etc., with type='Mandate Holiday'.
        """
        new_rows = []
        unique_countries = df["country"].unique() if not df.empty else []

        for country in unique_countries:
            for name, (month, day) in self.global_mandate_holidays:
                date_str = f"{year}-{month:02d}-{day:02d}"
                new_rows.append({
                    "country": country,
                    "name": name,
                    "date": date_str,
                    "type": "Mandate Holiday"
                })

        if new_rows:
            df = pd.concat([df, pd.DataFrame(new_rows)], ignore_index=True)
        return df

    def deduplicate_holidays(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Deduplicate holiday data:
        1. Drop duplicates based on (country, name, date)
        2. Further remove duplicate dates per country (keep one holiday for each country-date)
        3. Sort the DataFrame by country and date
        """
        if df.empty:
            return df
            
        df = df.drop_duplicates(subset=["country", "name", "date"])
        df = df.drop_duplicates(subset=["country", "date"])  # keep first holiday for each country-date
        df = df.sort_values(by=["country", "date"]).reset_index(drop=True)
        return df

    def get_holidays(self, year: int, countries: Union[str, List[str]] = "all", 
                     include_mandate: bool = True, sleep_time: float = 0.1) -> pd.DataFrame:
        """
        Complete workflow to fetch, filter, and process holiday data.
        
        Args:
            year (int): Year for which to fetch holidays.
            countries (str or list): 'all', a single country name, or a list of country names.
            include_mandate (bool): Whether to include mandate holidays.
            sleep_time (float): Sleep time between API requests.
            
        Returns:
            pd.DataFrame: Processed holiday data.
        """
        # Fetch holiday data
        df = self.fetch_holiday_data(year, countries=countries, sleep_time=sleep_time)
        
        # Filter by allowed types
        df = self.filter_by_type(df, self.accepted_holiday_types)
        
        # Add mandate holidays if requested
        if include_mandate:
            df = self.append_mandate_holidays(df, year)
        
        # Deduplicate
        df = self.deduplicate_holidays(df)
        
        return df


# Example usage function
def example_usage():
    """Example of how to use the Holidays class."""
    holidays = Holidays()
    
    # Fetch holidays for Malaysia in 2025
    countries = "Japan"
    year = 2025
    
    df = holidays.get_holidays(year, countries=countries)
    # print(f"Found {len(df)} holidays for {countries} in {year}")
    print(df)
    
    return df


if __name__ == "__main__":
    example_usage()
