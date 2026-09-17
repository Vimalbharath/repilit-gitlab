# Tournament Platform & House Cup Management System

This repository contains a complete Tournament Platform and House Cup Management System. It allows organizers to run game tournaments, register players into different Houses (teams), and track points on a live leaderboard.

## Repository Structure

* **artifacts/tournament-platform**: React frontend application.
* **artifacts/mockup-sandbox**: Vite-based sandbox for UI component mockups.
* **artifacts/api-server**: Node.js mock API server for frontend development.
* **backend/tournament-api**: Java Spring Boot backend application.
* **lib/api-client-react**: Generated React API client.
* **lib/api-zod**: Generated Zod validation schemas.

---

## Why is the Repository Large (~30 MB)?

The repository contains committed Eclipse IDE workspace metadata under `backend/.metadata/`. These files contain local IDE history, indexes, and plugin states which are not part of the source code and should not be tracked.

### How to clean up your local repository:
To reclaim space in your local Git history, run the following commands in your terminal:
```bash
# Remove the Eclipse metadata directory from Git tracking without deleting local files
git rm -r --cached backend/.metadata

# Commit the change
git commit -m "chore: remove eclipse metadata from git tracking"
```

---

## Connecting the Frontend to the Spring Boot Backend

Currently, the frontend is configured to point to the mock API server (`artifacts/api-server`). To connect the React frontend to the live Spring Boot backend:

1. **Verify Backend Port**:
   The Spring Boot application runs on `http://localhost:8080` by default.
   
2. **Configure Frontend Environment**:
   In `artifacts/tournament-platform`, create or update your `.env` or configuration file to point to the Spring Boot API:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

3. **CORS Configuration**:
   The Spring Boot controller `TournamentController.java` is already annotated with `@CrossOrigin`, which allows the React frontend (typically running on `http://localhost:5173` or similar) to make API requests without CORS issues.
