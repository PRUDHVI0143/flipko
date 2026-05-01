from django.urls import path, include
from rest_framework.routers import DefaultRouter
from products.api_views import ProductViewSet, CategoryViewSet
from cart.api_views import CartViewSet, CartItemViewSet
from orders.views import OrderViewSet, AdminDashboardStats
from chatbot.views import ChatbotView
from django.contrib.auth.models import User
from rest_framework import viewsets, serializers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from accounts.api_views import RegisterAPIView
from products.api_views import WishlistView, WishlistItemDetailView

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined', 'is_staff']

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'cart-items', CartItemViewSet, basename='cart-item')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Auth endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterAPIView.as_view(), name='register_api'),
    
    # Wishlist endpoints
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('wishlist/<int:product_id>/', WishlistItemDetailView.as_view(), name='wishlist_item'),
    
    path('', include(router.urls)),
    path('cart/', CartViewSet.as_view({'get': 'list'}), name='api-cart'),
    path('chatbot/chat/', ChatbotView.as_view(), name='chatbot-chat'),
    path('admin/stats/', AdminDashboardStats.as_view(), name='admin-stats'),
]
