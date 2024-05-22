# Chat App Server

This is the server-side code for a chat application built with Node.js, Express, Socket.IO, and MongoDB. The application allows users to register, log in, update their status (available or busy), send messages to other users, and receive messages from the server via Socket.IO.

## Features

- User registration and authentication with JWT
- User status management (available or busy)
- Sending and receiving messages between users
- Integration with a large language model (LLM) for automated responses when a user is busy
- Real-time messaging with Socket.IO
- MongoDB for data storage

## Prerequisites

Before running the application, make sure you have the following installed:

- Node.js
- MongoDB (or a MongoDB Atlas cluster)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-repo/chat-app-server.git
```

2. Navigate to the project directory:

```bash
cd chat-app-server
```

3. Install the dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory and add the following environment variables:

```
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
LLM_API_KEY=<your-llm-api-key>
```

Replace the placeholders with your actual MongoDB URI, JWT secret, and LLM API key.

## Usage

1. Start the server:

```bash
npm start
```

The server will start running on `http://localhost:5000`.

2. Use a tool like Postman or cURL to interact with the API endpoints:

- `POST /register` - Register a new user
- `POST /login` - Log in and obtain a JWT token
- `PUT /status` - Update user status (requires authentication)
- `POST /messages` - Send a message to another user (requires authentication)
- `GET /messages/:recipientId` - Retrieve messages with a specific recipient (requires authentication)

3. For real-time messaging, connect to the Socket.IO server from your client application using the `socket.io-client` library. Events include:

- `join`: Join a user's room
- `message`: Receive a new message from another user

## Contributing

Contributions are welcome! If you find any issues or want to add new features, please open an issue or submit a pull request.

