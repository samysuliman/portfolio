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
      <td><button class="btn btn-light details-btn" data-id="${esc(r.id)}" type="button">التفاصيل</button></td>
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
  }));
  tbody.querySelectorAll(".details-btn").forEach(btn=>btn.addEventListener("click",()=>showDetails(btn.dataset.id)));
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
  document.getElementById("closeDialog")?.addEventListener("click",()=>document.getElementById("detailsDialog")?.close());
}

document.addEventListener("DOMContentLoaded",()=>{
  wireCommon();
  const loginForm=document.getElementById("adminLoginForm"); if(loginForm) loginForm.addEventListener("submit",e=>{e.preventDefault();doLogin(loginForm);});
  if(document.body.dataset.adminPage === "registrations") loadRegistrations().catch(err=>{console.error(err);document.getElementById("loadError")?.classList.remove("hide");});
  if(document.body.dataset.adminPage === "dashboard") loadRegistrations().catch(err=>{console.error(err);document.getElementById("loadError")?.classList.remove("hide");});
});
