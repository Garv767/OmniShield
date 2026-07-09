import os
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, create_engine, Session

# Database URL defaults to SQLite local file, but can be overridden by environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fraud_detection.db")

# SQLite needs connect_args={"check_same_thread": False} for multithreading
# PostgreSQL (like Netlify Database / Supabase) does not.
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
else:
    # For Postgres/Netlify DB, ensure it uses psycopg2 or psycopg depending on driver
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)

class UserProfile(SQLModel, table=True):
    account_id: str = Field(primary_key=True, index=True)
    name: str
    email: str
    is_frozen: bool = Field(default=False)
    frozen_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BlocklistEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    value: str = Field(index=True)  # IP address or device fingerprint
    type: str  # "ip" or "fingerprint"
    blocked_at: datetime = Field(default_factory=datetime.utcnow)
    reason: str

class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sender_account: str = Field(index=True)
    receiver_account: str = Field(index=True)
    amount: float
    timestamp: datetime = Field(index=True)
    ip_address: str = Field(index=True)
    device_fingerprint: str = Field(index=True)
    login_time: datetime
    time_to_transfer_seconds: float
    is_device_farm_suspected: bool = Field(default=False)
    device_farm_reason: Optional[str] = Field(default=None)
    mule_probability: Optional[float] = Field(default=None)
    feature_vector_json: Optional[str] = Field(default=None)

class GovernmentTicket(SQLModel, table=True):
    ticket_id: str = Field(primary_key=True, index=True)
    reported_account: str = Field(index=True)
    scam_type: str
    report_date: datetime
    details: str

class CrossChannelAlert(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    account_id: str = Field(index=True)
    alert_type: str
    timestamp: datetime = Field(index=True)
    description: str

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
