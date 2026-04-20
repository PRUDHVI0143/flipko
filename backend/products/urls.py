from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('product/<int:product_id>/', views.product_detail_view, name='product_detail'),
    path('product/add/', views.add_product_view, name='add_product'),
    path('product/<int:product_id>/update/', views.update_product_view, name='update_product'),
    path('product/<int:product_id>/delete/', views.delete_product_view, name='delete_product'),
    path('wishlist/', views.wishlist_view, name='wishlist'),
    path('wishlist/toggle/<int:product_id>/', views.toggle_wishlist, name='toggle_wishlist'),
]
