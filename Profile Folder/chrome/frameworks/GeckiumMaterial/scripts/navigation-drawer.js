class gmNavDrawer {
	static setHamburgerMenuPos() {
		const navDrawerElm = document.getElementById("navigation-drawer");

		if (document.documentElement.getBoundingClientRect().width <= 1009) {
			if (document.documentElement.getAttribute("is-navigation-drawer-collapsed"))
				return;

			document.documentElement.setAttribute("nav-drawer-auto-hide", true)
			gkWindow.windowContentContainerElm.append(navDrawerElm);
			setTimeout(() => {
				document.documentElement.setAttribute("is-navigation-drawer-collapsed", true);
			}, 0);
		} else {
			if (!document.documentElement.getAttribute("is-navigation-drawer-collapsed"))
				return;

			document.documentElement.removeAttribute("nav-drawer-auto-hide")
			gkWindow.windowContentElm.prepend(navDrawerElm);
			setTimeout(() => {
				document.documentElement.removeAttribute("is-navigation-drawer-collapsed");
			}, 0);
		}
	}

	static toggleHamburgerMenu(toggle) {
		switch (toggle) {
			case "close":
				document.documentElement.setAttribute("is-navigation-drawer-collapsed", true)
				break;
			case "open":
				document.documentElement.removeAttribute("is-navigation-drawer-collapsed")
				break;
		
			default:
				if (document.documentElement.getAttribute("is-navigation-drawer-collapsed")) {
					document.documentElement.removeAttribute("is-navigation-drawer-collapsed")
				} else {
					document.documentElement.setAttribute("is-navigation-drawer-collapsed", true)
				}
				break;
		}
	}
}

window.addEventListener("load", () => {
	document.getElementById("btn-menu").addEventListener("click", gmNavDrawer.toggleHamburgerMenu);
	document.getElementById("navigation-drawer__dim").addEventListener("click", gmNavDrawer.toggleHamburgerMenu)
	gmNavDrawer.setHamburgerMenuPos();
});
window.addEventListener("resize", gmNavDrawer.setHamburgerMenuPos);