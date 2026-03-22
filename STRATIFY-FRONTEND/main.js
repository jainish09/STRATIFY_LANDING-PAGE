/* ════════════════════════════════════════════
   STRATIFY – main.js  (Main Agency Page)
   ════════════════════════════════════════════ */
'use strict';

// ── Navbar scroll style ───────────────────────
(function navbarScroll() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!navbar) return;
    function check() { navbar.classList.toggle('scrolled', window.scrollY > 60); }
    window.addEventListener('scroll', check, { passive: true });
    check();
    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu?.classList.toggle('open');
    });
    mobileMenu?.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileMenu?.classList.remove('open');
        });
    });
})();

// ── Smooth scroll ─────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});

// ── Counter animation ─────────────────────────
(function counters() {
    const strip = document.querySelector('.stats-strip');
    if (!strip) return;
    let done = false;
    function countUp(el, target, dec, dur) {
        let s = null;
        (function step(ts) {
            if (!s) s = ts;
            const p = Math.min((ts - s) / dur, 1);
            const v = (1 - Math.pow(1 - p, 3)) * target;
            el.textContent = dec ? v.toFixed(dec) : Math.floor(v).toString();
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = dec ? target.toFixed(dec) : target.toString();
        })(performance.now());
    }
    new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !done) {
            done = true;
            document.querySelectorAll('.stat-val').forEach(el => {
                const t = parseFloat(el.dataset.target);
                countUp(el, t, Number.isInteger(t) ? 0 : 1, 1800);
            });
        }
    }, { threshold: 0.4 }).observe(strip);
})();

// ── AOS-lite (non-service elements) ───────────
(function aosLite() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const d = parseInt(e.target.dataset.aosDelay || 0);
                setTimeout(() => e.target.classList.add('aos-animate'), d);
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    // Skip service cards — GSAP handles those
    document
        .querySelectorAll('[data-aos]:not([data-svc-card]):not(.svc-compact-item)')
        .forEach(el => obs.observe(el));
})();

