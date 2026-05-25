from rest_framework import viewsets, views, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Cart, CartItem
from products.models import Product
from .serializers import CartSerializer, CartItemSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User

class CartViewSet(viewsets.ViewSet):
    """
    API endpoint for viewing and modifying the current user's cart (with guest support).
    """
    permission_classes = [AllowAny]

    def get_user(self, request):
        if request.user.is_authenticated:
            return request.user
        user, created = User.objects.get_or_create(username='guest', defaults={'email': 'guest@example.com'})
        return user

    def list(self, request):
        user = self.get_user(request)
        cart, created = Cart.objects.get_or_create(user=user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class CartItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint for adding/removing cart items (with guest support).
    """
    permission_classes = [AllowAny]
    serializer_class = CartItemSerializer

    def get_user(self, request):
        if request.user.is_authenticated:
            return request.user
        user, created = User.objects.get_or_create(username='guest', defaults={'email': 'guest@example.com'})
        return user

    def get_queryset(self):
        user = self.get_user(self.request)
        cart, created = Cart.objects.get_or_create(user=user)
        return CartItem.objects.filter(cart=cart)

    def create(self, request, *args, **kwargs):
        user = self.get_user(request)
        cart, created = Cart.objects.get_or_create(user=user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)
        
        # Check if item exists in cart
        cart_item, item_created = CartItem.objects.get_or_create(
            cart=cart, 
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not item_created:
            # If exists, update quantity
            cart_item.quantity += quantity
            cart_item.save()

        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
