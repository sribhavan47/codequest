from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import subprocess
import tempfile
import uuid
import hashlib
import jwt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    hashed_password: str
    xp: int = 0
    level: int = 1
    badges: List[str] = []
    completed_challenges: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    xp: int
    level: int
    badges: List[str]
    completed_challenges: List[str]

class Challenge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    type: str  # "multiple_choice" or "coding"
    difficulty: str  # "easy", "medium", "hard"
    xp_reward: int
    language: Optional[str] = None  # For coding challenges: "python" or "javascript"
    starter_code: Optional[str] = None
    solution: Optional[str] = None
    test_cases: Optional[List[Dict[str, Any]]] = None
    options: Optional[List[str]] = None  # For multiple choice
    correct_answer: Optional[str] = None  # For multiple choice
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChallengeCreate(BaseModel):
    title: str
    description: str
    type: str
    difficulty: str
    xp_reward: int
    language: Optional[str] = None
    starter_code: Optional[str] = None
    solution: Optional[str] = None
    test_cases: Optional[List[Dict[str, Any]]] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None

class CodeSubmission(BaseModel):
    challenge_id: str
    code: str
    language: str

class MultipleChoiceSubmission(BaseModel):
    challenge_id: str
    answer: str

class ExecutionResult(BaseModel):
    success: bool
    output: str
    error: Optional[str] = None
    passed_tests: int = 0
    total_tests: int = 0

# Auth utilities
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

# Code execution utilities
def execute_python_code(code: str, test_inputs: List[str] = None) -> ExecutionResult:
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        result = subprocess.run(
            ['python3', temp_file],
            capture_output=True,
            text=True,
            timeout=5,
            input='\n'.join(test_inputs) if test_inputs else None
        )
        
        os.unlink(temp_file)
        
        if result.returncode == 0:
            return ExecutionResult(success=True, output=result.stdout.strip())
        else:
            return ExecutionResult(success=False, output="", error=result.stderr.strip())
            
    except subprocess.TimeoutExpired:
        return ExecutionResult(success=False, output="", error="Code execution timed out")
    except Exception as e:
        return ExecutionResult(success=False, output="", error=str(e))

def execute_javascript_code(code: str, test_inputs: List[str] = None) -> ExecutionResult:
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        result = subprocess.run(
            ['node', temp_file],
            capture_output=True,
            text=True,
            timeout=5,
            input='\n'.join(test_inputs) if test_inputs else None
        )
        
        os.unlink(temp_file)
        
        if result.returncode == 0:
            return ExecutionResult(success=True, output=result.stdout.strip())
        else:
            return ExecutionResult(success=False, output="", error=result.stderr.strip())
            
    except subprocess.TimeoutExpired:
        return ExecutionResult(success=False, output="", error="Code execution timed out")
    except Exception as e:
        return ExecutionResult(success=False, output="", error=str(e))

# XP and Level calculation
def calculate_level(xp: int) -> int:
    return max(1, int(xp / 100) + 1)

def award_badges(user: User, challenge: Challenge) -> List[str]:
    new_badges = []
    
    # First challenge badge
    if len(user.completed_challenges) == 0:
        new_badges.append("First Steps")
    
    # Challenge count badges
    challenge_count = len(user.completed_challenges) + 1
    if challenge_count == 5:
        new_badges.append("Getting Started")
    elif challenge_count == 10:
        new_badges.append("Code Warrior")
    elif challenge_count == 25:
        new_badges.append("Challenge Master")
    
    # Difficulty badges
    if challenge.difficulty == "hard" and "Hard Mode" not in user.badges:
        new_badges.append("Hard Mode")
    
    return new_badges

# Routes
@api_router.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
    )
    
    await db.users.insert_one(user.dict())
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user.dict())
    }

@api_router.post("/auth/login", response_model=dict)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user)
    }

