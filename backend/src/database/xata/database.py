import json
import asyncio
import logging
import asyncpg
from pathlib import Path
from datetime import datetime
from urllib.parse import urlparse
from contextlib import asynccontextmanager
from typing import Dict, List, Optional, Any, Union

logger = logging.getLogger(__name__)

class PostgreSQLTypes:
    """PostgreSQL data types for type-safe column definitions"""
    
    def __init__(self):
        # Numeric types
        self.SMALLINT = "SMALLINT"
        self.INTEGER = "INTEGER"
        self.BIGINT = "BIGINT"
        self.DECIMAL = "DECIMAL"
        self.NUMERIC = "NUMERIC"
        self.REAL = "REAL"
        self.DOUBLE_PRECISION = "DOUBLE PRECISION"
        self.SMALLSERIAL = "SMALLSERIAL"
        self.SERIAL = "SERIAL"
        self.BIGSERIAL = "BIGSERIAL"
        
        # Character types
        self.CHAR = "CHAR"
        self.VARCHAR = "VARCHAR"
        self.TEXT = "TEXT"
        
        # Binary types
        self.BYTEA = "BYTEA"
        
        # Date/time types
        self.TIMESTAMP = "TIMESTAMP"
        self.TIMESTAMPTZ = "TIMESTAMPTZ"
        self.DATE = "DATE"
        self.TIME = "TIME"
        self.TIMETZ = "TIMETZ"
        self.INTERVAL = "INTERVAL"
        
        # Boolean type
        self.BOOLEAN = "BOOLEAN"
        
        # UUID type
        self.UUID = "UUID"
        
        # JSON types
        self.JSON = "JSON"
        self.JSONB = "JSONB"
    
    def ARRAY(self, base_type: str) -> str:
        """Array type: ARRAY('INTEGER') -> 'INTEGER[]'"""
        return f"{base_type}[]"
    
    def VARCHAR_N(self, length: int) -> str:
        """Variable character with length: VARCHAR_N(255) -> 'VARCHAR(255)'"""
        return f"VARCHAR({length})"
    
    def CHAR_N(self, length: int) -> str:
        """Fixed character with length: CHAR_N(10) -> 'CHAR(10)'"""
        return f"CHAR({length})"
    
    def DECIMAL_P_S(self, precision: int, scale: int) -> str:
        """Decimal with precision and scale: DECIMAL_P_S(10, 2) -> 'DECIMAL(10,2)'"""
        return f"DECIMAL({precision},{scale})"
    
    def NUMERIC_P_S(self, precision: int, scale: int) -> str:
        """Numeric with precision and scale: NUMERIC_P_S(10, 2) -> 'NUMERIC(10,2)'"""
        return f"NUMERIC({precision},{scale})"
    

class AggregationFunction:
    """Aggregation function for SQL queries"""
    
    def __init__(self, column: str, function_name: str):
        # Validate inputs
        if not function_name or function_name is None:
            raise ValueError("Function name cannot be None or empty")
        if column is None:
            raise ValueError("Column cannot be None")
        if column == "" and function_name.upper() != "COUNT":
            raise ValueError(f"Empty column not allowed for {function_name} function")
        
        self.column = column
        self.function_name = function_name
        self._alias = None
    
    def alias(self, name: str):
        """Add alias to aggregation function"""
        if not name or name is None:
            raise ValueError("Alias cannot be None or empty")
        self._alias = name
        return self
    
    def __str__(self):
        """Return SQL representation"""
        sql = f"{self.function_name}({self.column})"
        if self._alias:
            sql += f" AS {self._alias}"
        return sql
    
    def to_sql(self):
        """Return SQL representation (same as __str__)"""
        return str(self)


def count(column: str = "*") -> AggregationFunction:
    """Create COUNT aggregation function
    
    Args:
        column: Column to count, defaults to "*" for all rows
    
    Examples:
        count()        -> COUNT(*)
        count("*")     -> COUNT(*)
        count("id")    -> COUNT(id)
    """
    return AggregationFunction(column, "COUNT")


def sum(column: str) -> AggregationFunction:
    """Create SUM aggregation function
    
    Args:
        column: Numeric column to sum
    
    Examples:
        sum("salary") -> SUM(salary)
        sum("price")  -> SUM(price)
    """
    return AggregationFunction(column, "SUM")


def avg(column: str) -> AggregationFunction:
    """Create AVG aggregation function
    
    Args:
        column: Numeric column to average
    
    Examples:
        avg("age")    -> AVG(age)
        avg("salary") -> AVG(salary)
    """
    return AggregationFunction(column, "AVG")


def min(column: str) -> AggregationFunction:
    """Create MIN aggregation function
    
    Args:
        column: Column to find minimum value
    
    Examples:
        min("created_at") -> MIN(created_at)
        min("price")      -> MIN(price)
    """
    return AggregationFunction(column, "MIN")


def max(column: str) -> AggregationFunction:
    """Create MAX aggregation function
    
    Args:
        column: Column to find maximum value
    
    Examples:
        max("updated_at") -> MAX(updated_at)
        max("age")        -> MAX(age)
    """
    return AggregationFunction(column, "MAX")


