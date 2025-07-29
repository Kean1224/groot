# All4You Auctioneers Platform

A comprehensive auction platform built with Next.js (frontend) and Express.js (backend).

## Project Structure

```
├── frontend/          # Next.js React frontend
├── backend/           # Express.js API backend  
├── .vscode/          # VS Code configuration
└── README.md         # This file
```

## Development Setup

### Prerequisites
- Node.js (v16 or later)
- npm or yarn

### Environment Configuration

The frontend uses environment variables defined in `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5050
```

### Running the Application

#### Option 1: Run Both Servers Together
```bash
# From VS Code: Ctrl+Shift+P -> "Run Task" -> "Start Both Servers"
```

#### Option 2: Run Servers Separately

**Backend (Port 5000):**
```bash
cd backend
npm install
npm run dev
```

**Frontend (Port 3000):**
```bash
cd frontend
npm install
npm run dev
```

**WebSocket Server (Port 5050):**
Automatically started with the backend server.

### Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api  
- **WebSocket**: ws://localhost:5050
- **File Uploads**: http://localhost:5000/uploads/

## Features

### Authentication & User Management
- User registration with FICA document upload
- JWT-based authentication
- Admin panel for user management
- Password reset functionality

### Auction System
- Create and manage auctions
- Real-time bidding with WebSocket updates
- Auto-bidding system
- Sniper protection (4-minute extensions)
- Staggered lot endings

### Communication
- Email notifications for outbids, wins, approvals
- Real-time WebSocket notifications
- Contact form system

### Financial
- Automatic invoice generation (PDF)
- Buyer's premium (12%) and seller's commission (10%)
- VAT calculations (15%)
- Refund management system

### File Management
- Image uploads for lots
- FICA document handling
- Static file serving

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/session` - Check session

### Auctions
- `GET /api/auctions` - List auctions
- `POST /api/auctions` - Create auction (admin)
- `PUT /api/auctions/:id` - Update auction (admin)
- `DELETE /api/auctions/:id` - Delete auction (admin)

### Lots & Bidding
- `GET /api/lots/:auctionId` - Get auction lots
- `POST /api/lots/:auctionId` - Add lot to auction
- `PUT /api/lots/:auctionId/:lotId/bid` - Place bid
- `PUT /api/lots/:auctionId/:lotId/autobid` - Set auto-bid

### Users
- `GET /api/users` - List users (admin)
- `PUT /api/users/fica/:email` - Approve FICA (admin)
- `PUT /api/users/suspend/:email` - Suspend user (admin)
- `DELETE /api/users/:email` - Delete user (admin)

### Other Services
- `GET /api/ping` - Health check
- `POST /api/contact` - Contact form
- `GET /api/invoices/*` - Invoice management
- `POST /api/refunds/*` - Refund requests

## Database

Currently uses JSON files for data storage:
- `backend/data/users.json` - User accounts
- `backend/data/auctions.json` - Auction data
- `backend/data/invoices.json` - Invoice records
- `backend/data/contact_inbox.json` - Contact messages

## File Uploads

Files are stored in:
- `backend/uploads/lots/` - Lot images
- `backend/uploads/fica/` - FICA documents

## Development Notes

- The frontend uses TypeScript and Tailwind CSS
- The backend uses Express.js with middleware for authentication
- WebSocket server provides real-time updates for bidding
- Email functionality requires SMTP configuration
- Admin credentials: admin@all4you.com / admin123
