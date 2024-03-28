








pageSwitchers.forEach((pageSwitcher) => {
	pageSwitcher.addEventListener("click", function handleClick(event) {
		if (event.target.id == "page-switcher-end") {
			
			
			
			

			
			
		} else if (event.target.id == "page-switcher-start") {
			
			

			
			
		}
	});
});

tabItems.forEach((tabItem) => {
	tabItem.addEventListener("click", function handleClick(event) {
		if (event.target.id == "most-visited-tab") {
			
			

			
			
		} else if (event.target.id == "apps-tab") {
			
			
			
			

			
			
		}
	});
});

function switchTab(id, static = false) {
	if (id == 1) {
		
		

		
		
	} else if (id == 2) {
		
		
		

		
		
	}

	if (static) {
		
		

		
		

		setTimeout(() => {
			
			

			
			
		}, 1);
	}
}