class FieldQuery:
    """Handles field-specific operations and comparisons"""
    
    def __init__(self, parent_query, field_name: str, logical_operator: str = "AND"):
        # Validate field name
        if not field_name or field_name is None:
            raise ValueError("Field name cannot be None or empty")
        
        self.parent = parent_query
        self.field = field_name
        self.operator = logical_operator
    
    # Comparison operators
    def equals(self, value):
        """Field equals value"""
        self.parent._add_condition(self.field, "=", value, self.operator)
        return self.parent
    
    def not_equals(self, value):
        """Field not equals value"""
        self.parent._add_condition(self.field, "!=", value, self.operator)
        return self.parent
    
    def greater_than(self, value):
        """Field greater than value"""
        self.parent._add_condition(self.field, ">", value, self.operator)
        return self.parent
    
    def greater_than_or_equal(self, value):
        """Field greater than or equal to value"""
        self.parent._add_condition(self.field, ">=", value, self.operator)
        return self.parent
    
    def less_than(self, value):
        """Field less than value"""
        self.parent._add_condition(self.field, "<", value, self.operator)
        return self.parent
    
    def less_than_or_equal(self, value):
        """Field less than or equal to value"""
        self.parent._add_condition(self.field, "<=", value, self.operator)
        return self.parent
    
    # Range operators
    def between(self, start, end):
        """Field between start and end values (inclusive)"""
        if start is None or end is None:
            raise ValueError("BETWEEN start and end values cannot be None")
        self.parent._add_condition(self.field, "BETWEEN", (start, end), self.operator)
        return self.parent
    
    def not_between(self, start, end):
        """Field not between start and end values"""
        if start is None or end is None:
            raise ValueError("NOT BETWEEN start and end values cannot be None")
        self.parent._add_condition(self.field, "NOT BETWEEN", (start, end), self.operator)
        return self.parent
    
    # List operators - support single value or list
    def in_(self, values):
        """Field in list of values (supports single value or array)"""
        if not isinstance(values, (list, tuple)):
            values = [values]
        self.parent._add_condition(self.field, "IN", values, self.operator)
        return self.parent
    
    def not_in(self, values):
        """Field not in list of values (supports single value or array)"""
        if not isinstance(values, (list, tuple)):
            values = [values]
        self.parent._add_condition(self.field, "NOT IN", values, self.operator)
        return self.parent
        
    # Null operators
    def is_null(self):
        """Field is NULL"""
        self.parent._add_condition(self.field, "IS NULL", None, self.operator)
        return self.parent
    
    def is_not_null(self):
        """Field is not NULL"""
        self.parent._add_condition(self.field, "IS NOT NULL", None, self.operator)
        return self.parent
    
    # String operators
    def contains(self, value):
        """Field contains substring (case-insensitive)"""
        if value is None:
            raise ValueError("Contains value cannot be None")
        # Escape special LIKE characters to prevent unintended pattern matching
        escaped_value = str(value).replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
        self.parent._add_condition(self.field, "ILIKE", f"%{escaped_value}%", self.operator)
        return self.parent
    
    def not_contains(self, value):
        """Field does not contain substring"""
        if value is None:
            raise ValueError("Not contains value cannot be None")
        # Escape special LIKE characters to prevent unintended pattern matching
        escaped_value = str(value).replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
        self.parent._add_condition(self.field, "NOT ILIKE", f"%{escaped_value}%", self.operator)
        return self.parent
    
    def starts_with(self, value):
        """Field starts with prefix"""
        if value is None:
            raise ValueError("Starts with value cannot be None")
        # Escape special LIKE characters to prevent unintended pattern matching
        escaped_value = str(value).replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
        self.parent._add_condition(self.field, "ILIKE", f"{escaped_value}%", self.operator)
        return self.parent
    
    def ends_with(self, value):
        """Field ends with suffix"""
        if value is None:
            raise ValueError("Ends with value cannot be None")
        # Escape special LIKE characters to prevent unintended pattern matching
        escaped_value = str(value).replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
        self.parent._add_condition(self.field, "ILIKE", f"%{escaped_value}", self.operator)
        return self.parent
    
    def like(self, pattern):
        """Field matches LIKE pattern (case-sensitive)"""
        self.parent._add_condition(self.field, "LIKE", pattern, self.operator)
        return self.parent
    
    def not_like(self, pattern):
        """Field does not match LIKE pattern (case-sensitive)"""
        self.parent._add_condition(self.field, "NOT LIKE", pattern, self.operator)
        return self.parent
    
    def ilike(self, pattern):
        """Field matches LIKE pattern (case-insensitive)"""
        self.parent._add_condition(self.field, "ILIKE", pattern, self.operator)
        return self.parent
    
    def not_ilike(self, pattern):
        """Field does not match LIKE pattern (case-insensitive)"""
        self.parent._add_condition(self.field, "NOT ILIKE", pattern, self.operator)
        return self.parent


class OrderByQuery:
    """Handles ORDER BY operations"""
    
    def __init__(self, parent_query, field_name: str):
        # Validate field name
        if not field_name or field_name is None:
            raise ValueError("ORDER BY field name cannot be None or empty")
        
        self.parent = parent_query
        self.field = field_name
        # Default to ascending order if no explicit direction is set
        self.parent._add_order(self.field, "ASC")
    
    def asc(self):
        """Order by field ascending (explicitly)"""
        # Remove the default order and add explicit ASC
        self.parent.order_fields = [order for order in self.parent.order_fields if order[0] != self.field]
        self.parent._add_order(self.field, "ASC")
        return self.parent
    
    def desc(self):
        """Order by field descending"""
        # Remove the default order and add explicit DESC
        self.parent.order_fields = [order for order in self.parent.order_fields if order[0] != self.field]
        self.parent._add_order(self.field, "DESC")
        return self.parent
    
    # Delegate all other methods to parent query
    def where(self, field: str):
        """Add WHERE condition (AND by default)"""
        return self.parent.where(field)
    
    def and_where(self, field: str):
        """Add AND WHERE condition"""
        return self.parent.and_where(field)
    
    def or_where(self, field: str):
        """Add OR WHERE condition"""
        return self.parent.or_where(field)
    
    def order_by(self, field: str):
        """Add another ORDER BY clause"""
        return self.parent.order_by(field)
    
    def limit(self, count: int):
        """Add LIMIT clause"""
        return self.parent.limit(count)
    
    def offset(self, count: int):
        """Add OFFSET clause"""
        return self.parent.offset(count)
    
    def group_by(self, *columns):
        """Add GROUP BY clause"""
        return self.parent.group_by(*columns)
    
    def distinct(self):
        """Add DISTINCT to SELECT"""
        return self.parent.distinct()
    
    async def execute(self):
        """Execute the query"""
        return await self.parent.execute()


