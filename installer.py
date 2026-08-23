#!/usr/bin/env python3
"""
Geckium Installer - somewhat 'simple' Dependency-free Python installer for Geckium
Usage: python3 install.py
"""

import os
import sys
import shutil
import platform
from pathlib import Path


#Automatically selects OS and finds firefox profile
def find_firefox_profile():
    system = platform.system()

    if system == "Linux":
        base = Path.home() / ".mozilla" / "firefox"
        alt_base = Path.home() / ".config" / "mozilla" / "firefox"
        if not base.exists() and alt_base.exists():
            base = alt_base
    elif system == "Darwin":
        base = Path.home() / "Library" / "Application Support" / "Firefox" / "Profiles"
    elif system == "Windows":
        base = Path(os.environ.get("APPDATA", "")) / "Mozilla" / "Firefox" / "Profiles"
    else:
        print(f"[ERROR] Unsupported OS: {system}")
        return None

    if not base.exists():
        print(f"[ERROR] Firefox profiles directory not found: {base}")
        return None

    profiles = [d for d in base.iterdir() if d.is_dir() and "default-release" in d.name]

    if not profiles:
        profiles = [d for d in base.iterdir() if d.is_dir() and (d / "places.sqlite").exists()]

    if not profiles:
        print("[ERROR] No Firefox profile found")
        return None

    if len(profiles) == 1:
        return profiles[0]

    print("\nMultiple profiles found:")
    for i, p in enumerate(profiles, 1):
        print(f"  {i}. {p.name}")

    while True:
        try:
            choice = int(input("\nSelect profile (number): "))
            if 1 <= choice <= len(profiles):
                return profiles[choice - 1]
        except (ValueError, EOFError):
            pass
        print("Invalid choice, try again")

#As the name says, it finds the binary installed in the OS
def find_firefox_install():
    system = platform.system()

    if system == "Linux":
        candidates = [
            Path("/usr/lib/firefox"),
            Path("/usr/lib/firefox-esr"),
            Path("/opt/firefox"),
            Path.home() / ".local" / "share" / "firefox",
        ]
    elif system == "Darwin":
        candidates = [Path("/Applications/Firefox.app/Contents/Resources")]
    elif system == "Windows":
        pf = Path(os.environ.get("PROGRAMFILES", "C:\\Program Files"))
        pf86 = Path(os.environ.get("PROGRAMFILES(X86)", "C:\\Program Files (x86)"))
        candidates = [pf / "Mozilla Firefox", pf86 / "Mozilla Firefox"]
    else:
        return None

    for p in candidates:
        if p.exists() and (p / "application.ini").exists():
            return p
    return None


def copy_geckium_files(source_dir, profile_dir):
    chrome_src = source_dir / "Profile Folder" / "chrome"
    chr_themes_src = source_dir / "Profile Folder" / "chrThemes"

    if not chrome_src.exists():
        print(f"[ERROR] chrome folder not found: {chrome_src}")
        return False

    chrome_dst = profile_dir / "chrome"
    if chrome_dst.exists():
        print(f"  Removing existing chrome folder...")
        shutil.rmtree(chrome_dst)

    print(f"  Copying chrome/...")
    shutil.copytree(chrome_src, chrome_dst)

    if chr_themes_src.exists():
        chr_themes_dst = profile_dir / "chrThemes"
        if not chr_themes_dst.exists():
            print(f"  Copying chrThemes/...")
            shutil.copytree(chr_themes_src, chr_themes_dst)
        else:
            print(f"  chrThemes/ already exists, skipping")

    return True


def copy_with_sudo(src, dst):
    try:
        shutil.copy2(src, dst)
        return True
    except PermissionError:
        import subprocess
        print(f"  Need sudo to write to {dst}")
        try:
            subprocess.run(["sudo", "cp", str(src), str(dst)], check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"  [ERROR] Failed to copy {src} -> {dst}")
            print(f"  Run manually: sudo cp {src} {dst}")
            return False


def copy_autoconfig_files(source_dir, install_dir):
    firefox_src = source_dir / "Firefox Folder"

    if not firefox_src.exists():
        print(f"[ERROR] Firefox Folder not found: {firefox_src}")
        return False

    config_src = firefox_src / "config.js"
    config_dst = install_dir / "config.js"
    print(f"  Copying config.js...")
    if not copy_with_sudo(config_src, config_dst):
        return False

    prefs_src = firefox_src / "defaults" / "pref" / "config-prefs.js"
    prefs_dst = install_dir / "defaults" / "pref" / "config-prefs.js"

    if not prefs_dst.parent.exists():
        import subprocess
        try:
            subprocess.run(["sudo", "mkdir", "-p", str(prefs_dst.parent)], check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"  [ERROR] Cannot create directory: {prefs_dst.parent}")
            return False

    print(f"  Copying config-prefs.js...")
    if not copy_with_sudo(prefs_src, prefs_dst):
        return False

    return True


def main():
    print("=" * 50)
    print("  Geckium Installer")
    print("=" * 50)
    print()

    script_dir = Path(__file__).parent.resolve()

    if not (script_dir / "Profile Folder").exists():
        print("[ERROR] Could not find 'Profile Folder' directory.")
        print("Make sure you're running this script from the Geckium extracted folder.")
        sys.exit(1)

    print("[1/4] Finding Firefox profile...")
    profile_dir = find_firefox_profile()
    if not profile_dir:
        sys.exit(1)
    print(f"  Found: {profile_dir}")

    print("\n[2/4] Finding Firefox installation...")
    install_dir = find_firefox_install()
    if not install_dir:
        print("[WARNING] Firefox installation not found.")
        print("You'll need to manually copy config.js and config-prefs.js.")
        install_dir = None
    else:
        print(f"  Found: {install_dir}")

    print(f"\n[3/4] Installing Geckium...")
    print(f"  Profile: {profile_dir}")
    if install_dir:
        print(f"  Install: {install_dir}")
    print()

    confirm = input("Continue? [Y/n] ").strip().lower()
    if confirm and confirm != "y":
        print("Cancelled.")
        sys.exit(0)

    print("\n  Copying Geckium files...")
    if not copy_geckium_files(script_dir, profile_dir):
        sys.exit(1)

    if install_dir:
        print("\n  Copying autoconfig files...")
        if not copy_autoconfig_files(script_dir, install_dir):
            sys.exit(1)

    print("\n" + "=" * 50)
    print("  Installation complete!")
    print("=" * 50)
    print()
    print("  Next steps:")
    print("  1. Open about:support")
    print("  It will restart Firefox 1/2 times")
    print("  3. Geckium set up wizard will appear on the first run")
    print()


if __name__ == "__main__":
    main()
