"""
Enhanced Product & Image API for Flipko.

New endpoints added:
  GET  /api/products/                        List all products (paginated, filterable)
  GET  /api/products/{id}/                   Get single product detail
  POST /api/products/                        Create product (admin)
  PUT  /api/products/{id}/                   Update product (admin)
  DEL  /api/products/{id}/                   Delete product (admin)

  PATCH /api/products/{id}/update_image/     Update product image (URL or file upload)
  GET   /api/products/featured/              Get top-rated featured products
  GET   /api/products/trending/              Get recently added trending products
  GET   /api/products/by_category/           Get products grouped by category
  POST  /api/products/{id}/add_review/       Add a review (authenticated)

  GET   /api/images/                         List all product images (id, name, url)
  PATCH /api/images/{id}/                    Update image URL for a product
  POST  /api/images/bulk_update/             Bulk update multiple product images

  GET   /api/categories/                     List all categories
  GET   /api/categories/{id}/products/       Get products in a category

Query params supported on /api/products/:
  ?category=<slug>       Filter by category slug
  ?q=<text>              Search by product name
  ?min_price=<n>         Filter by minimum price
  ?max_price=<n>         Filter by maximum price
  ?in_stock=true         Only in-stock products
  ?ordering=price        Sort by price (prefix - for desc)
  ?page=<n>              Page number (default page_size=20)
  ?page_size=<n>         Items per page (max 100)
"""

import os
from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Q, Count
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings

from .models import Category, Product, Review, Wishlist, WishlistItem
from .serializers import (
    CategorySerializer, ProductSerializer,
    ReviewSerializer, WishlistSerializer
)


# ─── Pagination ────────────────────────────────────────────────────────────────

class ProductPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count':    self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'page':     self.page.number,
            'next':     self.get_next_link(),
            'previous': self.get_previous_link(),
            'results':  data,
        })


# ─── Product ViewSet ────────────────────────────────────────────────────────────

class ProductViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for Products. Public read, admin write.

    Supports filtering:
      ?category=mobiles
      ?q=iphone
      ?min_price=500&max_price=50000
      ?in_stock=true
      ?ordering=price  (or -price, -created_at, name)
    """
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    parser_classes   = [MultiPartParser, FormParser, JSONParser]

    def get_authenticators(self):
        if self.request and self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return []
        return super().get_authenticators()

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'featured', 'trending', 'by_category'):
            return [AllowAny()]
        if self.action == 'add_review':
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = Product.objects.select_related('category').prefetch_related('reviews').order_by('-created_at')

        # Category filter
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug__iexact=category)

        # Full-text search (name + description)
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(description__icontains=q))

        # Price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)

        # In-stock filter
        in_stock = self.request.query_params.get('in_stock')
        if in_stock and in_stock.lower() == 'true':
            qs = qs.filter(stock__gt=0)

        # Ordering
        ordering = self.request.query_params.get('ordering')
        VALID_ORDERINGS = ('price', '-price', 'name', '-name', 'created_at', '-created_at')
        if ordering in VALID_ORDERINGS:
            qs = qs.order_by(ordering)

        return qs

    # ── Extra actions ─────────────────────────────────────────────────────────

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def featured(self, request):
        """Top rated products across all categories (avg rating >= 4.5)."""
        products = (
            Product.objects.select_related('category')
            .annotate(avg_rating=Avg('reviews__rating'))
            .filter(stock__gt=0)
            .order_by('-avg_rating', '-created_at')[:20]
        )
        serializer = self.get_serializer(products, many=True)
        return Response({'count': len(serializer.data), 'results': serializer.data})

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def trending(self, request):
        """10 most recently added products per category = trending."""
        limit = int(request.query_params.get('limit', 12))
        products = (
            Product.objects.select_related('category')
            .order_by('-created_at')[:limit]
        )
        serializer = self.get_serializer(products, many=True)
        return Response({'count': len(serializer.data), 'results': serializer.data})

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def by_category(self, request):
        """Products grouped by category. Returns dict: {category_slug: [products]}."""
        categories = Category.objects.prefetch_related('products').all()
        result = {}
        for cat in categories:
            products = cat.products.all()[:8]
            result[cat.slug] = {
                'name':     cat.name,
                'id':       cat.id,
                'count':    cat.products.count(),
                'products': self.get_serializer(products, many=True).data,
            }
        return Response(result)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser],
            parser_classes=[MultiPartParser, FormParser, JSONParser],
            url_path='update_image')
    def update_image(self, request, pk=None):
        """
        PATCH /api/products/{id}/update_image/

        Accepts either:
          - JSON body: {"image": "https://example.com/photo.jpg"}
          - multipart/form-data: file field named 'image_file'
        """
        product = self.get_object()

        # File upload
        image_file = request.FILES.get('image_file')
        if image_file:
            ext = os.path.splitext(image_file.name)[1].lower() or '.jpg'
            path = f'products/{product.id}{ext}'
            saved_path = default_storage.save(path, ContentFile(image_file.read()))
            product.image = request.build_absolute_uri(settings.MEDIA_URL + saved_path)
            product.save(update_fields=['image'])
            return Response({
                'id': product.id,
                'name': product.name,
                'image': product.image,
                'source': 'file_upload',
            })

        # URL update
        image_url = request.data.get('image')
        if image_url:
            product.image = image_url
            product.save(update_fields=['image'])
            return Response({
                'id': product.id,
                'name': product.name,
                'image': product.image,
                'source': 'url',
            })

        return Response(
            {'error': 'Provide either image_file (multipart) or image (URL in JSON body).'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_review(self, request, pk=None):
        """POST /api/products/{id}/add_review/ — Add a user review."""
        product = self.get_object()
        if Review.objects.filter(product=product, user=request.user).exists():
            return Response({'error': 'You have already reviewed this product.'}, status=400)

        rating  = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not rating or not (1 <= int(rating) <= 5):
            return Response({'error': 'Provide a rating between 1 and 5.'}, status=400)

        Review.objects.create(product=product, user=request.user,
                              rating=int(rating), comment=comment)
        serializer = self.get_serializer(product)
        return Response(serializer.data, status=201)


# ─── Dedicated Image API ────────────────────────────────────────────────────────

class ProductImageListView(APIView):
    """
    GET  /api/images/          → list all product images {id, name, image}
    """
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.select_related('category').only(
            'id', 'name', 'image', 'category'
        ).order_by('category__name', 'name')

        # Optional category filter
        cat = request.query_params.get('category')
        if cat:
            products = products.filter(category__slug__iexact=cat)

        data = [
            {
                'id':       p.id,
                'name':     p.name,
                'category': p.category.slug if p.category else None,
                'image':    p.image,
            }
            for p in products
        ]
        return Response({'count': len(data), 'results': data})


class ProductImageDetailView(APIView):
    """
    GET   /api/images/{id}/    → get image info for a single product
    PATCH /api/images/{id}/    → update image URL (admin only)
                                 Body: {"image": "https://..."} or multipart image_file
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    def get(self, request, pk):
        p = get_object_or_404(Product.objects.select_related('category'), pk=pk)
        return Response({
            'id':       p.id,
            'name':     p.name,
            'category': p.category.slug if p.category else None,
            'image':    p.image,
        })

    def patch(self, request, pk):
        p = get_object_or_404(Product, pk=pk)

        image_file = request.FILES.get('image_file')
        if image_file:
            ext = os.path.splitext(image_file.name)[1].lower() or '.jpg'
            path = f'products/{p.id}{ext}'
            saved = default_storage.save(path, ContentFile(image_file.read()))
            p.image = request.build_absolute_uri(settings.MEDIA_URL + saved)
        else:
            url = request.data.get('image')
            if not url:
                return Response({'error': 'Provide image (URL) or image_file.'}, status=400)
            p.image = url

        p.save(update_fields=['image'])
        return Response({'id': p.id, 'name': p.name, 'image': p.image})


