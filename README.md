# Family Notes App

A web app where children create notes and parents monitor their progress.

## What it does
Children can create, edit, and delete notes. Parents can view their children's notes (read-only). Role-based authentication with separate dashboards.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB
- Auth: JWT tokens, Role-based access

## Quick Setup

**Prerequisites:** Node.js, MongoDB

**Steps:**
1. Clone repo: `git clone [your-repo-url]`
2. Install deps: `npm install` then `cd backend && npm install`  
3. Start MongoDB service
4. Run app: `npm run dev` (runs both frontend & backend)
5. Open: http://localhost:5173

## Usage
1. Register as Child or Parent
2. Login with credentials
3. Children: Create/manage notes from dashboard
4. Parents: View children's notes after linking accounts

## Features
- Create/edit/delete notes (children only)
- View notes by category and priority
- Mark notes as complete/incomplete
- Parent monitoring dashboard
- Responsive design

## Project Structure
├── backend/ # Express API + MongoDB
├── src/ # React frontend
├── package.json # Frontend deps
└── README.md # This file


## API Routes
- POST /api/register - Sign up
- POST /api/login - Sign in
- GET/POST/PUT/DELETE /api/notes - Notes CRUD
- GET /api/profile - User info

## Troubleshooting
- Backend won't start? Check MongoDB is running
- Connection refused? Backend should run on port 5000
- No styles? Check Tailwind CSS installation

## Contributing
Fork, create feature branch, commit, push, open PR.
