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
| POST | `/api/exams` | - | Create a new exam | ✅ Admin |
| GET | `/api/exams/:examId` | - | Get specific exam | ✅ Admin |
| PATCH | `/api/exams/:examId` | - | Update exam (with action) | ✅ Admin |
| DELETE | `/api/exams/:examId` | - | Delete an exam | ✅ Admin |

**Example Queries:**
- Admin viewing all exams: `GET /api/exams`
- User browsing available exams: `GET /api/exams?status=active&include_attempts=true`
- User viewing their exam history: `GET /api/exams?include_attempts=true`

**PATCH Examples:**
- Activate exam: `PATCH /api/exams/:examId` with body `{ "is_active": true }`
- Deactivate exam: `PATCH /api/exams/:examId` with body `{ "is_active": false }`
- Update title: `PATCH /api/exams/:examId` with body `{ "title": "New Title" }`
- Update multiple fields: `PATCH /api/exams/:examId` with body `{ "title": "New Title", "description": "New desc", "is_active": true }`

---

### **4. questions.py** - Question Management (`/api`)
Question CRUD operations (Admin only). Questions are decoupled from exam routes for better REST design.

| Method | Endpoint | Query Params | Description | Auth Required |
|--------|----------|--------------|-------------|---------------|
| GET | `/api/questions` | `exam_id` (optional) | Get all questions, optionally filtered by exam | ✅ Admin |
| POST | `/api/questions` | - | Add questions to an exam | ✅ Admin |
| GET | `/api/questions/:questionId` | - | Get a specific question | ✅ Admin |
| PATCH | `/api/questions/:questionId` | - | Update a question | ✅ Admin |
| DELETE | `/api/questions/:questionId` | - | Delete a question | ✅ Admin |

**Example Queries:**
- Get all questions for an exam: `GET /api/questions?exam_id=1`
- Get all questions across all exams: `GET /api/questions`

**POST Example:**
```json
POST /api/questions
{
  "exam_id": 1,
  "questions": [
    {
      "question_text": "What is 2+2?",
      "question_type": "multiple_choice",
      "subject": "Maths",
      "options": ["2", "3", "4", "5"],
      "correct_answer": "4",
      "marks": 1
    }
  ]
}
```

**PATCH Example:**
```json
PATCH /api/questions/5
{
  "question_text": "Updated question text",
  "marks": 2,
  "difficulty": "hard"
}
```

---

### **5. exam_attempt.py** - Exam Attempts (`/api`)
Exam taking and attempt management.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/exam-attempts` | Get all exam attempts for current user | ✅ |
| GET | `/api/exam-attempts/:attemptId` | Get detailed attempt with questions & answers | ✅ |
| POST | `/api/start-exam/:examId` | Start a new exam attempt | ✅ |
| POST | `/api/submit-exam/:attemptId` | Submit exam with answers | ✅ |

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
- Public exam browsing (`/available-exams`) is also in **exams.py** but doesn't require admin
- Exam attempt routes (taking exams, viewing results) are in **exam_attempt.py**
- File uploads (diagrams) are in **admin.py**

