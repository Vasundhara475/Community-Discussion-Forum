# 💬 Community Discussion Forum with Real-Time Chat


A full-stack community platform combining async discussion threads with real-time chat — built with Next.js, NestJS, PostgreSQL, Socket.IO, and Redis. Mirrors modern platforms like Discourse, Discord, and Reddit hybrids.

---

## 🚀 Live Demo

> 🔗 https://www.loom.com/share/c2cb21c0348743be9ee617618ca671e1
---

## 📸 Screenshots

<img width="1920" height="1080" alt="Screenshot (1078)" src="https://github.com/user-attachments/assets/74321ef1-35cf-4c0c-a1ad-c757ad398032" />
<img width="1920" height="1080" alt="Screenshot (1086)" src="https://github.com/user-attachments/assets/d3097827-d073-4a28-aa88-38ea69dc6ea4" />
<img width="1920" height="1080" alt="Screenshot (1091)" src="https://github.com/user-attachments/assets/b0e7d442-a084-4538-b55d-3bbca9bea55a" />
<img width="1920" height="1080" alt="Screenshot (1092)" src="https://github.com/user-attachments/assets/6cef758d-8a4b-48a7-a858-b1ce3dc56a00" />

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login/register with role-based access (Admin / Mod / Member)
- 📝 **Discussion Posts** — Create, edit, delete posts with Markdown support
- 💬 **Threaded Comments** — Nested replies on discussions
- 👍 **Voting System** — Upvote / downvote on posts and comments
- 🏷️ **Categories & Tags** — Organize discussions with categories and tags
- 💻 **Real-Time Chat** — Public channels and Direct Messages via Socket.IO
- 🟢 **Presence & Typing** — Online indicators and live typing status
- 🔔 **Notifications** — Alerts for mentions, replies, and DMs
- 🔍 **Full-Text Search** — Fast search powered by Meilisearch
- 🚩 **Moderation Tools** — Flag content, review queue, approve/reject
- 📅 **Daily Digest** — Scheduled digest emails via BullMQ
- 🐳 **Dockerized** — Full Docker Compose setup for all services

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Backend API | NestJS, Prisma ORM |
| Database | PostgreSQL 16 |
| Real-Time | Socket.IO, Redis Pub/Sub |
| Search | Meilisearch |
| Background Jobs | BullMQ |
| Authentication | JWT, bcrypt.js |
| Containerization | Docker, Docker Compose |

---

## 📁 Folder Structure

```
Community-Discussion-Forum/
│
├── apps/
│   ├── web/                        # Next.js Frontend
│   │   ├── app/
│   │   │   ├── page.tsx            # Home feed
│   │   │   ├── chat/
│   │   │   │   └── page.tsx        # Real-time chat
│   │   │   └── post/[id]/
│   │   │       └── page.tsx        # Post detail + comments
│   │   ├── components/
│   │   │   ├── PostCard.tsx
│   │   │   ├── CommentThread.tsx
│   │   │   ├── ChatWindow.tsx
│   │   │   └── Notifications.tsx
│   │   └── package.json
│   │
│   ├── api/                        # NestJS Backend
│   │   ├── prisma/
│   │   │   └── schema.prisma       # Database schema
│   │   └── src/
│   │       ├── auth/               # JWT auth module
│   │       ├── posts/              # Discussion CRUD
│   │       ├── comments/           # Threaded comments
│   │       ├── votes/              # Upvote / downvote
│   │       ├── search/             # Meilisearch integration
│   │       ├── notify/             # Notifications + webhooks
│   │       ├── moderation/         # Flags + review queue
│   │       └── jobs/               # BullMQ digest worker
│   │
│   └── ws/                         # Socket.IO Gateway
│       └── src/
│           └── server.ts           # Real-time server
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js v18+
- Docker + Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Vasundhara475/Community-Discussion-Forum.git
cd Community-Discussion-Forum
```

### 2. Start Infrastructure (PostgreSQL, Redis, Meilisearch)

```bash
docker-compose up -d db redis meili
```

### 3. Setup the Backend API

