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


async function loadConvertedRegistrationIds(){
  const res = await api("/rest/v1/students?select=registration_id&registration_id=not.is.null");
  if(!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  window.__convertedRegistrationIds = new Set(rows.map(r=>String(r.registration_id)));
}

async function loadRegistrations(){
  const ok = await requireAdmin(); if(!ok) return;
  const res = await api("/rest/v1/registrations?select=*&order=created_at.desc");
  if(!res.ok){ throw new Error(await res.text()); }
  const rows = await res.json();
  window.__registrations = rows;
  try { await loadConvertedRegistrationIds(); }
  catch(err){ console.error("Converted registrations lookup error:", err); window.__convertedRegistrationIds = new Set(); }
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
        ${window.__convertedRegistrationIds?.has(String(r.id))
          ? `<button class="btn btn-light converted" type="button" disabled>تم التحويل ✓</button>`
          : ((r.status||"new")==="accepted"
              ? `<button class="btn btn-primary convert-student-btn" data-id="${esc(r.id)}" type="button">تحويل إلى طالب</button>`
              : "")}
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
      window.__convertedRegistrationIds = window.__convertedRegistrationIds || new Set();
      window.__convertedRegistrationIds.add(String(r.id));
      renderRegistrations(window.__registrations || []);
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

    window.__convertedRegistrationIds = window.__convertedRegistrationIds || new Set();
    window.__convertedRegistrationIds.add(String(r.id));
    alert("تم إنشاء ملف الطالب بنجاح.");
    renderRegistrations(window.__registrations || []);
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
      <td><a class="btn btn-light" href="student-record.html?id=${encodeURIComponent(r.id)}">فتح السجل</a></td>
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



function qparam(name){ return new URLSearchParams(location.search).get(name); }
function toDateInput(v){
  if(!v) return "";
  const d = new Date(v);
  if(Number.isNaN(d.getTime())) return String(v).slice(0,10);
  return d.toISOString().slice(0,10);
}
function autoStudentCode(id){
  const n = String(id ?? "").replace(/\D/g, "");
  return `RA-S${(n || "0").padStart(4,"0")}`;
}
async function loadStudentRecord(){
  const ok = await requireAdmin(); if(!ok) return;
  const id = qparam("id");
  const errorBox = document.getElementById("recordError");
  const form = document.getElementById("studentRecordForm");
  if(!id){
    errorBox.textContent = "لم يتم تحديد الطالب."; errorBox.classList.remove("hide"); return;
  }
  try{
    const [studentRes, teacherRes] = await Promise.all([
      api(`/rest/v1/students?id=eq.${encodeURIComponent(id)}&select=*&limit=1`),
      api('/rest/v1/teachers?select=id,full_name,teacher_code,status&order=full_name.asc').catch(()=>null)
    ]);
    if(!studentRes.ok) throw new Error(await studentRes.text());
    const rows = await studentRes.json();
    const r = rows[0];
    if(!r) throw new Error("STUDENT_NOT_FOUND");
    window.__currentStudentRecord = r;

    const teachers = teacherRes?.ok ? await teacherRes.json() : [];
    const teacherSelect = document.getElementById("sr_assigned_teacher_id");
    teachers.filter(t=>(t.status||"active")==="active").forEach(t=>{
      const opt=document.createElement("option"); opt.value=t.id; opt.textContent=`${t.full_name}${t.teacher_code?` — ${t.teacher_code}`:""}`; teacherSelect.appendChild(opt);
    });

    const vals = {
      full_name:r.full_name, student_code:r.student_code || autoStudentCode(r.id), age:r.age,
      country_city:r.country_city, whatsapp:r.whatsapp, enrollment_date:toDateInput(r.enrollment_date || r.created_at),
      student_type:r.student_type, status:r.status || "active", track:r.track, level:r.level,
      current_stage:r.current_stage || r.level || "", preferred_time:r.preferred_time,
      assigned_teacher_id:r.assigned_teacher_id || "", weekly_goal:r.weekly_goal,
      overall_progress:r.overall_progress ?? 0, attendance_rate:r.attendance_rate ?? 0, notes:r.notes
    };
    Object.entries(vals).forEach(([k,v])=>{ const el=document.getElementById(`sr_${k}`); if(el) el.value=v ?? ""; });
    document.getElementById("recordTitle").textContent = `سجل الطالب: ${r.full_name || "—"}`;
    document.getElementById("recordCode").textContent = `رقم الطالب: ${vals.student_code} • تاريخ الإنشاء: ${fmtDate(r.created_at)}`;
    const phone=String(r.whatsapp||"").replace(/[^0-9]/g,"");
    const wa=document.getElementById("studentWhatsappLink"); if(wa) wa.href=phone?`https://wa.me/${phone}`:"#";
    form.classList.remove("hide");
    initQuranRecordUI(r.quran_record);
  }catch(err){
    console.error("Student record load error:",err);
    errorBox.textContent = err.message === "STUDENT_NOT_FOUND" ? "لم يتم العثور على الطالب." : "تعذر تحميل سجل الطالب. تحقق من جدول students وصلاحياته.";
    errorBox.classList.remove("hide");
  }
}

async function saveStudentRecord(e){
  e.preventDefault();
  const r=window.__currentStudentRecord; if(!r) return;

  // حفظ موحّد: زر "حفظ سجل الطالب" يحفظ السجل القرآني أولًا ثم بقية بيانات الطالب.
  const quranOk = await saveQuranRecord({silent:true});
  if(!quranOk){
    const qStatus=document.getElementById('quranSaveStatus');
    if(qStatus) qStatus.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }
  const btn=document.getElementById("saveStudentRecord");
  const statusEl=document.getElementById("recordSaveStatus");
  const get=id=>document.getElementById(id)?.value ?? "";
  const nullable=v=>String(v).trim()===""?null:String(v).trim();
  const numOrZero=v=>Math.max(0,Math.min(100,Number(v)||0));
  const ageVal=get("sr_age");
  const payload={
    full_name:get("sr_full_name").trim(),
    student_code:nullable(get("sr_student_code")) || autoStudentCode(r.id),
    age:ageVal===""?null:Number(ageVal),
    country_city:nullable(get("sr_country_city")),
    whatsapp:nullable(get("sr_whatsapp")),
    enrollment_date:nullable(get("sr_enrollment_date")),
    student_type:nullable(get("sr_student_type")),
    status:get("sr_status") || "active",
    track:nullable(get("sr_track")), level:nullable(get("sr_level")),
    current_stage:nullable(get("sr_current_stage")), preferred_time:nullable(get("sr_preferred_time")),
    assigned_teacher_id:get("sr_assigned_teacher_id")?Number(get("sr_assigned_teacher_id")):null,
    weekly_goal:nullable(get("sr_weekly_goal")), overall_progress:numOrZero(get("sr_overall_progress")),
    attendance_rate:numOrZero(get("sr_attendance_rate")), notes:nullable(get("sr_notes")),
    updated_at:new Date().toISOString()
  };
  btn.disabled=true; btn.textContent="جارٍ الحفظ..."; statusEl.textContent="";
  try{
    const res=await api(`/rest/v1/students?id=eq.${encodeURIComponent(r.id)}`,{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify(payload)});
    if(!res.ok){ const text=await res.text(); if(text.includes("student_code")||text.includes("current_stage")||text.includes("updated_at")) throw new Error("SCHEMA_NOT_READY"); throw new Error(text); }
    const rows=await res.json(); window.__currentStudentRecord=rows[0]||{...r,...payload};
    statusEl.textContent="تم حفظ سجل الطالب والسجل القرآني بنجاح ✓";
    document.getElementById("recordCode").textContent=`رقم الطالب: ${payload.student_code} • آخر تحديث: ${fmtDate(payload.updated_at)}`;
  }catch(err){
    console.error("Student record save error:",err);
    statusEl.textContent = err.message === "SCHEMA_NOT_READY" ? "يجب تنفيذ ملف تهيئة سجل الطالب في Supabase أولًا." : "تعذر حفظ السجل. تحقق من الاتصال والصلاحيات.";
  }finally{ btn.disabled=false; btn.textContent="حفظ سجل الطالب"; }
}


const QURAN_SURAHS = [
"الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"
];
function normalizeQuranRecord(value){
  const base={tasmee:[],review:[],memorization:[],recitation:[]};
  if(!value) return base;
  try{
    const v=typeof value==='string'?JSON.parse(value):value;
    return {...base,...v,tasmee:Array.isArray(v?.tasmee)?v.tasmee:[],review:Array.isArray(v?.review)?v.review:[],memorization:Array.isArray(v?.memorization)?v.memorization:[],recitation:Array.isArray(v?.recitation)?v.recitation:[]};
  }catch{return base;}
}

function quranTypeLabel(type){
  return ({tasmee:'سور التسميع',review:'سور المراجعة',memorization:'الحفظ الجديد',recitation:'التلاوة وتصحيح القراءة'})[type]||'السور المختارة';
}
function renderSelectedSurahs(type){
  const holder=document.getElementById(type+'Selected'); if(!holder)return;
  const record=window.__quranRecord||normalizeQuranRecord();
  const items=record[type]||[];
  if(!items.length){
    holder.innerHTML=`<span class="quran-selected-empty">لم يتم اختيار سور بعد.</span>`;
    return;
  }
  holder.innerHTML=items.map((x,idx)=>{
    const no=Number(x.surahNo||x), name=x.surahName||QURAN_SURAHS[no-1]||'—';
    const range=(type==='memorization'||type==='recitation')&&x.fromAyah&&x.toAyah?` <small>${esc(x.fromAyah)}–${esc(x.toAyah)}</small>`:'';
    return `<span class="quran-chip"><span>${esc(name)}${range}</span><button type="button" title="إزالة ${esc(name)}" aria-label="إزالة ${esc(name)}" data-remove-selected="${type}" data-index="${idx}">×</button></span>`;
  }).join('');
}
function setPickerEditing(type,editing){
  const search=document.getElementById(type+'Search');
  const grid=document.getElementById(({tasmee:'tasmeeSurahs',review:'reviewSurahs',memorization:'memorizationSurahs',recitation:'recitationSurahs'})[type]);
  const details=grid?.closest('details.surah-picker');
  if(search) search.classList.toggle('quran-picker-hidden',!editing);
  if(details){details.classList.toggle('quran-picker-hidden',!editing);details.open=!!editing;}
  const b=document.querySelector(`[data-toggle-picker="${type}"]`);
  if(b) b.textContent=editing?'إغلاق قائمة السور':'+ إضافة سور';
}
function refreshQuranSelectedUI(){
  ['tasmee','review','memorization','recitation'].forEach(type=>{renderSelectedSurahs(type);setPickerEditing(type,false);});
}

function renderSurahChecklist(type){
  const ids={tasmee:'tasmeeSurahs',review:'reviewSurahs',memorization:'memorizationSurahs',recitation:'recitationSurahs'};
  const holder=document.getElementById(ids[type]); if(!holder) return;
  const record=window.__quranRecord||normalizeQuranRecord();
  // الحفظ الجديد والتلاوة سجلّان تاريخيان: المحفوظ سابقًا لا يُعاد تحديده كمسودة جديدة.
  const selected=(type==='memorization'||type==='recitation')
    ? new Set()
    : new Set((record[type]||[]).map(x=>Number(x.surahNo||x)));
  holder.innerHTML=QURAN_SURAHS.map((name,i)=>`<label class="surah-check" data-surah-name="${esc(name)}"><input type="checkbox" data-quran-check="${type}" value="${i+1}" ${selected.has(i+1)?'checked':''}><span>${i+1}. ${esc(name)}</span></label>`).join('');
  updateSurahCount(type);
}
function updateSurahCount(type){
  const count=document.querySelectorAll(`[data-quran-check="${type}"]:checked`).length;
  const ids={tasmee:'tasmeeCount',review:'reviewCount',memorization:'memorizationCount',recitation:'recitationCount'};
  const el=document.getElementById(ids[type]); if(el) el.textContent=`${count} محدد`;
}
function selectedSurahs(type){
  return [...document.querySelectorAll(`[data-quran-check="${type}"]:checked`)].map(el=>({surahNo:Number(el.value),surahName:QURAN_SURAHS[Number(el.value)-1]}));
}
function filterSurahs(type,query){
  const ids={tasmee:'tasmeeSurahs',review:'reviewSurahs',memorization:'memorizationSurahs',recitation:'recitationSurahs'};
  const holder=document.getElementById(ids[type]); if(!holder) return;
  const q=String(query||'').trim(); holder.querySelectorAll('.surah-check').forEach(label=>{label.style.display=!q||label.dataset.surahName.includes(q)?'flex':'none';});
}
function renderRangeEntries(type){
  const holder=document.getElementById(type==='memorization'?'memorizationList':'recitationList'); if(!holder) return;
  const entries=window.__quranRecord?.[type]||[];
  if(!entries.length){holder.innerHTML=`<div class="quran-empty">لم تتم إضافة نطاقات بعد.</div>`;return;}
  holder.innerHTML=entries.map((x,idx)=>`<div class="quran-entry"><div class="quran-entry-main"><strong>${esc(x.surahName||QURAN_SURAHS[(x.surahNo||1)-1]||'—')}</strong><small>من الآية ${esc(x.fromAyah)} إلى الآية ${esc(x.toAyah)}${x.date?` • ${esc(x.date)}`:''}</small></div><button class="quran-remove" type="button" data-remove-quran="${type}" data-index="${idx}">حذف</button></div>`).join('');
}
function renderRangeDrafts(type){
  const holder=document.getElementById(type+'Drafts'); if(!holder) return;
  const checks=selectedSurahs(type);
  holder.innerHTML=checks.map(s=>{
    return `<div class="quran-range-card" data-range-card="${type}" data-surah-no="${s.surahNo}">
      <strong>${s.surahNo}. ${esc(s.surahName)}</strong>
      <div class="quran-range-fields">
        <label>من الآية<input type="number" min="1" inputmode="numeric" data-range-from value=""></label>
        <label>إلى الآية<input type="number" min="1" inputmode="numeric" data-range-to value=""></label>
      </div>
    </div>`;
  }).join('') || `<div class="quran-empty">اختر سورة أو أكثر من القائمة أعلاه.</div>`;
}
function syncRangeDrafts(type){
  const cards=[...document.querySelectorAll(`[data-range-card="${type}"]`)];
  const next=[];
  for(const card of cards){
    const surahNo=Number(card.dataset.surahNo);
    const fromAyah=Number(card.querySelector('[data-range-from]')?.value||0);
    const toAyah=Number(card.querySelector('[data-range-to]')?.value||0);
    if(!fromAyah || !toAyah){ alert(`أكمل نطاق الآيات لسورة ${QURAN_SURAHS[surahNo-1]}.`); return false; }
    if(toAyah<fromAyah){ alert(`آية النهاية في سورة ${QURAN_SURAHS[surahNo-1]} يجب أن تكون مساوية أو أكبر من آية البداية.`); return false; }
    const old=(window.__quranRecord?.[type]||[]).find(e=>Number(e.surahNo)===surahNo);
    next.push({surahNo,surahName:QURAN_SURAHS[surahNo-1],fromAyah,toAyah,date:old?.date||new Date().toISOString().slice(0,10)});
  }
  window.__quranRecord[type]=next; renderRangeEntries(type); return true;
}
function initQuranRecordUI(value){
  window.__quranRecord=normalizeQuranRecord(value);
  ['tasmee','review','memorization','recitation'].forEach(renderSurahChecklist);
  renderRangeDrafts('memorization'); renderRangeDrafts('recitation');
  renderRangeEntries('memorization'); renderRangeEntries('recitation');
  refreshQuranSelectedUI();
}
async function saveQuranRecord(options={}){
  const r=window.__currentStudentRecord; if(!r) return false;
  const btn=document.getElementById('saveQuranRecord');
  const status=document.getElementById('quranSaveStatus');
  const silent=!!options.silent;

  // ابدأ من السجل المحفوظ حتى لا تضيع النطاقات التاريخية السابقة.
  const next=normalizeQuranRecord(window.__quranRecord);
  next.tasmee=selectedSurahs('tasmee');
  next.review=selectedSurahs('review');

  const collectRanges=(type)=>{
    const cards=[...document.querySelectorAll(`[data-range-card="${type}"]`)];
    const rows=[];
    for(const card of cards){
      const surahNo=Number(card.dataset.surahNo);
      const fromAyah=Number(card.querySelector('[data-range-from]')?.value||0);
      const toAyah=Number(card.querySelector('[data-range-to]')?.value||0);
      if(!fromAyah || !toAyah){
        alert(`أكمل نطاق الآيات لسورة ${QURAN_SURAHS[surahNo-1]}.`);
        return null;
      }
      if(toAyah<fromAyah){
        alert(`آية النهاية في سورة ${QURAN_SURAHS[surahNo-1]} يجب أن تكون مساوية أو أكبر من آية البداية.`);
        return null;
      }
      rows.push({
        surahNo,
        surahName:QURAN_SURAHS[surahNo-1],
        fromAyah,
        toAyah,
        date:new Date().toISOString().slice(0,10)
      });
    }
    return rows;
  };

  const newMemorization=collectRanges('memorization');
  if(newMemorization===null) return false;
  const newRecitation=collectRanges('recitation');
  if(newRecitation===null) return false;
  // إضافة النطاق الجديد إلى التاريخ السابق بدل استبداله.
  next.memorization=[...(window.__quranRecord?.memorization||[]),...newMemorization];
  next.recitation=[...(window.__quranRecord?.recitation||[]),...newRecitation];

  if(btn && !silent){btn.disabled=true;btn.textContent='جارٍ الحفظ...';}
  if(status && !silent) status.textContent='';

  try{
    const res=await api(`/rest/v1/students?id=eq.${encodeURIComponent(r.id)}`,{
      method:'PATCH',
      headers:{'Prefer':'return=representation'},
      body:JSON.stringify({quran_record:next,updated_at:new Date().toISOString()})
    });
    if(!res.ok){
      const t=await res.text();
      if(t.includes('quran_record')) throw new Error('QURAN_SCHEMA_NOT_READY');
      throw new Error(t);
    }
    const rows=await res.json();
    window.__quranRecord=normalizeQuranRecord(next);
    if(rows[0]) window.__currentStudentRecord={...window.__currentStudentRecord,...rows[0]};

    ['tasmee','review','memorization','recitation'].forEach(renderSurahChecklist);
    renderRangeDrafts('memorization');
    renderRangeDrafts('recitation');
    renderRangeEntries('memorization');
    renderRangeEntries('recitation');
    refreshQuranSelectedUI();

    if(status && !silent) status.textContent='تم حفظ السجل القرآني بنجاح ✓';
    return true;
  }catch(err){
    console.error('Quran record save error:',err);
    if(status){
      status.textContent=err.message==='QURAN_SCHEMA_NOT_READY'
        ?'يجب تنفيذ ملف تهيئة السجل القرآني في Supabase أولًا.'
        :'تعذر حفظ السجل القرآني. تحقق من الاتصال والصلاحيات.';
    }
    return false;
  }finally{
    if(btn && !silent){btn.disabled=false;btn.textContent='حفظ السجل القرآني';}
  }
}
function wireQuranRecord(){
  document.addEventListener('change',e=>{
    const cb=e.target.closest('[data-quran-check]'); if(!cb)return;
    const type=cb.dataset.quranCheck; updateSurahCount(type);
    window.__quranRecord=window.__quranRecord||normalizeQuranRecord();
    if(type==='tasmee'||type==='review'){
      window.__quranRecord[type]=selectedSurahs(type);
      renderSelectedSurahs(type);
    }
    if(type==='memorization'||type==='recitation'){
      // Keep values already typed before rebuilding cards.
      const old={};
      document.querySelectorAll(`[data-range-card="${type}"]`).forEach(c=>old[c.dataset.surahNo]={
        from:c.querySelector('[data-range-from]')?.value||'',to:c.querySelector('[data-range-to]')?.value||''
      });
      renderRangeDrafts(type);
      document.querySelectorAll(`[data-range-card="${type}"]`).forEach(c=>{
        const v=old[c.dataset.surahNo]; if(v){c.querySelector('[data-range-from]').value=v.from;c.querySelector('[data-range-to]').value=v.to;}
      });
      // لا نغيّر السجل التاريخي أثناء الاختيار؛ لا يُضاف إليه شيء إلا عند الحفظ.
    }
  });
  ['tasmee','review','memorization','recitation'].forEach(type=>{
    document.getElementById(type+'Search')?.addEventListener('input',e=>filterSurahs(type,e.target.value));
  });
  document.getElementById('saveQuranRecord')?.addEventListener('click',saveQuranRecord);
  document.addEventListener('click',e=>{
    const toggle=e.target.closest('[data-toggle-picker]');
    if(toggle){
      const type=toggle.dataset.togglePicker;
      const grid=document.getElementById(({tasmee:'tasmeeSurahs',review:'reviewSurahs',memorization:'memorizationSurahs',recitation:'recitationSurahs'})[type]);
      const details=grid?.closest('details.surah-picker');
      setPickerEditing(type,details?.classList.contains('quran-picker-hidden'));
      return;
    }
    const chip=e.target.closest('[data-remove-selected]');
    if(chip){
      const type=chip.dataset.removeSelected, idx=Number(chip.dataset.index);
      window.__quranRecord=window.__quranRecord||normalizeQuranRecord();
      window.__quranRecord[type]?.splice(idx,1);
      renderSurahChecklist(type); renderRangeDrafts(type); renderRangeEntries(type); renderSelectedSurahs(type);
      return;
    }
  });
  document.addEventListener('click',e=>{const b=e.target.closest('[data-remove-quran]');if(!b)return;const type=b.dataset.removeQuran;const idx=Number(b.dataset.index);window.__quranRecord?.[type]?.splice(idx,1);renderRangeEntries(type);renderSurahChecklist(type);renderRangeDrafts(type);});
}

function teacherStatusLabel(s){
  return ({active:"نشط",paused:"موقوف مؤقتًا",inactive:"غير نشط"})[s] || s || "نشط";
}

async function loadTeachers(){
  const ok = await requireAdmin(); if(!ok) return;
  const res = await api("/rest/v1/teachers?select=*&order=created_at.asc");
  if(!res.ok) throw new Error(await res.text());
  const rows = await res.json();
  window.__teachers = rows;
  renderTeachers(rows);
  document.querySelectorAll("[data-teacher-kpi]").forEach(el=>{
    const key = el.dataset.teacherKpi;
    el.textContent = key === "all" ? rows.length : rows.filter(r=>(r.status||"active")===key).length;
  });
}

function renderTeachers(rows){
  const tbody = document.getElementById("teachersBody");
  if(!tbody) return;
  const q = (document.getElementById("teacherSearchBox")?.value || "").trim().toLowerCase();
  const filtered = rows.filter(r=>!q || [r.full_name,r.teacher_code,r.specialization,r.whatsapp].join(" ").toLowerCase().includes(q));
  if(!filtered.length){ tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted)">لا يوجد معلمون مطابقون.</td></tr>`; return; }
  tbody.innerHTML = filtered.map(r=>`<tr>
    <td><strong>${esc(r.full_name)}</strong><br><small>${esc(fmtDate(r.created_at))}</small></td>
    <td>${esc(r.teacher_code)}</td><td>${esc(r.specialization || "—")}</td><td>${esc(r.whatsapp || "—")}</td>
    <td><span class="status-badge">${esc(teacherStatusLabel(r.status))}</span></td>
    <td><button class="btn btn-light" type="button" disabled>التفاصيل قريبًا</button></td>
  </tr>`).join("");
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
  document.getElementById("studentRecordForm")?.addEventListener("submit",saveStudentRecord);
  wireQuranRecord();
  document.getElementById("teacherSearchBox")?.addEventListener("input",()=>renderTeachers(window.__teachers||[]));
  document.getElementById("closeDialog")?.addEventListener("click",()=>document.getElementById("detailsDialog")?.close());
}

document.addEventListener("DOMContentLoaded",()=>{
  wireCommon();
  const loginForm=document.getElementById("adminLoginForm"); if(loginForm) loginForm.addEventListener("submit",e=>{e.preventDefault();doLogin(loginForm);});
  if(document.body.dataset.adminPage === "registrations") loadRegistrations().catch(err=>{console.error(err);document.getElementById("loadError")?.classList.remove("hide");});
  if(document.body.dataset.adminPage === "dashboard") loadRegistrations().catch(err=>{console.error(err);document.getElementById("loadError")?.classList.remove("hide");});
  if(document.body.dataset.adminPage === "students") loadStudents().catch(err=>{console.error(err);document.getElementById("loadError")?.classList.remove("hide");});
  if(document.body.dataset.adminPage === "student-record") loadStudentRecord();
  if(document.body.dataset.adminPage === "teachers") loadTeachers().catch(err=>{console.error(err);document.getElementById("loadError")?.classList.remove("hide");});
});
