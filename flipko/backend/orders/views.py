from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth.models import User
from products.models import Product
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

    @action(detail=True, methods=['post'])
    def razorpay_create(self, request, pk=None):
        import razorpay
        from django.conf import settings
        
        order = self.get_object()
        amount_in_paise = int(order.total_amount * 100)
        key_id = getattr(settings, 'RAZORPAY_KEY_ID', 'rzp_test_fake_key_for_dev')
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', 'fake_secret')
        
        try:
            client = razorpay.Client(auth=(key_id, key_secret))
            razorpay_order = client.order.create({
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": f"order_rcptid_{order.id}",
                "payment_capture": "1"
            })
            order.razorpay_order_id = razorpay_order['id']
        except Exception as e:
            # Fallback for local testing without real keys
            order.razorpay_order_id = f"order_mock_rzp_{order.id}"
            
        order.payment_method = 'Razorpay'
        order.save()
        
        return Response({
            'razorpay_order_id': order.razorpay_order_id,
            'amount': amount_in_paise,
            'currency': 'INR',
            'key_id': key_id
        })

    @action(detail=True, methods=['post'])
    def razorpay_verify(self, request, pk=None):
        import razorpay
        from django.conf import settings
        
        order = self.get_object()
        data = request.data
        
        razorpay_payment_id = data.get('razorpay_payment_id', '')
        razorpay_order_id = data.get('razorpay_order_id', '')
        razorpay_signature = data.get('razorpay_signature', '')
        
        # If we used mock keys, accept automatically
        if razorpay_order_id.startswith('order_mock_rzp_'):
            order.payment_status = 'Completed'
            order.razorpay_payment_id = razorpay_payment_id or f"pay_mock_{order.id}"
            order.save()
            return Response({'status': 'Payment verified (Mock mode)'})

        # Real verification
        key_id = getattr(settings, 'RAZORPAY_KEY_ID', '')
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')
        client = razorpay.Client(auth=(key_id, key_secret))
        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
            order.payment_status = 'Completed'
            order.razorpay_payment_id = razorpay_payment_id
            order.razorpay_signature = razorpay_signature
            order.save()
            return Response({'status': 'Payment verified successfully'})
        except Exception as e:
            order.payment_status = 'Failed'
            order.save()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdminDashboardStats(APIView):
    permission_classes = [AllowAny] # In development phase, leave open. Lock down with JWT later.

    def get(self, request):
        total_orders = Order.objects.count()
        
        from django.db.models import Sum
        revenue_dict = Order.objects.aggregate(total_revenue=Sum('total_amount'))
        total_revenue = revenue_dict['total_revenue'] or 0
        
        total_users = User.objects.count()
        low_stock_products = Product.objects.filter(stock__lt=10).count()
        
        recent_orders = Order.objects.all().order_by('-created_at')[:5]
        recent_orders_data = OrderSerializer(recent_orders, many=True).data

        return Response({
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'total_users': total_users,
            'low_stock_products': low_stock_products,
            'recent_orders': recent_orders_data
        })

@login_required
def order_list(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'orders/order_list.html', {'orders': orders})

@login_required
def order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return render(request, 'orders/order_detail.html', {'order': order})
