(function () {
  'use strict';

  const modal = document.getElementById('introTour');
  const explore = document.getElementById('exploreHub');
  if (!modal) return;

  const title = document.getElementById('tourTitle');
  const kicker = document.getElementById('tourKicker');
  const body = document.getElementById('tourBody');
  const counter = document.getElementById('tourCounter');
  const time = document.getElementById('tourTime');
  const progress = document.getElementById('tourProgressBar');
  const prev = document.getElementById('tourPrev');
  const next = document.getElementById('tourNext');
  const close = document.getElementById('tourClose');
  const skip = document.getElementById('tourSkip');
  const nav = document.getElementById('tourNavGroup');
  const finalActions = document.getElementById('tourFinalActions');
  const exploreClose = document.getElementById('exploreClose');

  let step = 0;
  let lastFocus = null;

  const publicationsArabic = `
    <div class="tour-book-showcase" aria-label="نماذج من مؤلفات سامي سليمان">
      <img src="assets/tajweed-book.jpg" alt="إعلام القراء بأحكام القراءة والإقراء" loading="eager">
      <img src="assets/children-part-1-new.webp" alt="السيرة النبوية للأطفال - الجزء الأول" loading="eager">
      <img src="assets/adult-part-1.jpg" alt="حياة النبي محمد صلى الله عليه وسلم - الجزء الأول" loading="eager">
      <img src="assets/tajweed-part-1.webp" alt="مادة تعليمية في أحكام التجويد" loading="eager">
      <img src="assets/children-part-2.jpg" alt="مادة تعليمية من سلسلة السيرة النبوية" loading="eager">
    </div>
    <p>مؤلفات مطبوعة ومواد تعليمية في أحكام التجويد والسيرة النبوية، منها إصدارات ثنائية اللغة العربية والإنجليزية.</p>
    <a class="tour-publications-link" href="#library">استعرض المؤلفات</a>`;

  const publicationsEnglish = `
    <div class="tour-book-showcase" aria-label="Selected publications by Samy Suliman">
      <img src="assets/tajweed-book.jpg" alt="Tajweed publication" loading="eager">
      <img src="assets/children-part-1-new.webp" alt="Prophetic biography for children - Part One" loading="eager">
      <img src="assets/adult-part-1.jpg" alt="Life of Prophet Muhammad - Part One" loading="eager">
      <img src="assets/tajweed-part-1.webp" alt="Educational material in Tajweed" loading="eager">
      <img src="assets/children-part-2.jpg" alt="Educational material from the Prophetic biography series" loading="eager">
    </div>
    <p>Printed books and educational materials in Tajweed and the Prophetic biography, including bilingual Arabic-English editions.</p>
    <a class="tour-publications-link" href="#library">View publications</a>`;

  const steps = [
    {
      icon: '👤',
      ar: {
        k: 'نبذة مهنية سريعة',
        t: 'نبذة عني',
        html: '<p>معلم تربية إسلامية وقائد تربوي بخبرة تتجاوز 20 عامًا في التعليم والإشراف، أسهمت في تدريب المعلمين وتأليف المواد التعليمية وتعليم اللغة العربية للناطقين بغيرها، مع اهتمام ببناء شخصية الطالب وتعزيز الهوية والقيم.</p>'
      },
      en: {
        k: 'A quick professional overview',
        t: 'About Me',
        html: '<p>Islamic Studies educator and educational leader with more than 20 years of experience in teaching and supervision, with contributions to teacher training, educational publishing, and Arabic instruction for non-native speakers.</p>'
      }
    },
    {
      icon: '💼',
      ar: {
        k: 'من 2006 إلى 2026',
        t: 'الخبرات المهنية',
        html: '<ul><li>معلم للعلوم الشرعية واللغة العربية بالأزهر الشريف من 2006 حتى 2015.</li><li>معلم التربية الإسلامية بمدارس التربية النموذجية الدولية من 2015 حتى 2026 للصفوف من السادس إلى الثاني عشر.</li><li>تدريس القرآن الكريم والفقه والحديث والتفسير والتجويد والتوحيد.</li></ul>'
      },
      en: {
        k: 'From 2006 to 2026',
        t: 'Professional Experience',
        html: '<ul><li>Teacher of Islamic sciences and Arabic at Al-Azhar from 2006 to 2015.</li><li>Islamic Studies teacher at Al-Tarbiyah Al-Namouthajiyah International Schools from 2015 to 2026, Grades 6–12.</li><li>Teaching Qur’an, Fiqh, Hadith, Tafsir, Tajweed, and Tawheed.</li></ul>'
      }
    },
    {
      icon: '🏫',
      ar: {
        k: 'قيادة وإشراف تربوي',
        t: 'الخبرة القيادية',
        html: '<ul><li>مشرف قسم الدراسات الإسلامية بالقسم الدولي.</li><li>قيادة وتطوير فريق العمل التربوي والإشراف على الخطط الدراسية والبرامج التعليمية.</li><li>عضو لجنة الاختبارات والكنترول، وعضو فريق الاعتماد الوزاري والدولي.</li><li>المشاركة في برامج التطوير المهني ومعالجة المشكلات السلوكية والأكاديمية.</li></ul>'
      },
      en: {
        k: 'Educational leadership and supervision',
        t: 'Leadership Experience',
        html: '<ul><li>Head of Islamic Studies in the international section.</li><li>Led and developed educational teams and supervised academic plans and programs.</li><li>Member of examination, control, and national and international accreditation teams.</li><li>Contributed to professional development and student support plans.</li></ul>'
      }
    },
    {
      icon: '🎓',
      ar: {
        k: 'المؤهلات العلمية',
        t: 'المؤهلات',
        html: '<ul class="tour-qualifications"><li><strong>ليسانس أصول الدين والدعوة</strong> – جامعة الأزهر (2004م) – بتقدير ممتاز.</li><li><strong>دبلومة عامة في التربية</strong> – كلية التربية، جامعة الأزهر (2010م).</li><li><strong>التخصص:</strong> التفسير وعلوم القرآن.</li></ul>'
      },
      en: {
        k: 'Academic qualifications',
        t: 'Qualifications',
        html: '<ul class="tour-qualifications"><li><strong>B.A. in Fundamentals of Religion and Da‘wah</strong> – Al-Azhar University (2004), Excellent grade.</li><li><strong>General Diploma in Education</strong> – Faculty of Education, Al-Azhar University (2010).</li><li><strong>Specialization:</strong> Tafsir and Qur’anic Sciences.</li></ul>'
      }
    },
    {
      icon: '📚',
      ar: { k: 'أعمال معرفية وتعليمية', t: 'المؤلفات', html: publicationsArabic },
      en: { k: 'Books and educational resources', t: 'Publications', html: publicationsEnglish }
    },
    {
      icon: '⭐',
      ar: {
        k: 'تحسين مستمر قائم على الأدلة',
        t: 'الجودة والإنتاجية',
        html: '<ul><li>تطوير المناهج والأنشطة التعليمية بما يحقق معايير الجودة.</li><li>إعداد الخطط العلاجية الفردية ومتابعة تقدم الطلاب.</li><li>تصميم الأنشطة التعليمية والتقويمية واستخدام التطبيقات والتقنيات الحديثة.</li><li>المساهمة في الاعتماد الأكاديمي الوزاري والدولي.</li></ul>'
      },
      en: {
        k: 'Evidence-based continuous improvement',
        t: 'Quality & Productivity',
        html: '<ul><li>Developed curricula and educational activities aligned with quality standards.</li><li>Prepared individual remedial plans and followed student progress.</li><li>Designed learning and assessment activities using modern educational technology.</li><li>Contributed to national and international academic accreditation.</li></ul>'
      }
    },
    {
      icon: '🏆',
      ar: {
        k: 'إنجازات موثقة',
        t: 'التميز المهني والإنجازات',
        html: '<ul><li>جائزة الشركة الوطنية للتعليم – المركز الثاني (2025م).</li><li>شهادة تقدير من مدارس التربية النموذجية الدولية (2023–2024م).</li><li>شهادة تقدير من Cognia للمساهمة في الاعتماد الأكاديمي (2021م).</li><li>شهادة تقدير من جمعية الاعتماد الأمريكية الدولية AIAA (2020م).</li></ul>'
      },
      en: {
        k: 'Documented achievements',
        t: 'Professional Excellence & Achievements',
        html: '<ul><li>National Company for Learning & Education Award – Second Place (2025).</li><li>Certificate of Appreciation from Al-Tarbiyah Al-Namouthajiyah International Schools (2023–2024).</li><li>Cognia recognition for contribution to academic accreditation (2021).</li><li>AIAA recognition (2020).</li></ul>'
      }
    },
    {
      icon: '🌍',
      ar: {
        k: 'تعليم لغوي متخصص',
        t: 'تعليم العربية لغير الناطقين بها',
        html: '<ul><li>تقديم برامج تعليمية متخصصة للمتعلمين الجدد.</li><li>استخدام استراتيجيات حديثة وتفاعلية في تعليم اللغة العربية.</li><li>إعداد مواد تعليمية تناسب مختلف المستويات اللغوية.</li><li>دورة إعداد معلمي اللغة العربية للناطقين بغيرها (2023م).</li></ul>'
      },
      en: {
        k: 'Specialized language teaching',
        t: 'Arabic for Non-Native Speakers',
        html: '<ul><li>Delivered specialized programs for new Arabic learners.</li><li>Used modern, interactive Arabic teaching strategies.</li><li>Prepared educational materials for different proficiency levels.</li><li>Completed Arabic Teacher Preparation for Non-Native Speakers (2023).</li></ul>'
      }
    },
    {
      icon: '☎️',
      ar: {
        k: 'شكرًا لوقتك',
        t: 'تواصل معي',
        html: '<p class="tour-closing">يسعدني مناقشة فرص العمل والتعاون في التعليم والقيادة والتدريب وتطوير المحتوى.</p><div class="tour-contact-details"><span>الرياض، المملكة العربية السعودية</span><span dir="ltr">0559461920</span><span dir="ltr">samysuliman15@gmail.com</span></div>'
      },
      en: {
        k: 'Thank you for your time',
        t: 'Contact Me',
        html: '<p class="tour-closing">I welcome opportunities in education, leadership, training, and educational content development.</p><div class="tour-contact-details"><span>Riyadh, Saudi Arabia</span><span>0559461920</span><span>samysuliman15@gmail.com</span></div>'
      }
    }
  ];

  function isEnglish() {
    return document.body.classList.contains('english');
  }

  function render() {
    const lang = isEnglish() ? 'en' : 'ar';
    const current = steps[step][lang];

    kicker.textContent = current.k;
    title.innerHTML = `<span class="tour-step-icon" aria-hidden="true">${steps[step].icon}</span><span>${current.t}</span>`;

    body.classList.remove('tour-card-enter');
    void body.offsetWidth;
    body.innerHTML = current.html;
    body.classList.add('tour-card-enter');

    counter.textContent = lang === 'en'
      ? `${step + 1} / ${steps.length}`
      : `${step + 1} / ${steps.length}`;
    time.textContent = lang === 'en' ? 'About 2 minutes' : 'نحو دقيقتين';
    progress.style.width = `${((step + 1) / steps.length) * 100}%`;

    prev.disabled = step === 0;
    prev.setAttribute('aria-disabled', String(step === 0));
    prev.textContent = lang === 'en' ? 'Previous' : 'السابق';

    next.textContent = step === steps.length - 1
      ? (lang === 'en' ? 'Finish' : 'إنهاء')
      : (lang === 'en' ? 'Next' : 'التالي');

    skip.textContent = lang === 'en' ? 'Close tour' : 'إغلاق الجولة';
    close.setAttribute('aria-label', lang === 'en' ? 'Close tour' : 'إغلاق الجولة');

    nav.hidden = false;
    if (finalActions) finalActions.hidden = true;

    const publicationLink = body.querySelector('.tour-publications-link');
    if (publicationLink) publicationLink.addEventListener('click', closeTour);
  }

  function openTour() {
    lastFocus = document.activeElement;
    step = 0;
    render();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('tour-open');
    close.focus();
  }

  function closeTour() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (!explore || !explore.classList.contains('open')) document.body.classList.remove('tour-open');
    if (lastFocus) lastFocus.focus();
  }

  function openExplore() {
    closeTour();
    if (!explore) return;
    explore.classList.add('open');
    explore.setAttribute('aria-hidden', 'false');
    document.body.classList.add('tour-open');
    if (exploreClose) exploreClose.focus();
  }

  function closeExplore() {
    if (!explore) return;
    explore.classList.remove('open');
    explore.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('tour-open');
  }

  document.querySelectorAll('[data-open-tour]').forEach(button => button.addEventListener('click', openTour));
  document.querySelectorAll('[data-open-explore]').forEach(button => button.addEventListener('click', openExplore));

  close.addEventListener('click', closeTour);
  skip.addEventListener('click', closeTour);
  prev.addEventListener('click', () => {
    if (step > 0) {
      step -= 1;
      render();
    }
  });
  next.addEventListener('click', () => {
    if (step < steps.length - 1) {
      step += 1;
      render();
    } else {
      closeTour();
    }
  });

  if (exploreClose) exploreClose.addEventListener('click', closeExplore);
  modal.addEventListener('click', event => {
    if (event.target === modal) closeTour();
  });
  if (explore) {
    explore.addEventListener('click', event => {
      if (event.target === explore) closeExplore();
    });
    explore.querySelectorAll('a').forEach(link => link.addEventListener('click', closeExplore));
  }

  document.addEventListener('keydown', event => {
    if (!modal.classList.contains('open')) {
      if (event.key === 'Escape' && explore && explore.classList.contains('open')) closeExplore();
      return;
    }
    if (event.key === 'Escape') closeTour();
    if (event.key === 'ArrowLeft') {
      if (isEnglish()) next.click();
      else prev.click();
    }
    if (event.key === 'ArrowRight') {
      if (isEnglish()) prev.click();
      else next.click();
    }
  });

  const observer = new MutationObserver(() => {
    if (modal.classList.contains('open')) render();
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
