from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'price', 'quantity', 'get_cost']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'first_name', 'last_name', 'email', 'phone',
            'address', 'city', 'state', 'pincode', 'total_amount',
            'status', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['user', 'total_amount', 'status', 'created_at', 'updated_at']

class CreateOrderItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

class CreateOrderSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    address = serializers.CharField(max_length=250)
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=20)
    
    items = CreateOrderItemSerializer(many=True)

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Calculate total
        total_amount = 0
        order_items_to_create = []
        
        for item_data in items_data:
            product = Product.objects.get(id=item_data['product_id'])
            price = product.price
            quantity = item_data['quantity']
            total_amount += (price * quantity)
            
            order_items_to_create.append({
                'product': product,
                'price': price,
                'quantity': quantity
            })
            
        # Create order
        order = Order.objects.create(total_amount=total_amount, **validated_data)
        
        # Create order items
        for item in order_items_to_create:
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                price=item['price'],
                quantity=item['quantity']
            )
            
        return order