class BaseQuery:
    """Base class for all query types"""
    
    def __init__(self, db_manager):
        self.db = db_manager
        self.conditions = []
        self.order_fields = []
        self.limit_value = None
        self.offset_value = None
    
    def _add_condition(self, field: str, operator: str, value: Any, logical_op: str):
        """Add a WHERE condition"""
        self.conditions.append({
            "field": field,
            "operator": operator,
            "value": value,
            "logical": logical_op
        })
    
    def _add_order(self, field: str, direction: str):
        """Add an ORDER BY clause"""
        self.order_fields.append((field, direction))
    
    def where(self, field: str):
        """Add WHERE condition (AND by default)"""
        return FieldQuery(self, field, "AND")
    
    def and_where(self, field: str):
        """Add AND WHERE condition"""
        return FieldQuery(self, field, "AND")
    
    def or_where(self, field: str):
        """Add OR WHERE condition"""
        return FieldQuery(self, field, "OR")
    
    def order_by(self, field: str):
        """Add ORDER BY clause"""
        return OrderByQuery(self, field)
    
    def limit(self, count: int):
        """Add LIMIT clause"""
        self.limit_value = count
        return self
    
    def offset(self, count: int):
        """Add OFFSET clause"""
        self.offset_value = count
        return self
    
    def _build_where_clause(self, params: list) -> str:
        """Build WHERE clause from conditions"""
        if not self.conditions:
            return ""
        
        where_parts = []
        for i, condition in enumerate(self.conditions):
            field = condition["field"]
            operator = condition["operator"]
            value = condition["value"]
            logical = condition["logical"]
            
            # Validate field name is not None or empty
            if not field or field is None:
                raise ValueError(f"Field name cannot be None or empty in WHERE clause")
            
            # Build the condition part
            if operator == "IS NULL" or operator == "IS NOT NULL":
                condition_sql = f"{field} {operator}"
            elif operator == "BETWEEN" or operator == "NOT BETWEEN":
                # Validate BETWEEN value is a tuple/list with exactly 2 elements
                if not isinstance(value, (tuple, list)) or len(value) != 2:
                    raise ValueError(f"BETWEEN operator requires exactly 2 values, got: {value}")
                if value[0] is None or value[1] is None:
                    raise ValueError(f"BETWEEN values cannot be None")
                params.extend([value[0], value[1]])
                param1_idx = len(params) - 1  # Second to last parameter
                param2_idx = len(params)      # Last parameter
                condition_sql = f"{field} {operator} ${param1_idx} AND ${param2_idx}"
            elif operator == "IN" or operator == "NOT IN":
                if not value:  # Handle empty list
                    # Empty IN list: return condition that matches nothing/everything
                    if operator == "IN":
                        condition_sql = "FALSE"  # IN () matches nothing
                    else:  # NOT IN
                        condition_sql = "TRUE"   # NOT IN () matches everything
                else:
                    # Validate IN values don't contain None
                    if any(val is None for val in value):
                        raise ValueError(f"IN/NOT IN values cannot contain None")
                    placeholders = []
                    for val in value:
                        params.append(val)
                        placeholders.append(f"${len(params)}")
                    condition_sql = f"{field} {operator} ({', '.join(placeholders)})"
            else:
                params.append(value)
                condition_sql = f"{field} {operator} ${len(params)}"
            
            # Add logical operator if not first condition
            if i > 0:
                where_parts.append(f" {logical} {condition_sql}")
            else:
                where_parts.append(condition_sql)
        
        return "WHERE " + "".join(where_parts)
    
    def _build_order_clause(self) -> str:
        """Build ORDER BY clause"""
        if not self.order_fields:
            return ""
        
        order_parts = [f"{field} {direction}" for field, direction in self.order_fields]
        return f"ORDER BY {', '.join(order_parts)}"
    
    def _build_limit_clause(self, params: list) -> str:
        """Build LIMIT and OFFSET clause"""
        clause = ""
        if self.limit_value is not None:
            params.append(self.limit_value)
            clause += f" LIMIT ${len(params)}"
        
        if self.offset_value is not None:
            params.append(self.offset_value)
            clause += f" OFFSET ${len(params)}"
        
        return clause


