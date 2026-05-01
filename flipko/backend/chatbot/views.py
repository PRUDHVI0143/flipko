from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from products.models import Product, Category
from orders.models import Order
from django.db.models import Q, Min, Max, Count
import random
import re
import difflib


class StoreAssistant:
    """
    AI-powered store assistant with advanced search, deals, recommendations,
    and natural language understanding.
    """

    # Intent patterns
    GREETING_WORDS = {'hi', 'hello', 'hey', 'greetings', 'hola', 'namaste', 'hii', 'hiii', 'yo', 'sup'}
    THANKS_WORDS = {'thanks', 'thank', 'thankyou', 'thx', 'ty', 'appreciate'}
    BYE_WORDS = {'bye', 'goodbye', 'see ya', 'cya', 'later', 'tata'}
    HELP_WORDS = {'help', 'what can you do', 'capabilities', 'features', 'options', 'menu'}
    DEAL_WORDS = {'deal', 'deals', 'offer', 'offers', 'discount', 'sale', 'best deal', 'cheap', 'cheapest', 'budget', 'affordable', 'value'}
    TRENDING_WORDS = {'trending', 'popular', 'best seller', 'bestseller', 'best sellers', 'top', 'hot', 'new', 'featured', 'recommend', 'suggestion', 'suggest'}
    ORDER_WORDS = {'order', 'track', 'tracking', 'status', 'delivery', 'shipped', 'where is my', 'my order'}
    COMPARE_WORDS = {'compare', 'vs', 'versus', 'difference', 'better'}

    def __init__(self, user=None):
        self.user = user
        self.categories = list(Category.objects.values_list('name', flat=True))
        self.category_slugs = list(Category.objects.values_list('slug', flat=True))
        self.category_map = dict(Category.objects.values_list('slug', 'name'))

    def get_response(self, user_query):
        query = user_query.lower().strip()

        # 1. Greetings
        if self._is_greeting(query):
            return self._greeting_response()

        # 2. Thanks
        if self._is_thanks(query):
            return self._thanks_response()

        # 3. Bye
        if self._is_bye(query):
            return self._bye_response()

        # 4. Help / Capabilities
        if self._is_help(query):
            return self._help_response()

        # 5. Order Tracking
        if self._is_order_query(query):
            return self._order_response()

        # 6. Deals / Budget
        if self._is_deals_query(query):
            return self._deals_response(query)

        # 7. Trending / Popular
        if self._is_trending_query(query):
            return self._trending_response(query)

        # 8. Comparison
        if self._is_compare_query(query):
            result = self._compare_response(query)
            if result:
                return result

        # 9. Advanced Product Search (main handler)
        return self._product_search(query)

    # ──────────────────────────────────────────────
    # INTENT DETECTION
    # ──────────────────────────────────────────────

    def _is_greeting(self, query):
        words = set(query.split())
        return bool(words & self.GREETING_WORDS) and len(query.split()) < 4

    def _is_thanks(self, query):
        return bool(set(query.split()) & self.THANKS_WORDS)

    def _is_bye(self, query):
        return any(word in query for word in self.BYE_WORDS) and len(query.split()) < 5

    def _is_help(self, query):
        return any(h in query for h in self.HELP_WORDS)

    def _is_order_query(self, query):
        return any(w in query for w in self.ORDER_WORDS)

    def _is_deals_query(self, query):
        return any(w in query for w in self.DEAL_WORDS)

    def _is_trending_query(self, query):
        return any(w in query for w in self.TRENDING_WORDS)

    def _is_compare_query(self, query):
        return any(w in query for w in self.COMPARE_WORDS)

    # ──────────────────────────────────────────────
    # RESPONSE HANDLERS
    # ──────────────────────────────────────────────

    def _greeting_response(self):
        greetings = [
            "Hello! Welcome to Flipko! I can help you find products, track orders, discover deals, or compare items. What's on your mind?",
            "Hey there! I'm your Flipko AI Assistant. Looking for something special today?",
            "Hi! Welcome back to Flipko! Ready to discover amazing products? Just ask me anything!",
            "Namaste! I'm here to help you shop smarter. Search products, find deals, or track your orders!",
        ]
        return {
            "message": random.choice(greetings),
            "products": [],
            "quick_replies": ["Today's Deals", "Trending", "Browse Mobiles", "Track Order", "Help"]
        }

    def _thanks_response(self):
        return {
            "message": "You're welcome! Happy to help. Need anything else?",
            "products": [],
            "quick_replies": ["Browse More", "Today's Deals", "Help"]
        }

    def _bye_response(self):
        return {
            "message": "Goodbye! Thanks for shopping with Flipko. Come back anytime!",
            "products": [],
            "quick_replies": ["Today's Deals", "Browse Products"]
        }

    def _help_response(self):
        return {
            "message": (
                "Here's what I can do for you:\n\n"
                "**🔍 Search Products** — \"Show me laptops\", \"Find headphones\"\n"
                "**💰 Price Filters** — \"Mobiles under ₹20000\", \"Books between ₹200 and ₹500\"\n"
                "**🏷️ Deals & Budget** — \"Today's deals\", \"Cheapest mobiles\"\n"
                "**🔥 Trending** — \"What's trending?\", \"Best sellers\"\n"
                "**📦 Order Tracking** — \"Track my order\", \"Order status\"\n"
                "**⚖️ Compare** — \"Compare iPhone and Samsung\"\n"
                "**📂 Categories** — \"Browse fashion\", \"Show electronics\"\n\n"
                "Just type naturally — I understand!"
            ),
            "products": [],
            "quick_replies": ["Today's Deals", "Trending", "Mobiles", "Fashion", "Electronics"]
        }

    def _order_response(self):
        if not self.user or self.user.is_anonymous:
            return {
                "message": "I'd love to help with your orders! Please log in first so I can securely access your order history.",
                "products": [],
                "quick_replies": ["Login", "Browse Products", "Help"]
            }

        orders = Order.objects.filter(user=self.user).order_by('-created_at')
        latest = orders.first()

        if latest:
            order_count = orders.count()
            msg = (
                f"Here's your latest order:\n\n"
                f"**Order #{latest.id}**\n"
                f"Status: **{latest.status}**\n"
                f"Placed: {latest.created_at.strftime('%b %d, %Y at %I:%M %p')}\n"
                f"Total: ₹{latest.total_amount}\n\n"
                f"You have {order_count} order(s) in total."
            )
            return {
                "message": msg,
                "products": [],
                "quick_replies": ["All Orders", "Continue Shopping", "Help"]
            }

        return {
            "message": "You haven't placed any orders yet. Shall I show you some trending products to get started?",
            "products": [],
            "quick_replies": ["Trending", "Today's Deals", "Browse Categories"]
        }

    def _deals_response(self, query):
        """Handle deals, budget, and cheapest queries."""
        matched_category = self._match_category(query)

        products = Product.objects.all()
        if matched_category:
            products = products.filter(category__slug=matched_category)

        # Sort by price ascending for "cheapest" / "budget"
        products = products.order_by('price')[:6]

        if products.exists():
            product_list = list(products)
            product_data = self._serialize_products(product_list)
            cat_name = self.category_map.get(matched_category, '')
            cat_label = f" in {cat_name}" if cat_name else ""
            price_range = f"₹{product_list[0].price} - ₹{product_list[-1].price}"

            return {
                "message": f"🏷️ Best deals{cat_label}! Prices range from {price_range}. Here are the most affordable options:",
                "products": product_data,
                "quick_replies": self._smart_quick_replies(matched_category)
            }

        return self._no_results_response()

    def _trending_response(self, query):
        """Handle trending/popular/recommended queries."""
        matched_category = self._match_category(query)

        products = Product.objects.all()
        if matched_category:
            products = products.filter(category__slug=matched_category)

        # Random selection to simulate "trending"
        product_ids = list(products.values_list('id', flat=True))
        if len(product_ids) > 6:
            product_ids = random.sample(product_ids, 6)

        products = Product.objects.filter(id__in=product_ids)

        if products.exists():
            product_data = self._serialize_products(products)
            cat_name = self.category_map.get(matched_category, '')
            cat_label = f" in {cat_name}" if cat_name else ""

            return {
                "message": f"🔥 Trending right now{cat_label}! These are our most popular picks:",
                "products": product_data,
                "quick_replies": self._smart_quick_replies(matched_category)
            }

        return self._no_results_response()

    def _compare_response(self, query):
        """Handle product comparison queries."""
        # Try to find products mentioned in the query
        all_products = Product.objects.select_related('category').all()
        matched = []

        for p in all_products:
            name_lower = p.name.lower()
            # Check if significant parts of the product name appear in query
            name_words = [w for w in name_lower.split() if len(w) > 2]
            match_score = sum(1 for w in name_words if w in query)
            if match_score >= 2 or name_lower in query:
                matched.append((p, match_score))

        # Sort by match score and take top 2
        matched.sort(key=lambda x: x[1], reverse=True)
        top_products = [m[0] for m in matched[:2]]

        if len(top_products) >= 2:
            p1, p2 = top_products[0], top_products[1]
            product_data = self._serialize_products(top_products)

            cheaper = p1 if p1.price < p2.price else p2
            pricier = p2 if p1.price < p2.price else p1

            msg = (
                f"⚖️ Comparing:\n\n"
                f"**{p1.name}** — ₹{p1.price} ({p1.category.name})\n"
                f"**{p2.name}** — ₹{p2.price} ({p2.category.name})\n\n"
                f"💡 {cheaper.name} is more affordable at ₹{cheaper.price}, "
                f"while {pricier.name} is premium at ₹{pricier.price}."
            )

            return {
                "message": msg,
                "products": product_data,
                "quick_replies": [f"Buy {p1.name[:20]}", f"Buy {p2.name[:20]}", "Compare Others"]
            }

        if len(top_products) == 1:
            product_data = self._serialize_products(top_products)
            return {
                "message": f"I found **{top_products[0].name}** (₹{top_products[0].price}). Mention another product to compare!",
                "products": product_data,
                "quick_replies": ["Compare with iPhone", "Compare with Samsung", "Help"]
            }

        return None  # Let it fall through to product search

    def _product_search(self, query):
        """Advanced product search with category, price, and keyword filtering."""
        matched_category = self._match_category(query)

        # Price detection — supports multiple formats
        max_price = None
        min_price = None
        sort_order = None

        # "under X", "below X", "less than X", "within X"
        under_match = re.search(r'(?:under|below|less than|within|upto|up to)\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)', query)
        if under_match:
            max_price = int(under_match.group(1).replace(',', ''))

        # "above X", "over X", "more than X", "starting X"
        above_match = re.search(r'(?:above|over|more than|starting|from|min)\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)', query)
        if above_match:
            min_price = int(above_match.group(1).replace(',', ''))

        # "between X and Y" or "X to Y"
        range_match = re.search(r'(?:between\s+)?(?:rs\.?|inr|₹)?\s*(\d[\d,]*)\s*(?:to|and|-)\s*(?:rs\.?|inr|₹)?\s*(\d[\d,]*)', query)
        if range_match:
            val1 = int(range_match.group(1).replace(',', ''))
            val2 = int(range_match.group(2).replace(',', ''))
            min_price = min(val1, val2)
            max_price = max(val1, val2)

        # Sorting intent
        if any(w in query for w in ['cheapest', 'lowest price', 'low to high', 'affordable']):
            sort_order = 'price'
        elif any(w in query for w in ['expensive', 'highest price', 'high to low', 'premium', 'luxury']):
            sort_order = '-price'
        elif any(w in query for w in ['newest', 'latest', 'new', 'recent']):
            sort_order = '-created_at'

        # Build queryset
        products = Product.objects.select_related('category').all()

        if matched_category:
            products = products.filter(category__slug=matched_category)

        if max_price:
            products = products.filter(price__lte=max_price)

        if min_price:
            products = products.filter(price__gte=min_price)

        # Keyword search — strip out noise words
        noise_words = {'find', 'search', 'show', 'me', 'get', 'give', 'want', 'need',
                       'i', 'a', 'the', 'for', 'in', 'some', 'any', 'good', 'best',
                       'please', 'can', 'you', 'under', 'below', 'above', 'between',
                       'and', 'to', 'from', 'with', 'buy', 'purchase', 'looking'}

        search_terms = query
        # Remove matched patterns
        for pattern in [under_match, above_match, range_match]:
            if pattern:
                search_terms = search_terms.replace(pattern.group(0), '')
        if matched_category:
            search_terms = search_terms.replace(matched_category.replace('-', ' '), '')

        keywords = [w for w in search_terms.split() if w not in noise_words and len(w) > 1]

        if keywords:
            q_objects = Q()
            for kw in keywords:
                if len(kw) > 2:
                    q_objects |= Q(name__icontains=kw) | Q(description__icontains=kw)
            if q_objects:
                products = products.filter(q_objects)

        # Apply sort
        if sort_order:
            products = products.order_by(sort_order)

        products = products.distinct()[:6]

        if products.exists():
            product_data = self._serialize_products(products)

            # Build descriptive message
            msg = f"I found {len(product_data)} great option{'s' if len(product_data) > 1 else ''}"
            cat_name = self.category_map.get(matched_category, '')
            if cat_name:
                msg += f" in **{cat_name}**"
            if max_price and min_price:
                msg += f" between ₹{min_price:,} and ₹{max_price:,}"
            elif max_price:
                msg += f" under ₹{max_price:,}"
            elif min_price:
                msg += f" above ₹{min_price:,}"
            msg += ":"

            return {
                "message": msg,
                "products": product_data,
                "quick_replies": self._smart_quick_replies(matched_category)
            }

        return self._no_results_response()

    # ──────────────────────────────────────────────
    # UTILITY METHODS
    # ──────────────────────────────────────────────

    def _match_category(self, query):
        """Fuzzy-match a category from the query."""
        # Direct slug match
        for cat in self.category_slugs:
            if cat.replace('-', ' ') in query or cat in query:
                return cat

        # Try fuzzy match
        words = query.split()
        for word in words:
            if len(word) > 2:
                matches = difflib.get_close_matches(word, self.category_slugs, n=1, cutoff=0.65)
                if matches:
                    return matches[0]

        # Also match against category display names
        for slug, name in self.category_map.items():
            if name.lower() in query:
                return slug
            for word in name.lower().split():
                if len(word) > 3 and word in query:
                    return slug

        return None

    def _serialize_products(self, products):
        """Convert products to API-ready dicts."""
        return [
            {
                "id": p.id,
                "name": p.name,
                "price": str(p.price),
                "image": p.image,
                "category": p.category.name if hasattr(p, 'category') and p.category else None,
            }
            for p in products
        ]

    def _smart_quick_replies(self, current_category=None):
        """Generate context-aware quick reply suggestions."""
        base_replies = []

        if current_category:
            cat_name = self.category_map.get(current_category, current_category)
            base_replies.append(f"Cheapest {cat_name}")
            base_replies.append(f"All {cat_name}")

            # Suggest a different category
            other_cats = [s for s in self.category_slugs if s != current_category]
            if other_cats:
                random_cat = random.choice(other_cats)
                base_replies.append(f"Browse {self.category_map.get(random_cat, random_cat)}")
        else:
            base_replies.extend(["Today's Deals", "Trending"])
            # Random category suggestion
            if self.category_slugs:
                random_cat = random.choice(self.category_slugs)
                base_replies.append(f"Browse {self.category_map.get(random_cat, random_cat)}")

        base_replies.append("Help")
        return base_replies[:5]

    def _no_results_response(self):
        """Response when no products match."""
        # Suggest some categories
        suggestions = random.sample(self.category_slugs, min(3, len(self.category_slugs)))
        cat_names = [self.category_map.get(s, s) for s in suggestions]

        return {
            "message": (
                "I couldn't find an exact match for that. Try:\n"
                f"• Browse by category: {', '.join(cat_names)}\n"
                "• Use simpler terms like \"laptops\", \"shoes\", \"books\"\n"
                "• Try a price range like \"under ₹1000\""
            ),
            "products": [],
            "quick_replies": cat_names + ["Today's Deals", "Help"]
        }


class ChatbotView(APIView):
    def post(self, request):
        message = request.data.get('message', '')
        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
        assistant = StoreAssistant(user=request.user)
        response_data = assistant.get_response(message)
        return Response(response_data, status=status.HTTP_200_OK)
