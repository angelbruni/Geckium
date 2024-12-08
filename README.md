# Geckium
## A love letter to the history of Chromium and its derivatives

###### Geckium is not officially developed, approved or endorsed by Google!

![Geckium artwork showing every era up to Chromium 47 on all 3 supported platforms](https://github.com/user-attachments/assets/554b95e4-d6e3-4bcf-a55e-32a1d9251b28)

Geckium is a Mozilla Firefox **(115 - latest)** CSS and JS modification that restores the look and feel of past Chromium (or Google Chrome) releases, spanning from 1.0 to 58, while also bringing Chromium Theme support to Firefox, bringing obscure prerelease content to the limelight and retrofitting new content into every design.

[Discord Server](https://discord.gg/ZDeT6vdqMp)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/V7V614V6Y7)

## Coming from Silverfox?

Just install Geckium normally by deleting your `chrome` folder and placing Geckium's `chrome` folder in its place - upon launching Geckium it will automatically migrate the settings you had from Silverfox to Geckium's settings.

# Compatibility

Geckium is designed for the following platforms:

- Linux (tested on Arch, by the way, Fedora KDE, Fedora, Kubuntu, Feren OS and Linux Mint)
- Windows 7
- Windows 8.1
- Windows 10 (with Native Controls Patch)
- Windows 11
- macOS* (tested on Sonoma and Sequoia)

*Mac OS X's 3-6 eras may be inaccurate as we were unsuccessful in finding DMGs of those versions

However,

- Compatibility with Firefox forks is never guaranteed - minor adjustments will be made by Geckium to accommodate itself in Firefox forks, but issues not seen in Firefox may still occur.
- Due to the nature of how their packages are created, Geckium **CANNOT** be used in Mozilla Firefox from Flathub nor Ubuntu (and Snap Store). Ubuntu users will have to install Firefox [from the Mozilla PPA](https://launchpad.net/~mozillateam/+archive/ubuntu/ppa#:~:text=sudo%20add%2Dapt%2Drepository%20ppa%3Amozillateam/ppa) in order to use Geckium.

# Instructions

**To begin, download Geckium from [the Releases page](https://github.com/angelbruni/Geckium/releases/latest).**

> [!WARNING]
> Remember to only get JavaScript-powered Firefox modifications (such as Geckium) from sources that you trust, such as [Geckium's official repository](https://github.com/angelbruni/Geckium) - JavaScript-powered modifications have full access to Firefox's functionality, including unrestricted access, to data inside and outside of Firefox, and file manipulation.

**To improve your Geckium experience, you should also install [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey) and, using Tampermonkey, install [the official Geckium UserScript for enhanced functionality](https://github.com/angelbruni/CRX-Downloader-userScript/raw/refs/heads/main/crx-downloader.user.js).**

> [!NOTE]
> Once running for the first time, Geckium will restart Firefox automatically 1-2 times while it sets up required settings, migrations, and so on - if Firefox doesn't re-appear after restarting itself, terminate Firefox and launch it again (that is an upstream bug with Firefox).

## Linux

1. Open Firefox, and in the address bar go to `about:support`
2. Look for `Profile Folder` and next to it press `Open Profile Directory`
3. Copy the `chrome` folder (and, if it's your first time installing Geckium, `chrThemes` folder) from the `Profile Folder` folder in your copy of Geckium to the resulting file manager's window's currently displayed folder
4. Navigate to `File System/usr/lib/firefox` (or `File System/usr/lib/firefox-esr` if using Mozilla Firefox ESR)
5. Copy the contents of the `Firefox Folder` folder in your copy of Geckium to the `firefox`/`firefox-esr` folder (if your file manager does not ask for Superuser privilleges automatically, you will need to manually open your File Manager with Superuser privilleges)
6. Back in the Firefox window, scroll to the top, and press `Clear startup cache` followed by confirming the confirmation that then displays
7. You are now running Geckium, and will see a setup window appear to start setting up Geckium - enjoy!

| ![linux-1](https://github.com/user-attachments/assets/68656e29-1e4f-4140-ba50-3e5386e26344) | ![linux-2](https://github.com/user-attachments/assets/b2a1d60b-64fc-494a-959c-f1adee35d7e6) |
|---|---|
| ![linux-3](https://github.com/user-attachments/assets/b92de8d6-9b73-4495-98eb-53f1fc7cf803) | ![linux-4](https://github.com/user-attachments/assets/78403353-d72f-48d2-9a86-72716338ffba) |

[Installing Geckium onto an immutable Operating System?](https://github.com/angelbruni/Geckium/wiki/Installing-Geckium-on-specialised-Operating-Systems)

## Windows

1. Open Firefox, and in the address bar go to `about:support`
2. Look for `Profile Folder` and next to it press `Open Profile Directory`
3. Copy the `chrome` folder (and, if it's your first time installing Geckium, `chrThemes` folder) from the `Profile Folder` folder in your copy of Geckium to the resulting File Explorer window's folder
4. Find a Mozilla Firefox shortcut, right-click it and select `Open file location`
5. Copy the contents of the `Firefox Folder` folder in your copy of Geckium to the resulting folder (depending on how you installed Firefox, you may need to have administrator privilleges to perform this step)
6. Back in the Firefox window, scroll to the top, and press `Clear startup cache` followed by confirming the confirmation that then displays
7. You are now running Geckium, and will see a setup window appear to start setting up Geckium - enjoy!

| ![windows-1](https://github.com/user-attachments/assets/3dbc08ff-f78f-4949-ab0d-777620372bdf) | ![windows-2](https://github.com/user-attachments/assets/ed04f856-ea83-4aa3-8739-0c34241454a6) |
|---|---|
| ![windows-3](https://github.com/user-attachments/assets/f7f7f0ab-4bd5-495d-8897-e61e07fdaa49) | ![windows-95](https://github.com/user-attachments/assets/255dab4d-a808-4383-9c8f-4e8c738486b7) |

## macOS

⚠ FOLLOW THE STEPS CAREFULLY - FAILURE TO PERFORM THESE STEPS PROPERLY *WILL* BRICK YOUR CURRENT COPY OF MOZILLA FIREFOX FOR MACOS

1. Open Firefox, and in the address bar go to `about:support`
2. Look for `Profile Folder` and next to it press `Open in Finder`
3. Copy the `chrome` folder (and, if it's your first time installing Geckium, `chrThemes` folder) from the `Profile Folder` folder in your copy of Geckium to the resulting File Explorer window's folder
4. DO NOT QUIT FIREFOX - find your copy of Mozilla Firefox, right-click it and select `Open Package Contents`
5. Go to Contents -> Resources, and then copy the contents of the `Firefox Folder` folder in your copy of Geckium to this folder (you will need to merge folders if prompted to)
6. Back in the Firefox window, scroll to the top, and press `Clear startup cache` followed by confirming the confirmation that then displays
7. You are now running Geckium, and will see a setup window appear to start setting up Geckium - enjoy!

| ![mac-1](https://github.com/user-attachments/assets/683ee47a-d2f6-439f-a7b6-f70c79521572) | ![mac-2](https://github.com/user-attachments/assets/7c1a2aa4-374d-402c-a462-af5e1d11f6f7) |
|---|---|
| ![mac-3](https://github.com/user-attachments/assets/f4f43017-e9ed-4263-8f95-a4072bd2e00e) | ![mac-4](https://github.com/user-attachments/assets/6065ddb9-6a34-4401-8bc9-385bd0b6fbcd) |

# Credits and licensing

Credits can be found within Geckium Settings's About page upon opening Geckium.

Geckium is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa] license, excluding the parts of Geckium that are forked off Firefox or Chromium - for these files, their licenses can be found in the files their code resides in.

For more information about Geckium's Creative Commons license, see LICENSE.md or click the license below.

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
