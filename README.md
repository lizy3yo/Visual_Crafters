# Visual Crafter Solutions

A full-stack web application for Visual Crafter Solutions — a professional graphic design studio. The platform serves two audiences: a public-facing client portal for browsing services and submitting design requests, and a private admin dashboard for managing those requests, reservations, templates, and financial records.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Features](#features)

---

## Overview

Visual Crafter Solutions provides branding, logo design, marketing materials, presentations, and custom design services. This application handles the full client lifecycle — from initial service discovery and request submission, through reservation scheduling, to transaction recording — with real-time updates delivered via Server-Sent Events (SSE).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | MongoDB via Mongoose |
| Cache / Pub-Sub | Redis (ioredis, Upstash) |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| File Storage | Cloudinary |
| Email | Nodemailer |
| UI Icons | Lucide React |
| Runtime | Node.js |

---

## Project Structure

```
app/
  landing_page/       # Public-facing client portal
    _components/      # Shared layout components (header, footer, icon runway)
    templates/        # Design showcase and template browser
    request/          # Client request submission form
    services/         # Services overview
    contact/          # Contact information
  admin/              # Protected admin dashboard
    dashboard/        # Overview with live stats and income chart
    client_request/   # Incoming design request management
    template_manager/ # Template CRUD and publishing
    reservations/     # Calendar and service queue
    transactions/     # Payment and income records
  api/                # Next.js Route Handlers (REST + SSE)
    admin/            # Admin-only endpoints
    auth/             # Login, logout, session
    client-requests/  # Public request submission + admin management
    templates/        # Public template listing + admin CRUD
components/
  admin/              # Admin-specific UI (Sidebar, BottomNav)
  ui/                 # Shared components (Toast, ConfirmModal, TimePicker)
  landing/            # Public-facing components (BuyRequestModal)
lib/
  db/                 # MongoDB connection
  models/             # Mongoose schemas
  auth/               # JWT utilities and middleware
  sse/                # SSE broadcaster utilities
types/                # Shared TypeScript type definitions
scripts/              # Utility scripts (admin seed)
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- A running MongoDB instance (local or Atlas)
- A Redis instance (local, ioredis-compatible, or Upstash)
- A Cloudinary account (for image uploads)

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Seed the Admin Account

Before logging in for the first time, create the default admin user:

```bash
npm run seed:admin
```

---

## Environment Variables

Create a `.env` file at the project root. The following variables are required:

```env
# MongoDB
MONGODB_URI=

# Redis
REDIS_URL=

# JWT
JWT_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Nodemailer (SMTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server with Turbopack |
| `npm run dev:clean` | Clear the `.next` cache and start the development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint across the project |
| `npm run seed:admin` | Seed the initial admin user into the database |

---

## Features

### Client Portal

- Service and pricing overview
- Browsable template showcase with category filtering, keyword search, and lightbox preview
- Design request submission form with file attachment support (PNG, JPG, PDF up to 10 MB)
- Real-time template availability via SSE

### Admin Dashboard

- Live statistics: total clients, active projects, templates, and revenue with monthly income chart
- Client request management with status tracking and real-time SSE updates
- Template manager: create, edit, publish, and categorise design templates with Cloudinary image upload
- Reservation calendar with daily queue view and appointment management
- Transaction ledger with daily, weekly, and monthly income summaries
- Responsive layout: collapsible sidebar on desktop, bottom navigation on mobile and tablet
- Global session management: all API routes return standardised 401 responses surfaced via toast notifications
