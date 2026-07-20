(function(){
 'use strict';
 const modal=document.getElementById('introTour');
 if(!modal) return;
 const title=document.getElementById('tourTitle');
 const kicker=document.getElementById('tourKicker');
 const body=document.getElementById('tourBody');
 const counter=document.getElementById('tourCounter');
 const progress=document.getElementById('tourProgressBar');
 const prev=document.getElementById('tourPrev');
 const next=document.getElementById('tourNext');
 const close=document.getElementById('tourClose');
 const skip=document.getElementById('tourSkip');
 const nav=document.getElementById('tourNavGroup');
 const finalActions=document.getElementById('tourFinalActions');
 let step=0;
 let lastFocus=null;
 const steps=[
  {
   ar:{k:'الجولة التعريفية المهنية',t:'مرحبًا، أنا سامي سليمان',p:['معلم تربية إسلامية، ومدرب تربوي، ومؤلف.','أكثر من 20 عامًا في التعليم، منها 10 أعوام في المدارس العالمية.','متاح للأدوار التعليمية والإدارية والإشرافية.']},
   en:{k:'Professional Introduction Tour',t:'Hello, I’m Samy Suliman',p:['Islamic Studies educator, teacher trainer, and author.','20+ years in education, including 10 years in international schools.','Available for educational, administrative, and supervisory roles.']}
  },
  {
   ar:{k:'الخبرات',t:'خبرة تجمع التدريس والقيادة',p:['تدريس التربية الإسلامية والقرآن الكريم في بيئات أزهرية وعالمية.','رئيس قسم سابق، مع خبرة في قيادة الفريق ومتابعة الخطط والتقييم.','مشاركة في تدريب المعلمين والجودة والاعتماد الأكاديمي.']},
   en:{k:'Experience',t:'Teaching and Leadership Experience',p:['Teaching Islamic Studies and Qur’an in Al-Azhar and international environments.','Former Head of Department with team leadership, planning, and evaluation experience.','Contributed to teacher training, quality, and academic accreditation.']}
  },
  {
   ar:{k:'الإنجازات والأثر',t:'أثر مهني موثق',p:['المركز الثاني في جائزة الشركة الوطنية للتعليم 2025.','تقديم أكثر من 6 ورش تدريبية تطبيقية للمعلمين.','شهادات وتوصيات من طلاب وقيادات أكاديمية، مع شواهد مهنية قابلة للمراجعة.']},
   en:{k:'Achievements & Impact',t:'Documented Professional Impact',p:['Second place in the National Company for Learning and Education Award 2025.','Delivered 6+ practical teacher-development workshops.','Student testimonials, academic recommendations, and reviewable evidence of professional work.']}
  },
  {
   ar:{k:'المؤلفات',t:'محتوى تعليمي أصيل',p:['سلسلة في أحكام التجويد بمستويات تعليمية متدرجة.','السيرة النبوية للأطفال بالعربية والإنجليزية، مع أنشطة وتمارين.','مقالات وأبحاث تربوية منشورة من خلال المنصة.']},
   en:{k:'Publications',t:'Original Educational Content',p:['A progressive multi-level series on Tajweed rules.','A bilingual Prophetic biography series for children with activities and exercises.','Educational articles and research published through this platform.']}
  },
  {
   ar:{k:'القيمة المضافة',t:'ماذا أستطيع أن أقدم للمؤسسة؟',p:['قيادة فريق تعليمي ومتابعة الأداء وتحويل الخطط إلى إجراءات عملية.','تطوير المعلمين والمحتوى والممارسات الصفية.','تعزيز الجودة والهوية والقيم، وبناء أثر يلمسه الطالب والمدرسة.']},
   en:{k:'Added Value',t:'What Can I Bring to Your Institution?',p:['Lead educational teams, monitor performance, and turn plans into action.','Develop teachers, content, and classroom practice.','Strengthen quality, identity, values, and measurable student impact.']}
  },
  {
   ar:{k:'الخطوة التالية',t:'شكرًا لوقتكم',p:['يمكنكم الآن تحميل السيرة الذاتية، أو تصفح المؤلفات والأعمال، أو التواصل مباشرة لمناقشة فرصة مناسبة.']},
   en:{k:'Next Step',t:'Thank You for Your Time',p:['You may now download my CV, explore my publications and evidence, or contact me directly to discuss a suitable opportunity.']}
  }
 ];
 function english(){return document.body.classList.contains('english');}
 function render(){
  const lang=english()?'en':'ar'; const s=steps[step][lang];
  kicker.textContent=s.k; title.textContent=s.t;
  body.innerHTML='<ul class="tour-points">'+s.p.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
  counter.textContent=(lang==='en'?'Step ':'الخطوة ')+(step+1)+(lang==='en'?' of ':' من ')+steps.length;
  progress.style.width=((step+1)/steps.length*100)+'%';
  prev.disabled=step===0; prev.textContent=lang==='en'?'Previous':'السابق';
  next.textContent=lang==='en'?'Next':'التالي';
  skip.textContent=lang==='en'?'End tour':'إنهاء الجولة';
  close.setAttribute('aria-label',lang==='en'?'Close tour':'إغلاق الجولة');
  nav.hidden=step===steps.length-1; finalActions.hidden=step!==steps.length-1;
  document.getElementById('tourCvAr').hidden=lang==='en';
  document.getElementById('tourCvEn').hidden=lang!=='en';
  document.getElementById('tourWorks').textContent=lang==='en'?'View publications':'عرض المؤلفات';
  document.getElementById('tourContact').textContent=lang==='en'?'Contact me':'تواصل معي';
 }
 function openTour(){lastFocus=document.activeElement;step=0;render();modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('tour-open');close.focus();}
 function closeTour(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('tour-open');if(lastFocus)lastFocus.focus();}
 document.querySelectorAll('[data-open-tour]').forEach(b=>b.addEventListener('click',openTour));
 close.addEventListener('click',closeTour);skip.addEventListener('click',closeTour);
 prev.addEventListener('click',()=>{if(step>0){step--;render();}});
 next.addEventListener('click',()=>{if(step<steps.length-1){step++;render();}});
 modal.addEventListener('click',e=>{if(e.target===modal)closeTour();});
 document.getElementById('tourWorks').addEventListener('click',closeTour);
 document.getElementById('tourContact').addEventListener('click',closeTour);
 document.addEventListener('keydown',e=>{
  if(!modal.classList.contains('open')) return;
  if(e.key==='Escape') closeTour();
  if(e.key==='ArrowLeft' && english() && step<steps.length-1){step++;render();}
  if(e.key==='ArrowRight' && english() && step>0){step--;render();}
  if(e.key==='ArrowLeft' && !english() && step>0){step--;render();}
  if(e.key==='ArrowRight' && !english() && step<steps.length-1){step++;render();}
 });
 const observer=new MutationObserver(()=>{if(modal.classList.contains('open'))render();});
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
})();
