from rest_framework import serializers
from django.db.models import Avg
from .models import Category, Product, Review, Wishlist, WishlistItem


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'product_count']

    def get_product_count(self, obj):
        return obj.products.count()


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']


class ProductSerializer(serializers.ModelSerializer):
    category        = CategorySerializer(read_only=True)
    category_id     = serializers.PrimaryKeyRelatedField(
                          queryset=Category.objects.all(),
                          source='category', write_only=True
                      )
    reviews         = ReviewSerializer(many=True, read_only=True)
    average_rating  = serializers.SerializerMethodField()
    review_count    = serializers.SerializerMethodField()
    discount_price  = serializers.SerializerMethodField()
    in_stock        = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_id',
            'name', 'description',
            'price', 'discount_price',
            'image',
            'stock', 'in_stock',
            'average_rating', 'review_count',
            'reviews',
            'created_at',
        ]

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 4.8

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_discount_price(self, obj):
        """Show an original (MRP) price as 15-40% above actual price for display."""
        import random
        random.seed(obj.id)
        markup = random.randint(15, 40) / 100
        return round(float(obj.price) * (1 + markup), 2)

    def get_in_stock(self, obj):
        return obj.stock > 0


# ── Light serializer for image-only responses ───────────────────────────────────

class ProductImageSerializer(serializers.ModelSerializer):
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'image', 'category_slug', 'category_name']


# ── Wishlist serializers ─────────────────────────────────────────────────────────

class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'product_id', 'added_at']


class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ['id', 'items', 'item_count', 'created_at']

    def get_item_count(self, obj):
        return obj.items.count()
