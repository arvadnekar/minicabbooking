# MiniCab Backend

## Environment Variables

Create a `.env` file in the `server/` directory with the following variables:
PORT=3000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
## How to run

1. Install dependencies:  
   `npm install`

2. Start the server:  
   `npm run dev` (or `node index.js`)

3. API endpoints:

- `POST /api/auth/register` — Register a new user  
- `POST /api/auth/login` — Login user and get JWT token  
- `GET /api/users/me` — Get current user info (Protected; requires Bearer token)