class SelectQuery(BaseQuery):
    """Handles SELECT operations"""
    
    def __init__(self, db_manager):
        super().__init__(db_manager)
        self.select_fields = None
        self.table_name = None
        self.is_distinct = False
        self.group_fields = []
    
    def __call__(self, *fields):
        """Allow db.select("field1", "field2", count("*"), avg("age")) syntax
        
        Supports:
        - String columns: "name", "email" 
        - Aggregation functions: count("*"), sum("salary"), avg("age")
        - Mixed usage: "department", count("*"), avg("salary")
        """
        if not fields:
            self.select_fields = ["*"]
        else:
            # Process each field - convert aggregation functions to SQL strings
            processed_fields = []
            for field in fields:
                if isinstance(field, AggregationFunction):
                    processed_fields.append(str(field))
                else:
                    processed_fields.append(str(field))
            self.select_fields = processed_fields
        return self
    
    def distinct(self):
        """Add DISTINCT to SELECT"""
        self.is_distinct = True
        return self
    
    def from_(self, table: str):
        """FROM table clause"""
        self.table_name = table
        return self
    
    def group_by(self, *columns):
        """Add GROUP BY clause"""
        self.group_fields.extend(columns)
        return self
    
    async def execute(self):
        """Execute the SELECT query"""
        if not self.table_name:
            raise ValueError("FROM clause is required for SELECT")
        
        # Build SQL query
        params = []
        
        # SELECT clause
        fields = ", ".join(self.select_fields) if self.select_fields else "*"
        distinct_keyword = "DISTINCT " if self.is_distinct else ""
        sql = f"SELECT {distinct_keyword}{fields}"
        
        # FROM clause
        sql += f" FROM {self.table_name}"
        
        # WHERE clause
        where_clause = self._build_where_clause(params)
        if where_clause:
            sql += f" {where_clause}"
        
        # GROUP BY clause
        if self.group_fields:
            group_clause = ", ".join(self.group_fields)
            sql += f" GROUP BY {group_clause}"
        
        # ORDER BY clause
        order_clause = self._build_order_clause()
        if order_clause:
            sql += f" {order_clause}"
        
        # LIMIT/OFFSET clause
        limit_clause = self._build_limit_clause(params)
        if limit_clause:
            sql += limit_clause
        
        # Execute query
        result = await self.db._execute_query(self.table_name, sql, params)
        
        return result


class ConflictResolution:
    """Handles conflict resolution for INSERT operations"""
    
    def __init__(self, insert_query, conflict_column: str):
        self.insert_query = insert_query
        self.conflict_column = conflict_column
    
    def do_nothing(self):
        """Do nothing on conflict (ignore duplicates)"""
        self.insert_query.conflict_resolution = "DO_NOTHING"
        return self.insert_query
    
    def do_update(self):
        """Update existing record on conflict"""
        self.insert_query.conflict_resolution = "DO_UPDATE"
        return self.insert_query


class InsertQuery:
    """Handles INSERT operations"""
    
    def __init__(self, db_manager):
        self.db = db_manager
        self.table_name = None
        self.data = None
        self.conflict_resolution = None
        self.conflict_column = None
    
    def into(self, table: str):
        """INTO table clause"""
        self.table_name = table
        return self
    
    def values(self, data: Union[Dict[str, Any], List[Dict[str, Any]]]):
        """VALUES clause - supports single record or bulk insert"""
        self.data = data
        return self
    
    def on_conflict(self, column: str):
        """Specify conflict resolution column"""
        self.conflict_column = column
        return ConflictResolution(self, column)
    
    async def execute(self):
        """Execute the INSERT query"""
        if not self.table_name:
            raise ValueError("INTO clause is required for INSERT")
        
        # Handle regular insert
        if not self.data:
            raise ValueError("VALUES clause is required for INSERT")
        
        # Handle bulk insert
        if isinstance(self.data, list):
            return await self._bulk_insert()
        
        # Single insert
        columns = list(self.data.keys())
        values = list(self.data.values())
        placeholders = [f"${i+1}" for i in range(len(columns))]
        
        sql = f"""
            INSERT INTO {self.table_name} ({', '.join(columns)})
            VALUES ({', '.join(placeholders)})"""
        
        # Add ON CONFLICT clause if specified
        if self.conflict_resolution and self.conflict_column:
            if self.conflict_resolution == "DO_NOTHING":
                sql += f" ON CONFLICT ({self.conflict_column}) DO NOTHING"
            elif self.conflict_resolution == "DO_UPDATE":
                # TODO: Implement DO UPDATE logic later
                raise NotImplementedError("DO UPDATE not yet implemented")
        
        sql += " RETURNING *"
        
        result = await self.db._execute_query(self.table_name, sql, values)
        return result[0] if result else None
    
    async def _bulk_insert(self):
        """Handle bulk insert operations"""
        if not self.data:
            return []
        
        # Validate all records are dictionaries and not empty
        for i, record in enumerate(self.data):
            if not isinstance(record, dict):
                raise ValueError(f"Bulk insert record {i} must be a dictionary")
            if not record:
                raise ValueError(f"Bulk insert record {i} cannot be empty")
        
        # Use first record to determine columns
        columns = list(self.data[0].keys())
        
        # Validate all records have consistent schema (warn about missing keys)
        all_keys = set()
        for record in self.data:
            all_keys.update(record.keys())
        
        if len(all_keys) > len(columns):
            missing_keys = all_keys - set(columns)
            print(f"Warning: Some records have additional keys that will be ignored: {missing_keys}")
        
        # Build bulk insert SQL
        values_clauses = []
        params = []
        
        for record in self.data:
            record_values = [record.get(col) for col in columns]
            placeholders = [f"${len(params) + i + 1}" for i in range(len(columns))]
            values_clauses.append(f"({', '.join(placeholders)})")
            params.extend(record_values)
        
        sql = f"""
            INSERT INTO {self.table_name} ({', '.join(columns)})
            VALUES {', '.join(values_clauses)}"""
        
        # Add ON CONFLICT clause if specified (bulk insert support)
        if self.conflict_resolution and self.conflict_column:
            if self.conflict_resolution == "DO_NOTHING":
                sql += f" ON CONFLICT ({self.conflict_column}) DO NOTHING"
            elif self.conflict_resolution == "DO_UPDATE":
                # TODO: Implement DO UPDATE logic later
                raise NotImplementedError("DO UPDATE not yet implemented for bulk insert")
        
        sql += " RETURNING *"
        
        return await self.db._execute_query(self.table_name, sql, params)


