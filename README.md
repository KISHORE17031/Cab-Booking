# RideReady — Premium Full-Stack Cab Booking & Dispatch System

RideReady is a high-fidelity, enterprise-grade MERN (MongoDB, Express, React, Node.js) cab booking and real-time fleet dispatch application. Featuring futuristic HSL animations, a 3D isometric city-grid simulation, native Web Speech AI voice bookings, and adaptive light/dark themes.

## 🚀 Live Links & Repository

*   **Production Live Website:** [https://cab-booking-client.onrender.com](https://cab-booking-client.onrender.com)
*   **Production API Server:** [https://cab-booking-g8dt.onrender.com](https://cab-booking-g8dt.onrender.com)
*   **GitHub Repository:** [https://github.com/Harikrishna7274/Cab-Booking](https://github.com/Harikrishna7274/Cab-Booking)
*   **Release Version:** `v1.0.0`

---

## 💎 Core Features

### **1. Futuristic UI & Immersive Animations**
*   **3D City Grid Map:** Revolving isometric wireframe city rendered at 60 FPS on HTML5 Canvas.
*   **Interactive Particle Backdrop:** Mouse-reactive neural network nodes drifting and connecting.
*   **Physics-Based Transitions:** Card and button micro-interactions utilizing custom cubic-bezier animations.
*   **Dual-Theme Engine:** High-contrast light (Mobility Indigo) and dark (Obsidian Gold) themes meeting WCAG AAA accessibility standards.

### **2. AI & Advanced User Experience**
*   **AI Voice Booking Assistant:** Dictate pickup and destination addresses using the native Web Speech API (`webkitSpeechRecognition`).
*   **Surge-Pricing Visualizer:** Real-time supply/demand pricing curve rendering.
*   **Live Telemetry HUD:** Speedometers fluctuating between 55 and 68 km/h in transit.
*   **AI Travel Copilot Chat:** An overlay assistant answering fare, speed, and ETA queries.

### **3. Driver Console & Admin HUD**
*   **Audio Dispatch Alert:** Web Audio Context chime sound alerts drivers of new dispatches.
*   **Admin Fleet Registry:** Real-time online, offline, busy, and available driver tallies.

---

## 🛠️ Technology Stack
*   **Frontend:** React.js (Vite), Bootstrap 5, Custom CSS Variables & Canvas context
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB Atlas (Cloud)
*   **Process Management:** PM2 & Render Web Services

---

## 📦 Local Installation & Setup

### **1. Prerequisites**
Ensure you have Node.js (v18+) and MongoDB installed locally.

### **2. Backend Setup**
```bash
cd server
npm install
# Create a .env file and add:
# PORT=8000
# MONGO_URI=mongodb://127.0.0.1:27017/ucab
# JWT_SECRET=your_secret_key
npm run dev
```

### **3. Frontend Setup**
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Production Cloud Deployment (Render)

### **1. Backend (Web Service)**
*   **Build Command:** `npm install`
*   **Start Command:** `npm start`
*   **Root Directory:** `server`
*   **Environment Variables:** Add `MONGO_URI`, `JWT_SECRET`, and `NODE_ENV=production`.

### **2. Frontend (Static Site)**
*   **Build Command:** `npm install && npm run build`
*   **Publish Directory:** `dist`
*   **Root Directory:** `client`
