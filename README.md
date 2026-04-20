# Flipko - Premium E-commerce Suite (Reaction)

Flipko is a high-performance, modular e-commerce ecosystem featuring a robust Django backend and a premium React frontend.

## 📁 Project Structure

The project is organized into two primary layers:

### 1. ⚙️ [Backend] Django REST Core
The heart of the ecosystem. It manages the database, product inventory, authentication, and order processing.
*   **Technology:** Python, Django, Django REST Framework (DRF)
*   **Key Features:** Automated stock reduction, Order API, Admin Dashboard, search/filtering endpoints.

### 2. ⚛️ [Frontend] Reaction UI
A premium React-based storefront focused on speed, responsiveness, and a modern "glassmorphic" shopping experience.
*   **Technology:** React.js, Vite, Redux Toolkit, TailwindCSS, Framer Motion.
*   **Key Features:** Global state management (Redux), real-time search/categorical discovery, smoothed high-fidelity UI.

---

## 🚀 Getting Started

### Prerequisites
*   Python 3.10+
*   Node.js & npm
*   Virtual Environment (handled by setup script)

### One-Command Start
Run the consolidated batch file in the root directory to start **both** the backend and the React frontend simultaneously:
```bash
./run_flipko.bat
```

The script will:
1. Initialize the Python virtual environment.
2. Launch the Vite dev server for Reaction.
3. Start the Django backend and open the browser.

---

## 📅 Status
- [x] **Backend:** API Refinement & Inventory Logic
- [x] **Backend:** Category & Search API Support
- [x] **Reaction:** Premium Glassmorphic UI Implementation
- [x] **Reaction:** Cart Logic & Product Discovery
- [x] **System:** Consolidated One-Command Startup

---
*Developed by Antigravity AI - Advanced Agentic Coding Team*

