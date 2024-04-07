document.querySelectorAll(".menu").forEach(btn => {
	const firstItem = btn.querySelector(".item");
	const defaultItem = btn.querySelector(".item[selected]");
	const items = btn.querySelectorAll(".item");

	const menuText = btn.querySelector(".selected");

	btn.querySelector(".placeholder").textContent = btn.dataset.name;

	if (!defaultItem) {
		menuText.textContent = firstItem.textContent;
		btn.setAttribute("value", firstItem.getAttribute("value"));
		firstItem.setAttribute("selected", true);
	} else {
		menuText.textContent = defaultItem.textContent;
		btn.setAttribute("value", defaultItem.getAttribute("value"));
		defaultItem.setAttribute("selected", true);
	}
	
	btn.addEventListener("click", (e) => {
		const windowHeight = document.querySelector("#window").getBoundingClientRect().height;

		const btnWidth = btn.getBoundingClientRect().width;
		const btnHeight = btn.getBoundingClientRect().height;
		const btnX = btn.getBoundingClientRect().x;
		const btnY = btn.getBoundingClientRect().y;

		const list = btn.querySelector(".list");
		const listHeight = list.getBoundingClientRect().height;

		list.style.width = btnWidth + "px";
		list.style.top = 0 + "px";
		list.style.left = btnX + "px";

		if (btnY + listHeight < windowHeight) {
			list.style.top = btnHeight + btnY + "px";
			list.setAttribute("position", "top");
		} else if (btnY + listHeight > windowHeight) {
			list.style.top = btnY - listHeight + "px";
			list.setAttribute("position", "bottom");
		}
			

		if (!btn.hasAttribute("open"))
			btn.setAttribute("open", true); // Add the "open" attribute to the button
		else
			btn.removeAttribute("open"); // Add the "open" attribute to the button

		// Stop the event from propagating further to prevent triggering the document click listener
		e.stopPropagation();
	});

	// Add event listener to the document to listen for clicks outside of the button
	document.addEventListener("click", function() {
		btn.removeAttribute("open");
	});

	items.forEach(item => {
		item.addEventListener("click", () => {
			items.forEach(item => {
				item.removeAttribute("selected");
			});

			btn.setAttribute("value", item.getAttribute("value"));
			menuText.textContent = item.textContent;
			item.setAttribute("selected", true);
		})
	})
})