class UpdateQuery(BaseQuery):
    """Handles UPDATE operations"""
    
    def __init__(self, db_manager, table: str):
        super().__init__(db_manager)
        self.table_name = table
        self.update_data = None
    
    def set(self, data: Dict[str, Any]):
        """SET clause for UPDATE"""
        self.update_data = data
        return self
    
    async def execute(self):
        """Execute the UPDATE query"""
        if not self.update_data:
            raise ValueError("SET clause is required for UPDATE")
        
        # Build SQL query
        params = []
        
        # SET clause
        set_clauses = []
        for column, value in self.update_data.items():
            params.append(value)
            set_clauses.append(f"{column} = ${len(params)}")
        
        sql = f"UPDATE {self.table_name} SET {', '.join(set_clauses)}"
        
        # WHERE clause
        where_clause = self._build_where_clause(params)
        if where_clause:
            sql += f" {where_clause}"
        else:
            raise ValueError("WHERE clause is required for UPDATE (safety measure)")
        
        sql += " RETURNING *"
        
        return await self.db._execute_query(self.table_name, sql, params)


class DeleteQuery(BaseQuery):
    """Handles DELETE operations"""
    
    def __init__(self, db_manager):
        super().__init__(db_manager)
        self.table_name = None
    
    def from_(self, table: str):
        """FROM table clause"""
        self.table_name = table
        return self
    
    async def execute(self):
        """Execute the DELETE query"""
        if not self.table_name:
            raise ValueError("FROM clause is required for DELETE")
        
        # Build SQL query
        params = []
        sql = f"DELETE FROM {self.table_name}"
        
        # WHERE clause
        where_clause = self._build_where_clause(params)
        if where_clause:
            sql += f" {where_clause}"
        else:
            raise ValueError("WHERE clause is required for DELETE (safety measure)")
        
        # Execute DELETE and get command tag
        result = await self.db._execute_query(self.table_name, sql, params, fetch_results=False)
        
        # Parse deleted count from command tag (e.g., "DELETE 5")
        deleted_count = 0
        if isinstance(result, str) and result.startswith("DELETE"):
            try:
                deleted_count = int(result.split()[-1])
            except (IndexError, ValueError):
                deleted_count = 0
        
        return {"deleted_count": deleted_count}


class ColumnBuilder:
    """Handles fluent column definition building"""
    
    def __init__(self, create_table_query, column_name: str):
        self.create_table_query = create_table_query
        self.column_name = column_name
        self.column_type = None
        self.constraints = []
    
    def type(self, column_type: str):
        """Set the column type"""
        self.column_type = column_type.upper()
        return self
    
    def not_null(self):
        """Add NOT NULL constraint"""
        self.constraints.append("NOT NULL")
        return self
    
    def unique(self):
        """Add UNIQUE constraint"""
        self.constraints.append("UNIQUE")
        return self
    
    def primary_key(self):
        """Add PRIMARY KEY constraint"""
        self.constraints.append("PRIMARY KEY")
        return self
    
    def default(self, value):
        """Add DEFAULT constraint"""
        if isinstance(value, str):
            # Handle function calls like now(), gen_random_uuid()
            if value.endswith('()'):
                self.constraints.append(f"DEFAULT {value}")
            else:
                self.constraints.append(f"DEFAULT '{value}'")
        else:
            self.constraints.append(f"DEFAULT {value}")
        return self
    
    def check(self, condition: str):
        """Add CHECK constraint"""
        self.constraints.append(f"CHECK ({condition})")
        return self
    
    def references(self, table: str, column: str):
        """Add FOREIGN KEY constraint"""
        self.constraints.append(f"REFERENCES {table}({column})")
        return self
    
    def _build_column_definition(self) -> str:
        """Build the complete column definition"""
        if not self.column_type:
            raise ValueError(f"Column '{self.column_name}' must have a type specified")
        
        parts = [self.column_name, self.column_type]
        parts.extend(self.constraints)
        return " ".join(parts)
    
    def column(self, name: str):
        """Start defining another column (returns new ColumnBuilder)"""
        # Finalize current column and add to create table query
        column_def = self._build_column_definition()
        self.create_table_query.columns.append(column_def)
        
        # Return new ColumnBuilder for the next column
        return ColumnBuilder(self.create_table_query, name)
    
    def primary_key_constraint(self, *columns):
        """Add table-level primary key constraint"""
        # Finalize current column first
        column_def = self._build_column_definition()
        self.create_table_query.columns.append(column_def)
        
        # Add table constraint
        if len(columns) == 1:
            self.create_table_query.constraints.append(f"PRIMARY KEY ({columns[0]})")
        else:
            cols = ", ".join(columns)
            self.create_table_query.constraints.append(f"PRIMARY KEY ({cols})")
        return self.create_table_query
    
    def foreign_key_constraint(self, column: str, references_table: str, references_column: str):
        """Add table-level foreign key constraint"""
        # Finalize current column first
        column_def = self._build_column_definition()
        self.create_table_query.columns.append(column_def)
        
        # Add table constraint
        self.create_table_query.constraints.append(
            f"FOREIGN KEY ({column}) REFERENCES {references_table}({references_column})"
        )
        return self.create_table_query
    
    def unique_constraint(self, *columns):
        """Add table-level unique constraint"""
        # Finalize current column first
        column_def = self._build_column_definition()
        self.create_table_query.columns.append(column_def)
        
        # Add table constraint
        if len(columns) == 1:
            self.create_table_query.constraints.append(f"UNIQUE ({columns[0]})")
        else:
            cols = ", ".join(columns)
            self.create_table_query.constraints.append(f"UNIQUE ({cols})")
        return self.create_table_query
    
    def check_constraint(self, name: str, condition: str):
        """Add table-level check constraint"""
        # Finalize current column first
        column_def = self._build_column_definition()
        self.create_table_query.columns.append(column_def)
        
        # Add table constraint
        self.create_table_query.constraints.append(f"CONSTRAINT {name} CHECK ({condition})")
        return self.create_table_query
    
    async def execute(self):
        """Execute the CREATE TABLE query"""
        # Finalize current column first
        column_def = self._build_column_definition()
        self.create_table_query.columns.append(column_def)
        
        # Execute the query
        return await self.create_table_query.execute()


