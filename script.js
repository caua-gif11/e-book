(function () {
    'use strict';
  
    const RECEITAS = [
      {
        nome: 'Bowl Energético de Aveia', emoji: '🥣', tempo: '15 min', rendimento: 2,
        tags: ['Sem glúten', 'Vegano', 'Rico em fibras'],
        ingredientes: [
          { nome: 'Aveia em flocos', qtd: 120, un: 'g' },
          { nome: 'Leite vegetal', qtd: 250, un: 'ml' },
          { nome: 'Banana', qtd: 1, un: 'un' },
          { nome: 'Pasta de amendoim', qtd: 30, un: 'g' },
          { nome: 'Mel ou xarope de agave', qtd: 15, un: 'ml' },
          { nome: 'Mirtilos frescos', qtd: 60, un: 'g' },
          { nome: 'Sementes de chia', qtd: 10, un: 'g' }
        ],
        passos: [
          'Em uma panela, leve o leite vegetal ao fogo médio até começar a borbulhar.',
          'Adicione a aveia e cozinhe por 5 minutos, mexendo sempre, até ficar cremosa.',
          'Amasse a banana e misture junto com a pasta de amendoim e o mel.',
          'Sirva em tigelas e finalize com mirtilos e sementes de chia.'
        ]
      },
      {
        nome: 'Curry de Grão-de-Bico', emoji: '🍲', tempo: '30 min', rendimento: 4,
        tags: ['Vegano', 'Alto em proteínas', 'Anti-inflamatório'],
        ingredientes: [
          { nome: 'Grão-de-bico cozido', qtd: 400, un: 'g' },
          { nome: 'Leite de coco', qtd: 400, un: 'ml' },
          { nome: 'Cebola', qtd: 1, un: 'un' },
          { nome: 'Alho', qtd: 2, un: 'dentes' },
          { nome: 'Gengibre ralado', qtd: 15, un: 'g' },
          { nome: 'Curry em pó', qtd: 10, un: 'g' },
          { nome: 'Tomate picado', qtd: 200, un: 'g' },
          { nome: 'Espinafre', qtd: 100, un: 'g' }
        ],
        passos: [
          'Refogue a cebola picada no azeite até dourar. Acrescente alho e gengibre.',
          'Adicione o curry em pó e mexa por 1 minuto para liberar os aromas.',
          'Junte o tomate e o grão-de-bico, e cozinhe por 5 minutos.',
          'Despeje o leite de coco e cozinhe em fogo baixo por 10 minutos.',
          'Finalize com o espinafre até murchar. Sirva com arroz integral.'
        ]
      },
      {
        nome: 'Brownie Funcional de Feijão', emoji: '🍫', tempo: '25 min', rendimento: 9,
        tags: ['Sem glúten', 'Sem lactose', 'Rico em proteínas'],
        ingredientes: [
          { nome: 'Feijão preto cozido', qtd: 300, un: 'g' },
          { nome: 'Cacau em pó', qtd: 40, un: 'g' },
          { nome: 'Ovos', qtd: 2, un: 'un' },
          { nome: 'Óleo de coco', qtd: 40, un: 'ml' },
          { nome: 'Açúcar de coco', qtd: 80, un: 'g' },
          { nome: 'Essência de baunilha', qtd: 5, un: 'ml' },
          { nome: 'Fermento em pó', qtd: 5, un: 'g' }
        ],
        passos: [
          'Bata no liquidificador o feijão escorrido, os ovos, o óleo e a baunilha até ficar liso.',
          'Adicione o cacau, o açúcar e o fermento, e bata até incorporar.',
          'Despeje em uma forma untada e asse a 180°C por 20 minutos.',
          'Espere amornar antes de cortar. O centro deve ficar levemente úmido.'
        ]
      }
    ];
  
    const $ = (sel, ctx) => (ctx || document).querySelector(sel);
    const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  
    function formatarQtd(qtd) {
      return Number.isInteger(qtd) ? String(qtd) : qtd.toFixed(1).replace('.', ',');
    }
  
    function mostrarToast(msg) {
      const toast = $('#toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('is-visible');
      clearTimeout(toast._t);
      toast._t = setTimeout(() => toast.classList.remove('is-visible'), 2600);
    }
  
    const nav = $('#nav');
    function onScrollNav() { nav.classList.toggle('is-scrolled', window.scrollY > 10); }
    window.addEventListener('scroll', onScrollNav, { passive: true });
    onScrollNav();
  
    const navToggle = $('#navToggle');
    const navLinks = $('.nav__links');
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    $$('.nav__links a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-open');
    }));
  
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(el => revealObserver.observe(el));
  
    const bookTilt = $('#bookTilt');
    if (bookTilt && window.matchMedia('(pointer: fine)').matches) {
      bookTilt.addEventListener('mousemove', (e) => {
        const r = bookTilt.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        bookTilt.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${y * -8}deg)`;
      });
      bookTilt.addEventListener('mouseleave', () => { bookTilt.style.transform = ''; });
    }
  
    const tabs = $$('.tab');
    const panel = $('#recipePanel');
    let receitaAtual = 0;
    let porcoes = RECEITAS[0].rendimento;
    let favoritos = new Set(JSON.parse(localStorage.getItem('sb-favoritos') || '[]'));
  
    function renderReceita(idx) {
      const r = RECEITAS[idx];
      const fator = porcoes / r.rendimento;
      const isFav = favoritos.has(r.nome);
      const ingsHTML = r.ingredientes.map((ing, i) => `
        <li>
          <label>
            <input type="checkbox" data-ing="${i}" />
            <span class="ing-nome">${ing.nome} — <strong>${formatarQtd(ing.qtd * fator)} ${ing.un}</strong></span>
          </label>
        </li>`).join('');
      const passosHTML = r.passos.map(p => `<li>${p}</li>`).join('');
      panel.innerHTML = `
        <div class="recipe__top">
          <div>
            <h3 class="recipe__title">${r.emoji} ${r.nome}</h3>
            <div class="recipe__meta">
              <span class="recipe__chip">⏱ ${r.tempo}</span>
              <span class="recipe__chip">🍽 ${porcoes} porções</span>
              ${r.tags.map(t => `<span class="recipe__chip">${t}</span>`).join('')}
            </div>
            <div class="recipe__portions">
              <label for="porcoesInput">Porções:</label>
              <input id="porcoesInput" type="number" min="1" max="12" value="${porcoes}" aria-label="Número de porções" />
            </div>
          </div>
          <button class="recipe__fav ${isFav ? 'is-fav' : ''}" data-fav aria-label="Favoritar receita" title="Favoritar">
            ${isFav ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="recipe__body">
          <div class="recipe__col">
            <h4>Ingredientes</h4>
            <ul class="recipe__ing">${ingsHTML}</ul>
            <div class="recipe__progress" aria-hidden="true"><span></span></div>
          </div>
          <div class="recipe__col">
            <h4>Modo de preparo</h4>
            <ol class="recipe__steps">${passosHTML}</ol>
          </div>
        </div>`;
      atualizarProgresso();
    }
  
    function atualizarProgresso() {
      const boxes = $$('.recipe__ing input', panel);
      const bar = $('.recipe__progress span', panel);
      const feitos = boxes.filter(b => b.checked).length;
      const pct = boxes.length ? Math.round((feitos / boxes.length) * 100) : 0;
      bar.style.width = pct + '%';
    }
  
    panel.addEventListener('change', (e) => {
      if (e.target.matches('.recipe__ing input')) {
        const label = e.target.closest('label');
        const span = $('.ing-nome', label);
        span.classList.toggle('done', e.target.checked);
        atualizarProgresso();
        if (e.target.checked) mostrarToast('Ingrediente marcado! 🎉');
      }
    });
  
    panel.addEventListener('click', (e) => {
      const favBtn = e.target.closest('[data-fav]');
      if (!favBtn) return;
      const r = RECEITAS[receitaAtual];
      if (favoritos.has(r.nome)) {
        favoritos.delete(r.nome);
        favBtn.classList.remove('is-fav');
        favBtn.textContent = '🤍';
        mostrarToast('Removido dos favoritos');
      } else {
        favoritos.add(r.nome);
        favBtn.classList.add('is-fav');
        favBtn.textContent = '❤️';
        mostrarToast('Receita favoritada! ❤️');
      }
      localStorage.setItem('sb-favoritos', JSON.stringify(Array.from(favoritos)));
    });
  
    panel.addEventListener('input', (e) => {
      if (e.target.id === 'porcoesInput') {
        const v = parseInt(e.target.value, 10);
        if (v >= 1 && v <= 12) { porcoes = v; renderReceita(receitaAtual); }
      }
    });
  
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        receitaAtual = i;
        porcoes = RECEITAS[i].rendimento;
        renderReceita(i);
      });
    });
  
    renderReceita(0);
  
    const track = $('#sliderTrack');
    const dotsWrap = $('#sliderDots');
    const total = track ? track.children.length : 0;
    let slide = 0;
  
    if (total > 0) {
      for (let i = 0; i < total; i++) {
        const d = document.createElement('button');
        d.className = 'slider__dot' + (i === 0 ? ' is-active' : '');
        d.setAttribute('aria-label', 'Ir para depoimento ' + (i + 1));
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      }
    }
  
    function goTo(i) {
      slide = (i + total) % total;
      track.style.transform = `translateX(-${slide * 100}%)`;
      $$('.slider__dot', dotsWrap).forEach((d, j) => d.classList.toggle('is-active', j === slide));
    }
  
    $('#sliderPrev').addEventListener('click', () => goTo(slide - 1));
    $('#sliderNext').addEventListener('click', () => goTo(slide + 1));
  
    let autoSlide = setInterval(() => goTo(slide + 1), 6500);
    const slider = $('#slider');
    slider.addEventListener('mouseenter', () => clearInterval(autoSlide));
    slider.addEventListener('mouseleave', () => { autoSlide = setInterval(() => goTo(slide + 1), 6500); });
  
    $$('.accordion__item').forEach(item => {
      const head = $('.accordion__head', item);
      const body = $('.accordion__body', item);
      head.addEventListener('click', () => {
        const isOpen = item.classList.toggle('is-open');
        head.setAttribute('aria-expanded', String(isOpen));
        body.style.maxHeight = isOpen ? body.scrollHeight + 'px' : '0px';
      });
    });
  
    $$('[data-compra]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const plano = btn.dataset.compra === 'kit' ? 'Kit Completo' : 'E-book';
        mostrarToast(`🛒 ${plano} — redirecionando para o checkout seguro…`);
        setTimeout(() => { btn.textContent = '✅ Pedido simulado'; btn.style.pointerEvents = 'none'; }, 400);
      });
    });
  
    const newsForm = $('#newsForm');
    const newsMsg = $('#newsMsg');
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#newsEmail').value.trim();
      const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!valido) {
        newsMsg.textContent = '✋ Digite um e-mail válido.';
        newsMsg.className = 'news__msg is-error';
        return;
      }
      newsMsg.textContent = '🎉 Pronto! Verifique sua caixa de entrada.';
      newsMsg.className = 'news__msg is-ok';
      newsForm.reset();
    });
  
    const themeToggle = $('#themeToggle');
    const savedTheme = localStorage.getItem('sb-theme');
    if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.addEventListener('click', () => {
      const dark = document.documentElement.hasAttribute('data-theme');
      if (dark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('sb-theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('sb-theme', 'dark');
      }
    });
  })();
  