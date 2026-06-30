#!/bin/bash
echo "=== PWA-X Frontend Ad-Hoc Verification ==="
echo ""

echo "--- File structure ---"
find /Users/macbook/pwa-x-store/frontend/src -type f | sort | while read f; do
  echo "  $(echo $f | sed 's|/Users/macbook/pwa-x-store/frontend/||')"
done | wc -l
echo "  total source files"

echo ""
echo "--- TypeScript check (tsc --noEmit) ---"
cd /Users/macbook/pwa-x-store/frontend && npx tsc --noEmit 2>&1
if [ $? -eq 0 ]; then
  echo "  OK: No TypeScript errors"
else
  echo "  FAILED: TypeScript errors found"
  exit 1
fi

echo ""
echo "--- Production build (vite build) ---"
npx vite build 2>&1
if [ $? -eq 0 ]; then
  echo "  OK: Build succeeded"
else
  echo "  FAILED: Build failed"
  exit 1
fi

echo ""
echo "--- Dist output ---"
ls -lh /Users/macbook/pwa-x-store/frontend/dist/
ls -lh /Users/macbook/pwa-x-store/frontend/dist/assets/

echo ""
echo "=== Verification PASSED ==="
