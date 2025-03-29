# Prediction Card Component

A beautiful and fully-featured prediction card component for crypto trading applications.

## Installation

```bash
npm install @yourusername/prediction-card
```

## Usage

```tsx
import { PredictionCard } from '@yourusername/prediction-card';

function App() {
  return (
    <PredictionCard
      title="BTC/USD"
      amount="0.001 POL"
      currentPrice="$71,850"
      players="124"
      timeLeft="3m"
      multiplier="2x"
      isConnected={false}
      onPredictUp={async () => {}}
      onPredictDown={async () => {}}
      onConnect={async () => {}}
    />
  );
}
```

## Props

See `types.ts` for detailed prop documentation.

## Features

- Beautiful UI with animated background
- Responsive design
- Customizable styling
- TypeScript support
- Tailwind CSS integration
- Lucide React icons

## License

MIT