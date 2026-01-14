# Unvelit - Social Content Platform

> A modern web application for sharing and discovering content with a focus on user engagement and community interaction.
>
> **⚠️ Public Code Repository** - Created in 2024 (public on 2026).

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Key Features](#key-features)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **User Authentication** - Secure login and signup with OTP verification
- **Password Reset** - Email-based password recovery with OTP
- **Post Management** - Create, view, delete, and share posts
- **Social Interactions** - Like posts and leave comments with nested replies
- **User Profiles** - View user profiles with post history and profile pictures
- **Search** - Search for posts and users in real-time
- **Content Filtering** - Browse posts by category/tags
- **Media Support** - Image and video content support
- **Responsive Design** - Works seamlessly across devices
- **Security** - Secure password hashing and input sanitization

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **Vite 6** - Ultra-fast build tool and dev server
- **React Router v7** - Client-side routing
- **TailwindCSS-like** - Custom CSS styling
- **DOMPurify** - XSS protection and HTML sanitization
- **Framer Motion** - Smooth animations
- **Lucide React** - Clean SVG icon library
- **Crypto-JS** - Client-side password hashing
- **@ffmpeg/ffmpeg** - Video processing in browser
- **browser-image-compression** - Image optimization

### Build & Development
- **ESLint** - Code quality and linting
- **JavaScript Obfuscator** - Code protection
- **Node.js** - Runtime environment

## 📦 Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd unvelit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your API and configuration values
   ```bash
   cp .env.example .env
   ```

## 🔐 Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=your_api_base_url_here
VITE_CDN_BASE_URL=your_cdn_base_url_here

# Security
VITE_PASSWORD_SALT=your_password_salt_here
```

**Important:** Never commit `.env` files with sensitive information. The `.env` file is already in `.gitignore` for security.

## 📁 Project Structure

```
unvelit/
├── src/
│   ├── login/
│   │   ├── login.jsx          # User login component
│   │   ├── signin.jsx         # User signup component
│   │   ├── otp.jsx            # OTP verification
│   │   └── PasswordReset.jsx  # Password recovery
│   ├── body/
│   │   ├── header.jsx         # Navigation header
│   │   ├── content.jsx        # Post feed/content display
│   │   ├── Post.jsx           # Post creation
│   │   ├── Showpost.jsx       # Individual post view with comments
│   │   ├── Profilepage.jsx    # User profile page
│   │   ├── Viewuser.jsx       # Other user's profile view
│   │   └── Contentpage.jsx    # Content layout
│   ├── components/
│   │   └── sociallog.jsx      # Social login component
│   ├── CSSF/                  # Stylesheets for all components
│   ├── Postcontext.jsx        # Global post context/state
│   ├── ProtectedRoute.jsx     # Auth-protected route wrapper
│   ├── App.jsx                # Root app component
│   ├── body.jsx               # Main layout wrapper
│   └── main.jsx               # Entry point
├── public/
│   ├── footercont/            # Footer-related pages and styles
│   └── script.js              # Public scripts
├── .env                       # Environment variables (not committed)
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration
└── README.md                  # This file
```

## 🏃 Running the Application

### Development Server
Start the development server with hot module replacement:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Preview Production Build
Build and preview the production version:
```bash
npm run build
npm run preview
```

## 🏗 Building for Production

Build the application for production deployment:
```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Code Obfuscation (Optional)
Protect your code with obfuscation:
```bash
npm run obfuscate
```

## 🎯 Key Features Explained

### Authentication Flow
1. Users can sign up with email, username, and password
2. OTP verification is required during signup
3. Login with username/email and password
4. Password reset via email with OTP verification

### Post Management
- Create posts with text, images, or videos
- View individual posts with full details
- Like/unlike posts
- Delete own posts
- Report inappropriate posts

### Comments & Interaction
- Add comments to posts
- Reply to comments (nested comments)
- Delete comments
- View all comments on a post

### User Profiles
- View public user profiles
- See user's post history
- Upload and manage profile pictures
- Delete account

### Search & Discovery
- Search for posts by keywords
- Search for users
- Filter posts by date
- Browse posts by category/tag

## 🔌 API Integration

The application connects to a backend API with the following main endpoints:

- **Auth**: `/auth/*` - Login, password checks
- **Users**: `/create/user/*` - Signup, user creation
- **Posts**: `/data/read/posts/*` - Post operations
- **Comments**: `/data/create/comment/*` - Comment management
- **Search**: `/search/*` - Search functionality
- **CDN**: Media assets from CDN service

All API URLs are configured via environment variables for flexibility.

## ⚙️ Code Quality

### Linting
Check code quality:
```bash
npm run lint
```

### Security Measures
- Client-side password hashing with SHA-256
- Input sanitization with DOMPurify
- XSS protection
- Environment variable security
- Secure OTP handling

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure code passes linting
5. Submit a pull request

---

**Project Created:** 2024  
**Made public:** 2026
