# PROJECT_MASTER_PLAN

## Vision
Professional bilingual portfolio focused on educational leadership and recruitment.

## Core Principles
- Do not change the current visual design unless explicitly requested.
- Every new feature must satisfy at least one:
  - Increase recruiter trust.
  - Save time.
  - Improve SEO.

## Current Architecture
- index.html
- articles.html
- article.html
- publisher.html
- articles/articles-data.js
- assets/articles.css
- assets/articles-common.js

## Articles
Single record contains:
- title_ar/title_en
- summary_ar/summary_en
- content_ar/content_en
- hero image
- optional video
- publish date
- status

Missing English should display:
> This article is currently available in Arabic only.

## MVP Priorities
1. Improve article listing spacing.
2. Improve article cards.
3. Improve article page.
4. SEO.
5. LinkedIn/X sharing.
6. Future multilingual expansion.

## Change Log
- 2026-07-20: Project master plan created.

## تحديث الإصدار v1.2 — لوحة النشر ثنائية اللغة

### تم إنجازه
- تحويل `publisher.html` إلى لوحة نشر خاصة متكاملة.
- دعم العربية والإنجليزية داخل سجل واحد لكل مقال.
- إضافة حقول: السلسلة، رقم المقال، الملخصين، الكلمات المفتاحية، وصف الصورة، الفيديو، وتاريخ النشر.
- دعم الحالات: مسودة، منشور، مجدول.
- إضافة المعاينة المحلية قبل التصدير.
- إضافة مكتبة للمقالات المحفوظة مع التعديل والنسخ والحذف وبطاقة المشاركة.
- الحفاظ على التوافق مع المقالات القديمة التي تستخدم `title` و`content`.
- تحديث صفحتي `articles.html` و`article.html` لعرض الترجمة الإنجليزية عند توفرها.
- إظهار التنبيه: `This article is currently available in Arabic only.` عند غياب الترجمة.
- اعتبار المقال المجدول منشورًا تلقائيًا عند حلول موعده بعد رفع ملف البيانات إلى GitHub.

### طريقة النشر الحالية
1. فتح `publisher.html` من الرابط الخاص.
2. كتابة المقال وحفظه أو معاينته.
3. الضغط على «تصدير ملف الموقع».
4. استبدال `articles/articles-data.js` بالملف المُصدَّر في GitHub.

### قرار معماري
GitHub Pages موقع ثابت؛ لذلك لا تستطيع صفحة المتصفح الكتابة مباشرة داخل مستودع GitHub دون خدمة خلفية أو ربط آمن. التصدير اليدوي هو أسلوب الإصدار الأول الآمن والمستقر.

### المرحلة التالية
- اعتماد الشكل البصري الجديد لبطاقات المقالات.
- إنشاء QR خاص بكل مقال داخل صورة المشاركة.
- تحسين SEO وOpen Graph بصورة ديناميكية قدر الإمكان ضمن قيود GitHub Pages.

## تحديث الإصدار v1.3 — إكمال تجربة لوحة النشر

### تم إنجازه
- إضافة بطاقة تعرض آخر مقال منشور فور فتح لوحة النشر.
- تحويل رفع الصورة إلى منطقة سحب وإفلات مع معاينة فورية وإمكانية إزالة الصورة.
- إضافة توليد QR خاص برابط كل مقال ومعاينته داخل لوحة النشر.
- إدراج QR داخل بطاقة المشاركة عند تفعيل الخيار.
- إضافة أزرار مستقلة لنسخ نص LinkedIn ونسخ نص X.
- إضافة زر «تصدير ملف الموقع» داخل شريط الإجراءات الثابت لتسهيل الوصول إليه.
- الحفاظ على زر التصدير في مكتبة المقالات أيضًا.
- تحسين استجابة عناصر رفع الصورة وQR على الجوال.

### ملاحظة تقنية
يعتمد توليد QR داخل المتصفح على مكتبة `qrcodejs` المحملة من CDN. بقية وظائف الحفظ والتصدير تظل محلية ولا تحتاج إلى خادم.

