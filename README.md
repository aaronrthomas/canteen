# 🍽️ Canteen — College Food Ordering System

A full-stack college canteen management and food ordering platform built with **Next.js** (frontend) and **Java Spring Boot** (backend API), backed by **PostgreSQL**.

---

## 🏗️ Architecture

```
micro-canteen/
├── web/          → Next.js 15 frontend (http://localhost:3000)
└── api/          → Spring Boot REST API (http://localhost:8080)
```

**Flow:** Browser → Next.js pages (React) → Spring Boot REST API → PostgreSQL

---

## ✨ Features

### Students
- Browse & search menu with filters (category, veg, price sort)
- Food detail page with ingredients & allergens
- Cart with quantity controls & pickup time selection
- Checkout with mock payment (UPI / Card / Cash)
- Real-time order tracking with status timeline
- Order history & reorder

### Staff
- Kanban board for order management (New → Accepted → Preparing → Ready → Completed)
- Live auto-refresh every 15 seconds
- Menu management (add, edit, delete, toggle availability)

### Admin
- Dashboard with live analytics
- User management with role assignment
- Full order history with status filter
- Category management
- Menu management

---

## 🛠️ Tech Stack

| Layer      | Technology                                 |
|------------|---------------------------------------------|
| Frontend   | Next.js 15, TypeScript, Tailwind CSS        |
| State      | Zustand (cart + auth)                       |
| HTTP       | Axios with JWT interceptors                 |
| Backend    | Java 17, Spring Boot 3.2                   |
| ORM        | Spring Data JPA / Hibernate                 |
| Security   | Spring Security + JWT (jjwt)                |
| Database   | PostgreSQL                                  |
| Build      | Maven (backend), npm (frontend)             |

---

## 📋 Prerequisites

- **Java 17+** (download: https://adoptium.net)
- **Maven 3.9+** (download: https://maven.apache.org/download.cgi)
- **Node.js 18+** (download: https://nodejs.org)
- **PostgreSQL 14+** (download: https://www.postgresql.org/download)

---

## 🗄️ Database Setup

1. Start PostgreSQL and connect with psql or pgAdmin
2. Create the database:
```sql
CREATE DATABASE canteen_db;
```

---

## ⚙️ Environment Variables

### Backend (`api/`)
Copy and edit `api/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/canteen_db
    username: postgres
    password: postgres
app:
  jwt:
    secret: your-256-bit-secret-key-here
    expiration: 86400000
```

Or set environment variables:
```
DB_URL=jdbc:postgresql://localhost:5432/canteen_db
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your-super-secret-key
```

### Frontend (`web/`)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## 🚀 Running the Project

### 1. Start the Backend (Spring Boot)
```bash
cd api
mvn spring-boot:run
# OR on first run (downloads maven if needed):
./mvnw spring-boot:run
```
Backend starts on: **http://localhost:8080**

### 2. Start the Frontend (Next.js)
```bash
cd web
npm install
npm run dev
```
Frontend starts on: **http://localhost:3000**

---

## 🌱 Seed Data (Auto-loaded on first start)

The backend automatically seeds on first run if the database is empty.

### Default Login Credentials

| Role    | Email                  | Password     |
|---------|------------------------|--------------|
| Admin   | admin@canteen.edu      | admin123     |
| Staff   | staff1@canteen.edu     | staff123     |
| Staff   | staff2@canteen.edu     | staff123     |
| Student | aaron@college.edu      | student123   |
| Student | ananya@college.edu     | student123   |
| Student | rahul@college.edu      | student123   |

*(10 student accounts total, all use password: `student123`)*

---

## 📡 API Documentation

Base URL: `http://localhost:8080/api`

### Auth (Public)
| Method | Endpoint          | Description    |
|--------|-------------------|----------------|
| POST   | /auth/register    | Register       |
| POST   | /auth/login       | Login → JWT    |

### Food (GET public, POST/PUT/DELETE requires STAFF/ADMIN)
| Method | Endpoint                        | Description             |
|--------|---------------------------------|-------------------------|
| GET    | /food                           | List all (with filters) |
| GET    | /food/{id}                      | Get single item         |
| POST   | /food                           | Create food item        |
| PUT    | /food/{id}                      | Update food item        |
| DELETE | /food/{id}                      | Delete food item        |
| PATCH  | /food/{id}/toggle-availability  | Toggle availability     |

### Categories (GET public, POST/PUT/DELETE requires ADMIN)
| Method | Endpoint            | Description      |
|--------|---------------------|------------------|
| GET    | /categories         | List all         |
| POST   | /categories         | Create category  |
| PUT    | /categories/{id}    | Update category  |
| DELETE | /categories/{id}    | Delete category  |

### Orders (Requires STUDENT auth)
| Method | Endpoint      | Description        |
|--------|---------------|--------------------|
| POST   | /orders       | Place new order    |
| GET    | /orders       | My order history   |
| GET    | /orders/{id}  | Get order details  |

### Staff (Requires STAFF/ADMIN)
| Method | Endpoint                       | Description          |
|--------|--------------------------------|----------------------|
| GET    | /staff/orders                  | Active orders        |
| GET    | /staff/orders/all              | All orders           |
| PUT    | /staff/orders/{id}/status      | Update order status  |

### Admin (Requires ADMIN)
| Method | Endpoint                  | Description       |
|--------|---------------------------|-------------------|
| GET    | /admin/dashboard          | Analytics stats   |
| GET    | /admin/users              | All users         |
| GET    | /admin/orders             | All orders        |
| PATCH  | /admin/users/{id}/role    | Change user role  |

---

## 🔐 Security

- **JWT** tokens expire after 24 hours (configurable)
- **BCrypt** password hashing (strength 10)
- **CORS** configured for `localhost:3000` and `localhost:5173`
- Role-based access: STUDENT < STAFF < ADMIN
- Prices/totals are **always calculated server-side** (never trusted from frontend)

---

## 🧪 Primary User Flow

```
Register/Login → Browse Menu → Add to Cart → 
Checkout → Mock Payment → Order Placed (#CN1234) →
Track Order → Staff Accepts → Staff Prepares →
Staff Marks Ready → Student Collects → Completed
```

---

## 📁 Project Structure

```
api/src/main/java/com/canteen/
├── controller/     → REST controllers
├── service/        → Business logic
├── repository/     → JPA repositories
├── entity/         → JPA entities (User, FoodItem, Order, etc.)
├── dto/            → Request/Response DTOs
├── security/       → JWT filter, UserDetailsService
├── config/         → SecurityConfig, DataSeeder
└── exception/      → ApiException, GlobalExceptionHandler

web/app/
├── login/          → Login page
├── register/       → Registration page
├── student/        → Student pages (home, menu, cart, checkout, orders, profile)
├── staff/          → Staff pages (dashboard, orders Kanban, menu, profile)
└── admin/          → Admin pages (dashboard, users, orders, menu, categories)
```
