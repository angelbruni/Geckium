let modalToggles = document.querySelectorAll('[data-toggle-modals]');



modalToggles.forEach(modalToggle => {
	modalToggle.addEventListener('click', function() {
		let modalToggleIds = modalToggle.dataset.toggleModals.replace(" ", "").split(",");

		modalToggleIds.forEach(id => {
			let target = document.querySelector(`[data-modal="${id}"]`);
			if (target.classList.contains('active'))
				target.classList.remove('active');
			else
				target.classList.add('active');
		});
	}); 	
});

modals.forEach(modal => {
    modal.addEventListener('click', function(event) {
        if (!event.target.closest('.card')) {
            if (modal.classList.contains('active'))
              	
        }
    });
});

window.addEventListener('load', () => {
	modals.forEach(modal => {
		
	});
});
