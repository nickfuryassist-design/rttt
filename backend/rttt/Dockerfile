FROM python:3.12-alpine

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt 

COPY . .

EXPOSE 8000
CMD python manage.py migrate && \
    python create_superuser.py && \
    daphne -b 0.0.0.0 -p 8000 rttt.asgi:application

