const SUPABASE_URL = "https://crnlfpuipepolflqcwuo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_bW_x_9cHxqhuxkYdZ-g4kQ_3UAukGRV";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("academyRegistration");
  if (form) {
    const params = new URLSearchParams(window.location.search);
    const requestedTrack = params.get("track");
    if (requestedTrack) {
      const track = form.querySelector("#track");
      const option = [...track.options].find(o => o.value === requestedTrack || o.textContent.trim() === requestedTrack);
      if (option) track.value = option.value;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const successBox = document.getElementById("registrationSuccess");
      const errorBox = document.getElementById("registrationError");
      const submit = document.getElementById("registrationSubmit");
      successBox?.classList.add("hide");
      errorBox?.classList.add("hide");

      if (!form.reportValidity()) return;

      const honeypot = form.querySelector('input[name="_honey"]');
      if (honeypot && honeypot.value) return;

      const oldLabel = submit?.textContent || "إرسال طلب التسجيل";
      if (submit) {
        submit.textContent = "جارٍ إرسال الطلب...";
        submit.disabled = true;
        submit.classList.add("submit-loading");
      }

      const payload = {
        full_name: form.querySelector("#fullName").value.trim(),
        age: Number(form.querySelector("#age").value),
        country_city: form.querySelector("#country").value.trim(),
        whatsapp: form.querySelector("#whatsapp").value.trim(),
        track: form.querySelector("#track").value,
        level: form.querySelector("#level").value,
        preferred_time: form.querySelector("#time").value,
        notes: [
          `التسجيل لـ: ${form.querySelector("#studentType").value}`,
          form.querySelector("#notes").value.trim()
        ].filter(Boolean).join("\n"),
        status: "new"
      };

      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/registrations`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const detail = await response.text().catch(() => "");
          throw new Error(`Supabase ${response.status}: ${detail}`);
        }

        form.querySelectorAll(".form-grid input, .form-grid select, .form-grid textarea").forEach(el => el.disabled = true);
        successBox?.classList.remove("hide");
        submit?.classList.add("hide");
        successBox?.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (error) {
        console.error("Academy registration error:", error);
        errorBox?.classList.remove("hide");
      } finally {
        if (submit && !submit.classList.contains("hide")) {
          submit.textContent = oldLabel;
          submit.disabled = false;
          submit.classList.remove("submit-loading");
        }
      }
    });
  }

  document.querySelectorAll("[data-demo-alert]").forEach(el => {
    el.addEventListener("click", e => { e.preventDefault(); alert("هذه الخاصية قيد التجهيز."); });
  });
});
