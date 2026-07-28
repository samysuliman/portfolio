const STUDENT_SUPABASE_URL = "https://crnlfpuipepolflqcwuo.supabase.co";
const STUDENT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_bW_x_9cHxqhuxkYdZ-g4kQ_3UAukGRV";
const STUDENT_SESSION_KEY = "rasheed_student_session_v1";
const PORTAL_SESSION_KEY = "rasheed_portal_session_v1";

function getPortalSession(){
  try{return JSON.parse(localStorage.getItem(PORTAL_SESSION_KEY)||"null");}catch{return null;}
}
function isAdminPreview(){
  const p=getPortalSession();
  return Boolean(p?.is_admin_preview && p?.role==="student");
}

function studentEsc(value){
  return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}
function getStudentSession(){
  try{return JSON.parse(localStorage.getItem(STUDENT_SESSION_KEY) || "null");}catch{return null;}
}
function setStudentSession(session){ localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(session)); }
function clearStudentSession(){ localStorage.removeItem(STUDENT_SESSION_KEY); }

async function studentRefreshSession(session){
  if(!session?.refresh_token) return null;
  const res = await fetch(`${STUDENT_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{
    method:"POST",
    headers:{"apikey":STUDENT_SUPABASE_PUBLISHABLE_KEY,"Content-Type":"application/json"},
    body:JSON.stringify({refresh_token:session.refresh_token})
  });
  if(!res.ok) return null;
  const next = await res.json();
  setStudentSession(next);
  return next;
}

async function studentApi(path, options={}, retry=true){
  let session = getStudentSession();
  if(!session?.access_token) throw new Error("NO_STUDENT_SESSION");
  const headers = {
    "apikey":STUDENT_SUPABASE_PUBLISHABLE_KEY,
    "Authorization":`Bearer ${session.access_token}`,
    "Content-Type":"application/json",
    ...(options.headers || {})
  };
  let res = await fetch(`${STUDENT_SUPABASE_URL}${path}`, {...options, headers});
  if(res.status === 401 && retry){
    session = await studentRefreshSession(session);
    if(!session) throw new Error("STUDENT_SESSION_EXPIRED");
    res = await fetch(`${STUDENT_SUPABASE_URL}${path}`,{
      ...options,
      headers:{...headers,"Authorization":`Bearer ${session.access_token}`}
    });
  }
  return res;
}

async function requireStudent(){
  const session=getStudentSession();
  if(!session?.access_token){
    window.location.replace("../login.html");
    return false;
  }
  if(isAdminPreview()) return true;

  const res=await studentApi("/rest/v1/student_accounts?select=student_id&limit=1").catch(()=>null);
  if(!res || res.status===401){
    clearStudentSession();
    window.location.replace("../login.html?expired=1");
    return false;
  }
  if(!res.ok) return false;
  const rows=await res.json();
  if(!rows.length){
    clearStudentSession();
    window.location.replace("../login.html?unauthorized=1");
    return false;
  }
  return true;
}

function validMeetUrl(value){
  try{
    const u = new URL(String(value || "").trim());
    return u.protocol === "https:" && u.hostname === "meet.google.com";
  }catch{return false;}
}
function meetOpenUrl(url){
  if(!validMeetUrl(url)) return "";
  const ua = navigator.userAgent || "";
  if(!/Android|iPhone|iPad|iPod/i.test(ua)) return url;
  const encoded = encodeURIComponent(url);
  return `https://meet.app.goo.gl/?link=${encoded}&apn=com.google.android.apps.tachyon&ibi=com.google.Tachyon&efr=1&ifl=${encoded}`;
}
function formatArabicDate(value){
  if(!value) return "—";
  const [y,m,d] = String(value).split("-").map(Number);
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date(y,m-1,d));
}
function lessonState(r){
  const status = r.status || "scheduled";
  if(status === "cancelled") return "cancelled";
  if(["completed","absent"].includes(status)) return "finished";
  const start = new Date(`${r.lesson_date}T${String(r.start_time).slice(0,5)}:00`);
  const end = new Date(`${r.lesson_date}T${String(r.end_time).slice(0,5)}:00`);
  const now = new Date();
  if(now < start) return "upcoming";
  if(now <= end) return "current";
  return "finished";
}
function canEnterLesson(r, meetUrl){
  if((r.status || "scheduled") !== "scheduled" || !validMeetUrl(meetUrl)) return false;
  const end = new Date(`${r.lesson_date}T${String(r.end_time).slice(0,5)}:00`);
  return new Date() <= end;
}
function startOfWeek(date){
  const d = new Date(date.getFullYear(),date.getMonth(),date.getDate());
  const offset = (d.getDay()+1)%7;
  d.setDate(d.getDate()-offset);
  return d;
}
function endOfWeek(date){ const d=startOfWeek(date); d.setDate(d.getDate()+6); return d; }

