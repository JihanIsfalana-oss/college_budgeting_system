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
    
    foto_profil = Column(String, nullable=True)
    pekerjaan = Column(String, nullable=True, default="Mahasiswa")
    umur = Column(Integer, nullable=True)
    tanggal_lahir = Column(String, nullable=True) 
    terakhir_ganti_nama = Column(DateTime, nullable=True)

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
    
class TargetTabungan(Base):
    __tablename__ = "target_tabungan"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    tujuan = Column(String) # Cth: "Beli Senar Gitar"
    nominal_target = Column(Float)
    nominal_terkumpul = Column(Float, default=0.0)
    tanggal_dibuat = Column(DateTime, default=datetime.now)
    status = Column(String, default="berjalan")