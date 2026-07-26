const SUPABASE_URL = "https://crnlfpuipepolflqcwuo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_bW_x_9cHxqhuxkYdZ-g4kQ_3UAukGRV";
const SESSION_KEY = "rasheed_admin_session_v1";

function getSession(){
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
}
function setSession(session){ localStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
function clearSession(){ localStorage.removeItem(SESSION_KEY); }

async function refreshSession(session){
  if(!session?.refresh_token) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method:"POST",
    headers:{"apikey":SUPABASE_PUBLISHABLE_KEY,"Content-Type":"application/json"},
    body:JSON.stringify({refresh_token:session.refresh_token})
  });
  if(!res.ok) return null;
  const next = await res.json();
  setSession(next);
  return next;
}

async function api(path, options = {}, retry = true){
  let session = getSession();
  if(!session?.access_token) throw new Error("NO_SESSION");
  const headers = {
    "apikey": SUPABASE_PUBLISHABLE_KEY,
    "Authorization": `Bearer ${session.access_token}`,
    "Content-Type":"application/json",
    ...(options.headers || {})
  };
  let res = await fetch(`${SUPABASE_URL}${path}`, {...options, headers});
  if(res.status === 401 && retry){
    session = await refreshSession(session);
    if(!session) throw new Error("SESSION_EXPIRED");
    res = await fetch(`${SUPABASE_URL}${path}`, {
      ...options,
      headers:{...headers,"Authorization":`Bearer ${session.access_token}`}
    });
  }
  return res;
}

async function requireAdmin(){
  const session = getSession();
  if(!session?.access_token){ window.location.replace("../login.html?next=admin"); return false; }
  const res = await api("/rest/v1/registrations?select=id&limit=1").catch(()=>null);
  if(!res || res.status === 401){ clearSession(); window.location.replace("../login.html?expired=1"); return false; }
  if(res.status === 403){
    document.body.innerHTML = `<main class="page"><div class="container" style="max-width:720px"><div class="panel"><h1 class="page-title">الحساب غير مخوّل كمدير</h1><p class="muted">تم تسجيل الدخول، لكن هذا الحساب لم يُضف بعد إلى قائمة مديري الأكاديمية في Supabase.</p><a class="btn btn-primary" href="../login.html" id="logoutBlocked">العودة لتسجيل الدخول</a></div></div></main>`;
    document.getElementById("logoutBlocked")?.addEventListener("click",()=>clearSession());
    return false;
  }
  return res.ok;
}

function esc(value){
  return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}
function statusLabel(s){
  return ({new:"جديد",reviewed:"تمت المراجعة",contacted:"تم التواصل",accepted:"مقبول",rejected:"مرفوض",deferred:"مؤجل"})[s] || s || "جديد";
}
function fmtDate(v){
  if(!v) return "—";
  return new Intl.DateTimeFormat("ar-SA",{dateStyle:"medium",timeStyle:"short"}).format(new Date(v));
}

async function loadRegistrations(){
  const ok = await requireAdmin(); if(!ok) return;
  const res = await api("/rest/v1/registrations?select=*&order=created_at.desc");
  if(!res.ok){ throw new Error(await res.text()); }
  const rows = await res.json();
  window.__registrations = rows;
  renderRegistrations(rows);
  renderSummary(rows);
}

function renderSummary(rows){
  document.querySelectorAll("[data-kpi]").forEach(el=>{
    const key = el.dataset.kpi;
    let n = rows.length;
    if(key !== "all") n = rows.filter(r => (r.status || "new") === key).length;
    el.textContent = n;
  });
}

function renderRegistrations(rows){
  const tbody = document.getElementById("registrationsBody");
  if(!tbody) return;
  const q = (document.getElementById("searchBox")?.value || "").trim().toLowerCase();
  const sf = document.getElementById("statusFilter")?.value || "";
  const filtered = rows.filter(r => {
    const hay = [r.full_name,r.whatsapp,r.country_city,r.track,r.level,r.notes].join(" ").toLowerCase();
    return (!q || hay.includes(q)) && (!sf || (r.status || "new") === sf);
  });
  if(!filtered.length){
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--muted)">لا توجد طلبات مطابقة.</td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(r => {
    const phone = String(r.whatsapp || "").replace(/[^0-9]/g,"");
    const wa = phone ? `https://wa.me/${phone}` : "#";
    return `<tr>
      <td><strong>${esc(r.full_name)}</strong><br><small>${esc(fmtDate(r.created_at))}</small></td>
      <td>${esc(r.age)}</td>
      <td>${esc(r.country_city)}</td>
      <td><a href="${wa}" target="_blank" rel="noopener">${esc(r.whatsapp)}</a></td>
      <td>${esc(r.track)}</td>
      <td>${esc(r.level)}</td>
      <td>${esc(r.preferred_time)}</td>
      <td><select class="status-select" data-id="${esc(r.id)}">
        ${["new","reviewed","contacted","accepted","deferred","rejected"].map(s=>`<option value="${s}" ${(r.status||"new")===s?"selected":""}>${statusLabel(s)}</option>`).join("")}
      </select></td>
      <td class="row-actions">
        <button class="btn btn-light details-btn" data-id="${esc(r.id)}" type="button">التفاصيل</button>
        ${(r.status||"new")==="accepted" ? `<button class="btn btn-primary convert-student-btn" data-id="${esc(r.id)}" type="button">تحويل إلى طالب</button>` : ""}
      </td>
    </tr>`;
  }).join("");

  tbody.querySelectorAll(".status-select").forEach(sel=>sel.addEventListener("change", async e=>{
    const id = e.currentTarget.dataset.id;
    const status = e.currentTarget.value;
    e.currentTarget.disabled = true;
    const res = await api(`/rest/v1/registrations?id=eq.${encodeURIComponent(id)}`,{
      method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify({status})
    });
    e.currentTarget.disabled = false;
    if(!res.ok){ alert("تعذر تحديث الحالة."); return; }
    const row = window.__registrations.find(x=>String(x.id)===String(id)); if(row) row.status=status;
    renderSummary(window.__registrations);
    renderRegistrations(window.__registrations);
  }));
  tbody.querySelectorAll(".details-btn").forEach(btn=>btn.addEventListener("click",()=>showDetails(btn.dataset.id)));
  tbody.querySelectorAll(".convert-student-btn").forEach(btn=>btn.addEventListener("click",()=>convertRegistrationToStudent(btn.dataset.id, btn)));
}