async function loadPreviewStudents(){
  const res=await studentApi("/rest/v1/students?select=id,full_name,status&order=full_name.asc");
  if(!res.ok) throw new Error(await res.text());
  const rows=await res.json();
  const select=document.getElementById("previewStudentSelect");
  if(select){
    select.innerHTML=rows.map(s=>`<option value="${studentEsc(s.id)}">${studentEsc(s.full_name)}</option>`).join("");
  }
  return rows;
}

async function getCurrentStudent(){
  if(isAdminPreview()){
    document.getElementById("adminPreviewBanner")?.classList.remove("hide");
    const students=await loadPreviewStudents();
    if(!students.length) throw new Error("NO_STUDENTS");
    const select=document.getElementById("previewStudentSelect");
    const wanted=select?.value || String(students[0].id);
    if(select && !select.value) select.value=wanted;
    return students.find(s=>String(s.id)===String(wanted)) || students[0];
  }

  const accountRes=await studentApi("/rest/v1/student_accounts?select=student_id,students(id,full_name,status)&limit=1");
  if(!accountRes.ok) throw new Error(await accountRes.text());
  const rows=await accountRes.json();
  return rows[0]?.students || null;
}

async function loadStudentPortal(){
  const ok = await requireStudent(); if(!ok) return;

  const settingsRes=await studentApi("/rest/v1/academy_settings?setting_key=eq.academy_meet_url&select=setting_value&limit=1");
  if(!settingsRes.ok) throw new Error(await settingsRes.text());
  const settingsRows=await settingsRes.json();

  const student=await getCurrentStudent();
  if(!student) throw new Error("NO_STUDENT_PROFILE");
  window.__currentPortalStudentId=student.id;
  loadAssignmentsAndExams(student.id).catch(console.error);

  const meetUrl = settingsRows[0]?.setting_value || "";
  document.getElementById("studentWelcome").textContent = `السلام عليكم، ${student.full_name} 🌿`;

  const linksRes = await studentApi(`/rest/v1/lesson_students?student_id=eq.${encodeURIComponent(student.id)}&select=lesson_id`);
  if(!linksRes.ok) throw new Error(await linksRes.text());
  const links = await linksRes.json();
  const ids = links.map(x=>x.lesson_id);

  if(!ids.length){
    renderStudentSubjects([]);
    renderStudentLessons([], meetUrl);
    return;
  }

  const lessonRes = await studentApi(`/rest/v1/lessons?id=in.(${ids.join(",")})&select=id,teacher_id,track_id,lesson_date,start_time,end_time,status&order=lesson_date.asc,start_time.asc`);
  if(!lessonRes.ok) throw new Error(await lessonRes.text());
  const lessons = await lessonRes.json();

  const teacherIds = [...new Set(lessons.map(x=>x.teacher_id).filter(Boolean))];
  const trackIds = [...new Set(lessons.map(x=>x.track_id).filter(Boolean))];

  const [teachersRes, tracksRes] = await Promise.all([
    teacherIds.length ? studentApi(`/rest/v1/teachers?id=in.(${teacherIds.join(",")})&select=id,full_name`) : Promise.resolve({ok:true,json:async()=>[]}),
    trackIds.length ? studentApi(`/rest/v1/academy_tracks?id=in.(${trackIds.join(",")})&select=id,name_ar`) : Promise.resolve({ok:true,json:async()=>[]})
  ]);
  if(!teachersRes.ok) throw new Error(await teachersRes.text());
  if(!tracksRes.ok) throw new Error(await tracksRes.text());

  const teachers = new Map((await teachersRes.json()).map(x=>[String(x.id),x.full_name]));
  const tracks = new Map((await tracksRes.json()).map(x=>[String(x.id),x.name_ar]));
  lessons.forEach(r=>{
    r.teacher_name = teachers.get(String(r.teacher_id)) || "—";
    r.track_name = tracks.get(String(r.track_id)) || "غير محدد";
  });

  renderStudentSubjects(lessons);
  renderStudentLessons(lessons, meetUrl);
}

