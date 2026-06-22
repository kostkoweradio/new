/* =====================================================
   Kostkowe Radio — main.js
   ===================================================== */

(function () {
  'use strict';

  /* --- Mobile menu toggle --- */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.querySelector('.material-symbols-rounded').textContent =
        isOpen ? 'close' : 'menu';
    });

    /* Close menu when clicking outside the navbar */
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.querySelector('.material-symbols-rounded').textContent = 'menu';
      }
    });

    /* Close menu on Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.querySelector('.material-symbols-rounded').textContent = 'menu';
        hamburger.focus();
      }
    });
  }

  /* --- Mark active nav link based on current filename --- */
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function (link) {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href === currentFile) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

})();
