const { ctypes } = Components.utils.import("resource://gre/modules/ctypes.jsm", {});

const { XPCOMUtils } = ChromeUtils.importESModule("resource://gre/modules/XPCOMUtils.sys.mjs");
XPCOMUtils.defineLazyServiceGetter(
	this,
	"ProfileService",
	"@mozilla.org/toolkit/profile-service;1",
	"nsIToolkitProfileService"
)

function isUxThemeActive() {
    const user32 = ctypes.open("user32.dll");
    const uxtheme = ctypes.open("uxtheme.dll");

    const IsThemeActive = uxtheme.declare("IsThemeActive", ctypes.winapi_abi, ctypes.bool);
    const isUxThemeActive = IsThemeActive();

    user32.close();
    uxtheme.close();

    return isUxThemeActive;
}

function isCompositorEnabled() {
    const dwmapi = ctypes.open("dwmapi.dll");

    const DwmIsCompositorEnabled = dwmapi.declare("DwmIsCompositionEnabled", ctypes.winapi_abi, ctypes.long, ctypes.bool.ptr);
    const compositorEnabled = new ctypes.bool();
    const hr = DwmIsCompositorEnabled(compositorEnabled.address());

    dwmapi.close();

    if (hr == 0) { return compositorEnabled.value; }
    else {
        console.error("Error:", hr);
        return false;
    }
}

function getInfo() {
	const gkVersionElm = document.getElementById("gk-version");
	const gkBranchElm = document.getElementById("gk-branch");


	const forkNameElm = document.getElementById("fork-name");
	const forkVersionElm = document.getElementById("fork-version");
	const forkUpdateChannelElm = document.getElementById("fork-update-channel");
	const forkBasedOnVersionElm = document.getElementById("fork-based-on");
	const forkArchitectureElm = document.getElementById("fork-architecture");
	const profileNameElm = document.getElementById("profile-name");

	forkNameElm.textContent = AppConstants.MOZ_APP_NAME.charAt(0).toUpperCase() + AppConstants.MOZ_APP_NAME.slice(1);
	forkVersionElm.textContent = AppConstants.MOZ_APP_VERSION_DISPLAY.replace("esr", "");
	forkUpdateChannelElm.textContent = AppConstants.MOZ_UPDATE_CHANNEL;
	forkBasedOnVersionElm.textContent = Services.appinfo.version;
	forkArchitectureElm.textContent = Services.appinfo.XPCOMABI;
	profileNameElm.textContent = ProfileService.currentProfile.name;


	const osNameElm = document.getElementById("os-name");
	const osVersionElm = document.getElementById("os-version");
	const osArchitectureElm = document.getElementById("os-architecture");
	const osUxElm = document.getElementById("os-ux");
	const osUxCompElm = document.getElementById("os-comp");

	let osName;
	if (AppConstants.platform == "win")
		osName = "Windows NT"
	else
		osName = AppConstants.platform;
	osNameElm.textContent = osName.charAt(0).toUpperCase() + osName.slice(1);
	osVersionElm.textContent = Services.sysinfo.getProperty("version");

	let osArchitecture;
	if (AppConstants.platform == "linux")
		osArchitecture = navigator.oscpu.split(' ')[1].replaceAll(" ", "")
	else
		osArchitecture = navigator.oscpu.split(';')[2].replaceAll(" ", "");
	osArchitectureElm.textContent = osArchitecture;
	
	if (AppConstants.platform == "win") {
		osUxElm.textContent = isUxThemeActive();
		osUxCompElm.textContent = isCompositorEnabled();
	}
}
document.addEventListener("DOMContentLoaded", getInfo);