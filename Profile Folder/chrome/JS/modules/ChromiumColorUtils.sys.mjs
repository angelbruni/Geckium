// Copyright 2015 The Chromium Authors
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
//    * Neither the name of Google LLC nor the names of its
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

const { gkColorUtils } = ChromeUtils.importESModule("chrome://modules/content/GeckiumUtils.sys.mjs");

// color_utils.cc from Chromium source code converted to JavaScript by Doot.
export class ColorUtils {
	
	// Assumes sRGB.
	static Linearize(component) {
		// The W3C link in the header uses 0.03928 here.  See
		// https://en.wikipedia.org/wiki/SRGB#Theory_of_the_transformation for
		// discussion of why we use this value rather than that one.
		if (component <= 0.04045) {
			return (component / 12.92);
		} 
		else {
			return Math.pow((component + 0.055) / 1.055, 2.4);
		}						
	}
	
	static GetRelativeLuminance(color) {
		return this.GetRelativeLuminance4f(color);
	}

	static IsDark(color) {
		const g_luminance_midpoint = 0.211692036;
		return this.GetRelativeLuminance(color) < g_luminance_midpoint;
	}

	static GetRelativeLuminance4f(color) {
		let colorfR = color[0];
		let colorfG = color[1];
		let colorfB = color[2];

		return (0.2126 * this.Linearize(colorfR)) + (0.7152 * this.Linearize(colorfG)) +
			   (0.0722 * this.Linearize(colorfB));
	}

	static GetColorWithMaxcontrast(color) {
		if (this.IsDark(color)) {
			//return white
			console.log("it's dark, return white");
			return [255, 255, 255];
		}
		else {
			//return kGoogleGrey900
			console.log("it's bright, return a dark colour");
			return [32, 33, 36];
		} 
	}

	/**
	 * Note: these transformations assume sRGB as the source color space
	 */
	static ColorToHSL(rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;

		// Find greatest and smallest channel values
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		// Calculate hue
		// No difference
		if (delta == 0)
			h = 0;
		// Red is max
		else if (cmax == r)
			h = ((g - b) / delta) % 6;
		// Green is max
		else if (cmax == g)
			h = (b - r) / delta + 2;
		// Blue is max
		else
			h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		// Make negative hues positive behind 360°
		if (h < 0)
			h += 360;

		// Calculate lightness
		l = (cmax + cmin) / 2;

		// Calculate saturation
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

		// Multiply l and s by 100
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return [h, s, l];
	}

	/**
	 * Note: these transformations assume sRGB as the source color space
	 */
	static HSLToColor(hsl) {
		let h = hsl[0];
		let s = hsl[1] / 100;
		let l = hsl[2] / 100;

		let a = s * Math.min(l, 1 - l);
		let f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

		return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
	}

	/**
	 * Makes |hsl| valid input for HSLShift(). Sets values of hue, saturation
	 * and lightness which are outside of the valid range [0, 1] to -1.  -1 is a
     * special value which indicates 'no change'.
	 */
	static MakeHSLShiftValid(hsl) {
		let hslH = hsl[0];
		let hslS = hsl[1];
		let hslL = hsl[2];

		if (hslH < 0 || hslH > 1)
			hslH = -1;
		if (hslS < 0 || hslS > 1)
			hslS = -1;
		if (hslL < 0 || hslL > 1)
			hslL = -1;

		return ([hslH, hslS, hslL]);
	}

	/**
	 * HSL-Shift a Color. The shift values are in the range of 0-1, with the
	 * option to specify -1 for 'no change'. The shift values are defined as:
	 * hsl_shift[0] (hue): The absolute hue value - 0 and 1 map
	 *    to 0 and 360 on the hue color wheel (red).
	 * hsl_shift[1] (saturation): A saturation shift, with the
	 *    following key values:
	 *    0 = remove all color.
	 *    0.5 = leave unchanged.
	 *    1 = fully saturate the image.
	 * hsl_shift[2] (lightness): A lightness shift, with the
	 *    following key values:
	 *    0 = remove all lightness (make all pixels black).
	 *    0.5 = leave unchanged.
	 *    1 = full lightness (make all pixels white).
	 */
	static HSLShift(color, shift) {
		// Validate HSL Shift
		shift = this.MakeHSLShiftValid(shift);
		
		// Convert from RGB to HSL, then HSL to float
		let hslHSL = gkColorUtils.HSLtoFloat(this.ColorToHSL(color));
		let hslH = hslHSL[0];
		let hslS = hslHSL[1];
		let hslL = hslHSL[2];

		let shiftH = shift[0];
		let shiftS = shift[1];
		let shiftL = shift[2];

		// Saturation shift
		if (shiftH >= 0 || shiftS >= 0) {
			// Hue shift
			// Replace the hue with the tint's hue.
			if (shiftH >= 0 && shiftH != 0.5)
				hslH = shiftH;

			// Change the saturation.
			if (shiftS >= 0) {
				if (shiftS <= 0.5)
					hslS = hslS * (shiftS * 2.0);
				else
					hslS = hslS + ((1 - hslS) * ((shiftS - 0.5) * 2.0));
			}
		}

		// Convert from float to HSL
		// Convert HSL to RGB to do Lightness shifts
		const color2 = this.HSLToColor(gkColorUtils.floatToHSL([hslH, hslS, hslL]));
		if (shiftL < 0 || shiftL > 1)
			return color2;

		/* Doot:	Lightness shifts in the style of popular image editors aren't actually
					represented in HSL - the L value does have some effect on saturation. */
		// RGB
		var r = color2[0];
		var g = color2[1];
		var b = color2[2];

		if (shiftL <= 0.5) {
			r = r * (shiftL * 2.0);
			g = g * (shiftL * 2.0);
			b = b * (shiftL * 2.0);
		} else {
			r = r + ((255 - r) * ((shiftL - 0.5) * 2.0));
			g = g + ((255 - g) * ((shiftL - 0.5) * 2.0));
			b = b + ((255 - b) * ((shiftL - 0.5) * 2.0));
		}
		return [Math.round(r), Math.round(g), Math.round(b)];
	}
}