// ── Services: Cinematic FLIP Transition ──
(function servicesFlip() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // 1. Structural Setup: Create megaWrap if it doesn't exist
    let megaWrap = document.querySelector('.services-mega-wrap');
    const servicesIntro = document.querySelector('.services-intro');
    const svcVault = document.querySelector('.svc-vault');
    const compactItems = document.querySelectorAll('.svc-compact-item'); // Assuming these are defined elsewhere or globally accessible
    const cards = document.querySelectorAll('.svc-card'); // Assuming these are defined elsewhere or globally accessible

    if (!megaWrap) {
        megaWrap = document.createElement('div');
        megaWrap.className = 'services-mega-wrap';
        megaWrap.style.position = 'relative';
        megaWrap.style.backgroundColor = '#050605'; // Start purely black matching Section 1

        if (servicesIntro && svcVault && servicesIntro.parentNode) {
            servicesIntro.parentNode.insertBefore(megaWrap, servicesIntro);
            megaWrap.appendChild(servicesIntro);
            megaWrap.appendChild(svcVault);
        }
    }

    // Move all structural layout logic into matchMedia so it responds to resize/rotation correctly.
    let mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
        // --- DESKTOP: Activate Grid Overlap & Flip Animation ---
        megaWrap.style.display = 'grid';
        megaWrap.style.gridTemplateColumns = '1fr';
        megaWrap.style.gridTemplateRows = '1fr';
        megaWrap.style.alignItems = 'start';

        servicesIntro.style.gridArea = '1 / 1';
        svcVault.style.gridArea = '1 / 1';
        servicesIntro.style.backgroundColor = 'transparent';
        svcVault.style.backgroundColor = 'transparent';
        svcVault.style.display = 'block';

        const clonesMap = [];
        let cloneWrap = document.querySelector('.services-clones-wrap');

        if (!cloneWrap) {
            cloneWrap = document.createElement('div');
            cloneWrap.className = 'services-clones-wrap';
            cloneWrap.style.position = 'absolute';
            cloneWrap.style.inset = '0';
            cloneWrap.style.pointerEvents = 'none';
            cloneWrap.style.zIndex = '100';
            megaWrap.appendChild(cloneWrap);
        } else {
            cloneWrap.innerHTML = '';
        }

        // Initial States
        gsap.set(compactItems, { opacity: 1, y: 0, scale: 1 });
        gsap.set(cards, { opacity: 0 });

        // Hide Vault content initially
        gsap.set(svcVault, { opacity: 0, y: 30 });

        compactItems.forEach((item, i) => {
            const card = cards[i];
            const cloneNode = document.createElement('div');
            cloneNode.className = 'svc-clone-node';
            cloneNode.style.position = 'absolute';
            cloneNode.style.borderRadius = '999px'; // Start as a pill matching list item
            cloneNode.style.overflow = 'hidden';
            cloneNode.style.display = 'none';
            cloneNode.style.boxShadow = '0 6px 20px rgba(0,0,0,0.03)';
            cloneNode.style.backgroundColor = '#ffffff';

            // Clone for Section 1 State
            const itemClone = item.cloneNode(true);
            itemClone.style.cssText = 'position:absolute; inset:0; margin:0; border:none; width:100%; height:100%; display:flex; align-items:center; padding:16px 24px; background:transparent;';
            itemClone.classList.remove('aos-animate'); // Prevent AOS conflicts

            // Clone for Section 2 State
            const cardClone = card.cloneNode(true);
            cardClone.style.cssText = 'position:absolute; inset:0; margin:0; opacity:0; width:100%; height:100%; background:transparent; display:flex; flex-direction:column; padding:40px 30px; border:none; box-shadow:none;';

            cloneNode.appendChild(cardClone);
            cloneNode.appendChild(itemClone);
            cloneWrap.appendChild(cloneNode);

            clonesMap.push({ item, card, cloneNode, itemClone, cardClone });
        });

        // ── Measure Function ──
        function initClones() {
            // Un-hide Vault just to measure perfectly
            const prevVaultOp = gsap.getProperty(svcVault, "opacity");
            const prevVaultY = gsap.getProperty(svcVault, "y");
            gsap.set(svcVault, { opacity: 1, y: 0 });
            gsap.set(compactItems, { opacity: 1 });
            gsap.set(cards, { opacity: 1 });

            const wrapRect = megaWrap.getBoundingClientRect();

            clonesMap.forEach(v => {
                const ir = v.item.getBoundingClientRect();
                const cr = v.card.getBoundingClientRect();

                v.start = { x: ir.left - wrapRect.left, y: ir.top - wrapRect.top, w: ir.width, h: ir.height };
                v.end = { x: cr.left - wrapRect.left, y: cr.top - wrapRect.top, w: cr.width, h: cr.height };

                gsap.set(v.cloneNode, {
                    x: v.start.x, y: v.start.y,
                    width: v.start.w, height: v.start.h,
                    borderRadius: '999px' // reset to pill
                });
            });

            // Reset to hidden state
            gsap.set(svcVault, { opacity: prevVaultOp, y: prevVaultY });
            gsap.set(cards, { opacity: 0 });
        }

        initClones();

        // ── SINGLE SCRUBBED TIMELINE (Smooth & Bug-Free) ──
        // High scrub value prevents the "video fast forward" feel. It smooths it out naturally.
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: megaWrap,
                start: 'top top',
                end: '+=250%', // Enough distance to make the drop feel weighty and cinematic
                scrub: 1.2,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onRefresh: initClones
            }
        });

        // 1. Color shift & Section 1 fade out
        tl.to(megaWrap, { backgroundColor: '#f7f9f7', duration: 1 }, 0);
        const introContent = servicesIntro.querySelectorAll('.svc-title, .svc-sub, .svc-tag, .svc-compact-footnote');

        // Hide real intro text 
        tl.to(introContent, { opacity: 0, y: -20, duration: 1.2, ease: "power2.inOut" }, 0.2);

        // Turn background pure white
        tl.to(megaWrap, { backgroundColor: '#ffffff', duration: 1.5 }, 1);

        // Reveal the right side (Cards container, headers etc)
        tl.to(svcVault, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 1.5);

        // 2. The Physical Fall (Scrubbed smoothly)
        clonesMap.forEach((v, index) => {
            const startPoint = 0.5 + (index * 0.3); // Tightly stacked start
            const duration = 2; // Long mathematical duration for smoothness

            // DETACH
            tl.set(v.item, { opacity: 0 }, startPoint);
            tl.set(v.cloneNode, { display: 'block' }, startPoint);

            // FLIGHT Sequence
            tl.to(v.cloneNode, {
                x: () => v.end.x,
                y: () => v.end.y,
                width: () => v.end.w,
                height: () => v.end.h,
                borderRadius: '20px',
                rotation: index % 2 === 0 ? 2 : -2, // Slight tumble
                ease: "power2.inOut",
                duration: duration
            }, startPoint);

            // Morph Content Inside
            tl.to(v.itemClone, {
                opacity: 0,
                y: -15,
                duration: duration * 0.4,
                ease: "power2.in"
            }, startPoint + 0.2);

            tl.to(v.cardClone, {
                opacity: 1,
                y: 0,
                duration: duration * 0.6,
                ease: "power2.out"
            }, startPoint + duration * 0.4);

            // IMPACT
            tl.to(v.card, {
                opacity: 1,
                duration: 0.1
            }, startPoint + duration);

            // Cleanup
            tl.set(v.cloneNode, { display: 'none' }, startPoint + duration + 0.1);
        });

        // 3. Reverse Cleanup 
        tl.add(() => {
            if (tl.progress() <= 0.05) {
                clonesMap.forEach(v => {
                    gsap.set(v.cloneNode, { display: 'none' });
                    gsap.set(v.item, { opacity: 1 });
                    gsap.set(v.card, { opacity: 0 });
                });
            }
        }, 0);

        return () => { };
    });

    mm.add("(max-width: 768px)", () => {
        // --- MOBILE: Linear Stack & Accordion Mode ---
        megaWrap.style.display = 'block';
        servicesIntro.style.gridArea = 'auto';
        servicesIntro.style.opacity = '1';
        servicesIntro.style.pointerEvents = 'auto';
        
        // Ensure child elements (headers, etc) are not hidden by lingering desktop GSAP states
        const introContent = servicesIntro.querySelectorAll('.svc-title, .svc-sub, .svc-tag, .svc-compact-footnote');
        gsap.set(introContent, { opacity: 1, y: 0, scale: 1, pointerEvents: 'auto' });

        // Hide the vault (cards) section as requested - we use the accordion instead.
        svcVault.style.display = 'none';

        return () => {
            svcVault.style.display = '';
        };
    });
})();

