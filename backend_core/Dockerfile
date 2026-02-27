FROM python:3.11-slim


RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY . /code

RUN g++ -O3 -Wall -shared -std=c++11 -fPIC $(python3 -m pybind11 --includes) \
    survival_core.cpp -o survival_lib$(python3-config --extension-suffix)

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]