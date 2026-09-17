// UTEX ENERGY - Home page interactions

// Mobile nav toggle
document.querySelector('.nav-toggle')?.addEventListener('click', function () {
    document.querySelector('.nav-links')?.classList.toggle('open');
});

// Sticky / shrink header on scroll
var header = document.querySelector('.site-header');
var onScroll = function () {
    header.classList.toggle('scrolled', window.scrollY > 40);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Scroll reveal animations
// Exclude hero-content items: they have their own CSS `heroIn` entrance
// animation, so letting the JS observer also toggle them causes the hero
// to animate twice on page load.
var reveals = Array.prototype.filter.call(
    document.querySelectorAll('[data-reveal]'),
    function (el) { return !el.closest('.hero-content'); }
);
if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
} else {
    reveals.forEach(function (el) { el.classList.add('in'); });
}

// Animated stat counters
var animateCount = function (el) {
    var raw = el.textContent.trim();
    var match = raw.match(/([^\d]*)([\d,\.]+)(.*)/);
    if (!match) return;
    var prefix = match[1], target = parseFloat(match[2].replace(/,/g, '')), suffix = match[3];
    var decimals = (match[2].split('.')[1] || '').length;
    var start = null, dur = 1400;
    var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = (target * eased);
        var out = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString();
        el.textContent = prefix + out + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = raw;
    };
    requestAnimationFrame(step);
};
var statObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); statObserver.unobserve(e.target); }
    });
}, { threshold: 0.6 });
document.querySelectorAll('.stat .num').forEach(function (n) { statObserver.observe(n); });

// Partner tab switch (visual only)
document.querySelectorAll('.partner-tabs button').forEach(function (btn) {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.partner-tabs button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Solutions menu: switch active state + swap copy and image
(function () {
    var items = document.querySelectorAll('.solutions-menu li');
    var copy = document.querySelector('.solutions-copy');
    if (!items.length || !copy) return;

    var eyebrow = copy.querySelector('.eyebrow');
    var title = copy.querySelector('h2');
    var desc = copy.querySelector('p');
    var media = document.querySelector('.solutions-media');
    var img = media ? media.querySelector('img') : null;

    var swap = function (li) {
        var newEyebrow = li.getAttribute('data-eyebrow');
        var newTitle = li.getAttribute('data-title');
        var newDesc = li.getAttribute('data-desc');
        var newImg = li.getAttribute('data-img');
        if (!newTitle) return;

        // fade out, update, fade in
        copy.classList.add('swapping');
        if (media) media.classList.add('swapping');

        setTimeout(function () {
            if (eyebrow && newEyebrow) eyebrow.textContent = newEyebrow;
            if (title) title.textContent = newTitle;
            if (desc && newDesc) desc.textContent = newDesc;
            if (img && newImg) {
                img.src = newImg;
                img.alt = li.getAttribute('data-alt') || newEyebrow || '';
            }
            copy.classList.remove('swapping');
            if (media) media.classList.remove('swapping');
        }, 220);
    };

    items.forEach(function (li) {
        li.addEventListener('click', function () {
            if (li.classList.contains('active')) return;
            items.forEach(function (x) { x.classList.remove('active'); });
            li.classList.add('active');
            swap(li);
        });
    });
})();

// Subtle mouse-parallax on hero decorative layers
(function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Move the grid/effects layer and content slightly (these have no transform keyframes)
    var fx = hero.querySelector('.hero-fx');
    var content = hero.querySelector('.hero-content');
    var raf = null;

    hero.addEventListener('mousemove', function (ev) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
            var r = hero.getBoundingClientRect();
            var x = (ev.clientX - r.left) / r.width - 0.5;
            var y = (ev.clientY - r.top) / r.height - 0.5;
            if (fx) fx.style.transform = 'translate(' + (x * 18) + 'px,' + (y * 18) + 'px)';
            if (content) content.style.transform = 'translate(' + (x * -10) + 'px,' + (y * -10) + 'px)';
            raf = null;
        });
    });

    hero.addEventListener('mouseleave', function () {
        if (fx) fx.style.transform = '';
        if (content) content.style.transform = '';
    });
})();

/* ==========================================================================
   v5 — premium interactive motion
   ========================================================================== */
(function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- Scroll progress bar ---- */
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    var updateBar = function () {
        var h = document.documentElement;
        var scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
        bar.style.width = (scrolled * 100) + '%';
    };
    window.addEventListener('scroll', updateBar, { passive: true });
    updateBar();

    if (reduce) return; // skip the heavier motion for reduced-motion users

    /* ---- Cursor-follow glow ---- */
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    var gx = 0, gy = 0, cx = 0, cy = 0, gRaf = null;
    var glowLoop = function () {
        cx += (gx - cx) * 0.15;
        cy += (gy - cy) * 0.15;
        glow.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
        gRaf = requestAnimationFrame(glowLoop);
    };
    window.addEventListener('mousemove', function (e) {
        gx = e.clientX; gy = e.clientY;
        if (!gRaf) glowLoop();
    }, { passive: true });

    /* ---- 3D tilt on cards ---- */
    var tiltSel = '.product-card, .feature-card, .news-card, .stat, .cert';
    document.querySelectorAll(tiltSel).forEach(function (card) {
        card.classList.add('tilt');
        var raf = null;
        card.addEventListener('mousemove', function (e) {
            if (raf) return;
            raf = requestAnimationFrame(function () {
                var r = card.getBoundingClientRect();
                var px = (e.clientX - r.left) / r.width - 0.5;
                var py = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform =
                    'perspective(900px) rotateX(' + (py * -7) + 'deg) rotateY(' + (px * 9) + 'deg) translateY(-6px)';
                raf = null;
            });
        });
        card.addEventListener('mouseleave', function () {
            card.style.transform = '';
        });
    });

    /* ---- Magnetic buttons ---- */
    document.querySelectorAll('.btn').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
            var r = btn.getBoundingClientRect();
            var x = e.clientX - r.left - r.width / 2;
            var y = e.clientY - r.top - r.height / 2;
            btn.style.transform = 'translate(' + (x * 0.25) + 'px,' + (y * 0.35 - 3) + 'px)';
        });
        btn.addEventListener('mouseleave', function () {
            btn.style.transform = '';
        });
    });

    /* Hero headline typing effect removed:
       it re-animated the <h1> after the CSS `heroIn` entrance, which made the
       hero appear to animate twice on load. The single CSS entrance is kept. */
})();

/* ==========================================================================
   Sustainability stat count-up
   ========================================================================== */
(function () {
    var nums = document.querySelectorAll('.sustain-stat .s-num');
    if (!nums.length || !('IntersectionObserver' in window)) return;

    var run = function (el) {
        var target = parseFloat(el.getAttribute('data-count'));
        if (isNaN(target)) return;
        // capture the full original markup (may contain a <span> suffix)
        var suffixSpan = el.querySelector('span');
        var suffixHTML = suffixSpan ? suffixSpan.outerHTML : '';
        var start = null, dur = 1500;
        var step = function (ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            var val = Math.round(target * eased);
            el.innerHTML = val + suffixHTML;
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); }
        });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { obs.observe(n); });
})();
