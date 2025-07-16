import os
import socket
from flask import Flask, request # <--- ADDED 'request' here
from flask_socketio import SocketIO, emit, send, join_room, leave_room
import threading
from datetime import datetime # <--- Moved to top level

app = Flask(__name__)
# Set a secret key for Flask-SocketIO (important for production)
app.config['SECRET_KEY'] = 'your_secret_key_here'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading') # Allow all origins for development

# Store connected clients' session IDs and their MAC addresses
# Use a dictionary to map sid to mac_address for authenticated clients
authenticated_clients = {}

# Load allowed MAC addresses
# Ensure allowed.txt is in the same directory as server.py
try:
    script_dir = os.path.dirname(__file__)
    allowed_file_path = os.path.join(script_dir, "allowed.txt")
    with open(allowed_file_path, "r") as f:
        allowed_macs = [line.strip().replace("-", ":").lower() for line in f.readlines()]
    print(f"[*] Loaded {len(allowed_macs)} allowed MAC addresses.")
except FileNotFoundError:
    print("[!] Error: allowed.txt not found. Please create it in the server directory.")
    allowed_macs = []

@socketio.on('connect')
def handle_connect():
    # 'request.sid' is available via Flask's request context
    print(f"[*] Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    if sid in authenticated_clients:
        mac = authenticated_clients.pop(sid)
        print(f"[*] Client disconnected: {sid} (MAC: {mac})")
    else:
        print(f"[*] Client disconnected: {sid} (unauthenticated)")

@socketio.on('authenticate')
def handle_authentication(data):
    client_mac = data.get('mac_address', '').strip().replace("-", ":").lower()
    sid = request.sid
    print(f"Client {sid} sent MAC {client_mac}")

    if client_mac in allowed_macs:
        authenticated_clients[sid] = client_mac
        join_room('chat_room') # All authenticated clients join a common room
        emit('access_response', {'status': 'granted', 'message': "Access Granted. Connected to chat."}, room=sid)
        print(f"[*] Client {sid} (MAC: {client_mac}) granted access.")
    else:
        emit('access_response', {'status': 'denied', 'message': "Access Denied. Your MAC is not allowed."}, room=sid)
        print(f"[!] Client {sid} (MAC: {client_mac}) denied access.")
        # Optionally disconnect after sending denial, but allow client to try again
        # disconnect()

@socketio.on('message')
def handle_message(data):
    sid = request.sid
    if sid not in authenticated_clients:
        print(f"[!] Unauthenticated client {sid} tried to send message.")
        return # Ignore messages from unauthenticated clients

    user_mac = authenticated_clients[sid]
    message_content = data.get('message')
    if message_content:
        # Create a message object that includes sender info for the client to differentiate
        msg_payload = {
            'sender_mac': user_mac,
            'message': message_content,
            'timestamp': datetime.now().isoformat()
        }
        print(f"[*] Received message from {user_mac}: {message_content}")
        # Broadcast to all clients in the 'chat_room' except the sender
        emit('message', msg_payload, room='chat_room', skip_sid=sid)

if __name__ == "__main__":
    print("[*] Starting server on port 12345...")
    socketio.run(app, host="0.0.0.0", port=12345, debug=True, allow_unsafe_werkzeug=True) # debug=True for development