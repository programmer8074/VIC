# VisionConnect — Express.js Backend

REST API backend for the VisionConnect platform, serving the React frontend.

## Project Structure

```
src/
├── app.js                  # Express app setup (middleware, routes)
├── server.js               # Entry point — starts server + DB
├── config/
│   └── database.js         # MongoDB connection (ready to wire up)
├── controllers/
│   ├── auth.controller.js      # Register, login, biometric auth
│   ├── user.controller.js      # Profile, settings, trip history
│   ├── volunteer.controller.js # Profile, availability, ratings
│   ├── request.controller.js   # Assistance request CRUD
│   └── match.controller.js     # Find & accept volunteer matches
├── middleware/
│   ├── auth.js             # JWT protect + role restriction
│   ├── errorHandler.js     # Global error handler + 404
│   ├── requestId.js        # Attach X-Request-ID to every request
│   └── validate.js         # express-validator chains
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── volunteer.routes.js
│   ├── request.routes.js
│   └── match.routes.js
└── utils/
    ├── asyncHandler.js     # Wraps async controllers — no try/catch needed
    ├── errors.js           # Typed AppError hierarchy
    └── logger.js           # Structured JSON logger
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env
# Edit .env — set JWT_SECRET and MONGODB_URI

# 3. Run in development
npm run dev

# 4. Run in production
npm start
```

## API Endpoints

### Auth

| Method | Path                           | Description                | Auth   |
| ------ | ------------------------------ | -------------------------- | ------ |
| POST   | `/api/auth/register`           | Register user or volunteer | Public |
| POST   | `/api/auth/login`              | Phone + password login     | Public |
| POST   | `/api/auth/biometric/login`    | Biometric token login      | Public |
| GET    | `/api/auth/me`                 | Get current user           | 🔒     |
| POST   | `/api/auth/biometric/register` | Save biometric token       | 🔒     |

### Users

| Method | Path                     | Description              | Auth |
| ------ | ------------------------ | ------------------------ | ---- |
| GET    | `/api/users/profile`     | Get own profile          | 🔒   |
| PUT    | `/api/users/profile`     | Update language/settings | 🔒   |
| GET    | `/api/users/:id/history` | Trip history             | 🔒   |

### Volunteers

| Method | Path                           | Description               | Auth         |
| ------ | ------------------------------ | ------------------------- | ------------ |
| GET    | `/api/volunteers`              | List available volunteers | Public       |
| GET    | `/api/volunteers/:id`          | Get volunteer profile     | Public       |
| PUT    | `/api/volunteers/profile`      | Set own profile           | 🔒 volunteer |
| PATCH  | `/api/volunteers/availability` | Toggle availability       | 🔒 volunteer |
| POST   | `/api/volunteers/:id/rate`     | Rate a volunteer          | 🔒 user      |

### Assistance Requests

| Method | Path                       | Description        | Auth    |
| ------ | -------------------------- | ------------------ | ------- |
| POST   | `/api/requests`            | Create request     | 🔒 user |
| GET    | `/api/requests`            | List requests      | 🔒      |
| GET    | `/api/requests/:id`        | Get single request | 🔒      |
| PATCH  | `/api/requests/:id/status` | Update status      | 🔒      |
| DELETE | `/api/requests/:id`        | Cancel request     | 🔒 user |

### Matching

| Method | Path                  | Description             | Auth         |
| ------ | --------------------- | ----------------------- | ------------ |
| POST   | `/api/matches/find`   | Find nearby volunteers  | 🔒           |
| POST   | `/api/matches/accept` | Volunteer accepts match | 🔒 volunteer |

## Error Response Format

Every error returns the same shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { "phone": "Must be a valid 10-digit Indian mobile number" },
    "requestId": "uuid-here"
  }
}
```

## Adding MongoDB

1. `npm install mongoose`
2. Uncomment the Mongoose code in `src/config/database.js`
3. Set `MONGODB_URI` in your `.env`
4. Replace the `Map()` mock stores in each controller with Mongoose models

## Connect to the React Frontend

Set in your React `.env`:

```
REACT_APP_API_URL=http://localhost:5000/api
```

Then in fetch calls:

```js
const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ phone, password }),
});
```
