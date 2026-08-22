var { AppConstants } = ChromeUtils.importESModule("resource://gre/modules/AppConstants.sys.mjs");
const gSettingsBundle = Services.strings.createBundle("chrome://geckium/locale/properties/gsettings.properties");

document.documentElement.setAttribute("title", gSettingsBundle.GetStringFromName("geckiumSettings"));
