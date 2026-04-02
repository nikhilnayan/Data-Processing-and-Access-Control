# Finance Dashboard Backend

A production-quality backend API for a finance dashboard system with user management, financial records CRUD, dashboard analytics, and role-based access control.

**🟢 Live API Documentation & Demo:** [https://data-processing-and-access-control.onrender.com/api-docs/](https://data-processing-and-access-control.onrender.com/api-docs/)

## Table of Contents

- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [How to Use](#how-to-use)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Role-Based Access Control](#role-based-access-control)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Testing](#testing)
- [Assumptions & Design Decisions](#assumptions--design-decisions)

---

## Technology Stack

| Component | Technology | Rationale |
|---|---|---|
| Runtime | Node.js | Widely used, excellent ecosystem |
| Framework | Express.js | Lightweight, flexible, well-documented |
| Database | SQLite (sql.js) | Zero-config, pure-JS SQLite via WebAssembly – no native compilation needed |
| Auth | JWT (jsonwebtoken) | Stateless token-based authentication |
| Validation | Joi | Declarative schema validation with rich error messages |
| Password Hashing | bcryptjs | Pure-JS bcrypt implementation – no native dependencies |
| Testing | Jest + Supertest | Unit and integration testing |
| API Docs | Swagger/OpenAPI | Auto-generated interactive documentation |
| Security | Helmet + CORS + Rate Limiting | Defense-in-depth security approach |

---

## Architecture

The project follows a clean **layered architecture** with clear separation of concerns:

```
├── server.js                   # Entry point — starts server, runs migrations/seeds
├── src/
│   ├── app.js                  # Express app configuration
│   ├── config/
│   │   ├── index.js            # Environment configuration
│   │   └── database.js         # Database connection manager
│   ├── migrations/
│   │   └── 001_initial.js      # Database schema
│   ├── seeds/
│   │   └── 001_seed.js         # Demo data
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   ├── rbac.js             # Role-based access control
│   │   ├── validate.js         # Request validation (Joi)
│   │   ├── errorHandler.js     # Global error handler
│   │   └── rateLimiter.js      # Rate limiting
│   ├── models/                 # Data Access Layer
│   │   ├── User.js
│   │   └── FinancialRecord.js
│   ├── services/               # Business Logic Layer
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── recordService.js
│   │   └── dashboardService.js
│   ├── controllers/            # Route Handlers (thin layer)
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── recordController.js
│   │   └── dashboardController.js
│   ├── routes/                 # Route Definitions + Swagger Docs
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── records.js
│   │   └── dashboard.js
│   ├── validators/             # Joi Validation Schemas
│   │   ├── authValidator.js
│   │   ├── userValidator.js
│   │   └── recordValidator.js
│   └── utils/
│       └── apiResponse.js      # Standardized response helpers
├── tests/                      # Integration tests
│   ├── setup.js
│   ├── auth.test.js
│   ├── rbac.test.js
│   ├── records.test.js
│   └── dashboard.test.js
```

### Request Flow

```
Client Request
  → Rate Limiter
    → Authentication (JWT verification)
      → Authorization (Role check)
        → Validation (Joi schema)
          → Controller (thin handler)
            → Service (business logic)
              → Model (data access)
                → SQLite Database
```

---

## Quick Start

### Prerequisites

- **Node.js** v16 or higher
- **npm** v8 or higher

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd finance-dashboard-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables (optional — defaults work out of the box)
cp .env.example .env

# 4. Start the server (auto-creates database, runs migrations, seeds demo data)
npm run dev
```

The server will start at `http://localhost:3000` with:
- **API Base**: `http://localhost:3000/api`
- **Swagger Docs**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/api/health`

### Demo Accounts

The database is automatically seeded with these accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@example.com | admin123 |
| **Analyst** | analyst@example.com | analyst123 |
| **Viewer** | viewer@example.com | viewer123 |

---

## How to Use

You can run this project and thoroughly test all its features in two ways: **Automated Testing** (which checks every function automatically) and **Manual Testing** (using the interactive Swagger Documentation in your browser).

### 1. Automated Testing (Checks all code logic)
The project includes a comprehensive set of 56 integration tests that automatically verify every API endpoint, database interaction, validation rule, and access control permutation.

To run the entire test suite:
1. Open your terminal in the project directory.
2. Run the test command:
   ```bash
   npm test
   ```
   *You will see a green `PASS` output for all 4 test suites (Auth, RBAC, Records, Dashboard), proving that every single function works exactly as intended under various scenarios (success, bad input, unauthorized access, etc.).*

### 2. Manual Testing via Swagger UI (Visual interactive testing)
The API has built-in interactive documentation (Swagger) that lets you test endpoints directly from your browser without writing any code.

**Start the Server:**
1. In your terminal, run:
   ```bash
   npm run dev
   ```
2. The server will start on port 3000. During startup, it automatically creates the SQLite database and seeds it with demo accounts and 20 sample financial records.

**Test Endpoints in Browser:**
1. Open your browser and go to: **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**
2. This is the Swagger UI. You will see sections for Authentication, Users, Financial Records, and Dashboard.

**How to test an endpoint (Example: Get Dashboard Summary):**
1. **Get an Auth Token:**
   - Expand the `POST /api/auth/login` endpoint.
   - Click the `"Try it out"` button on the right.
   - In the request body, enter the demo admin credentials:
     ```json
     {
       "email": "admin@example.com",
       "password": "admin123"
     }
     ```
   - Click `"Execute"`.
   - Scroll down to the response window. You'll see a long string under `token`. Copy this string (without the quotes).
2. **Authorize Swagger:**
   - Scroll to the top of the page and click the green `"Authorize"` button.
   - Paste the token you copied into the `Value` box and click `"Authorize"`, then `"Close"`.
   *(Now Swagger is authenticated as an Admin).*
3. **Use the Dashboard Endpoint:**
   - Scroll down to the Dashboard section and expand `GET /api/dashboard/summary`.
   - Click `"Try it out"`, then click `"Execute"`.
   - You will see a success response showing the calculated `total_income`, `total_expenses`, and `net_balance` based on the seeded database records!

You can repeat this process to test creating records, fetching trends, testing RBAC (by logging in as `viewer@example.com` / `viewer123` and trying to create a record—it will be blocked!), and more.

---

## API Documentation

Interactive Swagger documentation is available at **`/api-docs`** when the server is running.

### Response Format

All API responses follow a consistent structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Descriptive message",
  "data": { ... }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "message": "Descriptive message",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "details": {
    "errors": [
      { "field": "email", "message": "Please provide a valid email address" }
    ]
  }
}
```

---

## Authentication

The API uses **JWT (JSON Web Token)** for authentication.

### Getting a Token

```bash
# Login to get a token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

### Using the Token

Include the token in the `Authorization` header for all protected endpoints:

```bash
curl -X GET http://localhost:3000/api/records \
  -H "Authorization: Bearer <your-jwt-token>"
```

Tokens expire after **24 hours** (configurable in `.env`).

---

## Role-Based Access Control

### Role Hierarchy

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| View records | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| View summary analytics | ❌ | ✅ | ✅ |
| View category totals | ❌ | ✅ | ✅ |
| View trends | ❌ | ✅ | ✅ |
| Create records | ❌ | ❌ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

### Implementation

RBAC is enforced via middleware:
1. **`authenticate`** — Verifies JWT and loads user from database
2. **`authorize(...roles)`** — Checks if user's role is in the allowed list

Unauthorized access returns `403 Forbidden` with a clear error message describing the required role.

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive JWT | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### User Management (Admin Only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users (paginated, filterable) |
| GET | `/api/users/:id` | Get a user by ID |
| PATCH | `/api/users/:id` | Update user (role, status, name) |
| DELETE | `/api/users/:id` | Deactivate user |

### Financial Records

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/api/records` | Create a record | Admin |
| GET | `/api/records` | List records (filtered, paginated) | All |
| GET | `/api/records/:id` | Get single record | All |
| PUT | `/api/records/:id` | Update a record | Admin |
| DELETE | `/api/records/:id` | Soft-delete a record | Admin |

#### Filtering Options for `GET /api/records`

| Parameter | Type | Description |
|---|---|---|
| `type` | string | Filter by `income` or `expense` |
| `category` | string | Filter by category name |
| `startDate` | string | Filter records from this date (YYYY-MM-DD) |
| `endDate` | string | Filter records up to this date (YYYY-MM-DD) |
| `search` | string | Search in description and category |
| `sort` | string | Sort by: `date`, `amount`, `type`, `category`, `created_at` |
| `order` | string | Sort order: `asc` or `desc` |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 20, max: 100) |

### Dashboard Analytics

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Total income, expenses, net balance | Analyst, Admin |
| GET | `/api/dashboard/category-totals` | Category-wise breakdowns | Analyst, Admin |
| GET | `/api/dashboard/trends` | Monthly income/expense trends | Analyst, Admin |
| GET | `/api/dashboard/recent` | Recent activity | All |

---

## Data Models

### User

```json
{
  "id": 1,
  "email": "admin@example.com",
  "full_name": "Alice Admin",
  "role": "admin",
  "status": "active",
  "created_at": "2026-04-01T00:00:00.000Z",
  "updated_at": "2026-04-01T00:00:00.000Z"
}
```

### Financial Record

```json
{
  "id": 1,
  "amount": 5000.00,
  "type": "income",
  "category": "Salary",
  "date": "2026-01-15",
  "description": "Monthly salary - January",
  "created_by": 1,
  "created_by_name": "Alice Admin",
  "is_deleted": 0,
  "created_at": "2026-04-01T00:00:00.000Z",
  "updated_at": "2026-04-01T00:00:00.000Z"
}
```

---

## Testing

The project includes comprehensive integration tests covering authentication, RBAC, record CRUD, and dashboard analytics.

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

### Test Structure

| File | Coverage |
|---|---|
| `auth.test.js` | Registration, login, profile, validation errors |
| `rbac.test.js` | Role permissions across all endpoints |
| `records.test.js` | CRUD operations, filtering, pagination, soft-delete |
| `dashboard.test.js` | Summary, category totals, trends, recent activity |

Tests use a **separate SQLite database** (`data/test.db`) which is created fresh and cleaned up for each test suite, ensuring full isolation.

---

## Assumptions & Design Decisions

### Assumptions

1. **Single-tenant system** — All users operate within the same organization/scope
2. **Registration is open** — Any user can register (in production, admin-only registration or email verification would be added)
3. **Role assignment on register** — Defaults to `viewer`; admins can change roles via PATCH
4. **Date format** — All dates use ISO 8601 format (`YYYY-MM-DD`)
5. **Currency-agnostic** — Amounts are stored as floating-point numbers without currency designation

### Design Decisions

1. **SQLite** — Chosen for zero-config portability. The same architecture scales to PostgreSQL/MySQL by swapping the DB driver
2. **Soft delete** — Financial records use `is_deleted` flag to preserve audit trail
3. **Layered architecture (Controller → Service → Model)** — Separates HTTP concerns from business logic from data access
4. **sql.js (WebAssembly SQLite)** — Pure-JS SQLite implementation that requires no native compilation (Python/node-gyp). The database layer uses a compatibility wrapper providing the same API as better-sqlite3
5. **Joi validation** — Provides rich, user-friendly validation errors with field-level detail
6. **Consistent response format** — All endpoints return `{ success, message, data/details }` for predictable frontend integration
7. **Admin self-protection** — Admins cannot change their own role or deactivate themselves (prevents lockout)
8. **Rate limiting** — General API limit (100 req/15min) and stricter auth limit (20 req/15min) to prevent abuse

### Security Features

- **Helmet** — Sets secure HTTP headers
- **CORS** — Cross-origin request handling
- **bcryptjs** — Password hashing with 10 salt rounds
- **JWT expiry** — Tokens auto-expire after 24h
- **Input validation** — All inputs validated before processing
- **SQL injection prevention** — Parameterized queries via sql.js prepared statements
- **Rate limiting** — Per-IP request throttling
- **No password exposure** — Password hashes are never returned in API responses

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment mode |
| `JWT_SECRET` | (set in .env) | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | 24h | JWT token expiry duration |
| `DB_PATH` | ./data/finance.db | SQLite database file path |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |
