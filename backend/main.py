from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from db import client,  users_collection, analyses_collection
from models.user import userCreate, userLogin
from pwdlib import PasswordHash
import jwt
from datetime import datetime, timedelta, timezone
import os
from bson import ObjectId
from services.resume_parser import extract_text
from services.score import calculate_skill_score, calculate_overall_score
from services.ai_analyzer import analyze_Resume, extract_job_description
from typing import List
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", 
         "https://ai-resume-checker-lac.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
security = HTTPBearer()

password_hash = PasswordHash.recommended()

@app.get("/")

def home():
  return{
    "message": "BAckend running"
  }

 

@app.post("/signup")
def signUp(user: userCreate):
   existing_user = users_collection.find_one({
      "email":user.email
   })

   if existing_user:
      return{
         "message": "email already exists"
      }
   
   hashed_password = password_hash.hash(user.password)

   user_data ={
      "name": user.name,
      "email": user.email,
      "password": hashed_password
   }

   result = users_collection.insert_one(user_data)

   return {
      "message": "user created successfully",
      "user_id": str(result.inserted_id)
   }

JWT_ALGORITHM  = "HS256"

def create_access_token(user_id: str):
   payload = {
      
      "sub": user_id, #konse user ka token h
      "exp": datetime.now(timezone.utc)  + timedelta(hours=1) #kitne time badd token expire ho jayega 
   }

   token = jwt.encode(
      payload,
      os.getenv("JWT_SECRET"),
      algorithm = JWT_ALGORITHM
   )

   return token

@app.post("/login")
def login(user: userLogin):

    existing_user = users_collection.find_one({
        "email": user.email
    })

    if not existing_user:
        return {
            "message": "Invalid email or password"
        }

    if not password_hash.verify(
        user.password,
        existing_user["password"]
    ):
        return {
            "message": "Invalid email or password"
        }

    token = create_access_token(
        str(existing_user["_id"])
    )

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer"
    }

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
   token = credentials.credentials

   try:
      payload = jwt.decode(
         token,
         os.getenv("JWT_SECRET"),
         algorithms=[JWT_ALGORITHM]
      )

      user_id  = payload.get("sub")

      if not user_id:
         raise HTTPException(
            status_code=401,
            detail="Invalid Token"
         )

      return user_id

   except jwt.ExpiredSignatureError:
      raise HTTPException(
         status_code=401,
         detail="Token has expired"
      )

   except jwt.InvalidTokenError:
      raise HTTPException(
         status_code=401,
         detail="Invalid Token"
      )


@app.get("/profile")
def profile(user_id: str = Depends(get_current_user)):

   user = users_collection.find_one({
      "_id": ObjectId(user_id)
   })

   if not user:
      raise HTTPException(
         status_code=401,
         detail=  " user not found"
      )
   
   return{
      "name": user["name"],
      "email": user["email"]
   }


@app.post("/upload-resume")
async def uploadResume(file: List[UploadFile] = File(...)):

   if not file.filename:
      raise HTTPException(
         status_code= 400,
         detail= "no file selected"
      )

   filename = file.filename.lower()

   if not (filename.endswith(".pdf") or filename.endswith(".docx")):
      raise HTTPException(
         status_code=400,
         detail="Only PDF or DOCX files are allowed "
      )


   file_content = await file.read()

   text = extract_text(
      file.filename,
      file_content
   )

   
   return {
      "filename": file.filename,
      "content_Type":  file.content_type,
      "message": "Resume Uploaded Successfully",
      "text": text
   }


@app.post("/analyze-resume")
async def analyze_resume(
    files: List[UploadFile] = File(...),
    job_description: str = Form(...),
    user_id: str = Depends(get_current_user)
):

    job = extract_job_description(job_description)

    results = []

    for file in files:

        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="file not uploaded"
            )

        filename = file.filename.lower()

        if not (
            filename.endswith(".pdf")
            or filename.endswith(".docx")
        ):
            raise HTTPException(
                status_code=400,
                detail="Only PDF and DOCX files are allowed"
            )

        file_content = await file.read()

        resume_text = extract_text(
            file.filename,
            file_content
        )

        analysis = analyze_Resume(
            resume_text,
            job
        )

        skill_score = calculate_skill_score(
            analysis.matched_skills,
            analysis.missing_skills
        )

        overallScore = calculate_overall_score(
            skill_score
        )

        results.append({
            "filename": file.filename,
            "analysis": analysis.model_dump(),
            "skill_score": skill_score,
            "overall_score": overallScore
        })

        analyses_collection.insert_one({
            "user_id": user_id,
            "resume_filename": file.filename,
            "job_description": job.model_dump(),
            "analysis": analysis.model_dump(),
            "skill_score": skill_score,
            "overall_score": overallScore
        })


   
    results.sort(
        key=lambda x: x["overall_score"],
        reverse=True
    )

    for index, result in enumerate(results, start=1):
        result["rank"] = index


    return {
        "results": results
    }

 
 

@app.get("/analyses")
def get_analyses(user_id: str = Depends(get_current_user)):

    analyses = list(
        analyses_collection.find(
            {"user_id": user_id}
        )
    )

    for analysis in analyses:
        analysis["_id"] = str(analysis["_id"])

    return {
        "analyses": analyses
    }

@app.get("/analyses/{analysis_id}")
def get_analysis(
    analysis_id: str,
    user_id: str = Depends(get_current_user)
):

    analysis = analyses_collection.find_one({
    "_id": ObjectId(analysis_id),
    "user_id": user_id
})

    if not analysis:
     raise HTTPException(
        status_code=404,
        detail="Analysis not found"
    )

    analysis["_id"] = str(analysis["_id"])

    return analysis
    