```bash
cd apps/api
npm install
npx prisma migrate dev
npm run start:dev
```

### 4. Setup the WebSocket Gateway

```bash
cd apps/ws
npm install
npm run dev
```

### 5. Setup the Frontend

```bash
cd apps/web
npm install
npm run dev
```

### 6. Open in Browser

```
Frontend:     http://localhost:3000
Backend API:  http://localhost:3001
WebSocket:    http://localhost:4001
Meilisearch:  http://localhost:7700
```

---

## ⚙️ Environment Variables

Create a `.env` file in `apps/api/` based on `.env.example`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/forum
JWT_SECRET=your-secret-key
MEILI_HOST=http://localhost:7700
REDIS_URL=redis://localhost:6379
PORT=3001
```

Create a `.env.local` file in `apps/web/`:

```env
NEXT_PUBLIC_API=http://localhost:3001
NEXT_PUBLIC_WS=http://localhost:4001
```

> ⚠️ Never commit `.env` files. Only `.env.example` should be in the repo.

---

## 📡 API Endpoints

### Auth Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT |
| GET | `/auth/me` | Get current user profile |

### Post Routes (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts?page=1&tag=js` | List posts with filters |
| POST | `/posts` | Create new discussion post |
| GET | `/posts/:id` | Get single post |
| PUT | `/posts/:id` | Update post |
| DELETE | `/posts/:id` | Delete post |
| POST | `/posts/:id/vote` | Upvote or downvote |

### Comment Routes (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/comments` | Add comment or nested reply |
| PUT | `/comments/:id` | Edit a comment |
| DELETE | `/comments/:id` | Delete a comment |

### Search & Notification Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search/posts?q=query` | Full-text search posts |
| GET | `/notifications` | Get user notifications |

### Moderation Routes (Mod / Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/moderation/flag` | Flag a post or comment |
| GET | `/moderation/queue` | View moderation queue |
| POST | `/moderation/resolve/:id` | Approve or reject a flag |

---

## 🔌 Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `room:join` | Client → Server | Join a chat room |
| `room:leave` | Client → Server | Leave a chat room |
| `message:send` | Client → Server | Send a message |
| `message:new` | Server → Client | Broadcast new message |
| `typing` | Client → Server | Send typing indicator |
| `presence:join` | Client → Server | Join presence channel |

---

## 🗃️ Database Schema (Prisma)

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      Role     @default(MEMBER)
  createdAt DateTime @default(now())
}
```

### Post Model
```prisma
model Post {
  id         String   @id @default(cuid())
  authorId   String
  categoryId String
  title      String
  contentMd  String
  score      Int      @default(0)
  createdAt  DateTime @default(now())
}
```

### Message Model
```prisma
model Message {
  id        String   @id @default(cuid())
  roomId    String
  authorId  String
  text      String?
  type      MsgType  @default(TEXT)
  createdAt DateTime @default(now())
}
```

---

## 🔄 User Workflow

```
Register / Login
      ↓
Browse Community Feed
      ↓
Create Discussion Post
      ↓
Other Users Comment & Vote
      ↓
Join Real-Time Chat Channel
      ↓
Send & Receive Live Messages
      ↓
Get Notified on Mentions & Replies
      ↓
Moderators Review Flagged Content
```

---

## 🚢 Deployment

### Run Everything with Docker

```bash
docker-compose up --build
```

### Frontend → Vercel

```bash
cd apps/web && npm run build
# Connect GitHub repo on vercel.com
```

### Backend → Render

1. Push to GitHub
2. New Web Service on [render.com](https://render.com)
3. Build command: `npm install`
4. Start command: `npm run start:prod`
5. Add environment variables in Render dashboard

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 👩‍💻 Author

**Vasundhara**
- GitHub: [@Vasundhara475](https://github.com/Vasundhara475)
- LinkedIn: www.linkedin.com/in/vasundhara-suryawanshi
- Portfolio: [your-portfolio.com](https://your-portfolio.com)

---

> ⭐ If you found this project helpful, please give it a star on GitHub!
