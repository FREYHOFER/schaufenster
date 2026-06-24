import * as THREE from 'three';

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function rgbToHex(red, green, blue) {
  return `#${[red, green, blue].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

function extractPalette(image) {
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = 64;
  sampleCanvas.height = 64;
  const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, 64, 64);
  const pixels = ctx.getImageData(0, 0, 64, 64).data;
  let best = { score: -1, red: 88, green: 223, blue: 242 };
  let average = [0, 0, 0];
  let count = 0;

  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max ? (max - min) / max : 0;
    const lum = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
    average[0] += r;
    average[1] += g;
    average[2] += b;
    count += 1;
    if (lum < 0.2 || lum > 0.88) continue;
    const score = sat * 1.25 + lum * 0.35;
    if (score > best.score) best = { score, red: r, green: g, blue: b };
  }

  average = average.map((v) => v / Math.max(count, 1));
  if (best.score < 0.18) {
    best = { score: 0, red: 86, green: 190, blue: 208 };
  }
  const accent = [best.red, best.green, best.blue].map((v) => clamp(v * 1.08 + 12, 34, 246));
  const dark = average.map((v) => clamp(v * 0.27, 6, 52));
  return { accent, dark };
}

function makePaperEdgeTexture(pageColor, pages) {
  const c = document.createElement('canvas');
  c.width = 96;
  c.height = 1024;
  const ctx = c.getContext('2d');
  ctx.fillStyle = pageColor;
  ctx.fillRect(0, 0, c.width, c.height);
  const spacing = clamp(Math.round(920 / Math.max(pages, 100)), 2, 5);
  for (let y = 1; y < c.height; y += spacing) {
    ctx.fillStyle = y % (spacing * 4) === 1 ? 'rgba(53,48,42,0.18)' : 'rgba(53,48,42,0.065)';
    ctx.fillRect(0, y, c.width, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeSpineTexture(config, palette, maxAnisotropy) {
  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 1600;
  const ctx = c.getContext('2d');
  const accentHex = rgbToHex(...palette.accent);
  const darkHex = rgbToHex(...palette.dark);
  const gradient = ctx.createLinearGradient(0, 0, c.width, 0);
  gradient.addColorStop(0, darkHex);
  gradient.addColorStop(0.45, accentHex);
  gradient.addColorStop(1, darkHex);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.save();
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(4, 6, 8, 0.9)';
  ctx.font = '600 58px Georgia, serif';
  ctx.fillText((config.author || '').slice(0, 42).toUpperCase(), 0, -43);
  ctx.font = '700 86px Georgia, serif';
  ctx.fillText((config.title || 'BUCH').slice(0, 34).toUpperCase(), 0, 58);
  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function smoothstep(start, end, t) {
  const v = clamp((t - start) / Math.max(end - start, 0.0001), 0, 1);
  return v * v * (3 - 2 * v);
}

function mix(from, to, t) {
  return from + (to - from) * t;
}

export class BookRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.disposed = false;
    this.config = null;
    this.coverTexture = null;
    this.palette = null;
    this.bookGroup = new THREE.Group();
    this.revealTime = 0;
    this.idlePhase = Math.random() * Math.PI * 2;

    const width = 720;
    const height = 1280;
    this.width = width;
    this.height = height;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.9;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    // Warmer, less black background so the book pops even during reveal
    this.scene.background = new THREE.Color(0x141210);

    this.camera = new THREE.PerspectiveCamera(29, width / height, 0.1, 100);
    this.camera.position.set(-0.12, 0.08, 13.4);

    this.ambient = new THREE.HemisphereLight(0xf0f7f8, 0x020307, 0.03);
    this.scene.add(this.ambient);

    this.keyLight = new THREE.DirectionalLight(0xffffff, 0.02);
    this.keyLight.position.set(4.2, 6.2, 5.4);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    this.keyLight.shadow.camera.left = -6;
    this.keyLight.shadow.camera.right = 6;
    this.keyLight.shadow.camera.top = 7;
    this.keyLight.shadow.camera.bottom = -7;
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0x58dff2, 1.1);
    this.rimLight.position.set(-4.8, 2.4, -2.8);
    this.scene.add(this.rimLight);

    this.fillLight = new THREE.DirectionalLight(0x58dff2, 0.08);
    this.fillLight.position.set(4, -1.5, 1.8);
    this.scene.add(this.fillLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.5 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.34;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.scene.add(this.bookGroup);
  }

  async loadCover(url) {
    const loader = new THREE.TextureLoader();
    const texture = await loader.loadAsync(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.coverTexture = texture;
    this.palette = extractPalette(texture.image);
    const accentHex = rgbToHex(...this.palette.accent);
    document.documentElement.style.setProperty('--accent', accentHex);
    this.rimLight.color.set(accentHex);
    this.fillLight.color.set(accentHex);
    return texture;
  }

  setConfig(config) {
    this.config = config;
    this.revealTime = 0;
    this.buildBook();
  }

  buildBook() {
    while (this.bookGroup.children.length) {
      const child = this.bookGroup.children[0];
      this.bookGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const m of materials) {
          if (m.map) m.map.dispose();
          m.dispose();
        }
      }
    }

    if (!this.config || !this.coverTexture) return;

    const config = this.config;
    const palette = this.palette;
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const height = 4.2;
    const width = height * clamp(Number(config.cover_ratio) || 0.64, 0.5, 0.82);
    const depthRatio = clamp(Number(config.depth_ratio) || 0.15, 0.07, 0.25);
    const bookDepth = height * depthRatio;
    const coverThickness = 0.016;
    const pageDepth = bookDepth - coverThickness * 2;
    const pageWidth = width - 0.034;
    const pageHeight = height - 0.032;
    const overhang = 0.014;
    const accentColor = new THREE.Color(rgbToHex(...palette.accent));
    const darkColor = new THREE.Color(rgbToHex(...palette.dark));

    const edge = new THREE.MeshPhysicalMaterial({ color: accentColor, roughness: 0.54, clearcoat: 0.12 });
    const front = new THREE.MeshPhysicalMaterial({
      map: this.coverTexture,
      color: 0xffffff,
      roughness: 0.5,
      clearcoat: 0.16,
      clearcoatRoughness: 0.62,
    });
    const back = new THREE.MeshPhysicalMaterial({ color: darkColor, roughness: 0.62, clearcoat: 0.08 });
    const spine = new THREE.MeshPhysicalMaterial({
      map: makeSpineTexture(config, palette, maxAniso),
      color: 0xffffff,
      roughness: 0.54,
      clearcoat: 0.12,
    });
    const paper = new THREE.MeshStandardMaterial({ color: 0xeee9df, roughness: 0.94 });
    const pageEdge = new THREE.MeshStandardMaterial({
      map: makePaperEdgeTexture('#eee9df', Number(config.pages) || 320),
      color: 0xffffff,
      roughness: 0.92,
    });

    const pages = new THREE.Mesh(
      new THREE.BoxGeometry(pageWidth, pageHeight, pageDepth),
      [pageEdge, pageEdge, pageEdge, pageEdge, paper, paper],
    );
    pages.castShadow = true;
    pages.receiveShadow = true;
    this.bookGroup.add(pages);

    const frontCover = new THREE.Mesh(
      new THREE.BoxGeometry(width + overhang, height + overhang, coverThickness),
      [edge, edge, edge, edge, front, edge],
    );
    frontCover.position.z = pageDepth / 2 + coverThickness / 2;
    frontCover.castShadow = true;
    this.bookGroup.add(frontCover);

    const backCover = new THREE.Mesh(
      new THREE.BoxGeometry(width + overhang, height + overhang, coverThickness),
      [edge, edge, edge, edge, edge, back],
    );
    backCover.position.z = -pageDepth / 2 - coverThickness / 2;
    backCover.castShadow = true;
    this.bookGroup.add(backCover);

    const spineCover = new THREE.Mesh(
      new THREE.BoxGeometry(
        coverThickness * 1.15,
        height - coverThickness * 1.6,
        pageDepth + coverThickness * 0.35,
      ),
      [edge, spine, edge, edge, edge, edge],
    );
    spineCover.position.x = -width / 2 - overhang / 2 - coverThickness * 0.3;
    spineCover.castShadow = true;
    this.bookGroup.add(spineCover);

    // Initial position: slightly more angled so the reveal animation can rotate it into place
    this.bookGroup.rotation.set(-0.07, 0.5, -0.016);
    this.bookGroup.position.set(-0.18, 0.05, 0);
    this.bookGroup.scale.setScalar(0.82);
  }

  render(time) {
    if (this.disposed || !this.config || !this.bookGroup.children.length) return;

    const t = clamp(time, 0, 15);
    const reveal = smoothstep(0.8, 3.0, t);
    const detail = smoothstep(3.0, 7.0, t);

    this.ambient.intensity = 0.018 + reveal * 0.84;
    this.keyLight.intensity = 0.015 + reveal * 4.6;
    this.rimLight.intensity = 1.0 + reveal * 0.75;
    this.fillLight.intensity = 0.02 + reveal * 0.74;
    this.renderer.toneMappingExposure = 0.54 + reveal * 0.46;

    let rotY = mix(0.7, 0.3, detail);
    this.bookGroup.rotation.set(-0.07, rotY, -0.016);

    this.bookGroup.scale.setScalar(0.82);
    this.camera.position.set(-0.12, 0.08, 12.5);
    this.camera.lookAt(-0.16, 0.08, 0);

    this.renderer.render(this.scene, this.camera);
  }

  renderIdle(elapsed) {
    if (this.disposed || !this.config || !this.bookGroup.children.length) return;

    // --- REVEAL PHASE (first ~7 seconds) ---
    // Gradually bring up lighting, push camera in, rotate book to readable angle
    const revealDuration = 7.0;
    const reveal = smoothstep(0.6, revealDuration, elapsed);
    const settled = elapsed >= revealDuration;

    // Lighting buildup
    this.ambient.intensity = mix(0.018, 0.88, reveal);
    this.keyLight.intensity = mix(0.015, 4.8, reveal);
    this.rimLight.intensity = mix(1.0, 2.0, reveal);
    this.fillLight.intensity = mix(0.02, 0.80, reveal);
    this.renderer.toneMappingExposure = mix(0.50, 1.0, reveal);

    // Camera push: start farther back, gently move in
    const camZ = mix(14.8, 12.5, reveal);

    // Book rotation: start showing spine, turn toward viewer
    const rotY = mix(0.7, 0.3, smoothstep(1.5, 6.0, elapsed));
    const rotX = mix(-0.10, -0.07, reveal);

    if (settled) {
      // --- IDLE FLOATING ---
      const t = (elapsed - revealDuration) + this.idlePhase;
      const hover = Math.sin(t * 0.5) * 0.04;
      const sway = Math.sin(t * 0.3) * 0.025;
      const breathe = Math.sin(t * 0.4) * 0.008;
      const microRot = Math.sin(t * 0.18) * 0.002;

      this.bookGroup.position.set(-0.18 + Math.sin(t * 0.22) * 0.02, 0.05 + hover, Math.sin(t * 0.15) * 0.015);
      this.bookGroup.rotation.set(rotX + breathe, rotY + sway, -0.016 + microRot);
      this.bookGroup.scale.setScalar(0.82 + breathe);

      // Gentle camera orbit: slow sideways sway and tiny bob
      const camSway = Math.sin(t * 0.15) * 0.18;
      const camBob = Math.sin(t * 0.2 + 1.2) * 0.04;
      const camDepth = Math.sin(t * 0.1 + 0.7) * 0.12;
      this.camera.position.set(-0.12 + camSway * 0.3, 0.08 + camBob, 12.5 + camDepth);
      this.camera.lookAt(-0.16 + camSway * 0.15, 0.08 + camBob * 0.5, 0);
    } else {
      // While revealing: position ramps smoothly to target
      this.bookGroup.position.set(-0.18, 0.05, 0);
      this.bookGroup.rotation.set(rotX, rotY, -0.016);
      this.bookGroup.scale.setScalar(mix(0.72, 0.82, reveal));

      this.camera.position.set(-0.12, 0.08, camZ);
      this.camera.lookAt(-0.16, 0.08, 0);
    }

    this.renderer.render(this.scene, this.camera);
  }

  resize(displayWidth, displayHeight) {
    const scale = Math.min(displayWidth / this.width, displayHeight / this.height);
    this.canvas.style.width = `${this.width * scale}px`;
    this.canvas.style.height = `${this.height * scale}px`;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    while (this.bookGroup.children.length) {
      const child = this.bookGroup.children[0];
      this.bookGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const m of materials) {
          if (m.map) m.map.dispose();
          m.dispose();
        }
      }
    }
    if (this.coverTexture) {
      this.coverTexture.dispose();
      this.coverTexture = null;
    }
    this.renderer.dispose();
  }
}