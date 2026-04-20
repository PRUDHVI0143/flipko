// Flipko Wishlist AJAX Toggle
document.addEventListener('DOMContentLoaded', function () {
    
    function getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) return meta.getAttribute('content');
        const cookie = document.cookie.split(';').find(c => c.trim().startsWith('csrftoken='));
        return cookie ? cookie.split('=')[1] : '';
    }

    function showToast(message, type) {
        // Remove any existing toast
        const existing = document.getElementById('wishlist-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.id = 'wishlist-toast';
        toast.style.cssText = `
            position: fixed; bottom: 24px; right: 24px; z-index: 9999;
            background: ${type === 'added' ? '#2874f0' : '#555'};
            color: white; padding: 12px 20px; border-radius: 8px;
            font-size: 14px; font-weight: 600; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            display: flex; align-items: center; gap: 10px;
            animation: slideInRight 0.3s ease forwards;
        `;
        const icon = type === 'added' ? '❤️' : '🤍';
        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'none';
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.4s';
            setTimeout(() => toast.remove(), 400);
        }, 2500);
    }

    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.wishlist-btn');
        if (!btn) return;

        const productId = btn.dataset.productId;
        const url = btn.dataset.url;
        const icon = btn.querySelector('i');
        
        // Check if user is logged in (button won't have data-url if not)
        if (!url) {
            window.location.href = '/accounts/login/';
            return;
        }

        // Optimistic UI: Toggle appearance immediately
        const isWished = icon.classList.contains('fas');
        if (isWished) {
            icon.classList.replace('fas', 'far');
            icon.classList.replace('text-danger', 'text-muted');
        } else {
            icon.classList.replace('far', 'fas');
            icon.classList.replace('text-muted', 'text-danger');
        }
        
        // Animate the heart
        btn.style.transform = 'scale(1.4)';
        setTimeout(() => btn.style.transform = 'scale(1)', 200);

        // Send the AJAX request
        fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCsrfToken(),
                'Content-Type': 'application/json',
            }
        })
        .then(res => {
            if (res.status === 302 || res.redirected) {
                // User is not authenticated, redirect to login
                window.location.href = '/accounts/login/';
                return null;
            }
            return res.json();
        })
        .then(data => {
            if (!data) return;
            if (data.status === 'added') {
                showToast(data.message, 'added');
            } else if (data.status === 'removed') {
                showToast(data.message, 'removed');
                // If on wishlist page, remove the card visually
                const card = document.getElementById(`wishlist-card-${productId}`);
                if (card) {
                    card.style.transition = 'opacity 0.4s, transform 0.4s';
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => card.remove(), 400);
                }
            }
        })
        .catch(() => {
            // Revert on error
            if (isWished) {
                icon.classList.replace('far', 'fas');
                icon.classList.replace('text-muted', 'text-danger');
            } else {
                icon.classList.replace('fas', 'far');
                icon.classList.replace('text-danger', 'text-muted');
            }
        });
    });
});
