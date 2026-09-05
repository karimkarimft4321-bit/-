import { GameStage } from '../types';

export const STAGES: GameStage[] = [
  {
    stageNumber: 1,
    name: {
      ar: 'المرحلة 1: سور القتال العظيم',
      en: 'Stage 1: The Great Wall'
    },
    bgTheme: 'great_wall',
    waves: [
      {
        enemyTypes: [
          { charId: 'bandit', count: 3 }
        ]
      },
      {
        enemyTypes: [
          { charId: 'bandit', count: 4 },
          { charId: 'hunter', count: 2 }
        ]
      },
      {
        enemyTypes: [
          { charId: 'bandit', count: 4 },
          { charId: 'hunter', count: 3 }
        ]
      }
    ]
  },
  {
    stageNumber: 2,
    name: {
      ar: 'المرحلة 2: معسكر العصابة الحصين',
      en: 'Stage 2: Bandit Fortress'
    },
    bgTheme: 'bandit_camp',
    waves: [
      {
        enemyTypes: [
          { charId: 'bandit', count: 4 },
          { charId: 'hunter', count: 3 }
        ]
      },
      {
        enemyTypes: [
          { charId: 'bandit', count: 5 },
          { charId: 'mark', count: 1, isBoss: true }
        ]
      },
      {
        enemyTypes: [
          { charId: 'hunter', count: 4 },
          { charId: 'mark', count: 2, isBoss: true }
        ]
      }
    ]
  },
  {
    stageNumber: 3,
    name: {
      ar: 'المرحلة 3: عرش الظلام - معركة جوليان',
      en: 'Stage 3: Dark Citadel - Julian\'s Domain'
    },
    bgTheme: 'dark_citadel',
    waves: [
      {
        enemyTypes: [
          { charId: 'bandit', count: 4 },
          { charId: 'mark', count: 2 }
        ]
      },
      {
        enemyTypes: [
          { charId: 'hunter', count: 5 },
          { charId: 'mark', count: 2 }
        ]
      },
      {
        enemyTypes: [
          { charId: 'bandit', count: 4 },
          { charId: 'hunter', count: 2 },
          { charId: 'julian', count: 1, isBoss: true }
        ]
      }
    ]
  }
];
