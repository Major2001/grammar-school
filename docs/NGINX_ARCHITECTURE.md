# Nginx Architecture: Two-Layer Setup

## Overview

Your application uses a **two-layer nginx architecture**:
1. **Main Nginx (Reverse Proxy)** - Entry point, routes traffic
2. **Frontend Nginx** - Serves React static files with SPA routing support

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             │ (Port 80)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MAIN NGINX (Reverse Proxy)                   │
│              Container: grammar-school-nginx                    │
│              Config: nginx/nginx.conf                           │
│              Port: 80 (exposed to host)                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Request Routing Logic:                                   │  │
│  │                                                           │  │
│  │  IF path starts with /api/                               │  │
│  │     └─► Proxy to Backend (Flask)                        │  │
│  │                                                           │  │
│  │  IF path is /health                                      │  │
│  │     └─► Return "healthy" (no proxy)                     │  │
│  │                                                           │  │
│  │  IF path is / (everything else)                         │  │
│  │     └─► Proxy to Frontend Nginx                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────────────┬──────────────────┘
              │                               │
              │                               │
    ┌─────────▼─────────┐         ┌──────────▼──────────┐
    │                   │         │                     │
    │   BACKEND         │         │   FRONTEND NGINX    │
    │   (Flask API)     │         │   Container:        │
    │                   │         │   grammar-school-  │
    │   Port: 5001      │         │   frontend         │
    │   (internal)      │         │   Config: frontend/ │
    │                   │         │   nginx.conf        │
    │   Handles:        │         │   Port: 80          │
    │   - /api/login    │         │   (internal)        │
    │   - /api/exams    │         │                     │
    │   - /api/users    │         │   ┌──────────────┐  │
    │   - etc.          │         │   │ Static Files │  │
    │                   │         │   │ (React Build)│  │
    │                   │         │   │              │  │
    │                   │         │   │ /index.html  │  │
    │                   │         │   │ /static/     │  │
    │                   │         │   │ /assets/      │  │
    │                   │         │   └──────────────┘  │
    │                   │         │                     │
    │                   │         │   SPA Routing:      │
    │                   │         │   try_files $uri    │
    │                   │         │   $uri/ /index.html │
    │                   │         │                     │
    └───────────────────┘         └─────────────────────┘
```

---

## Request Flow Examples

### Example 1: User visits `/dashboard`

```
1. User Browser
   └─► GET http://18.130.45.89/dashboard

2. Main Nginx (nginx/nginx.conf)
   ├─► Checks: path = "/dashboard"
   ├─► Matches: location / (catch-all)
   └─► Proxies to: http://frontend:80/dashboard

3. Frontend Nginx (frontend/nginx.conf)
   ├─► Receives: /dashboard
   ├─► Checks: Does /dashboard file exist? NO
   ├─► Checks: Does /dashboard/ directory exist? NO
   ├─► Falls back: Serves /index.html (try_files directive)
   └─► Returns: index.html (React app)

4. React App (in browser)
   ├─► Loads index.html
   ├─► React Router sees URL is /dashboard
   └─► Renders Dashboard component
```

### Example 2: User makes API call to `/api/login`

```
1. User Browser
   └─► POST http://18.130.45.89/api/login

2. Main Nginx (nginx/nginx.conf)
   ├─► Checks: path starts with "/api/"
   ├─► Matches: location /api/
   ├─► Applies: Rate limiting (login zone: 5 req/min)
   ├─► Adds: CORS headers
   └─► Proxies to: http://backend:5001/api/login

3. Backend (Flask)
   ├─► Receives: POST /api/login
   ├─► Processes: Authentication
   └─► Returns: JSON response with JWT token

4. Main Nginx
   └─► Returns: Response to user (with CORS headers)
```

### Example 3: User requests static asset `/static/js/main.js`

```
1. User Browser
   └─► GET http://18.130.45.89/static/js/main.js

2. Main Nginx
   ├─► Matches: location / (catch-all)
   └─► Proxies to: http://frontend:80/static/js/main.js

3. Frontend Nginx
   ├─► Receives: /static/js/main.js
   ├─► Checks: File exists? YES
   ├─► Matches: Static asset pattern (\.js)
   ├─► Adds: Cache headers (1 year expiry)
   └─► Returns: main.js file directly
```

---

## Key Configuration Details

### Main Nginx (`nginx/nginx.conf`)

**Purpose**: Reverse proxy and router

**Key Features**:
- **Routing**: Routes `/api/*` to backend, everything else to frontend
- **Rate Limiting**: Protects API endpoints (10 req/s general, 5 req/min for login)
- **CORS Headers**: Adds CORS headers for API requests
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **Load Balancing**: Can be extended with multiple backend/frontend instances

**Location Blocks**:
```nginx
location /api/          → Backend (Flask)
location /api/login      → Backend (with stricter rate limiting)
location /              → Frontend Nginx
location /health        → Direct response (no proxy)
```

### Frontend Nginx (`frontend/nginx.conf`)

**Purpose**: Serve React static files with SPA routing

**Key Features**:
- **SPA Routing**: `try_files $uri $uri/ /index.html` - serves index.html for all routes
- **Static File Serving**: Serves built React files from `/usr/share/nginx/html`
- **Caching**: Long-term caching for static assets (JS, CSS, images)
- **Compression**: Gzip compression for text files
- **Security Headers**: Additional security headers

**Why Two Nginx Servers?**

1. **Separation of Concerns**:
   - Main nginx handles routing, rate limiting, CORS
   - Frontend nginx handles SPA routing and static file serving

2. **Flexibility**:
   - Can scale frontend and backend independently
   - Can add SSL/TLS termination at main nginx level
   - Can add multiple frontend instances behind main nginx

3. **SPA Routing**:
   - Frontend nginx needs `try_files` to handle React Router
   - Main nginx doesn't need to know about frontend routes

---

## Network Flow

```
Internet (Port 80)
    │
    ▼
Main Nginx Container (Port 80)
    │
    ├──► Backend Container (Port 5001) [Docker Network]
    │
    └──► Frontend Container (Port 80) [Docker Network]
            │
            └──► Serves static files from /usr/share/nginx/html
```

**Docker Network**: All containers communicate via `grammar-school-network` bridge network using service names (`backend`, `frontend`, `nginx`).

---

## Port Mapping

| Service | Container Port | Host Port | Accessible From |
|---------|---------------|-----------|-----------------|
| Main Nginx | 80 | 80 | Internet (18.130.45.89) |
| Frontend | 80 | 3000 | Only if accessing directly (not recommended) |
| Backend | 5001 | 5001 | Only if accessing directly (not recommended) |

**Note**: Only Main Nginx should be accessed from the internet. Frontend and Backend are internal services.

---

## Why This Fixes the 404 Error

**Before**: Frontend nginx used default config → didn't handle `/dashboard` or `/login` routes → returned 404

**After**: Frontend nginx has `try_files $uri $uri/ /index.html` → serves `index.html` for all routes → React Router handles routing → no more 404s!

