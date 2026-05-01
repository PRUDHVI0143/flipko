from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, update_session_auth_hash
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordChangeForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import UserUpdateForm

def register_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            messages.success(request, 'Registration successful. Welcome to Flipko!')
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'accounts/register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f'Logged in as {user.username}')
            return redirect('home')
    else:
        form = AuthenticationForm()
    return render(request, 'accounts/login.html', {'form': form})

def logout_view(request):
    if request.method == 'POST':
        logout(request)
        messages.success(request, 'You have been logged out.')
        return redirect('login')
    # If GET, you can render a confirmation page or just redirect
    logout(request)
    return redirect('login')

@login_required
def profile_view(request):
    return render(request, 'accounts/profile.html')

@login_required
def settings_view(request):
    if request.method == 'POST':
        u_form = UserUpdateForm(request.POST, instance=request.user)
        p_form = PasswordChangeForm(user=request.user, data=request.POST)
        
        if 'update_profile' in request.POST:
            if u_form.is_valid():
                u_form.save()
                messages.success(request, 'Your profile has been updated!')
                return redirect('settings')
        elif 'change_password' in request.POST:
            if p_form.is_valid():
                user = p_form.save()
                update_session_auth_hash(request, user)  # Keeps user logged in
                messages.success(request, 'Your password was successfully updated!')
                return redirect('settings')
            else:
                messages.error(request, 'Please correct the error below.')
    else:
        u_form = UserUpdateForm(instance=request.user)
        p_form = PasswordChangeForm(user=request.user)

    context = {
        'u_form': u_form,
        'p_form': p_form
    }
    return render(request, 'accounts/settings.html', context)

# ----- Dropdown Page Stubs -----

@login_required
def plus_zone_view(request):
    return render(request, 'accounts/plus_zone.html', {'title': 'Flipkart Plus Zone'})

@login_required
def orders_view(request):
    return render(request, 'accounts/orders.html', {'title': 'My Orders'})

def become_seller_view(request):
    return render(request, 'accounts/become_seller.html', {'title': 'Become a Seller'})

@login_required
def rewards_view(request):
    return render(request, 'accounts/rewards.html', {'title': 'My Rewards'})

@login_required
def gift_cards_view(request):
    amounts = [500, 1000, 2000, 5000, 10000]
    return render(request, 'accounts/gift_cards.html', {'title': 'Gift Cards', 'gift_amounts': amounts})

@login_required
def notification_preferences_view(request):
    notification_items = [
        {'label': 'Order Updates', 'default': True},
        {'label': 'Price Drop Alerts', 'default': True},
        {'label': 'New Product Arrivals', 'default': False},
        {'label': 'Flash Sale Alerts', 'default': False},
        {'label': 'Promotional Offers', 'default': False},
        {'label': 'Gift Card Offers', 'default': False},
        {'label': 'Reward Updates', 'default': True},
        {'label': 'Newsletter', 'default': False},
    ]
    return render(request, 'accounts/notifications.html', {'title': 'Notification Preferences', 'notification_items': notification_items})

def customer_care_view(request):
    return render(request, 'accounts/customer_care.html', {'title': '24x7 Customer Care'})

def advertise_view(request):
    return render(request, 'accounts/advertise.html', {'title': 'Advertise on Flipko'})

def download_app_view(request):
    return render(request, 'accounts/download_app.html', {'title': 'Download the Flipko App'})
