# Tournament Platform & House Cup Management System

This repository has been streamlined to focus on the core **Spring Boot Backend** and **React Frontend** applications.

---

## Step 1: Switch to a Clean Branch and Remove Unwanted Files

To keep your repository clean and lightweight, run these commands in your terminal to switch to a new branch and remove the unwanted mockup sandbox, mock API server, and Eclipse metadata from Git tracking:

```bash
# 1. Create and switch to a new branch
git checkout -b feature/clean-setup

# 2. Remove unwanted directories from Git tracking (keeps local files intact)
git rm -r --cached backend/.metadata
git rm -r --cached artifacts/mockup-sandbox
git rm -r --cached artifacts/api-server

# 3. Commit the cleanup
git commit -m "chore: clean up repository and keep only core backend and frontend"
```

---

## Step 2: Running the Spring Boot Backend

The backend is a Java Spring Boot application located in `backend/tournament-api`.

1. **Navigate to the backend directory**:
   ```bash
   cd backend/tournament-api
   ```

2. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080` with the context path `/api`.

---

## Step 3: Running the React Frontend

The frontend is a React application located in `artifacts/tournament-platform`.

1. **Navigate to the frontend directory**:
   ```bash
   cd artifacts/tournament-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure the API Endpoint**:
   Create a `.env` file in `artifacts/tournament-platform/` to point directly to your Spring Boot backend:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## How It Works Together

- **CORS Support**: The Spring Boot controller `TournamentController.java` is annotated with `@CrossOrigin`, allowing the React frontend to communicate with the backend without security blocks.
- **Database Seeding**: On startup, the Spring Boot backend automatically seeds initial data (games, houses, and tournaments) if the database is empty, so you can immediately see data on the frontend.
