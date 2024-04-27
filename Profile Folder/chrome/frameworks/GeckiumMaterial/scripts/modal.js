let modalToggles = document.querySelectorAll('[data-toggle-modal]');
let modals = document.querySelectorAll('[data-modal]');
let mainWindow = document.querySelector('#window');

modalToggles.forEach(modalToggle => {
	modalToggle.addEventListener('click', function() {
		let modalId = modalToggle.dataset.toggleModal;
		let modalTarget = document.querySelector(`[data-modal="${modalId}"]`);

		if (modalTarget.classList.contains('active'))
			modalTarget.classList.remove('active');
		else
			modalTarget.classList.add('active');
	});
});

modals.forEach(modal => {
    modal.addEventListener('click', function(event) {
        if (!event.target.closest('.card')) {
            if (modal.classList.contains('active')) {
              modal.classList.remove('active');
            }
        }
    });
});

window.addEventListener('load', () => {
	modals.forEach(modal => {
		mainWindow.appendChild(modal);
	});
});