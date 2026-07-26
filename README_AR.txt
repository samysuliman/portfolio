تحديث إصلاحي v2 لأكاديمية رشيد

ارفع الملفات الأربعة إلى نفس مساراتها:
1) academy/admin/dashboard.html
2) academy/admin/registrations.html
3) academy/admin/students.html
4) academy/assets/js/admin.js

الإصلاحات:
- زر «الطلاب» يفتح students.html فعليًا.
- بعد تحويل طلب إلى طالب يبقى «تم التحويل ✓» حتى بعد تحديث الصفحة.
- تغيير حالة الطلب يظل محفوظًا في Supabase كما كان.
- تم تغيير رقم نسخة admin.js إلى v=1.2.0 لتجاوز كاش المتصفح.

بعد الرفع:
- انتظر GitHub Pages قليلًا.
- افتح الصفحة ثم اضغط Ctrl+F5 مرة واحدة.
