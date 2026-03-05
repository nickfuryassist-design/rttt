FROM python:3.12-alpine

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt 

COPY . .

EXPOSE 8000
CMD python manage.py migrate && \
    python -c "from django.contrib.auth import get_user_model; User = get_user_model(); \
    User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists() or \
    User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD')" && \
    daphne -b 0.0.0.0 -p 8000 rttt.asgi:application

