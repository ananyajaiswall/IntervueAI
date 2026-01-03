# IntervueAI Backend

Backend API for the IntervueAI application built with Node.js, Express, and MongoDB.

## Features

- User authentication (signup/login)
- JWT-based authorization
- MongoDB database integration
- Password hashing with bcrypt
- Input validation
- CORS enabled
- Error handling middleware

## Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend root directory (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Change `JWT_SECRET` to a secure random string
   - Adjust other settings as needed

### Running the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`)

## API Endpoints

### Authentication

#### Signup
- **POST** `/api/auth/signup`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "token": "jwt_token_here"
    },
    "message": "User registered successfully"
  }
  ```

#### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "token": "jwt_token_here"
    },
    "message": "Login successful"
  }
  ```

#### Get Current User
- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```

### Health Check
- **GET** `/api/health`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Server is running",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── controllers/
│   │   └── authController.js # Authentication logic
│   ├── middleware/
│   │   ├── auth.js           # JWT verification middleware
│   │   └── validate.js       # Input validation middleware
│   ├── models/
│   │   └── User.js           # User model schema
│   ├── routes/
│   │   └── authRoutes.js     # Authentication routes
│   ├── utils/
│   │   └── generateToken.js  # JWT token generation
│   └── server.js             # Express app entry point
├── .env.example              # Example environment variables
├── .gitignore
├── package.json
└── README.md
```

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Input validation and sanitization
- CORS configuration
- MongoDB injection protection through Mongoose
- Environment variables for sensitive data

## Development

To add new routes or features:

1. Create model in `src/models/`
2. Create controller in `src/controllers/`
3. Create routes in `src/routes/`
4. Register routes in `src/server.js`

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [] // Optional, for validation errors
}
```

## License

ISC
