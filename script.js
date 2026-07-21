// Panda Games — vanilla JS app
(() => {
  const CATEGORIES = [
    { key: "Trending", icon: '<i data-lucide="flame"></i>' },
    { key: "New", icon: '<i data-lucide="sparkles"></i>' },
    { key: "Hot", icon: '<i data-lucide="siren"></i>' },

    { key: "IO ", icon: '<i data-lucide="ghost"></i>' },
    { key: "Action ", icon: '<i data-lucide="swords"></i>' },
    { key: "Adventure ", icon: '<i data-lucide="map"></i>' },
    { key: "Sports ", icon: '<i data-lucide="medal"></i>' },
    { key: "Arcade Classics", icon: '<i data-lucide="gamepad-2"></i>' },
    { key: "Casual & Fun ", icon: '<i data-lucide="smile"></i>' },
    { key: "Clicker ", icon: '<i data-lucide="mouse-pointer-click"></i>' },
    { key: "Multiplayer ", icon: '<i data-lucide="users"></i>' },
    { key: "Platformer ", icon: '<i data-lucide="mountain"></i>' },
    { key: "Puzzle & Brain ", icon: '<i data-lucide="puzzle"></i>' },
    { key: "Racing & Driving ", icon: '<i data-lucide="car"></i>' },
    { key: "Simulation ", icon: '<i data-lucide="cpu"></i>' },

    { key: "Horror ", icon: '<i data-lucide="skull"></i>' },
    { key: "Ball ", icon: '<i data-lucide="circle"></i>' },
    { key: "Endless ", icon: '<i data-lucide="infinity"></i>' },
    { key: "Ragdoll ", icon: '<i data-lucide="person-standing"></i>' },

    { key: "Hot ", icon: '<i data-lucide="crown"></i>' },
    { key: "New ", icon: '<i data-lucide="sparkles"></i>' }
  ];

  const els = {
    sideNav: document.getElementById('sideNav'),
    sidebar: document.getElementById('sidebar'),
    grid: document.getElementById('gamesGrid'),
    heading: document.getElementById('gridHeading'),
    count: document.getElementById('gameCount'),
    empty: document.getElementById('emptyState'),
    search: document.getElementById('searchInput'),
    hero: document.getElementById('hero'),
    heroTitle: document.getElementById('heroTitle'),
    heroDesc: document.getElementById('heroDesc'),
    heroThumb: document.getElementById('heroThumb'),
    heroPlay: document.getElementById('heroPlay'),
    heroRandom: document.getElementById('heroRandom'),
    randomBtn: document.getElementById('randomBtn'),
    hideBtn: document.getElementById('hideBtn'),
    browseView: document.getElementById('browseView'),
    gameView: document.getElementById('gameView'),
    playerFrame: document.getElementById('playerFrame'),
    gameTitle: document.getElementById('gameTitle'),
    gameLabels: document.getElementById('gameLabels'),
    gameDescription: document.getElementById('gameDescription'),
    gameMetaThumb: document.getElementById('gameMetaThumb'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    favBtn: document.getElementById('favBtn'),
    relatedGrid: document.getElementById('relatedGrid'),
    recentRow: document.getElementById('recentRow'),
    recentGrid: document.getElementById('recentGrid'),
    recentCount: document.getElementById('recentCount'),
    favRow: document.getElementById('favRow'),
    favGrid: document.getElementById('favGrid'),
    toastWrap: document.getElementById('toastWrap'),
  };

  let allGames = [];
  let currentCat = null;
  let currentQuery = '';

  const LS_FAV = 'panda_favs';
  const LS_RECENT = 'panda_recent';

  const getLS = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
  const setLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  const toast = (msg) => {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    els.toastWrap.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; t.style.transition = '.3s'; }, 2400);
    setTimeout(() => t.remove(), 2800);
  };

  // ---------- SIDEBAR ----------
  function renderSidebar() {
    els.sideNav.innerHTML = CATEGORIES.map(c => `
      <a class="side-item" href="?cat=${encodeURIComponent(c.key)}" data-cat="${c.key}" title="${c.key}">
        ${c.icon}<span>${c.key === 'IO' ? 'IO Games' : c.key + (['New', 'Hot', 'Trending'].includes(c.key) ? ' Games' : '')}</span>
      </a>
    `).join('');
    els.sideNav.querySelectorAll('.side-item').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const cat = a.dataset.cat;
        setRoute({ cat });
      });
    });
    lucide.createIcons();
  }

  // ---------- ROUTING ----------
  function setRoute({ cat, game }, replace = false) {
    const url = new URL(location.href);
    url.searchParams.delete('cat');
    url.searchParams.delete('game');
    if (cat) url.searchParams.set('cat', cat);
    if (game) url.searchParams.set('game', game);
    history[replace ? 'replaceState' : 'pushState']({}, '', url);
    handleRoute();
  }

  function handleRoute() {
    const params = new URLSearchParams(location.search);
    const game = params.get('game');
    const cat = params.get('cat');
    if (game) {
      showGame(game);
    } else {
      currentCat = cat || null;
      showBrowse();
      updateActiveCat();
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function updateActiveCat() {
    els.sideNav.querySelectorAll('.side-item').forEach(a => {
      a.classList.toggle('active', a.dataset.cat === currentCat);
    });
    document.querySelectorAll('.bottom-nav button').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === currentCat);
    });
  }

  // ---------- CARDS ----------
  function cardHTML(g, i = 0) {
    const labels = (g.labels || []).slice(0, 2).map(l => {
      const cls = l.toLowerCase();
      return `<span class="label ${cls}">${l}</span>`;
    }).join('');
    const favs = getLS(LS_FAV, []);
    const isFav = favs.includes(g.slug);
    const thumb = g.thumbnail?.url || '';
    const video = g.video?.url || '';
    return `
      <div class="card" data-slug="${g.slug}" style="animation-delay:${Math.min(i * 30, 400)}ms">
        <div class="card-media">
          <img loading="lazy" src="${thumb}" alt="${escapeHtml(g.title)}" onerror="this.style.background='#151515';this.removeAttribute('src')" />
          ${video ? `<video muted loop playsinline preload="none" data-src="${video}"></video>` : ''}
        </div>
        <div class="labels">${labels}</div>
        <button class="card-fav ${isFav ? 'active' : ''}" data-fav="${g.slug}" aria-label="Favorite"><i data-lucide="star" class="${isFav ? 'filled' : ''}" width="16" height="16"></i></button>
        <div class="card-title-static">${escapeHtml(g.title)}</div>
        <div class="card-overlay">
          <div class="card-title">${escapeHtml(g.title)}</div>
          <button class="card-play"><i data-lucide="play" width="14" height="14"></i> Play Now</button>
        </div>
      </div>`;
  }

  function escapeHtml(s = '') {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function bindCards(root) {
    root.querySelectorAll('.card').forEach(card => {
      const slug = card.dataset.slug;
      const video = card.querySelector('video');
      card.addEventListener('mouseenter', () => {
        if (video && !video.src && video.dataset.src) video.src = video.dataset.src;
        if (video) video.play().catch(() => { });
      });
      card.addEventListener('mouseleave', () => {
        if (video) { video.pause(); video.currentTime = 0; }
      });
      card.addEventListener('click', e => {
        if (e.target.closest('[data-fav]')) return;
        setRoute({ game: slug });
      });
    });
    root.querySelectorAll('[data-fav]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        toggleFav(btn.dataset.fav);
      });
    });
  }

  function toggleFav(slug) {
    let favs = getLS(LS_FAV, []);
    const on = favs.includes(slug);
    favs = on ? favs.filter(s => s !== slug) : [...favs, slug];
    setLS(LS_FAV, favs);
    toast(on ? 'Removed from favorites' : 'Added to favorites');
    document.querySelectorAll(`[data-fav="${slug}"]`).forEach(b => {
      b.classList.toggle('active', !on);
      b.innerHTML = `<i data-lucide="star" class="${!on ? 'filled' : ''}" width="16" height="16"></i>`;
    });
    lucide.createIcons();
    renderFavRow();
    if (els.favBtn.dataset.slug === slug) updateFavBtn(slug);
  }

  // ---------- BROWSE VIEW ----------
  function showBrowse() {
    els.gameView.classList.add('hidden');
    els.browseView.classList.remove('hidden');
    if (els.playerFrame.querySelector('iframe')) els.playerFrame.querySelector('iframe').remove();
    if (currentCat) {
  els.hero.style.display = "none";
  els.recentRow.hidden = true;
  els.favRow.hidden = true;
} else {
  els.hero.style.display = "";
  renderHero();
  renderRecent();
  renderFavRow();
}

renderGrid();
  }

  function filteredGames() {
    let list = allGames;
    if (currentCat) {
      list = list.filter(g =>
        [...(g.labels || []), ...(g.categories || [])]
          .some(v => v.toLowerCase() === currentCat.toLowerCase())
      );
    }
    if (currentQuery) {
      const q = currentQuery.toLowerCase();
      list = list.filter(g => g.title.toLowerCase().includes(q));
    }
    return list;
  }

  function renderGrid() {
    const list = filteredGames();
    els.heading.textContent = currentQuery
  ? `Results for "${currentQuery}"`
  : currentCat || "All Games";
    els.count.textContent = `${list.length} game${list.length === 1 ? '' : 's'}`;
    if (list.length === 0) {
      els.grid.innerHTML = '';
      els.empty.classList.remove('hidden');
      return;
    }
    els.empty.classList.add('hidden');
    els.grid.innerHTML = list.map((g, i) => cardHTML(g, i)).join('');
    bindCards(els.grid);
    lucide.createIcons();
  }

  function renderHero() {
    const trending = allGames.filter(g => (g.labels || []).includes('Trending'));
    const pool = trending.length ? trending : allGames;
    if (!pool.length) return;
    const g = pool[Math.floor(Math.random() * pool.length)];
    els.heroTitle.textContent = g.title;
    els.heroDesc.textContent = `Play ${g.title} and thousands more free online games on Panda Games.`;
    els.heroThumb.style.backgroundImage = `url(${g.thumbnail?.url || ''})`;
    els.heroPlay.onclick = () => setRoute({ game: g.slug });
  }

  function renderRecent() {
    const recent = getLS(LS_RECENT, []).map(s => allGames.find(g => g.slug === s)).filter(Boolean).slice(0, 12);
    if (!recent.length) { els.recentRow.hidden = true; return; }
    els.recentRow.hidden = false;
    els.recentCount.textContent = `${recent.length}`;
    els.recentGrid.innerHTML = recent.map((g, i) => cardHTML(g, i)).join('');
    bindCards(els.recentGrid);
    lucide.createIcons();
  }

  function renderFavRow() {
    const favs = getLS(LS_FAV, []).map(s => allGames.find(g => g.slug === s)).filter(Boolean);
    if (!favs.length) { els.favRow.hidden = true; return; }
    els.favRow.hidden = false;
    els.favGrid.innerHTML = favs.map((g, i) => cardHTML(g, i)).join('');
    bindCards(els.favGrid);
    lucide.createIcons();
  }

  // ---------- GAME VIEW ----------
  function showGame(slug) {
    const g = allGames.find(x => x.slug === slug);
    if (!g) { setRoute({}, true); return; }
    els.browseView.classList.add('hidden');
    els.gameView.classList.remove('hidden');

    let recent = getLS(LS_RECENT, []).filter(s => s !== slug);
    recent.unshift(slug);
    setLS(LS_RECENT, recent.slice(0, 20));

    els.gameTitle.textContent = g.title;
    els.gameMetaThumb.src = g.thumbnail?.url || '';
    els.gameMetaThumb.alt = g.title;
    els.gameLabels.innerHTML = (g.labels || []).map(l => `<span class="label ${l.toLowerCase()}">${l}</span>`).join('');
    els.gameDescription.textContent = `Jump into ${g.title} — one of our most exciting titles. Play instantly in your browser with no downloads required.`;

    els.playerFrame.querySelectorAll('iframe').forEach(f => f.remove());
    const loader = els.playerFrame.querySelector('.player-loading');
    if (loader) loader.style.display = 'flex';
    const src = (g.page_url || '') + '.embed';
    const iframe = document.createElement('iframe');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allow', 'autoplay; fullscreen; gamepad; xr-spatial-tracking');
    iframe.setAttribute('allowfullscreen', '');
    iframe.src = src;
    iframe.onload = () => { if (loader) loader.style.display = 'none'; };
    els.playerFrame.appendChild(iframe);

    els.fullscreenBtn.onclick = () => {
      if (iframe.requestFullscreen) iframe.requestFullscreen();
    };
    updateFavBtn(slug);
    els.favBtn.dataset.slug = slug;
    els.favBtn.onclick = () => toggleFav(slug);

    const related = allGames.filter(x => x.slug !== slug && (x.labels || []).some(l => (g.labels || []).includes(l))).slice(0, 12);
    const pool = related.length ? related : allGames.filter(x => x.slug !== slug).slice(0, 12);
    els.relatedGrid.innerHTML = pool.map((x, i) => cardHTML(x, i)).join('');
    bindCards(els.relatedGrid);
    lucide.createIcons();
  }

  function updateFavBtn(slug) {
    const isFav = getLS(LS_FAV, []).includes(slug);
    els.favBtn.innerHTML = `<i data-lucide="star" class="${isFav ? 'filled' : ''}" width="16" height="16"></i> ${isFav ? 'Favorited' : 'Favorite'}`;
    lucide.createIcons();
  }

  // ---------- SEARCH ----------
  let searchTimer;
  els.search.addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentQuery = e.target.value.trim();
      if (!els.gameView.classList.contains('hidden')) setRoute({});
      else renderGrid();
    }, 120);
  });

  // ---------- SKELETON ----------
  function showSkeleton() {
    els.grid.innerHTML = Array.from({ length: 12 }).map(() => `<div class="card skeleton"></div>`).join('');
  }

  // ---------- BUTTONS ----------
  els.randomBtn.addEventListener('click', pickRandom);
  els.heroRandom.addEventListener('click', pickRandom);
  els.hideBtn.addEventListener('click', () => {
    document.title = 'Google Classroom';
  });

  document.querySelectorAll('.bottom-nav button').forEach(b => {
    b.addEventListener('click', () => setRoute({ cat: b.dataset.cat }));
  });

  function pickRandom() {
    if (!allGames.length) return;
    const g = allGames[Math.floor(Math.random() * allGames.length)];
    setRoute({ game: g.slug });
  }

  // ---------- KEYBOARD ----------
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') {
      if (e.key === 'Escape') { e.target.blur(); }
      return;
    }
    if (e.key === '/') { e.preventDefault(); els.search.focus(); }
    else if (e.key.toLowerCase() === 'r') pickRandom();
    else if (e.key === 'Escape' && !els.gameView.classList.contains('hidden')) setRoute({});
  });

  window.addEventListener('popstate', handleRoute);

  // ---------- PARTICLES ----------
  function initParticles() {
    const c = document.getElementById('particles');
    const ctx = c.getContext('2d');
    let w, h, parts;
    const resize = () => {
      w = c.width = innerWidth;
      h = c.height = innerHeight;
      parts = Array.from({ length: Math.min(60, Math.floor(w / 30)) }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
        r: Math.random() * 1.6 + .4,
      }));
    };
    resize();
    addEventListener('resize', resize);
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#33ff99';
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.globalAlpha = .4;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      requestAnimationFrame(tick);
    };
    tick();
  }

  // ---------- INIT ----------
  async function init() {
    renderSidebar();
    lucide.createIcons();
    initParticles();
    showSkeleton();
    try {
      const res = await fetch('games.json');
      if (!res.ok) throw new Error('Failed to load games');
      const data = await res.json();
      allGames = Array.isArray(data) ? data : (data.games || []);
      allGames = allGames.filter(g => g && g.slug && g.title);
      handleRoute();
      toast(`Loaded ${allGames.length} games`);
    } catch (err) {
      console.error(err);
      els.grid.innerHTML = '';
      els.empty.classList.remove('hidden');
      els.empty.querySelector('h3').textContent = 'Failed to load games';
      els.empty.querySelector('p').textContent = 'Please check games.json and try again.';
      toast('⚠ Failed to load games.json');
    }
  }

  init();
})();