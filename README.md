# 🌟 Lumina

**Lumina** is a full-stack web application designed with a modern, responsive frontend and a REST-based backend architecture. The application provides a seamless user experience with authentication, API-driven functionality, administrative management, and secure payment integration.

🔗 **Live Demo:** https://lumina-app-taupe.vercel.app

---

## 📌 Overview

Lumina follows a client-server architecture where the React frontend communicates with the backend through REST APIs.

The application is designed with a modular structure so that authentication, API communication, business logic, administration, and payment processing remain separated and maintainable.

### High-Level Architecture

```text
                    ┌──────────────────────┐
                    │      Lumina UI       │
                    │   React Frontend     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Axios API       │
                    │   API Service Layer  │
                    └──────────┬───────────┘
                               │
                         HTTP / REST
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Backend Server     │
                    │   REST Controllers   │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
          ┌────────────┐ ┌────────────┐ ┌────────────┐
          │   Auth     │ │  Business  │ │   Admin    │
          │   Logic    │ │   Logic    │ │   APIs     │
          └────────────┘ └────────────┘ └────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Database        │
                    └──────────────────────┘

                               │
                               ▼
                    ┌──────────────────────┐
                    │ Payment Integration  │
                    └──────────────────────┘
```

---

## ✨ Features

### 🔐 Authentication

* User registration and login
* Authentication state management
* Protected routes
* Persistent authentication state
* Token-based API authentication
* Automatic handling of unauthorized requests

### 👤 User Features

* Responsive and modern user interface
* User-specific application functionality
* API-driven data loading
* Form handling and validation
* Error and success notifications
* Secure communication with backend APIs

### 🛠️ Admin Panel

Lumina includes administrative functionality for managing application data and users.

Admin functionality is separated from regular user functionality using role-based access control.

Typical admin operations include:

* Admin authentication
* Viewing application data
* Managing users
* Updating/deleting resources
* Monitoring application activity
* Performing administrative business operations

### 💳 Payment Integration

The application includes a payment flow integrated with the backend.

The general payment flow is:

```text
User
 │
 ▼
Select Product / Plan
 │
 ▼
Frontend
 │
 │  Create Payment Request
 ▼
Backend API
 │
 ▼
Payment Gateway
 │
 ▼
Payment Processing
 │
 ├───────────────┐
 │               │
 ▼               ▼
Success         Failure
 │               │
 ▼               ▼
Backend         Error Response
 │
 ▼
Database Update
 │
 ▼
Frontend Success Page
```

The backend is responsible for validating and processing payment-related requests rather than trusting payment information directly from the frontend.

---

## 🧩 Frontend Architecture

The frontend is built using **React** and follows a component-based architecture.

A simplified structure is:

```text
src/
│
├── components/
│   ├── Navbar
│   ├── Footer
│   ├── Forms
│   └── UI Components
│
├── pages/
│   ├── Home
│   ├── Login
│   ├── Register
│   ├── Dashboard
│   └── Admin
│
├── api/
│   ├── auth.api.js
│   ├── user.api.js
│   ├── admin.api.js
│   └── payment.api.js
│
├── store/
│   └── auth.js
│
├── hooks/
│
├── utils/
│
├── App.jsx
└── main.jsx
```

The exact folder structure may vary depending on the current version of the project.

---

## 🌐 API Layer

Axios is used as the centralized HTTP client.

A typical API configuration follows this pattern:

```javascript
import axios from "axios";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://lumina-app-cg5b.onrender.com"
).replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

Centralizing Axios configuration provides:

* One base URL for API requests
* Consistent headers
* Request timeout handling
* Centralized authentication handling
* Easier environment configuration
* Cleaner API service files

---

## 🔄 API Request Flow

```text
React Component
       │
       ▼
API Service
       │
       ▼
Axios Instance
       │
       ▼
Request Interceptor
       │
       ▼
Backend REST API
       │
       ▼
Controller
       │
       ▼
Business Logic
       │
       ▼
Database
       │
       ▼
JSON Response
       │
       ▼
Axios
       │
       ▼
React Component
       │
       ▼
UI Update
```

---

## 🔑 Authentication Flow

```text
              User
                │
                ▼
          Login / Register
                │
                ▼
          React Frontend
                │
                ▼
          Axios Request
                │
                ▼
          Backend API
                │
                ▼
       Authentication Logic
                │
                ▼
       Validate Credentials
                │
          ┌─────┴─────┐
          │           │
        Valid       Invalid
          │           │
          ▼           ▼
      Token/       Error
      Session      Response
          │
          ▼
    Auth Store / State
          │
          ▼
     Protected Pages
```

---

## 🔒 Protected Routes

Routes that require authentication are protected on the frontend.

Conceptually:

```text
User requests protected page
          │
          ▼
Is user authenticated?
       /       \
     Yes        No
      │          │
      ▼          ▼
  Show page   Redirect
```

Backend APIs also perform authentication/authorization checks so that security does not depend only on frontend route protection.

---

## 👨‍💼 Admin Flow

```text
Admin Login
     │
     ▼
Authentication
     │
     ▼
