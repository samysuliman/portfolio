
document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("[data-demo-form]");
  forms.forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const box = form.querySelector("[data-success]");
      if (box) box.classList.remove("hide");
      form.querySelectorAll("input,select,button").forEach(el => el.disabled = true);
    });
  });

  document.querySelectorAll("[data-demo-alert]").forEach(el => {
    el.addEventListener("click", e => {
      e.preventDefault();
      alert("هذه وظيفة تجريبية في النموذج الأول. سيتم ربطها بالنظام الحقيقي لاحقًا.");
    });
  });
});
