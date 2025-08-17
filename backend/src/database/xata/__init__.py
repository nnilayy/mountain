# Xata database module - Public API

from .database import DatabaseManager
from .tables import TABLE_SCHEMAS, TABLE_CREATION_ORDER

# Public API - Only these classes/functions should be imported by users
__all__ = [
    'DatabaseManager',            # Main database interface - primary entry point
    'TABLE_SCHEMAS',              # Table schema definitions
    'TABLE_CREATION_ORDER',       # Table creation order
]

# Typical usage:
# from database.xata import DatabaseManager
# db = DatabaseManager()
# result = await db.select("name").from_("users").execute()
