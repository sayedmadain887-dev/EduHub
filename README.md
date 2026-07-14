# EduHub

EduHub is a full-stack educational platform that helps students manage their learning journey — booking study sessions, browsing books and course materials, and staying updated through announcements — while giving admins full control over content management.

## Features

### For Students
- **Authentication** — Secure registration and login with JWT-based session management.
- **Profile Management** — View and update personal information.
- **Center Booking** — Book study sessions and join learning groups.
- **Books** — Browse and request available course books.
- **Materials** — Access study materials and course handouts.
- **Announcements** — Stay updated with real-time announcements and banners across the platform.

### For Admins
- **Content Management** — Create and manage announcements, groups, books, and materials.
- **Activity Logs** — Track administrative actions across the platform.
- **Role-Based Access Control** — Admin-only routes protected at the middleware level.

## Tech Stack

**Backend**
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Bcrypt for password hashing
- Joi for request validation
- Multer for file uploads

**Frontend**
- React.js
- React Router
- Material UI (MUI Icons)
- Axios for API communication

## Security

This project follows industry-standard security practices:

- **Password Hashing** — All passwords are hashed with bcrypt before storage; plaintext passwords are never stored.
- **Input Validation** — Every request body is validated with Joi schemas before reaching business logic, with clear per-field error messages.
- **Strong Password Policy** — Enforces uppercase, lowercase, numeric, and special-character requirements, with granular feedback on which criteria are missing.
- **Rate Limiting** — Auth endpoints and the API as a whole are protected against brute-force and denial-of-service attempts.
- **HTTP Security Headers** — Helmet is used to set secure HTTP headers by default.
- **NoSQL Injection Protection** — express-mongo-sanitize strips malicious operators from user input.
- **HTTP Parameter Pollution Protection** — hpp prevents duplicate query parameter attacks.
- **Request Size Limiting** — JSON body size is capped to mitigate payload-based DoS attacks.
- **CORS Configuration** — Restricts cross-origin requests to trusted client origins only.
- **User Enumeration Prevention** — Generic error messages avoid leaking whether an email is already registered.
- **JWT Authentication** — Stateless, token-based authentication protects private routes.
