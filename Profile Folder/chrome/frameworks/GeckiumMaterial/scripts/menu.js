setTimeout(() => {
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

		const list = btn.querySelector(".list");
		const listWidth = list.getBoundingClientRect().width;
		btn.style.width = `${listWidth + 48}px`;
	
		btn.addEventListener("click", (e) => {
			const windowHeight = document.querySelector("#window").getBoundingClientRect().height;

			const listHeight = list.getBoundingClientRect().height;
	
			const btnWidth = btn.getBoundingClientRect().width;
			const btnHeight = btn.getBoundingClientRect().height;
			const btnX = btn.getBoundingClientRect().x;
			const btnY = btn.getBoundingClientRect().y;
	
			list.style.top = "0px";
			list.style.width = `${btnWidth}px`;
			list.style.left = `${btnX}px`;
	
			if (btnY + listHeight < windowHeight) {
				list.style.top = btnHeight + btnY + "px";
				list.setAttribute("position", "top");
			} else if (btnY + listHeight > windowHeight) {
				list.style.top = btnY - listHeight + "px";
				list.setAttribute("position", "bottom");
			}
	
			if (!btn.hasAttribute("open")) {
				document.querySelectorAll('.menu[open="true"]').forEach(openMenu => {
					openMenu.removeAttribute("open");
				})

				btn.setAttribute("open", true);
			} else {
				btn.removeAttribute("open");
			}
	
			e.stopPropagation();
		});
	
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
		});
	
		// Method to set value programmatically
		btn.setValue = function(value) {
			const selectedItem = btn.querySelector(`.item[value="${value}"]`);
			if (selectedItem) {
				items.forEach(item => {
					item.removeAttribute("selected");
				});
				selectedItem.setAttribute("selected", true);
				btn.setAttribute("value", value);
				menuText.textContent = selectedItem.textContent;
			}
		};
	});
}, 10);