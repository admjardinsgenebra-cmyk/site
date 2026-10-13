/* ==========================================================================
   Jardins Genebra — interações
   1. Imagens/placeholder  2. Menu  3. Header + progresso + voltar ao topo
   4. Scrollspy  5. Revelação ao rolar  6. Parallax  7. Contador
   8. Formulário
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) root.setAttribute('data-anim', '');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* 1. IMAGENS: esconde <img> cujo arquivo ainda não existe em /assets */
  $$('.media > img').forEach(function (img) {
    var hide = function () { img.hidden = true; };
    if (img.complete && img.naturalWidth === 0) hide();
    else img.addEventListener('error', hide, { once: true });
  });
  var year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* 2. MENU --------------------------------------------------------------- */
  var header = $('.site-header');
  var toggle = $('.menu-toggle');
  var nav = $('#menu-principal');
  var backdrop = $('.nav-backdrop');
  var menuOpen = false;

  function setMenu(open, returnFocus) {
    menuOpen = open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    header.classList.remove('is-hidden');
    if (open) setTimeout(function () { $('a', nav).focus(); }, 80);
    else if (returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', function () { setMenu(!menuOpen); });
  backdrop.addEventListener('click', function () { setMenu(false, true); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  document.addEventListener('keydown', function (e) {
    if (!menuOpen) return;
    if (e.key === 'Escape') { setMenu(false, true); return; }
    if (e.key === 'Tab') { // mantém o foco dentro do menu aberto
      var items = [toggle].concat($$('a', nav));
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* 3. HEADER (sólido/oculto) + BARRA DE PROGRESSO + VOLTAR AO TOPO -------- */
  var progress = $('.scroll-progress');
  var toTop = $('.to-top');
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    header.classList.toggle('is-scrolled', y > 40);
    if (!menuOpen) header.classList.toggle('is-hidden', y > 500 && y > lastY + 2);
    if (y < lastY - 2 || y < 500) header.classList.remove('is-hidden');
    lastY = y;

    progress.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
    toTop.classList.toggle('is-visible', y > window.innerHeight * 0.9);

    parallax();
    cardsOnScroll();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);

  /* 4. SCROLLSPY: destaca no menu a seção visível ------------------------- */
  var navLinks = $$('a[href^="#"]', nav).filter(function (a) { return a.getAttribute('href').length > 1; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          var active = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) {
      var target = $(a.getAttribute('href'));
      if (target) spy.observe(target);
    });
  }

  /* 5. REVELAÇÃO AO ROLAR (com cascata nos grupos data-stagger) ----------- */
  var STAGGER = 110;
  function reveal(el) { el.setAttribute('data-in', ''); }

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        if (el.hasAttribute('data-stagger')) {
          $$(':scope > [data-reveal]', el).forEach(function (child, i) {
            setTimeout(function () { reveal(child); }, i * STAGGER);
          });
        } else {
          reveal(el);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    $$('[data-stagger]').forEach(function (g) { io.observe(g); });
    $$('[data-reveal]').forEach(function (el) {
      if (!el.parentElement.hasAttribute('data-stagger')) io.observe(el);
    });
  } else {
    $$('[data-reveal]').forEach(reveal);
  }

  /* 5b. CARDS E FOTOS DE LAZER NO CELULAR/TABLET ------------------------------------------
     Sem hover no toque: cada card fica verde (e cada foto do grid fica colorida) quando o centro dele passa da
     linha de 60% da tela ao rolar para baixo, e volta ao cinza quando a
     pessoa sobe e ele desce abaixo dessa linha. No desktop vale o hover. */
  var touchLayout = window.matchMedia('(max-width: 992px), (hover: none)');
  // [seletor, classe] — cards ficam verdes; fotos do grid de lazer ganham cor
  var scrollStates = [['.cards .card', 'is-active'], ['.experiences .tile', 'is-color']];
  function cardsOnScroll() {
    var line = window.innerHeight * 0.6;
    scrollStates.forEach(function (pair) {
      $$(pair[0]).forEach(function (el) {
        if (!touchLayout.matches) { el.classList.remove(pair[1]); return; }
        var r = el.getBoundingClientRect();
        el.classList.toggle(pair[1], r.top + r.height / 2 < line);
      });
    });
  }

  /* 6. PARALLAX nos fundos (.bg-parallax[data-speed]) --------------------- */
  var layers = $$('.bg-parallax');
  function parallax() {
    if (reduceMotion) return;
    var vh = window.innerHeight;
    layers.forEach(function (layer) {
      var section = layer.parentElement;
      var r = section.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var speed = parseFloat(layer.getAttribute('data-speed')) || 0.2;
      // deslocamento proporcional à distância do centro da seção ao centro da tela,
      // limitado ao "sobrando" da camada (inset: -9%) para nunca mostrar borda
      var limit = section.offsetHeight * 0.09;
      var offset = ((r.top + r.height / 2) - vh / 2) * -speed;
      offset = Math.max(-limit, Math.min(limit, offset));
      layer.style.setProperty('--py', offset.toFixed(1) + 'px');
    });
  }

  /* 7. CONTADOR (+506 mil m²) -------------------------------------------- */
  var counters = $$('[data-count]');
  function runCounter(el) {
    var end = parseFloat(el.getAttribute('data-count'));
    if (reduceMotion) { el.textContent = end; return; }
    var dur = 1800, start = null;
    (function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased);
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { co.unobserve(entry.target); runCounter(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { el.textContent = '0'; co.observe(el); });
  }

  /* 7b. BOTÕES: a "tinta" nasce no ponto de entrada e recolhe no de saída -- */
  function setOrigin(btn, e) {
    var r = btn.getBoundingClientRect();
    btn.style.setProperty('--x', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    btn.style.setProperty('--y', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  }
  $$('.btn').forEach(function (btn) {
    btn.addEventListener('pointerenter', function (e) { setOrigin(btn, e); });
    btn.addEventListener('pointerleave', function (e) { setOrigin(btn, e); });
  });

  /* 8. FORMULÁRIO (envio pelo WhatsApp) ----------------------------------- */
  var WHATSAPP_URL = 'https://wa.me/5561999270059';
  var form = $('.form-card');
  var phone = $('#telefone');
  var status = $('.form-status', form);
  var submitBtn = $('button[type="submit"]', form);

  var messages = {
    nome: { valueMissing: 'Informe seu nome.', tooShort: 'Digite seu nome completo.' },
    email: { valueMissing: 'Informe seu e-mail.', typeMismatch: 'Digite um e-mail válido.' },
    telefone: { valueMissing: 'Informe seu telefone.', patternMismatch: 'Digite um telefone válido com DDD.' }
  };

  // máscara (00) 00000-0000 / (00) 0000-0000
  phone.addEventListener('input', function () {
    var d = phone.value.replace(/\D/g, '').slice(0, 11);
    var out = d;
    if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 6) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    phone.value = out;
  });

  function validateField(input) {
    var field = input.closest('.field');
    var error = $('.field__error', field);
    if (input.id === 'telefone') {
      var digits = input.value.replace(/\D/g, '');
      input.setCustomValidity(digits.length && digits.length < 10 ? 'invalid' : '');
    }
    var v = input.validity, msg = '';
    if (!v.valid) {
      var m = messages[input.name] || {};
      msg = (v.valueMissing && m.valueMissing) || (v.typeMismatch && m.typeMismatch) ||
            (v.tooShort && m.tooShort) || (v.customError && m.patternMismatch) || 'Verifique este campo.';
    }
    field.classList.toggle('is-invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    error.textContent = msg;
    return !msg;
  }

  var inputs = $$('.field input', form);
  inputs.forEach(function (input) {
    input.addEventListener('blur', function () { if (input.value) validateField(input); });
    input.addEventListener('input', function () {
      if (input.closest('.field').classList.contains('is-invalid')) validateField(input);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('#empresa').value) return; // honeypot preenchido = robô

    var firstInvalid = null;
    inputs.forEach(function (input) {
      if (!validateField(input) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) { firstInvalid.focus(); status.textContent = ''; return; }

    // Envia os dados para o WhatsApp oficial
    var msg = 'Olá, vim pelo site do Condomínio Jardins Genebra!\n\n' +
      'Nome: ' + $('#nome').value.trim() + '\n' +
      'E-mail: ' + $('#email').value.trim() + '\n' +
      'Telefone: ' + $('#telefone').value.trim();
    var waUrl = WHATSAPP_URL + '?text=' + encodeURIComponent(msg);
    $('[data-wa-link]', form).href = waUrl;   // botão de reserva caso o navegador bloqueie a nova aba
    window.open(waUrl, '_blank', 'noopener'); // se o navegador bloquear, o botão "Abrir WhatsApp" resolve
    status.textContent = '';
    onSuccess();
  });

  function onSuccess() {
    form.reset();
    form.classList.add('is-sent');
    $('.form-success', form).focus();
  }

  $('[data-form-reset]', form).addEventListener('click', function () {
    form.classList.remove('is-sent');
    inputs.forEach(function (i) { i.closest('.field').classList.remove('is-invalid'); });
    $('#nome').focus();
  });

  onScroll();
})();