// ── Ripple Effect ─────────────────────────────
document.querySelectorAll('.ripple').forEach(btn => {
    btn.addEventListener('click', function (e) {
        const r = document.createElement('span');
        r.classList.add('ripple-effect');
        const rect = this.getBoundingClientRect();
        const sz = Math.max(rect.width, rect.height) * 2;
        r.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - rect.left - sz / 2}px;top:${e.clientY - rect.top - sz / 2}px`;
        this.appendChild(r);
        setTimeout(() => r.remove(), 700);
    });
});

// ── Work Card Tilt ───────────────────────────
document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 4;
        const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * -4;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ── Glass Dashboard 3D Tilt ──────────────────────────────
(function glassDashboardTilt() {
    const dashboard = document.querySelector('.glass-dashboard-wrapper');
    if (!dashboard) return;

    document.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        // Calculate normalized mouse position (-1 to 1)
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;

        // Tilt the dashboard (reverse the sign for natural feel)
        // Max tilt of 10 degrees on X, 15 degrees on Y
        const tiltX = -dy * 10;
        const tiltY = dx * 15;

        dashboard.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
})();

// ── LinkedIn Newsletter Fetcher ──────────────────────────────
(async function fetchNewsletters() {
    const grid = document.getElementById('newsletter-grid');
    if (!grid) return;

    // Use the global 'db' instance created in database.js
    console.log('[Newsletter] Checking for database instance...');
    if (!window.db && typeof firebase !== 'undefined') {
        window.db = firebase.firestore();
    }

    if (!window.db) {
        console.error('[Newsletter] Firebase Firestore instance (window.db) not found!');
        grid.innerHTML = '<p style="text-align: center; width: 100%; color: var(--red);">Error: Database client not found.</p>';
        return;
    }

    try {
        console.log('[Newsletter] Fetching from Firestore...');
        const querySnapshot = await window.db.collection('linkedin_newsletters')
            .orderBy('published_at', 'desc')
            .limit(3)
            .get();

        console.log(`[Newsletter] Query complete. Found ${querySnapshot.size} documents.`);
        const newsletters = [];
        querySnapshot.forEach(doc => {
            newsletters.push({ id: doc.id, ...doc.data() });
        });

        if (newsletters && newsletters.length > 0) {
            grid.innerHTML = ''; // Clear loading message

            const cardSizes = ['wc-standard', 'wc-standard', 'wc-standard'];
            const cardColors = ['#1a1c1a', '#121413', '#0a0c0b']; // Desaturated dark charcoal instead of bright green

            newsletters.forEach((item, index) => {
                const cardSize = cardSizes[Math.min(index, cardSizes.length - 1)];
                const bgColor = cardColors[Math.min(index, cardColors.length - 1)];

                let dateStr = item.published_at;
                try {
                    const d = new Date(item.published_at);
                    if (!isNaN(d.getTime())) {
                        dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    }
                } catch (e) { }

                // Use an actual img tag instead of background-image for reliability with complex URLs
                // LinkedIn image servers strictly block direct browser loads from external domains.
                // We use a free, reliable image proxy (wsrv.nl) to bypass CORS and Referrer checks
                const proxiedUrl = item.image_url ? `https://wsrv.nl/?url=${encodeURIComponent(item.image_url)}` : '';
                const imgLayer = proxiedUrl
                    // Pure grayscale and slightly higher opacity to look like an underlaid B&W photograph 
                    // Adjusted to be much more visible per user request
                    ? `<img src="${proxiedUrl}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; opacity: 0.55; mix-blend-mode: luminosity; filter: contrast(1.1) brightness(0.8);" alt="Newsletter Cover" />`
                    : '';

                // Wrap the card in a GSAP layer to prevent GSAP transforms from fighting with mouse hover transforms
                const cardHtml = `
                    <div class="card-gsap-wrapper" style="height: 100%; perspective: 1200px;">
                        <div class="work-card ${cardSize} aos-animate" data-aos="fade-up" data-aos-delay="${index * 100}">
                            <div class="wc-bg" style="--wc-color:${bgColor};">
                                ${imgLayer}
                                <div class="wc-pattern" style="z-index: 2; position: absolute; inset: 0;"></div>
                            </div>
                            <div class="wc-tag">Newsletter · ${dateStr}</div>
                            <div class="wc-text-content" style="position: absolute; bottom: 24px; left: 24px; right: 24px; z-index: 3; transition: opacity .28s;">
                                <h3 class="wc-title" style="position: relative; bottom: auto; left: auto; right: auto; margin-bottom: 8px;">${item.title}</h3>
                                <p class="wc-desc" style="position: relative; bottom: auto; left: auto; right: auto; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin: 0;">${item.description}</p>
                            </div>
                            <div class="wc-overlay" style="z-index: 4;">
                                <a href="${item.link}" target="_blank" class="btn btn-primary btn-sm">Read on LinkedIn →</a>
                            </div>
                        </div>
                    </div>
                `;
                grid.innerHTML += cardHtml;
            });

            const authorLink = document.getElementById('linkedinProfileLink');
            if (authorLink && newsletters[0]) {
                const urlParts = newsletters[0].link.split('/');
                if (urlParts.length > 3) {
                    authorLink.href = 'https://www.linkedin.com/newsletters/financial-breakdown-7428542242501509120/';
                } else {
                    authorLink.href = newsletters[0].link;
                }
            }

            // Initialize the newly requested scroll animations now that DOM elements exist
            initPremiumScrollAnimations();

        } else {
            grid.innerHTML = '<p style="text-align: center; width: 100%; color: var(--gray-500); grid-column: 1 / -1;">No newsletters found yet. Check back soon!</p>';
        }

    } catch (err) {
        console.error('Error fetching newsletters:', err);
        grid.innerHTML = '<p style="text-align: center; width: 100%; color: var(--gray-500); grid-column: 1 / -1;">Could not load newsletters at this time.</p>';
    }
})();