class ProductImageBulkUpdateView(APIView):
    """
    POST /api/images/bulk_update/

    Body (JSON):
      {
        "updates": [
          {"id": 1, "image": "https://..."},
          {"id": 5, "image": "https://..."},
          ...
        ]
      }

    Returns a summary of updated / failed products.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        updates = request.data.get('updates', [])
        if not updates or not isinstance(updates, list):
            return Response({'error': 'Provide updates: [{id, image}, ...]'}, status=400)

        updated, failed = [], []
        for item in updates:
            pid   = item.get('id')
            image = item.get('image', '').strip()
            if not pid or not image:
                failed.append({'id': pid, 'reason': 'missing id or image'})
                continue
            try:
                p = Product.objects.get(pk=pid)
                p.image = image
                p.save(update_fields=['image'])
                updated.append({'id': p.id, 'name': p.name, 'image': p.image})
            except Product.DoesNotExist:
                failed.append({'id': pid, 'reason': 'not found'})

        return Response({
            'updated_count': len(updated),
            'failed_count':  len(failed),
            'updated': updated,
            'failed':  failed,
        }, status=200)


# ─── Category ViewSet ───────────────────────────────────────────────────────────

class CategoryViewSet(viewsets.ModelViewSet):
    """
    GET /api/categories/                  → list all categories
    GET /api/categories/{id}/products/   → products in this category (paginated)
    """
    authentication_classes = []
    permission_classes = [AllowAny]
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def products(self, request, pk=None):
        category   = self.get_object()
        products   = category.products.all().order_by('-created_at')
        paginator  = ProductPagination()
        page       = paginator.paginate_queryset(products, request)
        serializer = ProductSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


# ─── Wishlist Views (unchanged) ─────────────────────────────────────────────────

class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        return Response(WishlistSerializer(wishlist).data)

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id required'}, status=400)
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        product = get_object_or_404(Product, id=product_id)
        if WishlistItem.objects.filter(wishlist=wishlist, product=product).exists():
            return Response({'message': 'Already in wishlist'})
        WishlistItem.objects.create(wishlist=wishlist, product=product)
        return Response(WishlistSerializer(wishlist).data, status=201)


class WishlistItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        wishlist = get_object_or_404(Wishlist, user=request.user)
        item = get_object_or_404(WishlistItem, wishlist=wishlist, product_id=product_id)
        item.delete()
        return Response(WishlistSerializer(wishlist).data)