function renderStudentSubjects(lessons){
  const unique = [...new Map(
    lessons.filter(x=>x.track_id).map(x=>[String(x.track_id),x.track_name])
  ).values()];
  document.getElementById("subjectsCount").textContent = unique.length;
  const box = document.getElementById("subjectsList");
  box.innerHTML = unique.length
    ? unique.map(name=>`<div class="card"><div class="icon">📚</div><h3>${studentEsc(name)}</h3></div>`).join("")
    : '<div class="empty">لا توجد مواد مرتبطة بحسابك حتى الآن.</div>';
}

function renderStudentLessons(lessons, meetUrl){
  window.__studentLessons = lessons;
  window.__studentMeetUrl = meetUrl;
  const now = new Date();
  const upcoming = lessons.filter(r=>{
    const end = new Date(`${r.lesson_date}T${String(r.end_time).slice(0,5)}:00`);
    return end >= now && (r.status || "scheduled") === "scheduled";
  });
  document.getElementById("upcomingLessonsCount").textContent = upcoming.length;

  const next = upcoming[0];
  const nextBox = document.getElementById("nextLessonContent");
  if(!next) nextBox.innerHTML = "لا توجد حصة قادمة الآن.";
  else{
    const url = canEnterLesson(next, meetUrl) ? meetOpenUrl(meetUrl) : "";
    nextBox.innerHTML = `<div class="lesson-row">
      <div>
        <span class="track-chip">${studentEsc(next.track_name)}</span>
        <h3 style="margin:8px 0 4px">${studentEsc(next.teacher_name)}</h3>
        <div class="lesson-meta"><span>${studentEsc(formatArabicDate(next.lesson_date))}</span><span>${studentEsc(String(next.start_time).slice(0,5))} - ${studentEsc(String(next.end_time).slice(0,5))}</span></div>
      </div>
      <a class="join-btn ${url?"":"disabled"}" href="${url?studentEsc(url):"#"}" target="_blank" rel="noopener">دخول الحصة</a>
    </div>`;
  }
  renderStudentLessonList();
}

function renderStudentLessonList(){
  const lessons = window.__studentLessons || [];
  const meetUrl = window.__studentMeetUrl || "";
  const view = document.getElementById("studentLessonView")?.value || "upcoming";
  const now = new Date();
  const a = startOfWeek(now), b = endOfWeek(now);

  const rows = lessons.filter(r=>{
    const date = new Date(`${r.lesson_date}T00:00:00`);
    const end = new Date(`${r.lesson_date}T${String(r.end_time).slice(0,5)}:00`);
    if(view === "today") return date.toDateString() === new Date(now.getFullYear(),now.getMonth(),now.getDate()).toDateString();
    if(view === "week") return date >= a && date <= b;
    if(view === "upcoming") return end >= now && (r.status || "scheduled") === "scheduled";
    return true;
  });

  const box = document.getElementById("studentLessonsList");
  box.innerHTML = rows.length ? rows.map(r=>{
    const state = lessonState(r);
    const url = canEnterLesson(r, meetUrl) ? meetOpenUrl(meetUrl) : "";
    const statusText = ({scheduled:"مجدولة",completed:"مكتملة",cancelled:"ملغاة",absent:"غياب"})[r.status || "scheduled"];
    return `<div class="lesson-card ${state}">
      <div class="lesson-row">
        <div>
          <span class="track-chip">${studentEsc(r.track_name)}</span>
          <h3 style="margin:8px 0 4px">${studentEsc(r.teacher_name)}</h3>
          <div class="lesson-meta">
            <span>${studentEsc(formatArabicDate(r.lesson_date))}</span>
            <span>${studentEsc(String(r.start_time).slice(0,5))} - ${studentEsc(String(r.end_time).slice(0,5))}</span>
            <span>${studentEsc(statusText)}</span>
          </div>
        </div>
        <a class="join-btn ${url?"":"disabled"}" href="${url?studentEsc(url):"#"}" target="_blank" rel="noopener">دخول الحصة</a>
      </div>
    </div>`;
  }).join("") : '<div class="empty">لا توجد حصص في هذا العرض.</div>';
}

