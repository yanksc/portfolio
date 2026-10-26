(function(){
  'use strict';
  var root=document.documentElement, key='portfolio-theme';
  // Set the palette before the page paints; dark remains the default.
  try{if(localStorage.getItem(key)==='light')root.dataset.theme='light';}catch(e){}
  document.addEventListener('DOMContentLoaded',function(){
    var button=document.createElement('button');
    button.type='button';
    button.className='theme-toggle';
    button.setAttribute('aria-label','Light background');
    button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg><span></span>';
    function update(){
      var light=root.dataset.theme==='light';
      button.setAttribute('aria-pressed',String(light));
      button.querySelector('span').textContent=light?'Dark background':'Light background';
      button.title=light?'Switch to dark background':'Switch to light background';
    }
    function apply(theme){
      root.dataset.theme=theme;
      update();
      document.dispatchEvent(new Event('portfolio-theme-change'));
    }
    button.addEventListener('click',function(){
      var theme=root.dataset.theme==='light'?'dark':'light';
      apply(theme);
      try{localStorage.setItem(key,theme);}catch(e){}
    });
    window.addEventListener('storage',function(event){
      if(event.key===key||event.key===null)apply(event.newValue==='light'?'light':'dark');
    });
    update();
    document.body.insertBefore(button,document.body.firstChild);
  });
})();
