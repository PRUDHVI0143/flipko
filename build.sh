#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

cd flipko/backend
python manage.py collectstatic --no-input
python manage.py migrate

# Populate database with products and guest user
python scripts/recover_products.py
python scripts/create_guest.py
