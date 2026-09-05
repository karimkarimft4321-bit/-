import { 
  Entity, 
  Projectile, 
  Particle, 
  DamageNumber, 
  DroppedItem, 
  GameMode, 
  CharacterDef,
  ActionState 
} from '../types';
import { PLAYABLE_CHARACTERS, ENEMY_CHARACTERS } from './characters';
import { STAGES } from './stages';
import { sound } from '../audio';

export interface GameInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  attack: boolean;
  jump: boolean;
  guard: boolean;
  run: boolean;
  // Direct special triggers (great for mobile touch & shortcuts)
  special1?: boolean;
  special2?: boolean;
  special3?: boolean;
}

export class LF2Engine {
  public arenaWidth = 1400;
  public arenaDepthMin = 40;
  public arenaDepthMax = 260;
  public groundY = 0;
  public gravity = 0.7;

  public entities: Entity[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public damageNumbers: DamageNumber[] = [];
  public items: DroppedItem[] = [];

  public score = 0;
  public combo = 0;
  public comboTimer = 0;
  public maxCombo = 0;
  public kills = 0;

  public currentStageIndex = 0;
  public currentWaveIndex = 0;
  public isWaveCleared = false;
  public stageTimer = 0;
  public waveAnnounceTimer = 0;
  public waveAnnounceText = '';

  public gameMode: GameMode = 'stage';
  public isGameOver = false;
  public isVictory = false;
  public isPaused = false;

  public playerCharDef: CharacterDef;
  public player: Entity | null = null;
  public vsAiPlayer: Entity | null = null;

  // Command buffer for fighting game move inputs (e.g. Guard + Forward + Attack)
  private keyHistory: { key: string; time: number }[] = [];
  private prevInput: GameInput = {
    left: false, right: false, up: false, down: false,
    attack: false, jump: false, guard: false, run: false
  };

  constructor(playerCharId: string = 'davis', mode: GameMode = 'stage', vsOpponentId?: string) {
    this.gameMode = mode;
    this.playerCharDef = PLAYABLE_CHARACTERS.find(c => c.id === playerCharId) || PLAYABLE_CHARACTERS[0];
    this.initGame(vsOpponentId);
  }

  public initGame(vsOpponentId?: string) {
    this.entities = [];
    this.projectiles = [];
    this.particles = [];
    this.damageNumbers = [];
    this.items = [];
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.kills = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.currentStageIndex = 0;
    this.currentWaveIndex = 0;

    // Spawn Player
    this.player = this.createEntity(this.playerCharDef, 180, 150, 0, true, 0);
    this.entities.push(this.player);

    if (this.gameMode === 'vs') {
      const oppDef = PLAYABLE_CHARACTERS.find(c => c.id === (vsOpponentId || 'firen')) || PLAYABLE_CHARACTERS[1];
      this.vsAiPlayer = this.createEntity(oppDef, 800, 150, 0, false, 1);
      this.vsAiPlayer.facing = -1;
      this.entities.push(this.vsAiPlayer);
      this.waveAnnounceText = 'VS MATCH - FIGHT!';
      this.waveAnnounceTimer = 100;
    } else if (this.gameMode === 'stage') {
      this.spawnStageWave();
    } else if (this.gameMode === 'survival') {
      this.spawnSurvivalWave(1);
    }

    // Spawn starting crates / items
    this.spawnCrate(400, 100);
    this.spawnCrate(750, 200);
  }

  public createEntity(
    charDef: CharacterDef,
    x: number,
    z: number,
    team: number = 1,
    isPlayer: boolean = false,
    y: number = 0
  ): Entity {
    return {
      id: Math.random().toString(36).substring(2, 9),
      isPlayer,
      team,
      charDef,
      x,
      y,
      z,
      vx: 0,
      vy: 0,
      vz: 0,
      facing: team === 0 ? 1 : -1,
      state: 'idle',
      stateTimer: 0,
      hp: charDef.baseStats.hp,
      maxHp: charDef.baseStats.maxHp,
      mp: charDef.baseStats.mp,
      maxMp: charDef.baseStats.maxMp,
      isGuarding: false,
      guardTimer: 0,
      comboCount: 0,
      lastHitTime: 0,
      invulnerableTimer: 0,
      aiTimer: Math.random() * 30,
      aiAggro: 0.6 + Math.random() * 0.4
    };
  }

  public spawnCrate(x: number, z: number) {
    this.items.push({
      id: 'crate_' + Math.random().toString(36).substring(2, 7),
      type: 'crate',
      x,
      y: 0,
      z,
      vy: 0,
      vz: 0,
      life: 9999
    });
  }

  public spawnPotion(x: number, z: number, type: 'potion_hp' | 'potion_mp') {
    this.items.push({
      id: 'pot_' + Math.random().toString(36).substring(2, 7),
      type,
      x,
      y: 12,
      z,
      vy: 4,
      vz: 0,
      life: 1500,
      value: type === 'potion_hp' ? 120 : 80
    });
  }

  private spawnStageWave() {
    const stage = STAGES[this.currentStageIndex];
    if (!stage) {
      this.isVictory = true;
      sound.playVictory();
      return;
    }

    const wave = stage.waves[this.currentWaveIndex];
    if (!wave) {
      // Stage finished, proceed to next stage
      this.currentStageIndex++;
      this.currentWaveIndex = 0;
      if (this.currentStageIndex >= STAGES.length) {
        this.isVictory = true;
        sound.playVictory();
        return;
      }
      this.spawnStageWave();
      return;
    }

    this.waveAnnounceText = `STAGE ${stage.stageNumber} - WAVE ${this.currentWaveIndex + 1}`;
    this.waveAnnounceTimer = 110;

    let offset = 0;
    wave.enemyTypes.forEach(enemyGroup => {
      const def = ENEMY_CHARACTERS[enemyGroup.charId] || ENEMY_CHARACTERS['bandit'];
      for (let i = 0; i < enemyGroup.count; i++) {
        const x = 700 + (offset % 5) * 80 + Math.random() * 50;
        const z = this.arenaDepthMin + Math.random() * (this.arenaDepthMax - this.arenaDepthMin);
        const enemy = this.createEntity(def, x, z, 1, false);
        if (enemyGroup.isBoss) {
          enemy.hp *= 1.3;
          enemy.maxHp *= 1.3;
        }
        this.entities.push(enemy);
        offset++;
      }
    });
  }

  private spawnSurvivalWave(waveNum: number) {
    this.waveAnnounceText = `SURVIVAL WAVE ${waveNum}`;
    this.waveAnnounceTimer = 110;
    const enemyCount = Math.min(12, 3 + waveNum * 2);

    for (let i = 0; i < enemyCount; i++) {
      let charId = 'bandit';
      const r = Math.random();
      if (waveNum >= 4 && r > 0.8) charId = 'julian';
      else if (waveNum >= 2 && r > 0.6) charId = 'mark';
      else if (r > 0.4) charId = 'hunter';

      const def = ENEMY_CHARACTERS[charId] || ENEMY_CHARACTERS['bandit'];
      const x = 750 + Math.random() * 450;
      const z = this.arenaDepthMin + Math.random() * (this.arenaDepthMax - this.arenaDepthMin);
      this.entities.push(this.createEntity(def, x, z, 1, false));
    }
  }

  // Update Game Physics & State every frame (~60 FPS)
  public update(input: GameInput) {
    if (this.isPaused || this.isGameOver || this.isVictory) return;

    this.stageTimer++;
    if (this.waveAnnounceTimer > 0) this.waveAnnounceTimer--;

    // Passive player MP regen
    if (this.player && this.player.hp > 0) {
      if (this.stageTimer % 20 === 0 && this.player.mp < this.player.maxMp) {
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + 2);
      }
    }

    // Process Player Controls
    if (this.player && this.player.hp > 0) {
      this.handlePlayerInput(this.player, input);
    }

    // Process Entities (AI, Physics, Animations)
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const ent = this.entities[i];

      // Invulnerability tick
      if (ent.invulnerableTimer > 0) ent.invulnerableTimer--;

      // AI decisions for non-players
      if (!ent.isPlayer && ent.hp > 0) {
        this.updateAI(ent);
      }

      // Physics & State Machine
      this.updateEntityPhysics(ent);

      // Despawn dead enemies after fading out
      if (ent.hp <= 0 && ent.state === 'dead') {
        if (ent.stateTimer > 70) {
          if (!ent.isPlayer) {
            this.score += 250;
            this.kills++;
            // Item drop chance
            if (Math.random() < 0.35) {
              const potType = Math.random() < 0.6 ? 'potion_hp' : 'potion_mp';
              this.spawnPotion(ent.x, ent.z, potType);
            }
          }
          this.entities.splice(i, 1);
        }
      }
    }

