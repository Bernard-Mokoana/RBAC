# Role-Based Access Control (RBAC) API

A lightweight, modular RESTful API demonstrating Role-Based Access Control (RBAC) built with **Node.js**, **Express 5**, **JSON Web Tokens (JWT)**, and **bcryptjs**.

---

## Table of Contents

- [Overview](#overview)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Role Hierarchy & Permission Matrix](#role-hierarchy--permission-matrix)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
    - [Register User](#register-user)
    - [Login](#login)
  - [Content Management](#content-management)
    - [List Content](#list-content)
    - [Create Content](#create-content)
    - [Delete Content](#delete-content)
  - [Admin Management](#admin-management)
    - [Get All Users](#get-all-users)
- [Project Structure](#project-structure)
- [Security Considerations](#security-considerations)
- [Roadmap](#roadmap)

---

## Overview

This project implements access control where permissions are determined by assigned user roles. Authentication is handled using cryptographically signed JSON Web Tokens (JWT), with passwords securely hashed using `bcryptjs`. Requests to protected endpoints pass through middleware that validates the JWT and checks whether the user's role satisfies the route requirements.

---

## Architecture & Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express 5](https://expressjs.com/)
- **Password Hashing**: [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- **Token Authentication**: [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- **Configuration**: [dotenv](https://www.npmjs.com/package/dotenv)
- **Development Tooling**: [nodemon](https://nodemon.io/)

---

## Role Hierarchy & Permission Matrix

The application defines three roles with tiered access:

| Role | Description |
| :--- | :--- |
| **`user`** | Standard authenticated user. Can browse and view content. |
| **`editor`** | Content creator. Inherits `user` permissions and can create new content. |
| **`admin`** | System administrator. Full system permissions, including deleting content and viewing all user accounts. |

### Endpoint Permissions

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register a new user (`user`, `editor`, or `admin`) |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user and obtain a JWT |
| `GET` | `/api/v1/content` | `user`, `editor`, `admin` | View all published content |
| `POST` | `/api/v1/content` | `editor`, `admin` | Publish new content |
| `DELETE` | `/api/v1/content/:id` | `admin` | Remove an existing content item |
| `GET` | `/api/v1/admin/users` | `admin` | View all registered users (passwords omitted) |

---

## Getting Started

### Prerequisites

- **Node.js**: version `18.x` or higher
- **npm**: version `9.x` or higher

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd RBAC
npm install
```

### Environment Configuration

Copy the example environment file to `.env`:

```bash
cp .env.example .env
```

Ensure `.env` contains your desired configuration:

```env
PORT=3000
JWT_SECRET=your_super_secret_key_change_this_in_production
```

### Running the Application

- **Development Mode** (with hot-reload via Nodemon):
  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

The server will start listening at `http://localhost:3000`. A root health check is available at `GET http://localhost:3000/`.

---

## API Reference

### Authentication

All protected requests require an `Authorization` header formatted as:
```http
Authorization: Bearer <your_jwt_token>
```

---

#### Register User

Creates a new user record. If no valid role is supplied, defaults to `"user"`.

- **URL**: `/api/v1/auth/register`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

**Request Body**:
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "password": "SecurePassword123!",
  "role": "editor"
}
```

**Responses**:
- `201 Created`:
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "1727024500000",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "role": "editor"
    }
  }
  ```
- `400 Bad Request`: `{ "message": "All fields are required" }`
- `409 Conflict`: `{ "message": "Email already registered" }`

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "SecurePassword123!",
    "role": "editor"
  }'
```

---

#### Login

Authenticates user credentials and returns a signed JWT valid for 24 hours.

- **URL**: `/api/v1/auth/login`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

**Request Body**:
```json
{
  "email": "alice@example.com",
  "password": "SecurePassword123!"
}
```

**Responses**:
- `200 OK`:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- `400 Bad Request`: `{ "message": "All fields are required" }`
- `401 Unauthorized`: `{ "message": "Invalid credentials" }`

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePassword123!"
  }'
```

---

### Content Management

#### List Content

Retrieves all content items.

- **URL**: `/api/v1/content`
- **Method**: `GET`
- **Authorization**: `Bearer <token>` (`user`, `editor`, or `admin`)

**Responses**:
- `200 OK`:
  ```json
  {
    "content": [
      { "id": "1", "title": "Getting started with Node.js", "author": "admin" },
      { "id": "2", "title": "Express Middleware Explained", "author": "editor" }
    ]
  }
  ```
- `401 Unauthorized`: `{ "message": "Access denied. No token provided." }`
- `403 Forbidden`: `{ "message": "Invalid or expired token." }`

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/v1/content \
  -H "Authorization: Bearer <TOKEN>"
```

---

#### Create Content

Creates a new content item. Author is automatically set to the authenticated user's email.

- **URL**: `/api/v1/content`
- **Method**: `POST`
- **Authorization**: `Bearer <token>` (`editor` or `admin`)
- **Headers**: `Content-Type: application/json`

**Request Body**:
```json
{
  "title": "Mastering Role-Based Access Control"
}
```

**Responses**:
- `201 Created`:
  ```json
  {
    "message": "Content created",
    "item": {
      "id": "1727024600000",
      "title": "Mastering Role-Based Access Control",
      "author": "alice@example.com"
    }
  }
  ```
- `400 Bad Request`: `{ "message": "Title is required" }`
- `403 Forbidden`: `{ "message": "Access denied. Required role: editor or admin. Your role: user" }`

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/v1/content \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Mastering Role-Based Access Control"}'
```

---

#### Delete Content

Removes a content item by ID.

- **URL**: `/api/v1/content/:id`
- **Method**: `DELETE`
- **Authorization**: `Bearer <token>` (`admin` only)

**Responses**:
- `200 OK`: `{ "message": "Content deleted successfully" }`
- `404 Not Found`: `{ "message": "Content not found" }`
- `403 Forbidden`: `{ "message": "Access denied. Required role: admin. Your role: editor" }`

**cURL Example**:
```bash
curl -X DELETE http://localhost:3000/api/v1/content/1 \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

### Admin Management

#### Get All Users

Retrieves all registered user profiles with passwords stripped.

- **URL**: `/api/v1/admin/users`
- **Method**: `GET`
- **Authorization**: `Bearer <token>` (`admin` only)

**Responses**:
- `200 OK`:
  ```json
  {
    "users": [
      {
        "id": "1727024500000",
        "name": "Alice Smith",
        "email": "alice@example.com",
        "role": "editor"
      }
    ]
  }
  ```
- `403 Forbidden`: `{ "message": "Access denied. Required role: admin. Your role: editor" }`

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/v1/admin/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## Project Structure

```
RBAC/
├── .env                  # Local environment configuration (PORT, JWT_SECRET)
├── .env.example          # Environment variable template
├── package.json          # Node.js project manifest & scripts
├── README.md             # Project documentation
└── src/
    ├── app.js            # Express application bootstrap & route mapping
    ├── data/
    │   └── users.js      # In-memory user data storage & accessor functions
    ├── middleware/
    │   └── auth.js       # JWT verification & role authorization middleware
    └── routes/
        ├── admin.js      # Admin management route handlers
        ├── auth.js       # User registration and authentication handlers
        └── content.js    # Content CRUD route handlers
```

---

## Security Considerations

- **Password Storage**: Passwords are saved only as salted bcrypt hashes (`bcrypt.hash(password, 10)`).
- **Stateless Tokens**: Authentication state is stored in JWTs signed with `JWT_SECRET`. Tokens expire after 24 hours.
- **Principle of Least Privilege**: Users are granted only the minimum permissions required for their role.
- **Sanitized Outputs**: User queries strip password hashes before returning user entities to callers.

---

## Roadmap

- [ ] Transition in-memory arrays to a persistent database (PostgreSQL with Knex/Prisma).
- [ ] Implement refresh token rotation.
- [ ] Add rate limiting using `express-rate-limit`.
- [ ] Add input validation and schema validation with Zod or Joi.
