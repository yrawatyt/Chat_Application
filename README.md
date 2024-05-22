# Chat_Application

This is a real-time chat application built using Node.js, Express, Socket.IO, and MongoDB. It supports user registration, login, real-time messaging, and status updates.

## Features

- User registration and authentication with JWT
- Real-time messaging with Socket.IO
- User status updates (Available, Busy)
- LLM integration to generate responses when a user is busy

## Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- Socket.IO
- JWT (JSON Web Tokens)
- Bcrypt.js
- Axios
- dotenv
- CORS

## Getting Started

### Prerequisites

- Node.js (version 12 or later)
- MongoDB (local or cloud instance)
- npm (Node package manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/your-repository-name.git
   cd your-repository-name
2. Install dependencies:

bash
Copy code
npm install

3. Set up environment variables:
Create a .env file in the root directory and add the following environment variables:
env
Copy code
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
LLM_API_KEY=your_llm_api_key

4. Start the server:
   
node server.js
API Endpoints
Register a User
URL: /register
Method: POST
Body:
{
  "email": "user@example.com",
  "password": "yourpassword"
}

Response:
{
  "message": "User registered successfully"
}

Login a User
URL: /login
Method: POST

Body:
{
  "email": "user@example.com",
  "password": "yourpassword"
}
Response:
{
  "token": "your_jwt_token",
  "temp": "user_id"
}
Update User Status
URL: /status
Method: PUT
Headers:
{
  "Authorization": "Bearer your_jwt_token"
}
Body:
{
  "status": "AVAILABLE" | "BUSY"
}
Response:
{
  "message": "User status updated successfully"
}

Send a Message
URL: /messages
Method: POST
Headers:
{
  "Authorization": "Bearer your_jwt_token"
}
Body:
{
  "recipient": "recipient_user_id",
  "content": "Hello!"
}
Response:
{
  "message": {
    "sender": "sender_user_id",
    "recipient": "recipient_user_id",
    "content": "Hello!",
    "timestamp": "2024-05-23T14:00:00.000Z"
  }
}


Retrieve Messages
URL: /messages/:recipientId
Method: GET
Headers:
{
  "Authorization": "Bearer your_jwt_token"
}
Response:
[
  {
    "sender": "sender_user_id",
    "recipient": "recipient_user_id",
    "content": "Hello!",
    "timestamp": "2024-05-23T14:00:00.000Z"
  },
  ...
]

Socket.IO Events
Connection:

Event: connection
Description: Fired when a user connects.
Join Room:

Event: join
Description: Join the user's room.
Data: userId
Message:

Event: message
Description: Sent to the recipient when a new message is received.
Disconnect:

Event: disconnect
Description: Fired when a user disconnects.
Postman Collection
A Postman collection is included to demonstrate API interaction. You can import hq_collection.json into Postman to get started quickly.


Acknowledgments
Special thanks to the developers and maintainers of the libraries and frameworks used in this project.

### Including the Postman Collection

Make sure to export your Postman collection as a JSON file and save it in your repository. Here's how you can do that:

1. **Open Postman** and create a collection with all your API requests.
2. **Export the collection**:
   - Click on the three dots next to your collection name.
   - Select "Export".
   - Choose "Collection v2.1" and click "Export".
   - Save the file as `hq_collection.json`.
3. **Add the file to your repository**:
   - Place `hq_collection.json` in the root directory of your project.
   - Commit and push the file to your GitHub repository.

### Sharing Your GitHub Repository

To share your repository, simply provide the link to your GitHub repository. The format will be:

https://github.com/your-username/your-repository-name

javascript
Copy code

Replace `your-username` with your GitHub username and `your-repository-name` with the name of your repository.





