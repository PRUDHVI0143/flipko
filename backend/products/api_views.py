from rest_framework import viewsets
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only API endpoint for categories.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only API endpoint for products.
    """
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all().order_by('-created_at')
        category_slug = self.request.query_params.get('category', None)
        if category_slug is not None:
            queryset = queryset.filter(category__slug=category_slug)
            
        search_query = self.request.query_params.get('q', None)
        if search_query is not None:
            queryset = queryset.filter(name__icontains=search_query)
            
        return queryset
