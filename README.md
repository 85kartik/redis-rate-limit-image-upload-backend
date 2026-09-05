# Backend MVC – Node.js + Express

A simple backend project in **MVC pattern** covering:

- MongoDB + Mongoose (Model)
- Express routes + controllers (View-less API / Controller)
- JWT authentication
- Rate limiting (`express-rate-limit`)
- Image upload with `multer`
- Centralized error handling
- Load balancing (round-robin, Node.js based)

## Folder structure

```
backend-mvc/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── userController.js     # register, login, profile logic
│   └── uploadController.js   # image upload logic
├── middlewares/
│   ├── authMiddleware.js      # JWT route protection
│   ├── rateLimiter.js         # general + auth rate limiters
│   ├── upload.js              # multer config (image only, 5MB limit)
│   └── errorHandler.js        # centralized error responses
├── models/
│   └── userModel.js           # Mongoose User schema
├── routes/
│   ├── userRoutes.js
│   └── uploadRoutes.js
├── uploads/                   # uploaded images land here (gitignored)
├── server.js                  # app entry point
├── start-instances.js         # spawns multiple server.js on different ports
├── loadBalancer.js            # round-robin balancer across those instances
├── .env.example
└── package.json
```

## Setup

```bash
npm install
cp .env.example .env
# then edit .env with your MongoDB URI and JWT secret
```

## Run (single instance)

```bash
npm run dev        # nodemon, auto-restart
# or
npm start
```

Server runs on `http://localhost:3000` by default.

## API Endpoints

| Method | Route                       | Auth required | Description                  |
|--------|------------------------------|----------------|-------------------------------|
| POST   | `/api/users/register`       | No             | Register a new user           |
| POST   | `/api/users/login`          | No             | Login, returns JWT            |
| GET    | `/api/users/profile`        | Yes (Bearer)   | Get logged-in user's profile  |
| POST   | `/api/upload/profile-image` | Yes (Bearer)   | Upload profile image (multer) |

### Example: Register

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"secret123"}'
```

### Example: Login

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}'
```

### Example: Upload image

```bash
curl -X POST http://localhost:3000/api/upload/profile-image \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "image=@/path/to/photo.jpg"
```

Uploaded images are served statically at:
`http://localhost:3000/uploads/<filename>`

## Rate limiting

- **General limiter**: 100 requests / 15 min per IP, applied to all routes.
- **Auth limiter**: 5 requests / 10 min per IP, applied only to `/register` and `/login` to prevent brute-force attempts.

Both are configured in `middlewares/rateLimiter.js`.

## Load balancing

1. Start multiple instances of the app (on ports 3000–3003):
   ```bash
   npm run start:instances
   ```
2. In a separate terminal, start the load balancer (on port 8080):
   ```bash
   npm run start:lb
   ```
3. Send all your requests to `http://localhost:8080` instead of `:3000`. The balancer round-robins requests across the 4 instances and automatically skips any instance that goes down (retries it after 10s).

All instances share the same MongoDB database, so it doesn't matter which instance handles a given request — data stays consistent.

## Notes

- Passwords are hashed with `bcryptjs` before saving.
- JWTs expire after 7 days (`controllers/userController.js`).
- Multer only accepts image files (`jpeg`, `jpg`, `png`, `gif`, `webp`) and rejects anything else, with a 5MB size cap.
- For production, swap the hand-rolled `loadBalancer.js` for **Nginx** or **PM2 cluster mode** — see project notes for config examples.
