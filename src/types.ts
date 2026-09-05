export type GameMode = 'stage' | 'vs' | 'survival';

export type Language = 'ar' | 'en';

export interface FighterStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  speed: number;
  attackPower: number;
  defense: number;
}

export interface SpecialMove {
  id: string;
  name: { ar: string; en: string };
  command: string; // e.g. "D > A"
  mpCost: number;
  description: { ar: string; en: string };
  type: 'projectile' | 'melee' | 'area' | 'buff' | 'teleport';
  iconColor: string;
}

export interface CharacterDef {
  id: string;
  name: { ar: string; en: string };
  title: { ar: string; en: string };
  color: string;
  accentColor: string;
  hairColor: string;
  element: 'martial' | 'fire' | 'ice' | 'wind' | 'shadow';
  elementName: { ar: string; en: string };
  description: { ar: string; en: string };
  baseStats: FighterStats;
  moves: SpecialMove[];
}

export type ActionState = 
  | 'idle' 
  | 'walk' 
  | 'run' 
  | 'jump' 
  | 'jump_attack'
  | 'punch1' 
  | 'punch2' 
  | 'kick' 
  | 'dash_attack'
  | 'guard' 
  | 'hurt' 
  | 'knockdown' 
  | 'frozen'
  | 'burning'
  | 'special1' 
  | 'special2' 
  | 'special3'
  | 'dead';

export interface Projectile {
  id: string;
  ownerId: string;
  ownerTeam: number;
  x: number;
  y: number; // height off ground
  z: number; // depth
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  damage: number;
  element: 'energy' | 'fire' | 'ice' | 'wind' | 'shuriken';
  life: number;
  maxLife: number;
  piercing?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'spark' | 'smoke' | 'shard';
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  z: number;
  text: string;
  color: string;
  life: number;
  vy: number;
}

export interface DroppedItem {
  id: string;
  type: 'potion_hp' | 'potion_mp' | 'crate' | 'rock' | 'weapon_bat';
  x: number;
  y: number;
  z: number;
  vy: number;
  vz: number;
  life: number;
  value?: number;
}

export interface Entity {
  id: string;
  isPlayer: boolean;
  team: number; // 0 = Player Team, 1 = Enemies
  charDef: CharacterDef;
  
  // 3D coordinates in 2.5D arena
  x: number; // Left - Right (0 to Arena Width)
  y: number; // Height above ground (0 is ground, positive is in air)
  z: number; // Depth (0 is background edge, 200 is foreground edge)
  
  vx: number;
  vy: number;
  vz: number;
  
  facing: 1 | -1; // 1 = right, -1 = left
  
  state: ActionState;
  stateTimer: number;
  
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  
  isGuarding: boolean;
  guardTimer: number;
  
  comboCount: number;
  lastHitTime: number;
  
  invulnerableTimer: number;
  
  // AI Controller properties
  aiTargetId?: string;
  aiTimer: number;
  aiAggro: number;
  
  // Shadow clone tag
  isClone?: boolean;
  cloneTimer?: number;

  heldItem?: DroppedItem;
}

export interface GameStage {
  stageNumber: number;
  name: { ar: string; en: string };
  bgTheme: 'great_wall' | 'bandit_camp' | 'dark_citadel';
  waves: {
    enemyTypes: { charId: string; count: number; isBoss?: boolean }[];
  }[];
}
