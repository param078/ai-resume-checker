import os 
from groq import Groq
from dotenv import load_dotenv
from models.analysis import  ResumeAnalysis
from models.jobDesc import JobDescription
import json

load_dotenv()

client = Groq(
  api_key = os.getenv("GROQ_API_KEY")
)


def extract_job_description(job_description: str):
    prompt = f"""
Extract the important information from the following job description.

Return ONLY valid JSON in this exact format:

{{
    "title": "job title",
    "required_skills": ["skill1", "skill2"],
    "preferred_skills": ["skill1", "skill2"],
    "experience": "experience requirement",
    "education": "education requirement",
    "responsibilities": ["responsibility1", "responsibility2"]
}}

Do not invent information.
If a field is not mentioned, use an empty string or empty list.

JOB DESCRIPTION:
{job_description}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": "You extract structured information from job descriptions. Do not invent information."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    responses = response.choices[0].message.content
    data = json.loads(responses)

    job = JobDescription.model_validate(data)

    return job

def analyze_Resume(resume_text: str,  job: JobDescription):
 system_prompt = """
You are an AI Resume Analyzer.

Your task is to accurately compare a candidate's resume with a job description.

Rules:
1. Only consider a skill as matched if it is explicitly present in the resume.
2. Do not assume or infer skills that are not mentioned in the resume.
3. Identify missing skills based only on the requirements of the job description.
4. Keep strengths and weaknesses relevant to the resume and job description.
5. Give practical suggestions for improving the candidate's fit.
6. Do not invent experience, education, projects, certifications, or skills.
7. Return only valid JSON.
8. Do not include markdown, code fences, or any explanation outside the JSON.
"""
 prompt = f"""
  Analyze the following resume against job description

    Return ONLY valid JSON.
    Do not include markdown or any explanation outside the JSON.

    JSON format:
    {{
        "matched_skills": ["skill1", "skill2"],
        "missing_skills": ["skill1", "skill2"],
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "suggestions": ["suggestion1", "suggestion2"]
    }}

      Important:
    - Only mark a skill as matched if it is explicitly mentioned in the resume.
    - Do not infer skills from similar technologies or project descriptions.
    - Only include missing skills that are relevant to the job description.
    - Do not invent any information.

  RESUME:
  {resume_text}

JOB DESCRIPTION:
{job.model_dump_json()}
"""


 response = client.chat.completions.create(
        model="openai/gpt-oss-20b",

        messages=[
           {
            "role": "system",
            "content": system_prompt
          },
            {
                "role": "user",
                "content":  prompt
            }
        ]
    )
 responses =  response.choices[0].message.content

 data = json.loads(responses)

 analysis = ResumeAnalysis.model_validate(data)

 return analysis



