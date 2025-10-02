# 📊 Diagram Path Handling Guide

## Overview
The `diagram_path` field in questions allows you to include visual diagrams, charts, graphs, or images that accompany questions. This is especially useful for math, science, and visual learning questions.

## 🔧 How It Works

### 1. **Database Storage**
- Field: `diagram_path` (String, 255 characters max)
- Stores the URL or path to the diagram image
- Optional field (can be null)

### 2. **Supported Methods**

#### **Method A: External URLs (Recommended for now)**
```json
{
  "question_text": "What is the area of the triangle shown?",
  "diagram_path": "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Triangle"
}
```

#### **Method B: File Upload (Available)**
- Upload endpoint: `POST /api/admin/upload-diagram`
- Supported formats: PNG, JPG, JPEG, GIF, SVG, WEBP
- Returns diagram URL for use in questions

#### **Method C: Relative Paths**
```json
{
  "diagram_path": "/api/admin/diagrams/triangle-abc.png"
}
```

## 🎨 Frontend Display

### **Automatic Image Display**
- Images are automatically displayed when `diagram_path` is provided
- Responsive design (max-width: 100%, max-height: 400px)
- Error handling for broken images
- Centered layout with professional styling

### **Error Handling**
- Shows "📷 Diagram not available" if image fails to load
- Displays the attempted path for debugging
- Graceful fallback without breaking the question display

## 📝 Usage Examples

### **Math Question with Geometry**
```json
{
  "question_text": "Calculate the area of triangle ABC shown in the diagram.",
  "question_type": "multiple_choice",
  "subject": "math",
  "question_context": "Geometry - Area calculation",
  "difficulty": "medium",
  "diagram_path": "https://example.com/diagrams/triangle-abc.png",
  "options": ["12 cm²", "15 cm²", "18 cm²", "20 cm²"],
  "correct_answer": "15 cm²"
}
```

### **Science Question with Chart**
```json
{
  "question_text": "Based on the graph shown, what happens to temperature over time?",
  "question_type": "multiple_choice",
  "subject": "science",
  "diagram_path": "https://example.com/charts/temperature-graph.png",
  "options": ["Increases", "Decreases", "Stays constant", "Fluctuates"],
  "correct_answer": "Increases"
}
```

### **English Question with Visual Context**
```json
{
  "question_text": "Describe what you see in the image.",
  "question_type": "short_answer",
  "subject": "english",
  "diagram_path": "https://example.com/images/scene.jpg",
  "correct_answer": "A peaceful garden scene"
}
```

## 🚀 File Upload API

### **Upload Diagram**
```bash
POST /api/admin/upload-diagram
Content-Type: multipart/form-data
Authorization: Bearer <token>

# Form data:
file: <image_file>
```

### **Response**
```json
{
  "message": "Diagram uploaded successfully",
  "diagram_path": "/api/admin/diagrams/abc123def456.png",
  "filename": "abc123def456.png"
}
```

### **Serve Diagrams**
```bash
GET /api/admin/diagrams/<filename>
# Returns the image file
```

## 💡 Best Practices

### **1. Image Optimization**
- Use appropriate file formats (PNG for diagrams, JPG for photos)
- Keep file sizes reasonable (< 1MB recommended)
- Use descriptive filenames

### **2. Accessibility**
- Always provide descriptive `question_text` that works without the image
- Use diagrams to supplement, not replace, clear question text

### **3. URL Management**
- Use absolute URLs for external images
- Use relative paths for uploaded images
- Test image URLs before adding questions

### **4. Error Handling**
- Always have fallback question text that works without diagrams
- Test questions with and without images loading

## 🔧 Technical Implementation

### **Backend**
- `diagram_path` field in Question model
- File upload endpoint with validation
- Static file serving for uploaded images
- Secure filename generation (UUID-based)

### **Frontend**
- Automatic image display in QuestionManager
- Error handling with fallback display
- Responsive image sizing
- Professional styling with borders and shadows

## 📁 File Structure
```
backend/
├── uploads/
│   └── diagrams/
│       ├── abc123def456.png
│       └── def789ghi012.jpg
└── app/
    └── routes/
        └── admin.py  # Upload endpoints
```

## 🎯 Use Cases

1. **Mathematics**: Geometric shapes, graphs, charts
2. **Science**: Diagrams, lab setups, data visualizations  
3. **Geography**: Maps, charts, satellite images
4. **History**: Historical documents, timelines, artifacts
5. **Language**: Visual context for comprehension questions
6. **Art**: Artwork analysis, color theory diagrams

## 🔒 Security Features

- File type validation (only image formats allowed)
- Secure filename generation (prevents path traversal)
- Admin-only upload access
- File size limits (configurable)
- Unique filenames prevent conflicts
