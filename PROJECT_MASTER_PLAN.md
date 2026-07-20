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
