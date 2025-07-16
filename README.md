# 🖧 MAC-Based Secure LAN Chat Application

## Secure, Real-time LAN Chat with MAC Address Filtering & Modern Web UI

This project provides a **LAN-based chat system** designed for secure communication, where only **whitelisted devices** (identified by their **MAC addresses**) are permitted to connect and participate in real-time messaging. It combines a robust Python backend with a sleek, interactive React.js frontend to offer an enhanced user experience.

---

## 📌 Features

* **MAC Address Filtering:** Restricts access to the chat system to only pre-approved MAC addresses, ensuring a secure environment.
* **Real-time Messaging:** Facilitates instant, real-time message exchange among connected devices within a local network using WebSockets.
* **Hybrid Architecture:**
    * **Backend:** Python server powered by Flask-SocketIO for efficient WebSocket communication and MAC address authentication.
    * **Frontend:** Modern web-based client developed with React.js (Vite) for a dynamic and responsive user interface.
* **Beautified Dark UI:** Features a dark-themed, aesthetically pleasing interface with subtle animations and depth effects for an engaging user experience.
* **Loopless Topology:** Supports 1:N communication, allowing one server to manage multiple authenticated clients within the LAN.
* **Message Differentiation:** Displays sent messages on the left and received messages on the right for clear conversation flow.

---

## 🏗️ Architecture

### High-Level Overview

The system operates with a central Python server managing connections and message broadcasts, authenticated by a `allowed.txt` whitelist. Clients connect to this server via WebSockets.

```txt
┌──────────────┐        ┌──────────────────┐        ┌──────────────┐
│  Client 1    │  <---> │                  │  <---> │  Client 2    │
│ (React.js)   │        │    Server.py     │        │ (React.js)   │
└──────────────┘        │ (Flask-SocketIO) │        └──────────────┘
                        └──────────────────┘
                                 ▲
                                 │
                        allowed.txt (MAC Filter List)
