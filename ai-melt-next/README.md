# AI Melt Next.js Application

This is a modern web application built with Next.js and Material UI for analyzing political texts and identifying metaphors, scenarios, and regimes.

## Features

- Document Upload: Upload and analyze text documents
- Metaphor Identification: Identify and analyze metaphors in text
- Scenario Identification: Identify potential scenarios in text
- Regime Identification: Identify political regimes in text
- Regime Rating: Rate and evaluate political regimes
- Mobilization Metaphors: Analyze metaphors used for political mobilization

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-melt-next
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
ai-melt-next/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── document-upload/    # Document upload page
│   │   ├── metaphor-identification/  # Metaphor identification page
│   │   ├── scenario-identification/  # Scenario identification page
│   │   ├── regime-identification/    # Regime identification page
│   │   ├── regime-rating/      # Regime rating page
│   │   └── mobilization-metaphors/   # Mobilization metaphors page
│   ├── components/             # Reusable components
│   │   ├── layout/            # Layout components
│   │   └── theme/             # Theme configuration
│   └── styles/                # Global styles
├── public/                    # Static files
└── package.json              # Project dependencies and scripts
```

## Technologies Used

- Next.js 14
- React 18
- Material UI 5
- TypeScript
- Tailwind CSS
- ESLint

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