class CreateTableQuery:
    """Handles CREATE TABLE operations with enhanced type system"""
    
    def __init__(self, db_manager, table_name: str):
        # Validate table name
        if not table_name or table_name is None:
            raise ValueError("Table name cannot be None or empty")
        
        self.db_manager = db_manager
        self.table_name = table_name
        self.columns = []
        self.constraints = []
        self.if_not_exists = False
        self._column_names = set()  # Track column names to prevent duplicates
        
    def if_not_exists_(self):
        """Add IF NOT EXISTS clause"""
        self.if_not_exists = True
        return self
        
    def column(self, name: str):
        """
        Add a column definition using fluent API
        
        Usage:
            .column("name").type("TEXT").not_null()
            .column("email").type("VARCHAR(255)").unique()
            .column("age").type("INTEGER").default(0).check("age >= 0")
        """
        # Validate column name
        if not name or name is None:
            raise ValueError("Column name cannot be None or empty")
        if name in self._column_names:
            raise ValueError(f"Column '{name}' already exists in table")
        
        self._column_names.add(name)
        return ColumnBuilder(self, name)
            
    def primary_key(self, *columns):
        """Add primary key constraint"""
        if len(columns) == 1:
            self.constraints.append(f"PRIMARY KEY ({columns[0]})")
        else:
            cols = ", ".join(columns)
            self.constraints.append(f"PRIMARY KEY ({cols})")
        return self
        
    def foreign_key(self, column: str, references_table: str, references_column: str):
        """Add foreign key constraint"""
        self.constraints.append(
            f"FOREIGN KEY ({column}) REFERENCES {references_table}({references_column})"
        )
        return self
        
    def unique(self, *columns):
        """Add unique constraint"""
        if len(columns) == 1:
            self.constraints.append(f"UNIQUE ({columns[0]})")
        else:
            cols = ", ".join(columns)
            self.constraints.append(f"UNIQUE ({cols})")
        return self
        
    def check(self, name: str, condition: str):
        """Add check constraint"""
        self.constraints.append(f"CONSTRAINT {name} CHECK ({condition})")
        return self
        
    async def execute(self):
        """Execute the CREATE TABLE query"""
        if not self.columns:
            raise ValueError("At least one column is required")
            
        # Build the query
        exists_clause = "IF NOT EXISTS " if self.if_not_exists else ""
        sql = f"CREATE TABLE {exists_clause}{self.table_name} ("
        
        # Add columns
        all_definitions = self.columns.copy()
        all_definitions.extend(self.constraints)
        
        sql += ", ".join(all_definitions)
        sql += ")"
        
        # Execute the query (DDL statement - no fetch_results needed)
        await self.db_manager._execute_query(self.table_name, sql, [], fetch_results=False)
        return True


class DropTableQuery:
    """Handles DROP TABLE operations"""
    
    def __init__(self, db_manager, table_name: str):
        self.db_manager = db_manager
        self.table_name = table_name
        self.if_exists = False
        self.cascade = False
        
    def if_exists_(self):
        """Add IF EXISTS clause"""
        self.if_exists = True
        return self
        
    def cascade_(self):
        """Add CASCADE clause to drop dependent objects"""
        self.cascade = True
        return self
        
    async def execute(self):
        """Execute the DROP TABLE query"""
        exists_clause = "IF EXISTS " if self.if_exists else ""
        cascade_clause = " CASCADE" if self.cascade else ""
        
        sql = f"DROP TABLE {exists_clause}{self.table_name}{cascade_clause}"
        
        await self.db_manager._execute_query(self.table_name, sql, [], fetch_results=False)
        return True


class TruncateTableQuery:
    """Handles TRUNCATE TABLE operations"""
    
    def __init__(self, db_manager, table_name: str):
        self.db_manager = db_manager
        self.table_name = table_name
        self.restart_identity = False
        self.cascade = False
        
    def restart_identity_(self):
        """Restart identity columns"""
        self.restart_identity = True
        return self
        
    def cascade_(self):
        """Cascade to dependent tables"""
        self.cascade = True
        return self
        
    async def execute(self):
        """Execute the TRUNCATE TABLE query"""
        sql = f"TRUNCATE TABLE {self.table_name}"
        
        if self.restart_identity:
            sql += " RESTART IDENTITY"
        if self.cascade:
            sql += " CASCADE"
            
        await self.db_manager._execute_query(self.table_name, sql, [], fetch_results=False)
        return True


