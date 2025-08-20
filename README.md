# 🩸 LifeDrop - Blood Donation Portal

> **Give Blood. Spread Hope.** A comprehensive web-based blood donation management system that connects donors with recipients and streamlines the entire donation process.

![LifeDrop Landing Page](./public/landing-page-screenshot.png)
*[Add your landing page screenshot here]*

## 🌟 Overview

LifeDrop is a modern, full-stack blood donation portal built with Next.js that revolutionizes how blood donation centers manage donors, appointments, and donations. The system features a dual-portal architecture serving both donors and administrators with tailored experiences.

### ✨ Key Features

- **🏥 Dual Portal System**: Separate interfaces for donors and administrators
- **📅 Smart Appointment Booking**: Real-time scheduling with conflict prevention
- **🩺 Health Screening Validation**: Automated eligibility checking
- **📊 Real-time Analytics**: Donation statistics and impact tracking
- **🏆 Certificate Generation**: Downloadable donation certificates
- **🔐 Secure Authentication**: Role-based access control with Better Auth
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile

## 🚀 Tech Stack

### Frontend
- **Next.js 15.4.7** - React framework with server-side rendering
- **React 19.1.0** - Component-based UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.0** - Utility-first styling with custom design system

### Backend
- **Next.js API Routes** - Server-side logic and RESTful APIs
- **Drizzle ORM** - Type-safe database operations
- **Better Auth** - Comprehensive authentication solution
- **PostgreSQL** - Robust relational database

### Development Tools
- **ESLint** - Code linting and quality assurance
- **Drizzle Kit** - Database migrations and management
- **TypeScript** - Static type checking

## 🏗️ Architecture

### Dual Portal System
```
┌─────────────────┐    ┌─────────────────┐
│   Donor Portal  │    │  Admin Portal   │
│                 │    │                 │
│ • Dashboard     │    │ • Donor Mgmt    │
│ • Schedule      │    │ • Appointments  │
│ • History       │    │ • Processing    │
│ • Profile       │    │ • Reports       │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
            ┌─────────────────┐
            │ Shared Backend  │
            │                 │
            │ • Authentication│
            │ • Database      │
            │ • Business Logic│
            └─────────────────┘
```

## 🎯 User Flows

### For Donors
1. **Registration/Login** → Email verification
2. **Profile Setup** → Medical information and emergency contacts
3. **Appointment Booking** → Select date, time, and donation type
4. **Donation Completion** → Health screening and certificate generation
5. **History Tracking** → View past donations and download certificates

### For Administrators
1. **Admin Login** → Role-based dashboard access
2. **Donor Management** → View and manage donor database
3. **Appointment Oversight** → Monitor and coordinate appointments
4. **Donation Processing** → Step-by-step donation workflow
5. **Analytics & Reporting** → System insights and performance metrics

## 🛠️ Getting Started

### Prerequisites
- Node.js 18.0 or higher
- PostgreSQL 13.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lifedrop-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   Create `.env.local` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/lifedrop"
   BETTER_AUTH_SECRET="your-secret-key"
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Database setup**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The system uses a well-structured PostgreSQL database with the following key tables:

- **`user`** - Core user authentication and role management
- **`donor_profile`** - Extended donor information and medical data
- **`appointment`** - Appointment scheduling and management
- **`donation`** - Donation records and health screening data
- **`emergency_contact`** - Emergency contact information

## 🔐 Security Features

- **Role-based Access Control** - Granular permissions for donors and admins
- **Secure Authentication** - Password hashing and session management
- **Data Protection** - HTTPS encryption and input validation
- **SQL Injection Prevention** - Parameterized queries with Drizzle ORM

## 🎨 Design System

LifeDrop features a custom design system with:
- **Blood-themed Color Palette** - Professional medical aesthetic
- **Glassmorphism Effects** - Modern semi-transparent UI elements
- **Responsive Typography** - Plus Jakarta Sans font family
- **Accessibility** - WCAG 2.1 AA compliance

## 📱 Screenshots

### Donor Portal
- Dashboard with donation statistics
- Interactive appointment booking
- Donation history and certificates
- Profile management interface

### Admin Portal
- System overview dashboard
- Donor database management
- Appointment coordination
- Step-by-step donation processing

*[Add screenshots of key interfaces here]*

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Database Migration
```bash
npm run db:migrate
```

## 🤝 Contributing

This project was developed as part of a BCA Mini Project at GLA University. For educational purposes and demonstration of modern web development practices.

## 📄 License

This project is developed for educational purposes as part of academic coursework.

## 👨‍💻 Author

**[Your Name]**
- Roll Number: [Your Roll Number]
- Course: Bachelor of Computer Application
- Institution: GLA University, Mathura
- Supervisor: [Supervisor Name]

## 🙏 Acknowledgments

- GLA University for project guidance and support
- Open source community for excellent tools and libraries
- Healthcare professionals for domain expertise and feedback

---

**Built with ❤️ for saving lives through technology**
