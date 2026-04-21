# Color Nest Paints E-commerce & Logistics Platform

Welcome to the **Color Nest Paints** platform, a comprehensive MERN stack (MongoDB, Express, React, Node.js) web application designed for a premium paint manufacturing and distribution company. 

This platform serves as a modern e-commerce storefront for customers, a logistics tracker for real-time deliveries, and a powerful command center for administrators to manage inventory, sales, and color formulation.

## 🚀 Key Features

### For Customers
* **Premium Storefront**: Browse a high-end catalog of paints, coatings, and accessories with a modern, responsive UI.
* **Smart Shopping Cart**: Seamless cart management with secure checkout integrations (eSewa & Khalti).
* **Live Order Tracking**: A state-of-the-art logistics dashboard featuring real-time map tracking (via Leaflet & Socket.io) to monitor delivery agents.
* **Paint Calculator**: An interactive tool to estimate paint quantity required based on room dimensions.
* **Find a Painter**: A directory connecting customers with ColorNest Certified Professional Painters.

### For Administrators
* **Business Analytics**: A real-time dashboard featuring interactive charts (Chart.js) for revenue, regional sales, and inventory alerts.
* **Color Lab (Mixing Calculator)**: A dedicated digital formulation guide for creating custom paint recipes. Input a target color, and the system calculates the exact ratio of base paints required for production.
* **Logistics & Warehousing**: Manage regional distribution centers and monitor stock levels across different branches.
* **Full E-commerce Control**: Complete CRUD capabilities for Products, Orders, Users, and Professional Painters.

## 🛠️ Technology Stack

**Frontend:**
* React (Vite)
* React Router DOM
* React Leaflet (Maps)
* Chart.js & React-ChartJS-2
* Socket.io-Client
* Vanilla CSS (Premium Glassmorphism Design)
* Lucide React (Icons)

**Backend:**
* Node.js & Express.js
* MongoDB & Mongoose
* Socket.io (Real-time updates)
* JSON Web Tokens (JWT) for Authentication
* Multer (Image uploads)
* eSewa & Khalti Payment Gateway Integration

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajendrachy/Color_Nest_Nepal.git
   cd Color_Nest_Nepal
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create a .env file based on the environment requirements
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   # Create a .env file containing VITE_API_URL
   npm run dev
   ```

## 🔐 Environment Variables

You will need to set up `.env` files in both the frontend and backend directories.
* **Backend**: Requires `PORT`, `MONGO_URI`, `JWT_SECRET`, `ESEWA_MERCHANT_ID`, etc.
* **Frontend**: Requires `VITE_API_URL`.

## 🎨 Design Philosophy

Color Nest Paints utilizes an ultra-premium "Dark Logistics" and "Glassmorphism" aesthetic. The UI is designed to evoke a sense of high-end quality, using vibrant brand accents against sleek, modern backgrounds.

## 📄 License

This project is proprietary and developed for Color Nest Paints Nepal.
