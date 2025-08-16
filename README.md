# OmniAgent

A Next.js application with Biome linting and formatting, plus comprehensive CI/CD setup.

## Features

- **Next.js 15** with TypeScript
- **Biome** for fast linting and formatting
- **GitHub Actions** for continuous integration
- **Dynamic Labs** integration for Web3 functionality
- **Dark mode** support
- **Tailwind CSS** for styling
- **shadcn/ui** components for modern UI design

## Development Setup

### Prerequisites

- Node.js 18.18.0 or higher
- Bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd omniagent

# Install dependencies
bun install
```

### Available Scripts

```bash
# Development
bun run dev          # Start development server

# Building
bun run build        # Build for production
bun run start        # Start production server

# Linting and Formatting
bun run lint         # Run ESLint
bun run lint:biome   # Run Biome linting
bun run format       # Format code with Biome
bun run check        # Run Biome check (lint + format)
bun run check:fix    # Fix all Biome issues

# Type checking
bunx tsc --noEmit    # TypeScript type checking
```

## shadcn/ui Integration

This project includes a complete shadcn/ui setup with modern, accessible components:

### Components Available

- **Button** - Multiple variants (default, secondary, outline, ghost, destructive, link) and sizes
- **Card** - Complete card system with header, content, footer, title, and description
- **Badge** - Status indicators with various styles
- **Input** - Styled input fields with proper focus states
- **Label** - Accessible label components
- **Separator** - Horizontal and vertical separators

### Usage Examples

```tsx
import { Button, Card, Badge } from '@/components/ui';

// Button variants
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>

// Card component
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Badge component
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
```

### Theme Support

- **Light/Dark Mode**: Automatic theme switching
- **CSS Variables**: Consistent theming across components
- **Accessibility**: Built with Radix UI primitives
- **TypeScript**: Full type safety and IntelliSense

## Biome Configuration

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The configuration is in `biome.json` and includes:

- **Linting**: Error detection and code quality checks
- **Formatting**: Consistent code style
- **Import organization**: Automatic import sorting
- **TypeScript support**: Full TypeScript linting

### Key Biome Rules

- Enforces consistent code style
- Detects unused variables and imports
- Ensures proper button types for accessibility
- Organizes imports automatically
- Uses single quotes and 2-space indentation

## GitHub Actions

The project includes a comprehensive CI/CD pipeline in `.github/workflows/ci.yml`:

### What it checks:

1. **Code Quality**

   - Biome formatting check
   - Biome linting check
   - ESLint check
   - TypeScript type checking

2. **Build Verification**

   - Project build test
   - Dependency audit

3. **Security**
   - Dependency vulnerability scanning

### Triggers

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

## Project Structure

```
omniagent/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # shadcn/ui components
│   ├── ui/                # UI component library
│   │   ├── button.tsx     # Button component
│   │   ├── card.tsx       # Card component
│   │   ├── badge.tsx      # Badge component
│   │   ├── input.tsx      # Input component
│   │   ├── label.tsx      # Label component
│   │   ├── separator.tsx  # Separator component
│   │   └── index.ts       # Component exports
│   └── ShadcnDemo.tsx     # Component showcase
├── lib/                   # Utility libraries
│   ├── dynamic.ts         # Dynamic Labs exports
│   ├── providers.tsx      # React providers
│   ├── useDarkMode.ts     # Dark mode hook
│   ├── utils.ts           # shadcn/ui utilities
│   └── wagmi.ts           # Wagmi configuration
├── public/                # Static assets
├── .github/workflows/     # GitHub Actions
├── biome.json             # Biome configuration
├── components.json        # shadcn/ui configuration
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the quality checks:
   ```bash
   bun run check
   bun run lint
   bun run build
   ```
5. Commit your changes with a descriptive message
6. Push and create a pull request

## Code Quality

Before committing, ensure your code passes all quality checks:

```bash
# Fix all formatting and linting issues
bun run check:fix

# Verify everything is clean
bun run check
bun run lint
```

## Environment Variables

Copy the example environment file and configure your variables:

```bash
cp env.example .env.local
```

Then edit `.env.local` with your actual values:

```env
# Dynamic Labs Configuration
NEXT_PUBLIC_DYNAMIC_ENV_ID=your_dynamic_environment_id

# Next.js Configuration
NODE_ENV=development
```

## License

This project is licensed under the MIT License.
