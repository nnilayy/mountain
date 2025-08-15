# Mountain - Job Outreach and Tracking Application

This application has been migrated from Node.js/Express to a FastAPI backend with a React frontend.

## Architecture

- **Backend**: FastAPI (Python) running on port 8000
- **Frontend**: React with Vite running on port 5173
- **Database**: JSON file-based storage

## Quick Start

### Prerequisites

- Python 3.11+ (for backend)
- Node.js 18+ (for frontend)
- uv (Python package manager) or pip

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # macOS/Linux
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   # With uv (recommended)
   uv pip install -r requirements.txt
   
   # Or with pip
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at http://localhost:8000
   API docs available at http://localhost:8000/docs

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at http://localhost:5173

## Development Workflow

1. **Start Backend**: Run the FastAPI server on port 8000
2. **Start Frontend**: Run the Vite dev server on port 5173
3. **Access Application**: Open http://localhost:5173 in your browser

The frontend will automatically proxy API requests to the FastAPI backend.

## API Endpoints

- `GET /api/companies` - List all companies
- `POST /api/companies` - Create a new company
- `GET /api/companies/{id}` - Get a specific company
- `PATCH /api/companies/{id}` - Update a company
- `DELETE /api/companies/{id}` - Delete a company
- `GET /api/people` - List all people
- `POST /api/people` - Create a new person
- `GET /api/email-stats` - List email statistics
- `POST /api/email-stats` - Create email stat entry
- `GET /api/stats` - Get dashboard statistics
- `POST /api/schedule` - Create email schedules
- `GET /api/holidays` - Get holiday information

## Environment Variables

### Backend (.env in backend directory)
```
DEBUG=True
API_HOST=0.0.0.0
API_PORT=8000
HOLIDAYS_API_URL=https://api.11holidays.com/v1/holidays
REQUEST_TIMEOUT=10
SLEEP_BETWEEN_REQUESTS=0.1
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000,http://localhost:5173
```

### Frontend (.env in frontend directory)
```
VITE_API_BASE_URL=http://localhost:8000
```

## Build for Production

### Backend
```bash
cd backend
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run build
npm run start
```

## Migration Notes

This application has been successfully migrated from:
- Node.js/Express backend → FastAPI (Python)
- Drizzle ORM + PostgreSQL → JSON file storage
- Mixed server/client architecture → Separate backend/frontend

All original functionality has been preserved and enhanced with additional features like holiday checking and advanced scheduling.
