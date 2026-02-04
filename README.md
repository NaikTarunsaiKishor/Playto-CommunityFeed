# 🧵 Playto Community Feed

A high-performance **Community Feed** prototype with threaded discussions, real-time karma gamification, and a dynamic **Top Users Leaderboard (last 24h)** — built with **Django REST Framework + React (Tailwind CSS)**.

This project focuses on **efficient data modeling, concurrency safety, and complex aggregations**, while maintaining a clean, modern UI and excellent developer experience.

---

## 🚀 Live Demo

- **Frontend:** https://your-vercel-link.vercel.app 

---

## 🧠 Key Features

### 📰 Community Feed
- Create and view text posts
- Display author details and live like counts
- Optimized API responses (no N+1 queries)

### 💬 Threaded Comments (Reddit-style)
- Unlimited nested replies
- Efficient tree serialization
- Single optimized DB fetch for entire comment tree

### 🎮 Gamification System
- 👍 Like on **Post** → **+5 Karma**
- 👍 Like on **Comment** → **+1 Karma**
- Karma is tracked as **immutable activity events**, not counters

### 🏆 Dynamic Leaderboard
- Shows **Top 5 users**
- Counts **only karma earned in the last 24 hours**
- Fully calculated using aggregation queries (no cached fields)

---

## 🛠️ Tech Stack

### Backend
- **Python**
- **Django**
- **Django REST Framework**
- **PostgreSQL** (SQLite supported for local dev)

### Frontend
- **React**
- **Next**
- **Tailwind CSS**
- **Axios**
- **Vite**

### Execute Code By this commands
npm run dev ->
pnpm install ->
pnpm run dev
---

## ⚙️ System Design Highlights

### 1️⃣ Nested Comments (No N+1 Problem)

- Comments are stored using a **self-referential ForeignKey**
- All comments for a post are fetched in **one query**
- Tree structure is built **in memory**, not via recursive DB calls

✔️ Loading a post with 50+ nested comments triggers **constant DB queries**

---

### 2️⃣ Concurrency-Safe Likes

- Likes are stored in a separate `Like` table with:
  - `(user_id, post_id/comment_id)` **unique constraints**
- Uses **atomic transactions**
- Prevents double likes even under race conditions

✔️ No karma inflation possible

---

### 3️⃣ Leaderboard (Last 24h Only)

- Karma is derived from a **KarmaEvent / Activity table**
- No `daily_karma` field stored on User
- Uses time-filtered aggregation queries

✔️ Accurate, auditable, and scalable

---

## 📊 Database Models (Simplified)

- **User**
- **Post**
- **Comment** (self-referencing for nesting)
- **Like**
- **KarmaEvent**

Each karma change is recorded as an **event**, ensuring correctness and traceability.

Sample Outcome:
<img width="938" height="439" alt="Screenshot 2026-02-04 155040" src="https://github.com/user-attachments/assets/740928aa-97ad-4f35-8d65-77cfb5eb40e6" />
<img width="302" height="356" alt="Screenshot 2026-02-04 155236" src="https://github.com/user-attachments/assets/4956f8f3-78dd-4b21-a213-3e134985bfa3" />




---

## 🔍 API Endpoints (Sample)

```http
GET    /api/feed/
POST   /api/posts/
POST   /api/comments/
POST   /api/like/
GET    /api/leaderboard/

