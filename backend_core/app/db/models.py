from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    nama = Column(String)
    password_hash = Column(String, nullable=True) 
    provider = Column(String, default="local")    

class SurvivalRecord(Base):
    __tablename__ = "riwayat_survival"

    id = Column(Integer, primary_key=True, index=True)

    user_email = Column(String, index=True) 
    
    saldo = Column(Float)
    pengeluaran_harian = Column(Float)
    kategori_ai = Column(String, default="Lainnya") 
    sisa_hari = Column(String)
    zona = Column(String)
    pesan = Column(String)
    waktu_input = Column(DateTime, default=datetime.now)