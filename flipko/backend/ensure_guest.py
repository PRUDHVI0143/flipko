import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from django.contrib.auth.models import User
user, created = User.objects.get_or_create(username='guest', defaults={'email': 'guest@example.com'})
if created:
    user.set_unusable_password()
    user.save()
    print("Guest user created.")
else:
    print("Guest user already exists.")