    // Update Projectiles
    this.updateProjectiles();

    // Update Items & Pickups
    this.updateItems();

    // Update Particles
    this.updateParticles();

    // Update Floating Damage Numbers
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.damageNumbers[i];
      dn.y += dn.vy;
      dn.life--;
      if (dn.life <= 0) {
        this.damageNumbers.splice(i, 1);
      }
    }

    // Check Wave / Stage Clear
    const enemiesAlive = this.entities.filter(e => e.team === 1 && e.hp > 0).length;
    if (enemiesAlive === 0) {
      if (this.gameMode === 'stage') {
        this.currentWaveIndex++;
        this.spawnStageWave();
      } else if (this.gameMode === 'survival') {
        this.currentWaveIndex++;
        this.spawnSurvivalWave(this.currentWaveIndex + 1);
      } else if (this.gameMode === 'vs') {
        this.isVictory = true;
        sound.playVictory();
      }
    }

    // Check Player Defeat
    if (this.player && this.player.hp <= 0 && !this.isGameOver) {
      this.isGameOver = true;
      sound.playDefeat();
    }

    // Combo reset timer
    if (this.combo > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }

    this.prevInput = { ...input };
  }

  private handlePlayerInput(p: Entity, input: GameInput) {
    const isGrounded = p.y <= 0;

    // Direct Special moves shortcuts
    if (input.special1 && !this.prevInput.special1) {
      this.triggerSpecialMove(p, 0);
      return;
    }
    if (input.special2 && !this.prevInput.special2) {
      this.triggerSpecialMove(p, 1);
      return;
    }
    if (input.special3 && !this.prevInput.special3) {
      this.triggerSpecialMove(p, 2);
      return;
    }

    // Guarding
    if (input.guard && isGrounded && !['punch1', 'punch2', 'kick', 'dash_attack', 'hurt', 'knockdown', 'frozen'].includes(p.state)) {
      p.state = 'guard';
      p.isGuarding = true;
      p.vx *= 0.5;
      p.vz = 0;
      return;
    } else if (p.state === 'guard' && !input.guard) {
      p.state = 'idle';
      p.isGuarding = false;
    }

    // Cannot initiate standard moves while in hurt, locked or in recovery
    if (['hurt', 'knockdown', 'frozen', 'burning', 'special1', 'special2', 'special3'].includes(p.state)) {
      return;
    }

    // Jumping
    if (input.jump && !this.prevInput.jump && isGrounded && p.state !== 'guard') {
      p.state = 'jump';
      p.vy = 12.5;
      sound.playJump();
      this.spawnDust(p.x, p.z, 5);
      return;
    }

    // Attacking
    if (input.attack && !this.prevInput.attack) {
      // In air -> Flying Jump Kick
      if (!isGrounded) {
        p.state = 'jump_attack';
        p.stateTimer = 0;
        sound.playPunch();
        return;
      }

      // Running -> Dash Attack
      if (p.state === 'run') {
        p.state = 'dash_attack';
        p.stateTimer = 0;
        p.vx = p.facing * (p.charDef.baseStats.speed * 2.2);
        sound.playHitHeavy();
        return;
      }

      // Ground combo: punch1 -> punch2 -> kick
      if (p.state === 'idle' || p.state === 'walk') {
        p.state = 'punch1';
        p.stateTimer = 0;
        p.vx = p.facing * 1.5;
        sound.playPunch();
        return;
      } else if (p.state === 'punch1' && p.stateTimer > 4) {
        p.state = 'punch2';
        p.stateTimer = 0;
        p.vx = p.facing * 1.8;
        sound.playPunch();
        return;
      } else if (p.state === 'punch2' && p.stateTimer > 4) {
        p.state = 'kick';
        p.stateTimer = 0;
        p.vx = p.facing * 2.5;
        sound.playHitHeavy();
        return;
      }
    }

    // Movement (Walk / Run)
    if (isGrounded && !['punch1', 'punch2', 'kick', 'dash_attack', 'guard'].includes(p.state)) {
      let moveX = 0;
      let moveZ = 0;

      if (input.left) moveX -= 1;
      if (input.right) moveX += 1;
      if (input.up) moveZ -= 1;
      if (input.down) moveZ += 1;

      if (moveX !== 0 || moveZ !== 0) {
        if (moveX !== 0) p.facing = moveX > 0 ? 1 : -1;
        const speedMultiplier = input.run ? 1.75 : 1.0;
        const currentSpeed = p.charDef.baseStats.speed * speedMultiplier;

        p.vx = moveX * currentSpeed;
        p.vz = moveZ * (currentSpeed * 0.7);
        p.state = input.run ? 'run' : 'walk';

        if (input.run && Math.random() < 0.25) {
          this.spawnDust(p.x - p.facing * 15, p.z, 1);
        }
      } else {
        p.vx = 0;
        p.vz = 0;
        p.state = 'idle';
      }
    }
  }

  public triggerSpecialMove(ent: Entity, moveIndex: number) {
    if (ent.hp <= 0) return;
    const move = ent.charDef.moves[moveIndex];
    if (!move) return;

    if (ent.mp < move.mpCost) {
      // Not enough MP!
      this.addDamageNumber(ent.x, ent.y + 70, ent.z, 'NO MP!', '#94A3B8');
      return;
    }

    ent.mp -= move.mpCost;
    ent.state = (`special${moveIndex + 1}` as ActionState);
    ent.stateTimer = 0;
    ent.vx = 0;

    // Character specific effects
    if (ent.charDef.id === 'davis') {
      if (moveIndex === 0) {
        // Energy Blast projectile
        sound.playEnergyBlast();
        this.projectiles.push({
          id: Math.random().toString(),
          ownerId: ent.id,
          ownerTeam: ent.team,
          x: ent.x + ent.facing * 35,
          y: ent.y + 28,
          z: ent.z,
          vx: ent.facing * 9.5,
          vy: 0,
          vz: 0,
          radius: 18,
          damage: 55,
          element: 'energy',
          life: 80,
          maxLife: 80
        });
      } else if (moveIndex === 1) {
        // Dragon Uppercut
        sound.playHitHeavy();
        ent.vy = 13;
        ent.vx = ent.facing * 4;
        this.createHitbox(ent, 50, 40, 75, true);
        this.spawnAuraParticles(ent.x, ent.y, ent.z, '#F59E0B', 20);
      } else if (moveIndex === 2) {
        // Flurry punches
        sound.playPunch();
        this.createHitbox(ent, 40, 25, 65, false);
      }
    } else if (ent.charDef.id === 'firen') {
      if (moveIndex === 0) {
        // Blazing Fireball
        sound.playFireball();
        this.projectiles.push({
          id: Math.random().toString(),
          ownerId: ent.id,
          ownerTeam: ent.team,
          x: ent.x + ent.facing * 35,
          y: ent.y + 26,
          z: ent.z,
          vx: ent.facing * 8.5,
          vy: 0,
          vz: 0,
          radius: 22,
          damage: 65,
          element: 'fire',
          life: 80,
          maxLife: 80
        });
      } else if (moveIndex === 1) {
        // Inferno Eruption (Area ring)
        sound.playFireball();
        this.createAreaHitbox(ent, 95, 85, 'fire');
        this.spawnAuraParticles(ent.x, ent.y, ent.z, '#EF4444', 35);
      } else if (moveIndex === 2) {
        // Blazing Charge
        sound.playFireball();
        ent.vx = ent.facing * 9;
        this.createHitbox(ent, 45, 30, 60, true);
      }
    } else if (ent.charDef.id === 'freeze') {
      if (moveIndex === 0) {
        // Ice Ball (Freeze effect)
        sound.playIceFreeze();
        this.projectiles.push({
          id: Math.random().toString(),
          ownerId: ent.id,
          ownerTeam: ent.team,
          x: ent.x + ent.facing * 35,
          y: ent.y + 26,
          z: ent.z,
          vx: ent.facing * 7.5,
          vy: 0,
          vz: 0,
          radius: 20,
          damage: 50,
          element: 'ice',
          life: 85,
          maxLife: 85
        });
      } else if (moveIndex === 1) {
        // Icicle Storm from sky
        sound.playIceFreeze();
        for (let i = 0; i < 4; i++) {
          this.projectiles.push({
            id: Math.random().toString(),
            ownerId: ent.id,
            ownerTeam: ent.team,
            x: ent.x + ent.facing * (50 + i * 55),
            y: 160,
            z: ent.z + (Math.random() * 40 - 20),
            vx: 0,
            vy: -7,
            vz: 0,
            radius: 16,
            damage: 48,
            element: 'ice',
            life: 60,
            maxLife: 60
          });
        }
      } else if (moveIndex === 2) {
        // Ice Sword Slash
        sound.playIceFreeze();
        this.createHitbox(ent, 55, 35, 60, true);
        this.spawnAuraParticles(ent.x, ent.y + 25, ent.z, '#38BDF8', 20);
      }
    } else if (ent.charDef.id === 'woody') {
      if (moveIndex === 0) {
        // Wind Crescent
        sound.playSlash();
        this.projectiles.push({
          id: Math.random().toString(),
          ownerId: ent.id,
          ownerTeam: ent.team,
          x: ent.x + ent.facing * 35,
          y: ent.y + 28,
          z: ent.z,
          vx: ent.facing * 10,
          vy: 0,
          vz: 0,
          radius: 24,
          damage: 55,
          element: 'wind',
          life: 75,
          maxLife: 75
        });
      } else if (moveIndex === 1) {
        // Tiger Flip Kick
        sound.playHitHeavy();
        ent.vy = 11;
        ent.vx = ent.facing * 7;
        this.createHitbox(ent, 45, 35, 70, true);
      } else if (moveIndex === 2) {
        // Teleport Dive
        sound.playSlash();
        const target = this.findNearestEnemy(ent);
        if (target) {
          ent.x = target.x - ent.facing * 20;
          ent.z = target.z;
          ent.y = 110;
          ent.vy = -10;
          this.createHitbox(ent, 40, 30, 65, true);
          this.spawnAuraParticles(ent.x, ent.y, ent.z, '#10B981', 15);
        }
      }
    } else if (ent.charDef.id === 'rudolf') {
      if (moveIndex === 0) {
        // Triple Shuriken spread
        sound.playSlash();
        [-0.4, 0, 0.4].forEach(vz => {
          this.projectiles.push({
            id: Math.random().toString(),
            ownerId: ent.id,
            ownerTeam: ent.team,
            x: ent.x + ent.facing * 30,
            y: ent.y + 25,
            z: ent.z,
            vx: ent.facing * 10.5,
            vy: 0,
            vz,
            radius: 12,
            damage: 35,
            element: 'shuriken',
            life: 65,
            maxLife: 65
          });
        });
      } else if (moveIndex === 1) {
        // Katana Flash Dash
        sound.playSlash();
        ent.vx = ent.facing * 11;
        this.createHitbox(ent, 60, 25, 75, true);
        this.spawnAuraParticles(ent.x, ent.y, ent.z, '#E5E7EB', 15);
      } else if (moveIndex === 2) {
        // Shadow Clone Jutsu!
        sound.playSlash();
        const clone = this.createEntity(ent.charDef, ent.x - ent.facing * 30, ent.z, ent.team, false);
        clone.isClone = true;
        clone.cloneTimer = 600; // 10 seconds of clone ally
        clone.hp = 200;
        clone.maxHp = 200;
        this.entities.push(clone);
        this.spawnAuraParticles(clone.x, clone.y, clone.z, '#9CA3AF', 25);
        this.addDamageNumber(clone.x, clone.y + 60, clone.z, 'CLONE!', '#9CA3AF');
      }
    }
  }

  private updateAI(bot: Entity) {
    bot.aiTimer++;

    // Despawn clone when timer ends
    if (bot.isClone && bot.cloneTimer !== undefined) {
      bot.cloneTimer--;
      if (bot.cloneTimer <= 0) {
        bot.hp = 0;
        bot.state = 'dead';
        this.spawnAuraParticles(bot.x, bot.y, bot.z, '#9CA3AF', 15);
        return;
      }
    }

    if (['hurt', 'knockdown', 'frozen', 'burning', 'dead'].includes(bot.state)) {
      return;
    }

    // Target nearest opponent
    const target = this.findNearestEnemy(bot);
    if (!target) {
      bot.state = 'idle';
      bot.vx = 0;
      bot.vz = 0;
      return;
    }

    const dx = target.x - bot.x;
    const dz = target.z - bot.z;
    const dist = Math.hypot(dx, dz);

    bot.facing = dx >= 0 ? 1 : -1;

    // AI decision every 15-25 frames
    if (bot.aiTimer % 20 === 0) {
      // Boss / Julian special attacks
      if (bot.charDef.id === 'julian' && dist > 140 && Math.random() < 0.4) {
        sound.playEnergyBlast();
        this.projectiles.push({
          id: Math.random().toString(),
          ownerId: bot.id,
          ownerTeam: bot.team,
          x: bot.x + bot.facing * 40,
          y: bot.y + 30,
          z: bot.z,
          vx: bot.facing * 7,
          vy: 0,
          vz: 0,
          radius: 25,
          damage: 55,
          element: 'energy',
          life: 90,
          maxLife: 90
        });
        bot.state = 'punch1';
        bot.stateTimer = 0;
        return;
      }

      // Hunter ranged arrows
      if (bot.charDef.id === 'hunter' && dist > 120 && Math.abs(dz) < 25) {
        sound.playSlash();
        this.projectiles.push({
          id: Math.random().toString(),
          ownerId: bot.id,
          ownerTeam: bot.team,
          x: bot.x + bot.facing * 25,
          y: bot.y + 26,
          z: bot.z,
          vx: bot.facing * 9,
          vy: 0,
          vz: 0,
          radius: 10,
          damage: 30,
          element: 'shuriken',
          life: 80,
          maxLife: 80
        });
        bot.state = 'punch1';
        bot.stateTimer = 0;
        return;
      }

      // If in close melee range
      if (dist < 48 && Math.abs(dz) < 22) {
        const actionRand = Math.random();
        if (actionRand < 0.65) {
          // Attack!
          bot.state = 'punch1';
          bot.stateTimer = 0;
          sound.playPunch();
        } else if (actionRand < 0.85) {
          // Guard
          bot.state = 'guard';
          bot.isGuarding = true;
          bot.guardTimer = 25;
        } else {
          // Jump attack
          bot.state = 'jump';
          bot.vy = 10;
        }
        return;
      }
    }

    // Walking towards target
    if (['idle', 'walk'].includes(bot.state)) {
      const speed = bot.charDef.baseStats.speed * 0.85;
      const angle = Math.atan2(dz, dx);
      bot.vx = Math.cos(angle) * speed;
      bot.vz = Math.sin(angle) * (speed * 0.65);
      bot.state = 'walk';
    }
  }

  private updateEntityPhysics(ent: Entity) {
    ent.stateTimer++;

    // Gravity and Jumping
    if (ent.y > 0 || ent.vy !== 0) {
      ent.y += ent.vy;
      ent.vy -= this.gravity;
      if (ent.y <= 0) {
        ent.y = 0;
        ent.vy = 0;
        if (ent.state === 'jump' || ent.state === 'jump_attack') {
          ent.state = 'idle';
          this.spawnDust(ent.x, ent.z, 4);
        } else if (ent.state === 'knockdown') {
          // Landing from air knockdown
          this.spawnDust(ent.x, ent.z, 6);
        }
      }
    }

    // Move in X & Z
    ent.x += ent.vx;
    ent.z += ent.vz;

    // Friction / drag
    if (['idle', 'guard', 'punch1', 'punch2', 'kick', 'hurt'].includes(ent.state)) {
      ent.vx *= 0.82;
      ent.vz *= 0.82;
    }

    // Boundary constraints
    ent.x = Math.max(40, Math.min(this.arenaWidth - 40, ent.x));
    ent.z = Math.max(this.arenaDepthMin, Math.min(this.arenaDepthMax, ent.z));

    // Attack state expiration & hit detection
    if (ent.state === 'punch1') {
      if (ent.stateTimer === 6) this.checkMeleeHit(ent, 38, 22, ent.charDef.baseStats.attackPower * 0.8, false);
      if (ent.stateTimer >= 14) ent.state = 'idle';
    } else if (ent.state === 'punch2') {
      if (ent.stateTimer === 6) this.checkMeleeHit(ent, 42, 22, ent.charDef.baseStats.attackPower * 1.0, false);
      if (ent.stateTimer >= 14) ent.state = 'idle';
    } else if (ent.state === 'kick') {
      if (ent.stateTimer === 7) this.checkMeleeHit(ent, 48, 26, ent.charDef.baseStats.attackPower * 1.4, true);
      if (ent.stateTimer >= 18) ent.state = 'idle';
    } else if (ent.state === 'jump_attack') {
      this.checkMeleeHit(ent, 42, 25, ent.charDef.baseStats.attackPower * 1.2, true);
      if (ent.y <= 0) ent.state = 'idle';
    } else if (ent.state === 'dash_attack') {
      this.checkMeleeHit(ent, 48, 28, ent.charDef.baseStats.attackPower * 1.3, true);
      if (ent.stateTimer >= 18) ent.state = 'idle';
    } else if (ent.state === 'hurt') {
      if (ent.stateTimer >= 16) ent.state = 'idle';
    } else if (ent.state === 'knockdown') {
      if (ent.y <= 0 && ent.stateTimer >= 45) {
        ent.state = 'idle';
        ent.invulnerableTimer = 35; // Brief invincibility getting up
      }
    } else if (ent.state === 'frozen') {
      if (ent.stateTimer >= 90) {
        ent.state = 'idle';
        sound.playIceFreeze();
        this.spawnAuraParticles(ent.x, ent.y, ent.z, '#38BDF8', 20);
      }
    } else if (ent.state === 'guard') {
      if (ent.guardTimer > 0) {
        ent.guardTimer--;
        if (ent.guardTimer <= 0) {
          ent.state = 'idle';
          ent.isGuarding = false;
        }
      }
    } else if (ent.state.startsWith('special')) {
      if (ent.stateTimer >= 26) {
        ent.state = 'idle';
      }
    }
  }

  private checkMeleeHit(
    attacker: Entity,
    rangeX: number,
    rangeZ: number,
    damage: number,
    knockdown: boolean
  ) {
    const hitboxX = attacker.x + attacker.facing * (rangeX * 0.6);
    const hitboxZ = attacker.z;

    // Check hit against other entities
    this.entities.forEach(target => {
      if (target.id === attacker.id || target.team === attacker.team || target.hp <= 0) return;
      if (target.invulnerableTimer > 0) return;

      const dx = Math.abs(target.x - hitboxX);
      const dz = Math.abs(target.z - hitboxZ);
      const dy = Math.abs(target.y - attacker.y);

      if (dx <= rangeX && dz <= rangeZ && dy <= 35) {
        this.applyDamage(attacker, target, damage, knockdown);
      }
    });

    // Check hit against crates
    this.items.forEach(item => {
      if (item.type === 'crate') {
        const dx = Math.abs(item.x - hitboxX);
        const dz = Math.abs(item.z - hitboxZ);
        if (dx <= rangeX + 15 && dz <= rangeZ + 10) {
          this.breakCrate(item);
        }
      }
    });
  }

  public breakCrate(crate: DroppedItem) {
    crate.life = 0;
    sound.playHitHeavy();
    this.spawnDust(crate.x, crate.z, 8);
    // Drop potion or weapon
    const potType = Math.random() < 0.6 ? 'potion_hp' : 'potion_mp';
    this.spawnPotion(crate.x, crate.z, potType);
  }

  private createHitbox(attacker: Entity, rangeX: number, rangeZ: number, damage: number, knockdown: boolean) {
    this.checkMeleeHit(attacker, rangeX, rangeZ, damage, knockdown);
  }

  private createAreaHitbox(attacker: Entity, radius: number, damage: number, element: string) {
    this.entities.forEach(target => {
      if (target.id === attacker.id || target.team === attacker.team || target.hp <= 0) return;
      if (target.invulnerableTimer > 0) return;

      const dist = Math.hypot(target.x - attacker.x, (target.z - attacker.z) * 1.5);
      if (dist <= radius) {
        this.applyDamage(attacker, target, damage, true, element);
      }
    });
  }

  private applyDamage(
    attacker: Entity,
    target: Entity,
    rawDamage: number,
    isKnockdown: boolean,
    element?: string
  ) {
    let finalDamage = Math.max(8, rawDamage - target.charDef.baseStats.defense * 0.4);

    // Frontal Guard defense check
    const isAttackerInFront = (target.facing === 1 && attacker.x > target.x) || (target.facing === -1 && attacker.x < target.x);
    if (target.isGuarding && isAttackerInFront) {
      finalDamage = Math.round(finalDamage * 0.2);
      sound.playGuard();
      this.spawnSparks(target.x, target.y + 30, target.z, '#FCD34D', 8);
      this.addDamageNumber(target.x, target.y + 60, target.z, 'BLOCKED', '#FCD34D');
      target.vx = -target.facing * 2;
      return;
    }

    target.hp -= finalDamage;
    this.spawnSparks(target.x, target.y + 30, target.z, '#EF4444', 10);
    this.addDamageNumber(target.x, target.y + 55, target.z, `-${Math.round(finalDamage)}`, '#EF4444');

    // Combo counter
    if (attacker.isPlayer) {
      this.combo++;
      this.comboTimer = 90;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this.score += Math.round(finalDamage * (1 + this.combo * 0.1));
    }

    if (element === 'ice') {
      target.state = 'frozen';
      target.stateTimer = 0;
      sound.playIceFreeze();
      return;
    }

    if (isKnockdown || target.hp <= 0) {
      target.state = target.hp <= 0 ? 'dead' : 'knockdown';
      target.stateTimer = 0;
      target.vx = attacker.facing * 5.5;
      target.vy = 8.5;
      sound.playHitHeavy();
    } else {
      target.state = 'hurt';
      target.stateTimer = 0;
      target.vx = attacker.facing * 2.5;
      sound.playPunch();
    }
  }

  private updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      p.life--;

      // Projectile particle trail
      if (p.element === 'fire') {
        this.spawnParticle(p.x, p.y, p.z, '#F97316', 4, 'smoke');
      } else if (p.element === 'ice') {
        this.spawnParticle(p.x, p.y, p.z, '#38BDF8', 3, 'spark');
      } else if (p.element === 'energy') {
        this.spawnParticle(p.x, p.y, p.z, '#60A5FA', 4, 'circle');
      }

      // Check collision with enemies
      let hit = false;
      for (const ent of this.entities) {
        if (ent.team === p.ownerTeam || ent.hp <= 0 || ent.invulnerableTimer > 0) continue;
        const dx = Math.abs(ent.x - p.x);
        const dz = Math.abs(ent.z - p.z);
        const dy = Math.abs(ent.y + 25 - p.y);

        if (dx < p.radius + 18 && dz < 18 && dy < 35) {
          const attacker = this.entities.find(e => e.id === p.ownerId) || this.player!;
          this.applyDamage(attacker, ent, p.damage, true, p.element);
          hit = true;
          break;
        }
      }

      if (hit || p.life <= 0 || p.x < 10 || p.x > this.arenaWidth || p.y < 0) {
        if (p.element === 'fire') {
          sound.playFireball();
          this.spawnAuraParticles(p.x, p.y, p.z, '#EF4444', 16);
        } else if (p.element === 'ice') {
          sound.playIceFreeze();
          this.spawnAuraParticles(p.x, p.y, p.z, '#38BDF8', 14);
        }
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateItems() {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.life <= 0) {
        this.items.splice(i, 1);
        continue;
      }

      // Item physics bounce
      if (item.y > 0 || item.vy !== 0) {
        item.y += item.vy;
        item.vy -= this.gravity * 0.7;
        if (item.y <= 0) {
          item.y = 0;
          item.vy = 0;
        }
      }

      // Pickup detection for player
      if (this.player && this.player.hp > 0 && item.type.startsWith('potion')) {
        const dx = Math.abs(this.player.x - item.x);
        const dz = Math.abs(this.player.z - item.z);
        if (dx < 30 && dz < 20) {
          sound.playPickup();
          if (item.type === 'potion_hp') {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + (item.value || 120));
            this.addDamageNumber(this.player.x, this.player.y + 60, this.player.z, `+${item.value || 120} HP`, '#10B981');
          } else if (item.type === 'potion_mp') {
            this.player.mp = Math.min(this.player.maxMp, this.player.mp + (item.value || 80));
            this.addDamageNumber(this.player.x, this.player.y + 60, this.player.z, `+${item.value || 80} MP`, '#3B82F6');
          }
          this.items.splice(i, 1);
        }
      }
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.z += pt.vz;
      pt.life--;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private findNearestEnemy(ent: Entity): Entity | null {
    let nearest: Entity | null = null;
    let minDist = Infinity;
    this.entities.forEach(other => {
      if (other.team === ent.team || other.hp <= 0) return;
      const dist = Math.hypot(other.x - ent.x, other.z - ent.z);
      if (dist < minDist) {
        minDist = dist;
        nearest = other;
      }
    });
    return nearest;
  }

  public spawnSparks(x: number, y: number, z: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y, z,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.2) * 5,
        vz: (Math.random() - 0.5) * 2,
        color,
        size: 2 + Math.random() * 3,
        life: 12 + Math.random() * 10,
        maxLife: 22,
        shape: 'spark'
      });
    }
  }

  public spawnDust(x: number, z: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: 2,
        z,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        vz: (Math.random() - 0.5) * 1,
        color: '#D1D5DB',
        size: 3 + Math.random() * 4,
        life: 15,
        maxLife: 15,
        shape: 'smoke'
      });
    }
  }

  public spawnAuraParticles(x: number, y: number, z: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + Math.random() * 40,
        z: z + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 1,
        vz: (Math.random() - 0.5) * 2,
        color,
        size: 3 + Math.random() * 3,
        life: 20 + Math.random() * 15,
        maxLife: 35,
        shape: 'circle'
      });
    }
  }

  public spawnParticle(x: number, y: number, z: number, color: string, size: number, shape: 'circle' | 'spark' | 'smoke' = 'circle') {
    this.particles.push({
      x, y, z,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      vz: (Math.random() - 0.5) * 0.8,
      color,
      size,
      life: 12,
      maxLife: 12,
      shape
    });
  }

  public addDamageNumber(x: number, y: number, z: number, text: string, color: string) {
    this.damageNumbers.push({
      id: Math.random().toString(),
      x: x + (Math.random() - 0.5) * 15,
      y,
      z,
      text,
      color,
      life: 38,
      vy: 1.6
    });
  }
}
