const SUPABASE_URL = "https://crnlfpuipepolflqcwuo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_bW_x_9cHxqhuxkYdZ-g4kQ_3UAukGRV";

document.addEventListener("DOMContentLoaded",()=>{
 const form=document.getElementById("academyRegistration"); if(!form)return;
 form.addEventListener("submit",async e=>{e.preventDefault(); if(!form.reportValidity())return;
  const selections=Array.isArray(window.rasheedStudySelections)?window.rasheedStudySelections:[];
  if(!selections.length){alert("اختر برنامجًا أو مادة أو مسارًا قبل إرسال طلب التسجيل.");return;}
  if(form.querySelector('[name="_honey"]')?.value)return;
  const btn=document.getElementById("registrationSubmit"), ok=document.getElementById("registrationSuccess"), err=document.getElementById("registrationError"); ok?.classList.add("hide");err?.classList.add("hide");btn.disabled=true;btn.textContent="جارٍ إرسال الطلب...";
  const tracks=selections.filter(x=>x.key==="quran").flatMap(x=>x.tracks||[]), first=selections[0]||{};
  const payload={full_name:fullName.value.trim(),age:Number(age.value),country_city:country.value.trim(),whatsapp:whatsapp.value.trim(),preferred_time:time.value,registration_for:studentType.value,notes:notes.value.trim(),study_selections:selections,track:tracks[0]||first.title||null,level:null,status:"new"};
  try{const r=await fetch(`${SUPABASE_URL}/rest/v1/registrations`,{method:"POST",headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${SUPABASE_PUBLISHABLE_KEY}`,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(payload)});if(!r.ok)throw new Error(await r.text()); sessionStorage.removeItem("rasheedStudySelections");ok?.classList.remove("hide");btn.classList.add("hide");}
  catch(ex){console.error(ex);err?.classList.remove("hide");btn.disabled=false;btn.textContent="إرسال طلب التسجيل";}
 });
});
