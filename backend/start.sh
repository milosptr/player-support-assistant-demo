#!/bin/sh
set -e
python manage.py migrate
python manage.py seed_tickets
gunicorn psa.wsgi:application --bind 0.0.0.0:8000 --workers 3
