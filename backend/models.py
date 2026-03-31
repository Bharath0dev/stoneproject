from uuid import uuid4
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Numeric, Date, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
# from database import Base
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)

    expenses = relationship("Expense", backref="user", cascade="all, delete")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=True)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class Income(Base):
    __tablename__ = "income"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    month = Column(String, nullable=False)  # "2026-03"
    amount = Column(Numeric(10, 2), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "month", name="unique_user_income_month"),
    )

class MonthlyBudget(Base):
    __tablename__ = "monthly_budgets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    month = Column(String, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "month", name="unique_user_budget_month"),
    )


class CategoryBudget(Base):
    __tablename__ = "category_budgets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "category", name="unique_user_category_budget"),
    )