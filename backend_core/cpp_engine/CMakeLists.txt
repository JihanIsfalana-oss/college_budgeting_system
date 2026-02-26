cmake_minimum_required(VERSION 3.18)
project(survival_lib)

# 1. Cari Python 3 (Yang Bener Pakai Ini)
find_package(Python3 COMPONENTS Interpreter Development REQUIRED)

# 2. Cari Lokasi Pybind11 (Trik jitu biar nemu path di dalam VENV)
execute_process(
    COMMAND "${Python3_EXECUTABLE}" -c "import pybind11; print(pybind11.get_cmake_dir())"
    OUTPUT_VARIABLE _pybind11_dir
    OUTPUT_STRIP_TRAILING_WHITESPACE
)
list(APPEND CMAKE_PREFIX_PATH "${_pybind11_dir}")

# 3. Load Pybind11
find_package(pybind11 CONFIG REQUIRED)

# 4. Bikin Module C++ jadi Library Python
pybind11_add_module(survival_lib src/survival_core.cpp)

# 5. Output file .pyd ditaruh di folder root backend-core
set_target_properties(survival_lib PROPERTIES
    LIBRARY_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/../../"
)