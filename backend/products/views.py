from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import user_passes_test, login_required
from django.http import JsonResponse
from django.contrib import messages
from .models import Product, Category, Wishlist, WishlistItem
from .forms import ProductForm

def is_staff(user):
    return user.is_staff

def home_view(request):
    products = Product.objects.all()
    categories = Category.objects.all()
    
    category_slug = request.GET.get('category')
    if category_slug:
        products = products.filter(category__slug=category_slug)
        
    query = request.GET.get('q')
    if query:
        products = products.filter(name__icontains=query)

    wishlist_product_ids = []
    if request.user.is_authenticated:
        try:
            wishlist = Wishlist.objects.get(user=request.user)
            wishlist_product_ids = wishlist.items.values_list('product_id', flat=True)
        except Wishlist.DoesNotExist:
            pass

    context = {
        'products': products,
        'categories': categories,
        'wishlist_product_ids': wishlist_product_ids,
    }
    return render(request, 'products/home.html', context)

def product_detail_view(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    
    in_wishlist = False
    if request.user.is_authenticated:
        try:
            wishlist = Wishlist.objects.get(user=request.user)
            in_wishlist = wishlist.items.filter(product=product).exists()
        except Wishlist.DoesNotExist:
            pass
            
    return render(request, 'products/detail.html', {'product': product, 'in_wishlist': in_wishlist})

@user_passes_test(is_staff)
def add_product_view(request):
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, 'Product added successfully.')
            return redirect('home')
    else:
        form = ProductForm()
    return render(request, 'products/product_form.html', {'form': form, 'title': 'Add Product'})

@user_passes_test(is_staff)
def update_product_view(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            form.save()
            messages.success(request, 'Product updated successfully.')
            return redirect('product_detail', product_id=product.id)
    else:
        form = ProductForm(instance=product)
    return render(request, 'products/product_form.html', {'form': form, 'title': 'Update Product'})

@user_passes_test(is_staff)
def delete_product_view(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    if request.method == 'POST':
        product.delete()
        messages.success(request, 'Product deleted successfully.')
        return redirect('home')
    return render(request, 'products/product_confirm_delete.html', {'product': product})

@login_required
def toggle_wishlist(request, product_id):
    if request.method == 'POST':
        product = get_object_or_404(Product, id=product_id)
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        
        # Check if item exists in wishlist
        item = WishlistItem.objects.filter(wishlist=wishlist, product=product).first()
        
        if item:
            item.delete()
            return JsonResponse({'status': 'removed', 'message': f'{product.name} removed from wishlist.'})
        else:
            WishlistItem.objects.create(wishlist=wishlist, product=product)
            return JsonResponse({'status': 'added', 'message': f'{product.name} added to wishlist.'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=400)

@login_required
def wishlist_view(request):
    try:
        wishlist = Wishlist.objects.get(user=request.user)
        items = wishlist.items.all()
    except Wishlist.DoesNotExist:
        items = []
        
    return render(request, 'products/wishlist.html', {'items': items, 'title': 'My Wishlist'})
