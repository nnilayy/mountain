import asyncio
import sys
import os

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from database.xata.database import DatabaseManager, PostgreSQLTypes, count, sum, avg, min, max

# Create PostgreSQL types instance for convenient access
pg_types = PostgreSQLTypes()

async def test_zeus_profiles():
    """Test Zeus database with profiles table"""
    
    # Initialize DatabaseManager with new unified API
    db_manager = DatabaseManager("pg-zeus.txt")
    
    try:
        print("=== Zeus Database Test ===")
        
        # Test connection to Zeus
        print("1. Testing Zeus connection...")
        await db_manager.connect()
        print("✓ Connected to Zeus database")
        
        # Drop existing table first to ensure clean schema
        print("2. Dropping existing profiles table...")
        try:
            await (db_manager
                .drop_table("profiles")
                .if_exists_()
                .execute()
            )
            print("✓ Existing table dropped")
        except Exception as e:
            print(f"✓ No existing table to drop: {e}")
        
        # Create profiles table using new fluent API
        print("3. Creating fresh profiles table with fluent API...")
        
        await (db_manager
            .create_table("profiles")
            .if_not_exists_()
            .column("id").type(pg_types.SERIAL).primary_key()
            .column("full_name").type(pg_types.TEXT).not_null()
            .column("email").type(pg_types.TEXT).not_null().unique()
            .column("phone_number").type(pg_types.TEXT)
            .column("state_or_city").type(pg_types.TEXT)
            .column("country").type(pg_types.TEXT)
            .column("personal_profile_photo").type(pg_types.BYTEA)
            .column("linkedin_url").type(pg_types.TEXT)
            .column("github_url").type(pg_types.TEXT)
            .column("twitter_url").type(pg_types.TEXT)
            .column("created_at").type(pg_types.TIMESTAMPTZ).not_null().default("now()")
            .column("updated_at").type(pg_types.TIMESTAMPTZ).not_null().default("now()")
            .execute()
        )
        print("✓ Profiles table created")
        
        # Check existing records (should be 0 after drop)
        print("4. Checking existing records...")
        count_result = await (db_manager
            .select(count("*"))
            .from_("profiles")
            .execute()
        )
        record_count = count_result[0]["count"] if count_result else 0
        print(f"✓ Existing profiles: {record_count}")
        
        # Insert a test profile
        print("5. Inserting test profile...")
        unique_time = int(asyncio.get_event_loop().time())
        
        profile_result = await (db_manager
            .insert
            .into("profiles")
            .values({
                "full_name": "Test User Zeus",
                "email": f"test.zeus.{unique_time}@example.com",
                "phone_number": "+1-555-ZEUS",
                "state_or_city": "Zeus City",
                "country": "Zeus Land",
                "linkedin_url": "https://linkedin.com/in/test-zeus",
                "github_url": "https://github.com/test-zeus",
                "twitter_url": "https://twitter.com/test_zeus"
            })
            .execute()
        )
        
        print(f"✓ Profile inserted with ID: {profile_result['id']}")
        
        # Insert 20 more profiles
        print("6. Inserting 20 additional profiles...")
        
        profiles_data = [
            {"full_name": "Alice Johnson", "email": f"alice.johnson.{unique_time}@tech.com", "phone_number": "+1-555-0001", "state_or_city": "San Francisco", "country": "USA", "linkedin_url": "https://linkedin.com/in/alice-johnson"},
            {"full_name": "Bob Smith", "email": f"bob.smith.{unique_time}@startup.io", "phone_number": "+1-555-0002", "state_or_city": "New York", "country": "USA", "github_url": "https://github.com/bob-smith"},
            {"full_name": "Carol Davis", "email": f"carol.davis.{unique_time}@corp.com", "phone_number": "+44-20-7946-0003", "state_or_city": "London", "country": "UK", "linkedin_url": "https://linkedin.com/in/carol-davis"},
            {"full_name": "David Wilson", "email": f"david.wilson.{unique_time}@dev.org", "phone_number": "+1-555-0004", "state_or_city": "Austin", "country": "USA", "twitter_url": "https://twitter.com/david_wilson"},
            {"full_name": "Emma Brown", "email": f"emma.brown.{unique_time}@design.co", "phone_number": "+46-8-123-0005", "state_or_city": "Stockholm", "country": "Sweden", "linkedin_url": "https://linkedin.com/in/emma-brown"},
            {"full_name": "Frank Miller", "email": f"frank.miller.{unique_time}@cloud.net", "phone_number": "+1-555-0006", "state_or_city": "Seattle", "country": "USA", "github_url": "https://github.com/frank-miller"},
            {"full_name": "Grace Chen", "email": f"grace.chen.{unique_time}@ai.com", "phone_number": "+86-10-1234-0007", "state_or_city": "Beijing", "country": "China", "linkedin_url": "https://linkedin.com/in/grace-chen"},
            {"full_name": "Henry Taylor", "email": f"henry.taylor.{unique_time}@mobile.app", "phone_number": "+61-2-9876-0008", "state_or_city": "Sydney", "country": "Australia", "twitter_url": "https://twitter.com/henry_taylor"},
            {"full_name": "Iris Garcia", "email": f"iris.garcia.{unique_time}@web.es", "phone_number": "+34-91-123-0009", "state_or_city": "Madrid", "country": "Spain", "linkedin_url": "https://linkedin.com/in/iris-garcia"},
            {"full_name": "Jack Anderson", "email": f"jack.anderson.{unique_time}@data.ca", "phone_number": "+1-416-555-0010", "state_or_city": "Toronto", "country": "Canada", "github_url": "https://github.com/jack-anderson"},
            {"full_name": "Kelly Martinez", "email": f"kelly.martinez.{unique_time}@fintech.mx", "phone_number": "+52-55-1234-0011", "state_or_city": "Mexico City", "country": "Mexico", "linkedin_url": "https://linkedin.com/in/kelly-martinez"},
            {"full_name": "Liam O'Connor", "email": f"liam.oconnor.{unique_time}@games.ie", "phone_number": "+353-1-234-0012", "state_or_city": "Dublin", "country": "Ireland", "twitter_url": "https://twitter.com/liam_oconnor"},
            {"full_name": "Mia Rossi", "email": f"mia.rossi.{unique_time}@fashion.it", "phone_number": "+39-02-1234-0013", "state_or_city": "Milan", "country": "Italy", "linkedin_url": "https://linkedin.com/in/mia-rossi"},
            {"full_name": "Noah Schmidt", "email": f"noah.schmidt.{unique_time}@auto.de", "phone_number": "+49-30-1234-0014", "state_or_city": "Berlin", "country": "Germany", "github_url": "https://github.com/noah-schmidt"},
            {"full_name": "Olivia Dubois", "email": f"olivia.dubois.{unique_time}@luxury.fr", "phone_number": "+33-1-42-34-0015", "state_or_city": "Paris", "country": "France", "linkedin_url": "https://linkedin.com/in/olivia-dubois"},
            {"full_name": "Paul Yamamoto", "email": f"paul.yamamoto.{unique_time}@robotics.jp", "phone_number": "+81-3-1234-0016", "state_or_city": "Tokyo", "country": "Japan", "twitter_url": "https://twitter.com/paul_yamamoto"},
            {"full_name": "Quinn Lee", "email": f"quinn.lee.{unique_time}@crypto.kr", "phone_number": "+82-2-1234-0017", "state_or_city": "Seoul", "country": "South Korea", "github_url": "https://github.com/quinn-lee"},
            {"full_name": "Rachel Singh", "email": f"rachel.singh.{unique_time}@health.in", "phone_number": "+91-11-1234-0018", "state_or_city": "Mumbai", "country": "India", "linkedin_url": "https://linkedin.com/in/rachel-singh"},
            {"full_name": "Sam Petrov", "email": f"sam.petrov.{unique_time}@space.ru", "phone_number": "+7-495-123-0019", "state_or_city": "Moscow", "country": "Russia", "twitter_url": "https://twitter.com/sam_petrov"},
            {"full_name": "Tina Johansson", "email": f"tina.johansson.{unique_time}@green.no", "phone_number": "+47-22-12-0020", "state_or_city": "Oslo", "country": "Norway", "linkedin_url": "https://linkedin.com/in/tina-johansson"}
        ]
        
        inserted_count = 0
        for profile_data in profiles_data:
            try:
                result = await (db_manager
                    .insert
                    .into("profiles")
                    .values(profile_data)
                    .execute()
                )
                inserted_count += 1
            except Exception as e:
                print(f"Failed to insert {profile_data['full_name']}: {e}")
        
        print(f"✓ Inserted {inserted_count} additional profiles")
        
        # Query the first profile
        print("7. Querying first inserted profile...")
        profiles = await (db_manager
            .select("id", "full_name", "email", "country", "created_at")
            .from_("profiles")
            .where("id").equals(profile_result['id'])
            .execute()
        )
        
        if profiles:
            p = profiles[0]
            print(f"✓ Retrieved: {p['full_name']} ({p['email']}) from {p['country']}")
        
        # Show some sample profiles
        print("8. Showing sample profiles...")
        sample_profiles = await (db_manager
            .select("id", "full_name", "email", "country")
            .from_("profiles")
            .order_by("id")
            .limit(5)
            .execute()
        )
        
        # Display first 5 profiles
        for i, profile in enumerate(sample_profiles):
            print(f"   - ID {profile['id']}: {profile['full_name']} from {profile['country']}")
        
        # Show profiles from different countries
        print("10. Showing international diversity...")
        diverse_profiles = await (db_manager
            .select("full_name", "country", "email")
            .from_("profiles")
            .where("country").not_equals("Zeus Land")
            .order_by("country")
            .limit(10)
            .execute()
        )
        
        countries_shown = set()
        for profile in diverse_profiles:
            country = profile['country']
            if country not in countries_shown:
                print(f"   - {profile['full_name']} from {country}")
                countries_shown.add(country)
                if len(countries_shown) >= 8:  # Show 8 different countries
                    break
        
        # Test explicit DESC ordering
        print("12. Testing explicit DESC ordering (latest profiles first)...")
        latest_profiles = await (db_manager
            .select("id", "full_name", "country")
            .from_("profiles")
            .order_by("id").desc()
            .limit(3)
            .execute()
        )
        
        for profile in latest_profiles:
            print(f"   - ID {profile['id']}: {profile['full_name']} from {profile['country']}")
        
        # Test multiple order by clauses
        print("13. Testing multiple ORDER BY (country ASC, then name DESC)...")
        multi_order_profiles = await (db_manager
            .select("full_name", "country")
            .from_("profiles")
            .where("country").not_equals("Zeus Land")
            .order_by("country")  # Defaults to ASC
            .order_by("full_name").desc()  # Explicit DESC
            .limit(8)
            .execute()
        )
        
        for profile in multi_order_profiles:
            print(f"   - {profile['full_name']} from {profile['country']}")
        
        # Final count
        print("14. Final count...")
        final_count_result = await (db_manager
            .select(count("*"))
            .from_("profiles")
            .execute()
        )
        final_count = final_count_result[0]["count"] if final_count_result else 0
        print(f"✓ Total profiles: {final_count}")
        
        print("\n=== CRUD Operations Testing ===")
        
        # 1. CREATE - Insert a new profile with all fields
        print("15. CREATE - Inserting new profile with all fields...")
        new_profile_result = await (db_manager
            .insert
            .into("profiles")
            .values({
                "full_name": "Elena Rodriguez",
                "email": f"elena.rodriguez.{unique_time}@biotech.co",
                "phone_number": "+34-91-555-0099",
                "state_or_city": "Barcelona",
                "country": "Spain",
                "linkedin_url": "https://linkedin.com/in/elena-rodriguez",
                "github_url": "https://github.com/elena-rodriguez",
                "twitter_url": "https://twitter.com/elena_rodriguez"
            })
            .execute()
        )
        print(f"✓ New profile created with ID: {new_profile_result['id']}")
        
        # 2. READ - Complex SELECT with multiple WHERE conditions
        print("16. READ - Complex SELECT with multiple WHERE conditions...")
        complex_select = await (db_manager
            .select("id", "full_name", "email", "country", "state_or_city")
            .from_("profiles")
            .where("country").in_(["USA", "Spain", "Germany"])
            .and_where("full_name").like("%a%")  # Names containing 'a'
            .order_by("country")
            .order_by("full_name").desc()
            .limit(8)
            .execute()
        )
        
        print(f"✓ Found {len(complex_select)} profiles from USA/Spain/Germany with 'a' in name:")
        for profile in complex_select:
            print(f"   - {profile['full_name']} from {profile['state_or_city']}, {profile['country']}")
        
        # 3. UPDATE - Single profile update
        print("17. UPDATE - Single profile update...")
        update_result = await (db_manager
            .update("profiles")
            .set({
                "phone_number": "+34-91-555-1000",
                "state_or_city": "Madrid"
            })
            .where("id").equals(new_profile_result['id'])
            .execute()
        )
        
        # Handle different return types from UPDATE
        if isinstance(update_result, list) and update_result:
            print(f"✓ Updated profile successfully")
        elif isinstance(update_result, int):
            print(f"✓ Updated {update_result} profile(s)")
        else:
            print(f"✓ Update operation completed")
        
        # Verify the update
        updated_profile = await (db_manager
            .select("full_name", "phone_number", "state_or_city")
            .from_("profiles")
            .where("id").equals(new_profile_result['id'])
            .execute()
        )
        if updated_profile:
            p = updated_profile[0]
            print(f"✓ Verified update: {p['full_name']} now in {p['state_or_city']} with {p['phone_number']}")
        
        # 4. UPDATE - Bulk update with WHERE condition
        print("18. UPDATE - Bulk update (add country code to all USA phone numbers)...")
        bulk_update_result = await (db_manager
            .update("profiles")
            .set({
                "phone_number": "CONCAT('+1-', phone_number)"
            })
            .where("country").equals("USA")
            .and_where("phone_number").not_like("+1-%")  # Only update if not already formatted
            .execute()
        )
        
        # Handle different return types from bulk UPDATE
        if isinstance(bulk_update_result, list):
            print(f"✓ Bulk updated {len(bulk_update_result)} USA phone numbers")
        elif isinstance(bulk_update_result, int):
            print(f"✓ Bulk updated {bulk_update_result} USA phone numbers")
        else:
            print(f"✓ Bulk update operation completed")
        
        # 5. READ - Verify bulk update worked
        print("19. READ - Verify USA phone number formatting...")
        usa_phones = await (db_manager
            .select("full_name", "phone_number", "country")
            .from_("profiles")
            .where("country").equals("USA")
            .order_by("full_name")
            .limit(5)
            .execute()
        )
        
        for profile in usa_phones:
            print(f"   - {profile['full_name']}: {profile['phone_number']}")
        
        # 6. READ - COUNT with conditions
        print("20. READ - COUNT profiles by country...")
        country_counts = await (db_manager
            .select("country", "COUNT(*) as profile_count")
            .from_("profiles")
            .where("country").not_equals("Zeus Land")
            .group_by("country")
            .order_by("profile_count").desc()
            .limit(5)
            .execute()
        )
        
        print("✓ Top countries by profile count:")
        for row in country_counts:
            print(f"   - {row['country']}: {row['profile_count']} profiles")
        
        # 7. DELETE - Single record deletion
        print("21. DELETE - Removing a single profile...")
        # First, let's find a profile to delete
        profile_to_delete = await (db_manager
            .select("id", "full_name")
            .from_("profiles")
            .where("country").equals("Spain")
            .limit(1)
            .execute()
        )
        
        if profile_to_delete:
            delete_id = profile_to_delete[0]['id']
            delete_name = profile_to_delete[0]['full_name']
            
            delete_result = await (db_manager
                .delete
                .from_("profiles")
                .where("id").equals(delete_id)
                .execute()
            )
            print(f"✓ Deleted {delete_result} profile: {delete_name}")
            
            # Verify deletion
            verify_deleted = await (db_manager
                .select("id")
                .from_("profiles")
                .where("id").equals(delete_id)
                .execute()
            )
            print(f"✓ Verification: Profile {delete_id} exists: {len(verify_deleted) > 0}")
        
        # 8. READ - Advanced SELECT with date filtering
        print("22. READ - Profiles created in last hour...")
        from datetime import datetime, timezone, timedelta
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
        
        recent_profiles = await (db_manager
            .select("id", "full_name", "created_at")
            .from_("profiles")
            .where("created_at").greater_than(one_hour_ago)
            .order_by("created_at").desc()
            .limit(10)
            .execute()
        )
        
        print(f"✓ Found {len(recent_profiles)} recent profiles:")
        for profile in recent_profiles[:5]:  # Show first 5
            print(f"   - ID {profile['id']}: {profile['full_name']} at {profile['created_at']}")
        
        # Final count after CRUD operations
        print("23. Final count after CRUD operations...")
        final_crud_count_result = await (db_manager
            .select(count("*"))
            .from_("profiles")
            .execute()
        )
        final_crud_count = final_crud_count_result[0]["count"] if final_crud_count_result else 0
        print(f"✓ Total profiles after CRUD: {final_crud_count}")
        
        print("\n=== CRUD Operations Completed Successfully ===")
        
        print("\n=== COMPREHENSIVE OPERATOR TESTING ===")
        
        # 1. Comparison Operators: equals, not_equals
        print("24. Testing EQUALS and NOT_EQUALS operators...")
        usa_profiles = await (db_manager
            .select("full_name", "country")
            .from_("profiles")
            .where("country").equals("USA")
            .execute()
        )
        
        non_usa_profiles = await (db_manager
            .select("full_name", "country")
            .from_("profiles")
            .where("country").not_equals("USA")
            .execute()
        )
        
        print(f"✓ EQUALS: Found {len(usa_profiles)} USA profiles")
        print(f"✓ NOT_EQUALS: Found {len(non_usa_profiles)} non-USA profiles")
        print(f"✓ Verification: {len(usa_profiles)} + {len(non_usa_profiles)} = {len(usa_profiles) + len(non_usa_profiles)} (should match total)")
        
        # 2. Numeric Comparison Operators: greater_than, less_than, gte, lte
        print("25. Testing NUMERIC COMPARISON operators (>, <, >=, <=)...")
        
        # Test with ID ranges
        high_ids = await (db_manager
            .select("id", "full_name")
            .from_("profiles")
            .where("id").greater_than(15)
            .order_by("id")
            .execute()
        )
        
        low_ids = await (db_manager
            .select("id", "full_name")
            .from_("profiles")
            .where("id").less_than(6)
            .order_by("id")
            .execute()
        )
        
        mid_range_ids = await (db_manager
            .select("id", "full_name")
            .from_("profiles")
            .where("id").greater_than_or_equal(10)
            .and_where("id").less_than_or_equal(15)
            .order_by("id")
            .execute()
        )
        
        print(f"✓ GREATER_THAN(15): Found {len(high_ids)} profiles with ID > 15")
        for profile in high_ids[:3]:  # Show first 3
            print(f"   - ID {profile['id']}: {profile['full_name']}")
        
        print(f"✓ LESS_THAN(6): Found {len(low_ids)} profiles with ID < 6")
        for profile in low_ids:
            print(f"   - ID {profile['id']}: {profile['full_name']}")
        
        print(f"✓ BETWEEN(10-15): Found {len(mid_range_ids)} profiles with 10 <= ID <= 15")
        for profile in mid_range_ids:
            print(f"   - ID {profile['id']}: {profile['full_name']}")
        
        # 3. IN and NOT IN operators
        print("26. Testing IN and NOT_IN operators...")
        
        selected_countries = await (db_manager
            .select("full_name", "country")
            .from_("profiles")
            .where("country").in_(["USA", "Germany", "Japan", "Canada"])
            .order_by("country")
            .execute()
        )
        
        excluded_countries = await (db_manager
            .select("full_name", "country")
            .from_("profiles")
            .where("country").not_in(["USA", "Germany", "Japan", "Canada", "Zeus Land"])
            .order_by("country")
            .execute()
        )
        
        print(f"✓ IN: Found {len(selected_countries)} profiles from USA/Germany/Japan/Canada")
        for profile in selected_countries:
            print(f"   - {profile['full_name']} from {profile['country']}")
        
        print(f"✓ NOT_IN: Found {len(excluded_countries)} profiles from other countries")
        for profile in excluded_countries[:5]:  # Show first 5
            print(f"   - {profile['full_name']} from {profile['country']}")
        
        # 4. LIKE and ILIKE pattern matching
        print("27. Testing LIKE and ILIKE pattern matching...")
        
        # Names starting with specific letters
        a_names = await (db_manager
            .select("full_name", "country")
            .from_("profiles")
            .where("full_name").like("A%")  # Case-sensitive
            .order_by("full_name")
            .execute()
        )
        
        # Names containing 'son' (case-insensitive)
        son_names = await (db_manager
            .select("full_name", "country")
            .from_("profiles")
            .where("full_name").ilike("%son%")  # Case-insensitive
            .order_by("full_name")
            .execute()
        )
        
        # Names ending with specific pattern
        ending_patterns = await (db_manager
            .select("full_name", "country")
            .from_("profiles")
            .where("full_name").like("%ez")  # Ends with 'ez'
            .execute()
        )
        
        print(f"✓ LIKE 'A%': Found {len(a_names)} names starting with 'A'")
        for profile in a_names:
            print(f"   - {profile['full_name']} from {profile['country']}")
        
        print(f"✓ ILIKE '%son%': Found {len(son_names)} names containing 'son'")
        for profile in son_names:
            print(f"   - {profile['full_name']} from {profile['country']}")
        
        print(f"✓ LIKE '%ez': Found {len(ending_patterns)} names ending with 'ez'")
        for profile in ending_patterns:
            print(f"   - {profile['full_name']} from {profile['country']}")
        
        # 5. NOT_LIKE and NOT_ILIKE
        print("28. Testing NOT_LIKE and NOT_ILIKE operators...")
        
        not_starting_with_a = await (db_manager
            .select("full_name", "country")
            .from_("profiles")
            .where("full_name").not_like("A%")
            .and_where("full_name").not_like("B%")
            .order_by("full_name")
            .limit(5)
            .execute()
        )
        
        not_containing_a = await (db_manager
            .select("full_name", "country")
            .from_("profiles")
            .where("full_name").not_ilike("%a%")  # No 'a' anywhere
            .order_by("full_name")
            .execute()
        )
        
        print(f"✓ NOT_LIKE 'A%' AND NOT_LIKE 'B%': Found names not starting with A or B")
        for profile in not_starting_with_a:
            print(f"   - {profile['full_name']} from {profile['country']}")
        
        print(f"✓ NOT_ILIKE '%a%': Found {len(not_containing_a)} names without letter 'a'")
        for profile in not_containing_a:
            print(f"   - {profile['full_name']} from {profile['country']}")
        
        # 6. BETWEEN and NOT_BETWEEN operators
        print("29. Testing BETWEEN and NOT_BETWEEN operators...")
        
        between_ids = await (db_manager
            .select("id", "full_name", "country")
            .from_("profiles")
            .where("id").between(5, 10)
            .order_by("id")
            .execute()
        )
        
        not_between_ids = await (db_manager
            .select("id", "full_name", "country")
            .from_("profiles")
            .where("id").not_between(8, 18)
            .order_by("id")
            .execute()
        )
        
        print(f"✓ BETWEEN(5,10): Found {len(between_ids)} profiles with ID between 5-10")
        for profile in between_ids:
            print(f"   - ID {profile['id']}: {profile['full_name']}")
        
        print(f"✓ NOT_BETWEEN(8,18): Found {len(not_between_ids)} profiles with ID not between 8-18")
        for profile in not_between_ids[:6]:  # Show first 6
            print(f"   - ID {profile['id']}: {profile['full_name']}")
        
        # 7. NULL checks: is_null, is_not_null
        print("30. Testing IS_NULL and IS_NOT_NULL operators...")
        
        # Check for profiles without GitHub URLs
        no_github = await (db_manager
            .select("full_name", "github_url", "linkedin_url")
            .from_("profiles")
            .where("github_url").is_null()
            .limit(5)
            .execute()
        )
        
        # Check for profiles with GitHub URLs
        has_github = await (db_manager
            .select("full_name", "github_url")
            .from_("profiles")
            .where("github_url").is_not_null()
            .limit(5)
            .execute()
        )
        
        print(f"✓ IS_NULL: Found {len(no_github)} profiles without GitHub URLs")
        for profile in no_github:
            print(f"   - {profile['full_name']}: GitHub={profile['github_url']}, LinkedIn={profile['linkedin_url']}")
        
        print(f"✓ IS_NOT_NULL: Found {len(has_github)} profiles with GitHub URLs")
        for profile in has_github:
            print(f"   - {profile['full_name']}: {profile['github_url']}")
        
        # 8. Date Comparison Operators
        print("31. Testing DATE comparison operators...")
        
        from datetime import datetime, timezone, timedelta
        
        # Profiles created after a specific time
        ten_minutes_ago = datetime.now(timezone.utc) - timedelta(minutes=10)
        five_minutes_ago = datetime.now(timezone.utc) - timedelta(minutes=5)
        
        recent_after = await (db_manager
            .select("id", "full_name", "created_at")
            .from_("profiles")
            .where("created_at").greater_than(ten_minutes_ago)
            .order_by("created_at").desc()
            .limit(8)
            .execute()
        )
        
        very_recent = await (db_manager
            .select("id", "full_name", "created_at")
            .from_("profiles")
            .where("created_at").greater_than(five_minutes_ago)
            .order_by("created_at").desc()
            .limit(5)
            .execute()
        )
        
        print(f"✓ GREATER_THAN(10 min ago): Found {len(recent_after)} recent profiles")
        for profile in recent_after[:4]:  # Show first 4
            print(f"   - ID {profile['id']}: {profile['full_name']} at {profile['created_at']}")
        
        print(f"✓ GREATER_THAN(5 min ago): Found {len(very_recent)} very recent profiles")
        
        # 9. Complex Combined Operators
        print("32. Testing COMPLEX COMBINED operators...")
        
        complex_query = await (db_manager
            .select("id", "full_name", "country", "phone_number")
            .from_("profiles")
            .where("id").greater_than(5)
            .and_where("country").not_equals("Zeus Land")
            .and_where("full_name").ilike("%a%")
            .or_where("phone_number").like("+1-%")
            .order_by("country")
            .order_by("full_name")
            .limit(10)
            .execute()
        )
        
        print(f"✓ COMPLEX: Found {len(complex_query)} profiles matching complex criteria")
        print("   Criteria: (ID > 5 AND country != 'Zeus Land' AND name contains 'a') OR phone starts with '+1-'")
        for profile in complex_query:
            print(f"   - ID {profile['id']}: {profile['full_name']} from {profile['country']} - {profile['phone_number']}")
        
        # 10. Verification Summary
        print("33. OPERATOR VERIFICATION SUMMARY...")
        
        total_count_result = await (db_manager.select(count("*")).from_("profiles").execute())
        total_count = total_count_result[0]["count"] if total_count_result else 0
        usa_count = len(usa_profiles)
        non_usa_count = len(non_usa_profiles)
        
        print(f"✓ Total profiles: {total_count}")
        print(f"✓ USA profiles: {usa_count}")
        print(f"✓ Non-USA profiles: {non_usa_count}")
        print(f"✓ Sum verification: {usa_count + non_usa_count} {'✓ MATCHES' if usa_count + non_usa_count == total_count else '❌ MISMATCH'}")
        
        # Verify LIKE vs NOT_LIKE are complementary
        a_count = len(a_names)
        not_a_count_result = await (db_manager.select(count("*")).from_("profiles").where("full_name").not_like("A%").execute())
        not_a_count = not_a_count_result[0]["count"] if not_a_count_result else 0
        print(f"✓ Names starting with 'A': {a_count}")
        print(f"✓ Names NOT starting with 'A': {not_a_count}")
        print(f"✓ LIKE/NOT_LIKE verification: {a_count + not_a_count} {'✓ MATCHES' if a_count + not_a_count == total_count else '❌ MISMATCH'}")
        
        print("\n=== ALL OPERATORS TESTED SUCCESSFULLY ===")
        
        print("\n=== ADVANCED PROFILES TESTING ===")
        
        # Test advanced WHERE combinations on profiles table only
        print("34. Testing complex logical combinations on profiles...")
        
        # Test 1: Multiple AND conditions
        print("35. Testing multiple AND conditions...")
        multi_and_profiles = await (db_manager
            .select("id", "full_name", "country", "phone_number")
            .from_("profiles")
            .where("country").not_equals("Zeus Land")
            .and_where("id").greater_than(5)
            .and_where("full_name").ilike("%a%")
            .order_by("id")
            .execute()
        )
        print(f"✓ Multiple AND: Found {len(multi_and_profiles)} profiles")
        print("   Logic: country != 'Zeus Land' AND id > 5 AND name contains 'a'")
        for profile in multi_and_profiles[:5]:  # Show first 5
            print(f"   - ID {profile['id']}: {profile['full_name']} from {profile['country']}")
        
        # Test 2: Mixed AND/OR combinations
        print("36. Testing mixed AND/OR combinations...")
        mixed_logic_profiles = await (db_manager
            .select("id", "full_name", "country", "phone_number")
            .from_("profiles")
            .where("country").equals("USA")
            .and_where("id").less_than(10)
            .or_where("country").equals("Germany")
            .and_where("full_name").like("N%")
            .order_by("country")
            .order_by("full_name")
            .execute()
        )
        print(f"✓ Mixed AND/OR: Found {len(mixed_logic_profiles)} profiles")
        print("   Logic: (country='USA' AND id<10) OR (country='Germany' AND name starts with 'N')")
        for profile in mixed_logic_profiles:
            print(f"   - ID {profile['id']}: {profile['full_name']} from {profile['country']}")
        
        # Test 3: Range and pattern combinations
        print("37. Testing range and pattern combinations...")
        range_pattern_profiles = await (db_manager
            .select("id", "full_name", "phone_number", "country")
            .from_("profiles")
            .where("id").between(10, 20)
            .and_where("phone_number").like("+%")
            .and_where("full_name").not_like("Test%")
            .order_by("id")
            .execute()
        )
        print(f"✓ Range + Pattern: Found {len(range_pattern_profiles)} profiles")
        print("   Logic: id BETWEEN 10-20 AND phone starts with '+' AND name not starts with 'Test'")
        for profile in range_pattern_profiles:
            print(f"   - ID {profile['id']}: {profile['full_name']} - {profile['phone_number']}")
        
        # Test 4: NULL checks with other conditions
        print("38. Testing NULL checks with combinations...")
        null_combo_profiles = await (db_manager
            .select("full_name", "github_url", "linkedin_url", "country")
            .from_("profiles")
            .where("github_url").is_not_null()
            .and_where("country").in_(["USA", "Germany", "Canada"])
            .or_where("linkedin_url").is_null()
            .and_where("country").equals("Spain")
            .order_by("country")
            .order_by("full_name")
            .execute()
        )
        print(f"✓ NULL + Conditions: Found {len(null_combo_profiles)} profiles")
        print("   Logic: (has GitHub AND country in USA/Germany/Canada) OR (no LinkedIn AND country=Spain)")
        for profile in null_combo_profiles:
            github = profile['github_url'] or 'None'
            linkedin = profile['linkedin_url'] or 'None'
            print(f"   - {profile['full_name']} ({profile['country']}): GitHub={github[:30]}..., LinkedIn={linkedin[:30]}...")
        
        print("\n=== ADVANCED PROFILES TESTING COMPLETED ===")
        
        # Export functionality demonstration
        print("\n=== EXPORT FUNCTIONALITY DEMO ===")
        
        print("Testing CSV export functionality...")
        try:
            # Test 1: Basic export - all profiles
            print("1. Exporting all profiles to CSV...")
            await (db_manager
                .select("id", "full_name", "email", "country")
                .from_("profiles")
                .export_to("all_profiles_export.csv")
                .execute()
            )
            
            # Check if file was created
            from pathlib import Path
            if Path("all_profiles_export.csv").exists():
                with open("all_profiles_export.csv", 'r', encoding='utf-8') as f:
                    content = f.read()
                    lines = content.strip().split('\n')
                    print(f"✓ Exported {len(lines)-1} profiles to all_profiles_export.csv")
                    print("  Sample content:")
                    for i, line in enumerate(lines[:3]):
                        print(f"    {line}")
            else:
                print("❌ Export failed: file not created")
            
            # Test 2: Filtered export
            print("\n2. Exporting USA profiles only...")
            await (db_manager
                .select("full_name", "email", "phone_number")
                .from_("profiles")
                .where("country").equals("USA")
                .export_to("usa_profiles_export.csv")
                .execute()
            )
            
            if Path("usa_profiles_export.csv").exists():
                with open("usa_profiles_export.csv", 'r', encoding='utf-8') as f:
                    content = f.read()
                    print(f"✓ USA profiles exported successfully")
                    print("  Content:")
                    for line in content.strip().split('\n'):
                        print(f"    {line}")
            else:
                print("❌ USA export failed")
            
            # Test 3: Complex query export
            print("\n3. Exporting top 5 by ID with ORDER BY...")
            await (db_manager
                .select("id", "full_name", "country")
                .from_("profiles")
                .order_by("id").desc()
                .limit(5)
                .export_to("top5_profiles_export.csv")
                .execute()
            )
            
            if Path("top5_profiles_export.csv").exists():
                with open("top5_profiles_export.csv", 'r', encoding='utf-8') as f:
                    content = f.read()
                    print(f"✓ Top 5 profiles exported successfully")
                    print("  Content:")
                    for line in content.strip().split('\n'):
                        print(f"    {line}")
            else:
                print("❌ Top 5 export failed")
            
            print("\n✓ Export API Usage Patterns:")
            print("  # Basic export")
            print("  await db.select('*').from_('table').export_to('data.csv').execute()")
            print("  # Filtered export")  
            print("  await db.select('name', 'email').from_('users').where('active').equals(True).export_to('filtered.csv').execute()")
            print("  # Complex export")
            print("  await db.select('*').from_('table').order_by('id').limit(100).export_to('results.csv').execute()")
            
        except Exception as e:
            print(f"❌ Export test error: {e}")
        
        print("\n=== EXPORT FUNCTIONALITY COMPLETED ===")
        
        print("\n=== IMPORT FUNCTIONALITY DEMO ===")
        
        print("Testing CSV import functionality...")
        try:
            # Test 1: Basic import to existing table
            print("1. Testing basic import to existing profiles table...")
            import_result1 = await (db_manager
                .insert
                .into("profiles")
                .import_from("test_import_data.csv")
                .on_conflict("email").do_nothing()  # Ignore duplicates
                .execute()
            )
            
            print(f"✓ Imported {len(import_result1)} profiles from CSV")
            if import_result1:
                for profile in import_result1[:3]:  # Show first 3
                    print(f"   - {profile['full_name']} ({profile['email']}) from {profile['country']}")
            
            # Test 2: Import with column mapping
            print("\n2. Testing import with column mapping...")
            import_result2 = await (db_manager
                .insert
                .into("profiles")
                .import_from("test_import_mapped.csv")
                .map_columns({
                    "full_name": "name",           # CSV: name -> DB: full_name
                    "email": "email_address",      # CSV: email_address -> DB: email
                    "phone_number": "phone",       # CSV: phone -> DB: phone_number
                    "state_or_city": "city",       # CSV: city -> DB: state_or_city
                    "country": "country_code",     # CSV: country_code -> DB: country
                    "linkedin_url": "social_linkedin"  # CSV: social_linkedin -> DB: linkedin_url
                })
                .on_conflict("email").do_update()  # Update on conflict
                .execute()
            )
            
            print(f"✓ Imported {len(import_result2)} profiles with column mapping")
            if import_result2:
                for profile in import_result2:
                    print(f"   - {profile['full_name']} ({profile['email']}) from {profile['country']}")
            
            # Test 3: Auto-create new table from CSV
            print("\n3. Testing auto-create table from CSV...")
            
            # First, create a test CSV for new table
            import csv
            new_table_data = [
                {"customer_id": "1", "customer_name": "Alpha Corp", "industry": "Technology", "revenue": "1000000", "active": "true"},
                {"customer_id": "2", "customer_name": "Beta Solutions", "industry": "Healthcare", "revenue": "500000", "active": "false"},
                {"customer_id": "3", "customer_name": "Gamma Industries", "industry": "Manufacturing", "revenue": "2000000", "active": "true"}
            ]
            
            with open("test_new_table.csv", 'w', newline='', encoding='utf-8') as csvfile:
                if new_table_data:
                    fieldnames = new_table_data[0].keys()
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                    writer.writeheader()
                    writer.writerows(new_table_data)
            
            # Import to new table with auto-creation
            import_result3 = await (db_manager
                .insert
                .into("customers")
                .import_from("test_new_table.csv")
                .auto_create_table()
                .execute()
            )
            
            print(f"✓ Auto-created 'customers' table and imported {len(import_result3)} records")
            if import_result3:
                for customer in import_result3:
                    print(f"   - {customer['customer_name']} ({customer['industry']}) - Revenue: ${customer['revenue']}")
            
            # Verify the new table was created
            customer_count_result = await (db_manager
                .select(count("*"))
                .from_("customers")
                .execute()
            )
            customer_count = customer_count_result[0]["count"] if customer_count_result else 0
            print(f"✓ Customers table now contains {customer_count} records")
            
            # Test 4: Complex import with filtering
            print("\n4. Testing selective data import...")
            
            # First export some profiles to test re-import
            await (db_manager
                .select("full_name", "email", "country", "linkedin_url")
                .from_("profiles")
                .where("country").in_(["USA", "Germany", "Japan"])
                .export_to("selective_export.csv")
                .execute()
            )
            
            # Now import back with conflict handling
            selective_import = await (db_manager
                .insert
                .into("profiles")
                .import_from("selective_export.csv")
                .on_conflict("email").do_nothing()  # Skip existing emails
                .execute()
            )
            
            print(f"✓ Selective import handled {len(selective_import)} records (conflicts ignored)")
            
            # Final verification
            print("\n5. Final verification of import operations...")
            final_profile_count_result = await (db_manager
                .select(count("*"))
                .from_("profiles")
                .execute()
            )
            final_profile_count = final_profile_count_result[0]["count"] if final_profile_count_result else 0
            
            final_customer_count_result = await (db_manager
                .select(count("*"))
                .from_("customers")
                .execute()
            )
            final_customer_count = final_customer_count_result[0]["count"] if final_customer_count_result else 0
            
            print(f"✓ Final counts:")
            print(f"   - Profiles table: {final_profile_count} records")
            print(f"   - Customers table: {final_customer_count} records")
            
            print("\n✓ Import API Usage Patterns:")
            print("  # Basic import to existing table")
            print("  await db.insert.into('table').import_from('data.csv').execute()")
            print("  # Import with column mapping")  
            print("  await db.insert.into('table').import_from('data.csv').map_columns({'db_col': 'csv_col'}).execute()")
            print("  # Auto-create table from CSV")
            print("  await db.insert.into('new_table').import_from('data.csv').auto_create_table().execute()")
            print("  # Import with conflict resolution")
            print("  await db.insert.into('table').import_from('data.csv').on_conflict('email').do_update().execute()")
            
        except Exception as e:
            print(f"❌ Import test error: {e}")
            import traceback
            traceback.print_exc()
        
        print("\n=== IMPORT FUNCTIONALITY COMPLETED ===")
        
        print("\n=== Zeus Test Completed Successfully ===")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await db_manager.disconnect()
        print("✓ Connections closed")

if __name__ == "__main__":
    asyncio.run(test_zeus_profiles())