// Copyright (c) 2009 The Chromium Authors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//    * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//    * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

const { ColorUtils } = ChromeUtils.importESModule("chrome://modules/content/ChromiumColorUtils.sys.mjs");

export class ChromiumGTKUI {
	/**
	 * getTitlebarShine - Gets the colour of the 'shine' at the top of the titlebar
	 * 
	 * @rgb: Titlebar background colour
     * Reference: https://chromium.googlesource.com/chromium/src.git/+/refs/tags/29.0.1547.57/chrome/browser/ui/libgtk2ui/gtk2_ui.cc#56
	 */
    
    static getTitlebarShine(rgb) {
        return ColorUtils.HSLShift(rgb, [-1, -1, 0.58]);
    }

	/**
	 * getInactiveTab - Gets the inactive tab background, based on the active titlebar colour
	 * 
	 * @rgb: Active titlebar background colour
     * Reference: https://chromium.googlesource.com/chromium/src.git/+/refs/tags/29.0.1547.57/chrome/browser/ui/libgtk2ui/gtk2_ui.cc#86
     *  https://chromium.googlesource.com/chromium/src.git/+/refs/tags/29.0.1547.57/chrome/browser/ui/libgtk2ui/gtk2_ui.cc#711
     *  https://chromium.googlesource.com/chromium/src.git/+/refs/tags/29.0.1547.57/chrome/browser/ui/libgtk2ui/gtk2_ui.cc#829
	 */

    static getInactiveTab(rgb) {
        return ColorUtils.HSLShift(rgb, [-1, 0.5, 0.75]);
    }

	/**
	 * getInactiveTabFG - Gets the inactive tab foreground, based on the inactive tab background
	 * 
	 * @rgb: Inactive tab background colour
     * Reference: https://chromium.googlesource.com/chromium/src.git/+/refs/tags/29.0.1547.57/chrome/browser/ui/libgtk2ui/gtk2_ui.cc#628
     *  https://chromium.googlesource.com/chromium/src.git/+/refs/tags/29.0.1547.57/chrome/browser/ui/libgtk2ui/gtk2_ui.cc#521
	 */

    static getInactiveTabFG(rgbbg) {
        var color = ColorUtils.ColorToHSL(rgbbg);
        if (color[2] < 50) { //HS[L]
            color[2] = 85;
        } else {
            color[2] = 15;
        }
        if (color[1] < 50) { //H[S]L
            color[1] = 70;
        } else {
            color[1] = 30;
        }
        return ColorUtils.HSLToColor(color);
    }

	/**
	 * getIncognito - Gets the Incognito titlebar background, based on the active titlebar background
	 * 
	 * @rgb: Active titlebar background colour
     * Reference: https://chromium.googlesource.com/chromium/src.git/+/refs/tags/29.0.1547.57/chrome/browser/ui/libgtk2ui/gtk2_ui.cc#84
     *  https://github.com/chromium/chromium/blob/5.0.396.0/chrome/browser/gtk/gtk_theme_provider.cc#L569
     *  https://github.com/chromium/chromium/blob/5.0.396.0/chrome/browser/gtk/gtk_theme_provider.cc#L753
	 */
    
    static getIncognito(rgb) {
        return ColorUtils.HSLShift(rgb, [-1, 0.2, 0.35]);
    }

	/**
	 * getIncognitoInactive - Gets the inactive Incognito titlebar background, based on the active titlebar background
	 * 
	 * @rgb: Active titlebar background colour
     * Reference: https://chromium.googlesource.com/chromium/src.git/+/refs/tags/29.0.1547.57/chrome/browser/ui/libgtk2ui/gtk2_ui.cc#85
     *  https://chromium.googlesource.com/chromium/src.git/+/refs/tags/29.0.1547.57/chrome/browser/ui/libgtk2ui/gtk2_ui.cc#648
     *  https://github.com/chromium/chromium/blob/5.0.396.0/chrome/browser/gtk/gtk_theme_provider.cc#L756
	 */

    static getIncognitoInactive(rgb) {
        return ColorUtils.HSLShift(rgb, [-1, 0.3, 0.6]);
    }

	/**
	 * getAccentToolbarFill - Gets the appropriate toolbar button fill colour (for Chromium 1-6)
	 * 
	 * @accent: Accent/Selection colour
     * @bg: Toolbar background colour
     * Reference: https://github.com/chromium/chromium/blob/5.0.396.0/chrome/browser/gtk/gtk_theme_provider.cc#L56
     *  https://github.com/chromium/chromium/blob/5.0.396.0/chrome/browser/gtk/gtk_theme_provider.cc#L507
     *  https://github.com/chromium/chromium/blob/5.0.396.0/chrome/browser/gtk/gtk_theme_provider.cc#L508
     *  https://github.com/chromium/chromium/blob/5.0.396.0/chrome/browser/gtk/gtk_theme_provider.cc#L550
	 */

    static getAccentToolbarFill(accent, bg) {
        if (Math.abs(ColorUtils.ColorToHSL(accent)[2] - ColorUtils.ColorToHSL(bg)[2]) < 10) {
			// Not enough contrast - use foreground
			return "-moz-dialogtext";
		} else {
			return "AccentColor";
		}
    }
}