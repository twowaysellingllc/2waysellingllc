const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}

menuToggle?.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Generate Reservation ID
const reservationId =
  "2WS-" +
  new Date().getFullYear() +
  String(new Date().getMonth() + 1).padStart(2, "0") +
  String(new Date().getDate()).padStart(2, "0") +
  "-" +
  Date.now().toString().slice(-6);

    const note = form.querySelector(".form-note");

    if (note) {
      note.textContent = "Sending your reservation request...";
    }

    emailjs
  .sendForm("service_gipisdi", "template_v9i5zrl", this)

  .then(() => {

    // Send confirmation email to customer
    return emailjs.sendForm(
      "service_gipisdi",
      "template_vjyeisg",
      form
    );

  })

  .then(() => {

    form.reset();

    window.location.href = "payment.html";

  })
      .catch((error) => {
        console.error("EmailJS error:", error);

        if (note) {
          note.textContent =
            "❌ Unable to send reservation. Please call or email us directly.";
        }
      });
  });
});