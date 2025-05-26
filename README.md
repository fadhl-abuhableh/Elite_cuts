# Smart Cut Advisor

A modern web application for barbershop appointment booking and style recommendations powered by AI. Built with React, TypeScript, and modern web technologies.

## 🚀 Features

- 📅 Smart Appointment Booking System
- 🤖 AI-Powered Style Recommendations
- 🗺️ Interactive Map Integration with Mapbox
- 💬 Intelligent Chatbot Assistant
- 🎨 Modern UI with shadcn/ui Components
- 🌙 Dark/Light Theme Support
- 📱 Responsive Design
- 🔐 Secure Authentication with Supabase

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** React Query
- **Database:** Supabase
- **Maps:** Mapbox GL
- **AI Integration:** Google AI & OpenAI
- **Form Handling:** React Hook Form + Zod
- **Testing:** Vitest + Testing Library
- **Routing:** React Router DOM

## 📋 Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn
- Git

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/fadhl-abuhableh/Elite_cuts.git
   cd Elite_cuts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   VITE_GOOGLE_AI_KEY=your_google_ai_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components and routing
├── hooks/         # Custom React hooks
├── lib/          # Utilities and configurations
├── utils/        # Helper functions
├── integrations/ # Third-party service integrations
├── server/       # API routes and server logic
└── test/         # Test files
```

## 🧪 Testing

The project uses Vitest and React Testing Library for testing. Run tests with:

```bash
npm run test
```

## 🚀 Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Preview the build:
   ```bash
   npm run preview
   ```

3. Deploy the `dist` folder to your hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Fadhl Abuhableh - Initial work

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Mapbox](https://www.mapbox.com/) for mapping functionality
- [Google AI](https://ai.google.dev/) and [OpenAI](https://openai.com/) for AI features 