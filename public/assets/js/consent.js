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
    msg.innerHTML = 'Watertower Advisors use cookies to enhance your experience on our website and help us show you more relevant content and help our website run effectively. Some cookies are necessary and are always active. Read more in our <a href="legal.html#cookies" style="color:#E85C3A;text-decoration:underline">Cookie Policy</a>.';

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
      background: '#171717',
      border: '1px solid #2a2a2a',
      color: '#ffffff',
      padding: '16px 20px',
      zIndex: 2147483647,
      boxShadow: '0 6px 32px rgba(0,0,0,0.5)',
      borderRadius: '10px',
      fontSize: '14px'
    });

    Object.assign(msg.style,{
      color: '#BABABA',
      lineHeight: '1.5'
    });

    Object.assign(btnAccept.style,{
      background: '#E85C3A',
      color: '#ffffff',
      border: 'none',
      padding: '9px 20px',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '14px',
      whiteSpace: 'nowrap'
    });

    Object.assign(btnDecline.style,{
      background: 'transparent',
      color: '#8B8B8B',
      border: '1px solid #3a3a3a',
      padding: '9px 20px',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '14px',
      whiteSpace: 'nowrap'
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
