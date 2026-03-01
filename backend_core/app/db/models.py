from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=True)
    provider = Column(String, default="local")

class SurvivalRecord(Base):
    __tablename__ = "survival_records"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    saldo = Column(Float)
    pengeluaran_harian = Column(Float)
    deskripsi = Column(String) 
    kategori_ai = Column(String)
    sisa_hari = Column(String)
    pesan = Column(String)
    zona = Column(String)
    waktu_input = Column(DateTime, default=datetime.now)