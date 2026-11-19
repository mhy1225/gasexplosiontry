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

  // 3. 進場淡入動畫 (Reveal on Scroll)
  const revealElements = document.querySelectorAll('.reveal-up');
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // 4. 災難傷亡數據滾動計數動畫
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          const duration = 1400;
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
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

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
});
