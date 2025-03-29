export interface PredictionCardProps {
  /**
   * The title of the prediction card (e.g., "BTC/USD")
   */
  title: string;

  /**
   * The minimum bet amount with currency
   */
  amount: string;

  /**
   * The current price to display
   */
  currentPrice: string;

  /**
   * The number of active players
   */
  players: string;

  /**
   * Time remaining in the current round
   */
  timeLeft: string;

  /**
   * Multiplier to display (e.g., "2x")
   */
  multiplier?: string;

  /**
   * Whether the wallet is connected
   */
  isConnected: boolean;

  /**
   * Callback when the up button is clicked
   */
  onPredictUp: () => Promise<void>;

  /**
   * Callback when the down button is clicked
   */
  onPredictDown: () => Promise<void>;

  /**
   * Callback when the connect wallet button is clicked
   */
  onConnect: () => Promise<void>;

  /**
   * Optional className for additional styling
   */
  className?: string;
}