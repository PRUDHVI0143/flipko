from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('settings/', views.settings_view, name='settings'),
    path('plus/', views.plus_zone_view, name='plus_zone'),
    path('orders/', views.orders_view, name='orders'),
    path('become-seller/', views.become_seller_view, name='become_seller'),
    path('rewards/', views.rewards_view, name='rewards'),
    path('gift-cards/', views.gift_cards_view, name='gift_cards'),
    path('notifications/', views.notification_preferences_view, name='notifications'),
    path('customer-care/', views.customer_care_view, name='customer_care'),
    path('advertise/', views.advertise_view, name='advertise'),
    path('download-app/', views.download_app_view, name='download_app'),
]
