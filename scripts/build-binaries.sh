#!/bin/sh
# Build standalone logcayo binaries and checksums into dist/.
set -eu
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist
for target in darwin-arm64 darwin-x64 linux-arm64 linux-x64; do
	bun build packages/cli/src/main.ts --compile --minify --target="bun-$target" --outfile "dist/logcayo-$target"
done
cp scripts/install.sh dist/install.sh
cd dist
if command -v sha256sum >/dev/null 2>&1; then
	sha256sum logcayo-* >checksums.txt
else
	shasum -a 256 logcayo-* >checksums.txt
fi
cat checksums.txt