/**
 * Initializes the premium scroll animations combining a Curtain reveal 
 * for the sections and a Typewriter effect for the newsletter titles.
 */
/**
 * Initializes the premium scroll animations combining a Curtain reveal 
 * for the sections and a Typewriter effect for the newsletter titles.
 */
function initPremiumScrollAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // 1. Pinned Curtain Reveal (Stats -> Newsletters)
    const revealWrap = document.getElementById('scroll-reveal-wrap');
    const statsSection = document.querySelector('.stats-strip');
    const newslettersSection = document.getElementById('newsletters');
    const workCardsWrappers = document.querySelectorAll('#newsletters .card-gsap-wrapper');

    if (revealWrap && statsSection && newslettersSection && typeof gsap !== 'undefined') {

        if (workCardsWrappers.length > 0) {
            gsap.set(workCardsWrappers, {
                y: 150,
                rotationX: 30,
                opacity: 0,
                transformOrigin: "center bottom"
            });
        }

        // Prepare for the curtain reveal
        gsap.set(statsSection, { clipPath: "inset(0 0 0% 0)" });
        // No need for yPercent: 100 anymore due to absolute positioning

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: revealWrap,
                start: "top top", 
                end: "+=1200",    
                pin: true,
                pinSpacing: true, 
                scrub: 1,         
            }
        });

        // Effect 1: The Curtain Wipe & Slide
        tl.to(statsSection, {
            clipPath: "inset(0 0 100% 0)",
            duration: 1,
            ease: "none"
        }, 0);

        // Slide the newsletters UP slightly as the curtain opens for that "revealing" feel
        tl.fromTo(newslettersSection, 
            { y: 100 }, 
            { y: 0, duration: 1, ease: "none" }, 
            0
        );

        // Effect 2: 3D Card Flight
        // As the curtain opens, the cards elegantly rotate and fly up to meet the user
        if (workCardsWrappers.length > 0) {
            tl.to(workCardsWrappers, {
                y: 0,
                rotationX: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 0.8,
                ease: "power3.out"
            }, 0.15); // Start the flight right after the curtain begins to open
        }

        // Effect 3: Micro Parallax on the Card Background Images
        const bgImages = document.querySelectorAll('#newsletters .wc-bg img');
        if (bgImages.length > 0) {
            gsap.set(bgImages, { y: -20, scale: 1.15 });

            tl.to(bgImages, {
                y: 20, // Slide down smoothly as the section goes up
                duration: 1.5,
                ease: "none"
            }, 0);
        }
    }

    // 2. Typewriter Effect for Cards
    const cards = document.querySelectorAll('#newsletters .work-card');
    if (!cards.length) return;

    let visibleCards = [];
    let cardsTimeout = null;

    const typeObserver = new IntersectionObserver((entries) => {
        let triggered = false;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                if (!card.classList.contains('animation-started')) {
                    card.classList.add('animation-started');
                    visibleCards.push(card);
                    triggered = true;
                }
            }
        });

        if (triggered) {
            if (cardsTimeout) clearTimeout(cardsTimeout);
            cardsTimeout = setTimeout(() => {
                // Animate batched cards with 150ms stagger
                visibleCards.forEach((card, staggerIndex) => {
                    const title = card.querySelector('.wc-title');
                    if (!title) return;

                    const delay = staggerIndex * 150;

                    // Trigger card rise reveal
                    setTimeout(() => {
                        card.classList.add('card-revealed');

                        // Prepare exact text for typewriter
                        const originalText = title.getAttribute('data-original-text') || title.textContent;
                        if (!title.getAttribute('data-original-text')) {
                            title.setAttribute('data-original-text', originalText);
                        }
                        title.textContent = '';
                        title.innerHTML = '<span class="typewriter-cursor"></span>';
                        const cursor = title.querySelector('.typewriter-cursor');

                        // Wait 300ms for card rise to settle before typing starts
                        setTimeout(() => {
                            let i = 0;
                            const typingInterval = setInterval(() => {
                                if (i < originalText.length) {
                                    const charSpan = document.createElement('span');
                                    charSpan.textContent = originalText.charAt(i);
                                    charSpan.className = 'typewriter-char';
                                    title.insertBefore(charSpan, cursor);
                                    i++;
                                } else {
                                    clearInterval(typingInterval);
                                    cursor.classList.add('blink-final');
                                    setTimeout(() => cursor.style.display = 'none', 1500);
                                }
                            }, 40); // 40ms per character
                        }, 300);

                    }, delay);
                });
                visibleCards = []; // Reset batch
            }, 50);
        }
    }, { threshold: 0.3 }); // Trigger when card is 30% visible

    // Set initial concealed states and observe
    cards.forEach(card => {
        card.classList.add('pre-reveal');
        typeObserver.observe(card);
    });
}

