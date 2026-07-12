(() => {
  const SUPABASE_URL = "https://ymcpxaheusrxgmgitceu.supabase.co";
  const SUPABASE_KEY = "sb_publishable_WYKUu85jk5xwMutqo6Ex3Q_q6PvtOK4";

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const tableBody = document.getElementById("tableBody");
  const searchInput = document.getElementById("search");
  const logoutButton = document.getElementById("logout");
  const dashboardMessage = document.getElementById("dashboardMessage");
  const modal = document.getElementById("reservationModal");
  const modalContent = document.getElementById("modalContent");
  let reservations = [];

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const normalize = (value) => String(value ?? "").trim().toLowerCase();

  function setMessage(message = "", isError = false) {
    dashboardMessage.textContent = message;
    dashboardMessage.classList.toggle("error", isError);
  }

  async function checkLogin() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error || !data.session) {
      window.location.replace("admin-login.html");
      return false;
    }
    return true;
  }

  function updateStatistics(data) {
    document.getElementById("totalBookings").textContent = data.length;
    document.getElementById("paidBookings").textContent = data.filter(r => normalize(r.payment_status) === "paid").length;
    document.getElementById("pendingBookings").textContent = data.filter(r => ["pending", "pending payment"].includes(normalize(r.payment_status))).length;
    document.getElementById("confirmedBookings").textContent = data.filter(r => normalize(r.reservation_status) === "confirmed").length;
  }

  const paymentOptions = (current) => ["Pending Payment", "Paid"].map(value =>
    `<option value="${value}" ${normalize(current) === normalize(value) ? "selected" : ""}>${value}</option>`
  ).join("");

  const reservationOptions = (current) => ["Pending", "Confirmed", "Cancelled", "Completed"].map(value =>
    `<option value="${value}" ${normalize(current) === normalize(value) ? "selected" : ""}>${value}</option>`
  ).join("");

  function renderReservations(data) {
    if (!data.length) {
      tableBody.innerHTML = '<tr><td colspan="12" class="empty-state">No reservations found.</td></tr>';
      return;
    }

    tableBody.innerHTML = data.map(r => `
      <tr>
        <td>${escapeHtml(r.reservation_id)}</td><td>${escapeHtml(r.full_name)}</td><td>${escapeHtml(r.email)}</td>
        <td>${escapeHtml(r.phone)}</td><td>${escapeHtml(r.vehicle)}</td><td>${escapeHtml(r.pickup_location)}</td>
        <td>${escapeHtml(r.return_location)}</td><td>${escapeHtml(r.pickup_date)}</td><td>${escapeHtml(r.return_date)}</td>
        <td><select class="status-select" data-payment-id="${r.id}">${paymentOptions(r.payment_status)}</select></td>
        <td><select class="status-select" data-reservation-id="${r.id}">${reservationOptions(r.reservation_status)}</select></td>
        <td><div class="actions">
          <button class="action-btn view-btn" type="button" data-view-id="${r.id}">View</button>
          <button class="action-btn delete-btn" type="button" data-delete-id="${r.id}">Delete</button>
        </div></td>
      </tr>`).join("");
  }

  async function loadReservations() {
    setMessage("Loading reservations...");
    const { data, error } = await supabaseClient.from("reservations").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      setMessage(error.message || "Unable to load reservations.", true);
      tableBody.innerHTML = '<tr><td colspan="12" class="empty-state">Unable to load reservations.</td></tr>';
      return;
    }
    reservations = data ?? [];
    updateStatistics(reservations);
    renderReservations(reservations);
    setMessage(`${reservations.length} reservation(s) loaded.`);
  }

  async function updatePaymentStatus(id, value) {
    const { error } = await supabaseClient.from("reservations").update({ payment_status: value }).eq("id", id);
    if (error) { alert(error.message); await loadReservations(); return; }
    await loadReservations();
  }

  async function updateReservationStatus(id, value) {
    const { error } = await supabaseClient.from("reservations").update({ reservation_status: value }).eq("id", id);
    if (error) { alert(error.message); await loadReservations(); return; }
    await loadReservations();
  }

  function openReservation(id) {
    const r = reservations.find(item => String(item.id) === String(id));
    if (!r) { alert("Reservation not found."); return; }
    modalContent.innerHTML = `<div class="detail-grid">
      <div class="detail-item"><strong>Reservation ID</strong>${escapeHtml(r.reservation_id)}</div>
      <div class="detail-item"><strong>Created</strong>${escapeHtml(r.created_at)}</div>
      <div class="detail-item"><strong>Customer</strong>${escapeHtml(r.full_name)}</div>
      <div class="detail-item"><strong>Email</strong>${escapeHtml(r.email)}</div>
      <div class="detail-item"><strong>Phone</strong>${escapeHtml(r.phone)}</div>
      <div class="detail-item"><strong>Vehicle</strong>${escapeHtml(r.vehicle)}</div>
      <div class="detail-item"><strong>Pickup Location</strong>${escapeHtml(r.pickup_location)}</div>
      <div class="detail-item"><strong>Return Location</strong>${escapeHtml(r.return_location)}</div>
      <div class="detail-item"><strong>Pickup Date</strong>${escapeHtml(r.pickup_date)}</div>
      <div class="detail-item"><strong>Return Date</strong>${escapeHtml(r.return_date)}</div>
      <div class="detail-item"><strong>Payment</strong>${escapeHtml(r.payment_status)}</div>
      <div class="detail-item"><strong>Status</strong>${escapeHtml(r.reservation_status)}</div>
      <div class="detail-item detail-wide"><strong>Special Requests</strong>${escapeHtml(r.message || "None")}</div>
    </div>`;
    modal.hidden = false;
  }

  function closeModal() { modal.hidden = true; }

  async function deleteReservation(id) {
    const r = reservations.find(item => String(item.id) === String(id));
    if (!confirm(`Delete reservation ${r?.reservation_id || id}? This cannot be undone.`)) return;
    const { error } = await supabaseClient.from("reservations").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    await loadReservations();
  }

  searchInput.addEventListener("input", () => {
    const q = normalize(searchInput.value);
    renderReservations(reservations.filter(r => Object.values(r).some(v => normalize(v).includes(q))));
  });

  tableBody.addEventListener("change", async (event) => {
    const paymentId = event.target.dataset.paymentId;
    const reservationId = event.target.dataset.reservationId;
    if (paymentId) { event.target.disabled = true; await updatePaymentStatus(paymentId, event.target.value); }
    if (reservationId) { event.target.disabled = true; await updateReservationStatus(reservationId, event.target.value); }
  });

  tableBody.addEventListener("click", async (event) => {
    const viewButton = event.target.closest("[data-view-id]");
    const deleteButton = event.target.closest("[data-delete-id]");
    if (viewButton) openReservation(viewButton.dataset.viewId);
    if (deleteButton) { deleteButton.disabled = true; await deleteReservation(deleteButton.dataset.deleteId); deleteButton.disabled = false; }
  });

  modal.addEventListener("click", event => { if (event.target.matches("[data-close-modal]")) closeModal(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.hidden) closeModal(); });

  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    logoutButton.textContent = "Logging out...";
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      alert(error.message);
      logoutButton.disabled = false;
      logoutButton.textContent = "Logout";
      return;
    }
    sessionStorage.clear();
    window.location.replace("admin-login.html");
  });

  (async () => { if (await checkLogin()) await loadReservations(); })();
})();
