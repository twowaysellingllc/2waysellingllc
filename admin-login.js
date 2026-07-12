const SUPABASE_URL = "https://ymcpxaheusrxgmgitceu.supabase.co";
const SUPABASE_KEY = "sb_publishable_WYKUu85jk5xwMutqo6Ex3Q_q6PvtOK4";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

   const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
});

console.log("DATA:", data);
console.log("ERROR:", error);

    if (error) {
        document.getElementById("error").innerHTML = error.message;
        return;
    }

    window.location.href = "admin.html";

});