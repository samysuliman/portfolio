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

      try {
        const formData = new FormData(form);
        formData.append("تاريخ الإرسال", new Date().toLocaleString("ar-SA"));
        formData.append("رابط الصفحة", window.location.href);

        const response = await fetch("https://formsubmit.co/ajax/samysuliman15@gmail.com", {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: formData
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success === "false" || result.success === false) {
          throw new Error(result.message || "Submission failed");
        }

        form.querySelectorAll(".form-grid input, .form-grid select, .form-grid textarea").forEach(el => el.disabled = true);
        successBox?.classList.remove("hide");
        submit?.classList.add("hide");
        successBox?.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (error) {
        console.error("Academy registration error:", error);
        errorBox?.classList.remove("hide");
      } finally {
        if (submit) {
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