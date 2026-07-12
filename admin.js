(() => {
  const SUPABASE_URL =
    "https://ymcpxaheusrxgmgitceu.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_WYKUu85jk5xwMutqo6Ex3Q_q6PvtOK4";

  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  const tableBody = document.getElementById("tableBody");
  const searchInput = document.getElementById("search");
  const logoutButton = document.getElementById("logout");
  const dashboardMessage =
    document.getElementById("dashboardMessage");

  const modal =
    document.getElementById("reservationModal");

  const modalContent =
    document.getElementById("modalContent");

  let reservations = [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(value) {
    return String(value ?? "")
      .trim()
      .toLowerCase();
  }

  function setMessage(message = "", isError = false) {
    if (!dashboardMessage) {
      return;
    }

    dashboardMessage.textContent = message;

    dashboardMessage.classList.toggle(
      "error",
      isError
    );
  }

  async function checkLogin() {
    const { data, error } =
      await supabaseClient.auth.getSession();

    if (error || !data.session) {
      window.location.replace(
        "admin-login.html"
      );

      return false;
    }

    return true;
  }

  function updateStatistics(data) {
    const totalBookings =
      document.getElementById("totalBookings");

    const paidBookings =
      document.getElementById("paidBookings");

    const pendingBookings =
      document.getElementById("pendingBookings");

    const confirmedBookings =
      document.getElementById("confirmedBookings");

    if (totalBookings) {
      totalBookings.textContent = data.length;
    }

    if (paidBookings) {
      paidBookings.textContent =
        data.filter(
          reservation =>
            normalize(
              reservation.payment_status
            ) === "paid"
        ).length;
    }

    if (pendingBookings) {
      pendingBookings.textContent =
        data.filter(reservation => {
          const status = normalize(
            reservation.payment_status
          );

          return (
            status === "pending" ||
            status === "pending payment"
          );
        }).length;
    }

    if (confirmedBookings) {
      confirmedBookings.textContent =
        data.filter(
          reservation =>
            normalize(
              reservation.reservation_status
            ) === "confirmed"
        ).length;
    }
  }

  function paymentOptions(currentValue) {
    const options = [
      "Pending Payment",
      "Paid"
    ];

    return options
      .map(value => {
        const selected =
          normalize(currentValue) ===
          normalize(value)
            ? "selected"
            : "";

        return `
          <option
            value="${value}"
            ${selected}
          >
            ${value}
          </option>
        `;
      })
      .join("");
  }

  function reservationOptions(currentValue) {
    const options = [
      "Pending",
      "Confirmed",
      "Cancelled",
      "Completed"
    ];

    return options
      .map(value => {
        const selected =
          normalize(currentValue) ===
          normalize(value)
            ? "selected"
            : "";

        return `
          <option
            value="${value}"
            ${selected}
          >
            ${value}
          </option>
        `;
      })
      .join("");
  }

  function renderReservations(data) {
    if (!tableBody) {
      return;
    }

    if (!data.length) {
      tableBody.innerHTML = `
        <tr>
          <td
            colspan="12"
            class="empty-state"
          >
            No reservations found.
          </td>
        </tr>
      `;

      return;
    }

    tableBody.innerHTML = data
      .map(reservation => {
        return `
          <tr>

            <td>
              ${escapeHtml(
                reservation.reservation_id
              )}
            </td>

            <td>
              ${escapeHtml(
                reservation.full_name
              )}
            </td>

            <td>
              ${escapeHtml(
                reservation.email
              )}
            </td>

            <td>
              ${escapeHtml(
                reservation.phone
              )}
            </td>

            <td>
              ${escapeHtml(
                reservation.vehicle
              )}
            </td>

            <td>
              ${escapeHtml(
                reservation.pickup_location
              )}
            </td>

            <td>
              ${escapeHtml(
                reservation.return_location
              )}
            </td>

            <td>
              ${escapeHtml(
                reservation.pickup_date
              )}
            </td>

            <td>
              ${escapeHtml(
                reservation.return_date
              )}
            </td>

            <td>
              <select
                class="status-select"
                data-payment-id="${reservation.id}"
                aria-label="Payment status"
              >
                ${paymentOptions(
                  reservation.payment_status
                )}
              </select>
            </td>

            <td>
              <select
                class="status-select"
                data-reservation-id="${reservation.id}"
                aria-label="Reservation status"
              >
                ${reservationOptions(
                  reservation.reservation_status
                )}
              </select>
            </td>

            <td>
              <div class="actions">

                <button
                  class="action-btn view-btn"
                  type="button"
                  data-view-id="${reservation.id}"
                >
                  View
                </button>

                <button
                  class="action-btn delete-btn"
                  type="button"
                  data-delete-id="${reservation.id}"
                >
                  Delete
                </button>

              </div>
            </td>

          </tr>
        `;
      })
      .join("");
  }

  async function loadReservations() {
    setMessage(
      "Loading reservations..."
    );

    const { data, error } =
      await supabaseClient
        .from("reservations")
        .select("*")
        .order(
          "created_at",
          { ascending: false }
        );

    if (error) {
      console.error(
        "Unable to load reservations:",
        error
      );

      setMessage(
        error.message ||
          "Unable to load reservations.",
        true
      );

      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td
              colspan="12"
              class="empty-state"
            >
              Unable to load reservations.
            </td>
          </tr>
        `;
      }

      return;
    }

    reservations = data ?? [];

    updateStatistics(
      reservations
    );

    renderReservations(
      reservations
    );

    setMessage(
      `${reservations.length} reservation(s) loaded.`
    );
  }

  async function updatePaymentStatus(
    id,
    value
  ) {
    const { error } =
      await supabaseClient
        .from("reservations")
        .update({
          payment_status: value
        })
        .eq("id", id);

    if (error) {
      alert(error.message);

      await loadReservations();

      return;
    }

    setMessage(
      "Payment status updated."
    );

    await loadReservations();
  }

  async function updateReservationStatus(
    id,
    value
  ) {
    const { error } =
      await supabaseClient
        .from("reservations")
        .update({
          reservation_status: value
        })
        .eq("id", id);

    if (error) {
      alert(error.message);

      await loadReservations();

      return;
    }

    setMessage(
      "Reservation status updated."
    );

    await loadReservations();
  }

  function openReservation(id) {
    const reservation =
      reservations.find(
        item =>
          String(item.id) ===
          String(id)
      );

    if (!reservation) {
      alert(
        "Reservation not found."
      );

      return;
    }

    if (!modal || !modalContent) {
      alert(
        [
          `Reservation ID: ${reservation.reservation_id}`,
          `Customer: ${reservation.full_name}`,
          `Email: ${reservation.email}`,
          `Phone: ${reservation.phone}`,
          `Vehicle: ${reservation.vehicle}`,
          `Pickup: ${reservation.pickup_location}`,
          `Return: ${reservation.return_location}`,
          `Pickup Date: ${reservation.pickup_date}`,
          `Return Date: ${reservation.return_date}`,
          `Payment: ${reservation.payment_status}`,
          `Status: ${reservation.reservation_status}`,
          `Message: ${reservation.message || "None"}`
        ].join("\n\n")
      );

      return;
    }

    modalContent.innerHTML = `
      <div class="detail-grid">

        <div class="detail-item">
          <strong>Reservation ID</strong>
          ${escapeHtml(
            reservation.reservation_id
          )}
        </div>

        <div class="detail-item">
          <strong>Created</strong>
          ${escapeHtml(
            reservation.created_at
          )}
        </div>

        <div class="detail-item">
          <strong>Customer</strong>
          ${escapeHtml(
            reservation.full_name
          )}
        </div>

        <div class="detail-item">
          <strong>Email</strong>
          ${escapeHtml(
            reservation.email
          )}
        </div>

        <div class="detail-item">
          <strong>Phone</strong>
          ${escapeHtml(
            reservation.phone
          )}
        </div>

        <div class="detail-item">
          <strong>Vehicle</strong>
          ${escapeHtml(
            reservation.vehicle
          )}
        </div>

        <div class="detail-item">
          <strong>Pickup Location</strong>
          ${escapeHtml(
            reservation.pickup_location
          )}
        </div>

        <div class="detail-item">
          <strong>Return Location</strong>
          ${escapeHtml(
            reservation.return_location
          )}
        </div>

        <div class="detail-item">
          <strong>Pickup Date</strong>
          ${escapeHtml(
            reservation.pickup_date
          )}
        </div>

        <div class="detail-item">
          <strong>Return Date</strong>
          ${escapeHtml(
            reservation.return_date
          )}
        </div>

        <div class="detail-item">
          <strong>Payment</strong>
          ${escapeHtml(
            reservation.payment_status
          )}
        </div>

        <div class="detail-item">
          <strong>Status</strong>
          ${escapeHtml(
            reservation.reservation_status
          )}
        </div>

        <div class="detail-item detail-wide">
          <strong>Special Requests</strong>
          ${escapeHtml(
            reservation.message || "None"
          )}
        </div>

      </div>
    `;

    modal.hidden = false;
  }

  function closeModal() {
    if (modal) {
      modal.hidden = true;
    }
  }

  async function deleteReservation(id) {
    const reservation =
      reservations.find(
        item =>
          String(item.id) ===
          String(id)
      );

    const label =
      reservation?.reservation_id || id;

    const confirmed =
      window.confirm(
        `Delete reservation ${label}? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    const { error } =
      await supabaseClient
        .from("reservations")
        .delete()
        .eq("id", id);

    if (error) {
      alert(error.message);

      return;
    }

    setMessage(
      "Reservation deleted."
    );

    await loadReservations();
  }

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      () => {
        const query =
          normalize(
            searchInput.value
          );

        const filtered =
          reservations.filter(
            reservation =>
              Object.values(
                reservation
              ).some(value =>
                normalize(value).includes(
                  query
                )
              )
          );

        renderReservations(
          filtered
        );
      }
    );
  }

  if (tableBody) {
    tableBody.addEventListener(
      "change",
      async event => {
        const paymentId =
          event.target.dataset.paymentId;

        const reservationId =
          event.target.dataset
            .reservationId;

        if (paymentId) {
          event.target.disabled = true;

          await updatePaymentStatus(
            paymentId,
            event.target.value
          );
        }

        if (reservationId) {
          event.target.disabled = true;

          await updateReservationStatus(
            reservationId,
            event.target.value
          );
        }
      }
    );

    tableBody.addEventListener(
      "click",
      async event => {
        const viewButton =
          event.target.closest(
            "[data-view-id]"
          );

        const deleteButton =
          event.target.closest(
            "[data-delete-id]"
          );

        if (viewButton) {
          openReservation(
            viewButton.dataset.viewId
          );
        }

        if (deleteButton) {
          deleteButton.disabled = true;

          await deleteReservation(
            deleteButton.dataset.deleteId
          );

          deleteButton.disabled = false;
        }
      }
    );
  }

  if (modal) {
    modal.addEventListener(
      "click",
      event => {
        if (
          event.target.matches(
            "[data-close-modal]"
          )
        ) {
          closeModal();
        }
      }
    );
  }

  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Escape" &&
        modal &&
        !modal.hidden
      ) {
        closeModal();
      }
    }
  );

  if (logoutButton) {
    logoutButton.addEventListener(
      "click",
      async () => {
        logoutButton.disabled = true;

        logoutButton.textContent =
          "Logging out...";

        const { error } =
          await supabaseClient.auth.signOut();

        if (error) {
          alert(error.message);

          logoutButton.disabled = false;

          logoutButton.textContent =
            "Logout";

          return;
        }

        sessionStorage.clear();

        window.location.replace(
          "admin-login.html"
        );
      }
    );
  }

  async function initialize() {
    const isLoggedIn =
      await checkLogin();

    if (isLoggedIn) {
      await loadReservations();
    }
  }

  initialize();
})();