// Removed JS ScrollLockManager in favor of pure CSS Scroll Snapping (Apple-style layout)

// ── About Canvas Reveal Animation ──────────────────────────────
(function initAboutReveal() {
    const canvas = document.getElementById('inkCanvas');
    if (!canvas) return; // Prevent errors if not on the right page

    const ctx = canvas.getContext('2d');
    const s2 = document.getElementById('s2');
    const wrap = document.getElementById('txWrap');
    const flLabel = document.getElementById('floatingLabel');

    let W, H;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);

    // ── Ink origin: CENTER of screen ──
    const SEEDS = [
        { x: .5, y: .5 },
        { x: .15, y: .2 }, { x: .85, y: .2 }, { x: .1, y: .8 }, { x: .9, y: .8 },
        { x: .5, y: .05 }, { x: .5, y: .95 }, { x: .2, y: .5 }, { x: .8, y: .5 },
    ];

    function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function progress01(v, from, to) { return clamp((v - from) / (to - from), 0, 1); }

    function drawInk(p) {
        ctx.clearRect(0, 0, W, H);
        if (p <= 0.01) return; // Tiny threshold to hide completely

        const coverP = ease(progress01(p, 0, 0.42));  // ink spreading
        const holdP = progress01(p, 0.42, 0.68);  // holding (label visible)
        const burstP = easeOut(progress01(p, 0.68, 1.0)); // ink bursting open

        // ── Draw ink blobs ──
        const maxR = Math.sqrt(W * W + H * H) * 0.72;
        const holeR = burstP * maxR * 1.15; // hole grows from center

        ctx.save();

        // If bursting: cut a hole from center using composite
        if (burstP > 0) {
            ctx.globalCompositeOperation = 'source-over';
            drawBlobs(ctx, coverP, 1 - burstP * 0.6, maxR);

            ctx.globalCompositeOperation = 'destination-out';
            const hGrad = ctx.createRadialGradient(W / 2, H / 2, holeR * 0.55, W / 2, H / 2, holeR);
            hGrad.addColorStop(0, 'rgba(0,0,0,1)');
            hGrad.addColorStop(0.7, 'rgba(0,0,0,0.85)');
            hGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath();
            ctx.arc(W / 2, H / 2, holeR, 0, Math.PI * 2);
            ctx.fillStyle = hGrad;
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        } else {
            drawBlobs(ctx, coverP, 1, maxR);
        }

        // ── Sparkles on ink edge ──
        if (burstP < 0.3 && coverP > 0.2) {
            const t = Date.now() * 0.001;
            const edgeR = Math.sqrt(W * W + H * H) * 0.25 * coverP;
            const count = 36;
            for (let i = 0; i < count; i++) {
                const ang = (i / count) * Math.PI * 2 + t * 0.2;
                const jitter = Math.sin(t * 2.8 + i * 1.4) * 32;
                const px = W / 2 + Math.cos(ang) * (edgeR + jitter) * 1.45;
                const py = H / 2 + Math.sin(ang) * (edgeR + jitter) * 0.92;
                const alpha = (1 - burstP) * (0.2 + 0.6 * Math.abs(Math.sin(t * 3 + i)));
                ctx.beginPath();
                ctx.arc(px, py, 1.2 + Math.random() * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(110,203,138,${alpha * 0.85})`;
                ctx.fill();
            }
        }

        // ── Burst ring flash ──
        if (burstP > 0 && burstP < 0.6) {
            const ringR = holeR * 1.05;
            const ringAlpha = (1 - burstP / 0.6) * 0.7;
            const ringGrad = ctx.createRadialGradient(W / 2, H / 2, ringR * 0.88, W / 2, H / 2, ringR * 1.08);
            ringGrad.addColorStop(0, `rgba(110,203,138,0)`);
            ringGrad.addColorStop(0.4, `rgba(110,203,138,${ringAlpha})`);
            ringGrad.addColorStop(1, `rgba(110,203,138,0)`);
            ctx.beginPath();
            ctx.arc(W / 2, H / 2, ringR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(110,203,138,${ringAlpha})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawBlobs(ctx, coverP, alphaMultiplier, maxR) {
        SEEDS.forEach((seed, i) => {
            const delay = i === 0 ? 0 : 0.06 + (i / SEEDS.length) * 0.22;
            const localP = clamp((coverP - delay) / (1 - delay), 0, 1);
            const ep = ease(localP);
            const r = ep * maxR;
            if (r <= 0) return;

            const cx = seed.x * W;
            const cy = seed.y * H;
            const alpha = alphaMultiplier;

            // Adjusted gradient colors to match main theme darker green/black
            const grad = ctx.createRadialGradient(cx, cy, r * 0.04, cx, cy, r);
            grad.addColorStop(0, `rgba(5,6,5,${alpha})`);
            grad.addColorStop(0.55, `rgba(10,12,10,${alpha * 0.97})`);
            grad.addColorStop(0.82, `rgba(18,28,21,${alpha * 0.65})`);
            grad.addColorStop(1, `rgba(18,28,21,0)`);

            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        });
    }

    // Calculate scroll progress specifically over the #txWrap section
    let lastP = -1;
    let triggered = false;

    function onScroll() {
        // It's possible for offsetTop to change if layout shifts, so check every tick
        const wrapTop = wrap.offsetTop;
        const range = window.innerHeight * 3; // 420vh total height (320vh of scrollable range over sticky)
        const raw = (window.scrollY - wrapTop) / range;
        const p = clamp(raw, 0, 1);

        // Floating label opacity & scale
        const labelPhase = progress01(p, 0.38, 0.5);
        const labelFade = progress01(p, 0.62, 0.72);
        const labelAlpha = clamp(ease(labelPhase) - ease(labelFade), 0, 1);
        flLabel.style.opacity = labelAlpha;

        const labelScale = 0.8 + ease(labelPhase) * 0.2;
        flLabel.style.transform = `translate(-50%, -50%) scale(${labelScale})`;

        // Trigger CSS reveals inside s2 when hole fully opens
        if (p > 0.72 && !triggered) {
            triggered = true;
            s2.classList.add('go');
        } else if (p <= 0.72 && triggered) {
            triggered = false;
            s2.classList.remove('go');
        }

        lastP = p;
        requestAnimationFrame(() => drawInk(p));
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Keep sparkles alive
    (function loop() {
        if (lastP > 0.02 && lastP < 0.98) drawInk(lastP);
        requestAnimationFrame(loop);
    })();

    onScroll();
})();

// ── Make Glass Widgets Draggable ──────────────────────────────
(function initDraggableWidgets() {
    const widgets = document.querySelectorAll('.glass-float');

    widgets.forEach(widget => {
        let isDragging = false;
        let hasMoved = false; // To distinguish between drag and simple click
        let startX, startY, initialLeft, initialTop;

        // Add visual cue
        widget.style.cursor = 'grab';

        widget.addEventListener('mousedown', (e) => {
            isDragging = true;
            hasMoved = false;
            widget.style.cursor = 'grabbing';
            widget.style.transition = 'none'; // remove transition for smooth drag

            // Bring to front
            widgets.forEach(w => w.style.zIndex = '10');
            widget.style.zIndex = '20';

            // Convert right/bottom to left/top to avoid conflicts during drag
            const rect = widget.getBoundingClientRect();
            const parentRect = widget.parentElement.getBoundingClientRect();

            widget.style.left = (rect.left - parentRect.left) + 'px';
            widget.style.top = (rect.top - parentRect.top) + 'px';
            widget.style.right = 'auto';
            widget.style.bottom = 'auto';

            startX = e.clientX;
            startY = e.clientY;
            initialLeft = parseFloat(widget.style.left);
            initialTop = parseFloat(widget.style.top);

            e.preventDefault(); // prevent text selection
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            // If mouse moves more than 2px, consider it a drag so we don't trigger flip on release
            if (Math.abs(e.clientX - startX) > 2 || Math.abs(e.clientY - startY) > 2) {
                hasMoved = true;
            }

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            widget.style.left = (initialLeft + dx) + 'px';
            widget.style.top = (initialTop + dy) + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                widget.style.cursor = 'grab';
                widget.style.transition = ''; // restore original transitions if any

                // We removed the widget flip logic here. 
                // Widgets are now just draggable, not flippable.
            }
        });
    });
})();

// ── Glass Dashboard Main Panel Flip ──────────────────────────────
(function initDashboardFlip() {
    const dashboardInner = document.querySelector('.glass-main-inner');
    const dashboardPanel = document.querySelector('.glass-main-panel');

    if (dashboardInner && dashboardPanel) {
        dashboardInner.addEventListener('click', () => {
            dashboardPanel.classList.toggle('is-flipped');
        });
    }
})();

// ── Mobile Service Card Accordion ────────────────────────────────
(function initMobileAccordion() {
    const MOBILE_BREAKPOINT = 768;

    function isMobile() {
        return window.innerWidth <= MOBILE_BREAKPOINT;
    }

    const items = document.querySelectorAll('.svc-compact-item');
    if (!items.length) return;

    function toggleAccordion(item) {
        if (!isMobile()) return;

        const isOpen = item.classList.contains('accordion-open');

        // Close all items first (accordion behavior: one open at a time)
        items.forEach(i => i.classList.remove('accordion-open'));

        // If it wasn't open, open it
        if (!isOpen) {
            item.classList.add('accordion-open');
            
            // Optional: Smooth scroll the opened item into better view
            setTimeout(() => {
                const rect = item.getBoundingClientRect();
                const offset = 100; // room for top nav
                if (rect.top < offset || rect.bottom > window.innerHeight) {
                    window.scrollBy({ top: rect.top - offset, behavior: 'smooth' });
                }
            }, 350);
        }
    }

    // Initialize toggle for each item
    items.forEach((item, index) => {
        // Open first item by default on mobile for better visibility
        if (index === 0 && isMobile()) {
            item.classList.add('accordion-open');
        }

        // Add click listener
        item.addEventListener('click', (e) => {
            // If user clicked a link inside, let it happen
            if (e.target.tagName.toLowerCase() === 'a' || e.target.closest('a')) return;
            
            toggleAccordion(item);
        });
    });

    // Handle window resize (e.g. rotation)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!isMobile()) {
                // Clear accordion state on desktop
                items.forEach(i => i.classList.remove('accordion-open'));
            } else {
                // Ensure at least one is open if none are
                const anyOpen = Array.from(items).some(i => i.classList.contains('accordion-open'));
                if (!anyOpen) items[0].classList.add('accordion-open');
            }
        }, 200);
    });
})();
