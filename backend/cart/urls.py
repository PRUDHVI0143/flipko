from django.urls import path
from . import views

urlpatterns = [
    path('', views.view_cart, name='cart_summary'),
    path('add/<int:product_id>/', views.add_to_cart, name='add_to_cart'),
    path('buy/<int:product_id>/', views.buy_now, name='buy_now'),
    path('remove/<int:item_id>/', views.remove_from_cart, name='remove_from_cart'),
    path('checkout/', views.checkout_view, name='checkout'),
]
