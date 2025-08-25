/* script.js — Interações aprimoradas (acessibilidade, lightbox, preferências) */
(function(){
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PREF_FONT = 'rc_font_multiplier';
  const PREF_CONTRAST = 'rc_alto_contraste';
  function restorePreferences(){
    const fm = parseFloat(localStorage.getItem(PREF_FONT)) || 1;
    document.documentElement.style.fontSize = (16 * fm) + 'px';
    const alto = localStorage.getItem(PREF_CONTRAST) === 'true';
    if(alto) document.body.classList.add('alto-contraste');
  }
  document.addEventListener('DOMContentLoaded', function(){
    restorePreferences();
    const botao = $('#botao-acessibilidade');
    const opcoes = $('#opcoes-acessibilidade');
    const aumenta = $('#aumentar-fonte');
    const diminui = $('#diminuir-fonte');
    const contraste = $('#alterna-contraste');
    let fontMultiplier = parseFloat(localStorage.getItem(PREF_FONT)) || 1;
    botao.addEventListener('click', function(){
      const expanded = botao.getAttribute('aria-expanded') === 'true';
      botao.setAttribute('aria-expanded', String(!expanded));
      opcoes.classList.toggle('show');
      if(!expanded){ opcoes.querySelector('button')?.focus(); }
    });
    aumenta.addEventListener('click', function(){
      fontMultiplier = Math.min(1.6, fontMultiplier + 0.1);
      document.documentElement.style.fontSize = (16 * fontMultiplier) + 'px';
      localStorage.setItem(PREF_FONT, fontMultiplier.toString());
    });
    diminui.addEventListener('click', function(){
      fontMultiplier = Math.max(0.8, fontMultiplier - 0.1);
      document.documentElement.style.fontSize = (16 * fontMultiplier) + 'px';
      localStorage.setItem(PREF_FONT, fontMultiplier.toString());
    });
    contraste.addEventListener('click', function(){
      const isOn = document.body.classList.toggle('alto-contraste');
      localStorage.setItem(PREF_CONTRAST, String(isOn));
    });
    document.addEventListener('click', function(e){
      if(!opcoes.contains(e.target) && e.target !== botao){
        opcoes.classList.remove('show');
        botao.setAttribute('aria-expanded','false');
      }
    });
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', function(e){
        const href = a.getAttribute('href');
        if(href.length > 1){
          const target = document.querySelector(href);
          if(target){
            e.preventDefault();
            target.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block:'start'});
            target.focus({preventScroll:true});
          }
        }
      });
    });
    const galleryItems = $$('.gallery-item');
    if(galleryItems.length){
      galleryItems.forEach(item=>{
        item.addEventListener('click', openLightbox);
        item.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox.call(this,e); } });
      });
    }
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', function(e){
        showToast('Enviando mensagem — aguarde (uma nova aba pode abrir).');
      });
    });
  });
  function showToast(message, timeout = 3500){
    let toast = document.createElement('div');
    toast.className = 'rc-toast';
    toast.role = 'status';
    toast.style.cssText = 'position:fixed;right:1rem;bottom:1rem;background:rgba(15,23,42,0.92);color:#fff;padding:.75rem 1rem;border-radius:8px;z-index:1600;box-shadow:0 8px 30px rgba(2,6,23,0.4);font-weight:600;';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(()=>{ toast.style.opacity='0'; toast.style.transform='translateY(8px)'; }, timeout - 400);
    setTimeout(()=>{ toast.remove(); }, timeout);
  }
  let currentLightbox = null;
  function openLightbox(e){
    const anchor = this;
    const img = anchor.querySelector('img');
    const src = anchor.getAttribute('href') || img.src;
    const alt = img.alt || '';
    const backdrop = document.createElement('div');
    backdrop.className = 'lightbox-backdrop';
    backdrop.tabIndex = -1;
    backdrop.setAttribute('role','dialog');
    backdrop.setAttribute('aria-modal','true');
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML = `
      <button class="close" aria-label="Fechar">✕</button>
      <img src="${src}" alt="${alt}">
      <div class="meta"><strong>${alt}</strong></div>
    `;
    backdrop.appendChild(box);
    document.body.appendChild(backdrop);
    currentLightbox = backdrop;
    const closeBtn = box.querySelector('.close');
    closeBtn.focus();
    function close(){
      backdrop.remove();
      currentLightbox = null;
    }
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', function(ev){ if(ev.target === backdrop) close(); });
    document.addEventListener('keydown', function onKey(e){ if(e.key === 'Escape' && currentLightbox){ close(); document.removeEventListener('keydown', onKey); } });
  }
})();