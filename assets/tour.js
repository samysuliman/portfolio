(function(){
 'use strict';
 const modal=document.getElementById('introTour');
 const explore=document.getElementById('exploreHub');
 if(!modal) return;
 const title=document.getElementById('tourTitle');
 const kicker=document.getElementById('tourKicker');
 const body=document.getElementById('tourBody');
 const close=document.getElementById('tourClose');
 const skip=document.getElementById('tourSkip');
 const exploreBtn=document.getElementById('tourExplore');
 const exploreClose=document.getElementById('exploreClose');
 const contact=document.getElementById('tourContact');
 const progressWrap=modal.querySelector('.tour-progress-wrap');
 const nav=document.getElementById('tourNavGroup');
 const finalActions=document.getElementById('tourFinalActions');
 let lastFocus=null;

 const cards={
  ar:[
   {icon:'👤',title:'نبذة عني',text:'معلم وقائد تربوي ومدرب ومؤلف، بخبرة تتجاوز عشرين عامًا في التعليم.',href:'#why'},
   {icon:'💼',title:'الخبرات المهنية',text:'خبرة متنوعة في التدريس والإشراف والتدريب وتطوير المحتوى التعليمي.',href:'#experience'},
   {icon:'🏫',title:'الخبرة القيادية',text:'قيادة فرق العمل، ومتابعة الخطط، وتطوير المعلمين وتحسين الأداء.',href:'#experience'},
   {icon:'🎓',title:'المؤهلات',text:'تأهيل أزهري وتربوي، مع تطوير مهني مستمر في التعليم والقيادة.',href:'#experience'},
   {icon:'📚',title:'المؤلفات',text:'مؤلفات ومواد تعليمية من تأليفي في التجويد والسيرة والتعليم.',href:'#library',featured:true},
   {icon:'⭐',title:'الجودة والإنتاجية',text:'تحسين العمليات، وبناء الشواهد، ورفع كفاءة وجودة الأداء التعليمي.',href:'#quality'},
   {icon:'🏆',title:'التميز المهني والإنجازات',text:'مبادرات وتكريمات وشواهد مهنية تعكس الالتزام والتميز في العمل.',href:'#recognition'},
   {icon:'🌍',title:'تعليم العربية لغير الناطقين بها',text:'خبرة في تبسيط العربية والقرآن للمتعلمين من خلفيات ومستويات مختلفة.',href:'#experience'},
   {icon:'📞',title:'تواصل معي',text:'يسعدني مناقشة فرص العمل والتعاون في التعليم والقيادة والتدريب.',href:'#contact'}
  ],
  en:[
   {icon:'👤',title:'About Me',text:'Educator, school leader, trainer, and author with over twenty years of experience.',href:'#why'},
   {icon:'💼',title:'Professional Experience',text:'Experience in teaching, supervision, training, and educational content development.',href:'#experience'},
   {icon:'🏫',title:'Leadership Experience',text:'Leading teams, following plans, developing teachers, and improving performance.',href:'#experience'},
   {icon:'🎓',title:'Qualifications',text:'Al-Azhar and educational qualifications with continuous professional development.',href:'#experience'},
   {icon:'📚',title:'Publications',text:'Books and educational materials I have authored in Tajweed, Seerah, and education.',href:'#library',featured:true},
   {icon:'⭐',title:'Quality & Productivity',text:'Improving processes, building evidence, and raising educational performance quality.',href:'#quality'},
   {icon:'🏆',title:'Professional Excellence',text:'Initiatives, recognition, and evidence reflecting commitment and professional excellence.',href:'#recognition'},
   {icon:'🌍',title:'Arabic for Non-Native Speakers',text:'Experience simplifying Arabic and Qur’an learning for varied backgrounds and levels.',href:'#experience'},
   {icon:'📞',title:'Contact Me',text:'I welcome opportunities in education, leadership, training, and collaboration.',href:'#contact'}
  ]
 };

 function english(){return document.body.classList.contains('english');}
 function render(){
  const lang=english()?'en':'ar';
  kicker.textContent=lang==='en'?'A quick professional overview':'نبذة مهنية سريعة';
  title.textContent=lang==='en'?'Meet Me in 2 Minutes':'تعرّف عليّ في دقيقتين';
  body.innerHTML='<div class="tour-card-grid">'+cards[lang].map(c=>
   '<a class="tour-summary-card'+(c.featured?' featured':'')+'" href="'+c.href+'" data-tour-target="'+c.href+'">'+
    '<span class="tour-card-icon" aria-hidden="true">'+c.icon+'</span>'+ 
    '<h3>'+c.title+'</h3>'+ 
    (c.featured?'<div class="tour-books-strip" aria-label="'+(lang==='en'?'Selected book covers':'نماذج من أغلفة المؤلفات')+'">'+
      '<img src="assets/tajweed-book.jpg" alt="" loading="eager">'+
      '<img src="assets/children-part-1-new.webp" alt="" loading="eager">'+
      '<img src="assets/tajweed-part-1.webp" alt="" loading="eager">'+
      '<img src="assets/children-part-2.jpg" alt="" loading="eager">'+
      '<img src="assets/adult-part-1.jpg" alt="" loading="eager">'+
     '</div>':'')+
    '<p>'+c.text+'</p><span class="tour-card-more">'+(lang==='en'?'Learn more':'اعرف المزيد')+' ←</span></a>'
  ).join('')+'</div>';
  skip.textContent=lang==='en'?'Close':'إغلاق';
  close.setAttribute('aria-label',lang==='en'?'Close tour':'إغلاق الجولة');
  contact.textContent=lang==='en'?'Contact me':'تواصل معي';
  exploreBtn.textContent=lang==='en'?'Explore my professional profile':'استكشف ملفي المهني';
  progressWrap.hidden=true;
  nav.hidden=true;
  finalActions.hidden=false;
  body.querySelectorAll('a[data-tour-target]').forEach(a=>a.addEventListener('click',function(event){
   event.preventDefault();
   const selector=this.getAttribute('data-tour-target');
   const target=document.querySelector(selector);
   closeTour(false);
   if(target){
    history.replaceState(null,'',selector);
    requestAnimationFrame(()=>target.scrollIntoView({behavior:'smooth',block:'start'}));
   }
  }));
 }
 function openTour(){lastFocus=document.activeElement;render();modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('tour-open');close.focus();}
 function closeTour(restoreFocus=true){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');if(!explore.classList.contains('open'))document.body.classList.remove('tour-open');if(restoreFocus&&lastFocus)lastFocus.focus();}
 function openExplore(){closeTour();explore.classList.add('open');explore.setAttribute('aria-hidden','false');document.body.classList.add('tour-open');exploreClose.focus();}
 function closeExplore(){explore.classList.remove('open');explore.setAttribute('aria-hidden','true');document.body.classList.remove('tour-open');}
 document.querySelectorAll('[data-open-tour]').forEach(b=>b.addEventListener('click',openTour));
 document.querySelectorAll('[data-open-explore]').forEach(b=>b.addEventListener('click',openExplore));
 close.addEventListener('click',closeTour); skip.addEventListener('click',closeTour);
 exploreClose.addEventListener('click',closeExplore);
 modal.addEventListener('click',e=>{if(e.target===modal)closeTour();});
 explore.addEventListener('click',e=>{if(e.target===explore)closeExplore();});
 explore.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeExplore));
 contact.addEventListener('click',closeTour);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(explore.classList.contains('open'))closeExplore();else if(modal.classList.contains('open'))closeTour();}});
 const observer=new MutationObserver(()=>{if(modal.classList.contains('open'))render();});
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
})();
