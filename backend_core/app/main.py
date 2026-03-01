from fastapi import BackgroundTasks 
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from passlib.context import CryptContext 
from sqlalchemy import extract 
from datetime import datetime, timedelta 
from pydantic import BaseModel
from typing import Optional
import models
import database
import sys
import os
import joblib

class ProfileUpdate(BaseModel):
    user_email: str
    nama: Optional[str] = None
    foto_profil: Optional[str] = None
    pekerjaan: Optional[str] = None
    umur: Optional[int] = None
    tanggal_lahir: Optional[str] = None

class TargetTabunganCreate(BaseModel):
    user_email: str
    tujuan: str
    nominal_target: float

class UpdateTabungan(BaseModel):
    nominal_tambah: float

models.Base.metadata.create_all(bind=database.engine)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
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

# ==========================================
# [+] MESIN AI CONTINUOUS LEARNING
# ==========================================
def latih_ulang_ai(db: Session):
    global kategori_ai
    try:
        records = db.query(models.SurvivalRecord).filter(models.SurvivalRecord.deskripsi != None).all()

        if len(records) < 5:
            print("⏳ Data masih sedikit, nunggu user nginput lagi...")
            return

        X = [r.deskripsi for r in records]
        y = [r.kategori_ai for r in records]

        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2), lowercase=True)),
            ('clf', LinearSVC(C=1.0, random_state=42))
        ])

        pipeline.fit(X, y)

        joblib.dump(pipeline, ai_model_path)
        kategori_ai = pipeline
        print(f"🚀 AI Selesai Di-upgrade! Total Belajar dari {len(records)} Dataset.")
    except Exception as e:
        print(f"⚠️ Gagal melatih AI: {e}")

app = FastAPI(title="College Budgeting API V4 - Auth Edition")

@app.get("/")
def read_root():
    return {"status": "🔥 AI CBS Berjalan!"}

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

    hashed_password = pwd_context.hash(user.password)

    new_user = models.User(nama=user.nama, email=user.email, password_hash=hashed_password, provider="local")
    db.add(new_user)
    db.commit()
    return {"status": "success", "message": "Akun berhasil dibuat!"}

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
# 1. API UPDATE PROFILE & COOLDOWN GANTI NAMA
# ==========================================
@app.put("/update-profile")
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.user_email).first()
    if not user:
        return {"error": "User tidak ditemukan"}

    if data.nama and data.nama != user.nama:
        if user.terakhir_ganti_nama:
            selisih_hari = (datetime.now() - user.terakhir_ganti_nama).days
            if selisih_hari < 30:
                sisa = 30 - selisih_hari
                return {"error": f"Gagal! Nama hanya bisa diganti 1 bulan sekali. Tunggu {sisa} hari lagi."}
        user.nama = data.nama
        user.terakhir_ganti_nama = datetime.now()

    if data.foto_profil is not None: user.foto_profil = data.foto_profil
    if data.pekerjaan is not None: user.pekerjaan = data.pekerjaan
    if data.umur is not None: user.umur = data.umur
    if data.tanggal_lahir is not None: user.tanggal_lahir = data.tanggal_lahir

    db.commit()
    return {"status": "success", "message": "Profil berhasil diperbarui!"}

# ==========================================
# 2. API AMBIL PROFILE USER
# ==========================================
@app.get("/profile")
def get_profile(user_email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_email).first()
    if not user:
        return {"error": "User tidak ditemukan"}
    return {
        "nama": user.nama,
        "email": user.email,
        "foto_profil": user.foto_profil,
        "pekerjaan": user.pekerjaan,
        "umur": user.umur,
        "tanggal_lahir": user.tanggal_lahir,
        "terakhir_ganti_nama": user.terakhir_ganti_nama
    }

# ==========================================
# 3. API TARGET TABUNGAN
# ==========================================
@app.post("/target-tabungan")
def buat_target(data: TargetTabunganCreate, db: Session = Depends(get_db)):
    target_baru = models.TargetTabungan(
        user_email=data.user_email,
        tujuan=data.tujuan,
        nominal_target=data.nominal_target
    )
    db.add(target_baru)
    db.commit()
    return {"status": "success", "message": f"Target '{data.tujuan}' berhasil dibuat!"}

@app.get("/target-tabungan")
def get_target(user_email: str, db: Session = Depends(get_db)):
    targets = db.query(models.TargetTabungan).filter(models.TargetTabungan.user_email == user_email).all()
    return targets

# ==========================================
# 4. API ARSIP BULANAN & TOTAL PENGELUARAN
# ==========================================
@app.get("/riwayat-bulanan")
def riwayat_bulanan(user_email: str, bulan: int = None, tahun: int = None, db: Session = Depends(get_db)):
    sekarang = datetime.now()
    b = bulan if bulan else sekarang.month
    t = tahun if tahun else sekarang.year

    records = db.query(models.SurvivalRecord).filter(
        models.SurvivalRecord.user_email == user_email,
        extract('month', models.SurvivalRecord.waktu_input) == b,
        extract('year', models.SurvivalRecord.waktu_input) == t
    ).order_by(models.SurvivalRecord.id.desc()).all()

    total_pengeluaran = sum(r.pengeluaran_harian for r in records)

    return {
        "status": "success",
        "bulan": b,
        "tahun": t,
        "total_pengeluaran_bulan_ini": total_pengeluaran,
        "data_riwayat": records
    }
    
@app.put("/target-tabungan/{target_id}")
def isi_tabungan(target_id: int, data: UpdateTabungan, db: Session = Depends(get_db)):
    target = db.query(models.TargetTabungan).filter(models.TargetTabungan.id == target_id).first()
    if not target:
        return {"error": "Target tidak ditemukan"}
    
    # Tambahin uangnya!
    target.nominal_terkumpul += data.nominal_tambah
    
    # Cek apakah uangnya udah cukup buat penuhin target
    if target.nominal_terkumpul >= target.nominal_target:
        target.status = "tercapai"
        
    db.commit()
    return {"status": "success", "message": f"Berhasil menabung Rp {data.nominal_tambah:,.0f}!"}

# ==========================================
# ENDPOINT LAMA (SEKARANG TERKUNCI PER USER)
# ==========================================
@app.post("/cek-survival-otomatis")
def cek_survival_otomatis(
    user_email: str, 
    saldo: float, 
    pengeluaran: float, 
    deskripsi: str, 
    kategori_asli: str, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    if not survival_lib:
        return {"error": "Server C++ Error!"}

    kategori_tebakan = "Lainnya"
    if kategori_ai and deskripsi.strip():
        try:
            kategori_tebakan = kategori_ai.predict([deskripsi])[0]
        except:
            pass

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
        deskripsi=deskripsi, 
        kategori_ai=kategori_asli, 
        sisa_hari=status_hari,
        pesan=pesan,
        zona=zona
    )
    db.add(data_baru)
    db.commit()
    db.refresh(data_baru)

    background_tasks.add_task(latih_ulang_ai, db)

    return {
        "status": "success", 
        "zona": zona, 
        "sisa_hari": status_hari, 
        "kategori_tebakan_ai": kategori_tebakan, 
        "pesan": pesan
    }
    
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