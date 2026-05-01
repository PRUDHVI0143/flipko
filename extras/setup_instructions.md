# Flipko Premium Setup Instructions

Welcome to the Flipko E-commerce Suite! This project features a robust Django REST backend and a modernized React (Reaction) frontend.

## 🚀 The Easiest Way: One-Command Start (Windows)
Simply double-click the `run_flipko.bat` file in the root directory.
*   **Automatic Setup**: It creates the Python virtual environment and installs all dependencies (`Django`, `Pillow`, `rest_framework`, etc.).
*   **Dual-Window Launch**: It opens one terminal for the React frontend (Vite) and another for the Django backend.
*   **Auto-Browser**: It automatically opens your browser to the storefront at `http://localhost:5173/`.

---

## 🛠️ Manual Development Setup

### 1. Backend Integration
1.  **Activate Environment**: 
    ```bash
    venv\Scripts\activate
    ```
2.  **Navigate to Backend**: `cd backend`
3.  **Run Server**: `python manage.py runserver 8080`
    *   *Note: The frontend expects the API at port 8080.*

### 2. Frontend Development (Reaction)
1.  **Navigate to Frontend**: `cd frontend-reaction`
2.  **Install JS Deps**: `npm install`
3.  **Launch Dev Server**: `npm run dev`
    *   *Default URL: http://localhost:5173/*

---

## 🔐 Administration & Data
*   **Admin Dashboard**: [http://127.0.0.1:8080/admin/](http://127.0.0.1:8080/admin/)
*   **Superuser**: You can create an admin account by running `python manage.py createsuperuser` inside the `backend` folder.
*   **Product Management**: Use the Admin dashboard to add products, categories, and manage stock. The React storefront will update instantly.

---
*Powered by Antigravity AI*
