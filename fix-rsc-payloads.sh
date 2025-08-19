#!/bin/bash

# Post-build script to fix RSC payload file locations for S3 static hosting
# This ensures RSC payload files are available at the expected locations

echo "🔧 Fixing RSC payload file locations..."

OUT_DIR="./out"

# Function to copy RSC payload files to root level
copy_rsc_payloads() {
    local route="$1"
    local source_file="$OUT_DIR/$route/index.txt"
    local target_file="$OUT_DIR/$route.txt"
    
    if [ -f "$source_file" ]; then
        cp "$source_file" "$target_file"
        echo "  ✅ Copied $source_file -> $target_file"
    else
        echo "  ⚠️  Missing: $source_file"
    fi
}

# Copy RSC payloads for all routes
routes=(
    "login"
    "register" 
    "faq"
    "profile"
    "settings"
)

for route in "${routes[@]}"; do
    copy_rsc_payloads "$route"
done

# Handle nested routes
nested_routes=(
    "payout/bulk-payout"
    "payout/payout-management"
    "payout/payout-transactions"
    "payout/wallet-report"
    "pg/complaint-request"
    "pg/customer-wise-Transaction"
    "pg/no-seamless-transaction"
    "pg/payment-request"
    "pg/refunds"
    "pg/settlements"
    "pg/transactions"
)

for route in "${nested_routes[@]}"; do
    source_file="$OUT_DIR/$route/index.txt"
    # Create flattened filename: payout/bulk-payout -> payout-bulk-payout.txt
    target_file="$OUT_DIR/$(echo $route | tr '/' '-').txt"
    
    if [ -f "$source_file" ]; then
        cp "$source_file" "$target_file"
        echo "  ✅ Copied $source_file -> $target_file"
    else
        echo "  ⚠️  Missing: $source_file"
    fi
done

echo "✅ RSC payload files fixed!"
