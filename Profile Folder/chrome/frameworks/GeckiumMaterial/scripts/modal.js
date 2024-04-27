



modalToggles.forEach(modalToggle => {
  modalToggle.addEventListener('click', function() {
    
    

    if (modalTarget.classList.contains('active')) {
      
    } else {
      
    }
  });
});

modals.forEach(modal => {
    modal.addEventListener('click', function(event) {
        if (!event.target.closest('.card')) {
            if (modal.classList.contains('active')) {
              
            }
        }
    });
});

window.addEventListener('load', () => {
	modals.forEach(modal => {
		
	});
});
