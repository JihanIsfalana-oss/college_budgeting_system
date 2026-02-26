from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from .database import Base

class SurvivalRecord(Base):
    __tablename__ = "riwayat_survival"

    id = Column(Integer, primary_key=True, index=True)
    saldo = Column(Float)
    pengeluaran_harian = Column(Float)
    sisa_hari = Column(String)
    zona = Column(String)  # 'green', 'red', atau 'black'
    pesan = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)