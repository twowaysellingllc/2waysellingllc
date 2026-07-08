const SUPABASE_URL = "https://ymcpxaheusrxgmgitceu.supabase.co";
const SUPABASE_KEY = "sb_publishable_WYKUu85jk5xwMutqo6Ex3Q_q6PvtOK4";

const supabaseClient = window.supabase.createClient(
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

  form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const note = form.querySelector(".form-note");

    if (note) {
      note.textContent = "Saving reservation...";
    }

    const formData = new FormData(form);

    const reservationId = "2WS-" + Date.now();

    const reservationData = {
      reservationId: reservationId,
      fullName: formData.get("fullName") || "",
      email: formData.get("email") || "",
      phone: formData.get("phone") || "",
      pickupLocation: formData.get("pickupLocation") || "",
      returnLocation: formData.get("returnLocation") || "",
      pickupDate: formData.get("pickupDate") || "",
      returnDate: formData.get("returnDate") || "",
      vehicle: formData.get("vehicle") || "",
      message: formData.get("message") || "",
      paymentStatus: "Pending Payment",
      reservationStatus: "Pending"
    };

    const { error } = await supabaseClient
      .from("reservations")
      .insert([
        {
          reservation_id: reservationData.reservationId,
          full_name: reservationData.fullName,
          email: reservationData.email,
          phone: reservationData.phone,
          vehicle: reservationData.vehicle,
          pickup_location: reservationData.pickupLocation,
          return_location: reservationData.returnLocation,
          pickup_date: reservationData.pickupDate,
          return_date: reservationData.returnDate,
          message: reservationData.message,
          payment_status: reservationData.paymentStatus,
          reservation_status: reservationData.reservationStatus
        }
      ]);

    if (error) {
      console.error(error);
      alert("Unable to save reservation.\n\n" + error.message);
      return;
    }

    localStorage.setItem(
      "reservationData",
      JSON.stringify(reservationData)
    );

    window.location.href = "payment.html";

  });

});