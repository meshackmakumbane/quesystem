# Real-Time Queue Management System

A real-time queue management system built with TypeScript, Express, and WebSockets that handles ticket generation and broadcasts updates instantly across multiple channels like TV displays, SMS notifications, and voice announcements.

This system is designed for real-world environments like banks, clinics, service centers, and reception desks.

---

## What it does

- Generates and manages queue tickets
- Sends real-time updates to all connected screens
- Displays live queue status on TV dashboards
- Sends SMS notifications to clients
- Supports voice announcements for calling tickets
- Keeps everything synchronized without page refreshes

---

## Tech Stack

- Node.js
- Express.js
- WebSockets (`ws`)
- TypeScript

---

## System Overview

When a ticket is created or updated:

1. The backend generates a ticket
2. The event is broadcast via WebSocket
3. Multiple consumers react:
   - TV Display updates queue UI
   - SMS service sends message to user
   - A ticket is printed out
   - Voice system announces ticket number

Everything happens in real time.

---

## Architecture

Client (Reception)

│
├── Create / manage tickets
│

Backend (Express + TypeScript)

│
├── Ticket Service
├── WebSocket Server
├── Event Broadcaster
│


Event Consumers

├── TV Display Screen
├── SMS Service 
└── Voice Announcement System

---

## Example Event Flow

NEW_TICKET
↓
Broadcast via WebSocket
↓
TV Screen updates queue
↓
SMS sent to client OR Print the ticket
↓
Voice announces ticket number

---

## Key Idea

This project is built around **event-driven real-time communication**.

Instead of manually refreshing or checking for updates, every change is pushed instantly to all connected systems — making queue handling fast, automated, and reliable.

---

## Current Features

- JWT authentication for staff
- Queue priority system
- Multi-branch support
- Persistent database storage
- Admin analytics dashboard

---

## Future Features

- Redis for scaling WebSockets