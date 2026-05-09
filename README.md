<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=Zonnecto&fontSize=80&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Real-Time%20Anonymous%20Chat%20Platform&descAlignY=60&descSize=20" width="100%"/>

<br/>

<img src="https://raw.githubusercontent.com/akshatparate03/Zonnecto/main/frontend/public/Zonnecto%20Banner.jpeg" alt="Zonnecto Banner" width="100%" style="border-radius: 16px;"/>

<br/><br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-zonnecto.netlify.app-7c3aed?style=for-the-badge&logoColor=white)](https://zonnecto.netlify.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Zonnecto-181717?style=for-the-badge&logo=github)](https://github.com/akshatparate03/Zonnecto.git)
[![Instagram](https://img.shields.io/badge/Instagram-@zonnecto-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/zonnecto)
[![YouTube](https://img.shields.io/badge/YouTube-@zonnecto-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/@zonnecto)
[![Telegram](https://img.shields.io/badge/Telegram-@Zonnecto-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/Zonnecto)

<br/>

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=flat-square&logo=redis&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-8B5CF6?style=flat-square)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

---

## 📖 Table of Contents

- [🌟 About Zonnecto](#-about-zonnecto)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [⚡ Tech Stack](#-tech-stack)
- [✨ Core Features](#-core-features)
- [🔐 Security Features](#-security-features)
- [📁 Project Structure](#-project-structure)
- [🗄️ Database Schema](#️-database-schema)
- [🔌 API Endpoints](#-api-endpoints)
- [🚀 Setup & Installation](#-setup--installation)
- [🐳 Docker Setup](#-docker-setup)
- [🔑 Environment Variables](#-environment-variables)
- [🌐 Deployment](#-deployment)
- [⚙️ Performance Optimization](#️-performance-optimization)
- [🛡️ Security Considerations](#️-security-considerations)
- [🔧 Troubleshooting](#-troubleshooting)
- [👨‍💻 Owner](#-owner)
- [📞 Contact & Socials](#-contact--socials)

---

## 🌟 About Zonnecto

<div align="center">
<img src="https://raw.githubusercontent.com/akshatparate03/Zonnecto/main/frontend/public/ZonnectoOrg.png" alt="Zonnecto Logo" width="140"/>
</div>

<br/>

> **Zonnecto** is a production-ready, full-stack **anonymous real-time chat platform** that connects strangers in a safe, moderated environment. Built with Spring Boot, React, WebSocket (STOMP), PostgreSQL, and Redis — it delivers instant messaging, smart matchmaking, a complete friend system, referral programs, and a powerful admin panel — all wrapped in a sleek dark UI.

Whether you're meeting new people anonymously, staying in touch with friends through persistent chats, or managing a community as an admin — Zonnecto has it all.

```
🌍 Live at → https://zonnecto.netlify.app
📧 Contact → zonnecto@gmail.com
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ZONNECTO ARCHITECTURE                     │
├──────────────┬──────────────────┬───────────────────────────┤
│   Frontend   │     Backend      │        Data Layer          │
│  React 18    │  Spring Boot 3   │  PostgreSQL 16 + Redis 7  │
│  Vite 5      │  REST API        │  Neon (Cloud PostgreSQL)  │
│  TailwindCSS │  WebSocket STOMP │  Upstash (Cloud Redis)    │
│  Netlify     │  Render          │                            │
└──────────────┴──────────────────┴───────────────────────────┘
        │               │                      │
        └───────────────┴────────────────────--┘
                    WebSocket + JWT
```

```
Zonnecto/
├── backend/              # Spring Boot 3 REST API & WebSocket
├── frontend/             # React 18 + Vite + TailwindCSS
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

---

## ⚡ Tech Stack

### 🖥️ Backend

| Technology           | Version        | Purpose                        |
| -------------------- | -------------- | ------------------------------ |
| **Java**             | 17 LTS         | Core language                  |
| **Spring Boot**      | 3.2.0          | Application framework          |
| **Spring Security**  | 6.x            | Authentication & authorization |
| **Spring WebSocket** | 6.x            | Real-time STOMP messaging      |
| **Spring Data JPA**  | 3.x            | ORM & database access          |
| **PostgreSQL**       | 16             | Primary relational database    |
| **Redis**            | 7.0            | Caching, queues, OTP storage   |
| **JWT (JJWT)**       | 0.11.5         | Token-based auth               |
| **BCrypt**           | Spring default | Password hashing               |
| **HikariCP**         | Bundled        | Database connection pooling    |
| **Maven**            | 3.9+           | Build & dependency management  |
| **Lombok**           | 1.18.x         | Boilerplate reduction          |
| **Jackson**          | 2.x            | JSON serialization             |

### 🎨 Frontend

| Technology         | Version      | Purpose                 |
| ------------------ | ------------ | ----------------------- |
| **React**          | 18.2.0       | UI component library    |
| **Vite**           | 5.x          | Build tool & dev server |
| **TailwindCSS**    | 3.3.x        | Utility-first styling   |
| **React Router**   | v6.x         | Client-side routing     |
| **Axios**          | 1.x          | HTTP client             |
| **@stomp/stompjs** | 7.x          | WebSocket STOMP client  |
| **SockJS-client**  | 1.x          | WebSocket fallback      |
| **DM Sans / Syne** | Google Fonts | Typography              |
| **Node.js**        | 18+          | Runtime for build tools |

---

## ✨ Core Features

<details>
<summary><b>🎲 Random Matchmaking</b></summary>

- Instantly connect with random strangers worldwide
- Smart preference-based matching (gender, age range, state)
- Daily match limit: **10 matches per user** (tracked via Redis)
- Media sharing unlocks automatically after **5 minutes** of active chat
- Reconnect system — either party can request a reconnect after disconnect
- Queue-based matching with Redis for fast pairing

</details>

<details>
<summary><b>💬 Anonymous Real-Time Messaging</b></summary>

- Full duplex WebSocket chat via STOMP protocol
- Messages persist in PostgreSQL — full history on reconnect
- Text + image/media support in chat
- Message edit & delete (real-time broadcast to both parties)
- Auto-scroll to latest message
- Typing indicators and online status
- Link detection & automatic violation tracking

</details>

<details>
<summary><b>👥 Friend System</b></summary>

- Send friend requests directly from any chat
- Accept / reject incoming requests
- Persistent **FRIEND_CHAT** rooms — never lose your conversation
- Unread message badge count
- Last message preview in friend list
- Photo messages show as "📷 Photo" in preview
- Real-time online/offline status for friends

</details>

<details>
<summary><b>🎁 Referral Program</b></summary>

- Every user gets a unique invite code
- Share code → friend registers → your count goes up
- After **5 successful referrals**: match preferences unlock permanently
- Track referral count from profile dashboard
- Invite codes are single-use and cryptographically generated

</details>

<details>
<summary><b>⭐ Premium Subscription</b></summary>

- Premium plan with enhanced features
- Unlocks advanced match preferences (gender, age, state filters)
- Premium badge visible on profile
- Admin can promote/demote users
- Plan expiry tracking

</details>

<details>
<summary><b>🛡️ Moderation & Safety</b></summary>

- Report abusive messages with reason
- Auto-ban system: **2 violations = permanent ban**
- First violation: **15-day temporary ban**
- Second violation: **permanent ban** + email notification
- Admin dashboard with full chat history for review
- Block users permanently
- Real-time admin broadcast to all online users

</details>

<details>
<summary><b>📊 Admin Dashboard</b></summary>

- Live stats: total users, online now, messages today, premium users
- Registration trend chart (last 30 days) with bar visualization
- User management: search, edit, delete, promote, demote
- Ban management: temporary & permanent bans
- Report review panel with action system
- Chat room monitoring with message history
- Broadcast message to all online users via WebSocket
- Gender distribution, age distribution analytics

</details>

---

## 🔐 Security Features

<details>
<summary><b>🔑 JWT Authentication</b></summary>

- Stateless auth using HS256-signed JWT tokens
- Access token: **1-hour expiry**
- Refresh token: **7-day expiry**, stored in localStorage
- Token verified on every API request via `JwtAuthenticationFilter`
- Auto-logout on 401 (expired/invalid token)
- No logout on 400/403 — keeps user session for incomplete profiles or ban messages

</details>

<details>
<summary><b>🔒 Password Security</b></summary>

- Minimum 8, maximum 16 characters
- Must contain: uppercase, lowercase, digit, special character
- BCrypt hashing with automatic salting
- No plain text storage at any point
- Password reset via secure time-limited token (15 min expiry)

</details>

<details>
<summary><b>🚫 Ban Enforcement</b></summary>

- Ban checked on **every API call** via Spring Security filter
- Active ban check: `is_permanent = true OR expires_at > NOW()`
- Link-sharing auto-ban: 2 violations → permanent
- Admin manual ban with custom duration or permanent
- Ban reason logged with timestamp

</details>

<details>
<summary><b>🛡️ Input Validation & XSS Prevention</b></summary>

- React auto-escapes all rendered content (XSS safe)
- SQL injection prevention via Spring Data JPA parameterized queries
- Email format validation on frontend + backend
- Username uniqueness enforced at DB level (UNIQUE constraint)
- CORS whitelist — only approved origins accepted
- Rate limiting per user via Redis

</details>

<details>
<summary><b>🔏 Data Privacy</b></summary>

- Usernames are never shown in anonymous chat (display name hidden)
- Email never exposed to other users
- All chat history stored securely server-side
- Admin-only access to full chat history
- GDPR compliance architecture ready

</details>

---

## 📁 Project Structure

### Backend

```
backend/
├── src/main/java/com/zonnecto/
│   ├── ZonnectoApplication.java
│   ├── config/
│   │   ├── WebSocketConfig.java        # STOMP broker config
│   │   └── WebMvcConfig.java           # Static resource mapping
│   ├── controller/
│   │   ├── AdminController.java        # Admin dashboard endpoints
│   │   ├── AuthController.java         # Register, login, OTP, reset
│   │   ├── ChatController.java         # Messages, chat rooms, media upload
│   │   ├── FriendsController.java      # Friends list, requests, status
│   │   ├── HealthController.java       # Health check & status page
│   │   ├── MatchingController.java     # Random match queue
│   │   ├── PremiumController.java      # Premium subscription management
│   │   └── UserController.java         # Profile, preferences, invite
│   ├── dto/
│   │   ├── AuthRequest.java
│   │   ├── AuthResponse.java
│   │   ├── MessageDTO.java
│   │   └── UserDTO.java
│   ├── entity/
│   │   ├── Ban.java
│   │   ├── BlockedUser.java
│   │   ├── ChatRoom.java               # RANDOM / FRIEND_CHAT
│   │   ├── Friend.java
│   │   ├── FriendRequest.java
│   │   ├── Message.java
│   │   ├── MessageReadStatus.java
│   │   ├── Report.java
│   │   └── User.java
│   ├── repository/
│   │   ├── BanRepository.java
│   │   ├── BlockedUserRepository.java
│   │   ├── ChatRoomRepository.java
│   │   ├── FriendRepository.java
│   │   ├── FriendRequestRepository.java
│   │   ├── MessageReadStatusRepository.java
│   │   ├── MessageRepository.java
│   │   ├── ReportRepository.java
│   │   └── UserRepository.java
│   ├── security/
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── JwtUtil.java
│   │   └── SecurityConfig.java
│   ├── service/
│   │   ├── AdminService.java
│   │   ├── AuthService.java
│   │   ├── BanService.java
│   │   ├── MatchingService.java
│   │   └── OnlineUserService.java
│   └── websocket/
│       ├── ChatMessageHandler.java
│       ├── WebSocketEventListener.java
│       └── ZonnectoApplication.java
├── src/main/resources/
│   ├── application.yml
│   └── schema.sql
├── uploads/                            # Chat media storage
├── .env                                # Environment variables
├── Dockerfile                          # Production container config
└── pom.xml
```

### Frontend

```
frontend/
├── public/
│   ├── _redirects                      # Netlify SPA routing
│   ├── favicon.ico
│   ├── Zonnecto Banner.jpeg
│   ├── Zonnecto.png
│   ├── ZonnectoOrg.png
│   └── site.webmanifest
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.jsx          # Auth guard with loading state
│   │   └── ZnLayout.jsx                # Shared layout wrapper
│   ├── context/
│   │   ├── AuthContext.jsx             # Auth state, login, logout
│   │   └── WebSocketContext.jsx        # WS connection & subscriptions
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── AdminDashboard.jsx          # Full admin panel
│   │   ├── Chat.jsx                    # Real-time chat UI
│   │   ├── Contact.jsx
│   │   ├── Disclaimer.jsx
│   │   ├── Friends.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Home.jsx                    # Dashboard & matchmaking
│   │   ├── Login.jsx
│   │   ├── Premium.jsx
│   │   ├── Privacy.jsx
│   │   ├── Register.jsx
│   │   ├── ResetPassword.jsx
│   │   └── Terms.jsx
│   ├── utils/
│   │   └── keepAlive.js                # Render cold-start prevention
│   ├── App.jsx                         # Routes + ScrollToTop
│   ├── index.css                       # Global styles
│   └── main.jsx                        # Entry point
├── .env                                # Environment variables
├── index.html
├── package.json
└── vite.config.js
```

---

## 🗄️ Database Schema

### 👤 Users Table

| Column                 | Type           | Description                   |
| ---------------------- | -------------- | ----------------------------- |
| `id`                   | BIGSERIAL PK   | Auto-incremented user ID      |
| `email`                | VARCHAR UNIQUE | User email (login identifier) |
| `password`             | VARCHAR        | BCrypt hashed password        |
| `username`             | VARCHAR UNIQUE | Display name                  |
| `full_name`            | VARCHAR        | Optional full name            |
| `age`                  | VARCHAR        | Age range (18-25, 25-35…)     |
| `bio`                  | TEXT           | User bio                      |
| `interests`            | TEXT           | Comma-separated interests     |
| `dp_url`               | VARCHAR        | Profile picture path          |
| `gender`               | VARCHAR        | MALE/FEMALE/OTHER             |
| `state`                | VARCHAR        | Indian state                  |
| `preferred_gender`     | VARCHAR        | Match preference              |
| `preferred_age`        | VARCHAR        | Age range preference          |
| `preferred_state`      | VARCHAR        | State preference              |
| `is_premium`           | BOOLEAN        | Premium status                |
| `premium_plan`         | VARCHAR        | Plan type                     |
| `premium_expires_at`   | TIMESTAMP      | Plan expiry                   |
| `preference_unlocked`  | BOOLEAN        | Referral unlock status        |
| `daily_matches_used`   | INT            | Daily match counter           |
| `referral_count`       | INT            | Successful referrals          |
| `link_violation_count` | INT            | Link share violations         |
| `created_at`           | TIMESTAMP      | Registration timestamp        |

### 💬 Chat System

| Table        | Key Columns                                                                | Purpose                         |
| ------------ | -------------------------------------------------------------------------- | ------------------------------- |
| `chat_rooms` | `id, user1_id, user2_id, room_type`                                        | RANDOM or FRIEND_CHAT rooms     |
| `messages`   | `id, chat_room_id, sender_id, content, message_type, media_url, timestamp` | All messages with media support |

### 👫 Social Features

| Table             | Key Columns                      | Purpose                             |
| ----------------- | -------------------------------- | ----------------------------------- |
| `friends`         | `user_id, friend_id, created_at` | Confirmed bidirectional friendships |
| `friend_requests` | `sender_id, receiver_id, status` | PENDING/ACCEPTED/REJECTED           |
| `blocked_users`   | `user_id, blocked_user_id`       | Permanent blocks                    |

### 🛡️ Moderation

| Table     | Key Columns                                                  | Purpose        |
| --------- | ------------------------------------------------------------ | -------------- |
| `reports` | `reported_user_id, reported_by_id, reason, status`           | Abuse reports  |
| `bans`    | `user_id, reason, is_permanent, expires_at, violation_count` | Active bans    |
| `invites` | `invite_code, created_by_user_id, used_by_user_id`           | Referral codes |

---

## 🔌 API Endpoints

### 🔑 Authentication — `/api/auth`

| Method | Endpoint                    | Description                                 |
| ------ | --------------------------- | ------------------------------------------- |
| `POST` | `/register`                 | Register new user with optional invite code |
| `POST` | `/login`                    | Login → returns JWT + refresh token         |
| `POST` | `/refresh`                  | Refresh expired access token                |
| `POST` | `/send-otp`                 | Generate OTP for email verification         |
| `POST` | `/verify-otp`               | Verify OTP before completing registration   |
| `POST` | `/forgot-password`          | Generate password reset token               |
| `POST` | `/reset-password`           | Reset password with token                   |
| `GET`  | `/check-username?username=` | Check username availability                 |
| `GET`  | `/check-email?email=`       | Check if email is registered                |

### 👤 User — `/api/user`

| Method | Endpoint        | Description                              |
| ------ | --------------- | ---------------------------------------- |
| `GET`  | `/profile`      | Get current user's full profile          |
| `PUT`  | `/profile`      | Update profile (bio, age, interests, dp) |
| `PUT`  | `/preferences`  | Update match preferences                 |
| `GET`  | `/invite`       | Get or generate invite code              |
| `GET`  | `/active-count` | Get count of online users                |

### 🎲 Matching — `/api/match`

| Method | Endpoint  | Description                       |
| ------ | --------- | --------------------------------- |
| `POST` | `/find`   | Find a random match (joins queue) |
| `POST` | `/cancel` | Cancel match search               |

### 💬 Chat — `/api/chat`

| Method   | Endpoint                     | Description                         |
| -------- | ---------------------------- | ----------------------------------- |
| `GET`    | `/rooms`                     | Get all chat rooms for current user |
| `GET`    | `/messages/{roomId}`         | Get message history for a room      |
| `POST`   | `/report/{messageId}`        | Report an abusive message           |
| `DELETE` | `/messages/{messageId}`      | Delete own message                  |
| `PUT`    | `/messages/{messageId}`      | Edit own message                    |
| `POST`   | `/upload-image/{chatRoomId}` | Upload image to chat                |

### 👥 Friends — `/api/friends`

| Method   | Endpoint              | Description                        |
| -------- | --------------------- | ---------------------------------- |
| `GET`    | `/`                   | Get friends list with last message |
| `POST`   | `/request/{userId}`   | Send friend request                |
| `GET`    | `/requests`           | Get pending friend requests        |
| `POST`   | `/accept/{requestId}` | Accept friend request              |
| `POST`   | `/reject/{requestId}` | Reject friend request              |
| `DELETE` | `/{friendId}`         | Remove a friend                    |
| `POST`   | `/block/{userId}`     | Block a user                       |

### 👑 Admin — `/api/admin`

| Method   | Endpoint              | Description                           |
| -------- | --------------------- | ------------------------------------- |
| `GET`    | `/stats`              | Full dashboard statistics             |
| `GET`    | `/users`              | Paginated user list with search       |
| `PUT`    | `/users/{id}`         | Edit user details                     |
| `DELETE` | `/users/{id}`         | Delete user                           |
| `POST`   | `/users/{id}/ban`     | Ban user (temp or permanent)          |
| `POST`   | `/users/{id}/unban`   | Unban user                            |
| `POST`   | `/users/{id}/promote` | Promote to premium                    |
| `POST`   | `/users/{id}/demote`  | Remove premium                        |
| `GET`    | `/reports`            | Get reports with status filter        |
| `PUT`    | `/reports/{id}`       | Update report status                  |
| `POST`   | `/broadcast`          | Broadcast message to all online users |
| `GET`    | `/chats`              | View all chat rooms                   |
| `GET`    | `/bans`               | View all active bans                  |

### 🔌 WebSocket Topics

| Destination                      | Direction | Purpose                     |
| -------------------------------- | --------- | --------------------------- |
| `/ws/chat`                       | Connect   | SockJS WebSocket endpoint   |
| `/app/chat/{roomId}`             | Send      | Send message to room        |
| `/topic/chat/{roomId}`           | Subscribe | Receive messages in room    |
| `/topic/online-count`            | Subscribe | Live online user count      |
| `/topic/user/{userId}/reconnect` | Subscribe | Personal reconnect requests |
| `/topic/broadcast`               | Subscribe | Admin broadcast messages    |

---

## 🚀 Setup & Installation

### 📋 Prerequisites

| Requirement       | Version | Download                                     |
| ----------------- | ------- | -------------------------------------------- |
| Java JDK          | 17+     | [adoptium.net](https://adoptium.net)         |
| Maven             | 3.9+    | [maven.apache.org](https://maven.apache.org) |
| Node.js           | 18+     | [nodejs.org](https://nodejs.org)             |
| PostgreSQL        | 16+     | [postgresql.org](https://www.postgresql.org) |
| Redis             | 7.0+    | [redis.io](https://redis.io)                 |
| Docker (optional) | 24+     | [docker.com](https://docker.com)             |
| Git               | Any     | [git-scm.com](https://git-scm.com)           |

### 📦 Running Services — Port Reference

| Service               | Port | URL                   |
| --------------------- | ---- | --------------------- |
| Frontend (Vite)       | 5173 | http://localhost:5173 |
| Backend (Spring Boot) | 8080 | http://localhost:8080 |
| PostgreSQL            | 5432 | localhost:5432        |
| Redis                 | 6379 | localhost:6379        |

---

### 🗄️ PostgreSQL Setup Commands

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE zonnecto;
\l   -- list all databases
\c zonnecto   -- connect to database

-- Reset tables if needed (dev only)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

\q
```

---

### 🐳 Docker Setup

```bash
# Start Redis container
docker run -d --name zonnecto-redis -p 6379:6379 redis:7

# Start existing Redis container
docker start zonnecto-redis

# Check running containers
docker ps

# Connect to Redis CLI
docker exec -it zonnecto-redis redis-cli
ping     # Should return PONG
exit

# Start all services (docker-compose)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

### ⚙️ Backend Setup Commands

```bash
# Navigate to backend
cd backend

# Clean previous build
rm -rf target          # Linux/Mac
rm -r -fo target       # Windows PowerShell

# Install dependencies & build
mvn clean install

# Run the application
mvn spring-boot:run "-Dspring-boot.run.jvmArguments=-Duser.timezone=Asia/Kolkata"
```

> Backend starts at → **http://localhost:8080**

---

### 🎨 Frontend Setup Commands

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

> Frontend starts at → **http://localhost:5173**

---

## 🔑 Environment Variables

### Backend — `backend/.env`

```env
# ===== DATABASE (Neon.tech - Cloud PostgreSQL) =====
DB_SSL_MODE=require
DB_HOST=your-neon-host.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# ===== REDIS (Upstash) =====
REDIS_HOST=your-upstash-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_upstash_password
REDIS_SSL=true

# ===== JWT =====
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRATION=3600000
REFRESH_EXPIRATION=604800000

# ===== SERVER =====
PORT=8080
FRONTEND_URL=https://zonnecto.netlify.app
```

### Frontend — `frontend/.env`

```env
# Local development
VITE_API_URL=http://localhost:8080/api
```

### Production Environment Variables (Netlify)

```env
VITE_API_URL=https://zonnecto-backend.onrender.com/api
```

---

## 🌐 Deployment

### 🎨 Frontend → Netlify

```bash
# Build the project
npm run build

# Deploy to Netlify
# 1. Push to GitHub
# 2. Connect repo on netlify.app
# 3. Build command: npm run build
# 4. Publish directory: dist
# 5. Add env variables in Netlify dashboard
#    VITE_API_URL=https://zonnecto-backend.onrender.com/api

# Live URL
https://zonnecto.netlify.app
```

**Netlify `_redirects` file** (in `public/`):

```
/*    /index.html   200
```

---

### ⚙️ Backend → Render

```bash
# 1. Push backend code to GitHub
# 2. Create new Web Service on render.com
# 3. Runtime: Docker
# 4. Dockerfile path: ./backend/Dockerfile
# 5. Add all environment variables in Render dashboard
```

---

### 🗄️ Database → Neon (PostgreSQL)

```bash
# 1. Sign up at neon.tech
# 2. Create a new project
# 3. Copy the connection string
# 4. Update DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in Render env vars
# 5. Neon uses SSL — ensure sslmode=require in JDBC URL
# 6. Use pooler endpoint for better connection management
```

---

### 🔴 Redis → Upstash

```bash
# 1. Sign up at upstash.com
# 2. Create a new Redis database
# 3. Select region closest to your Render backend
# 4. Copy endpoint, port, and password
# 5. Update REDIS_HOST, REDIS_PORT, REDIS_PASSWORD in Render env vars
# 6. Enable REDIS_SSL=true (Upstash requires TLS)
```

---

## ⚙️ Performance Optimization

<details>
<summary><b>🗃️ Database Indexing</b></summary>

- Indexed columns: `user_id`, `email`, `sender_id`, `chat_room_id`
- Composite indexes on `(user1_id, user2_id)` for chat room lookups
- Foreign key indexes auto-created by JPA
- Query optimization via EXPLAIN on hot paths

</details>

<details>
<summary><b>⚡ Redis Caching & Queuing</b></summary>

- Active online user count cached — updated via WebSocket connect/disconnect events
- Daily match limit per user stored as Redis key with TTL (midnight expiry)
- OTP storage in Redis with 10-minute TTL (no DB writes)
- Match queue implemented as Redis list for instant pairing
- Password reset tokens stored in Redis (15-min TTL)

</details>

<details>
<summary><b>🌐 Frontend Optimization</b></summary>

- Vite code splitting — each page loaded as separate chunk
- Lazy image loading for chat media
- Message pagination — only last N messages loaded on open
- Debounced email check (500ms) to reduce API calls
- `useCallback` / `useMemo` on heavy WebSocket callbacks
- CSS-only animations (no JS animation libraries)
- **keepAlive ping** every 1 minute to prevent Render cold start

</details>

<details>
<summary><b>🔌 WebSocket Efficiency</b></summary>

- Single STOMP connection per user (shared via context)
- Personal topics (`/topic/user/{id}/...`) prevent broadcast noise
- Reconnect delay: 5 seconds (STOMP auto-reconnect)
- REST fallback for online count every 15 seconds
- Subscriptions cleaned up on component unmount

</details>

<details>
<summary><b>🏊 Connection Pooling</b></summary>

- HikariCP connection pool (bundled with Spring Boot)
- Pool size configured for Neon free tier limits (max 3 connections)
- Connection timeout and keepalive configured for cloud DB
- `socketTimeout=30` to handle Neon idle connection drops

</details>

---

## 🛡️ Security Considerations

<details>
<summary><b>🔐 JWT Token Security</b></summary>

- HS256 signed tokens — secret never exposed to client
- Short-lived access tokens (1 hour) limit blast radius if stolen
- Refresh token rotation recommended for production
- Token validated on every request via `JwtAuthenticationFilter`
- Principal = userId (Long), Details = email — no extra DB call needed

</details>

<details>
<summary><b>🌐 CORS Configuration</b></summary>

- Only whitelisted origins accepted (no wildcard in production)
- `allowedOriginPatterns("*")` used only for WebSocket SockJS (required for credentials)
- All REST endpoints have explicit CORS config in `SecurityConfig`
- Preflight OPTIONS requests handled automatically

</details>

<details>
<summary><b>💉 Injection Prevention</b></summary>

- All DB queries via Spring Data JPA (parameterized by default)
- No raw SQL string concatenation anywhere
- Input sanitized before storage
- React auto-escapes rendered content (no `dangerouslySetInnerHTML`)

</details>

<details>
<summary><b>📁 File Upload Security</b></summary>

- Image uploads validated by MIME type
- UUID-based filenames (no user-controlled filenames)
- Stored outside webroot where possible
- Max file size enforced (10MB)
- Only image types accepted for chat media

</details>

---

## 🔧 Troubleshooting

<details>
<summary><b>❌ WebSocket connection fails</b></summary>

- Ensure backend is running on port 8080
- Check CORS origins — `FRONTEND_URL` env var must match exactly
- Verify `VITE_API_URL` in frontend `.env`
- In production: use `wss://` (not `ws://`) for HTTPS deployments
- Check browser console for SockJS errors
- Ensure firewall/load balancer allows WebSocket upgrade

</details>

<details>
<summary><b>❌ Database connection error</b></summary>

- Verify PostgreSQL is running: `psql -U postgres`
- Check DB credentials in `.env`
- Ensure database `neondb` exists on Neon dashboard
- For Neon: ensure `sslmode=require` in JDBC URL
- Check HikariCP pool settings — Neon free tier allows max 5 connections

</details>

<details>
<summary><b>❌ Redis connection error</b></summary>

- Start local Redis: `docker start zonnecto-redis`
- Test: `docker exec -it zonnecto-redis redis-cli ping` → should return `PONG`
- For Upstash: verify `REDIS_SSL=true` and correct host/password
- Check port 6379 is not blocked

</details>

<details>
<summary><b>❌ Images not loading in chat</b></summary>

- Ensure `context-path: /api` is set in `application.yml`
- `MEDIA_BASE_URL` in `Chat.jsx` strips `/api` from base URL correctly
- Check `WebMvcConfig.java` maps `/uploads/**` to correct directory
- Verify uploads directory exists and is writable

</details>

<details>
<summary><b>❌ JWT 403 errors on admin panel</b></summary>

- Ensure the user's email matches admin email in `AdminService.java`
- Verify `JwtAuthenticationFilter` passes `List.of(new SimpleGrantedAuthority("ROLE_USER"))` as authorities — null authorities cause `isAuthenticated()` to return false
- Clear localStorage and re-login if token is stale

</details>

<details>
<summary><b>❌ Render backend slow / cold start</b></summary>

- Free tier sleeps after 15 minutes of inactivity
- `keepAlive.js` pings `/api/health` every 1 minute to prevent this
- First request after deploy may take 30-60 seconds — this is normal
- Check Render logs for startup errors

</details>

<details>
<summary><b>❌ Build errors (Maven)</b></summary>

```bash
# Full clean rebuild
rm -rf target
mvn clean install -DskipTests

# Check Java version
java -version   # Must be 17+

# Check Maven version
mvn -version    # Must be 3.9+
```

</details>

---

## 👨‍💻 Owner

<div align="center">

<img src="https://avatars.githubusercontent.com/akshatparate03" alt="Akshat Parate" width="100" style="border-radius: 50%"/>

### **Akshat Parate**

_Full Stack Developer · Designer · Builder_

[![Portfolio](https://img.shields.io/badge/🌐%20Portfolio-akshatparate.netlify.app-7c3aed?style=for-the-badge)](https://akshatparate.netlify.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-akshatparate03-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/akshatparate03)
[![Instagram](https://img.shields.io/badge/Instagram-akshat__parate__2803-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/akshat_parate_2803)
[![GitHub](https://img.shields.io/badge/GitHub-akshatparate03-181717?style=for-the-badge&logo=github)](https://github.com/akshatparate03/Zonnecto.git)

</div>

---

## 📞 Contact & Socials

<div align="center">

### 🌐 Zonnecto Official

| Platform         | Link                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| 🌍 **Website**   | [zonnecto.netlify.app](https://zonnecto.netlify.app)                      |
| 📧 **Email**     | [zonnecto@gmail.com](mailto:zonnecto@gmail.com)                           |
| 📸 **Instagram** | [@zonnecto](https://www.instagram.com/zonnecto)                           |
| ✈️ **Telegram**  | [@Zonnecto](https://t.me/Zonnecto)                                        |
| ▶️ **YouTube**   | [@zonnecto](https://youtube.com/@zonnecto)                                |
| 💻 **GitHub**    | [akshatparate03/Zonnecto](https://github.com/akshatparate03/Zonnecto.git) |

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&animation=twinkling" width="100%"/>

**Built with ❤️ for real-time anonymous communication.**

_Stay safe. Be respectful. Connect freely._

[![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red?style=flat-square)](https://zonnecto.netlify.app)
[![GitHub Stars](https://img.shields.io/github/stars/akshatparate03/Zonnecto?style=flat-square&color=yellow&logo=github)](https://github.com/akshatparate03/Zonnecto)

</div>
