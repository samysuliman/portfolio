(function(){
 'use strict';
 const PUBLIC=Array.isArray(window.SAMY_ARTICLES)?window.SAMY_ARTICLES:[];
 const key='samy_articles_v2';
 const schemaVersion=2;
 const legacyKeys=['samy_articles_v1','samy_articles_v3','samy_articles_v4'];
 const cleanupFlag='samy_articles_v2_cleanup_complete';

 function excerpt(text,n=180){const clean=String(text||'').replace(/\s+/g,' ').trim();return clean.length>n?clean.slice(0,n).trim()+'…':clean}
 function asArray(value){if(Array.isArray(value))return value.map(String).map(s=>s.trim()).filter(Boolean);return String(value||'').split(/[،,]/).map(s=>s.trim()).filter(Boolean)}
 function normalize(a={}){
  const titleAr=String(a.titleAr||a.title||'').trim();
  const contentAr=String(a.contentAr||a.content||'').trim();
  const summaryAr=String(a.summaryAr||a.summary||excerpt(contentAr,220)).trim();
  const titleEn=String(a.titleEn||'').trim();
  const contentEn=String(a.contentEn||'').trim();
  return {...a,schemaVersion,id:a.id||('a'+Date.now()),slug:a.slug||slugify(titleAr),titleAr,contentAr,summaryAr,title:titleAr,content:contentAr,summary:summaryAr,titleEn,contentEn,summaryEn:String(a.summaryEn||'').trim(),keywords:asArray(a.keywords),status:a.status||'draft',hasEnglish:Boolean(titleEn&&contentEn)};
 }
 function storageAvailable(){try{const t='__samy_test__';localStorage.setItem(t,'1');localStorage.removeItem(t);return true}catch(e){return false}}
 function cleanLegacyStorage(){if(!storageAvailable())return;try{if(localStorage.getItem(cleanupFlag)==='1')return;legacyKeys.forEach(k=>localStorage.removeItem(k));localStorage.setItem(cleanupFlag,'1')}catch(e){}}
 function readSaved(){if(!storageAvailable())return [];try{const raw=localStorage.getItem(key);if(raw===null)return [];const parsed=JSON.parse(raw);return Array.isArray(parsed)?parsed.map(normalize):[]}catch(e){return []}}
 function local(){cleanLegacyStorage();const merged=new Map();PUBLIC.map(normalize).forEach(a=>merged.set(a.id||a.slug,a));readSaved().forEach(a=>merged.set(a.id||a.slug,a));return Array.from(merged.values())}
 function all(){return local()}
 function isPublished(a){const due=new Date(a.publishAt||a.createdAt||0)<=new Date();return (a.status==='published'||a.status==='scheduled')&&due}
 function published(){return all().filter(isPublished).sort((a,b)=>new Date(b.publishAt||b.createdAt)-new Date(a.publishAt||a.createdAt))}
 function save(items){if(!storageAvailable())return false;try{localStorage.setItem(key,JSON.stringify((Array.isArray(items)?items:[]).map(normalize)));return true}catch(e){return false}}
 function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
 function slugify(s){return String(s||'article').trim().toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[^\u0600-\u06FFa-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90)||('article-'+Date.now())}
 function excerpt(text,n=180){const clean=String(text||'').replace(/\s+/g,' ').trim();return clean.length>n?clean.slice(0,n).trim()+'…':clean}
 function formatDate(value,english=false){if(!value)return '';return new Intl.DateTimeFormat(english?'en-GB':'ar-SA',{year:'numeric',month:'long',day:'numeric'}).format(new Date(value))}
 function youtubeId(url=''){const m=String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);return m?m[1]:''}

 function visualTheme(article){
  const a=normalize(article||{});
  if(a.visualTheme)return a.visualTheme;
  const text=[a.series,a.titleAr,a.titleEn,a.summaryAr,a.summaryEn,a.contentAr,a.contentEn,Array.isArray(a.keywords)?a.keywords.join(' '):a.keywords].join(' ').toLowerCase();
  const rules=[
   ['seerah',/(السيرة|النبي|الرسول|محمد|صحابي|صحابة|الهجرة|غار|مكة|المدينة|سراقة|كسرى|حديث|نبوية|prophet|seerah|sunnah|hijrah)/],
   ['quran',/(القرآن|قرآن|آية|سورة|تفسير|تجويد|وحي|quran|qur'an|tafsir|tajweed)/],
   ['leadership',/(قيادة|قائد|إدارة|مدير|وكيل|فريق|صناعة القرار|استراتيجية|حوكمة|leadership|management|strategy|leader)/],
   ['education',/(تعليم|معلم|طالب|مدرسة|تدريب|منهج|صف|تعلم|تربية|education|teacher|student|school|training|curriculum)/],
   ['business',/(أعمال|مبيعات|تسويق|تطوير الأعمال|عميل|مشروع|استثمار|ربح|business|sales|marketing|customer|investment)/],
   ['values',/(أمل|ابتلاء|ثقة|إيمان|صبر|قيم|أخلاق|نجاح|تميّز|جودة|hope|faith|values|quality|success)/]
  ];
  for(const [name,re] of rules)if(re.test(text))return name;
  return 'professional';
 }
 function visualThemeMeta(article,english=false){
  const theme=visualTheme(article);
  const meta={
   seerah:{icon:'☾',ar:'من السيرة النبوية',en:'From the Prophetic Biography'},
   quran:{icon:'۞',ar:'قرآن وتدبر',en:'Quran & Reflection'},
   leadership:{icon:'◆',ar:'قيادة وإدارة',en:'Leadership & Management'},
   education:{icon:'✦',ar:'تعليم وتطوير',en:'Education & Development'},
   business:{icon:'↗',ar:'أعمال ونمو',en:'Business & Growth'},
   values:{icon:'★',ar:'قيم وإلهام',en:'Values & Inspiration'},
   professional:{icon:'✦',ar:'رؤية مهنية',en:'Professional Insight'}
  }[theme];
  return {theme,icon:meta.icon,label:english?meta.en:meta.ar};
 }
 function localized(a,english=false){const n=normalize(a);if(english&&n.hasEnglish)return {title:n.titleEn,summary:n.summaryEn||excerpt(n.contentEn),content:n.contentEn,available:true};if(english)return {title:n.titleAr,summary:n.summaryAr,content:n.contentAr,available:false};return {title:n.titleAr,summary:n.summaryAr,content:n.contentAr,available:true}}
 window.SamyArticles={PUBLIC,key,schemaVersion,legacyKeys,normalize,local,all,published,isPublished,save,storageAvailable,cleanLegacyStorage,escapeHtml,slugify,excerpt,formatDate,youtubeId,localized,visualTheme,visualThemeMeta};
})();
