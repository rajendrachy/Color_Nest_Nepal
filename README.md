# ColorNest Nepal - E-commerce Platform

A complete MERN stack application for ColorNest with a Nepal-wide delivery system.

## Features
- **User Authentication**: JWT based login/register with Nepali phone validation.
- **Product Catalog**: Advanced filtering, search, and detailed specifications.
- **Coverage Calculator**: In-built tool to calculate paint requirements in liters.
- **Cart & Checkout**: VAT (13%) calculation and Nepal-specific address system.
- **Order Tracking**: Real-time tracking with status timeline.
- **Admin Dashboard**: Analytics, sales charts (Chart.js), and management of orders, products, and warehouses.
- **Nepal-Specific**: Support for 7 provinces, 77 districts, eSewa, and Khalti payment logic.

## Tech Stack
- **Frontend**: React.js, Vite, Vanilla CSS, Lucide React, Framer Motion, Chart.js.
- **Backend**: Node.js, Express, MongoDB, Socket.io, Nodemailer.

## Setup Instructions

### 1. Clone & Install
```bash
# Install all dependencies (Root, Backend, Frontend)
npm run install-all
```

### 2. Environment Variables
Create a `.env` file in the `backend` folder with the following:
```env
MONGODB_URI=mongodb://localhost:27017/colornest
JWT_SECRET=your_secret_key
PORT=5000
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 3. Seed Initial Data
```bash
npm run seed
```

### 4. Run the Application
```bash
npm start
```

## Admin Credentials
- **Email**: admin@colornest.com
- **Password**: Admin@123

## Structure
- `/backend`: Express API and MongoDB models.
- `/frontend`: React application with premium design.



