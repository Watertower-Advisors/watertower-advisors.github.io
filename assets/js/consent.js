(function(){
  var CONSENT_KEY = 'wt_ga_consent';
  var GA_ID = 'G-FB92R71P1W';

  function setConsent(value){
    try{ localStorage.setItem(CONSENT_KEY, value); }catch(e){}
    if(value === 'granted') initGtag();
    hideBanner();
  }

  function getConsent(){
    try{ return localStorage.getItem(CONSENT_KEY); }catch(e){ return null; }
  }

  function injectGtag(){
    if(window.__wt_ga_injected) return;
    window.__wt_ga_injected = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);

    var i = document.createElement('script');
    i.innerHTML = "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config','" + GA_ID + "');";
    document.head.appendChild(i);
  }

  function initGtag(){ injectGtag(); }

  function createBanner(){
    if(document.getElementById('wt-consent')) return;
    var div = document.createElement('div');
    div.id = 'wt-consent';
    div.setAttribute('role','dialog');
    div.setAttribute('aria-label','Cookie consent');
    var inner = document.createElement('div');
    inner.style.maxWidth = '980px';
    inner.style.margin = '0 auto';
    inner.style.display = 'flex';
    inner.style.justifyContent = 'space-between';
    inner.style.alignItems = 'center';
    inner.style.gap = '12px';

    var msg = document.createElement('div');
    msg.textContent = 'We use cookies to analyze site usage. You can accept or decline.';

    var actions = document.createElement('div');
    var btnAccept = document.createElement('button');
    btnAccept.id = 'wt-accept';
    btnAccept.textContent = 'Accept';
    btnAccept.style.marginRight = '8px';
    var btnDecline = document.createElement('button');
    btnDecline.id = 'wt-decline';
    btnDecline.textContent = 'Decline';

    actions.appendChild(btnAccept);
    actions.appendChild(btnDecline);

    inner.appendChild(msg);
    inner.appendChild(actions);
    div.appendChild(inner);

    Object.assign(div.style,{
      position: 'fixed',
      left: '16px',
      right: '16px',
      bottom: '16px',
      background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.08)',
      padding: '12px',
      zIndex: 2147483647,
      boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
      borderRadius: '6px'
    });

    document.body.appendChild(div);

    btnAccept.addEventListener('click', function(){ setConsent('granted'); });
    btnDecline.addEventListener('click', function(){ setConsent('denied'); });

    // focus accept for keyboard users
    try{ btnAccept.focus(); }catch(e){}
  }

  function hideBanner(){
    var el = document.getElementById('wt-consent');
    if(el) el.parentNode.removeChild(el);
  }

  document.addEventListener('DOMContentLoaded', function(){
    var c = getConsent();
    if(c === 'granted'){
      initGtag();
    } else if(c === 'denied'){
      // do nothing
    } else {
      createBanner();
    }
  });
})();
