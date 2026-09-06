(function(){
"use strict";
var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
var $  = function(s,c){return (c||document).querySelector(s)};
var $$ = function(s,c){return [].slice.call((c||document).querySelectorAll(s))};

/* ---------- toast ---------- */
var toastEl = $('#toast'), toastT;
function toast(msg){
  toastEl.textContent = msg; toastEl.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(function(){toastEl.classList.remove('on')}, 3200);
}
document.addEventListener('click', function(e){
  var t = e.target.closest('[data-toast]');
  if(t){ e.preventDefault(); toast(t.getAttribute('data-toast')); }
});

/* ---------- loader (000 → 100 counter) ---------- */
var loader = $('#loader');
if(loader) window.addEventListener('load', function(){
  if(RM){ loader.classList.add('done'); return; }
  var n = 0, cnt = $('#cnt');
  var iv = setInterval(function(){
    n += 2 + Math.ceil(Math.random()*6);
    if(n >= 100){ n = 100; clearInterval(iv); setTimeout(function(){ loader.classList.add('done'); }, 300); }
    cnt.textContent = ('00' + n).slice(-3);
  }, 40);
});

/* ---------- landing: through the gate you start at the hero, unless a section link (#about etc.) brought you here ---------- */
if('scrollRestoration' in history) history.scrollRestoration = 'manual';
function landing(){
  var el = location.hash.length > 1 && document.querySelector(location.hash);
  scrollTo({top: el ? el.offsetTop : 0, behavior:'instant'});
}

/* ---------- gate (index only; sub-pages have no gate yet) ---------- */
var gate = $('#gate');
if(gate){
function openGate(){
  if(RM){ gate.style.display='none'; document.body.style.overflow=''; $('.stick').classList.add('open'); landing(); return; }
  $('#stamp').classList.add('hit');
  setTimeout(function(){ gate.classList.add('open'); }, 650);
  setTimeout(function(){ $('.stick').classList.add('open'); }, 1000);
  setTimeout(function(){ gate.style.display='none'; }, 1700);
  document.body.style.overflow='';
  landing();
}
document.body.style.overflow='hidden';
if(new URLSearchParams(location.search).has('preview')){
  gate.style.display='none'; loader.style.display='none'; document.body.style.overflow='';
  document.documentElement.style.scrollBehavior='auto';
  setTimeout(function(){ $('.stick').classList.add('open'); }, 250);
  var at = new URLSearchParams(location.search).get('at');
  setTimeout(function(){ var el = at && document.getElementById(at); if(el){ scrollTo(0, el.offsetTop); } else { landing(); } }, 400);
}
$('#gateform').addEventListener('submit', function(e){
  e.preventDefault();
  var err = $('#gateerr'), form = e.target;
  var age = parseInt($('#g-age').value, 10);
  var filled = $$('input,select', form).every(function(el){ return el.value.trim() !== ''; });
  if(!filled){ err.textContent = 'fill everything in — thirty seconds, promise.'; form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); return; }
  if(!(age >= 16)){ err.textContent = 'you need to be 16+ to make an account. that’s the line, no exceptions.'; form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); return; }
  err.textContent = '';
  openGate();
});
$('#skiplink').addEventListener('click', function(e){ e.preventDefault(); openGate(); });
$('#loginlink').addEventListener('click', function(e){ e.preventDefault(); toast('login UI ships with the auth build — signup is the show for now.'); });
}

/* background films: only the one on screen plays; the others stay paused and never download */
var bgvids = $$('#herovid, video.bgvid');
function inView(v){ var r = v.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight; }
function playVid(v){ v.muted = true; if(v.preload === 'none') v.preload = 'auto'; var p = v.play(); if(p && p.catch) p.catch(function(){}); }
if(RM){ bgvids.forEach(function(v){ v.autoplay = false; v.pause(); }); }
else {
  var vio = new IntersectionObserver(function(en){
    en.forEach(function(e){ if(e.isIntersecting){ playVid(e.target); } else { e.target.pause(); } });
  }, {rootMargin:'30% 0px'});
  bgvids.forEach(function(v){ vio.observe(v); });
}

/* ---------- gallery: scroll flies the camera through the photo wall ---------- */
var gal = $('#gallery'), galStick = $('.gal-stick');
if(gal && !RM){
  var galCaps = $$('.gal-cap'), lastGp = -1, galTick = false;
  function galScrub(){
    galTick = false;
    var r = gal.getBoundingClientRect();
    if(r.bottom < 0 || r.top > innerHeight) return;
    var total = r.height - innerHeight;
    var p = Math.min(1, Math.max(0, -r.top / (total || 1)));
    if(Math.abs(p - lastGp) < .001) return;
    lastGp = p;
    galStick.style.setProperty('--gp', p.toFixed(4));
    var idx = Math.min(galCaps.length - 1, Math.floor(p * galCaps.length));
    galCaps.forEach(function(c, i){ c.classList.toggle('on', i === idx); });
  }
  addEventListener('scroll', function(){ if(!galTick){ galTick = true; requestAnimationFrame(galScrub); } }, {passive:true});
  galScrub();
}