Role Verification
     │
     ▼
Admin Dashboard
     │
     ├── Users
     ├── Resources
     ├── Management
     └── Application Data
             │
             ▼
        Admin API
             │
             ▼
          Backend
             │
             ▼
          Database
```

Role-based authorization ensures that administrative APIs are not accessible to normal users.

---

## 🛡️ Error Handling

The application handles API failures through centralized request/response handling.

Common cases include:

* Invalid credentials
* Unauthorized requests
* Expired authentication
* Validation errors
* Server errors
* Network failures
* Payment failures

The frontend displays appropriate feedback to users rather than exposing raw backend errors.

---

## 📱 Responsive Design

Lumina is designed to work across different screen sizes:

* 💻 Desktop
* 💻 Laptop
* 📱 Mobile
* 📟 Tablet

The UI uses responsive layouts and reusable components to maintain consistency across the application.

---

## 🧰 Tech Stack

### Frontend

* **React**
* **JavaScript**
* **Axios**
* **CSS / Responsive UI**
* **State Management**

### Backend

* **REST API**
* **Server-side business logic**
* **Authentication & authorization**
* **Database integration**

### Infrastructure

* **Vercel** — Frontend deployment
* **Render** — Backend deployment

### Other

* Git & GitHub
* REST APIs
* Environment variables
* Payment Gateway Integration

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* Git

Check your versions:

```bash
node --version
npm --version
git --version
```

---

## 📥 Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Move into the project directory:

```bash
cd lumina
```

Install dependencies:

```bash
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the frontend project.

Example:

```env
VITE_API_BASE_URL=http://localhost:8080
```

For production:

```env
VITE_API_BASE_URL=https://lumina-app-cg5b.onrender.com
```

> Never commit `.env` files containing secrets or private API keys to GitHub.

---

## ▶️ Run Locally

Start the development server:

```bash
npm run dev
```

The application will generally be available at:

```text
http://localhost:5173
```

---

## 🏗️ Production Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## ☁️ Deployment

### Frontend

The frontend is deployed using **Vercel**.

Production URL:

```text
https://lumina-app-taupe.vercel.app
```

### Backend

The application communicates with the deployed backend through the configured API base URL.

```text
https://lumina-app-cg5b.onrender.com
```

Environment variables should be configured separately in the deployment platform.

---

## 🔗 Frontend ↔ Backend Communication

```text
                Vercel
                  │
                  │ HTTPS
                  ▼
        ┌───────────────────┐
        │ React Application │
        └─────────┬─────────┘
                  │
                Axios
                  │
                  ▼
        ┌───────────────────┐
        │  Render Backend   │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │ Business Logic    │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │     Database      │
        └───────────────────┘
```

---

## 🧪 Testing API Endpoints

API endpoints can be tested using tools such as:

* Postman
* Thunder Client
* cURL
* Browser Developer Tools

Example:

```bash
curl -X GET \
  https://lumina-app-cg5b.onrender.com/api/example
```

Replace the endpoint with the appropriate API route.

---

## 🔐 Security Considerations

Lumina follows several security practices:

* Authentication for protected resources
* Role-based authorization for administrative operations
* Environment variables for configuration
* HTTPS communication in production
* Backend-side validation
* Frontend route protection
* Payment validation through the backend
* Avoiding exposure of sensitive credentials in frontend code

---

## 📊 Project Highlights

### Modular Architecture

Frontend functionality is divided into reusable components, API services, state management, and pages.

### Centralized API Management

Axios provides a single API client instead of creating independent HTTP configurations throughout the application.

### Separation of Responsibilities

The application separates:

```text
UI
 ↓
API Layer
 ↓
Backend
 ↓
Business Logic
 ↓
Database
```

This makes the application easier to maintain and extend.

### Scalable Design

The modular architecture allows additional features and API endpoints to be added without significantly changing existing functionality.

---

## 🧠 Key Learning Outcomes

Developing Lumina provided practical experience with:

* React component architecture
* REST API integration
* Axios interceptors
* Authentication flows
* Protected routes
* State management
* Role-based authorization
* Admin dashboards
* Payment gateway integration
* Frontend-backend communication
* Environment configuration
* API error handling
* Deployment using Vercel and Render
* Debugging full-stack applications

---

## 🔮 Future Improvements

Potential improvements include:

* Automated testing
* Improved application monitoring
* Advanced analytics
* Caching
* Improved API documentation
* Enhanced role and permission management
* CI/CD pipeline
* Performance optimization
* Improved accessibility
* Additional payment methods

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature/your-feature
```

3. Make your changes
4. Commit your changes

```bash
git commit -m "Add your feature"
```

5. Push the branch

```bash
git push origin feature/your-feature
```

6. Open a Pull Request

---

## 📄 License

This project is intended for educational and portfolio purposes.

Add your preferred license here if the repository uses one.

---

## 👨‍💻 Author

**Anshul Rokade**

Full-Stack Developer | Java | Spring Boot | React | REST APIs

---

## 🌐 Live Application

**Lumina:**
https://lumina-app-taupe.vercel.app

---

⭐ If you find this project useful, consider giving the repository a star!
