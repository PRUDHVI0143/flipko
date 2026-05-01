from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Cart, CartItem
from products.models import Product

@login_required
def view_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    items = cart.items.all()
    total_price = sum(item.get_total_price() for item in items)
    
    context = {
        'items': items,
        'total_price': total_price,
        'is_empty': len(items) == 0
    }
    return render(request, 'cart/cart_summary.html', context)

@login_required
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    cart, created = Cart.objects.get_or_create(user=request.user)
    
    cart_item, item_created = CartItem.objects.get_or_create(cart=cart, product=product)
    
    if not item_created:
        cart_item.quantity += 1
        cart_item.save()
        messages.success(request, f'Increased {product.name} quantity in your cart.')
    else:
        messages.success(request, f'Added {product.name} to your cart.')
        
    return redirect('cart_summary')

@login_required
def buy_now(request, product_id):
    """Add product to cart (qty 1) then immediately redirect to checkout."""
    product = get_object_or_404(Product, id=product_id)
    
    if product.stock <= 0:
        messages.error(request, f'{product.name} is currently out of stock.')
        return redirect('product_detail', product_id=product_id)
    
    cart, _ = Cart.objects.get_or_create(user=request.user)
    cart_item, item_created = CartItem.objects.get_or_create(cart=cart, product=product)
    if not item_created:
        cart_item.quantity += 1
        cart_item.save()
    
    # Skip the cart and go straight to checkout
    return redirect('checkout')

@login_required
def remove_from_cart(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    product_name = cart_item.product.name
    cart_item.delete()
    messages.success(request, f'Removed {product_name} from your cart.')
    return redirect('cart_summary')

from django.db import transaction
from orders.models import Order, OrderItem

@login_required
def checkout_view(request):
    cart = get_object_or_404(Cart, user=request.user)
    items = cart.items.all()
    
    if not items:
        messages.error(request, 'Your cart is empty.')
        return redirect('home')
        
    if request.method == 'POST':
        full_name = request.POST.get('full_name')
        phone = request.POST.get('phone')
        address = request.POST.get('address')
        pincode = request.POST.get('pincode')
        city = request.POST.get('city')
        state = request.POST.get('state')
        
        # Basic validation
        if not all([full_name, phone, address, pincode, city, state]):
            messages.error(request, 'Please fill in all address details.')
            return redirect('checkout')

        try:
            with transaction.atomic():
                total_price = sum(item.get_total_price() for item in items)
                
                # Split full name into first and last
                name_parts = full_name.split(' ', 1)
                first_name = name_parts[0]
                last_name = name_parts[1] if len(name_parts) > 1 else ""

                # Create Order
                order = Order.objects.create(
                    user=request.user,
                    first_name=first_name,
                    last_name=last_name,
                    email=request.user.email,
                    phone=phone,
                    address=address,
                    city=city,
                    state=state,
                    pincode=pincode,
                    total_amount=total_price,
                    status='Pending'
                )
                
                # Create OrderItems and Handle Stock
                for item in items:
                    product = item.product
                    if product.stock < item.quantity:
                        raise Exception(f"Not enough stock for {product.name}. Available: {product.stock}")
                    
                    product.stock -= item.quantity
                    product.save()

                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        price=product.price,
                        quantity=item.quantity
                    )
                    
                # Clear the cart
                cart.items.all().delete()
                
            messages.success(request, f'Order #{order.id} placed successfully!')
            return render(request, 'cart/checkout_success.html', {'order': order})
            
        except Exception as e:
            messages.error(request, f'Error placing order: {str(e)}')
            return redirect('checkout')
        
    total_price = sum(item.get_total_price() for item in items)
    return render(request, 'cart/checkout.html', {'items': items, 'total_price': total_price})
