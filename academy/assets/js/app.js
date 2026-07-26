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
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const v = id => form.querySelector("#" + id)?.value.trim() || "—";
      const message = `السلام عليكم ورحمة الله وبركاته
أرغب في التسجيل في أكاديمية رشيد.

الاسم: ${v("fullName")}
العمر: ${v("age")}
الدولة/المدينة: ${v("country")}
رقم واتساب: ${v("whatsapp")}
التسجيل لـ: ${v("studentType")}
المسار المطلوب: ${v("track")}
المستوى الحالي: ${v("level")}
الوقت المفضل: ${v("time")}
الملاحظات/الهدف: ${v("notes")}

تم إرسال الطلب من موقع أكاديمية رشيد.`;
      const url = "https://wa.me/966559461920?text=" + encodeURIComponent(message);
      const box = document.getElementById("registrationSuccess");
      if (box) box.classList.remove("hide");
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  document.querySelectorAll("[data-demo-alert]").forEach(el => {
    el.addEventListener("click", e => { e.preventDefault(); alert("هذه الخاصية قيد التجهيز."); });
  });
});