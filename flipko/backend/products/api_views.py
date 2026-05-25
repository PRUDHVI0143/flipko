from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from .models import Category, Product, Review, Wishlist, WishlistItem
from .serializers import CategorySerializer, ProductSerializer, ReviewSerializer, WishlistSerializer
from django.shortcuts import get_object_or_404

class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for categories.
    """
    authentication_classes = [] # No authentication for categories
    permission_classes = [AllowAny]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint for products.
    """
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer

    def get_authenticators(self):
        if self.request and self.request.method == 'GET' and getattr(self, 'action', None) in ['list', 'retrieve']:
            return [] # No authentication for public list/retrieve
        return super().get_authenticators()

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny] # Publicly readable
        else:
            permission_classes = [IsAuthenticated] # Requires login for reviews, updates, etc.
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = Product.objects.all().order_by('-created_at')
        category_slug = self.request.query_params.get('category', None)
        if category_slug is not None:
            queryset = queryset.filter(category__slug__iexact=category_slug)
            
        search_query = self.request.query_params.get('q', None)
        if search_query is not None:
            queryset = queryset.filter(name__icontains=search_query)
            
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_review(self, request, pk=None):
        product = self.get_object()
        user = request.user
        data = request.data
        
        # Check if user already reviewed
        if Review.objects.filter(product=product, user=user).exists():
            return Response({'error': 'You have already reviewed this product.'}, status=status.HTTP_400_BAD_REQUEST)
            
        rating = data.get('rating')
        comment = data.get('comment', '')
        
        if not rating or not (1 <= int(rating) <= 5):
            return Response({'error': 'Please provide a valid rating between 1 and 5.'}, status=status.HTTP_400_BAD_REQUEST)
            
        review = Review.objects.create(
            product=product,
            user=user,
            rating=int(rating),
            comment=comment
        )
        
        # Return updated product data
        serializer = self.get_serializer(product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data)

    def post(self, request):
        # Add product to wishlist
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"error": "product_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        product = get_object_or_404(Product, id=product_id)
        
        # Check if already exists
        if WishlistItem.objects.filter(wishlist=wishlist, product=product).exists():
            return Response({"message": "Product already in wishlist"}, status=status.HTTP_200_OK)
            
        WishlistItem.objects.create(wishlist=wishlist, product=product)
        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class WishlistItemDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, product_id):
        # Remove product from wishlist
        wishlist = get_object_or_404(Wishlist, user=request.user)
        item = get_object_or_404(WishlistItem, wishlist=wishlist, product_id=product_id)
        item.delete()
        
        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data, status=status.HTTP_200_OK)
