(() => {
  const canvas = document.getElementById('ball-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const playButton = document.getElementById('ball-play-toggle');
  const resetButton = document.getElementById('ball-reset');
  const gravityInput = document.getElementById('ball-gravity');
  const speedInput = document.getElementById('ball-speed');
  const trailInput = document.getElementById('ball-trails');
  const gravityValue = document.getElementById('ball-gravity-value');
  const speedValue = document.getElementById('ball-speed-value');
  const trailValue = document.getElementById('ball-trails-value');
  const statusValue = document.getElementById('ball-status');
  const bounceValue = document.getElementById('ball-bounces');

  const state = {
    paused: false,
    gravity: Number(gravityInput?.value ?? 1),
    speed: Number(speedInput?.value ?? 1),
    trailLength: Number(trailInput?.value ?? 24),
    bounceCount: 0,
    lastFrame: 0,
    resizeQueued: false,
  };

  const box = {
    width: 4.4,
    height: 2.8,
    depth: 4.4,
  };

  const ball = {
    radius: 0.24,
    position: { x: 0, y: 1.95, z: -0.65 },
    velocity: { x: 1.05, y: 0.18, z: 0.76 },
  };

  const trail = [];

  const camera = {
    yaw: -0.65,
    pitch: 0.55,
    distance: 7.8,
  };

  const palette = {
    skyTop: '#10182f',
    skyBottom: '#05070f',
    grid: 'rgba(255,255,255,0.08)',
    wall: 'rgba(255,255,255,0.18)',
    wallStrong: 'rgba(255,255,255,0.38)',
    shadow: 'rgba(0,0,0,0.28)',
    glow: 'rgba(126, 211, 252, 0.18)',
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function randomVelocity() {
    const angle = Math.random() * Math.PI * 2;
    const horizontal = 0.9 + Math.random() * 0.65;
    return {
      x: Math.cos(angle) * horizontal,
      y: 0.8 + Math.random() * 0.85,
      z: Math.sin(angle) * horizontal * 0.85,
    };
  }

  function resetBall() {
    ball.position = {
      x: (Math.random() - 0.5) * 1.5,
      y: 1.75 + Math.random() * 0.55,
      z: (Math.random() - 0.5) * 1.3,
    };
    ball.velocity = randomVelocity();
    trail.length = 0;
    state.bounceCount = 0;
    syncMetrics();
  }

  function setPaused(nextPaused) {
    state.paused = nextPaused;
    if (playButton) {
      playButton.textContent = state.paused ? 'Resume' : 'Pause';
      playButton.setAttribute('aria-pressed', String(state.paused));
    }
    syncMetrics();
  }

  function syncMetrics() {
    if (gravityValue) gravityValue.textContent = state.gravity.toFixed(2);
    if (speedValue) speedValue.textContent = state.speed.toFixed(2);
    if (trailValue) trailValue.textContent = String(state.trailLength);
    if (bounceValue) bounceValue.textContent = String(state.bounceCount);
    if (statusValue) {
      statusValue.textContent = state.paused ? 'Paused' : 'Live';
    }
  }

  function resizeCanvas() {
    const bounds = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(bounds.width * dpr));
    const height = Math.max(1, Math.round(bounds.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function queueResize() {
    if (state.resizeQueued) return;
    state.resizeQueued = true;
    window.requestAnimationFrame(() => {
      state.resizeQueued = false;
      resizeCanvas();
    });
  }

  function worldToCamera(point) {
    const centered = {
      x: point.x,
      y: point.y - box.height / 2,
      z: point.z,
    };

    const cosYaw = Math.cos(camera.yaw);
    const sinYaw = Math.sin(camera.yaw);
    const cosPitch = Math.cos(camera.pitch);
    const sinPitch = Math.sin(camera.pitch);

    const x1 = centered.x * cosYaw - centered.z * sinYaw;
    const z1 = centered.x * sinYaw + centered.z * cosYaw;
    const y1 = centered.y * cosPitch - z1 * sinPitch;
    const z2 = centered.y * sinPitch + z1 * cosPitch;

    return { x: x1, y: y1, z: z2 };
  }

  function project(point, scaleMultiplier = 1) {
    const cameraSpace = worldToCamera(point);
    const denominator = camera.distance - cameraSpace.z;
    const safeDenominator = Math.max(0.9, denominator);
    const perspective = 1 / safeDenominator;
    const sceneScale = Math.min(canvas.width, canvas.height) * 0.23 * scaleMultiplier;
    return {
      x: canvas.width * 0.5 + cameraSpace.x * perspective * sceneScale,
      y: canvas.height * 0.56 - cameraSpace.y * perspective * sceneScale,
      depth: cameraSpace.z,
      perspective,
    };
  }

  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, palette.skyTop);
    sky.addColorStop(1, palette.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const glow = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.36,
      canvas.width * 0.02,
      canvas.width * 0.5,
      canvas.height * 0.36,
      canvas.width * 0.45,
    );
    glow.addColorStop(0, palette.glow);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawWireframe() {
    const corners = [
      { x: -box.width / 2, y: 0, z: -box.depth / 2 },
      { x: box.width / 2, y: 0, z: -box.depth / 2 },
      { x: box.width / 2, y: 0, z: box.depth / 2 },
      { x: -box.width / 2, y: 0, z: box.depth / 2 },
      { x: -box.width / 2, y: box.height, z: -box.depth / 2 },
      { x: box.width / 2, y: box.height, z: -box.depth / 2 },
      { x: box.width / 2, y: box.height, z: box.depth / 2 },
      { x: -box.width / 2, y: box.height, z: box.depth / 2 },
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    ctx.save();
    ctx.lineWidth = Math.max(1.25, canvas.width / 900);
    for (const [startIndex, endIndex] of edges) {
      const start = project(corners[startIndex]);
      const end = project(corners[endIndex]);
      ctx.strokeStyle = startIndex < 4 ? palette.wall : palette.wallStrong;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawGrid() {
    const segments = 8;
    ctx.save();
    ctx.lineWidth = Math.max(1, canvas.width / 1100);
    ctx.strokeStyle = palette.grid;

    for (let i = -segments; i <= segments; i += 1) {
      const t = i / segments;
      const x = (box.width / 2) * t;
      const z = (box.depth / 2) * t;
      const startX = project({ x, y: 0, z: -box.depth / 2 });
      const endX = project({ x, y: 0, z: box.depth / 2 });
      const startZ = project({ x: -box.width / 2, y: 0, z });
      const endZ = project({ x: box.width / 2, y: 0, z });

      ctx.beginPath();
      ctx.moveTo(startX.x, startX.y);
      ctx.lineTo(endX.x, endX.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(startZ.x, startZ.y);
      ctx.lineTo(endZ.x, endZ.y);
      ctx.stroke();
    }

    const axis = project({ x: 0, y: 0, z: 0 });
    const originShadow = project({ x: 0, y: 0.01, z: 0 });
    ctx.strokeStyle = 'rgba(240, 165, 0, 0.35)';
    ctx.beginPath();
    ctx.moveTo(axis.x, axis.y);
    ctx.lineTo(originShadow.x, originShadow.y - 0.0001);
    ctx.stroke();
    ctx.restore();
  }

  function drawShadow() {
    const shadowPoint = project({ x: ball.position.x, y: 0.03, z: ball.position.z });
    const height = clamp(ball.position.y / box.height, 0, 1);
    const radius = ball.radius * shadowPoint.perspective * Math.min(canvas.width, canvas.height) * 0.22;
    ctx.save();
    ctx.translate(shadowPoint.x, shadowPoint.y + 1);
    ctx.scale(1 + (1 - height) * 0.55, 0.55 + (1 - height) * 0.18);
    ctx.fillStyle = palette.shadow;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.08, radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawTrail() {
    const maxTrail = clamp(state.trailLength, 0, 120);
    if (maxTrail <= 0) return;

    const samples = trail.slice(-maxTrail);
    samples.forEach((sample, index) => {
      const t = (index + 1) / samples.length;
      const projected = project(sample);
      const radius = ball.radius * projected.perspective * Math.min(canvas.width, canvas.height) * 0.22;
      const alpha = 0.08 + t * 0.34;
      const fill = `rgba(125, 211, 252, ${alpha})`;
      ctx.save();
      ctx.translate(projected.x, projected.y);
      ctx.beginPath();
      ctx.fillStyle = fill;
      ctx.arc(0, 0, radius * (0.5 + t * 0.55), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawBall() {
    const projected = project(ball.position);
    const radius = ball.radius * projected.perspective * Math.min(canvas.width, canvas.height) * 0.22;
    const gradient = ctx.createRadialGradient(
      projected.x - radius * 0.35,
      projected.y - radius * 0.45,
      radius * 0.18,
      projected.x,
      projected.y,
      radius * 1.35,
    );
    gradient.addColorStop(0, '#fff6c9');
    gradient.addColorStop(0.32, '#ffc94f');
    gradient.addColorStop(0.68, '#f08c00');
    gradient.addColorStop(1, '#8b4a00');

    ctx.save();
    ctx.translate(projected.x, projected.y);
    ctx.shadowColor = 'rgba(240, 165, 0, 0.45)';
    ctx.shadowBlur = radius * 0.65;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    const highlight = ctx.createRadialGradient(
      -radius * 0.32,
      -radius * 0.38,
      radius * 0.05,
      -radius * 0.16,
      -radius * 0.18,
      radius * 0.95,
    );
    highlight.addColorStop(0, 'rgba(255,255,255,0.78)');
    highlight.addColorStop(0.25, 'rgba(255,255,255,0.24)');
    highlight.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(-radius * 0.18, -radius * 0.18, radius * 0.88, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = Math.max(1, radius * 0.07);
    ctx.strokeStyle = 'rgba(255, 240, 190, 0.25)';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawHUD() {
    const pad = Math.max(12, canvas.width * 0.02);
    ctx.save();
    ctx.fillStyle = 'rgba(6, 10, 20, 0.55)';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(pad, pad, canvas.width * 0.27, canvas.height * 0.14, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f7f7fb';
    ctx.font = '600 15px Inter, system-ui, sans-serif';
    ctx.fillText('3D bounce lab', pad + 16, pad + 28);
    ctx.fillStyle = 'rgba(247,247,251,0.72)';
    ctx.font = '13px Inter, system-ui, sans-serif';
    ctx.fillText(`gravity ${state.gravity.toFixed(2)} · speed ${state.speed.toFixed(2)} · trails ${state.trailLength}`, pad + 16, pad + 52);
    ctx.fillText(`${state.paused ? 'paused' : 'live'} · ${state.bounceCount} wall/floor bounces`, pad + 16, pad + 74);
    ctx.restore();
  }

  function render() {
    drawBackground();
    drawGrid();
    drawWireframe();
    drawShadow();
    drawTrail();
    drawBall();
    drawHUD();
  }

  function step(deltaSeconds) {
    if (state.paused) return;

    const dt = deltaSeconds * state.speed;
    const gravity = 7.5 * state.gravity;
    const restitution = 0.84;
    const friction = 0.986;

    ball.velocity.y -= gravity * dt;
    ball.position.x += ball.velocity.x * dt;
    ball.position.y += ball.velocity.y * dt;
    ball.position.z += ball.velocity.z * dt;

    const minX = -box.width / 2 + ball.radius;
    const maxX = box.width / 2 - ball.radius;
    const minY = ball.radius;
    const maxY = box.height - ball.radius;
    const minZ = -box.depth / 2 + ball.radius;
    const maxZ = box.depth / 2 - ball.radius;

    if (ball.position.x < minX) {
      ball.position.x = minX;
      ball.velocity.x = Math.abs(ball.velocity.x) * restitution;
      ball.velocity.z *= friction;
      state.bounceCount += 1;
    } else if (ball.position.x > maxX) {
      ball.position.x = maxX;
      ball.velocity.x = -Math.abs(ball.velocity.x) * restitution;
      ball.velocity.z *= friction;
      state.bounceCount += 1;
    }

    if (ball.position.y < minY) {
      ball.position.y = minY;
      ball.velocity.y = Math.abs(ball.velocity.y) * restitution;
      ball.velocity.x *= 0.992;
      ball.velocity.z *= 0.992;
      state.bounceCount += 1;
    } else if (ball.position.y > maxY) {
      ball.position.y = maxY;
      ball.velocity.y = -Math.abs(ball.velocity.y) * restitution;
      state.bounceCount += 1;
    }

    if (ball.position.z < minZ) {
      ball.position.z = minZ;
      ball.velocity.z = Math.abs(ball.velocity.z) * restitution;
      ball.velocity.x *= friction;
      state.bounceCount += 1;
    } else if (ball.position.z > maxZ) {
      ball.position.z = maxZ;
      ball.velocity.z = -Math.abs(ball.velocity.z) * restitution;
      ball.velocity.x *= friction;
      state.bounceCount += 1;
    }

    ball.velocity.x *= 0.9995;
    ball.velocity.z *= 0.9995;
    ball.velocity.y *= 0.9992;

    trail.push({ x: ball.position.x, y: ball.position.y, z: ball.position.z });
    const cap = Math.max(state.trailLength + 20, 40);
    if (trail.length > cap) {
      trail.splice(0, trail.length - cap);
    }
  }

  function frame(timestamp) {
    if (!state.lastFrame) state.lastFrame = timestamp;
    const deltaSeconds = Math.min(0.033, (timestamp - state.lastFrame) / 1000);
    state.lastFrame = timestamp;

    step(deltaSeconds);
    render();
    syncMetrics();
    window.requestAnimationFrame(frame);
  }

  function attachSlider(input, handler) {
    if (!input) return;
    input.addEventListener('input', () => {
      handler(Number(input.value));
      syncMetrics();
    });
  }

  attachSlider(gravityInput, (value) => {
    state.gravity = value;
  });
  attachSlider(speedInput, (value) => {
    state.speed = value;
  });
  attachSlider(trailInput, (value) => {
    state.trailLength = value;
  });

  playButton?.addEventListener('click', () => setPaused(!state.paused));
  resetButton?.addEventListener('click', () => {
    resetBall();
    setPaused(false);
  });

  window.addEventListener('keydown', (event) => {
    if (event.defaultPrevented) return;
    if (event.code === 'Space') {
      event.preventDefault();
      setPaused(!state.paused);
    }
    if (event.key.toLowerCase() === 'r') {
      resetBall();
      setPaused(false);
    }
  });

  window.addEventListener('resize', queueResize, { passive: true });
  queueResize();
  resetBall();
  setPaused(false);
  syncMetrics();
  window.requestAnimationFrame(frame);
})();
