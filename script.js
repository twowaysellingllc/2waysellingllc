const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
menuToggle?.addEventListener('click', () => navLinks.classList.toggle('active'));

document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const note = form.querySelector('.form-note');
    if (note) note.textContent = 'Thank you. Your reservation request has been received. Please connect this form to email or booking software before going live.';
    form.reset();
  });
});