### المرحلة التالية
- إصلاح وإعادة بناء شبكة صفحة `articles.html` وفق الهوية البصرية المعتمدة.
- اختبار صفحة المقالات على الكمبيوتر والجوال قبل تسليم الإصدار التالي.

## تحديث v1.4 — إكمال لوحة النشر
- استبدال عبارة CONTENT PUBLISHER بعبارة «لوحة النشر».
- اعتماد عنوان «إنشاء مقال جديد».
- إضافة زر «مقال جديد» لمسح النموذج بأمان.
- إضافة شريط تنسيق خفيف للمحتوى: عريض، عنوان فرعي، اقتباس، قائمة، ورابط.
- دعم عرض التنسيق الأساسي داخل صفحة المقال.
- تحويل مكتبة المقالات المحفوظة إلى جدول قابل للتوسع.
- إضافة نافذة نجاح بعد النشر تتضمن معاينة المقال ونسخ الرابط ونصي LinkedIn وX.
- تصغير بطاقة آخر عملية نشر وتحسين تسمياتها.

## تحديث v2.0 — إعادة بناء صفحة المقالات

### تم إنجازه
- إعادة بناء `articles.html` دون تغيير لوحة النشر أو صيغة ملف البيانات.
- إنشاء تخطيط متوازن يمنع الفراغ الأبيض عند وجود مقال واحد أو عدد قليل من المقالات.
- اعتماد شبكة من عمودين على الكمبيوتر وعمود واحد على الجوال.
- إضافة بطاقة مقال مرقمة تتضمن الصورة، السلسلة، التاريخ، مدة القراءة، الملخص، ورابط القراءة.
- إضافة شريط بحث وترتيب وعدّاد واضح للمقالات.
- إضافة بطاقة تعريف بالكاتب وبطاقة QR جانبية.
- دعم العربية والإنجليزية في جميع عناصر الواجهة الجديدة.
- الإبقاء على رسالة عدم توفر الترجمة الإنجليزية عند غيابها.
- تحسين الاستجابة للشاشات المتوسطة والجوال.

### لم يتغير
- النشر ما زال يتم من `publisher.html`.
- التصدير ما زال ينتج `articles/articles-data.js`.
- صيغة سجل المقال والتوافق مع المقالات القديمة لم تتغير.

### المرحلة التالية
- إعادة تصميم `article.html` لتجربة قراءة احترافية ومشاركة أفضل.


## v2.0.1 — Desktop articles layout hotfix
- Added cache-busting version parameters to the articles CSS and JavaScript assets.
- Added explicit desktop-only layout safeguards for the hero, toolbar, article grid, and sidebar.
- Preserved the existing mobile layout without alteration.
- Reason: desktop browsers could retain an older cached stylesheet while mobile rendered the latest rules correctly.

## v2.0.2 — إنهاء صفحة المقالات
- معالجة العرض عند وجود مقال واحد: تمتد البطاقة عبر مساحة النتائج وتتحول إلى تصميم أفقي متوازن على الكمبيوتر.
- الإبقاء على شبكة البطاقات المعتادة عند وجود أكثر من مقال.
- توحيد رقم المقال في خانتين مثل `01` بدل `001`.
- تقليل عرض ومسافات الشريط الجانبي وإعادة ضبط حجم QR.
- إضافة رابط LinkedIn وزر نسخ رابط الموقع داخل الشريط الجانبي.
- الحفاظ على تخطيط الجوال دون تغيير جوهري.
- تحديث معلمات الملفات إلى `v2.0.2` لمنع تحميل نسخة CSS قديمة من ذاكرة المتصفح.

### الحالة
صفحة `articles.html` مكتملة للإصدار الحالي. المرحلة التالية عند البدء بها هي تحسين `article.html` فقط.


