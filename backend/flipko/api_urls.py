from django.urls import path, include
from rest_framework.routers import DefaultRouter
from products.api_views import ProductViewSet, CategoryViewSet
from cart.api_views import CartViewSet, CartItemViewSet
from orders.views import OrderViewSet
from chatbot.views import ChatbotView

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'cart-items', CartItemViewSet, basename='cart-item')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
    path('cart/', CartViewSet.as_view({'get': 'list'}), name='api-cart'),
    path('chatbot/chat/', ChatbotView.as_view(), name='chatbot-chat'),
]
