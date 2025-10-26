# API Routes Documentation

## Overview
The backend API is organized into logical blueprints for better maintainability.

---

## 📁 Route Files

### **1. auth.py** - Authentication (`/api`)
User authentication and registration.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/register` | Register a new user | ❌ |
| POST | `/api/login` | User login | ❌ |

---

### **2. user.py** - User Profile (`/api`)
User profile management.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profile` | Get current user profile | ✅ |

---

### **3. exams.py** - Exam Management (`/api`)
Exam and question management (both admin and public routes).

#### **Exam Routes** (Smart filtering based on user role)

| Method | Endpoint | Query Params | Description | Auth Required |
|--------|----------|--------------|-------------|---------------|
| GET | `/api/exams` | - | Get all exams (admin) or active exams only (users) | ✅ |
| GET | `/api/exams` | `status=active` | Get only active exams | ✅ |
| GET | `/api/exams` | `include_attempts=true` | Include user's attempt history & question counts | ✅ |
| POST | `/api/exams` | - | Create a new exam with 50 answer key | ✅ Admin |
| GET | `/api/exams/:examId` | - | Get specific exam details with question counts | ✅ (Admin: all exams, Users: active exams only) |
| GET | `/api/exams/:examId/questions` | - | Get exam questions for grading (without correct answers) | ✅ (Admin: all exams, Users: active exams only) |
| PATCH | `/api/exams/:examId` | - | Update exam (with action) | ✅ Admin |
| DELETE | `/api/exams/:examId` | - | Delete an exam | ✅ Admin |

**Example Queries:**
- Admin viewing all exams: `GET /api/exams`
- User browsing available exams: `GET /api/exams?status=active&include_attempts=true`
- User viewing their exam history: `GET /api/exams?include_attempts=true`

**POST Create Exam Example:**
```json
POST /api/exams
{
  "title": "Practice Test 1",
  "description": "Grammar School Entrance Exam",
  "answers": ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D", "A", "B"]
}
```

**PATCH Examples:**
- Activate exam: `PATCH /api/exams/:examId` with body `{ "is_active": true }`
- Deactivate exam: `PATCH /api/exams/:examId` with body `{ "is_active": false }`
- Update title: `PATCH /api/exams/:examId` with body `{ "title": "New Title" }`
- Update answers: `PATCH /api/exams/:examId` with body `{ "answers": ["A", "B", "C", "D", ...] }`
- Update multiple fields: `PATCH /api/exams/:examId` with body `{ "title": "New Title", "description": "New desc", "answers": ["A", "B", "C", "D", ...] }`

---


### **5. exam_attempt.py** - Exam Attempts (`/api`)
Exam grading and attempt management.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/exam-attempts` | Get all exam attempts for current user | ✅ |
| GET | `/api/exam-attempts/:attemptId` | Get detailed attempt with questions & answers | ✅ |
| POST | `/api/submit-graded-exam/:examId` | Submit graded exam answers and get results | ✅ |

**POST Submit Graded Exam Example:**
```json
POST /api/submit-graded-exam/1
{
  "answers": {
    "1": "A",
    "2": "B", 
    "3": "C",
    "4": "D"
  }
}
```

**Response:**
```json
{
  "message": "Exam graded successfully",
  "score": 3,
  "total_marks": 4,
  "score_percentage": 75.0,
  "total_questions": 4,
  "attempt_id": 123
}
```

---

### **6. diagrams.py** - Diagram Management (`/api`)
Diagram upload and serving.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/diagrams/upload` | Upload a diagram image | ✅ Admin |
| GET | `/api/diagrams/:filename` | Serve uploaded diagram | ❌ |

---

### **6. admin.py** - Admin Utilities (`/api/admin`)
Reserved for future admin-specific utilities and features.

---

### **7. health.py** - Health Check (`/api`)
System health monitoring.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Health check | ❌ |

---

## 🔐 Authentication

- **✅ Auth Required**: Requires valid JWT token in Authorization header
- **✅ Admin**: Requires JWT token + user must have `is_admin=True`
- **❌ No Auth**: Public endpoint

### Authorization Header Format:
```
Authorization: Bearer <jwt_token>
```

---

## 📊 Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

---

## 🎯 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions (not admin) |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## 📝 Notes

- All exam management routes (CRUD) are in **exams.py**
- Admin-only routes are prefixed with `/admin/` and check for admin status
- Exam creation now includes 50 answer keys (A, B, C, D) stored directly in the exam record
- Exam grading routes are in **exam_attempt.py**
- File uploads (diagrams) are in **admin.py**
- Questions are now generated dynamically (50 generic questions) for grading purposes

## 🎯 Exam System

The system now uses a simplified approach:
- **Admin creates exams** with title, description, and 50 answer keys
- **Users grade exams** by selecting answers for 50 questions (A, B, C, D)
- **System calculates scores** by comparing user answers with stored answer keys
- **Results are saved** as exam attempts with scores and percentages