class ColumnAlteration:
    """Handles fluent column alteration for ALTER TABLE ADD COLUMN"""
    
    def __init__(self, alter_table_query, column_name: str):
        self.alter_table_query = alter_table_query
        self.column_name = column_name
        self.column_type = None
        self.constraints = []
    
    def type(self, column_type: str):
        """Set the column type"""
        self.column_type = column_type.upper()
        return self
    
    def not_null(self):
        """Add NOT NULL constraint"""
        self.constraints.append("NOT NULL")
        return self
    
    def unique(self):
        """Add UNIQUE constraint"""
        self.constraints.append("UNIQUE")
        return self
    
    def default(self, value):
        """Add DEFAULT constraint"""
        if isinstance(value, str):
            if value.endswith('()'):
                self.constraints.append(f"DEFAULT {value}")
            else:
                self.constraints.append(f"DEFAULT '{value}'")
        else:
            self.constraints.append(f"DEFAULT {value}")
        return self
    
    def check(self, condition: str):
        """Add CHECK constraint"""
        self.constraints.append(f"CHECK ({condition})")
        return self
    
    def references(self, table: str, column: str):
        """Add FOREIGN KEY constraint"""
        self.constraints.append(f"REFERENCES {table}({column})")
        return self
    
    def _build_column_definition(self) -> str:
        """Build the complete column definition"""
        if not self.column_type:
            raise ValueError(f"Column '{self.column_name}' must have a type specified")
        
        parts = [self.column_name, self.column_type]
        parts.extend(self.constraints)
        return " ".join(parts)
    
    def execute(self):
        """Execute the ADD COLUMN operation"""
        column_def = self._build_column_definition()
        self.alter_table_query.operations.append(f"ADD COLUMN {column_def}")
        return self.alter_table_query


class AlterTableQuery:
    """Handles ALTER TABLE operations"""
    
    def __init__(self, db_manager, table_name: str):
        self.db_manager = db_manager
        self.table_name = table_name
        self.operations = []
        
    def add_column(self, name: str):
        """Add a new column using fluent API"""
        return ColumnAlteration(self, name)
        
    def drop_column(self, name: str, cascade: bool = False):
        """Drop a column"""
        cascade_clause = " CASCADE" if cascade else ""
        self.operations.append(f"DROP COLUMN {name}{cascade_clause}")
        return self
        
    def modify_column(self, name: str, new_type: str = None, set_not_null: bool = None, 
                     drop_not_null: bool = None, set_default: Any = None, 
                     drop_default: bool = None):
        """Modify a column (PostgreSQL style)"""
        if new_type:
            self.operations.append(f"ALTER COLUMN {name} TYPE {new_type.upper()}")
        if set_not_null:
            self.operations.append(f"ALTER COLUMN {name} SET NOT NULL")
        if drop_not_null:
            self.operations.append(f"ALTER COLUMN {name} DROP NOT NULL")
        if set_default is not None:
            if isinstance(set_default, str):
                self.operations.append(f"ALTER COLUMN {name} SET DEFAULT '{set_default}'")
            else:
                self.operations.append(f"ALTER COLUMN {name} SET DEFAULT {set_default}")
        if drop_default:
            self.operations.append(f"ALTER COLUMN {name} DROP DEFAULT")
        return self
        
    def rename_column(self, old_name: str, new_name: str):
        """Rename a column"""
        self.operations.append(f"RENAME COLUMN {old_name} TO {new_name}")
        return self
        
    def rename_table(self, new_name: str):
        """Rename the table"""
        self.operations.append(f"RENAME TO {new_name}")
        return self
        
    def add_constraint(self, name: str, constraint_type: str, definition: str):
        """Add a constraint"""
        self.operations.append(f"ADD CONSTRAINT {name} {constraint_type} {definition}")
        return self
        
    def drop_constraint(self, name: str, cascade: bool = False):
        """Drop a constraint"""
        cascade_clause = " CASCADE" if cascade else ""
        self.operations.append(f"DROP CONSTRAINT {name}{cascade_clause}")
        return self
        
    async def execute(self):
        """Execute the ALTER TABLE query"""
        if not self.operations:
            raise ValueError("At least one operation is required")
            
        # Execute each operation separately for better error handling
        for operation in self.operations:
            sql = f"ALTER TABLE {self.table_name} {operation}"
            await self.db_manager._execute_query(self.table_name, sql, [], fetch_results=False)
            
        return True


