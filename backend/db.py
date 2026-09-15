from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

uri= os.getenv("MONGODB_URI")

client = MongoClient(uri)

db = client["ai_resume_checker"]

users_collection = db["users"]

analyses_collection = db["analyses"]