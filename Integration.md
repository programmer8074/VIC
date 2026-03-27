# VisionConnect Frontend Integration Guide

## What Changed

| File                           | Status     | What was done                                                         |
| ------------------------------ | ---------- | --------------------------------------------------------------------- |
| `App.js`                       | ✅ Updated | Wrapped with `<AuthProvider>`, added `<ProtectedRoute>` on dashboards |
| `pages/Login.js`               | ✅ Updated | Phone+password login and biometric login wired to real API            |
| `pages/SignUpUser.js`          | ✅ Updated | Register API called on form submit, password field added              |
| `pages/SignUpVolunteer.js`     | ✅ Updated | Register + volunteer profile creation on submit                       |
| `pages/UserDashboard.js`       | ✅ Updated | Real request creation, past requests shown below form                 |
| `pages/VolunteerDashboard.js`  | ✅ Updated | Real pending requests fetched, accept/start/complete wired            |
| `pages/HomePage.js`            | unchanged  | No changes needed                                                     |
| `pages/RoleSelection.js`       | unchanged  | No changes needed                                                     |
| `components/VoiceAssistant.js` | unchanged  | No changes needed                                                     |

---

## Setup Steps

### 1. Install axios

```bash
npm install axios
```

### 2. Add environment variable

Create `.env` in your React project root:

```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Copy files into your project

Copy everything from this folder into your `src/` directory:

```
src/
├── App.js                          ← replace existing
├── api/
│   ├── Axios.js
│   ├── Auth.js
│   ├── Requests.js
│   └── Volunteers.js
├── context/
│   ├── AuthContext.jsx
│   └── ProtectedRoute.jsx
├── hooks/
│   ├── useLogin.js
│   ├── useRegister.js
│   ├── useRequests.js
│   └── useVolunteerMatch.js
├── pages/
│   ├── HomePage.js
│   ├── RoleSelection.js
│   ├── Login.js                    ← replace existing
│   ├── SignUpUser.js               ← replace existing
│   ├── SignUpVolunteer.js          ← replace existing
│   ├── UserDashboard.js            ← replace existing
│   └── VolunteerDashboard.js       ← replace existing
└── components/
    └── VoiceAssistant.js
```

### 4. Make sure backend is running

```bash
cd backend
npm run dev
```

---

## How Authentication Works

- On login/register, a JWT token is saved to `localStorage`
- `AuthProvider` restores the session on page refresh via `GET /api/auth/me`
- `ProtectedRoute` redirects to `/login` if not authenticated
- `useAuth()` hook gives access to `user`, `login`, `logout`, `register` anywhere

---

## User Flow

```
/ (HomePage)
  → /role-selection
      → /signup-user    → registers → /user-dashboard
      → /signup-volunteer → registers + creates profile → /volunteer-dashboard
  → /login
      → phone+password  → redirects based on role
      → biometric       → redirects based on role
```

---

## Volunteer Dashboard Notes

- Volunteers see all **pending** requests from all users
- Clicking **Accept Request** atomically claims the request via `POST /api/matches/accept`
- Once matched, it moves to **My Active Requests** where volunteer can Start → Complete the trip

---

## Known Limitations (for future improvement)

- No real-time updates — volunteer must click Refresh to see new requests (Socket.io can fix this)
- Coordinates must be entered manually in UserDashboard — a map picker would improve UX
- Biometric token is hardcoded for testing (`test-biometric-token-12345`) — needs real device integration

Add real-time notifications with Socket.io (volunteer accepted, trip started etc.)
Build an admin panel for volunteer verification
Deploy to a cloud provider like Railway or Render