function showDetails(id){
  const r = window.__registrations?.find(x=>String(x.id)===String(id)); if(!r) return;
  const dlg = document.getElementById("detailsDialog");
  document.getElementById("detailsContent").innerHTML = `
    <div class="details-grid">
      <div><b>الاسم</b><span>${esc(r.full_name)}</span></div><div><b>العمر</b><span>${esc(r.age)}</span></div>
      <div><b>الدولة / المدينة</b><span>${esc(r.country_city)}</span></div><div><b>واتساب</b><span>${esc(r.whatsapp)}</span></div>
      <div><b>المسار</b><span>${esc(r.track)}</span></div><div><b>المستوى</b><span>${esc(r.level)}</span></div>
      <div><b>الوقت المفضل</b><span>${esc(r.preferred_time)}</span></div><div><b>التاريخ</b><span>${esc(fmtDate(r.created_at))}</span></div>
      <div style="grid-column:1/-1"><b>الملاحظات</b><span style="white-space:pre-wrap">${esc(r.notes || "لا توجد ملاحظات")}</span></div>
    </div>`;
  dlg?.showModal();
}


function extractStudentType(notes){
  const text = String(notes || "");
  const match = text.match(/التسجيل\s*لـ:\s*([^\n\r]+)/);
  return match ? match[1].trim() : "";
}

async function studentExistsForRegistration(registrationId){
  const res = await api(`/rest/v1/students?registration_id=eq.${encodeURIComponent(registrationId)}&select=id&limit=1`);
  if(!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  return rows.length > 0;
}

async function convertRegistrationToStudent(id, button){
  const r = window.__registrations?.find(x=>String(x.id)===String(id));
  if(!r) return;

  if((r.status || "new") !== "accepted"){
    alert("يجب أن تكون حالة الطلب «مقبول» قبل تحويله إلى طالب.");
    return;
  }

  button.disabled = true;
  const oldText = button.textContent;
  button.textContent = "جارٍ التحويل...";

  try{
    if(await studentExistsForRegistration(r.id)){
      alert("تم تحويل هذا الطلب إلى طالب بالفعل.");
      button.textContent = "تم التحويل";
      button.classList.add("converted");
      return;
    }

    const payload = {
      registration_id: r.id,
      full_name: r.full_name,
      age: r.age || null,
      country_city: r.country_city || null,
      whatsapp: r.whatsapp || null,
      track: r.track || null,
      level: r.level || null,
      preferred_time: r.preferred_time || null,
      student_type: extractStudentType(r.notes) || null,
      notes: r.notes || null,
      status: "active"
    };

    const res = await api("/rest/v1/students",{
      method:"POST",
      headers:{"Prefer":"return=minimal"},
      body:JSON.stringify(payload)
    });

    if(!res.ok) throw new Error(await res.text());

    button.textContent = "تم التحويل";
    button.classList.add("converted");
    alert("تم إنشاء ملف الطالب بنجاح.");
  }catch(err){
    console.error("Convert student error:", err);
    alert("تعذر تحويل الطلب إلى طالب. تحقق من جدول students والصلاحيات.");
    button.textContent = oldText;
    button.disabled = false;
  }
}

function studentStatusLabel(s){
  return ({active:"نشط",paused:"موقوف مؤقتًا",completed:"مكتمل",inactive:"غير نشط"})[s] || s || "نشط";
}

async function loadStudents(){
  const ok = await requireAdmin(); if(!ok) return;
  const res = await api("/rest/v1/students?select=*&order=created_at.desc");
  if(!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  window.__students = rows;
  renderStudents(rows);
  document.querySelectorAll("[data-student-kpi]").forEach(el=>{
    const key = el.dataset.studentKpi;
    el.textContent = key === "all" ? rows.length : rows.filter(r=>(r.status||"active")===key).length;
  });
}

function renderStudents(rows){
  const tbody = document.getElementById("studentsBody");
  if(!tbody) return;
  const q = (document.getElementById("studentSearchBox")?.value || "").trim().toLowerCase();
  const sf = document.getElementById("studentStatusFilter")?.value || "";
  const filtered = rows.filter(r=>{
    const hay = [r.full_name,r.whatsapp,r.country_city,r.track,r.level].join(" ").toLowerCase();
    return (!q || hay.includes(q)) && (!sf || (r.status||"active")===sf);
  });

  if(!filtered.length){
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--muted)">لا يوجد طلاب مطابقون.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(r=>{
    const phone = String(r.whatsapp || "").replace(/[^0-9]/g,"");
    const wa = phone ? `https://wa.me/${phone}` : "#";
    return `<tr>
      <td><strong>${esc(r.full_name)}</strong><br><small>${esc(fmtDate(r.created_at))}</small></td>
      <td>${esc(r.age)}</td>
      <td>${esc(r.country_city)}</td>
      <td><a href="${wa}" target="_blank" rel="noopener">${esc(r.whatsapp)}</a></td>
      <td>${esc(r.track)}</td>
      <td>${esc(r.level)}</td>
      <td>${esc(r.preferred_time)}</td>
      <td>${esc(r.student_type || "—")}</td>
      <td><select class="student-status-select" data-id="${esc(r.id)}">
        ${["active","paused","completed","inactive"].map(s=>`<option value="${s}" ${(r.status||"active")===s?"selected":""}>${studentStatusLabel(s)}</option>`).join("")}
      </select></td>
    </tr>`;
  }).join("");

  tbody.querySelectorAll(".student-status-select").forEach(sel=>sel.addEventListener("change", async e=>{
    const id = e.currentTarget.dataset.id;
    const status = e.currentTarget.value;
    e.currentTarget.disabled = true;
    const res = await api(`/rest/v1/students?id=eq.${encodeURIComponent(id)}`,{
      method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify({status})
    });
    e.currentTarget.disabled = false;
    if(!res.ok){ alert("تعذر تحديث حالة الطالب."); return; }
    const row = window.__students.find(x=>String(x.id)===String(id)); if(row) row.status=status;
  }));
}

