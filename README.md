# Practical 5: MongoDB Integration and Schema Design with Mongoose

Task Management backend from Practical 4, now backed by a real MongoDB database via Mongoose.

## Setup

```bash
npm install
npm run seed   # Populates sample tasks into MongoDB (practical5.tasks)
npm run dev    # or: npm start
```

Server runs at `http://localhost:5000`.

## Connecting with MongoDB Compass

1. Open **MongoDB Compass**.
2. In the connection bar, enter:
   ```text
   mongodb://localhost:27017
   ```
   (or `mongodb://127.0.0.1:27017`)
3. Click **Connect**.
4. In the left navigation sidebar, select the database: **`practical5`**.
5. Click on the collection: **`tasks`** to view, filter, or edit all task documents.
6. Open `http://localhost:5000/` in your browser to interactively add, update, and delete tasks and see the changes reflected live in MongoDB Compass.

## Task Schema (`models/Task.js`)

| Field       | Type    | Rules                                      |
|-------------|---------|---------------------------------------------|
| title       | String  | required                                    |
| description | String  | optional                                    |
| completed   | Boolean | default: false                              |
| priority    | String  | enum: `low`, `medium`, `high`; default: `medium` |
| createdAt   | Date    | default: `Date.now`                         |

A `pre('save')` hook trims whitespace from `title` before saving.

## Endpoints

| Method | Route        | Description                          |
|--------|-------------|---------------------------------------|
| GET    | /tasks       | List all tasks                       |
| GET    | /tasks/:id   | Get one task (404 JSON if not found) |
| POST   | /tasks       | Create a task                        |
| PUT    | /tasks/:id   | Update a task                        |
| DELETE | /tasks/:id   | Delete a task                        |

All routes are wrapped in `try/catch` and forward errors to the global
error handler (`middleware/errorHandler.js`), which returns clean JSON
instead of raw Mongoose error objects, e.g.:

```json
{
  "error": "Validation failed",
  "details": ["Title is required"]
}
```

## Testing with Postman

1. **Create:** `POST /tasks` with body `{ "title": "Finish lab report" }`
2. **List:** `GET /tasks`
3. **Get one:** `GET /tasks/<id>` — try a bad id to confirm the 404 JSON response
4. **Update:** `PUT /tasks/<id>` with body `{ "completed": true }`
5. **Delete:** `DELETE /tasks/<id>`
6. **Validation check:** `POST /tasks` with an empty body — confirm you get a 400 with a structured error, not a raw Mongoose stack trace
7. Restart the server and re-run `GET /tasks` to confirm data persisted

## Notes

- `.env` is git-ignored; only `.env.example` is committed.
- Schema validation happens at the Mongoose (application) layer — MongoDB
  itself is schema-less.
