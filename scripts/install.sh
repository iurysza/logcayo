#!/bin/sh
# Install the logcayo binary from GitHub releases.
#
#   curl -fsSL https://github.com/iurysza/logcayo/releases/latest/download/install.sh | sh
#
# Environment:
#   LOGCAYO_VERSION      release tag to install, for example v0.2.0 (default: latest)
#   LOGCAYO_INSTALL_DIR  target directory (default: ~/.local/bin)
#   LOGCAYO_DOWNLOAD_BASE  URL to download assets from instead of GitHub (for testing)
set -eu

REPO="iurysza/logcayo"
VERSION="${LOGCAYO_VERSION:-latest}"
INSTALL_DIR="${LOGCAYO_INSTALL_DIR:-$HOME/.local/bin}"

die() {
	printf 'logcayo installer: %s\n' "$*" >&2
	exit 1
}

command -v curl >/dev/null 2>&1 || die "curl is required"

case "$(uname -s)" in
	Darwin) os=darwin ;;
	Linux) os=linux ;;
	*) die "unsupported OS: $(uname -s). logcayo supports macOS and Linux." ;;
esac

case "$(uname -m)" in
	arm64 | aarch64) arch=arm64 ;;
	x86_64 | amd64) arch=x64 ;;
	*) die "unsupported CPU: $(uname -m)" ;;
esac

# Rosetta reports x86_64 on Apple Silicon. Prefer the native build.
if [ "$os" = darwin ] && [ "$arch" = x64 ] && [ "$(sysctl -n sysctl.proc_translated 2>/dev/null || echo 0)" = 1 ]; then
	arch=arm64
fi

asset="logcayo-$os-$arch"
if [ -n "${LOGCAYO_DOWNLOAD_BASE:-}" ]; then
	base="$LOGCAYO_DOWNLOAD_BASE"
elif [ "$VERSION" = latest ]; then
	base="https://github.com/$REPO/releases/latest/download"
else
	base="https://github.com/$REPO/releases/download/$VERSION"
fi

tmp="$(mktemp -d "${TMPDIR:-/tmp}/logcayo-install.XXXXXX")" || die "could not create a temporary directory"
trap 'rm -rf "$tmp"' EXIT INT TERM

printf 'Downloading %s (%s)...\n' "$asset" "$VERSION"
curl -fsSL "$base/$asset" -o "$tmp/$asset" || die "download failed: $base/$asset"
curl -fsSL "$base/checksums.txt" -o "$tmp/checksums.txt" || die "download failed: $base/checksums.txt"

expected="$(awk -v f="$asset" '$2 == f { print $1 }' "$tmp/checksums.txt")"
[ -n "$expected" ] || die "no checksum for $asset"
if command -v sha256sum >/dev/null 2>&1; then
	actual="$(sha256sum "$tmp/$asset" | awk '{ print $1 }')"
else
	actual="$(shasum -a 256 "$tmp/$asset" | awk '{ print $1 }')"
fi
[ "$expected" = "$actual" ] || die "checksum mismatch for $asset"

chmod +x "$tmp/$asset"
"$tmp/$asset" --help >/dev/null 2>&1 || die "downloaded binary does not run on this machine"
installed="$("$tmp/$asset" --version 2>/dev/null)" || installed="logcayo $VERSION"

mkdir -p "$INSTALL_DIR" || die "could not create $INSTALL_DIR"
mv "$tmp/$asset" "$INSTALL_DIR/logcayo" || die "could not write $INSTALL_DIR/logcayo"

printf 'Installed %s to %s/logcayo\n' "$installed" "$INSTALL_DIR"

case ":$PATH:" in
	*":$INSTALL_DIR:"*) ;;
	*) printf '\n%s is not on your PATH. Add this to your shell profile:\n  export PATH="%s:$PATH"\n' "$INSTALL_DIR" "$INSTALL_DIR" ;;
esac

command -v adb >/dev/null 2>&1 || printf '\nadb was not found. You need it only for live capture: https://developer.android.com/tools/releases/platform-tools\n'
