/**
 * 60 FPS Interactive HTML5 Canvas Weather FX Engine
 * Renders high-performance particle physics for Rain, Snow, Clouds, Sun Glow, and Thunderstorms
 */

export class WeatherCanvasEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.condition = 'Clear'; // Default: Clear, Clouds, Rain, Snow, Thunderstorm
    this.particles = [];
    this.splashes = [];
    this.clouds = [];
    this.animFrameId = null;
    this.lastTime = performance.now();
    this.lightningTimer = 0;
    this.lightningAlpha = 0;

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Generate initial volumetric clouds
    this.initClouds();

    // Start render loop
    this.loop = this.loop.bind(this);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  resizeCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  setCondition(condition) {
    if (this.condition === condition) return;
    this.condition = condition || 'Clear';
    this.particles = [];
    this.splashes = [];

    if (this.condition === 'Rain' || this.condition === 'Thunderstorm') {
      const count = this.condition === 'Thunderstorm' ? 250 : 160;
      for (let i = 0; i < count; i++) {
        this.particles.push(this.createRaindrop());
      }
    } else if (this.condition === 'Snow') {
      for (let i = 0; i < 120; i++) {
        this.particles.push(this.createSnowflake());
      }
    }
  }

  initClouds() {
    this.clouds = [];
    for (let i = 0; i < 6; i++) {
      this.clouds.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.4),
        radius: 80 + Math.random() * 120,
        speed: 0.2 + Math.random() * 0.4,
        alpha: 0.08 + Math.random() * 0.12
      });
    }
  }

  createRaindrop() {
    return {
      x: Math.random() * (this.width + 100) - 50,
      y: Math.random() * this.height,
      length: 15 + Math.random() * 25,
      speed: 12 + Math.random() * 12,
      opacity: 0.3 + Math.random() * 0.5,
      width: 1 + Math.random() * 1.5
    };
  }

  createSnowflake() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: 2 + Math.random() * 4,
      speedY: 0.8 + Math.random() * 1.5,
      speedX: -0.5 + Math.random() * 1.0,
      step: Math.random() * Math.PI * 2,
      stepSize: 0.02 + Math.random() * 0.02,
      opacity: 0.4 + Math.random() * 0.5
    };
  }

  createSplash(x, y) {
    for (let i = 0; i < 4; i++) {
      this.splashes.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 1,
        life: 1.0,
        decay: 0.08 + Math.random() * 0.05
      });
    }
  }

  loop(timestamp) {
    const delta = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render weather effect layers
    if (this.condition === 'Clear') {
      this.renderSolarGlow();
    }

    this.renderClouds();

    if (this.condition === 'Rain' || this.condition === 'Thunderstorm') {
      this.updateAndRenderRain();
    } else if (this.condition === 'Snow') {
      this.updateAndRenderSnow();
    }

    if (this.condition === 'Thunderstorm') {
      this.updateAndRenderLightning();
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  }

  renderSolarGlow() {
    const ctx = this.ctx;
    const centerX = this.width * 0.8;
    const centerY = this.height * 0.2;

    const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 400);
    gradient.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
    gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.08)');
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  renderClouds() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';

    for (let cloud of this.clouds) {
      cloud.x += cloud.speed;
      if (cloud.x - cloud.radius > this.width) {
        cloud.x = -cloud.radius;
      }

      ctx.save();
      ctx.globalAlpha = cloud.alpha;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.radius * 0.5, cloud.y - cloud.radius * 0.3, cloud.radius * 0.7, 0, Math.PI * 2);
      ctx.arc(cloud.x - cloud.radius * 0.5, cloud.y - cloud.radius * 0.2, cloud.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  updateAndRenderRain() {
    const ctx = this.ctx;

    for (let p of this.particles) {
      p.y += p.speed;
      p.x -= 2; // Wind drift slant

      if (p.y > this.height - 20) {
        if (Math.random() < 0.3) {
          this.createSplash(p.x, this.height - 10);
        }
        p.y = -20;
        p.x = Math.random() * (this.width + 100) - 50;
      }

      ctx.save();
      ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity})`;
      ctx.lineWidth = p.width;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 4, p.y + p.length);
      ctx.stroke();
      ctx.restore();
    }

    // Render splash ripples
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;

      if (s.life <= 0) {
        this.splashes.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.fillStyle = `rgba(186, 230, 253, ${s.life * 0.6})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  updateAndRenderSnow() {
    const ctx = this.ctx;

    for (let p of this.particles) {
      p.step += p.stepSize;
      p.x += Math.sin(p.step) * p.speedX;
      p.y += p.speedY;

      if (p.y > this.height) {
        p.y = -10;
        p.x = Math.random() * this.width;
      }

      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  updateAndRenderLightning() {
    if (Math.random() < 0.008 && this.lightningAlpha <= 0) {
      this.lightningAlpha = 0.8;
    }

    if (this.lightningAlpha > 0) {
      this.ctx.save();
      this.ctx.fillStyle = `rgba(192, 132, 252, ${this.lightningAlpha})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();

      this.lightningAlpha -= 0.05;
    }
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}
