#!/usr/bin/env bash
# Geckium Installer for Linux/macOS
# Dependency-free bash installer for Geckium
# Usage: bash install.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=================================================="
echo "  Geckium Installer"
echo "=================================================="
echo ""

if [ ! -d "$SCRIPT_DIR/Profile Folder" ]; then
    echo "[ERROR] Could not find 'Profile Folder' directory."
    echo "Run this script from the Geckium extracted folder."
    exit 1
fi

echo "[1/4] Finding Firefox profile..."

# Find profile directory
if [ "$(uname)" = "Darwin" ]; then
    FIREFOX_BASE="$HOME/Library/Application Support/Firefox/Profiles"
elif [ -d "$HOME/.config/mozilla/firefox" ]; then
    FIREFOX_BASE="$HOME/.config/mozilla/firefox"
else
    FIREFOX_BASE="$HOME/.mozilla/firefox"
fi

if [ ! -d "$FIREFOX_BASE" ]; then
    echo "[ERROR] Firefox profiles directory not found: $FIREFOX_BASE"
    exit 1
fi

# Collect profiles
PROFILE_LIST=()
while IFS= read -r d; do
    PROFILE_LIST+=("$d")
done < <(find "$FIREFOX_BASE" -maxdepth 1 -type d \( -name "*default-release*" -o -name "*default*" \) 2>/dev/null | sort)

if [ ${#PROFILE_LIST[@]} -eq 0 ]; then
    echo "[ERROR] No Firefox profile found"
    exit 1
fi

# Select profile
if [ ${#PROFILE_LIST[@]} -eq 1 ]; then
    PROFILE_DIR="${PROFILE_LIST[0]}"
else
    echo ""
    echo "Multiple profiles found:"
    for i in "${!PROFILE_LIST[@]}"; do
        echo "  $((i+1)). $(basename "${PROFILE_LIST[$i]}")"
    done
    while true; do
        read -rp "Select profile (number): " choice
        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#PROFILE_LIST[@]}" ]; then
            PROFILE_DIR="${PROFILE_LIST[$((choice-1))]}"
            break
        fi
        echo "Invalid choice, try again"
    done
fi

echo "  Found: $PROFILE_DIR"

echo ""
echo "[2/4] Finding Firefox installation..."

INSTALL_DIR=""
for p in /usr/lib/firefox /usr/lib/firefox-esr /opt/firefox "$HOME/.local/share/firefox" "/Applications/Firefox.app/Contents/Resources"; do
    if [ -f "$p/application.ini" ]; then
        INSTALL_DIR="$p"
        break
    fi
done

if [ -z "$INSTALL_DIR" ]; then
    echo "[WARNING] Firefox installation not found."
    echo "You'll need to manually copy config.js and config-prefs.js."
else
    echo "  Found: $INSTALL_DIR"
fi

echo ""
echo "[3/4] Installing Geckium..."
echo "  Profile: $PROFILE_DIR"
[ -n "$INSTALL_DIR" ] && echo "  Install: $INSTALL_DIR"
echo ""

read -rp "Continue? [Y/n] " confirm
if [ "$confirm" != "" ] && [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "  Copying Geckium files..."

if [ -d "$PROFILE_DIR/chrome" ]; then
    echo "  Removing existing chrome folder..."
    rm -rf "$PROFILE_DIR/chrome"
fi

cp -r "$SCRIPT_DIR/Profile Folder/chrome" "$PROFILE_DIR/chrome"
echo "  Copied chrome/"

if [ -d "$SCRIPT_DIR/Profile Folder/chrThemes" ] && [ ! -d "$PROFILE_DIR/chrThemes" ]; then
    cp -r "$SCRIPT_DIR/Profile Folder/chrThemes" "$PROFILE_DIR/chrThemes"
    echo "  Copied chrThemes/"
else
    echo "  chrThemes/ already exists, skipping"
fi

if [ -n "$INSTALL_DIR" ]; then
    echo ""
    echo "  Copying autoconfig files..."
    sudo cp "$SCRIPT_DIR/Firefox Folder/config.js" "$INSTALL_DIR/config.js"
    echo "  Copied config.js"
    sudo mkdir -p "$INSTALL_DIR/defaults/pref"
    sudo cp "$SCRIPT_DIR/Firefox Folder/defaults/pref/config-prefs.js" "$INSTALL_DIR/defaults/pref/config-prefs.js"
    echo "  Copied config-prefs.js"
fi

echo ""
echo "=================================================="
echo "  Installation complete!"
echo "=================================================="
echo ""
echo "  Next steps:"
echo "  1. Open about:support"
echo "  It will restart Firefox 1/2 times"
echo "  3. Geckium set up wizard will appear on the first run"
echo ""
