const KONTAK_TIM = "hasbywiraalmuflih9@gmail.com";

(() => {
  "use strict";

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const media = (query) => window.matchMedia(query).matches;
  const DESKTOP = "(min-width: 1024px)";
  // Animasi berulang hanya jalan saat terlihat.
  const whileVisible = (trigger) => ({ trigger, start: "top bottom", end: "bottom top", toggleActions: "play pause resume pause" });
  const once = (trigger, start = "top 85%") => ({ trigger, start, once: true });
  const FINE = "(hover: hover) and (pointer: fine)";
  const MODE = ["#4C7DFF", "#FC9D33", "#2BB673", "#E5484D", "#9B6BFF", "#218DAE"]; // warna moda

  // Selalu jalan, juga tanpa pustaka.
  initNav();
  initScrollChrome();
  initKontak();
  initBgPhoto();
  const video = initVideo();

  // Animasi hanya bila gerak diizinkan & pustaka termuat.
  const { gsap, ScrollTrigger } = window;
  if (!root.classList.contains("anim") || !gsap || !ScrollTrigger) {
    root.classList.remove("anim", "intro-pending");
    return;
  }
  root.classList.add("anim-ready");
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });

  const lenis = initLenis();
  heroIn(runIntro() ? 1.1 : 0.15);
  follow($$(".btn--primary, .btn--light"), (x, y) => ({ x: x * 16, y: y * 16 })); // magnetis
  // Pemicu scroll dibuat setelah font siap, urut sesuai halaman.
  Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 1500))]).then(() => {
    scrollScenes();
    ScrollTrigger.sort();
  });

  // Menu ringkas untuk layar di bawah 1024px.
  function initNav() {
    const nav = $(".nav");
    const toggle = nav && $(".nav__toggle", nav);
    if (!toggle) return;

    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    };

    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    $$(".nav__links a", nav).forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // Bilah progres; kapsul navigasi mengecil saat scroll turun.
  function initScrollChrome() {
    const bar = $(".scroll-progress");
    const header = $(".site-header");
    let lastY = window.scrollY;
    let queued = false;

    const update = () => {
      queued = false;
      const y = window.scrollY;
      const max = root.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      if (Math.abs(y - lastY) > 6) {
        header.classList.toggle("is-compact", y > lastY && y > 160);
        lastY = y;
      }
    };

    window.addEventListener("scroll", () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  // Kontak: mailto bila berisi email.
  function initKontak() {
    $$("[data-kontak]").forEach((el) => {
      el.textContent = KONTAK_TIM;
      if (!KONTAK_TIM.includes("@")) return;
      const link = document.createElement("a");
      link.className = el.className;
      link.href = `mailto:${KONTAK_TIM}`;
      link.textContent = KONTAK_TIM;
      el.replaceWith(link);
    });
  }

  // Foto latar muncul setelah siap; bila tak ada, latar tetap polos.
  function initBgPhoto() {
    const layer = $(".bg-photo");
    if (!layer) return;
    const src = media("(max-width: 900px)") ? "assets/jakarta-bg-mobile.webp" : "assets/jakarta-bg.webp";
    const img = new Image();
    img.src = src;
    img.decode().then(() => {
      layer.style.backgroundImage = `url("${src}")`;
      layer.classList.add("is-loaded");
    }).catch(() => {});
  }

  // Video: tombol putar di atas poster.
  function initVideo() {
    const api = { box: $("[data-video]"), onStart: null };
    const player = api.box && $("video", api.box);
    const template = document.getElementById("video-play-template");
    if (!player || !template) return api;

    const fallback = $(".video__fallback", api.box);
    const button = template.content.firstElementChild.cloneNode(true);

    // Gagal diputar: pesan + tautan unduh.
    const source = $("source", player);
    if (source && fallback) {
      source.addEventListener("error", () => {
        player.remove();
        button.remove();
        fallback.hidden = false;
      });
    }

    button.addEventListener("click", () => {
      button.remove();
      player.controls = true;
      player.focus();
      player.play().catch(() => {});
      if (api.onStart) api.onStart();
    }, { once: true });

    player.controls = false;
    api.box.append(button);
    return api;
  }

  // Scroll halus; jangkar diberi offset navigasi.
  function initLenis() {
    if (!window.Lenis) return null;
    const instance = new window.Lenis({ lerp: 0.1 });
    instance.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => instance.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      const hash = link && link.getAttribute("href");
      if (!hash || hash.length < 2 || link.classList.contains("skip-link")) return;
      const target = $(hash);
      if (!target) return;
      event.preventDefault();
      instance.scrollTo(hash === "#top" ? 0 : target, { offset: -($(".site-header").offsetHeight - 8) });
      history.replaceState(null, "", hash);
      if (hash !== "#top") {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
    return instance;
  }

  // Intro sekali per sesi (maks 1,6 dtk), bisa dilewati.
  function runIntro() {
    if (!root.classList.contains("intro-pending")) return false;
    try { sessionStorage.setItem("sr-intro", "1"); } catch (err) { /* diblokir */ }

    const intro = document.createElement("div");
    intro.className = "intro";
    intro.innerHTML =
      '<div class="intro__stage"><span class="logo-box"><img src="assets/logotransparan.png" alt="" width="1080" height="1350"></span></div>' +
      '<span class="intro__skip label">Klik atau tekan tombol apa pun untuk melewati</span>';
    const ribbons = document.createElement("div");
    ribbons.className = "ribbons";
    ribbons.innerHTML = "<i></i>".repeat(6);
    [intro, ribbons].forEach((el) => el.setAttribute("aria-hidden", "true"));
    document.body.append(intro, ribbons);
    root.classList.remove("intro-pending");
    if (lenis) lenis.stop();

    const skip = () => tl.progress(1);
    const tl = gsap.timeline({
      onComplete: () => {
        intro.remove();
        ribbons.remove();
        removeEventListener("keydown", skip);
        if (lenis) lenis.start();
      },
    });
    tl.fromTo($(".logo-box", intro),
      { clipPath: "inset(-20% 100% -20% 0%)", scale: 0.92 },
      { clipPath: "inset(-20% 0% -20% 0%)", scale: 1, duration: 0.6 })
      .add(() => burst($(".intro__stage", intro), 0.85), 0.3)
      // Pita menutupi layar: intro disembunyikan.
      .fromTo(ribbons, { xPercent: -100 }, { xPercent: 50, duration: 0.7, ease: "none" }, 0.9)
      .set(intro, { autoAlpha: 0 }, 1.25);

    intro.addEventListener("click", skip);
    addEventListener("keydown", skip);
    return true;
  }

  // Ledakan logo (design.md §6).
  function burst(host, size = 1) {
    const wrap = document.createElement("span");
    wrap.className = "burst";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = '<i class="burst__flash"></i>' + '<i class="burst__ring"></i>'.repeat(3) + '<i class="burst__dot"></i>'.repeat(18);
    host.append(wrap);
    const dots = $$(".burst__dot", wrap);
    dots.forEach((dot, i) => (dot.style.background = MODE[i % MODE.length]));
    const angle = (i) => (i / dots.length) * Math.PI * 2;
    const dist = (i) => (150 + (i % 3) * 55) * size;

    return gsap.timeline({ onComplete: () => wrap.remove() })
      .fromTo($(".burst__flash", wrap), { scale: 0.3, opacity: 1 }, { scale: 2.6, opacity: 0, duration: 0.8, ease: "power2.out" })
      .fromTo($$(".burst__ring", wrap), { scale: 0.3, opacity: 0.8 }, { scale: (i) => (2 + i) * size, opacity: 0, duration: 1.1, stagger: 0.12 }, 0)
      .fromTo(dots, { x: 0, y: 0, scale: 1.2, opacity: 1 }, {
        x: (i) => Math.cos(angle(i)) * dist(i),
        y: (i) => Math.sin(angle(i)) * dist(i),
        scale: 0.4, opacity: 0, duration: 1.2,
      }, 0.05);
  }

  // Hero: logo tersapu, tagline per kata, peta tergambar.
  function heroIn(delay) {
    gsap.timeline({ delay })
      .fromTo(".hero__logo-box",
        { clipPath: "inset(-20% 100% -20% 0%)", scale: 0.94 },
        { clipPath: "inset(-20% 0% -20% 0%)", scale: 1, duration: 1.1, ease: "power3.inOut", clearProps: "clipPath,transform" })
      .add(wordsIn($(".hero__tagline")), 0.55)
      .from([$(".hero__lead"), ...$$(".hero__actions .btn")],
        { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, clearProps: "transform,opacity" }, 0.8)
      .fromTo(".hero-lines__path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.4, stagger: 0.15, ease: "power2.inOut" }, 0)
      .from(".hero-lines__stop:not(.is-pulse)", { scale: 0, transformOrigin: "50% 50%", duration: 0.5, stagger: 0.05, ease: "back.out(3)" }, 1.4);

    gsap.to(".hero-lines__group", {
      x: 18, y: -12, duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1, delay: delay + 2.6,
      scrollTrigger: whileVisible(".hero-wrap"),
    });
  }

  // Ikuti kursor: map(x, y) dari posisi -0,5..0,5.
  function follow(els, map) {
    if (!media(FINE)) return;
    els.forEach((el) => {
      let to = null;
      el.addEventListener("pointermove", (event) => {
        const box = el.getBoundingClientRect();
        const values = map((event.clientX - box.left) / box.width - 0.5, (event.clientY - box.top) / box.height - 0.5);
        to = to || Object.keys(values).map((prop) => [prop, gsap.quickTo(el, prop, { duration: 0.5 })]);
        to.forEach(([prop, fn]) => fn(values[prop]));
      });
      el.addEventListener("pointerleave", () => to && to.forEach(([, fn]) => fn(0)));
    });
  }

  // Animasi scroll, urut sesuai halaman (untuk pin).
  function scrollScenes() {
    const mm = gsap.matchMedia();
    const card3d = { rotationX: 22, transformPerspective: 900, transformOrigin: "50% 100%", y: 60 };
    prepCounters();

    // Parallax foto (desktop, maks 8% vh).
    mm.add(DESKTOP, () => {
      gsap.to(".bg-photo", {
        y: () => -0.08 * window.innerHeight, ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: true, invalidateOnRefresh: true },
      });
    });

    // 3. Masalah
    sectionHead("#masalah");
    const stats = $$(".stat");
    enter(stats, ".stats", card3d);
    gsap.timeline({ scrollTrigger: once(".stats", "top 80%") })
      .add($$(".stats .count").map(counter), 0.25)
      .from(".stat__bar", { scaleX: 0, duration: 0.8, stagger: 0.1 }, 0.3)
      .call(() => stats.forEach((el, i) => setTimeout(() => el.classList.add("is-shimmer"), i * 140)), null, 0.5);
    enter(".section__note", ".section__note", { y: 16 });

    // 4. Fitur
    sectionHead("#fitur");
    const features = $$(".feature");
    enter(features, ".bento", card3d);
    follow(features, (x, y) => ({ rotationX: y * -8, rotationY: x * 8, y: -4 })); // miring 3D
    routeCard();

    // 5. Cara kerja
    sectionHead("#cara-kerja");
    arcOpen(".howto");
    mm.add(DESKTOP, pinSteps);
    mm.add("(max-width: 1023px)", () => {
      enter($$(".step"), ".steps");
      enter(".pipeline", ".pipeline", { y: 24 });
    });

    // 6. Video
    sectionHead("#video");
    videoScene();

    // 7-10
    sectionHead("#pengguna");
    enter($$(".persona"), ".personas", { rotationY: (i) => (i ? 16 : -16), transformPerspective: 900 });
    sectionHead("#posisi");
    enter(".compare", ".compare", card3d);
    sectionHead("#peta-jalan");
    roadmapScene();
    enter(".roadmap__note", ".roadmap__note", { y: 12 });
    sectionHead("#tim");
    enter($$(".member"), ".team");
    gsap.from(".member__avatar", {
      scale: 0.3, opacity: 0, duration: 0.7, stagger: 0.08, ease: "back.out(2.5)", delay: 0.3,
      scrollTrigger: once(".team"),
    });

    // 11. Penutup
    arcOpen(".closing");
    wordsIn($(".closing .display"), true).add(() => burst($(".closing__inner"), 1.3), 0.5);
    enter(".closing__actions", ".closing__actions", { y: 24 });
  }

  function sectionHead(sectionSel) {
    const head = $(`${sectionSel} .section__head`);
    if (!head) return;
    wordsIn($(".display", head), true);
    enter($$(".eyebrow, .lead", head), head, { y: 16 });
  }

  // Masuk bertahap; transisi CSS dimatikan selama tween.
  function enter(targets, trigger, vars = {}) {
    const els = gsap.utils.toArray(targets);
    if (!els.length) return;
    gsap.set(els, { transition: "none" });
    gsap.from(els, {
      y: 40, opacity: 0, duration: 0.9, stagger: 0.08, ...vars,
      scrollTrigger: once(trigger),
      onStart: () => gsap.set(els, { willChange: "transform" }),
      onComplete: () => gsap.set(els, { clearProps: "transform,opacity,transition,willChange" }),
    });
  }

  // Kata per kata lalu coretan .hl; dipecah saat terlihat, isi asli dikembalikan.
  function wordsIn(el, onScroll) {
    const tl = gsap.timeline({ paused: true });
    if (!el) return tl;
    if (!onScroll) return split(el, tl);
    gsap.set(el, { opacity: 0 });
    ScrollTrigger.create({
      ...once(el, "top 88%"),
      onEnter: () => {
        gsap.set(el, { opacity: 1 });
        split(el, tl);
      },
    });
    return tl;
  }

  function split(el, tl) {
    const html = el.innerHTML;
    const units = [];
    [...el.childNodes].forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) {
        node.classList.add("w");
        units.push(node);
        return;
      }
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).filter(Boolean).forEach((part) => {
        if (!part.trim()) return frag.append(part); // spasi dibiarkan apa adanya
        const word = document.createElement("span");
        word.className = "w";
        word.textContent = part;
        units.push(word);
        frag.append(word);
      });
      node.replaceWith(frag);
    });
    const marks = $$(".hl", el);
    gsap.set(marks, { "--hl": 0 });
    return tl.from(units, { y: 34, opacity: 0, duration: 0.55, stagger: 0.06 }, 0)
      .to(marks, { "--hl": 1, duration: 0.6, ease: "power2.inOut" }, "-=0.2")
      .call(() => { el.innerHTML = html; })
      .play();
  }

  // Penghitung: desimal Indonesia, berhenti di nilai akhir.
  const format = (el, value) => {
    const decimals = Number(el.dataset.decimals || 0);
    return value.toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };
  function counter(el) {
    const end = parseFloat(el.dataset.count);
    const state = { value: 0 };
    return gsap.to(state, {
      value: end, duration: 1.6, ease: "power2.out",
      onUpdate: () => { el.textContent = format(el, state.value); },
      onComplete: () => { el.textContent = format(el, end); },
    });
  }

  // Kunci lebar angka (digit tak sama lebar): baca semua dulu, baru tulis.
  function prepCounters() {
    const els = $$(".count");
    const widths = els.map((el) => el.offsetWidth);
    els.forEach((el, i) => {
      el.style.width = `${widths[i] + 1}px`;
      el.textContent = format(el, 0);
    });
  }

  // Kartu rute dalam HP: masuk 3D, rute tergambar, lalu melayang.
  function routeCard() {
    const fig = $(".routecard");
    const phone = $(".phone", fig);
    const line = $(".routeline", fig);
    const stops = $$(".routeline__stop", fig);
    gsap.set(line, { "--rail": 0 });
    gsap.set(stops, { "--dot": 0 });

    gsap.timeline({ scrollTrigger: once(fig, "top 75%") })
      .fromTo(phone,
        { y: 80, rotationY: -30, opacity: 0, transformPerspective: 1200 },
        { y: 0, rotationY: media(DESKTOP) ? -9 : 0, opacity: 1, duration: 1.1 })
      .add($$(".count", fig).map(counter), 0.5)
      .to(line, { "--rail": 1, duration: 1.3, ease: "power2.inOut" }, 0.6)
      .to(stops, { "--dot": 1, duration: 0.5, stagger: 0.36, ease: "back.out(3)" }, 0.6)
      .from($$(".badge", fig), { scale: 0.4, opacity: 0, duration: 0.5, stagger: 0.36, ease: "back.out(2.5)", clearProps: "transform,opacity" }, 1.05)
      .add(() => gsap.to(phone, {
        y: -7, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1,
        scrollTrigger: whileVisible(fig),
      }));
  }

  // Lengkung atas blok membuka mengikuti scroll.
  function arcOpen(sel) {
    const el = $(sel);
    const r = getComputedStyle(el).borderTopLeftRadius;
    gsap.fromTo(el,
      { clipPath: "inset(0% 5% 0% 5% round 12px 12px 0px 0px)" },
      {
        clipPath: `inset(0% 0% 0% 0% round ${r} ${r} 0px 0px)`, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "top 40%", scrub: true },
      });
  }

  // Desktop: Cara Kerja di-pin, langkah menyala.
  function pinSteps() {
    const section = $(".howto");
    const steps = $$(".step");
    const nodes = $$(".pipeline__list li");
    if (section.offsetHeight > window.innerHeight) {
      // Layar terlalu pendek: masuk bertahap biasa.
      enter(steps, ".steps");
      return undefined;
    }

    const light = (progress) => {
      const step = Math.min(Math.floor(progress * 3), 2);
      const node = Math.min(Math.floor(progress * 4), 3);
      steps.forEach((el, i) => el.classList.toggle("is-dim", i > step));
      nodes.forEach((el, i) => {
        el.classList.toggle("is-dim", i > node);
        el.classList.toggle("is-active", i === node);
      });
    };
    light(0);
    ScrollTrigger.create({
      trigger: section, start: "top top", end: "+=130%", pin: true,
      onUpdate: (self) => light(self.progress),
    });
    return () => [...steps, ...nodes].forEach((el) => el.classList.remove("is-dim", "is-active"));
  }

  // Video membesar ke tengah; klik memperluas.
  function videoScene() {
    const box = video.box;
    if (!box) return;
    const scrub = gsap.fromTo(box,
      { scale: 0.92, clipPath: "inset(0% round 64px)" },
      {
        scale: 1, clipPath: "inset(0% round 30px)", ease: "none",
        scrollTrigger: { trigger: box, start: "top bottom", end: "center center", scrub: true },
      });
    video.onStart = () => {
      scrub.scrollTrigger.kill();
      gsap.to(box, {
        scale: media(DESKTOP) ? 1.04 : 1,
        clipPath: "inset(0% round 16px)",
        duration: 0.9,
      });
    };
  }

  // Peta jalan: rel terisi, kolom menyala.
  function roadmapScene() {
    const phases = $$(".phase");
    const marks = [0.02, 0.4, 0.75];
    phases.forEach((el) => el.classList.add("is-dim"));
    gsap.fromTo(".roadmap__track", { "--p": 0 }, {
      "--p": 1, ease: "none",
      scrollTrigger: {
        trigger: ".roadmap", start: "top 80%", end: "bottom 65%", scrub: true,
        onUpdate: (self) => phases.forEach((el, i) => el.classList.toggle("is-dim", self.progress < marks[i])),
      },
    });
    gsap.from(".roadmap__here", {
      scale: 0.4, opacity: 0, duration: 0.6, ease: "back.out(3)", delay: 0.4,
      scrollTrigger: once(".roadmap", "top 75%"),
    });
  }
})();
