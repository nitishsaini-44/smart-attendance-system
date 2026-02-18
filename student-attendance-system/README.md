# Smart Attendance System

A modern, AI-powered attendance management system featuring **face recognition** technology. Built with React, Node.js, and Python, this system enables teachers to efficiently manage student attendance through automated facial recognition or manual entry.

## Key Features

### Face Recognition
- **AI-Powered Detection**: Uses InsightFace deep learning model for accurate face recognition
- **Real-Time Processing**: Capture and identify students instantly via webcam
- **Automatic Attendance**: Mark attendance automatically when a face is recognized

### Attendance Management
- **Multiple Input Methods**: Take attendance via face recognition or manual entry
- **Daily Records**: View and manage today's attendance at a glance
- **CSV Export**: Download attendance records for reporting and analysis

### User Management
- **Teacher Authentication**: Secure login with JWT tokens
- **Student Profiles**: Add, edit, and remove student records with photos
- **Teacher Profiles**: Update personal info, upload photos, change passwords

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router |
| **Backend API** | Node.js, Express.js, JWT Authentication |
| **Face Recognition** | Python, Flask, InsightFace, OpenCV |
| **Database** | MongoDB with Mongoose ODM |

## Project Structure

```
smart-attendance/
├── logic/                      # Python Face Recognition Service
│   ├── api_server.py           # Flask API for face recognition
│   ├── models/
│   │   └── insightface_model.py
│   └── requirements.txt
│
└── student-attendance-system/
    ├── client/                 # React Frontend
    │   ├── src/
    │   │   ├── components/     # UI Components
    │   │   │   ├── Attendance/ # Attendance features
    │   │   │   ├── Students/   # Student management
    │   │   │   ├── Auth/       # Authentication
    │   │   │   └── Dashboard/  # Main dashboard
    │   │   ├── services/       # API integration
    │   │   └── context/        # React context
    │   └── package.json
    │
    └── server/                 # Node.js Backend
        ├── src/
        │   ├── controllers/    # Route handlers
        │   ├── models/         # MongoDB schemas
        │   ├── routes/         # API routes
        │   ├── middleware/     # Auth & error handling
        │   └── services/       # Business logic
        └── package.json
```

## Prerequisites

- **Node.js** >= 14.0.0
- **Python** >= 3.8
- **MongoDB** (local or Atlas)
- **Webcam** (for face recognition)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd smart-attendance
```

### 2. Set Up the Node.js Server
```bash
cd student-attendance-system/server
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/attendance_system
JWT_SECRET=your-secret-key
FACE_API_URL=http://localhost:5001
```

### 3. Set Up the React Client
```bash
cd ../client
npm install
```

### 4. Set Up the Face Recognition Service
```bash
cd ../../logic
pip install -r requirements.txt
```

## Running the Application

Start all three services in separate terminals:

**Terminal 1 - Face Recognition API:**
```bash
cd logic
python api_server.py
```

**Terminal 2 - Node.js Server:**
```bash
cd student-attendance-system/server
npm run dev
```

**Terminal 3 - React Client:**
```bash
cd student-attendance-system/client
npm run dev
```

## Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:5000 |
| **Face Recognition API** | http://localhost:5001 |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new teacher |
| POST | `/api/auth/login` | Teacher login |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | Get all students |
| POST | `/api/students` | Add new student |
| DELETE | `/api/students/:id` | Remove student |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance` | Mark attendance |
| GET | `/api/attendance/today` | Get today's records |
| GET | `/api/attendance/download` | Download CSV |

### Face Recognition
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/recognize` | Recognize face from image |
| POST | `/register` | Register new face |

## Usage Guide

1. **Register/Login** as a teacher
2. **Add Students** with their photos for face recognition
3. **Take Attendance** using:
   - Face recognition (automatic)
   - Manual selection
4. **View Records** on the dashboard
5. **Export Data** as CSV for reports

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGO_URI` | MongoDB connection string | localhost:27017 |
| `JWT_SECRET` | Secret for JWT signing | - |
| `FACE_API_URL` | Face recognition service URL | http://localhost:5001 |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.