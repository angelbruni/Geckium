# Geckium
## A love letter to the history of Chromium and its derivatives

###### Geckium is not officially developed, approved or endorsed by Google!

(todo: image here of all themes/etc.)

Geckium is a Mozilla Firefox **(115 - latest)** CSS and JS modification that restores the look and feel of past Chromium (or Google Chrome) releases, spanning from 1.0 to 68, while also bringing Chromium Theme support to Firefox, bringing obscure prerelease content to the limelight and retrofitting new content into every design.

[Discord Server](https://discord.gg/ZDeT6vdqMp)

## Coming from Silverfox?

Just install Geckium normally by deleting your `chrome` folder and placing Geckium's `chrome` folder in its place - upon launching Geckium it will automatically migrate the settings you had from Silverfox to Geckium's settings.

# Compatibility

Geckium is designed for the following platforms:

- Linux (tested on Arch, by the way, Fedora KDE, Fedora, Kubuntu and Feren OS)
- Windows 7
- Windows 8.1
- Windows 10 (with Native Controls Patch)
- Windows 11
- macOS* (tested on Sonoma)

*Mac OS X's 3-6 eras may be inaccurate as we were unsuccessful in finding DMGs of those versions

However,

- Geckium **CANNOT** work properly with WindowBlinds.
- Compatibility with Firefox forks is never guaranteed - minor adjustments will be made by Geckium to accommodate itself in Firefox forks, but issues not seen in Firefox may still occur.
- Due to the nature of how their packages are created, Geckium **CANNOT** be used in Mozilla Firefox from Flathub nor Ubuntu (and Snap Store). Ubuntu users will have to install Firefox [from the Mozilla PPA](https://launchpad.net/~mozillateam/+archive/ubuntu/ppa#:~:text=sudo%20add%2Dapt%2Drepository%20ppa%3Amozillateam/ppa) in order to use Geckium.

# Instructions

ℹ Once running for the first time, Geckium will restart Firefox automatically 1-2 times while it sets up required settings, migrations, and so on - if Firefox doesn't re-appear after restarting itself, terminate Firefox and launch it again (that is an upstream bug with Firefox).

## Linux

1. Open Firefox, and in the address bar go to `about:support`
2. Look for `Profile Folder` and next to it press `Open Profile Directory`
3. Copy the `chrome` folder from the `Profile Folder` folder in your copy of Geckium to the resulting file manager's window's currently displayed folder
4. Navigate to `File System/usr/lib/firefox` (or `File System/usr/lib/firefox-esr` if using Mozilla Firefox ESR)
5. Copy the contents of the `Firefox Folder` folder in your copy of Geckium to the `firefox`/`firefox-esr` folder (if your file manager does not ask for Superuser privilleges automatically, you will need to manually open your File Manager with Superuser privilleges)
6. Back in the Firefox window, scroll to the top, and press `Clear startup cache` followed by confirming the confirmation that then displays
7. You are now running Geckium, and will see a setup window appear to start setting up Geckium - enjoy!

| ![linux-1](https://github.com/user-attachments/assets/68656e29-1e4f-4140-ba50-3e5386e26344) | ![linux-2](https://github.com/user-attachments/assets/b2a1d60b-64fc-494a-959c-f1adee35d7e6) |
|---|---|
| ![linux-3](https://github.com/user-attachments/assets/b92de8d6-9b73-4495-98eb-53f1fc7cf803) | ![linux-4](https://github.com/user-attachments/assets/78403353-d72f-48d2-9a86-72716338ffba) |

## Windows

1. Open Firefox, and in the address bar go to `about:support`
2. Look for `Profile Folder` and next to it press `Open Profile Directory`
3. Copy the `chrome` folder from the `Profile Folder` folder in your copy of Geckium to the resulting File Explorer window's folder
4. Find a Mozilla Firefox shortcut, right-click it and select `Open file location`
5. Copy the contents of the `Firefox Folder` folder in your copy of Geckium to the resulting folder (depending on how you installed Firefox, you may need to have administrator privilleges to perform this step)
6. Back in the Firefox window, scroll to the top, and press `Clear startup cache` followed by confirming the confirmation that then displays
7. You are now running Geckium, and will see a setup window appear to start setting up Geckium - enjoy!

| ![win_1](https://github.com/user-attachments/assets/865276de-0b6d-4266-8404-3d10e626b702) | ![win_2](https://github.com/user-attachments/assets/395c7332-d1be-480e-b2ce-59ef5a371d25) |
|---|---|
| ![win_3](https://github.com/user-attachments/assets/1ed6c435-7d66-4836-92f4-5c34d7594d05) | ![win_4](https://github.com/user-attachments/assets/d632f7e0-bca5-4736-b188-01b62179779b) |

## macOS

⚠ FOLLOW THE STEPS CAREFULLY - FAILURE TO PERFORM THESE STEPS PROPERLY *WILL* BRICK YOUR CURRENT COPY OF MOZILLA FIREFOX FOR MACOS

1. Open Firefox, and in the address bar go to `about:support`
2. Look for `Profile Folder` and next to it press `Open in Finder`
3. Copy the `chrome` folder from the `Profile Folder` folder in your copy of Geckium to the resulting File Explorer window's folder
4. DO NOT QUIT FIREFOX - find your copy of Mozilla Firefox, right-click it and select `Open Package Contents`
5. Go to Contents -> Resources, and then copy the contents of the `Firefox Folder` folder in your copy of Geckium to this folder (you will need to replace files if prompted to)
6. Back in the Firefox window, scroll to the top, and press `Clear startup cache` followed by confirming the confirmation that then displays
7. You are now running Geckium, and will see a setup window appear to start setting up Geckium - enjoy!

| ![mac_1](https://github.com/user-attachments/assets/33768566-e67e-4c36-96a3-c14e4026ad23) | ![mac_2](https://github.com/user-attachments/assets/5cfc199f-6b70-495d-a33c-1f4f74134455) |
|---|---|
| ![mac_3](https://github.com/user-attachments/assets/6f770721-b290-489d-a7bc-31ea2346d596) | ![mac_4](https://github.com/user-attachments/assets/7b7746a7-f041-44f1-897f-744414b74e05) |

# Credits and licensing

Credits can be found within Geckium Settings's About page upon opening Geckium.

EXCLUDING content that states otherwise at the top of their files, such as direct ports of Chromium code, this work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