document.addEventListener("DOMContentLoaded",()=>{
  const loginForm = document.getElementById("studentLoginForm");
  if(loginForm){
    const params = new URLSearchParams(location.search);
    if(params.get("expired")) {
      const box=document.getElementById("studentLoginError");
      box.textContent="انتهت الجلسة. سجّل الدخول مرة أخرى."; box.classList.remove("hide");
    }
    if(params.get("unauthorized")) {
      const box=document.getElementById("studentLoginError");
      box.textContent="هذا الحساب غير مرتبط بطالب في الأكاديمية."; box.classList.remove("hide");
    }

    loginForm.addEventListener("submit",async e=>{
      e.preventDefault();
      const btn=document.getElementById("studentLoginBtn");
      const err=document.getElementById("studentLoginError");
      btn.disabled=true; btn.textContent="جارٍ الدخول..."; err.classList.add("hide");
      try{
        const res=await fetch(`${STUDENT_SUPABASE_URL}/auth/v1/token?grant_type=password`,{
          method:"POST",
          headers:{"apikey":STUDENT_SUPABASE_PUBLISHABLE_KEY,"Content-Type":"application/json"},
          body:JSON.stringify({
            email:document.getElementById("email").value.trim(),
            password:document.getElementById("password").value
          })
        });
        if(!res.ok) throw new Error(await res.text());
        const session=await res.json();
        setStudentSession(session);
        const check=await studentApi("/rest/v1/student_accounts?select=student_id&limit=1");
        const rows=check.ok?await check.json():[];
        if(!rows.length){
          clearStudentSession();
          err.textContent="الحساب صحيح لكنه غير مرتبط بطالب في الأكاديمية.";
          err.classList.remove("hide");
          return;
        }
        window.location.href="dashboard.html";
      }catch(error){
        console.error(error);
        err.textContent="تعذر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.";
        err.classList.remove("hide");
      }finally{btn.disabled=false;btn.textContent="دخول الطالب";}
    });
  }

  document.querySelector("[data-student-logout]")?.addEventListener("click",()=>{
    clearStudentSession();
    window.location.replace("login.html");
  });

  if(document.getElementById("studentLessonsList")){
    loadStudentPortal().catch(err=>{
      console.error(err);
      document.getElementById("studentLoadError")?.classList.remove("hide");
    });
    document.getElementById("studentLessonView")?.addEventListener("change",renderStudentLessonList);
    document.getElementById("previewStudentSelect")?.addEventListener("change",()=>{
      loadStudentPortal().catch(err=>{
        console.error(err);
        document.getElementById("studentLoadError")?.classList.remove("hide");
      });
    });
  }
});


let studentAssignmentsCache=[];
let studentExamsCache=[];

function portalDateTime(v){
  if(!v) return "—";
  try{return new Intl.DateTimeFormat("ar-SA",{dateStyle:"medium",timeStyle:"short"}).format(new Date(v));}
  catch{return v;}
}
function assignmentState(row){
  if(row.submission?.submitted_at) return "submitted";
  if(row.due_at && new Date(row.due_at)<new Date()) return "late";
  return "open";
}
function examState(row){
  if(row.result?.grade!==null && row.result?.grade!==undefined) return "graded";
  if(row.submission?.submitted_at) return "submitted";
  const now=new Date(), due=row.due_at?new Date(row.due_at):null, start=row.starts_at?new Date(row.starts_at):null;
  if(start && now<start) return "upcoming";
  if(due && now>due) return "closed";
  return "open";
}
const assignmentLabels={open:"متاح",submitted:"تم التسليم",late:"متأخر"};
const examLabels={upcoming:"قادم",open:"متاح الآن",submitted:"تم التسليم",closed:"انتهى",graded:"تم التصحيح"};