async function doLogin(form){
  const email = form.querySelector("#email").value.trim();
  const password = form.querySelector("#password").value;
  const box = document.getElementById("loginError"); box.classList.add("hide");
  const btn = form.querySelector("button[type=submit]"); btn.disabled=true; btn.textContent="جارٍ تسجيل الدخول...";
  try{
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{
      method:"POST",headers:{"apikey":SUPABASE_PUBLISHABLE_KEY,"Content-Type":"application/json"},
      body:JSON.stringify({email,password})
    });
    if(!res.ok) throw new Error("LOGIN_FAILED");
    const session = await res.json(); setSession(session);
    const test = await api("/rest/v1/registrations?select=id&limit=1");
    if(test.status === 403){ clearSession(); box.textContent="تم تسجيل الدخول، لكن هذا الحساب غير مخوّل كمدير."; box.classList.remove("hide"); return; }
    if(!test.ok) throw new Error("ADMIN_CHECK_FAILED");
    window.location.href="admin/dashboard.html";
  }catch(err){
    box.textContent="تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور، ومن تفعيل الحساب كمدير."; box.classList.remove("hide");
  }finally{btn.disabled=false;btn.textContent="دخول المدير";}
}

function wireCommon(){
  document.querySelectorAll("[data-admin-logout]").forEach(btn=>btn.addEventListener("click",e=>{e.preventDefault();clearSession();window.location.href="../login.html";}));
  document.getElementById("searchBox")?.addEventListener("input",()=>renderRegistrations(window.__registrations||[]));
  document.getElementById("statusFilter")?.addEventListener("change",()=>renderRegistrations(window.__registrations||[]));
  document.getElementById("studentSearchBox")?.addEventListener("input",()=>renderStudents(window.__students||[]));
  document.getElementById("studentStatusFilter")?.addEventListener("change",()=>renderStudents(window.__students||[]));
  document.getElementById("closeDialog")?.addEventListener("click",()=>document.getElementById("detailsDialog")?.close());
}

document.addEventListener("DOMContentLoaded",()=>{
  wireCommon();
  const loginForm=document.getElementById("adminLoginForm"); if(loginForm) loginForm.addEventListener("submit",e=>{e.preventDefault();doLogin(loginForm);});
  if(document.body.dataset.adminPage === "registrations") loadRegistrations().catch(err=>{console.error(err);document.getElementById("loadError")?.classList.remove("hide");});
  if(document.body.dataset.adminPage === "dashboard") loadRegistrations().catch(err=>{console.error(err);document.getElementById("loadError")?.classList.remove("hide");});
  if(document.body.dataset.adminPage === "students") loadStudents().catch(err=>{console.error(err);document.getElementById("loadError")?.classList.remove("hide");});
});
