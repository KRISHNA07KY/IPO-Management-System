# IPO Management System

## Overview

This is a comprehensive IPO (Initial Public Offering) management system that handles the complete lifecycle of IPO applications, from submission to allotment and refund processing. The system is built as a full-stack web application with a React frontend and Express.js backend, designed to manage multiple companies' IPO offerings, track applications from investors, handle allotment processes, and generate detailed reports.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The client-side is built using **React 18** with **TypeScript** and follows a component-based architecture:

- **UI Framework**: Uses shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a modular structure with separate pages for dashboard, application submission, and reports. Components are organized into UI primitives and layout components, with shared utilities and hooks.

### Backend Architecture

The server is built with **Express.js** and **TypeScript**:

- **Database**: SQLite with better-sqlite3 for local development, designed to be database-agnostic through Drizzle ORM
- **ORM**: Drizzle ORM provides type-safe database operations and schema management
- **API Design**: RESTful endpoints with consistent error handling and logging middleware
- **Development**: Hot reload with Vite integration for seamless full-stack development

The backend implements a storage abstraction layer that separates business logic from database operations, making it easy to switch database providers.

### Data Storage Architecture

The system uses a relational database schema with five main entities:

- **Companies**: IPO offerings with share details, pricing, and date ranges
- **Applicants**: Investor information with unique PAN and Demat identifiers
- **Applications**: Investment requests linking applicants to companies
- **Allotments**: Share allocation results for approved applications
- **Refunds**: Financial refund calculations for partial or failed allotments

The schema enforces referential integrity and includes unique constraints to prevent duplicate applications.

### Authentication & Authorization

Currently implements a simplified security model without user authentication, designed for internal use or controlled environments. The system can be extended to include JWT-based authentication and role-based access control.

### API Structure

RESTful API endpoints organized by functionality:

- `/api/dashboard` - Aggregate statistics and overview data
- `/api/applications` - CRUD operations for IPO applications
- `/api/settings` - System configuration and preferences
- `/api/allotments` - Share allocation management
- Support for future endpoints like company management and user authentication

## External Dependencies

### Core Technologies

- **Node.js Runtime**: Modern JavaScript runtime for server execution
- **PostgreSQL**: Production database (configured via Drizzle, though currently using SQLite)
- **Neon Database**: Serverless PostgreSQL provider for cloud deployment

### UI and Styling

- **Radix UI**: Headless UI primitives for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Custom typography (Space Grotesk, Geist, Geist Mono)

### Development Tools

- **TypeScript**: Type safety across the entire application
- **Vite**: Build tool and development server
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database migration and schema management tools

### Runtime Libraries

- **Zod**: Schema validation for forms and API requests
- **date-fns**: Date manipulation and formatting utilities
- **clsx & tailwind-merge**: Conditional CSS class management
- **nanoid**: Unique identifier generation

### Replit Integration

- **@replit/vite-plugin-dev-banner**: Development environment indicators
- **@replit/vite-plugin-cartographer**: Code navigation assistance
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error reporting

The system is designed for easy deployment on Replit with optimized development workflows and production-ready builds.