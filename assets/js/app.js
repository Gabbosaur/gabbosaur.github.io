/* ==========================================================================
   Gabriele Guo · Portfolio interactions
   Vanilla JS, no dependencies. Respects prefers-reduced-motion.
   ========================================================================== */
(function () {
	'use strict';

	var root = document.documentElement;
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	var canVT = typeof document.startViewTransition === 'function' && !reduceMotion;
	var $ = function (s, c) { return (c || document).querySelector(s); };
	var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

	var year = $('#year');
	if (year) year.textContent = new Date().getFullYear();

	/* ---------- Greeting in the visitor's language ---------- */
	// Languages I speak (or am learning). If the visitor's browser language
	// is one of them, the site greets them in it first.
	var greetings = [
		{ code: 'en', word: 'Hi' },
		{ code: 'it', word: 'Ciao' },
		{ code: 'zh', word: '你好', lang: 'zh-Hans' },
		{ code: 'es', word: 'Hola' },
		{ code: 'fr', word: 'Salut' },
		{ code: 'ja', word: 'こんにちは' },
		{ code: 'ru', word: 'Привет' },
		{ code: 'tr', word: 'Merhaba' }
	];

	(function greet() {
		var word = $('#greet');
		var tag = $('#greet-lang');
		if (!word) return;

		var visitor = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').slice(0, 2).toLowerCase();
		var start = 0;
		greetings.forEach(function (g, i) { if (g.code === visitor) start = i; });
		var idx = start;

		function render(i, mine) {
			var g = greetings[i];
			word.textContent = g.word;
			word.setAttribute('lang', g.lang || g.code);
			tag.textContent = g.code.toUpperCase() + (mine ? ' · your language' : '');
		}
		render(idx, visitor !== 'en' && greetings[start].code === visitor);

		if (reduceMotion) return;

		setInterval(function () {
			idx = (idx + 1) % greetings.length;
			var out = word.animate(
				[{ transform: 'none', opacity: 1, filter: 'blur(0)' }, { transform: 'translateY(-35%)', opacity: 0, filter: 'blur(6px)' }],
				{ duration: 320, easing: 'cubic-bezier(0.55, 0, 1, 0.45)', fill: 'forwards' }
			);
			out.onfinish = function () {
				render(idx, false);
				out.cancel();
				word.animate(
					[{ transform: 'translateY(35%)', opacity: 0, filter: 'blur(6px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }],
					{ duration: 600, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
				);
			};
		}, 2600);
	})();

	/* ---------- Name chip (tap to toggle on touch) ---------- */
	var chip = $('#namechip');
	if (chip) {
		var chipBtn = $('.namechip__btn', chip);
		chipBtn.addEventListener('click', function () {
			var open = !chip.classList.contains('is-open');
			chip.classList.toggle('is-open', open);
			chipBtn.setAttribute('aria-expanded', String(open));
		});
		document.addEventListener('click', function (e) {
			if (!chip.contains(e.target)) {
				chip.classList.remove('is-open');
				chipBtn.setAttribute('aria-expanded', 'false');
			}
		});
	}

	/* ---------- "Live" tiles: animate only on demand ----------
	   Nothing moves on its own except the greeting. A tile comes alive while
	   hovered (mouse) or, on touch screens, while it is well inside the viewport. */
	var liveTiles = $$('.tile--projects, .tile--now, .tile--passions');

	function setLive(tile, on) {
		if (tile.classList.contains('is-live') === on) return;
		tile.classList.toggle('is-live', on);
		tile.dispatchEvent(new CustomEvent('live', { detail: on }));
	}

	if (!reduceMotion) {
		if (finePointer) {
			liveTiles.forEach(function (tile) {
				tile.addEventListener('pointerenter', function () { setLive(tile, true); });
				tile.addEventListener('pointerleave', function () { setLive(tile, false); });
			});
		} else if ('IntersectionObserver' in window) {
			var liveIO = new IntersectionObserver(function (entries) {
				entries.forEach(function (e) { setLive(e.target, e.intersectionRatio >= 0.6); });
			}, { threshold: [0, 0.6] });
			liveTiles.forEach(function (tile) { liveIO.observe(tile); });
		}
	}

	/* ---------- Viewfinder: cycles through passions while live, synced with the chips ---------- */
	(function viewfinder() {
		var slides = $$('.vf__slide');
		var chips = $$('#passion-chips li');
		var count = $('#vf-count');
		var label = $('#vf-label');
		var hello = $('#vf-hello');
		var hellos = ['你好', 'Ciao', 'Hola', 'Hi', 'Salut', 'Merhaba'];
		var h = 0;
		if (slides.length < 2) return;
		var n = slides.length;
		var i = 0;
		var timer = null;

		function show(next) {
			slides[i].classList.remove('is-current');
			if (chips[i]) chips[i].classList.remove('is-on');
			i = next;
			slides[i].classList.add('is-current');
			if (chips[i]) chips[i].classList.add('is-on');
			label.textContent = chips[i] ? chips[i].textContent : '';
			count.textContent = String(i + 1).padStart(2, '0') + '/' + String(n).padStart(2, '0');
			// The language slide says hello in a different language every time
			if (hello && i === n - 1) { h = (h + 1) % hellos.length; hello.textContent = hellos[h]; }
		}

		var tile = $('.tile--passions');
		var kickoff = null;

		function start() {
			if (reduceMotion || timer || !tile.classList.contains('is-live')) return;
			// First change comes quickly so the hover feels responsive
			kickoff = setTimeout(function () { show((i + 1) % n); }, 700);
			timer = setInterval(function () { show((i + 1) % n); }, 2200);
		}

		function stop() { clearTimeout(kickoff); clearInterval(timer); timer = null; }

		tile.addEventListener('live', function (e) { if (e.detail) start(); else stop(); });

		// Hovering a chip jumps the viewfinder to that passion
		chips.forEach(function (chip, idx) {
			chip.addEventListener('pointerenter', function () { stop(); if (idx !== i) show(idx); });
		});
		var list = $('#passion-chips');
		if (list) {
			list.addEventListener('pointerleave', start);
			// Chips sit above the tile's link overlay, so forward clicks to it
			list.addEventListener('click', function () {
				var link = $('.tile__link[data-panel="passions"]');
				if (link) link.click();
			});
		}
	})();

	/* ---------- Tile tilt with a little inertia ---------- */
	if (finePointer && !reduceMotion) {
		$$('.tile:not(.tile--intro)').forEach(function (tile) {
			var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
			function step() {
				cx += (tx - cx) * 0.12;
				cy += (ty - cy) * 0.12;
				tile.style.setProperty('--rx', cy.toFixed(3) + 'deg');
				tile.style.setProperty('--ry', cx.toFixed(3) + 'deg');
				if (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01) raf = requestAnimationFrame(step);
				else raf = null;
			}
			function kick() { if (!raf) raf = requestAnimationFrame(step); }
			tile.addEventListener('pointermove', function (e) {
				var r = tile.getBoundingClientRect();
				tx = ((e.clientX - r.left) / r.width - 0.5) * 4;
				ty = -((e.clientY - r.top) / r.height - 0.5) * 4;
				kick();
			});
			tile.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });
			tile._resetTilt = function () {
				tx = ty = cx = cy = 0;
				tile.style.setProperty('--rx', '0deg');
				tile.style.setProperty('--ry', '0deg');
			};
		});
	}

	/* ---------- Panels: tiles morph into full detail views ---------- */
	var overlay = $('#overlay');
	var main = $('#main');
	var nav = $('#nav');
	var footer = $('.footer');
	var current = null;      // open panel element
	var pushed = false;      // did we push a history entry for it?

	// Index children of staggered blocks for the rise-in animation
	$$('.stagger').forEach(function (block) {
		Array.prototype.forEach.call(block.children, function (el, i) { el.style.setProperty('--s', Math.min(i, 10)); });
	});

	function tileFor(id) {
		var link = $('.tile__link[data-panel="' + id + '"]');
		return link ? link.closest('.tile') : null;
	}

	function setBackgroundInert(on) {
		[main, nav, footer].forEach(function (el) { if (el) el.inert = on; });
		document.body.classList.toggle('has-panel', on);
	}

	function afterOpen(panel) {
		var title = $('.panel__title', panel);
		if (title) title.focus({ preventScroll: true });
		// Without the morph (no View Transitions, deep link) deal right away
		if (panel.id === 'projects' && deck && deck.classList.contains('is-pending')) dealCards();
	}

	function openPanel(id, opts) {
		opts = opts || {};
		var panel = document.getElementById(id);
		if (!panel || !panel.classList.contains('panel') || current === panel) return;
		var tile = opts.fromTile || null;
		if (tile && tile._resetTilt) tile._resetTilt();

		function apply() {
			// Keep the deck hidden while the panel opens, so the cards are only
			// ever seen being dealt (never already laid out first)
			if (panel.id === 'projects' && deck && !reduceMotion) deck.classList.add('is-pending');
			overlay.classList.add('is-open');
			panel.classList.add('is-active');
			panel.scrollTop = 0;
			if (tile) tile.style.viewTransitionName = '';
			panel.style.viewTransitionName = tile ? 'morph' : '';
			setBackgroundInert(true);
			current = panel;
		}

		if (canVT && tile) {
			tile.style.viewTransitionName = 'morph';
			var t = document.startViewTransition(apply);
			// Start dealing as the panel grows in, not after the morph has finished
			if (panel.id === 'projects') t.ready.then(function () { setTimeout(dealCards, 180); });
			t.finished.finally(function () {
				panel.style.viewTransitionName = '';
				afterOpen(panel);
			});
		} else {
			apply();
			if (!reduceMotion) {
				panel.classList.remove('anim-in');
				void panel.offsetWidth;
				panel.classList.add('anim-in');
			}
			afterOpen(panel);
		}
	}

	function closePanel() {
		if (!current) return;
		var panel = current;
		var tile = tileFor(panel.id);

		function apply() {
			overlay.classList.remove('is-open');
			panel.classList.remove('is-active', 'anim-in');
			panel.style.viewTransitionName = '';
			if (tile) tile.style.viewTransitionName = 'morph';
			setBackgroundInert(false);
			current = null;
			resetCards();
		}

		function done() {
			if (tile) {
				tile.style.viewTransitionName = '';
				var link = $('.tile__link', tile);
				if (link) link.focus({ preventScroll: true });
			}
		}

		if (canVT && tile) {
			panel.style.viewTransitionName = 'morph';
			document.startViewTransition(apply).finished.finally(done);
		} else {
			apply();
			done();
		}
	}

	// User-initiated close: go back in history if we pushed an entry
	function requestClose() {
		if (pushed) {
			history.back(); // popstate handles the actual close
		} else {
			closePanel();
			history.replaceState(null, '', location.pathname + location.search);
		}
	}

	$$('.tile__link[data-panel]').forEach(function (link) {
		link.addEventListener('click', function (e) {
			e.preventDefault();
			var id = link.dataset.panel;
			openPanel(id, { fromTile: link.closest('.tile') });
			history.pushState({ panel: id }, '', '#' + id);
			pushed = true;
		});
	});

	$$('[data-close]').forEach(function (el) { el.addEventListener('click', requestClose); });

	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && current) requestClose();
	});

	window.addEventListener('popstate', function () {
		var id = location.hash.slice(1);
		if (id && document.getElementById(id) && document.getElementById(id).classList.contains('panel')) {
			if (current && current.id !== id) closePanel();
			openPanel(id, { fromTile: tileFor(id) });
			pushed = !!(history.state && history.state.panel);
		} else {
			closePanel();
			pushed = false;
		}
	});

	// Deep link: open the panel straight away (no morph)
	(function deepLink() {
		var id = location.hash.slice(1);
		var el = id && document.getElementById(id);
		if (el && el.classList.contains('panel')) {
			openPanel(id);
			pushed = false;
		}
	})();

	/* ---------- Project deck: deal + flip ---------- */
	var deck = $('#deck');
	var cards = deck ? $$('.pcard', deck) : [];

	function setFlipped(card, flipped) {
		card.classList.toggle('is-flipped', flipped);
		$('.pcard__front', card).inert = flipped;
		$('.pcard__back', card).inert = !flipped;
	}

	cards.forEach(function (card) {
		setFlipped(card, false);
		$$('[data-flip]', card).forEach(function (btn) {
			btn.addEventListener('click', function () {
				var flip = !card.classList.contains('is-flipped');
				setFlipped(card, flip);
				// Move focus to the face that is now visible
				var target = flip ? $('.pcard__back h3', card) : $('.pcard__front', card);
				if (flip) target.setAttribute('tabindex', '-1');
				setTimeout(function () { target.focus({ preventScroll: true }); }, 50);
			});
		});
	});

	function resetCards() {
		cards.forEach(function (c) { setFlipped(c, false); });
	}

	// Cards fly out of a deck at the top of the panel, like a dealer's spread
	function dealCards() {
		if (!deck || !deck.classList.contains('is-pending')) return;
		var d = deck.getBoundingClientRect();
		var ox = d.left + d.width / 2;
		var oy = d.top - 40;
		cards.forEach(function (card, i) {
			var r = card.getBoundingClientRect();
			var dx = ox - (r.left + r.width / 2);
			var dy = oy - (r.top + r.height / 2);
			var rot = (i % 2 ? 1 : -1) * (6 + (i * 7) % 10);
			card.animate([
				{ transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg) scale(0.6)', opacity: 0 },
				{ opacity: 1, offset: 0.2 },
				{ transform: 'none', opacity: 1 }
			], {
				duration: 800,
				delay: 150 + i * 55,
				easing: 'cubic-bezier(0.34, 1.3, 0.64, 1)',
				fill: 'backwards'
			});
		});
		// The animations now hold every card at its starting point; safe to unhide
		deck.classList.remove('is-pending');
	}

	/* ---------- Theme toggle with circular reveal ---------- */
	var themeBtn = $('#theme-toggle');
	var themeMeta = $('meta[name="theme-color"]');

	function applyTheme(t) {
		root.setAttribute('data-theme', t);
		try { localStorage.setItem('theme', t); } catch (e) { }
		if (themeMeta) themeMeta.setAttribute('content', t === 'light' ? '#f2f1ec' : '#0c0c10');
		themeBtn.setAttribute('aria-label', t === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
	}
	applyTheme(root.getAttribute('data-theme') || 'dark');

	themeBtn.addEventListener('click', function (e) {
		var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
		if (!canVT) { applyTheme(next); return; }

		var b = themeBtn.getBoundingClientRect();
		var x = e.clientX || b.left + b.width / 2;
		var y = e.clientY || b.top + b.height / 2;
		var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

		root.classList.add('vt-theme');
		var t = document.startViewTransition(function () { applyTheme(next); });
		t.ready.then(function () {
			root.animate(
				{ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
				{ duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }
			);
		});
		t.finished.finally(function () { root.classList.remove('vt-theme'); });
	});

	/* ---------- Copy email ---------- */
	var toast = $('#toast');
	var toastTimer;
	var copyBtn = $('#copy-email');

	function showToast(msg) {
		toast.textContent = msg;
		toast.classList.add('is-visible');
		clearTimeout(toastTimer);
		toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
	}

	if (copyBtn) {
		copyBtn.addEventListener('click', function () {
			var email = copyBtn.dataset.email;
			if (navigator.clipboard && window.isSecureContext) {
				navigator.clipboard.writeText(email).then(function () {
					showToast('Email copied');
					copyBtn.textContent = 'Copied';
					setTimeout(function () { copyBtn.textContent = 'Copy email'; }, 2000);
				}, function () { showToast(email); });
			} else {
				showToast(email);
			}
		});
	}

	console.log('%c飞欧 says hi 👋', 'font: 600 15px sans-serif; color: #ff5a3c');
	console.log('There is nothing interesting to see here. LUL');
})();
