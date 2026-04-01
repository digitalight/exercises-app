# Physio Tracker

A mobile-first web app for logging and tracking physiotherapy exercises. Self-hosted with Docker.

## Features

- **Daily exercise logging** — Log sets and reps for morning, afternoon, and evening sessions
- **Feeling score** — Rate each exercise session 1–10, plus an overall daily feeling
- **Exercise diagrams** — Upload images showing how to do each exercise
- **Progress history** — Scroll back through past days, view trend charts
- **Admin area** — Add, edit, activate/deactivate exercises
- **Mobile-first UI** — Designed for use on your phone

## Quick Start with Docker

Download the docker-compose.yml

```bash
docker compose up -d
```

Then open **http://localhost:8080** in your browser.

> To change the port, edit `docker-compose.yml` and change `"8080:80"` to `"YOUR_PORT:80"`.

### Data persistence

Exercise and log data is stored in Docker named volumes:

- `physio-data` — SQLite database
- `physio-uploads` — Uploaded exercise images

These survive container restarts and rebuilds.

## Local Development (without Docker)

### Backend

```bash
cd backend
npm install
node src/index.js
# API runs on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# UI runs on http://localhost:3000
```

## Usage

1. **Admin** → Add your physio exercises (name, description, step-by-step instructions, diagram image, default sets/reps)
2. **Today** → Each day, tap each time slot (morning / afternoon / evening) to log sets completed and how it felt (1–10)
3. **Progress** → View your history over 7/14/30/90 days with charts and day-by-day breakdown

## Project Structure

```
exercises-app/
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── db/            # SQLite database setup
│   │   ├── routes/        # API routes
│   │   └── index.js       # Entry point
│   └── Dockerfile
├── frontend/              # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   └── utils/         # API client, helpers
│   ├── nginx.conf         # Production nginx config
│   └── Dockerfile
└── docker-compose.yml
```
