(function(){
 const PUBLIC=Array.isArray(window.SAMY_ARTICLES)?window.SAMY_ARTICLES:[];
 const key='samy_articles_v1';
 function normalize(a){const titleAr=a.titleAr||a.title||'',contentAr=a.contentAr||a.content||'',summaryAr=a.summaryAr||a.summary||excerpt(contentAr,220);return {...a,titleAr,contentAr,summaryAr,title:a.title||titleAr,content:a.content||contentAr,summary:a.summary||summaryAr,titleEn:a.titleEn||'',contentEn:a.contentEn||'',summaryEn:a.summaryEn||'',hasEnglish:Boolean((a.titleEn||'').trim()&&(a.contentEn||'').trim())}}
 function local(){try{const raw=localStorage.getItem(key);return (raw===null?PUBLIC:JSON.parse(raw)).map(normalize)}catch(e){return PUBLIC.map(normalize)}}
 function all(){return local()}
 function isPublished(a){const due=new Date(a.publishAt||a.createdAt||0)<=new Date();return (a.status==='published'||a.status==='scheduled')&&due}
 function published(){return all().filter(isPublished).sort((a,b)=>new Date(b.publishAt||b.createdAt)-new Date(a.publishAt||a.createdAt))}
 function save(items){localStorage.setItem(key,JSON.stringify(items.map(normalize)))}
 function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
 function slugify(s){return String(s||'article').trim().toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[^\u0600-\u06FFa-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90)||('article-'+Date.now())}
 function excerpt(text,n=180){const clean=String(text||'').replace(/\s+/g,' ').trim();return clean.length>n?clean.slice(0,n).trim()+'…':clean}
 function formatDate(value,english=false){if(!value)return '';return new Intl.DateTimeFormat(english?'en-GB':'ar-SA',{year:'numeric',month:'long',day:'numeric'}).format(new Date(value))}
 function youtubeId(url=''){const m=String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);return m?m[1]:''}
 function localized(a,english=false){const n=normalize(a);if(english&&n.hasEnglish)return {title:n.titleEn,summary:n.summaryEn||excerpt(n.contentEn),content:n.contentEn,available:true};if(english)return {title:n.titleAr,summary:n.summaryAr,content:n.contentAr,available:false};return {title:n.titleAr,summary:n.summaryAr,content:n.contentAr,available:true}}
 window.SamyArticles={PUBLIC,key,normalize,local,all,published,isPublished,save,escapeHtml,slugify,excerpt,formatDate,youtubeId,localized};
})();
