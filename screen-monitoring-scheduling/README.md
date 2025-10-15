# Digital Wellness Application

An AI-powered digital wellness application designed to help users develop healthier relationships with technology. The app tracks mouse movements, screen time, and uses artificial intelligence to provide personalized insights and break suggestions while giving users complete control over their break periods.

## 🚀 Features

### Core Functionality
- **Real-Time Screen Time Tracking** - Precision monitoring with app-level granularity
- **Advanced Mouse Activity Analysis** - Cursor movement tracking and interaction patterns
- **AI-Powered Break Suggestions** - Intelligent recommendations based on usage patterns
- **User-Controlled Break Management** - Customizable break periods and scheduling
- **Comprehensive Wellness Insights** - Eye strain prevention and productivity optimization

### User Interface
- **Modern Glass Morphism Design** - Beautiful, modern UI with glass effects
- **Dark/Light Mode Support** - Adaptive theme switching
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-Time Dashboard** - Live data visualization and analytics

## 🛠️ Technologies Used

### Frontend Framework & Core
- **React 18.3.1** - Modern UI framework with hooks and functional components
- **TypeScript 5.8.3** - Type-safe development with strict type checking
- **Vite 5.4.19** - Fast development server and build tool
- **React Router DOM 6.30.1** - Client-side routing and navigation

### UI Components & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library built on Radix UI
- **Radix UI** - Comprehensive set of unstyled, accessible UI primitives:
  - `@radix-ui/react-accordion` - Collapsible content sections
  - `@radix-ui/react-alert-dialog` - Modal dialogs for important actions
  - `@radix-ui/react-avatar` - User profile images
  - `@radix-ui/react-checkbox` - Form checkboxes
  - `@radix-ui/react-dialog` - Modal dialogs
  - `@radix-ui/react-dropdown-menu` - Dropdown menus
  - `@radix-ui/react-popover` - Floating content containers
  - `@radix-ui/react-select` - Select dropdowns
  - `@radix-ui/react-tabs` - Tabbed interfaces
  - `@radix-ui/react-toast` - Notification toasts
  - And many more Radix UI components

### State Management & Data Fetching
- **TanStack React Query 5.83.0** - Server state management and caching
- **React Hook Form 7.61.1** - Performant forms with easy validation
- **Zod 3.25.76** - TypeScript-first schema validation

### Data Visualization & Charts
- **Recharts 2.15.4** - Composable charting library for React
- **React Day Picker 8.10.1** - Date picker component

### Icons & UI Enhancements
- **Lucide React 0.462.0** - Beautiful, customizable SVG icons
- **Class Variance Authority 0.7.1** - Component variant management
- **Tailwind Merge 2.6.0** - Merge Tailwind CSS classes without conflicts
- **Tailwind CSS Animate 1.0.7** - Animation utilities for Tailwind

### Backend & Database
- **Firebase 12.1.0** - Backend-as-a-Service for authentication and data storage
- **Axios 1.11.0** - HTTP client for API requests

### Form Handling & Validation
- **Hookform Resolvers 3.10.0** - Validation resolvers for React Hook Form
- **Input OTP 1.4.2** - One-time password input component

### Utilities & Helpers
- **clsx 2.1.1** - Utility for constructing className strings
- **date-fns 3.6.0** - Modern JavaScript date utility library
- **cmdk 1.1.1** - Command menu component
- **sonner 1.7.4** - Toast notification library

### Development Tools
- **ESLint 9.32.0** - Code linting and style enforcement
- **TypeScript ESLint 8.38.0** - TypeScript-specific linting rules
- **PostCSS 8.5.6** - CSS post-processor
- **Autoprefixer 10.4.21** - CSS vendor prefixing
- **Cross-env 10.0.0** - Cross-platform environment variables

### Build & Development
- **@vitejs/plugin-react-swc 3.11.0** - Vite plugin for React with SWC
- **Lovable Tagger 1.1.9** - Development tool for component tagging

## 📁 Project Structure

```
src/
├── ai/                    # AI flows and logic
│   └── flows/
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── [feature-components]
├── contexts/             # React contexts for state management
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries and configurations
├── pages/                # Application pages/routes
└── assets/               # Static assets (images, icons)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 2505
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual configuration values.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_DATABASE_URL=your_firebase_database_url

# Application Configuration
VITE_APP_NAME=Digital Wellness App
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Development Server Configuration
VITE_DEV_SERVER_HOST=::
VITE_DEV_SERVER_PORT=8080

# Timer Defaults
VITE_DEFAULT_WORK_DURATION=10800
VITE_DEFAULT_BREAK_DURATION=1800

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_WEATHER_SUGGESTIONS=true
VITE_ENABLE_EMOTION_ANALYSIS=true
```

**Note**: Copy `.env.example` to `.env` and update the values with your actual configuration.

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore Database
3. Add your web app to the Firebase project
4. Copy the configuration values to your `.env` file

## 🎨 Customization

### Theme Configuration
The application uses CSS custom properties for theming. You can customize colors in `src/index.css`:

```css
:root {
  --primary: 210 40% 50%;
  --primary-foreground: 0 0% 100%;
  /* ... other theme variables */
}
```

### Component Styling
Components are styled using Tailwind CSS classes. You can customize the design system in `tailwind.config.ts`.

## 📱 Features Overview

### Screen Time Tracking
- Real-time monitoring of application usage
- Daily and weekly analytics
- Productivity metrics and focus scores
- Visual dashboards with charts and graphs

### Mouse Activity Analysis
- Cursor movement tracking
- Click frequency analysis
- Idle time detection
- Activity heatmaps

### AI-Powered Insights
- Personalized break suggestions
- Stress level detection
- Optimal timing recommendations
- Effectiveness tracking

### Break Management
- Customizable break periods
- Flexible scheduling options
- Different break types (eye rest, movement, mental breaks)
- Snooze and skip options

## 🔒 Privacy & Security

- **Local Data Storage** - All tracking data stays on user's device
- **Data Export** - Ability to download personal analytics
- **Tracking Toggle** - Enable/disable specific tracking features
- **Data Deletion** - Complete control over stored information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the fast build tool
- [React](https://reactjs.org/) for the amazing UI library

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

**Built with ❤️ using modern web technologies**