@api_router.get("/user/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserResponse(**current_user.dict())

@api_router.get("/challenges", response_model=List[Challenge])
async def get_challenges():
    challenges = await db.challenges.find().to_list(1000)
    return [Challenge(**challenge) for challenge in challenges]

@api_router.get("/challenges/{challenge_id}", response_model=Challenge)
async def get_challenge(challenge_id: str):
    challenge = await db.challenges.find_one({"id": challenge_id})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return Challenge(**challenge)

@api_router.post("/challenges", response_model=Challenge)
async def create_challenge(challenge_data: ChallengeCreate):
    challenge = Challenge(**challenge_data.dict())
    await db.challenges.insert_one(challenge.dict())
    return challenge

@api_router.post("/submit/code", response_model=dict)
async def submit_code(submission: CodeSubmission, current_user: User = Depends(get_current_user)):
    # Get challenge
    challenge = await db.challenges.find_one({"id": submission.challenge_id})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    challenge_obj = Challenge(**challenge)
    
    # Execute code
    if submission.language == "python":
        result = execute_python_code(submission.code)
    elif submission.language == "javascript":
        result = execute_javascript_code(submission.code)
    else:
        raise HTTPException(status_code=400, detail="Unsupported language")
    
    # Check if challenge already completed
    already_completed = submission.challenge_id in current_user.completed_challenges
    
    success = result.success
    
    # Update user progress if successful and not already completed
    if success and not already_completed:
        new_xp = current_user.xp + challenge_obj.xp_reward
        new_level = calculate_level(new_xp)
        new_badges = award_badges(current_user, challenge_obj)
        
        await db.users.update_one(
            {"id": current_user.id},
            {
                "$set": {
                    "xp": new_xp,
                    "level": new_level,
                    "badges": current_user.badges + new_badges
                },
                "$addToSet": {"completed_challenges": submission.challenge_id}
            }
        )
        
        return {
            "success": success,
            "result": result,
            "xp_earned": challenge_obj.xp_reward,
            "new_xp": new_xp,
            "new_level": new_level,
            "new_badges": new_badges
        }
    
    return {
        "success": success,
        "result": result,
        "xp_earned": 0 if already_completed else 0,
        "message": "Challenge already completed" if already_completed else None
    }

@api_router.post("/submit/multiple-choice", response_model=dict)
async def submit_multiple_choice(submission: MultipleChoiceSubmission, current_user: User = Depends(get_current_user)):
    # Get challenge
    challenge = await db.challenges.find_one({"id": submission.challenge_id})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    challenge_obj = Challenge(**challenge)
    
    # Check if challenge already completed
    already_completed = submission.challenge_id in current_user.completed_challenges
    
    success = submission.answer == challenge_obj.correct_answer
    
    # Update user progress if successful and not already completed
    if success and not already_completed:
        new_xp = current_user.xp + challenge_obj.xp_reward
        new_level = calculate_level(new_xp)
        new_badges = award_badges(current_user, challenge_obj)
        
        await db.users.update_one(
            {"id": current_user.id},
            {
                "$set": {
                    "xp": new_xp,
                    "level": new_level,
                    "badges": current_user.badges + new_badges
                },
                "$addToSet": {"completed_challenges": submission.challenge_id}
            }
        )
        
        return {
            "success": success,
            "correct_answer": challenge_obj.correct_answer,
            "xp_earned": challenge_obj.xp_reward,
            "new_xp": new_xp,
            "new_level": new_level,
            "new_badges": new_badges
        }
    
    return {
        "success": success,
        "correct_answer": challenge_obj.correct_answer if not success else None,
        "xp_earned": 0,
        "message": "Challenge already completed" if already_completed else None
    }

@api_router.get("/leaderboard", response_model=List[dict])
async def get_leaderboard():
    users = await db.users.find({}, {"username": 1, "xp": 1, "level": 1}).sort("xp", -1).limit(10).to_list(10)
    return [{"username": user["username"], "xp": user["xp"], "level": user["level"]} for user in users]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Initialize sample challenges on startup
@app.on_event("startup")
async def create_sample_challenges():
    existing_challenges = await db.challenges.count_documents({})
    if existing_challenges == 0:
        sample_challenges = [
            {
                "title": "Hello World",
                "description": "Write a program that prints 'Hello, World!' to the console.",
                "type": "coding",
                "difficulty": "easy",
                "xp_reward": 10,
                "language": "python",
                "starter_code": "# Write your code here\n",
                "solution": "print('Hello, World!')"
            },
            {
                "title": "Variables in Python",
                "description": "Which of the following is the correct way to create a variable in Python?",
                "type": "multiple_choice",
                "difficulty": "easy",
                "xp_reward": 5,
                "options": ["var x = 5", "x = 5", "int x = 5", "variable x = 5"],
                "correct_answer": "x = 5"
            },
            {
                "title": "Add Two Numbers",
                "description": "Write a function that takes two numbers and returns their sum.",
                "type": "coding",
                "difficulty": "easy",
                "xp_reward": 15,
                "language": "python",
                "starter_code": "def add_numbers(a, b):\n    # Write your code here\n    pass\n\n# Test your function\nprint(add_numbers(2, 3))",
                "solution": "def add_numbers(a, b):\n    return a + b\n\nprint(add_numbers(2, 3))"
            },
            {
                "title": "JavaScript Basics",
                "description": "What does 'console.log()' do in JavaScript?",
                "type": "multiple_choice",
                "difficulty": "easy",
                "xp_reward": 5,
                "options": ["Creates a new console", "Prints output to the console", "Logs into the system", "Creates a log file"],
                "correct_answer": "Prints output to the console"
            },
            {
                "title": "FizzBuzz",
                "description": "Write a program that prints numbers 1 to 15. For multiples of 3, print 'Fizz' instead. For multiples of 5, print 'Buzz'. For multiples of both 3 and 5, print 'FizzBuzz'.",
                "type": "coding",
                "difficulty": "medium",
                "xp_reward": 25,
                "language": "python",
                "starter_code": "# Write your FizzBuzz solution here\n",
                "solution": "for i in range(1, 16):\n    if i % 15 == 0:\n        print('FizzBuzz')\n    elif i % 3 == 0:\n        print('Fizz')\n    elif i % 5 == 0:\n        print('Buzz')\n    else:\n        print(i)"
            }
        ]
        
        for challenge_data in sample_challenges:
            challenge = Challenge(**challenge_data)
            await db.challenges.insert_one(challenge.dict())
        
        logger.info("Sample challenges created")