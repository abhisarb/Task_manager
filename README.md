# Collaborative Task Manager - Full-Stack Application

A production-ready, full-stack task management application with real-time collaboration features built with modern JavaScript/TypeScript technologies.

## 🚀 Live Demo

- **Frontend**: [Deploy to Vercel/Netlify]
- **Backend API**: [Deploy to Render/Railway]

## 🛠️ Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite** for blazing-fast development
- **Tailwind CSS** for beautiful, responsive UI
- **React Query** (@tanstack/query) for server state management
- **React Router DOM** for navigation
- **React Hook Form** + **Zod** for form validation
- **Socket.io Client** for real-time updates
- **Axios** for HTTP requests

### Backend
- **Node.js** + **Express** with **TypeScript**
- **PostgreSQL** database
- **Prisma ORM** for type-safe database access
- **JWT** (jsonwebtoken) for authentication
- **bcrypt** for password hashing
- **Socket.io** for real-time communication
- **Zod** for DTO validation
- **Jest** for unit testing

## ✨ Features

### Core Functionality
- ✅ **User Authentication**: Secure registration and login with JWT tokens
- ✅ **Task CRUD Operations**: Create, read, update, and delete tasks
- ✅ **Real-Time Collaboration**: Live updates when tasks are created, updated, or assigned
- ✅ **Task Assignment**: Assign tasks to team members with instant notifications
- ✅ **Advanced Filtering**: Filter tasks by status and priority
- ✅ **Sorting**: Sort tasks by due date
- ✅ **User Dashboard**: View tasks assigned to you, created by you, and overdue tasks
- ✅ **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices

### Technical Highlights
- 🏗️ **Clean Architecture**: Service/Repository pattern for maintainability
- 🔒 **Type Safety**: Full TypeScript coverage on both frontend and backend
- ✅ **Input Validation**: Zod schemas for all API endpoints
- 🎨 **Beautiful UI**: Glassmorphism effects, gradient backgrounds, smooth animations
- ⚡ **Optimized Performance**: React Query caching, skeleton loading states
- 🧪 **Unit Tests**: Jest tests for critical business logic

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ database
- **Git** for version control

## 🚀 Local Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd task-manager
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update .env with your PostgreSQL connection string
# DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
# JWT_SECRET=your-super-secret-key

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env
echo "VITE_SOCKET_URL=http://localhost:5000" >> .env

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response: 201 Created
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "user": { ... },
  "token": "jwt-token"
}
```

#### Get Profile
```http
GET /auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Task Endpoints

All task endpoints require authentication via `Authorization: Bearer <token>` header.

#### Create Task
```http
POST /tasks
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README",
  "dueDate": "2024-12-31T23:59:59Z",
  "priority": "HIGH",
  "status": "TODO",
  "assignedToId": "user-uuid" // optional
}

Response: 201 Created
```

#### Get All Tasks
```http
GET /tasks?status=TODO&priority=HIGH&sortBy=dueDate&sortOrder=asc

Response: 200 OK
[
  {
    "id": "uuid",
    "title": "Task title",
    "description": "Task description",
    "dueDate": "2024-12-31T23:59:59Z",
    "priority": "HIGH",
    "status": "TODO",
    "creator": { "id": "uuid", "name": "John Doe", "email": "john@example.com" },
    "assignedTo": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Get Single Task
```http
GET /tasks/:id

Response: 200 OK
```

#### Update Task
```http
PATCH /tasks/:id
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "priority": "URGENT"
}

Response: 200 OK
```

#### Delete Task
```http
DELETE /tasks/:id

Response: 204 No Content
```

#### Dashboard Endpoints
```http
GET /tasks/dashboard/assigned    # Tasks assigned to current user
GET /tasks/dashboard/created     # Tasks created by current user
GET /tasks/dashboard/overdue     # Overdue tasks

