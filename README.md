# CodeCritic AI Frontend

A modern React application for AI-powered code review and analysis.

## Features

- **Code Editor**: Syntax-highlighted code editor with support for multiple programming languages
- **AI Review**: Get intelligent code analysis and suggestions from AI
- **Modern UI**: Clean, responsive interface with dark theme
- **Real-time Feedback**: Instant code analysis and review results

## Tech Stack

- **Frontend**: React 19, Vite
- **Code Editor**: React Simple Code Editor with Prism.js syntax highlighting
- **Markdown Rendering**: React Markdown with syntax highlighting
- **Styling**: Modern CSS with custom properties and responsive design
- **Code Quality**: ESLint, Prettier
- **HTTP Client**: Axios

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button/         # Button component with variants
│   ├── CodeEditor/     # Code editor with syntax highlighting
│   └── ReviewPanel/    # AI review results display
├── hooks/              # Custom React hooks
│   └── useCodeReview.js # Code review functionality
├── services/           # API and external services
│   └── codeReviewService.js # AI review API integration
├── constants/          # Application constants
│   ├── api.js         # API endpoints and configuration
│   └── theme.js       # Theme and styling constants
├── styles/            # Global styles and CSS
│   ├── globals.css    # Global styles and reset
│   └── App.css        # Main application styles
└── utils/             # Utility functions
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aditya-Kumar421/codeCriticAI-Frontend.git
   cd codeCriticAI-Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Development Guidelines

### Code Organization

- Use functional components with hooks
- Implement proper error boundaries
- Follow component-based architecture
- Separate concerns (UI, logic, data)

### Styling

- Use CSS modules or styled-components for component styles
- Follow BEM methodology for CSS classes
- Implement responsive design principles
- Use CSS custom properties for theming

### Code Quality

- Follow ESLint rules
- Use Prettier for consistent formatting
- Write meaningful component and function names
- Add PropTypes for type checking
- Include JSDoc comments for complex functions

### Performance

- Implement code splitting
- Use React.memo for expensive components
- Optimize bundle size with proper imports
- Implement proper loading states

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please open an issue on GitHub.
