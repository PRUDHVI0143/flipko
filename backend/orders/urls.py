from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, order_list, order_detail

router = DefaultRouter()
router.register(r'', OrderViewSet, basename='order')

urlpatterns = [
    path('api/', include(router.urls)),
    path('my-orders/', order_list, name='order_list'),
    path('my-orders/<int:order_id>/', order_detail, name='order_detail'),
]
