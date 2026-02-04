# Django Backend Setup

## Prerequisites
- Python 3.10+
- PostgreSQL

## Quick Start

1. **Create virtual environment**
```bash
cd django-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Setup PostgreSQL database**
```bash
# Create database
createdb community_feed

# Or via psql
psql -U postgres -c "CREATE DATABASE community_feed;"
```

4. **Run migrations**
```bash
python manage.py migrate
```

5. **Create superuser**
```bash
python manage.py createsuperuser
```

6. **Run development server**
```bash
python manage.py runserver 8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/` | List all posts |
| POST | `/api/posts/` | Create new post |
| GET | `/api/posts/{id}/` | Get post with threaded comments |
| GET | `/api/posts/{id}/comments/` | Get comments for post |
| POST | `/api/comments/` | Create comment/reply |
| POST | `/api/likes/` | Toggle like on post/comment |
| GET | `/api/leaderboard/` | Get top 5 users by 24h karma |
| GET | `/api/me/` | Get current user info |

## Key Design Decisions

### N+1 Problem Solution
Comments are fetched in a single query using `select_related` and `prefetch_related`. 
The threaded tree structure is built in-memory with O(n) complexity.

### Concurrency Handling
Like operations use:
1. Database-level `select_for_update()` for row locking
2. Application-level threading locks per user/target combination
3. Unique constraints to prevent duplicate likes

### Dynamic Leaderboard
Karma is stored in a `karma_transactions` table rather than a simple integer field.
This allows accurate calculation of "karma earned in last 24 hours" without losing historical data.

## Connecting to React.js Frontend

To connect the React frontend to the Django backend:

1. **In the React project**, edit `/lib/api-config.js`:
```javascript
// Change from:
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// To:
export const API_BASE_URL = 'http://localhost:8000'
```

2. **Or set environment variable** in the React project:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Ensure CORS is configured** in Django settings (already done in `config/settings.py`)

## Full Stack Development Setup

Run both servers simultaneously:

**Terminal 1 - Django Backend:**
```bash
cd django-backend
source venv/bin/activate
python manage.py runserver 8000
```

**Terminal 2 - React Frontend:**
```bash
npm run dev
# Frontend will be at http://localhost:3000
# It will call Django API at http://localhost:8000
```
