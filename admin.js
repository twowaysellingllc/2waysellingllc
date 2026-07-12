const SUPABASE_URL = "https://ymcpxaheusrxgmgitceu.supabase.co";
const SUPABASE_KEY = "sb_publishable_WYKUu85jk5xwMutqo6Ex3Q_q6PvtOK4";

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

    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    data.forEach(r => {

        tbody.innerHTML += `
        <tr>
            <td>${r.name}</td>
            <td>${r.email}</td>
            <td>${r.car}</td>
            <td>${r.pickup_date}</td>
            <td>${r.return_date}</td>
            <td>${r.payment_status}</td>
            <td>
                <button onclick="deleteReservation('${r.id}')">
                    Delete
                </button>
            </td>
        </tr>
        `;
    });

}

async function deleteReservation(id) {

    if (!confirm("Delete reservation?")) return;

    await supabase
        .from("reservations")
        .delete()
        .eq("id", id);

    loadReservations();
}

document.getElementById("logout").onclick = async () => {

    await supabase.auth.signOut();

    window.location.href = "admin-login.html";

};

checkLogin();