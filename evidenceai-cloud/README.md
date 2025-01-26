# EvidenceAI Cloud

Cloud-native platform for processing, analyzing, and managing evidence-based documentation.

## Project Structure

```
evidenceai-cloud/
├── services/           # Microservices
│   ├── file-manager/  # File operations and storage
│   ├── document-processor/ # Document processing
│   ├── timeline/      # Timeline management
│   └── evidenceai-core/ # Core business logic
├── api/               # API Gateway
├── web/              # Frontend application
├── infrastructure/   # Infrastructure configuration
└── docs/            # Documentation
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- Docker
- Kubernetes (for production deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/remsecond/evidenceai-cloud.git
cd evidenceai-cloud
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start development servers:
```bash
npm run dev
```

### Development

- `npm run dev` - Start development servers
- `npm run build` - Build all packages
- `npm run test` - Run tests
- `npm run lint` - Run linting

## Documentation

See the [/docs](/docs) directory for detailed documentation:

- [Architecture Overview](docs/ARCHITECTURE.md)
- API Documentation
- Development Guidelines
- Deployment Guide

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
