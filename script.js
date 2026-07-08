const SUPABASE_URL = "https://ymcpxaheusrxgmgitceu.supabase.com";
const SUPABASE_KEY = "sb_publishable_WYKUu85jk5xwMutqo6Ex3Q_q6PvtOK4";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

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

    const note = form.querySelector(".form-note");

    if (note) {
      note.textContent = "Saving your reservation details...";
    }

    const formData = new FormData(form);

    const reservationData = {
      fullName: formData.get("fullName") || "",
      email: formData.get("email") || "",
      phone: formData.get("phone") || "",
      pickupLocation: formData.get("pickupLocation") || "",
      returnLocation: formData.get("returnLocation") || "",
      pickupDate: formData.get("pickupDate") || "",
      returnDate: formData.get("returnDate") || "",
      vehicle: formData.get("vehicle") || "",
      message: formData.get("message") || "",
      paymentStatus: "Pending Payment"
    };

    localStorage.setItem("reservationData", JSON.stringify(reservationData));

    window.location.href = "payment.html";
  });
});