function teacherAttachment(url,label){
  return url?`<a class="btn btn-secondary" href="${studentEsc(url)}" target="_blank" rel="noopener">📎 ${label}</a>`:"";
}
function assignmentCard(row){
  const state=assignmentState(row), canSubmit=state!=="late"||row.allow_late_submission;
  const sub=row.submission||null;
  return `<article class="panel" style="margin:0">
    <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div><strong>${studentEsc(row.title||"واجب")}</strong><div class="muted">${studentEsc(row.track||"")}</div></div>
      <span class="badge">${assignmentLabels[state]||state}</span>
    </div>
    <p>${studentEsc(row.description||"")}</p>
    <div class="muted">تاريخ الإنشاء: ${portalDateTime(row.created_at)} · موعد التسليم: ${portalDateTime(row.due_at)}</div>
    ${row.extended_due_at?`<div class="muted"><strong>تم تمديد المهلة حتى:</strong> ${portalDateTime(row.extended_due_at)}</div>`:""}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">${teacherAttachment(row.attachment_url,"تحميل مرفق المعلم")}</div>
    ${sub?.grade!==null&&sub?.grade!==undefined?`<div class="grade-box"><strong>الدرجة: ${studentEsc(sub.grade)} / ${studentEsc(row.max_grade||100)}</strong>${sub.feedback?`<div class="muted">ملاحظة المعلم: ${studentEsc(sub.feedback)}</div>`:""}</div>`:""}
    ${sub?.submitted_at
      ? `<div style="margin-top:10px">✅ تم التسليم: ${portalDateTime(sub.submitted_at)} ${sub.attachment_url?`· <a href="${studentEsc(sub.attachment_url)}" target="_blank" rel="noopener">عرض المرفق المرسل</a>`:""}</div>`
      : canSubmit
        ? `<form class="studentAssignmentUploadForm upload-box" data-assignment-id="${studentEsc(row.id)}">
            <label>📤 رفع مرفق الواجب من جهازك</label>
            <input class="file-input" name="file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" required>
            <button class="btn btn-primary" type="submit" style="margin-top:9px">رفع وإرسال الواجب</button>
          </form>`
        : `<div style="margin-top:10px;color:#a12d2d"><strong>انتهى موعد التسليم.</strong> يحتاج المعلم إلى تمديد المهلة.</div>`}
  </article>`;
}
function examCard(row){
  const state=examState(row), sub=row.submission||null, result=row.result||null;
  const canSubmit=["open"].includes(state);
  return `<article class="panel" style="margin:0">
    <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div><strong>${studentEsc(row.title||"اختبار")}</strong><div class="muted">${studentEsc(row.track||"")}</div></div>
      <span class="badge">${examLabels[state]||state}</span>
    </div>
    <p>${studentEsc(row.description||"")}</p>
    <div class="muted">تاريخ الإنشاء: ${portalDateTime(row.created_at)}${row.starts_at?` · يبدأ: ${portalDateTime(row.starts_at)}`:""} · الإغلاق: ${portalDateTime(row.due_at)}</div>
    ${row.extended_due_at?`<div class="muted"><strong>تم تمديد المهلة حتى:</strong> ${portalDateTime(row.extended_due_at)}</div>`:""}
    <div style="margin-top:8px"><strong>الدرجة الكلية: ${studentEsc(row.max_grade||100)}</strong></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">${teacherAttachment(row.attachment_url,"تحميل مرفق الاختبار")}</div>
    ${result?`<div class="grade-box"><strong>درجتي: ${studentEsc(result.grade)} / ${studentEsc(row.max_grade||100)}</strong>${result.feedback?`<div class="muted">ملاحظة المعلم: ${studentEsc(result.feedback)}</div>`:""}</div>`:`<div class="grade-box">الدرجة: بانتظار التصحيح</div>`}
    ${sub?.submitted_at
      ? `<div style="margin-top:10px">✅ تم إرسال الإجابة: ${portalDateTime(sub.submitted_at)} ${sub.attachment_url?`· <a href="${studentEsc(sub.attachment_url)}" target="_blank" rel="noopener">عرض إجابتي</a>`:""}</div>`
      : canSubmit
        ? `<form class="studentExamUploadForm upload-box" data-exam-id="${studentEsc(row.id)}">
            <label>📤 رفع إجابة الاختبار من جهازك</label>
            <input class="file-input" name="file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" required>
            <button class="btn btn-primary" type="submit" style="margin-top:9px">رفع وإرسال الإجابة</button>
          </form>`
        : ""}
  </article>`;
}
async function uploadStudentFile(file,kind,itemId,studentId){
  const safe=(file.name||"file").replace(/[^\w.\-]+/g,"_");
  const path=`${studentId}/${kind}/${itemId}/${Date.now()}_${safe}`;
  const session=getStudentSession();
  const res=await fetch(`${STUDENT_SUPABASE_URL}/storage/v1/object/student-submissions/${encodeURI(path)}`,{
    method:"POST",
    headers:{
      "apikey":STUDENT_SUPABASE_PUBLISHABLE_KEY,
      "Authorization":`Bearer ${session.access_token}`,
      "Content-Type":file.type||"application/octet-stream",
      "x-upsert":"false"
    },
    body:file
  });
  if(!res.ok) throw new Error(await res.text());
  return `${STUDENT_SUPABASE_URL}/storage/v1/object/public/student-submissions/${path}`;
}
async function loadAssignmentsAndExams(studentId){
  const [aRes,eRes]=await Promise.all([
    studentApi(`/rest/v1/assignments?select=id,title,description,track,created_at,due_at,extended_due_at,max_grade,attachment_url,allow_late_submission,assignment_submissions(id,submitted_at,attachment_url,grade,feedback)&student_id=eq.${encodeURIComponent(studentId)}&order=due_at.asc`),
    studentApi(`/rest/v1/exams?select=id,title,description,track,created_at,starts_at,due_at,extended_due_at,max_grade,attachment_url,exam_submissions(id,submitted_at,attachment_url),exam_results(id,grade,feedback,published_at)&student_id=eq.${encodeURIComponent(studentId)}&order=due_at.asc`)
  ]);
  if(aRes.ok){
    studentAssignmentsCache=(await aRes.json()).map(x=>({...x,submission:Array.isArray(x.assignment_submissions)?x.assignment_submissions[0]:null}));
  }else studentAssignmentsCache=[];
  if(eRes.ok){
    studentExamsCache=(await eRes.json()).map(x=>({...x,submission:Array.isArray(x.exam_submissions)?x.exam_submissions[0]:null,result:Array.isArray(x.exam_results)?x.exam_results[0]:null}));
  }else studentExamsCache=[];
  renderAssignments();renderExams();
}
function renderAssignments(){
  const f=document.getElementById("assignmentFilter")?.value||"all";
  const rows=studentAssignmentsCache.filter(r=>f==="all"||assignmentState(r)===f);
  const list=document.getElementById("assignmentsList"), empty=document.getElementById("assignmentsEmpty");
  if(list) list.innerHTML=rows.map(assignmentCard).join("");
  empty?.classList.toggle("hide",rows.length>0);
  document.querySelectorAll(".studentAssignmentUploadForm").forEach(f=>f.addEventListener("submit",submitAssignmentFile));
}
function renderExams(){
  const f=document.getElementById("examFilter")?.value||"all";
  const rows=studentExamsCache.filter(r=>f==="all"||examState(r)===f);
  const list=document.getElementById("examsList"), empty=document.getElementById("examsEmpty");
  if(list) list.innerHTML=rows.map(examCard).join("");
  empty?.classList.toggle("hide",rows.length>0);
  document.querySelectorAll(".studentExamUploadForm").forEach(f=>f.addEventListener("submit",submitExamFile));
}
async function submitAssignmentFile(e){
  e.preventDefault();const form=e.currentTarget, id=form.dataset.assignmentId, file=form.file.files[0], sid=window.__currentPortalStudentId;
  if(!file||!sid)return;
  const btn=form.querySelector("button");btn.disabled=true;btn.textContent="جارٍ الرفع...";
  try{
    const url=await uploadStudentFile(file,"assignments",id,sid);
    const res=await studentApi("/rest/v1/assignment_submissions",{method:"POST",headers:{"Prefer":"return=minimal"},body:JSON.stringify({assignment_id:Number(id),student_id:Number(sid),attachment_url:url,submitted_at:new Date().toISOString()})});
    if(!res.ok)throw new Error(await res.text());
    await loadAssignmentsAndExams(sid);
  }catch(err){console.error(err);alert("تعذر رفع وتسليم الواجب.");}
  finally{btn.disabled=false;btn.textContent="رفع وإرسال الواجب";}
}
async function submitExamFile(e){
  e.preventDefault();const form=e.currentTarget, id=form.dataset.examId, file=form.file.files[0], sid=window.__currentPortalStudentId;
  if(!file||!sid)return;
  const btn=form.querySelector("button");btn.disabled=true;btn.textContent="جارٍ الرفع...";
  try{
    const url=await uploadStudentFile(file,"exams",id,sid);
    const res=await studentApi("/rest/v1/exam_submissions",{method:"POST",headers:{"Prefer":"return=minimal"},body:JSON.stringify({exam_id:Number(id),student_id:Number(sid),attachment_url:url,submitted_at:new Date().toISOString()})});
    if(!res.ok)throw new Error(await res.text());
    await loadAssignmentsAndExams(sid);
  }catch(err){console.error(err);alert("تعذر رفع وإرسال إجابة الاختبار.");}
  finally{btn.disabled=false;btn.textContent="رفع وإرسال الإجابة";}
}
document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("assignmentFilter")?.addEventListener("change",renderAssignments);
  document.getElementById("examFilter")?.addEventListener("change",renderExams);
});
