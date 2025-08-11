from datetime import datetime, timedelta
import pytz
import pycountry
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
from holidays import Holidays


class Scheduler:
    def __init__(self):
        self.geolocator = Nominatim(user_agent="geo_email_scheduler")
        self.timezone_finder = TimezoneFinder()
        self.holidays_client = Holidays()
        self.schedule_chain = {
            'Monday': 'Thursday',
            'Tuesday': 'Friday',
            'Wednesday': 'Monday',
            'Thursday': 'Monday',
            'Friday': 'Tuesday',
        }

    def get_country_code(self, country_name: str) -> str | None:
        """Return ISO alpha-2 code for a given country name using pycountry."""
        try:
            country = pycountry.countries.get(name=country_name)
            if country:
                return country.alpha_2
            for c in pycountry.countries:
                if (
                    c.name.lower() == country_name.lower()
                    or getattr(c, "official_name", "").lower() == country_name.lower()
                    or getattr(c, "common_name", "").lower() == country_name.lower()
                ):
                    return c.alpha_2
        except Exception:
            pass
        return None

    def is_weekend(self, date_object: datetime) -> bool:
        return date_object.weekday() >= 5

    def is_holiday(self, date_object: datetime, holiday_dates: set) -> bool:
        return date_object.date() in holiday_dates

    def is_past_buffer_today(self, date_object: datetime, current_datetime: datetime,
                             send_hour: int, buffer_hours: int) -> bool:
        return date_object.date() == current_datetime.date() and current_datetime.hour >= send_hour - buffer_hours

    def advance_to_next_weekday(self, start_date_object: datetime, target_weekday_name: str) -> datetime:
        while start_date_object.strftime("%A") != target_weekday_name:
            start_date_object += timedelta(days=1)
        return start_date_object

    def get_email_schedule(self,
                           city: str | None = None,
                           state: str | None = None,
                           country: str = 'India',
                           start_date_str: str | None = None,
                           send_hour: int = 8,
                           buffer_hours: int = 2) -> list[str]:
        """Generate the next 3 scheduled dates at send_hour, excluding weekends and holidays."""
        location_string = ', '.join(filter(None, [city, state, country]))
        location_data = self.geolocator.geocode(location_string)
        if not location_data:
            raise ValueError(f"Could not find location: {location_string}")

        timezone_name = self.timezone_finder.timezone_at(
            lat=location_data.latitude, lng=location_data.longitude
        )
        if not timezone_name:
            raise ValueError(f"Could not resolve timezone for: {location_string}")
        local_timezone = pytz.timezone(timezone_name)

        country_code = self.get_country_code(country)
        if not country_code:
            raise ValueError(f"Country '{country}' not supported by the holidays library.")
        
        current_datetime_utc = datetime.utcnow()
        current_datetime_local = pytz.utc.localize(current_datetime_utc).astimezone(local_timezone)
        
        # Get holidays for the current year using our custom Holidays class
        current_year = current_datetime_local.year
        holidays_df = self.holidays_client.get_holidays(current_year, countries=country)
        
        # Convert to a set of dates for fast lookup
        holiday_dates = set()
        if not holidays_df.empty:
            for _, row in holidays_df.iterrows():
                try:
                    holiday_date = datetime.strptime(row['date'], '%Y-%m-%d').date()
                    holiday_dates.add(holiday_date)
                except:
                    continue

        current_date_object = (
            current_datetime_local
            if start_date_str is None
            else local_timezone.localize(datetime.strptime(start_date_str, "%Y-%m-%d"))
        )

        scheduled_dates: list[str] = []

        while len(scheduled_dates) < 3:
            current_weekday_name = current_date_object.strftime("%A")

            if (
                not self.is_weekend(current_date_object)
                and not self.is_holiday(current_date_object, holiday_dates)
                and not self.is_past_buffer_today(current_date_object, current_datetime_local, send_hour, buffer_hours)
            ):
                scheduled_datetime = current_date_object.replace(
                    hour=send_hour, minute=0, second=0, microsecond=0
                )
                scheduled_dates.append(scheduled_datetime.strftime('%Y-%m-%d %I:%M %p'))

                if current_weekday_name not in self.schedule_chain:
                    raise ValueError(f"No mapping for weekday: {current_weekday_name}")
                target_next_weekday = self.schedule_chain[current_weekday_name]
                current_date_object = self.advance_to_next_weekday(
                    current_date_object + timedelta(days=1),
                    target_next_weekday
                )
            else:
                current_date_object += timedelta(days=1)

        return scheduled_dates


# Example usage function
def example_usage():
    """Example of how to use the Scheduler class."""
    scheduler = Scheduler()
    
    # Get email schedule for Mumbai, India
    try:
        schedule = scheduler.get_email_schedule(
            city="Mumbai",
            state="Maharashtra", 
            country="India",
            send_hour=9,
            buffer_hours=2
        )
        print("Next 3 scheduled email dates:")
        for date in schedule:
            print(f"  {date}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    example_usage()
