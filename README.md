# 🛋️ ComfortSeatsPK — Luxury Car Seat Covers & Custom Upholstery Platform

![NodeJS](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-v19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Express.js](https://img.shields.io/badge/Express.js-v4.21-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

**ComfortSeatsPK** is a full-stack, enterprise-grade e-commerce application and custom upholstery booking platform designed specifically for automotive seating solutions, custom seat covers, and luxury interior design in Pakistan. 

The platform features a consumer-facing storefront complete with custom seat configuration tools, dynamic vehicle fitting filters, seamless checkout options (COD, JazzCash, EasyPaisa, Direct Bank Transfer with slip verification), and a comprehensive administrative Content Management System (CMS).

---

## 📑 Table of Contents

- [Key Features](#-key-features)
  - [🛍️ Storefront & Customer Experience](#️-storefront--customer-experience)
  - [🎨 Custom Seat Configurator](#-custom-seat-configurator)
  - [⚙️ Comprehensive Admin CMS Dashboard](#️-comprehensive-admin-cms-dashboard)
- [🛠️ Tech Stack & Architecture](#️-tech-stack--architecture)
- [📁 Project Directory Structure](#-project-directory-structure)
- [🚀 Getting Started](#-getting-started)
  - [📋 Prerequisites](#-prerequisites)
  - [🔑 Environment Variables Setup](#-environment-variables-setup)
  - [⚡ Installation & Local Execution](#-installation--local-execution)
  - [👤 Initial Admin User Creation](#-initial-admin-user-creation)
- [📡 API Endpoints Overview](#-api-endpoints-overview)
- [🌐 Deployment](#-deployment)
- [📜 License](#-license)

---

## ✨ Key Features

### 🛍️ Storefront & Customer Experience
* **Dynamic Landing Page**: Modern, animated hero banners, featured categories, trending products, and live announcement header.
* **Interactive Product Catalog**: Instant search, filtering by vehicle make/model/category/price, sorting, and pagination.
* **Rich Product Detail Views**: High-resolution image galleries with zoom, color variation switching, stock status, product specs, and verified customer reviews.
* **Frictionless Checkout**: Multi-option payment workflows including Cash on Delivery (COD), JazzCash, EasyPaisa, and Direct Bank Transfer with file upload for payment proof/receipt.
* **Dynamic SEO Integration**: Automated XML Sitemap generation (`/sitemap.xml`) for catalog items and `react-helmet-async` meta management.

### 🎨 Custom Seat Configurator
* **Bespoke Upholstery Builder**: Allows customers to design custom seat covers by selecting vehicle brand, model, manufacturing year, seating pattern, material grade, color choices, and custom stitching notes.
* **Order Inquiry Pipeline**: Directly submits custom configuration specifications to the admin dashboard for instant quota estimation and fulfillment processing.

### ⚙️ Comprehensive Admin CMS Dashboard
* **Role-Based Protected Portal**: Secure JWT authentication with HTTP-only cookies and bcrypt password encryption.
* **Analytics Overview**: High-level store metrics, order counters, and customer inquiry logs.
* **Catalog Management**: Full CRUD for products, categories, vehicle specifications, pricing, inventory flags, and Cloudinary media uploads.
* **Order Processing**: Real-time status updates (Pending, Processing, Shipped, Delivered, Cancelled), receipt verification for bank/wallet payments.
* **Content & Theme Management**: Dynamic UI controls for hero banners, announcements, site policies, store branding, contact messages, and custom page content.

---

## 🛠️ Tech Stack & Architecture

### **Frontend Client (`/frontend`)**
* **Framework**: [React 19](https://react.dev/)
* **Routing**: [React Router v7](https://reactrouter.com/)
* **Styling**: [Tailwind CSS v3.4](https://tailwindcss.com/) + Custom CSS
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
* **HTTP Client**: [Axios](https://axios-http.com/) (with CORS credentials support)
* **Notifications**: [React Toastify](https://fkhadra.github.io/react-toastify/)
* **SEO**: [React Helmet Async](https://github.com/stayuncurious/react-helmet-async)

### **Backend API Server (`/backend`)**
* **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* **Database & ORM**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
* **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/) & `cookie-parser`
* **Media Cloud**: [Cloudinary SDK](https://cloudinary.com/) with [Multer](https://github.com/expressjs/multer)
* **Email Service**: [SendGrid Mail](https://sendgrid.com/) & [Nodemailer](https://nodemailer.com/)
* **Serverless Compatibility**: Integrated `serverless-http` support for AWS Lambda / Vercel deployment.

---

## 📁 Project Directory Structure

```text
ComfortSeatsPK/
├── backend/
│   ├── config/             # Database connection & third-party configs
│   ├── controllers/        # Express route handlers and business logic
│   ├── middlewares/        # Auth, CORS, Multer upload & error middlewares
│   ├── models/             # Mongoose schemas (Product, Order, Customization, SiteContent, etc.)
│   ├── routes/             # API routes (Auth, Products, Orders, Admin, Sitemap, etc.)
│   ├── services/           # Email & third-party integrations
│   ├── utils/              # Helper utilities & Cloudinary stream uploaders
│   ├── Createadmin.js      # CLI script for seeding initial admin accounts
│   ├── index.js            # Express app entrypoint & middleware pipeline
│   ├── server.js           # HTTP server launcher
│   └── package.json        # Backend dependencies & scripts
│
├── frontend/
│   ├── public/             # Static public assets & favicon
│   ├── src/
│   │   ├── api/            # Axios API instances & request wrappers
│   │   ├── assets/         # Project images, icons, and logos
│   │   ├── components/     # Reusable UI components (Navbar, Footer, ProductCard, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Storefront views (Home, Products, ProductDetail, Customize, Checkout)
│   │   │   └── admin/      # Admin Portal pages (Dashboard, AdminOrders, AdminProducts, etc.)
│   │   ├── routes/         # Protected and public route definitions
│   │   ├── utils/          # Frontend helper functions & formatters
│   │   ├── App.js          # Root application component
│   │   └── index.js        # React DOM initialization
│   └── package.json        # Frontend dependencies & scripts
│
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have the following installed on your system:
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher) or **yarn**
* **MongoDB** (Local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
* **Cloudinary Account** (for handling image uploads)

---

### 🔑 Environment Variables Setup

#### 1. Backend Environment Configuration (`backend/.env`)

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/comfortseatspk?retryWrites=true&w=majority
JWT_SECRET=your_jwt_super_secret_key_here
COOKIE_SECRET=your_cookie_secret_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service Configuration (Nodemailer / SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@comfortseatspk.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
```

#### 2. Frontend Environment Configuration (`frontend/.env`)

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

### ⚡ Installation & Local Execution

#### 1. Clone the repository
```bash
git clone https://github.com/Asad-Zaidi/Comfort-Seats-PK.git
cd Comfort-Seats-PK
```

#### 2. Setup & Run the Backend
```bash
cd backend
npm install
npm run dev
```
> The backend server will start on `http://localhost:5000`.

#### 3. Setup & Run the Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm start
```
> The frontend application will start on `http://localhost:3000`.

---

### 👤 Initial Admin User Creation

To seed an initial administrative user for accessing `/admin`, run the built-in CLI utility in the `backend` directory:

```bash
cd backend
node Createadmin.js
```

You will be prompted to enter:
* **Name**
* **Email**
* **Password** (min. 6 characters)
* **Role** (default: `admin`)

*Alternatively, you can provide environment variables (`ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) to run non-interactively.*

---

## 📡 API Endpoints Overview

| Category | Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/login` | `POST` | Public | Admin login & issue HTTP cookie |
| **Auth** | `/api/auth/logout` | `POST` | Private | Clear session authentication cookie |
| **Products** | `/api/products` | `GET` | Public | Fetch product list with filters |
| **Products** | `/api/products/:id` | `GET` | Public | Fetch product by ID / slug |
| **Products** | `/api/products` | `POST` | Admin | Create product with image uploads |
| **Orders** | `/api/orders` | `POST` | Public | Create new order with receipt slip |
| **Orders** | `/api/orders` | `GET` | Admin | Fetch all orders with filter/status |
| **Orders** | `/api/orders/:id/status`| `PATCH` | Admin | Update order processing status |
| **Customization**| `/api/customizations` | `POST` | Public | Submit custom seat configuration |
| **Site Content** | `/api/site-content` | `GET` | Public | Get CMS banners, themes & policies |
| **Site Content** | `/api/site-content` | `PUT` | Admin | Update CMS section content |
| **Sitemap** | `/sitemap.xml` | `GET` | Public | Dynamic XML sitemap generator |

---

## 🌐 Deployment

### **Frontend Deployment (Vercel / Netlify)**
1. Connect your repository to Vercel or Netlify.
2. Set the root directory to `frontend`.
3. Set build command to `npm run build` and output directory to `build`.
4. Configure environment variable: `REACT_APP_API_URL=https://your-backend-domain.com/api`.

### **Backend Deployment (Render / AWS / Railway)**
1. Deploy the `backend` folder as a Node.js web service.
2. Set build command to `npm install` and start command to `npm start`.
3. Set all backend environment variables (`MONGODB_URI`, `CLOUDINARY_*`, `JWT_SECRET`, etc.).
4. Add your production frontend domain to `allowedOrigins` in `backend/index.js`.

---

## 📜 License

This project is proprietary and built for **Comfort Seats PK**. All rights reserved.

---

<p center>Crafted with ❤️ for Comfort Seats PK</p>
