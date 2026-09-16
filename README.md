# AI Resume Checker

AI Resume Checker is an AI-powered recruitment screening application that helps recruiters analyze multiple candidate resumes against a job description, identify skill gaps, score candidates, and rank them based on their job fit.

## Features

- User signup and login
- JWT-based authentication
- Password hashing with Argon2
- Upload multiple resumes
- Supports PDF and DOCX resumes
- Automatic resume text extraction
- AI-powered resume analysis
- Job description extraction
- Matched and missing skill detection
- Candidate strengths and weaknesses
- AI-generated improvement suggestions
- Candidate scoring and ranking
- Analysis history stored in MongoDB
- Recruiter dashboard
- Responsive frontend

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Python
- FastAPI
- Pydantic

### Database
- MongoDB Atlas
- PyMongo

### Authentication
- JWT
- Argon2 password hashing

### AI
- Groq API
- GPT-OSS-20B

### Resume Processing
- PyMuPDF
- python-docx

## Application Flow

```text
Recruiter
   ↓
Signup / Login
   ↓
Dashboard
   ↓
Enter Job Description
   ↓
Upload Candidate Resumes
   ↓
Resume Text Extraction
   ↓
Job Description Analysis
   ↓
AI Resume Analysis
   ↓
Skill Matching
   ↓
Candidate Scoring
   ↓
Candidate Ranking
   ↓
Screening Results
   ↓
Analysis History




How It Works
1. Authentication

Recruiters can create an account and login securely.

Passwords are hashed before being stored in the database, and JWT tokens are used to protect authenticated API routes.

2. Job Description

The recruiter enters a job description. The AI extracts important information such as:

Job title
Required skills
Preferred skills
Experience requirements
Education requirements
Responsibilities
3. Resume Upload

Recruiters can upload multiple candidate resumes in:

PDF
DOCX

The backend extracts the text from each resume before sending the relevant information for AI analysis.

4. AI Analysis

Each resume is compared with the job description.

The system identifies:

Matched skills
Missing skills
Strengths
Weaknesses
Improvement suggestions
5. Candidate Scoring

Candidates receive a skill-based match score based on their matched and missing skills.

Candidates are then ranked from highest to lowest score.

6. Analysis History

Screening results are stored in MongoDB and can be viewed from the recruiter dashboard.

Installation

Clone the repository:

git clone <your-repository-url>
cd "AI Resume Checker"
Backend Setup

Navigate to the backend:

cd backend

Create a virtual environment:

python -m venv venv

Activate it on Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Create a .env file:

MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret

Start the FastAPI server:

python -m uvicorn main:app --reload

The backend will run on:

http://127.0.0.1:8000
Frontend Setup

Open the frontend folder using VS Code and run the project using Live Server.

The frontend will typically run on:

http://127.0.0.1:5500
Environment Variables

The following environment variables are required:

Variable	Purpose
MONGODB_URI	MongoDB Atlas connection
GROQ_API_KEY	Groq API authentication
JWT_SECRET	JWT token signing

Never commit the .env file or expose API keys and database credentials publicly.

API Overview
Method	Endpoint	Purpose
POST	/signup	Create a user account
POST	/login	Authenticate user
GET	/profile	Get current user profile
POST	/analyze-resume	Analyze candidate resumes
GET	/analyses	Get analysis history
GET	/analyses/{analysis_id}	Get a specific analysis
Limitations
Resume parsing currently depends on extractable text from PDF/DOCX files.
Scanned/image-only PDFs are not processed using OCR.
AI analysis depends on the availability of the configured LLM API.
The scoring system currently focuses primarily on skill matching.
Future Improvements
OCR support for scanned resumes
More advanced candidate scoring
Resume recommendations and rewriting
Advanced recruiter analytics
Email notifications
Role-based access control
Production deployment and monitoring
Author

Pramanand Upadhyay

Developer / Creator



## Live Demo

- **[Live Demo](https://ai-resume-checker-lac.vercel.app/)**
- **[GitHub Repository](https://github.com/param078/ai-resume-checker)**