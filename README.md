# Chat App Frontend

This is the **frontend** of a real-time chat application built with **React.js** and **Socket.IO**. It supports private chats, group chats, and read receipts.

---

## Features

* User authentication (login/register)
* Real-time messaging with **Socket.IO**
* Private and group chats
* Read receipts (shows who has read the message)
* Real-time notifaction
* Responsive design

---

## Technologies Used

* **React.js** (frontend framework)
* **Socket.IO Client** (real-time communication)
* **Chakra UI** (UI components)
* **Axios** (HTTP requests to backend API)
* **React Router** (client-side routing)

---

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd chat-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root with:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

> Replace URLs with your backend server URL if deployed.

---

## Running the App

Start the development server:

```bash
npm start
```

The app will run at [http://localhost:3000](http://localhost:3000).

---

## Socket.IO Setup

* The frontend connects to the backend Socket.IO server defined in `.env`:

```js
import { io } from "socket.io-client";

export const socket = io(process.env.REACT_APP_SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
});
```

* Use `socket.emit` to send events and `socket.on` to receive events.

---

## Project Structure

```
src/
├─ api/          # Axios API calls
├─ components/   # Reusable UI components
├─ context/      # React context (e.g., Auth, Chat)
├─ pages/        # Pages (Home, Chat, Profile)
├─ socket.js     # Socket.IO client instance
├─ App.js
└─ index.js
```

---

## Notes

* Make sure your backend is running and accessible.
* Socket.IO versions on frontend and backend should match (preferably 4.x).
* For production, update `.env` with deployed backend URL.

---

