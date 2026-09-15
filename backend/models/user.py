from pydantic import BaseModel, EmailStr

class userCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class userLogin(BaseModel):
    email: EmailStr
    password: str