Response: 200 OK
[...]
```

## 🏗️ Architecture Overview

### Backend Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Express Server              │
│  ┌──────────────────────────────┐  │
│  │      Middleware Layer        │  │
│  │  - CORS                      │  │
│  │  - Authentication (JWT)      │  │
│  │  - Validation (Zod)          │  │
│  │  - Error Handler             │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │      Controller Layer        │  │
│  │  - Request Handling          │  │
│  │  - Response Formatting       │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │       Service Layer          │  │
│  │  - Business Logic            │  │
│  │  - Authorization Checks      │  │
│  │  - Data Transformation       │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │     Repository Layer         │  │
│  │  - Database Queries          │  │
│  │  - Prisma ORM                │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────┐      ┌──────────────┐
│ PostgreSQL  │      │  Socket.io   │
│  Database   │      │   Server     │
└─────────────┘      └──────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────┐
│         React Application           │
│  ┌──────────────────────────────┐  │
│  │      Pages Layer             │  │
│  │  - Login/Register            │  │
│  │  - Dashboard                 │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │    Components Layer          │  │
│  │  - TaskCard                  │  │
│  │  - ProtectedRoute            │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │      Services Layer          │  │
│  │  - API Client (Axios)        │  │
│  │  - Socket.io Client          │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │    State Management          │  │
│  │  - React Query               │  │
│  │  - Local Storage (Auth)      │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 🔄 Real-Time Communication (Socket.io)

### How It Works

1. **Authentication**: Socket connections are authenticated using JWT tokens
2. **User Rooms**: Each user joins a private room (`user:{userId}`) for targeted notifications
3. **Event Broadcasting**: Task updates are broadcast to all connected clients
4. **Assignment Notifications**: When a task is assigned, the assignee receives an instant notification

### Socket Events

- `task:created` - Broadcast when a new task is created
- `task:updated` - Broadcast when a task is updated
- `task:deleted` - Broadcast when a task is deleted
- `task:assigned` - Sent to specific user when assigned to a task

## 🧪 Running Tests

```bash
cd backend
npm test

# Watch mode
npm run test:watch
```

## 🚀 Deployment

### Backend Deployment (Render/Railway)

1. Create a new web service
2. Connect your GitHub repository
3. Set environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Secret key for JWT
   - `FRONTEND_URL` - Your frontend URL
   - `NODE_ENV=production`
4. Build command: `npm install && npx prisma generate && npm run build`
5. Start command: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. Connect your GitHub repository
2. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Set environment variables:
   - `VITE_API_URL` - Your backend API URL
   - `VITE_SOCKET_URL` - Your backend Socket.io URL

## 🎯 Design Decisions

### Why PostgreSQL?
- **Relational Data Model**: Tasks have clear relationships (user assignments, creator references)
- **ACID Compliance**: Critical for preventing race conditions in task updates
- **Query Performance**: Efficient filtering and sorting with proper indexes
- **Prisma Integration**: Excellent TypeScript support and type-safe queries

### Why React Query?
- **Automatic Caching**: Reduces unnecessary API calls
- **Optimistic Updates**: Instant UI feedback (bonus feature ready)
- **Background Refetching**: Keeps data fresh automatically
- **Better DevTools**: Excellent debugging experience

### Why Service/Repository Pattern?
- **Separation of Concerns**: Business logic separate from data access
- **Testability**: Easy to mock repositories in unit tests
- **Maintainability**: Changes to database don't affect business logic
- **Scalability**: Easy to add caching or switch ORMs

## 📝 Trade-offs & Assumptions

### Trade-offs
1. **Separate Deployment vs Monorepo**: Chose separate deployments for clearer separation and independent scaling
2. **WebSockets vs Polling**: Chose WebSockets for true real-time updates (requires sticky sessions in production)
3. **Client-Side Rendering**: Chose CSR for simpler deployment and better WebSocket integration

### Assumptions
1. All authenticated users can view all tasks (collaborative workspace model)
2. Only task creator can delete tasks
3. Both creator and assignee can update tasks
4. Dates are stored in UTC, displayed in user's local time
5. One assignee per task (not multiple assignees)

## 👥 Contributing

This is an assessment project. For production use, please fork and customize as needed.

## 📄 License

MIT License - feel free to use this project as a learning resource or template for your own applications.

## 🙏 Acknowledgments

Built as part of a Full-Stack Engineering Assessment demonstrating:
- Modern TypeScript best practices
- Clean architecture patterns
- Real-time collaboration features
- Production-ready code quality
