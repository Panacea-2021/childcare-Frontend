# Panacea Childcare — Frontend

Next.js web application for the Panacea childcare platform.

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Poppins font, yellow/white UI theme

## Features

- Marketing landing page
- Login (phone, email, Google, Microsoft — UI flow)
- Authenticated app shell with sidebar modules
- Center Dashboard and module placeholders

## Modules

Dashboard, Center Management, Program, Attendance & Leaves, Parent Communication, Messages, Billing & Accounting, Tour Management, Enquiries, Calendar, Learning & Assessment, Forms, Tools, Reports, Settings, Help, Language, Profile, Notifications

## Setup

```bash
npm install
npm run dev
```

App runs at: [http://localhost:3001](http://localhost:3001)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3001) |
| `npm run build` | Production build |
| `npm start` | Start production server |

## API

Configure the backend base URL via:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Backend repo: [Childcare_Backend](https://github.com/panacea-it/Childcare_Backend)

## Brand

Company name: **Panacea**
