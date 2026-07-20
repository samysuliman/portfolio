(function(){
  'use strict';
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('./service-worker.js').catch(function(err){
        console.warn('Service worker registration failed:', err);
      });
    });
  }

  var deferredPrompt = null;
  var installButton = null;

  function isStandalone(){
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function isEnglish(){
    return document.documentElement.lang === 'en' || document.body.classList.contains('english');
  }

  function ensureButton(){
    if (installButton || isStandalone()) return;
    installButton = document.createElement('button');
    installButton.type = 'button';
    installButton.className = 'pwa-install-button';
    installButton.setAttribute('aria-label','تثبيت الموقع كتطبيق');
    installButton.innerHTML = '<span aria-hidden="true">⬇</span><b>تثبيت التطبيق</b>';
    installButton.addEventListener('click', async function(){
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch(e) {}
      deferredPrompt = null;
      installButton.remove();
      installButton = null;
    });
    document.body.appendChild(installButton);
  }

  window.addEventListener('beforeinstallprompt', function(event){
    event.preventDefault();
    deferredPrompt = event;
    ensureButton();
  });

  window.addEventListener('appinstalled', function(){
    deferredPrompt = null;
    if (installButton) installButton.remove();
    installButton = null;
  });

  var observer = new MutationObserver(function(){
    if (!installButton) return;
    installButton.querySelector('b').textContent = isEnglish() ? 'Install app' : 'تثبيت التطبيق';
    installButton.setAttribute('aria-label',isEnglish() ? 'Install website as an app' : 'تثبيت الموقع كتطبيق');
  });
  window.addEventListener('DOMContentLoaded', function(){
    observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  });
})();
