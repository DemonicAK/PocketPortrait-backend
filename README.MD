# Pocket Portrait - Backend

A backend service for a finance tracking application that provides APIs for expense management, budget tracking, and user authentication.

## Features

- User authentication and authorization (JWT)
- Expense tracking and management
- Budget creation and monitoring
- Dashboard analytics and reports
- MongoDB integration for primary data
- PostgreSQL (Supabase) integration for analytics
- RESTful API endpoints

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB
- Supabase account for PostgreSQL

## Installation

1. Clone the repository:
```bash
git clone https://github.com/DemonicAK/PocketPortrait-backend.git
cd PocketPortrait-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
```
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# PostgreSQL (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
SUPABASE_DB_URL=your_supabase_db_connection_string

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Expenses
- `GET /api/expenses` - Get all expenses for user
- `GET /api/expenses/transactions` - Get paginated expenses with filters
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/dashboard` - Get dashboard statistics

### Budgets
- `GET /api/budgets` - Get budgets for current month
- `POST /api/budgets` - Create or update budget
- `GET /api/budgets/alerts` - Get budget alerts

### Health Check
- `GET /health` - Server health status

## Database Schema

### MongoDB Collections
- **Users**: User authentication data
- **Expenses**: Transaction records
- **Budgets**: Budget limits and tracking

### PostgreSQL Tables (Supabase)
- **monthly_reports**: Aggregated monthly data
- **user_summaries**: User lifetime statistics

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── mongodb.ts
│   │   └── postgres.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Expense.ts
│   │   └── Budget.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── expenses.ts
│   │   └── budgets.ts
│   ├── types/
│   │   └── index.ts
│   └── server.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Available Categories

- Food
- Rent
- Shopping
- Transport
- Entertainment
- Healthcare
- Other

## Payment Methods

- UPI
- Credit Card
- Debit Card
- Cash
- Net Banking

## Development

### Running the Server
The server will start on the port specified in your `.env` file (default: 5000).

### Database Connections
The application connects to both MongoDB (primary data) and PostgreSQL/Supabase (analytics) on startup.

### Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Environment Setup

1. **MongoDB**: Create a MongoDB Atlas cluster or use local MongoDB
2. **Supabase**: Create a new Supabase project for PostgreSQL
3. **JWT Secret**: Generate a secure random string for JWT signing

## Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the MIT License.
