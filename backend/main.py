from fastapi import FastAPI, status, Depends, HTTPException
from database import engine, Base, SessionLocal
import models
import schemas
import bcrypt
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta, date
import jwt
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

Base.metadata.create_all(bind=engine)

# JWT Configuration
SECRET_KEY = "change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API Running"}

# Password hashing
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

# JWT token
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Auth dependency
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

# Register
@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # hash password
    hashed_password = hash_password(user.password)

    new_user = models.User(
        email=user.email,
        password_hash= hashed_password,
        full_name=user.full_name
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created"}

# Login
@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user or not bcrypt.checkpw(user.password.encode(), db_user.password_hash.encode()):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"sub": str(db_user.id)})

    return {
        "access_token": token,
        "user": {
            "full_name": db_user.full_name,
            "email": db_user.email
        }
    }

# Create Expense
@app.post("/expenses")
def create_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    new_expense = models.Expense(
        user_id=user.id,
        amount=expense.amount,
        category= expense.category,
        description=expense.description,
        date=expense.date
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense

# Get Expenses
@app.get("/expenses", response_model=List[schemas.ExpenseRead])
def get_expenses(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(models.Expense).filter(models.Expense.user_id == user.id).all()

# Update Expense 
@app.put("/expenses/{id}")
def update_expense(id: int, expense: schemas.ExpenseCreate, db=Depends(get_db), user=Depends(get_current_user)):
    exp = db.query(models.Expense).filter(
        models.Expense.id == id, models.Expense.user_id == user.id
    ).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Not found")
    exp.amount = expense.amount
    exp.description = expense.description
    exp.category = expense.category
    exp.date = expense.date
    db.commit()
    db.refresh(exp)
    return exp

# Delete Expense
@app.delete("/expenses/{id}")
def delete_expense(id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    exp = db.query(models.Expense).filter(
        models.Expense.id == id,
        models.Expense.user_id == user.id
    ).first()

    if not exp:
        raise HTTPException(status_code=404, detail="Not found")

    db.delete(exp)
    db.commit()

    return {"message": "Deleted"}


@app.post("/income")
def add_income(
    data: schemas.IncomeCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    existing = db.query(models.Income).filter(
        models.Income.user_id == user.id,
        models.Income.month == data.month
    ).first()

    if existing:
        existing.amount = data.amount
    else:
        new_income = models.Income(
            user_id=user.id,
            month=data.month,
            amount=data.amount
        )
        db.add(new_income)

    db.commit()
    return {"message": "Income saved"}


@app.get("/income", response_model=List[schemas.IncomeRead])
def get_income(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(models.Income).filter(
        models.Income.user_id == user.id
    ).all()


@app.post("/monthly-budget")
def set_monthly_budget(
    data: schemas.MonthlyBudgetCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    existing = db.query(models.MonthlyBudget).filter(
        models.MonthlyBudget.user_id == user.id,
        models.MonthlyBudget.month == data.month
    ).first()

    if existing:
        existing.amount = data.amount
    else:
        new_budget = models.MonthlyBudget(
            user_id=user.id,
            month=data.month,
            amount=data.amount
        )
        db.add(new_budget)

    db.commit()
    return {"message": "Monthly budget saved"}


@app.get("/monthly-budget", response_model=List[schemas.MonthlyBudgetRead])
def get_monthly_budget(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(models.MonthlyBudget).filter(
        models.MonthlyBudget.user_id == user.id
    ).all()


@app.post("/category-budget")
def set_category_budget(
    data: schemas.CategoryBudgetCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    existing = db.query(models.CategoryBudget).filter(
        models.CategoryBudget.user_id == user.id,
        models.CategoryBudget.category == data.category
    ).first()

    if existing:
        existing.amount = data.amount
    else:
        new_budget = models.CategoryBudget(
            user_id=user.id,
            category=data.category,
            amount=data.amount
        )
        db.add(new_budget)

    db.commit()
    return {"message": "Category budget saved"}



@app.get("/category-budget", response_model=List[schemas.CategoryBudgetRead])
def get_category_budget(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(models.CategoryBudget).filter(
        models.CategoryBudget.user_id == user.id
    ).all()