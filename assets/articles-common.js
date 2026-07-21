(function(){
 'use strict';

 const SCHEMA_VERSION=2;
 const STORAGE_KEY='samy_articles_v2';
 const MIGRATION_KEY='samy_articles_v2_initialized';
 const LEGACY_KEYS=['samy_articles_v1','samy_articles_v3','samy_articles_v4'];
 const PUBLIC=Array.isArray(window.SAMY_ARTICLES)?window.SAMY_ARTICLES:[];

 function excerpt(text,n=180){
  const clean=String(text||'').replace(/\s+/g,' ').trim();
  return clean.length>n?clean.slice(0,n).trim()+'…':clean;
 }

 function asKeywords(value){
  if(Array.isArray(value))return value.map(v=>String(v).trim()).filter(Boolean);
  return String(value||'').split(/[،,]/).map(v=>v.trim()).filter(Boolean);
 }

 function normalize(article={}){
  const titleAr=String(article.titleAr||article.title||'').trim();
  const contentAr=String(article.contentAr||article.content||'').trim();
  const summaryAr=String(article.summaryAr||article.summary||excerpt(contentAr,220)).trim();
  const titleEn=String(article.titleEn||'').trim();
  const contentEn=String(article.contentEn||'').trim();
  const summaryEn=String(article.summaryEn||excerpt(contentEn,220)).trim();
  const now=new Date().toISOString();
  const normalized={
   ...article,
   schemaVersion:SCHEMA_VERSION,
   id:String(article.id||('a'+Date.now())),
   slug:String(article.slug||slugify(titleAr||titleEn||'article')),
   number:String(article.number||'').trim(),
   series:String(article.series||'').trim(),
   titleAr,summaryAr,contentAr,titleEn,summaryEn,contentEn,
   title:titleAr,summary:summaryAr,content:contentAr,
   image:String(article.image||''),
   imageAltAr:String(article.imageAltAr||''),
   video:String(article.video||''),
   keywords:asKeywords(article.keywords),
   status:['draft','published','scheduled'].includes(article.status)?article.status:'draft',
   publishAt:article.publishAt||article.createdAt||now,
   createdAt:article.createdAt||now,
   updatedAt:article.updatedAt||article.createdAt||now,
   hasEnglish:Boolean(titleEn&&contentEn)
  };
  return normalized;
 }

 function safeParse(raw){
  try{const value=JSON.parse(raw);return Array.isArray(value)?value:null}catch(e){return null}
 }

 function initializeCleanStore(){
  try{
   if(localStorage.getItem(MIGRATION_KEY)==='1')return;
   LEGACY_KEYS.forEach(k=>localStorage.removeItem(k));
   localStorage.removeItem(STORAGE_KEY);
   localStorage.setItem(MIGRATION_KEY,'1');
  }catch(e){}
 }

 function local(){
  initializeCleanStore();
  try{
   const raw=localStorage.getItem(STORAGE_KEY);
   const saved=raw===null?[]:safeParse(raw);
   const merged=new Map();
   PUBLIC.map(normalize).forEach(a=>merged.set(a.id||a.slug,a));
   (saved||[]).map(normalize).forEach(a=>merged.set(a.id||a.slug,a));
   return Array.from(merged.values());
  }catch(e){return PUBLIC.map(normalize)}
 }

 function all(){return local()}
 function isPublished(a){
  const due=new Date(a.publishAt||a.createdAt||0)<=new Date();
  return (a.status==='published'||a.status==='scheduled')&&due;
 }
 function published(){return all().filter(isPublished).sort((a,b)=>new Date(b.publishAt||b.createdAt)-new Date(a.publishAt||a.createdAt))}
 function save(items){
  const data=Array.isArray(items)?items.map(normalize):[];
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));return true}catch(e){return false}
 }
 function resetLocalArticles(){
  try{localStorage.removeItem(STORAGE_KEY);LEGACY_KEYS.forEach(k=>localStorage.removeItem(k));localStorage.setItem(MIGRATION_KEY,'1');return true}catch(e){return false}
 }
 function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
 function slugify(s){return String(s||'article').trim().toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[^\u0600-\u06FFa-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90)||('article-'+Date.now())}
 function formatDate(value,english=false){if(!value)return '';return new Intl.DateTimeFormat(english?'en-GB':'ar-SA',{year:'numeric',month:'long',day:'numeric'}).format(new Date(value))}
 function youtubeId(url=''){const m=String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);return m?m[1]:''}

 function visualTheme(article){
  const a=normalize(article||{});
  if(a.visualTheme)return a.visualTheme;
  const text=[a.series,a.titleAr,a.titleEn,a.summaryAr,a.summaryEn,a.contentAr,a.contentEn,a.keywords.join(' ')].join(' ').toLowerCase();
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
 function localized(a,english=false){
  const n=normalize(a);
  if(english&&n.hasEnglish)return {title:n.titleEn,summary:n.summaryEn||excerpt(n.contentEn),content:n.contentEn,available:true};
  if(english)return {title:n.titleAr,summary:n.summaryAr,content:n.contentAr,available:false};
  return {title:n.titleAr,summary:n.summaryAr,content:n.contentAr,available:true};
 }

 initializeCleanStore();
 window.SamyArticles={
  PUBLIC,key:STORAGE_KEY,STORAGE_KEY,SCHEMA_VERSION,normalize,local,all,published,isPublished,save,resetLocalArticles,
  escapeHtml,slugify,excerpt,formatDate,youtubeId,localized,visualTheme,visualThemeMeta
 };
})();