class DatabaseManager:
    """
    SQL-like Chaining Database Manager
    Provides intuitive CRUD operations with method chaining
    Handles database connections internally
    """
    
    def __init__(self, credentials_path: str = "credentials.txt"):
        """Initialize with credentials file path"""
        self.credentials_file = credentials_path
        self.credentials_path = Path(__file__).parent / "credentials" / credentials_path
        self.credentials: Dict[str, str] = {}
        self._connection: Optional[asyncpg.Connection] = None
        self._is_connected = False
        
        logger.info(f"DatabaseManager initialized for {credentials_path}")

    def _load_credentials(self):
        """Load credentials from the specified file"""
        try:
            if not self.credentials_path.exists():
                raise FileNotFoundError(f"Credentials file not found: {self.credentials_path}")
            
            with open(self.credentials_path, 'r') as f:
                content = f.read().strip()
            
            # Parse the credential file (key=value format)
            for line in content.split('\n'):
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    self.credentials[key.strip()] = value.strip()
            
            logger.info(f"Credentials loaded from {self.credentials_file}")
            
        except Exception as e:
            logger.error(f"Failed to load credentials from {self.credentials_path}: {e}")
            raise

    def _parse_database_url(self, db_url: str) -> Dict[str, str]:
        """Parse Xata database URL to extract connection parameters"""
        try:
            parsed = urlparse(db_url)
            
            # Extract components
            host_parts = parsed.hostname.split('.')
            workspace_id = host_parts[0]
            region = host_parts[1]
            
            path_parts = parsed.path.strip('/').split('/')
            db_name_with_branch = path_parts[-1] if path_parts else ""
            
            # Split database name and branch
            if ':' in db_name_with_branch:
                database, branch = db_name_with_branch.split(':', 1)
            else:
                database = db_name_with_branch
                branch = "main"
            
            return {
                "database": f"{database}:{branch}",
                "user": workspace_id,
                "host": f"{region}.sql.xata.sh",
                "port": 5432,
            }
        except Exception as e:
            logger.error(f"Failed to parse database URL: {db_url}")
            raise ValueError(f"Invalid database URL format: {e}")

    async def _create_connection(self) -> asyncpg.Connection:
        """Create a new connection to the database"""
        try:
            # Use DATABASE_URL_POSTGRES if available (preferred)
            postgres_url = self.credentials.get('DATABASE_URL_POSTGRES')
            if postgres_url:
                logger.info("Using direct PostgreSQL connection string")
                return await asyncpg.connect(postgres_url)
            
            # Fallback to building connection from components
            db_url = self.credentials.get('DATABASE_URL')
            api_key = self.credentials.get('XATA_API_KEY')
            
            if not db_url or not api_key:
                raise ValueError("Missing required credentials: need either DATABASE_URL_POSTGRES or (DATABASE_URL + XATA_API_KEY)")
            
            # Parse database URL and build PostgreSQL connection string
            conn_params = self._parse_database_url(db_url)
            postgres_url = (
                f"postgresql://{conn_params['user']}:{api_key}@"
                f"{conn_params['host']}:{conn_params['port']}/"
                f"{conn_params['database']}?sslmode=require"
            )
            
            logger.info("Using constructed PostgreSQL connection string from Xata URL")
            return await asyncpg.connect(postgres_url)
            
        except Exception as e:
            logger.error(f"Failed to create database connection: {e}")
            raise

    async def connect(self):
        """Connect to the database"""
        try:
            if self._is_connected:
                logger.info("Already connected to database")
                return
                
            self._load_credentials()
            self._connection = await self._create_connection()
            self._is_connected = True
            logger.info(f"Successfully connected to database: {self.credentials_file}")
            
        except Exception as e:
            logger.error(f"Failed to connect to database {self.credentials_file}: {e}")
            self._connection = None
            self._is_connected = False
            raise

    async def disconnect(self):
        """Disconnect from the database"""
        try:
            if self._connection and not self._connection.is_closed():
                await self._connection.close()
                logger.info(f"Successfully disconnected from database: {self.credentials_file}")
            else:
                logger.info("No active connection to disconnect")
        except Exception as e:
            logger.error(f"Error disconnecting from database {self.credentials_file}: {e}")
        finally:
            # Always reset connection state
            self._connection = None
            self._is_connected = False

    @asynccontextmanager
    async def _get_connection(self):
        """Get the database connection (internal use)"""
        if not self._is_connected:
            raise RuntimeError("Not connected to database. Call connect() first.")
        
        if not self._connection or self._connection.is_closed():
            raise RuntimeError("Connection is closed or invalid")
            
        yield self._connection

    async def _execute_query(self, table_name: str, sql: str, params: List[Any] = None, fetch_results: bool = True) -> Union[List[Dict[str, Any]], str]:
        """Execute a query using internal database connection"""
        try:
            # Use internal connection
            async with self._get_connection() as conn:
                if fetch_results:
                    # For SELECT, INSERT...RETURNING, UPDATE...RETURNING queries
                    result = await conn.fetch(sql, *(params or []))
                    # Convert asyncpg Records to list of dicts
                    return [dict(row) for row in result]
                else:
                    # For DELETE, raw UPDATE without RETURNING - get command tag
                    result = await conn.execute(sql, *(params or []))
                    return result
                    
        except Exception as e:
            logger.error(f"Error executing query on {table_name}: {e}")
            logger.error(f"SQL: {sql}")
            logger.error(f"Params: {params}")
            raise


    @property
    def select(self):
        """Start a SELECT query"""
        return SelectQuery(self)
    
    @property
    def insert(self):
        """Start an INSERT query"""
        return InsertQuery(self)
    
    def update(self, table: str):
        """Start an UPDATE query"""
        return UpdateQuery(self, table)
    
    @property
    def delete(self):
        """Start a DELETE query"""
        return DeleteQuery(self)
    
    def create_table(self, table_name: str):
        """Start a CREATE TABLE operation"""
        return CreateTableQuery(self, table_name)
    
    def drop_table(self, table_name: str):
        """Start a DROP TABLE operation"""
        return DropTableQuery(self, table_name)
    
    def truncate_table(self, table_name: str):
        """Start a TRUNCATE TABLE operation"""
        return TruncateTableQuery(self, table_name)
    
    def alter_table(self, table_name: str):
        """Start an ALTER TABLE operation"""
        return AlterTableQuery(self, table_name)

    @property
    def utils(self):
        """Access utility functions"""
        return UtilityFunctions(self)


class UtilityFunctions:
    """
    Utility functions for common database operations
    Provides convenient methods for frequent queries
    """
    
    def __init__(self, db_manager: DatabaseManager):
        """Initialize with DatabaseManager instance"""
        self.db_manager = db_manager
    
    async def list_tables(self, schema: str = "public") -> List[str]:
        """
        List all tables in the specified schema
        
        Args:
            schema: Database schema name (default: 'public')
            
        Returns:
            List of table names
        """
        try:
            result = await (self.db_manager
                .select("table_name")
                .from_("information_schema.tables")
                .where("table_schema").equals(schema)
                .and_where("table_type").equals("BASE TABLE")
                .order_by("table_name")
                .execute()
            )
            
            # Extract just the table names from the result
            return [row['table_name'] for row in result]
            
        except Exception as e:
            logger.error(f"Error listing tables in schema '{schema}': {e}")
            raise
