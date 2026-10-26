(function(){
  var links=Array.from(document.querySelectorAll('.post-agenda a[href^="#"]'));
  var sections=links.map(function(link){return document.querySelector(link.getAttribute('href'));});
  if(!links.length)return;
  var pending=false;
  function update(){
    pending=false;
    var active=0;
    sections.forEach(function(section,i){if(section&&section.getBoundingClientRect().top<=160)active=i;});
    if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4)active=links.length-1;
    links.forEach(function(link,i){if(i===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  }
  window.addEventListener('scroll',function(){if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});
  window.addEventListener('resize',update);
  update();
})();
