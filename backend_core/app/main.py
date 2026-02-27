from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from passlib.context import CryptContext 
import models
import database
import sys
import os
import joblib

models.Base.metadata.create_all(bind=database.engine)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

# Load C++ Engine
try:
    import survival_lib
except ImportError:
    survival_lib = None 

# Load AI Engine
ai_model_path = os.path.join(BASE_DIR, "kategori_model.pkl")
try:
    kategori_ai = joblib.load(ai_model_path)
    print("✅ Otak AI Berhasil Dimuat!")
except Exception as e:
    kategori_ai = None
    print(f"⚠️ Otak AI Gagal Dimuat: {e}")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI(title="College Budgeting API V4 - Auth Edition")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://college-budgeting-system.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# [+] SETUP KEAMANAN (PASSWORD HASHING)
# ==========================================
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
    bcrypt__truncate_error=True 
)

class UserRegister(BaseModel):
    nama: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# 1. Endpoint Daftar Akun (Register)
@app.post("/register")
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    # Cek apakah email sudah dipakai
    cek_user = db.query(models.User).filter(models.User.email == user.email).first()
    if cek_user:
        return {"error": "Email sudah terdaftar!"}
    
    # Acak Password (Hash)
    hashed_password = pwd_context.hash(user.password)
    
    # Simpan ke Database
    new_user = models.User(nama=user.nama, email=user.email, password_hash=hashed_password, provider="local")
    db.add(new_user)
    db.commit()
    return {"status": "success", "message": "Akun berhasil dibuat!"}

# 2. Endpoint Masuk (Login)
@app.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user or not pwd_context.verify(user.password, db_user.password_hash):
        return {"error": "Email atau Password salah!"}
        
    return {
        "status": "success", 
        "message": f"Welcome back, {db_user.nama}!",
        "user_email": db_user.email,
        "user_nama": db_user.nama
    }

# ==========================================
# ENDPOINT LAMA (SEKARANG TERKUNCI PER USER)
# ==========================================

@app.post("/cek-survival-otomatis")
def cek_survival_otomatis(user_email: str, saldo: float, pengeluaran: float, deskripsi: str, db: Session = Depends(get_db)):
    if not survival_lib:
        return {"error": "Server Error!"}

    kategori_tebakan = "Lainnya"
    if kategori_ai and deskripsi.strip():
        kategori_tebakan = kategori_ai.predict([deskripsi])[0]

    sisa_hari = survival_lib.prediksi_bangkrut(saldo, pengeluaran)
    
    if sisa_hari <= 0:
        status_hari = "Tidak Ada Sisa" 
        pesan = "💀 BLACK ZONE!!! HATI-HATI SEGERA KELUAR DARI ZONA INI!!"
        zona = "black"
    elif sisa_hari < 20:
        status_hari = str(sisa_hari)
        pesan = "⚠️ RED ZONE!! Hemat lagi ya, jangan boros-boros!"
        zona = "red"
    else:
        status_hari = str(sisa_hari) 
        pesan = "✅ Green Zone. Aman."
        zona = "green"

    data_baru = models.SurvivalRecord(
        user_email=user_email,
        saldo=saldo,
        pengeluaran_harian=pengeluaran,
        kategori_ai=kategori_tebakan, 
        sisa_hari=status_hari,
        pesan=pesan,
        zona=zona
    )
    db.add(data_baru)
    db.commit()
    db.refresh(data_baru)

    return {"status": "success", "zona": zona, "sisa_hari": status_hari, "kategori_ai": kategori_tebakan, "pesan": pesan}

@app.get("/statistik")
def ambil_statistik(user_email: str, db: Session = Depends(get_db)):
    stats = db.query(
        models.SurvivalRecord.kategori_ai, 
        func.sum(models.SurvivalRecord.pengeluaran_harian).label("total")
    ).filter(models.SurvivalRecord.user_email == user_email).group_by(models.SurvivalRecord.kategori_ai).all()
    
    return [{"kategori": row.kategori_ai, "total": row.total} for row in stats]

@app.get("/riwayat")
def ambil_riwayat(user_email: str, db: Session = Depends(get_db)):
    records = db.query(models.SurvivalRecord).filter(models.SurvivalRecord.user_email == user_email).order_by(models.SurvivalRecord.id.desc()).all()
    return records

@app.delete("/hapus-riwayat/{id}")
def hapus_riwayat(id: int, user_email: str, db: Session = Depends(get_db)):
    record = db.query(models.SurvivalRecord).filter(models.SurvivalRecord.id == id, models.SurvivalRecord.user_email == user_email).first()
    if not record:
        return {"error": "Data tidak ditemukan atau Anda tidak punya akses!"}
    db.delete(record)
    db.commit()
    return {"status": "success"}