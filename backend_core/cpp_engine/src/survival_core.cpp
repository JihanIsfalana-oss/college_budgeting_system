#include <pybind11/pybind11.h>
#include <cmath>

namespace py = pybind11;

/* Fungsi simulasi sederhana
Input: Saldo, Pengeluaran Harian
Output: Prediksi hari bertahan*/
int prediksi_bangkrut(double saldo, double pengeluaran) {
    if (pengeluaran <= 0) return 9999;
    int hari = std::floor(saldo / pengeluaran);
    return hari;
}

// Wrapping biar kebaca Python
PYBIND11_MODULE(survival_lib, m) {
    m.doc() = "Modul C++ untuk College Budgeting System"; 
    m.def("prediksi_bangkrut", &prediksi_bangkrut, "Hitung sisa hari bertahan hidup");
}