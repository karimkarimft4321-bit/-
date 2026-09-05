import { Entity, Projectile, DroppedItem, Particle, DamageNumber } from '../types';
import { LF2Engine } from './engine';
import { STAGES } from './stages';

export class LF2Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cameraX = 0;
  private screenShakeTimer = 0;
  private screenShakeAmount = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
  }

  public triggerShake(amount: number = 6, duration: number = 10) {
    this.screenShakeAmount = amount;
    this.screenShakeTimer = duration;
  }

  public render(engine: LF2Engine) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Update Camera position tracking player
    if (engine.player) {
      const targetCamX = engine.player.x - width * 0.45;
      this.cameraX += (targetCamX - this.cameraX) * 0.12;
      this.cameraX = Math.max(0, Math.min(engine.arenaWidth - width, this.cameraX));
    }

    // Apply Screen Shake
    ctx.save();
    if (this.screenShakeTimer > 0) {
      this.screenShakeTimer--;
      const shakeX = (Math.random() - 0.5) * this.screenShakeAmount;
      const shakeY = (Math.random() - 0.5) * this.screenShakeAmount;
      ctx.translate(shakeX, shakeY);
    }

    const horizonY = height * 0.46;

    // 1. Draw Parallax Background
    this.drawBackground(ctx, width, height, horizonY, engine);

    // 2. Depth Sort All Renderable Objects
    // Everything on the 2.5D plane is sorted by Z depth
    type Renderable = 
      | { type: 'entity'; obj: Entity; z: number }
      | { type: 'projectile'; obj: Projectile; z: number }
      | { type: 'item'; obj: DroppedItem; z: number }
      | { type: 'particle'; obj: Particle; z: number };

    const renderQueue: Renderable[] = [];

    engine.entities.forEach(ent => renderQueue.push({ type: 'entity', obj: ent, z: ent.z }));
    engine.projectiles.forEach(p => renderQueue.push({ type: 'projectile', obj: p, z: p.z }));
    engine.items.forEach(it => renderQueue.push({ type: 'item', obj: it, z: it.z }));
    engine.particles.forEach(pt => renderQueue.push({ type: 'particle', obj: pt, z: pt.z }));

    renderQueue.sort((a, b) => a.z - b.z);

    // 3. Render Objects in Sorted Order
    renderQueue.forEach(item => {
      if (item.type === 'entity') {
        this.drawEntity(ctx, item.obj, horizonY);
      } else if (item.type === 'projectile') {
        this.drawProjectile(ctx, item.obj, horizonY);
      } else if (item.type === 'item') {
        this.drawItem(ctx, item.obj, horizonY);
      } else if (item.type === 'particle') {
        this.drawParticle(ctx, item.obj, horizonY);
      }
    });

    // 4. Draw Damage Numbers
    this.drawDamageNumbers(ctx, engine.damageNumbers, horizonY);

    // 5. Draw In-Game Announcements (Wave, Victory, Game Over)
    this.drawOverlays(ctx, width, height, engine);

    ctx.restore();
  }

  private drawBackground(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    horizonY: number,
    engine: LF2Engine
  ) {
    const stage = STAGES[engine.currentStageIndex] || STAGES[0];
    const theme = stage.bgTheme;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    if (theme === 'great_wall') {
      skyGrad.addColorStop(0, '#1E293B'); // Deep twilight blue
      skyGrad.addColorStop(0.6, '#334155');
      skyGrad.addColorStop(1, '#64748B');
    } else if (theme === 'bandit_camp') {
      skyGrad.addColorStop(0, '#451A03'); // Dusk fiery orange
      skyGrad.addColorStop(0.5, '#78350F');
      skyGrad.addColorStop(1, '#92400E');
    } else {
      skyGrad.addColorStop(0, '#1E1B4B'); // Dark Citadel violet
      skyGrad.addColorStop(0.6, '#312E81');
      skyGrad.addColorStop(1, '#4C1D95');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    // Parallax Distant Mountains / Citadel Silhouettes
    const distantParallax = this.cameraX * 0.2;
    ctx.fillStyle = theme === 'bandit_camp' ? '#27190F' : '#0F172A';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    for (let x = 0; x <= w + 100; x += 80) {
      const peakHeight = 40 + Math.sin((x + distantParallax) * 0.015) * 35;
      ctx.lineTo(x, horizonY - peakHeight);
    }
    ctx.lineTo(w, horizonY);
    ctx.fill();

    // Wall / Battlements Mid-ground Parallax
    const midParallax = this.cameraX * 0.45;
    ctx.fillStyle = theme === 'bandit_camp' ? '#3B2414' : '#1E293B';
    const battlementSpacing = 90;
    const offset = -(midParallax % battlementSpacing);

    ctx.fillRect(0, horizonY - 45, w, 45);
    for (let x = offset; x < w + 100; x += battlementSpacing) {
      ctx.fillRect(x, horizonY - 65, 45, 20);
      // Torches / Wall lanterns
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(x + 22, horizonY - 45, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = theme === 'bandit_camp' ? '#3B2414' : '#1E293B';
    }

    // Ground Arena Plane (Depth-shaded)
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    if (theme === 'great_wall') {
      groundGrad.addColorStop(0, '#475569');
      groundGrad.addColorStop(0.3, '#334155');
      groundGrad.addColorStop(1, '#1E293B');
    } else if (theme === 'bandit_camp') {
      groundGrad.addColorStop(0, '#78350F');
      groundGrad.addColorStop(0.4, '#59290B');
      groundGrad.addColorStop(1, '#3B1A07');
    } else {
      groundGrad.addColorStop(0, '#312E81');
      groundGrad.addColorStop(0.4, '#1E1B4B');
      groundGrad.addColorStop(1, '#0F0E28');
    }
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // Isometric Ground Grid Lines (LF2 battle plane feel)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Horizontal depth lines
    for (let z = engine.arenaDepthMin; z <= engine.arenaDepthMax; z += 35) {
      const lineY = horizonY + z * 1.15;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(w, lineY);
      ctx.stroke();
    }

    // Vertical arena boundary markers
    const leftMarkerX = 40 - this.cameraX;
    const rightMarkerX = engine.arenaWidth - 40 - this.cameraX;
    if (leftMarkerX > -20 && leftMarkerX < w + 20) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(leftMarkerX, horizonY);
      ctx.lineTo(leftMarkerX, h);
      ctx.stroke();
    }
    if (rightMarkerX > -20 && rightMarkerX < w + 20) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rightMarkerX, horizonY);
      ctx.lineTo(rightMarkerX, h);
      ctx.stroke();
    }
  }

  private drawEntity(ctx: CanvasRenderingContext2D, ent: Entity, horizonY: number) {
    const screenX = ent.x - this.cameraX;
    const screenBaseY = horizonY + ent.z * 1.15;
    const screenY = screenBaseY - ent.y; // Jump moves upwards

    // Offscreen culling
    if (screenX < -100 || screenX > this.canvas.width + 100) return;

    ctx.save();
    ctx.translate(screenX, screenY);

    // Invulnerability flashing
    if (ent.invulnerableTimer > 0 && Math.floor(ent.invulnerableTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Shadow Clone transparency
    if (ent.isClone) {
      ctx.globalAlpha = 0.75;
    }

    // Dead entity fading
    if (ent.hp <= 0 && ent.state === 'dead') {
      ctx.globalAlpha = Math.max(0, 1 - ent.stateTimer / 70);
    }

    // 1. Draw Ground Shadow (Back at screenBaseY)
    ctx.restore();
    ctx.save();
    const shadowScale = Math.max(0.3, 1 - ent.y / 200);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenBaseY, 20 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(screenX, screenY);

    // Flip according to facing direction (1 = right, -1 = left)
    ctx.scale(ent.facing, 1);

    // 2. Guarding Shield Aura
    if (ent.isGuarding) {
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(14, -28, 32, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
      ctx.fillStyle = 'rgba(96, 165, 250, 0.15)';
      ctx.fill();
    }

    // 3. Render Character Sprite Model
    this.renderCharacterModel(ctx, ent);

    // 4. Frozen Ice Block effect
    if (ent.state === 'frozen') {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-24, -68, 48, 72, 8);
      ctx.fill();
      ctx.stroke();

      // Ice crystals
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-10, -50);
      ctx.lineTo(-6, -60);
      ctx.lineTo(-2, -50);
      ctx.fill();
    }

    ctx.restore();

    // 5. Overhead Health & MP Bars
    if (ent.hp > 0 && (ent.team === 1 || !ent.isPlayer)) {
      this.drawOverheadBars(ctx, ent, screenX, screenY - 70);
    }
  }

  private renderCharacterModel(ctx: CanvasRenderingContext2D, ent: Entity) {
    const char = ent.charDef;
    const isBoss = char.id === 'julian';
    const scale = isBoss ? 1.3 : 1.0;
    ctx.scale(scale, scale);

    const time = ent.stateTimer;

    // Body limb offsets calculated by state
    let legL_X = -7, legL_Y = 0;
    let legR_X = 7, legR_Y = 0;
    let bodyY = -28;
    let headY = -52;
    let armFrontX = 14, armFrontY = -30;
    let armBackX = -12, armBackY = -30;
    let rotation = 0;

    if (ent.state === 'walk') {
      const stride = Math.sin(time * 0.35) * 8;
      legL_X = -stride;
      legR_X = stride;
      bodyY += Math.abs(Math.sin(time * 0.35)) * 2 - 1;
      armFrontX += -stride * 0.7;
      armBackX += stride * 0.7;
    } else if (ent.state === 'run') {
      const stride = Math.sin(time * 0.5) * 12;
      legL_X = -stride;
      legR_X = stride;
      rotation = 0.15; // lean forward
      armFrontX += -stride;
    } else if (ent.state === 'jump') {
      legL_Y = -6;
      legR_Y = -4;
      bodyY -= 2;
      armFrontY -= 8;
    } else if (ent.state === 'jump_attack') {
      legL_Y = -8;
      legR_X = 18; // Extended flying kick
      legR_Y = -2;
      rotation = 0.2;
    } else if (ent.state === 'punch1') {
      armFrontX = 26; // Punch extension
      armFrontY = -32;
    } else if (ent.state === 'punch2') {
      armBackX = 24;
      armFrontX = 5;
    } else if (ent.state === 'kick') {
      legR_X = 22; // High kick
      legR_Y = -12;
      bodyY += 2;
    } else if (ent.state === 'dash_attack') {
      rotation = 0.35;
      armFrontX = 26;
      legR_X = 18;
    } else if (ent.state === 'guard') {
      armFrontX = 10;
      armBackX = 8;
      armFrontY = -38;
      armBackY = -38;
    } else if (ent.state === 'hurt') {
      rotation = -0.25; // Reeling back
      bodyY += 4;
    } else if (ent.state === 'knockdown') {
      rotation = -Math.PI * 0.45; // Knocked horizontally
      bodyY = -8;
      headY = -12;
    } else if (ent.state === 'special1' && char.id === 'davis') {
      // Ki blast pose
      armFrontX = 24;
      armBackX = 18;
    } else if (ent.state === 'special2' && char.id === 'davis') {
      // Dragon Uppercut
      armFrontX = 8;
      armFrontY = -56; // Fist raised high
      bodyY -= 6;
    }

    ctx.rotate(rotation);

    // --- Back Arm ---
    ctx.fillStyle = char.accentColor;
    ctx.beginPath();
    ctx.roundRect(armBackX - 5, armBackY - 4, 10, 16, 4);
    ctx.fill();

    // --- Legs ---
    ctx.fillStyle = '#1F2937'; // Pants
    // Left Leg
    ctx.beginPath();
    ctx.roundRect(legL_X - 4, -14 + legL_Y, 8, 15, 3);
    ctx.fill();
    // Right Leg
    ctx.beginPath();
    ctx.roundRect(legR_X - 4, -14 + legR_Y, 8, 15, 3);
    ctx.fill();

    // Boots / Martial shoes
    ctx.fillStyle = '#111827';
    ctx.fillRect(legL_X - 5, -2 + legL_Y, 10, 5);
    ctx.fillRect(legR_X - 5, -2 + legR_Y, 10, 5);

    // --- Torso / Martial Gi ---
    ctx.fillStyle = char.color;
    ctx.beginPath();
    ctx.roundRect(-12, bodyY - 14, 24, 28, 5);
    ctx.fill();

    // Martial Belt / Sash
    ctx.fillStyle = char.accentColor;
    ctx.fillRect(-12, bodyY + 6, 24, 5);

    // --- Head & Face ---
    ctx.fillStyle = '#FCD34D'; // Anime skin tone
    ctx.beginPath();
    ctx.arc(0, headY, 13, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#111827';
    ctx.fillRect(4, headY - 3, 3, 4);

    // Headband / Ninja Cowl / Hair
    if (char.id === 'rudolf') {
      // Ninja mask covers lower face
      ctx.fillStyle = '#374151';
      ctx.fillRect(-13, headY - 2, 26, 15);
      // Headband
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-13, headY - 10, 26, 6);
    } else {
      // Hair
      ctx.fillStyle = char.hairColor;
      ctx.beginPath();
      ctx.arc(0, headY - 4, 14, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();

      // Front hair tufts / spikes (Classic LF2 style spiky anime hair!)
      ctx.beginPath();
      ctx.moveTo(3, headY - 12);
      ctx.lineTo(14, headY - 18);
      ctx.lineTo(8, headY - 8);
      ctx.fill();

      // Colored Martial Headband
      ctx.fillStyle = char.accentColor;
      ctx.fillRect(-12, headY - 7, 24, 5);
    }

    // Boss Julian Horns
    if (isBoss) {
      ctx.fillStyle = '#4C1D95';
      ctx.beginPath();
      ctx.moveTo(2, headY - 13);
      ctx.lineTo(16, headY - 28);
      ctx.lineTo(8, headY - 10);
      ctx.fill();
    }

    // --- Front Arm & Fist ---
    ctx.fillStyle = char.color;
    ctx.beginPath();
    ctx.roundRect(armFrontX - 5, armFrontY - 4, 10, 16, 4);
    ctx.fill();

    // Fist / Glove
    ctx.fillStyle = char.accentColor;
    ctx.beginPath();
    ctx.arc(armFrontX + (ent.state.includes('punch') ? 5 : 0), armFrontY + 12, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawProjectile(ctx: CanvasRenderingContext2D, p: Projectile, horizonY: number) {
    const screenX = p.x - this.cameraX;
    const screenY = horizonY + p.z * 1.15 - p.y;

    if (screenX < -50 || screenX > this.canvas.width + 50) return;

    ctx.save();
    ctx.translate(screenX, screenY);

    if (p.element === 'fire') {
      // Fireball with blazing aura
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, p.radius);
      grad.addColorStop(0, '#FEF08A');
      grad.addColorStop(0.5, '#F97316');
      grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius * 1.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.element === 'ice') {
      // Crystalline Ice Spikes
      ctx.fillStyle = '#BAE6FD';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sharp icicle diamond
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(0, -p.radius * 1.2);
      ctx.lineTo(p.radius * 0.7, 0);
      ctx.lineTo(0, p.radius * 1.2);
      ctx.lineTo(-p.radius * 0.7, 0);
      ctx.fill();
    } else if (p.element === 'shuriken') {
      // Spinning Ninja Star
      ctx.rotate(p.life * 0.8);
      ctx.fillStyle = '#9CA3AF';
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.lineTo(p.radius, 0);
        ctx.lineTo(p.radius * 0.3, p.radius * 0.3);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (p.element === 'wind') {
      // Crescent Wind Blade
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    } else {
      // Ki / Energy Blast
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, p.radius);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.6, '#3B82F6');
      grad.addColorStop(1, 'rgba(30, 64, 175, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawItem(ctx: CanvasRenderingContext2D, item: DroppedItem, horizonY: number) {
    const screenX = item.x - this.cameraX;
    const screenBaseY = horizonY + item.z * 1.15;
    const screenY = screenBaseY - item.y;

    if (screenX < -50 || screenX > this.canvas.width + 50) return;

    ctx.save();
    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenBaseY, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(screenX, screenY);

    if (item.type === 'crate') {
      // Wooden Crate
      ctx.fillStyle = '#92400E';
      ctx.fillRect(-15, -28, 30, 28);
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 2;
      ctx.strokeRect(-15, -28, 30, 28);
      // Diagonal wooden cross
      ctx.beginPath();
      ctx.moveTo(-15, -28);
      ctx.lineTo(15, 0);
      ctx.moveTo(15, -28);
      ctx.lineTo(-15, 0);
      ctx.stroke();
    } else if (item.type === 'potion_hp') {
      // Red HP Potion bottle
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(0, -9, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(-3, -21, 6, 6);
      ctx.fillStyle = '#FBBF24'; // Cork
      ctx.fillRect(-4, -24, 8, 3);
    } else if (item.type === 'potion_mp') {
      // Blue MP Potion bottle
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(0, -9, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1E40AF';
      ctx.fillRect(-3, -21, 6, 6);
      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(-4, -24, 8, 3);
    }

    ctx.restore();
  }

  private drawParticle(ctx: CanvasRenderingContext2D, pt: Particle, horizonY: number) {
    const screenX = pt.x - this.cameraX;
    const screenY = horizonY + pt.z * 1.15 - pt.y;

    if (screenX < -20 || screenX > this.canvas.width + 20) return;

    ctx.save();
    ctx.globalAlpha = pt.life / pt.maxLife;
    ctx.fillStyle = pt.color;

    if (pt.shape === 'spark') {
      ctx.fillRect(screenX - pt.size / 2, screenY - pt.size / 2, pt.size * 1.5, pt.size * 1.5);
    } else if (pt.shape === 'smoke') {
      ctx.beginPath();
      ctx.arc(screenX, screenY, pt.size * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(screenX, screenY, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawOverheadBars(ctx: CanvasRenderingContext2D, ent: Entity, x: number, y: number) {
    const barWidth = 40;
    const barHeight = 4;
    const hpPct = Math.max(0, ent.hp / ent.maxHp);

    ctx.save();
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - barWidth / 2 - 1, y - 1, barWidth + 2, barHeight + 2);

    // HP Fill
    ctx.fillStyle = hpPct > 0.4 ? '#22C55E' : '#EF4444';
    ctx.fillRect(x - barWidth / 2, y, barWidth * hpPct, barHeight);

    // Character Name
    ctx.fillStyle = '#F1F5F9';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ent.charDef.name.en, x, y - 4);

    ctx.restore();
  }

  private drawDamageNumbers(ctx: CanvasRenderingContext2D, damageNumbers: DamageNumber[], horizonY: number) {
    ctx.save();
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';

    damageNumbers.forEach(dn => {
      const screenX = dn.x - this.cameraX;
      const screenY = horizonY + dn.z * 1.15 - dn.y;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillText(dn.text, screenX + 1, screenY + 1);
      ctx.fillStyle = dn.color;
      ctx.fillText(dn.text, screenX, screenY);
    });

    ctx.restore();
  }

  private drawOverlays(ctx: CanvasRenderingContext2D, w: number, h: number, engine: LF2Engine) {
    // Wave announcement banner
    if (engine.waveAnnounceTimer > 0) {
      const alpha = Math.min(1, engine.waveAnnounceTimer / 30);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(0, h * 0.38, w, 70);

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(engine.waveAnnounceText, w / 2, h * 0.38 + 35);
      ctx.restore();
    }
  }
}
