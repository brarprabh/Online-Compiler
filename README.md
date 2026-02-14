# 🚀 CodeCorps: A High-Performance Competitive Programming Platform

**CodeCorps** is a full-stack, modular web application designed for developers to solve Data Structures and Algorithms (DSA) problems. It features a real-time C++ code execution engine, a global leaderboard powered by MongoDB aggregation, and a VS Code-inspired professional UI.

## 🛠️ Tech Stack

* **Frontend**: React.js with modular component architecture for scalability.
* **Styling**: Tailwind CSS with custom hex-code integration for UI stability.
* **Backend**: Node.js & Express.js with custom middleware for JWT authentication.
* **Database**: MongoDB Atlas utilizing Aggregation Pipelines for real-time ranking.
* **Icons**: Lucide-React.

## ✨ Key Features

### 1. **Modular Architecture**

The project is refactored into independent, reusable components (`Header`, `Console`, `AuthPage`, `ProfileDashboard`), adhering to industry-standard React patterns.

### 2. **Real-time Global Leaderboard**

Uses high-performance **MongoDB Aggregation Pipelines** to rank users based on unique "Accepted" solutions.

* **Data Integrity**: Employs `$addToSet` to ensure unique problem counts per user.
* **Performance**: Aggregates data at the database layer to minimize network overhead.

### 3. **Secure Code Submission**

* **JWT Authentication**: Protects compiler routes and ensures submissions are linked to the correct user ID.
* **Bcrypt**: Implemented for secure password hashing.

### 4. **User Dashboard**

A personalized profile view calculating **Success Rate** and tracking total platform activity.

## 🏗️ System Architecture

## 🚀 Getting Started

### Prerequisites

* Node.js (v16+)
* MongoDB Atlas Account
* G++ Compiler (for local execution)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/code-corps.git

```


2. **Install Backend Dependencies**:
```bash
cd server && npm install

```


3. **Install Frontend Dependencies**:
```bash
cd client && npm install

```


4. **Environment Variables**:
Create a `.env` file in the server folder:
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key

```


5. **Run the Application**:
```bash
# Terminal 1: Backend
npm start
# Terminal 2: Frontend
npm run dev

```



## 📈 Future Roadmap

* **Rate Limiting**: Implementing `express-rate-limit` for DDoS protection.
* **Problem Categories**: Adding tags for Array, String, and Dynamic Programming filtering.
* **Code Collab**: Real-time collaborative coding rooms.

---
