#!/bin/bash

FILES=(
  "src/constants/contracts.ts"
  "src/components/ConnectWalletButton.tsx"
  "src/components/PredictionCard.tsx"
  "src/components/UserBetHistory.tsx"
  "src/components/Carousel.tsx"
  "src/components/Carousel.css"
  "src/components/hooks/usePredictionGame.tsx"
  "src/components/hooks/useUserRounds.tsx"
  "src/global.d.ts"
  "src/App.tsx"
  "src/main.tsx"
)

for FILE in "${FILES[@]}"; do
  echo -e "\n========== $FILE =========="
  cat "$FILE"
done
echo -e "\n========== END =========="
echo -e "\n\n\n"
