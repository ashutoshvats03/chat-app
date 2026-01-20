**Project Overview**
A high-performance, real-time messaging platform built with a microservices approach to ensure scalability and reliability. The system handles instant communication, live status tracking, and efficient message delivery through an event-driven design.

**Tech Stack**
Backend: Node.js, Express.js.
Real-time Engine: Socket.IO.
Messaging Queue: RabbitMQ.
Database: MongoDB.
Caching: Redis.
Infrastructure: AWS EC2, Docker.

**System Architecture**
graph TD

    Client[Client Browser/App] -- Socket.IO --> Gateway[Node.js Gateway Service]
    Gateway -- Events --> RabbitMQ{RabbitMQ Message Broker}
    RabbitMQ -- Dispatch --> MsgService[Message Service]
    RabbitMQ -- Dispatch --> PresenceService[Presence Service]
    MsgService -- Cache --> Redis[(Redis Caching)]
    MsgService -- Persist --> MongoDB[(MongoDB)]
    PresenceService -- Live Status --> Redis
    Gateway -- Deployment --> Docker[Docker Containers]
    Docker -- Hosting --> EC2[AWS EC2 Instance]
    
**Data Flow**
Connection: Users connect via Socket.IO for live presence tracking and instant messaging.
Event Handling: When a message is sent, the Node.js/Express.js service pushes an event to RabbitMQ to ensure reliable inter-service communication.
Caching & Persistence: The system checks Redis for quick message retrieval to minimize latency before falling back to MongoDB for long-term storage.
Real-time Update: Once processed, the message is broadcasted back to the recipient via Socket.IO with features like typing indicators.


**Reliability**: To prevent message loss between microservices, RabbitMQ was used to create an event-driven architecture for reliable messaging.
