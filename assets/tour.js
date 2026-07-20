(function(){
 'use strict';
 const modal=document.getElementById('introTour');
 const explore=document.getElementById('exploreHub');
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
 const exploreBtn=document.getElementById('tourExplore');
 const exploreClose=document.getElementById('exploreClose');
 let step=0,lastFocus=null;
 const steps=[
  {ar:{k:'جولة تعريفية سريعة',t:'مرحبًا، أنا سامي سليمان',html:'<p>معلم تربية إسلامية، ومدرب تربوي، ومؤلف، بخبرة تمتد لأكثر من عشرين عامًا في التعليم.</p><p>أجمع بين التدريس، والقيادة التعليمية، وتطوير المعلمين والمحتوى.</p>'},en:{k:'A Quick Introduction',t:'Hello, I’m Samy Suliman',html:'<p>Islamic Studies educator, teacher trainer, and author with more than twenty years of experience in education.</p><p>I combine classroom teaching, educational leadership, teacher development, and content creation.</p>'}},
  {ar:{k:'ماذا أقدم؟',t:'خبرة تتحول إلى قيمة عملية',html:'<p>أساعد المؤسسات التعليمية في تحسين أداء المعلمين، وتطوير الممارسات الصفية، وبناء محتوى تعليمي أصيل، وتعزيز الجودة والهوية والقيم.</p>'},en:{k:'What I Offer',t:'Experience Translated into Practical Value',html:'<p>I help educational institutions improve teacher performance, strengthen classroom practice, develop original educational content, and advance quality, identity, and values.</p>'}},
  {ar:{k:'المؤلفات',t:'مؤلفات ومواد تعليمية من تأليفي',html:'<a class="tour-publications-visual" href="#library"><img src="assets/publications-collage.webp" alt="مجموعة من مؤلفات سامي سليمان"><span>استعرض المؤلفات</span></a>'},en:{k:'Publications',t:'Books and Educational Materials I Have Authored',html:'<a class="tour-publications-visual" href="#library"><img src="assets/publications-collage.webp" alt="A selection of books authored by Samy Suliman"><span>View publications</span></a>'}},
  {ar:{k:'الخطوة التالية',t:'أشكرك على وقتك',html:'<p>إذا رغبت في التعرف على المزيد، يمكنك استكشاف الملف المهني كاملًا أو التواصل معي مباشرة.</p>'},en:{k:'Next Step',t:'Thank You for Your Time',html:'<p>To learn more, explore the complete professional profile or contact me directly.</p>'}}
 ];
 function english(){return document.body.classList.contains('english');}
 function render(){
  const lang=english()?'en':'ar',s=steps[step][lang];
  kicker.textContent=s.k; title.textContent=s.t; body.innerHTML=s.html;
  counter.textContent=(lang==='en'?'Step ':'الخطوة ')+(step+1)+(lang==='en'?' of ':' من ')+steps.length;
  progress.style.width=((step+1)/steps.length*100)+'%';
  prev.hidden=step===0; prev.textContent=lang==='en'?'Previous':'السابق';
  next.textContent=lang==='en'?'Next':'التالي';
  skip.textContent=lang==='en'?'End tour':'إنهاء الجولة';
  close.setAttribute('aria-label',lang==='en'?'Close tour':'إغلاق الجولة');
  nav.hidden=step===steps.length-1; finalActions.hidden=step!==steps.length-1;
  document.getElementById('tourContact').textContent=lang==='en'?'Contact me':'تواصل معي';
  exploreBtn.textContent=lang==='en'?'Explore my professional profile':'استكشف ملفي المهني';
  body.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',closeTour));
 }
 function openTour(){lastFocus=document.activeElement;step=0;render();modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('tour-open');close.focus();}
 function closeTour(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');if(!explore.classList.contains('open'))document.body.classList.remove('tour-open');if(lastFocus)lastFocus.focus();}
 function openExplore(){closeTour();explore.classList.add('open');explore.setAttribute('aria-hidden','false');document.body.classList.add('tour-open');exploreClose.focus();}
 function closeExplore(){explore.classList.remove('open');explore.setAttribute('aria-hidden','true');document.body.classList.remove('tour-open');}
 document.querySelectorAll('[data-open-tour]').forEach(b=>b.addEventListener('click',openTour));
 document.querySelectorAll('[data-open-explore]').forEach(b=>b.addEventListener('click',openExplore));
 close.addEventListener('click',closeTour); skip.addEventListener('click',closeTour);
 prev.addEventListener('click',()=>{if(step>0){step--;render();}});
 next.addEventListener('click',()=>{if(step<steps.length-1){step++;render();}});
 exploreClose.addEventListener('click',closeExplore);
 modal.addEventListener('click',e=>{if(e.target===modal)closeTour();});
 explore.addEventListener('click',e=>{if(e.target===explore)closeExplore();});
 explore.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeExplore));
 document.getElementById('tourContact').addEventListener('click',closeTour);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(explore.classList.contains('open'))closeExplore();else if(modal.classList.contains('open'))closeTour();}});
 const observer=new MutationObserver(()=>{if(modal.classList.contains('open'))render();});
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
})();
