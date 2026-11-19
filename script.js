document.addEventListener('DOMContentLoaded', () => {
  // 1. 頂部閱讀進度條與章節導覽高亮
  const progressBar = document.getElementById('progressBar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;

    // 更新目前章節導覽列高亮
    let currentId = 'intro';
    sections.forEach(sec => {
      const top = sec.offsetTop - 240;
      if (scrollTop >= top) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  });

  // 2. Scrollytelling：監聽右側文字卡片滾動，切換左側寫實分格畫面
  const stepCards = document.querySelectorAll('.step-card');

  const stepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const targetStep = entry.target.getAttribute('data-target');
          const parentSection = entry.target.closest('.scrolly-section');

          // 標記當前文字卡
          parentSection.querySelectorAll('.step-card').forEach(card => {
            card.classList.remove('is-active');
          });
          entry.target.classList.add('is-active');

          // 切換對應的左側分格卡
          parentSection.querySelectorAll('.stage-card').forEach((stageCard) => {
            if (stageCard.getAttribute('data-step') === targetStep) {
              stageCard.classList.add('active');
            } else {
              stageCard.classList.remove('active');
            }
          });
        }
      });
    },
    {
      root: null,
      rootMargin: '-35% 0px -35% 0px',
      threshold: 0.05
    }
  );

  stepCards.forEach((card) => stepObserver.observe(card));

  // 3. 進場淡入動畫 (Reveal on Scroll + 滾動保底顯示)
  const revealElements = document.querySelectorAll('.reveal-up');

  function revealVisibleElements() {
    const triggerBottom = window.innerHeight * 0.98;
    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= triggerBottom) {
        el.classList.add('visible');
      }
    });
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px 80px 0px',
        threshold: 0.01
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  window.addEventListener('scroll', revealVisibleElements, { passive: true });
  window.addEventListener('resize', revealVisibleElements, { passive: true });
  revealVisibleElements();

 // 4. 災難傷亡數據滾動計數動畫（含滾動保底，確保 32 人與 321 人必定顯示）
  const counters = document.querySelectorAll('.counter');
  const animatedCounters = new WeakSet();

  function runCounter(el) {
    if (animatedCounters.has(el)) return;
    animatedCounters.add(el);

    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 1000;
    const startTime = performance.now();

    const updateCounter = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(easeOut * target);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(updateCounter);
  }

  function checkCountersInView() {
    counters.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.05 && rect.bottom > -50) {
        runCounter(el);
      }
    });
  }

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
            runCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01 }
    );
    counters.forEach((counter) => counterObserver.observe(counter));
  }

  window.addEventListener('scroll', checkCountersInView, { passive: true });
  checkCountersInView();

  // 5. 背景災難灰燼與火花粒子特效 (HTML5 Canvas)
  const canvas = document.getElementById('emberCanvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2.4 + 0.6;
      this.speedY = -(Math.random() * 0.65 + 0.2);
      this.speedX = (Math.random() - 0.5) * 0.45;
      this.alpha = Math.random() * 0.55 + 0.15;
      // 混合火星橘紅與灰白色塵埃
      this.isEmber = Math.random() < 0.35;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset(false);
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      if (this.isEmber) {
        ctx.fillStyle = `rgba(217, 78, 30, ${this.alpha})`;
      } else {
        ctx.fillStyle = `rgba(180, 175, 168, ${this.alpha * 0.6})`;
      }
      ctx.fill();
    }
  }

  const particleCount = Math.min(Math.floor(window.innerWidth / 22), 65);
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }

  animateParticles();
  // 6. 可縮放與拖曳平移的高雄氣爆影響範圍地圖
  const panStage = document.getElementById('mapPanStage');
  const realScaleSvg = document.getElementById('realScaleSvg');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const zoomResetBtn = document.getElementById('zoomResetBtn');
  const zoomReadout = document.getElementById('zoomReadout');

  if (panStage && realScaleSvg) {
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const MIN_SCALE = 0.75;
    const MAX_SCALE = 3.5;

    function applyTransform() {
      realScaleSvg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      if (zoomReadout) {
        zoomReadout.textContent = `${Math.round(scale * 100)}%`;
      }
    }

    function setZoom(nextScale) {
      scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
      if (scale === 1) {
        translateX = 0;
        translateY = 0;
      }
      applyTransform();
    }

    zoomInBtn?.addEventListener('click', () => setZoom(scale + 0.25));
    zoomOutBtn?.addEventListener('click', () => setZoom(scale - 0.25));
    zoomResetBtn?.addEventListener('click', () => {
      scale = 1;
      translateX = 0;
      translateY = 0;
      applyTransform();
    });

    // 滑鼠滾輪縮放
    panStage.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.18 : -0.18;
        setZoom(scale + delta);
      },
      { passive: false }
    );

    // 滑鼠按住拖曳
    panStage.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      applyTransform();
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // 觸控裝置單指拖曳
    panStage.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length === 1) {
          isDragging = true;
          startX = e.touches[0].clientX - translateX;
          startY = e.touches[0].clientY - translateY;
        }
      },
      { passive: true }
    );

    panStage.addEventListener(
      'touchmove',
      (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        translateX = e.touches[0].clientX - startX;
        translateY = e.touches[0].clientY - startY;
        applyTransform();
      },
      { passive: true }
    );

    panStage.addEventListener('touchend', () => {
      isDragging = false;
    });
  }
