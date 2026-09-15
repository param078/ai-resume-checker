from pydantic import BaseModel


class JobDescription(BaseModel):
    title: str
    required_skills: list[str]
    preferred_skills: list[str]
    experience: str
    education: str
    responsibilities: list[str]