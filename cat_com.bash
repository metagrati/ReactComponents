#!/bin/bash

# Paths to the files
FILES=(
  "src/components/ConnectWalletButton.tsx"
  "src/components/PredictionCard.tsx"
  "src/App.tsx"
  "src/main.tsx"
)

# Iterate and print each file's content with a header
for FILE in "${FILES[@]}"; do
  echo -e "\n========== $FILE =========="
  cat "$FILE"
done
