(() => {
    'use strict';

    const forms = document.querySelectorAll('.validated-form');

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                const inputs = form.querySelectorAll('input');
                inputs.forEach(input => {
                    if (input.checkValidity()) {
                        input.classList.add('is-valid'); // Add green feedback class
                    }
                });
            }

            form.classList.add('was-validated');
        }, false);
    });
})();
