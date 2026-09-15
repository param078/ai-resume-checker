from pydantic import BaseModel


class ResumeAnalysis(BaseModel):
    matched_skills: list[str]
    missing_skills: list[str]
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]