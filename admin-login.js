(() => {
  const SUPABASE_URL =
    "https://ymcpxaheusrxgmgitceu.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_WYKUu85jk5xwMutqo6Ex3Q_q6PvtOK4";

  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("error");
  const loginButton = loginForm.querySelector('button[type="submit"]');

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    errorMessage.textContent = "";
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    const email = document
      .getElementById("email")
      .value
      .trim();

    const password = document
      .getElementById("password")
      .value;

    try {
      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

      if (error) {
        errorMessage.textContent = error.message;
        return;
      }

      if (!data.session) {
        errorMessage.textContent =
          "Login succeeded, but no active session was created.";
        return;
      }

      window.location.href = "admin.html";
    } catch (error) {
      console.error("Admin login error:", error);

      errorMessage.textContent =
        "Unable to log in. Please try again.";
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Login";
    }
  });
})();