/* iOS: videos won't start (hero shows a play glyph) until nudged — retry on load and on first gesture */
function primeVideos(){
  if(RM) return;
  bgvids.forEach(function(v){ if(inView(v)) playVid(v); });
}
addEventListener('touchstart', primeVideos, {once:true, passive:true});
addEventListener('click', primeVideos, {once:true});
setTimeout(primeVideos, 600);

/* ---------- reveals ---------- */
var io = new IntersectionObserver(function(entries){
  entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
},{threshold:.12});
$$('.rv').forEach(function(el, i){ el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });

/* ---------- drawer ---------- */
var drawer = $('#drawer'), menubtn = $('#menubtn');
function setDrawer(on){
  drawer.classList.toggle('on', on);
  drawer.setAttribute('aria-hidden', String(!on));
  menubtn.setAttribute('aria-expanded', String(on));
}
menubtn.addEventListener('click', function(){ setDrawer(true); });
$('#drawerx').addEventListener('click', function(){ setDrawer(false); });
$('#drawershade').addEventListener('click', function(){ setDrawer(false); });
$$('#drawer nav a').forEach(function(a){ a.addEventListener('click', function(){ setDrawer(false); }); });
addEventListener('keydown', function(e){ if(e.key === 'Escape') setDrawer(false); });
$('#profilebtn').addEventListener('click', function(){ toast('profile page ships with the auth build.'); });

/* ---------- rip the stub ---------- */
var live = $('#liveticket');
if(live){
  var stub = $('.stub', live);
  function rip(){
    if(live.classList.contains('ripped')) return;
    live.classList.add('ripped');
    toast('ticket claimed (demo) — checkout wires up with the payments build.');
    setTimeout(function(){ live.classList.remove('ripped'); }, 2600);
  }
  stub.addEventListener('click', rip);
  stub.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); rip(); } });
}

/* ---------- demo forms ---------- */
$$('form.formwrap').forEach(function(f){
  f.addEventListener('submit', function(e){
    e.preventDefault();
    toast(f.getAttribute('data-toast') || 'sent (demo).');
    f.reset();
  });
});

/* ---------- nav hover text scramble ---------- */
if(matchMedia('(hover:hover)').matches && !RM){
  $$('#nav .links a, #drawer nav a, .hero-cta, .sendbtn').forEach(function(el){
    var target = el.matches('#drawer nav a') ? el.lastChild : el.firstChild;
    if(!target || target.nodeType !== 3) return;
    var orig = target.textContent, chars = '▓▒░/\\<>#';
    el.addEventListener('mouseenter', function(){
      var it = 0, max = 9;
      var iv = setInterval(function(){
        it++;
        target.textContent = orig.split('').map(function(c, idx){
          return (c === ' ' || idx < orig.length*it/max) ? c : chars[Math.floor(Math.random()*chars.length)];
        }).join('');
        if(it >= max){ target.textContent = orig; clearInterval(iv); }
      }, 30);
    });
  });
}

/* ---------- custom cursor ---------- */
if(matchMedia('(hover:hover)').matches && !RM){
  var cur = $('#cur'), ring = $('#curring'), label = $('#curlabel');
  var mx2 = innerWidth/2, my2 = innerHeight/2, rx = mx2, ry = my2;
  addEventListener('mousemove', function(e){
    mx2 = e.clientX; my2 = e.clientY;
    cur.style.transform = 'translate(' + (mx2-7) + 'px,' + (my2-7) + 'px)';
  });
  (function loop(){
    rx += (mx2 - rx) * .16; ry += (my2 - ry) * .16;
    ring.style.transform = 'translate(' + (rx - ring.offsetWidth/2) + 'px,' + (ry - ring.offsetHeight/2) + 'px)';
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseover', function(e){
    var m = e.target.closest('[data-cursor]');
    var i = e.target.closest('a,button,summary,.stub,input,select,textarea');
    if(m){ label.textContent = m.getAttribute('data-cursor'); ring.classList.add('big'); cur.classList.add('tag'); }
    else if(i){ ring.classList.add('big'); cur.classList.remove('tag'); }
    else { ring.classList.remove('big'); cur.classList.remove('tag'); }
  });
}
})();
