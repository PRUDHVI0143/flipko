from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Order
from .serializers import OrderSerializer, CreateOrderSerializer
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer
        
    def get_permissions(self):
        # Allow anyone to create an order, but only authenticated to view list (if desired)
        # For now, allowing any based on user requirements for API
        return [AllowAny()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # If user is authenticated, we can attach the user to order here in future PR!
            order = serializer.save()
            
            # Re-serialize the created order with the main OrderSerializer to include nested items
            response_serializer = OrderSerializer(order)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get_queryset(self):
        # In this clone dev phase, we allow viewing all orders to facilitate guest tracking.
        # In a real app, this would be filtered by user or secure session.
        return Order.objects.all().order_by('-created_at')

@login_required
def order_list(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'orders/order_list.html', {'orders': orders})

@login_required
def order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return render(request, 'orders/order_detail.html', {'order': order})
