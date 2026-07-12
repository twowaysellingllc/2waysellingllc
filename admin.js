const SUPABASE_URL = "https://ymcpxaheusrxgmgitceu.supabase.co";
const SUPABASE_KEY ="sb_publishable_WYKUu85jk5xwMutqo6Ex3Q_q6PvtOK4";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

async function checkLogin() {

    const { data } = await supabase.auth.getSession();

    if (!data.session) {
        window.location.href = "admin-login.html";
        return;
    }

    loadReservations();
}

async function loadReservations() {

    const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    //-----------------------
    // Dashboard Cards
    //-----------------------

    document.getElementById("totalBookings").textContent =
        data.length;

    document.getElementById("paidBookings").textContent =
        data.filter(r => r.payment_status === "Paid").length;

    document.getElementById("pendingBookings").textContent =
        data.filter(r => r.payment_status === "Pending Payment").length;

    document.getElementById("confirmedBookings").textContent =
        data.filter(r => r.reservation_status === "Confirmed").length;

    //-----------------------
    // Table
    //-----------------------

    const tbody = document.getElementById("tableBody");

    tbody.innerHTML = "";

    data.forEach(r => {

        let paymentBadge =
            r.payment_status === "Paid"
            ? "status-paid"
            : "status-pending";

        let reservationBadge =
            r.reservation_status === "Confirmed"
            ? "status-confirmed"
            : "status-cancelled";

        tbody.innerHTML += `

<tr>

<td>${r.reservation_id}</td>

<td>${r.full_name}</td>

<td>${r.email}</td>

<td>${r.phone}</td>

<td>${r.vehicle}</td>

<td>${r.pickup_location}</td>

<td>${r.return_location}</td>

<td>${r.pickup_date}</td>

<td>${r.return_date}</td>

<td>

<span class="${paymentBadge}">
${r.payment_status}
</span>

</td>

<td>

<span class="${reservationBadge}">
${r.reservation_status}
</span>

</td>

<td>

<button
class="delete-btn"
onclick="deleteReservation(${r.id})">

Delete

</button>

</td>

</tr>

`;

    });

}

async function deleteReservation(id) {

    if (!confirm("Delete this reservation?"))
        return;

    const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    loadReservations();

}

document
.getElementById("search")
.addEventListener("keyup", function () {

    let value = this.value.toLowerCase();

    document
    .querySelectorAll("#tableBody tr")
    .forEach(row => {

        row.style.display =
            row.innerText
                .toLowerCase()
                .includes(value)
                ? ""
                : "none";

    });

});

document
.getElementById("logout")
.onclick = async () => {

    await supabase.auth.signOut();

    window.location.href = "admin-login.html";

};

checkLogin();