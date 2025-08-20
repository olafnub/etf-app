# ETF App Backend

A TypeScript-based Node.js backend API for the ETF application.

## Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

## Installation

```bash
cd backend
pnpm install
```

## Environment Setup

Create a `.env` file in the backend directory:

```bash
# API Keys
COINGECKO_API_KEY=your_coingecko_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

For testing, create a `.env.test` file:

```bash
COINGECKO_API_KEY=test_key
PORT=3002
NODE_ENV=test
```

## Available Scripts

### Development
- `pnpm dev` - Run in development mode with ts-node
- `pnpm watch` - Run with file watching (TypeScript compilation + nodemon)
- `pnpm build` - Build the project
- `pnpm start` - Build and serve the production version

### Testing (depcrecated)
- `pnpm test` - Run tests with coverage
- `pnpm test:watch` - Run tests in watch mode

### Code Quality (depcrecated)
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues automatically
- `pnpm check` - Type check without emitting files

## Running Locally

### Development Mode
```bash
pnpm dev
```

### Production Mode
```bash
pnpm start
```

### With File Watching
```bash
pnpm watch
```

## Testing

Run the test suite:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/prices` - Get cryptocurrency prices (BTC, ETH)

## Project Structure

```
src/
├── index.ts          # Application entry point
├── server.ts         # Express server setup
├── prices.ts         # Price fetching logic
└── test/
    └── setup.ts      # Test configuration
```

## Building for Production

```bash
pnpm build
```

The compiled JavaScript will be output to the `dist/` directory. 