## v2.1 — الصقل النهائي لواجهة صفحة المقالات
- إعادة تصميم بطاقات المقالات بأسلوب تحريري هادئ مستوحى من صفحة قراءة المقال.
- إلغاء التصميم الأفقي الخاص بالمقال الواحد واعتماد بطاقة رأسية متوازنة في منتصف مساحة النتائج.
- تصغير شارة رقم المقال وإظهارها بخلفية بيضاء ذهبية خفيفة.
- تحسين مساحة الغلاف الافتراضي وإظهار عبارة «مقال» مع الرقم عند غياب الصورة.
- تخفيف الظلال واللون الأخضر داخل البطاقات وزيادة المساحات البيضاء.
- الحفاظ على عرض صورة المقال الفعلية عند توفرها، مع حركة بسيطة عند المرور.
- تصغير بطاقة الكاتب وQR بصريًا دون تغيير وظائفهما.
- الحفاظ على تخطيط الجوال المعتمد.

### الحالة
تم إغلاق تطوير `articles.html` في هذه المرحلة. الخطوة التالية هي صقل `article.html` وتجربة قراءة النص الطويل.


## v3.0 — دمج قائمة المقالات وصفحة القراءة
- دمج عرض قائمة المقالات وقراءة المقال الكامل داخل `articles.html`.
- أصبح رابط المقال: `articles.html?slug=...`.
- إضافة انتقال داخلي سلس وزر رجوع يحفظ موضع التمرير السابق.
- دعم زر الرجوع في المتصفح عبر History API.
- الإبقاء على البحث والترتيب واللغة في الصفحة نفسها.
- تحويل `article.html` إلى إعادة توجيه للروابط القديمة حتى لا تنكسر الروابط المنشورة سابقًا.
- لم تتغير لوحة النشر أو ملف `articles/articles-data.js`.


## v3.0.1 — مشاركة المحتوى
- إضافة عنوان واضح «شارك المحتوى» داخل عرض المقال الكامل.
- إضافة زر WhatsApp لمشاركة عنوان المقال ورابطه مباشرة.
- الإبقاء على LinkedIn وX ونسخ الرابط.
- تحسين ترتيب أزرار المشاركة على الجوال والكمبيوتر.

## V3.0 — Articles SPA consolidation
- `articles.html` is the single public articles page.
- Without `?slug=`, it renders the published articles listing.
- With `?slug=...`, it renders the selected article in the same page.
- `article.html` remains a temporary compatibility redirect to `articles.html?slug=...`.
- The duplicated listing Hero was removed; only one Hero remains.
- Direct article links now return safely to the listing instead of depending on browser history.
- Article title, description, canonical URL, Open Graph title/description/URL, and content type update dynamically.
- Invalid or unavailable slugs fall back to the listing and clean the URL.


## V3.0.2 – إصلاح النشر والتصدير
- أصبح نشر المقال ينزّل تلقائيًا ملف `articles-data.js` الجاهز للرفع إلى GitHub.
- منع تصدير ملف فارغ مع رسالة واضحة.
- توحيد روابط المعاينة والمشاركة على `articles.html?slug=`.
- دمج بيانات GitHub العامة مع بيانات المتصفح حتى لا تخفي قاعدة محلية فارغة المقالات المنشورة.


## v3.0.3 — Safe article reading clarity
- Kept SPA routing, publishing, export, and public data logic unchanged.
- Added a visible article-content heading and spacing so body text is distinguishable from the summary on mobile.
- Updated cache-busting query strings to v3.0.3.

## PWA v3.1
- Added `manifest.webmanifest`, installable icons, and root-scoped `service-worker.js`.
- Public pages can be installed on mobile as a standalone app.
- HTML and `articles/articles-data.js` use network-first caching so newly published articles are not hidden by an old cache.
- Static assets use cache-first with background refresh for faster repeat visits.

## v3.2 — الجولة التعريفية المهنية
- إضافة زر «ابدأ الجولة التعريفية — دقيقتان» في واجهة الصفحة الرئيسية.
- ست خطوات ثنائية اللغة: التعريف، الخبرة، الإنجازات، المؤلفات، القيمة المضافة، والخطوة التالية.
- تعمل داخل نافذة واحدة على الجوال والكمبيوتر، مع شريط تقدم وإمكانية الإغلاق في أي وقت.
- ترتبط في النهاية بالسيرة الذاتية، والمؤلفات، والتواصل.
- لم يتم تغيير نظام المقالات أو روابط SPA أو بيانات النشر.
