(function(){
 const PUBLIC=Array.isArray(window.SAMY_ARTICLES)?window.SAMY_ARTICLES:[];
 const key='samy_articles_v1';
 function local(){try{const raw=localStorage.getItem(key);return raw===null?PUBLIC.map(a=>({...a})):JSON.parse(raw)}catch(e){return PUBLIC.map(a=>({...a}))}}
 function all(){return local()}
 function isPublished(a){if(a.status!=='published')return false;return new Date(a.publishAt||a.createdAt||0)<=new Date()}
 function published(){return all().filter(isPublished).sort((a,b)=>new Date(b.publishAt||b.createdAt)-new Date(a.publishAt||a.createdAt))}
 function save(items){localStorage.setItem(key,JSON.stringify(items))}
 function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
 function slugify(s){return String(s||'article').trim().toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[^؀-ۿa-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90)||('article-'+Date.now())}
 function excerpt(text,n=180){const clean=String(text||'').replace(/\s+/g,' ').trim();return clean.length>n?clean.slice(0,n).trim()+'…':clean}
 function formatDate(value,english=false){if(!value)return '';return new Intl.DateTimeFormat(english?'en-GB':'ar-SA',{year:'numeric',month:'long',day:'numeric'}).format(new Date(value))}
 function youtubeId(url=''){const m=String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);return m?m[1]:''}
 function title(a,en=false){return en?(a.titleEn||a.titleAr||a.title||''):(a.titleAr||a.title||a.titleEn||'')}
 function summary(a,en=false){return en?(a.summaryEn||''):(a.summaryAr||a.summary||'')}
 function content(a,en=false){return en?(a.contentEn||a.contentAr||a.content||''):(a.contentAr||a.content||a.contentEn||'')}
 function hasEnglish(a){return Boolean((a.titleEn||'').trim()&&(a.contentEn||'').trim())}
 window.SamyArticles={PUBLIC,key,local,all,published,save,escapeHtml,slugify,excerpt,formatDate,youtubeId,title,summary,content,hasEnglish};
})();
