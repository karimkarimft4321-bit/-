import { CharacterDef } from '../types';

export const PLAYABLE_CHARACTERS: CharacterDef[] = [
  {
    id: 'davis',
    name: { ar: 'ديفيس', en: 'Davis' },
    title: { ar: 'مقاتل الطاقة الأسطوري', en: 'Dragon Fist Master' },
    color: '#3B82F6', // Royal Blue
    accentColor: '#60A5FA',
    hairColor: '#F59E0B', // Blonde/Brown
    element: 'martial',
    elementName: { ar: 'طاقة قتالية', en: 'Ki Martial' },
    description: {
      ar: 'المقاتل الكلاسيكي المتوازن صاحب قبضة التنين وكرات طاقة الكي السريعة.',
      en: 'Balanced legendary brawler featuring Dragon Uppercut and high-speed ki blasts.'
    },
    baseStats: {
      hp: 500,
      maxHp: 500,
      mp: 200,
      maxMp: 200,
      speed: 4.2,
      attackPower: 35,
      defense: 12
    },
    moves: [
      {
        id: 'davis_energy',
        name: { ar: 'كرة الكي (Energy Blast)', en: 'Energy Blast' },
        command: 'D > A',
        mpCost: 35,
        description: { ar: 'إطلاق مقذوف طاقة أزرق سريع يخترق الأعداء', en: 'Fires a fast blue ki projectile forward' },
        type: 'projectile',
        iconColor: '#3B82F6'
      },
      {
        id: 'davis_dragon',
        name: { ar: 'لكمة التنين (Dragon Upper)', en: 'Dragon Uppercut' },
        command: 'D ^ A',
        mpCost: 45,
        description: { ar: 'لكمة صاعدة عنيفة تقذف الأعداء في الهواء مع أضرار جسيمة', en: 'Rising flame fist launching foes sky-high' },
        type: 'melee',
        iconColor: '#F59E0B'
      },
      {
        id: 'davis_flurry',
        name: { ar: 'عاصفة اللكمات (Hyper Barrage)', en: 'Hyper Barrage' },
        command: 'D v A',
        mpCost: 40,
        description: { ar: 'سلسلة متتالية من 6 لكمات خاطفة لا تصد', en: 'Rapid 6-punch combo that locks enemies' },
        type: 'melee',
        iconColor: '#EF4444'
      }
    ]
  },
  {
    id: 'firen',
    name: { ar: 'فايرن', en: 'Firen' },
    title: { ar: 'سيد اللهب الحارق', en: 'Flame Pyromancer' },
    color: '#DC2626', // Red
    accentColor: '#F97316',
    hairColor: '#EF4444', // Red hair
    element: 'fire',
    elementName: { ar: 'نار وحمم', en: 'Fire & Magma' },
    description: {
      ar: 'مقاتل السحر الناري قادر على تفجير الساحات وحرق أي خصم يقترب منه.',
      en: 'Fierce pyromancer wielding devastating explosive fireballs and flame pillars.'
    },
    baseStats: {
      hp: 460,
      maxHp: 460,
      mp: 240,
      maxMp: 240,
      speed: 3.8,
      attackPower: 42,
      defense: 10
    },
    moves: [
      {
        id: 'firen_ball',
        name: { ar: 'الكرة النارية (Fire Ball)', en: 'Fire Ball' },
        command: 'D > A',
        mpCost: 40,
        description: { ar: 'كرة نارية متوهجة تنفجر عند ملامسة الخصوم وتترك أثراً حارقاً', en: 'Blazing projectile that explodes on impact' },
        type: 'projectile',
        iconColor: '#EF4444'
      },
      {
        id: 'firen_inferno',
        name: { ar: 'عمود الجحيم (Inferno Eruption)', en: 'Inferno Eruption' },
        command: 'D ^ A',
        mpCost: 60,
        description: { ar: 'استدعاء إعصار ناري حوله يطرد ويحرق جميع الأعداء المحيطين', en: 'Erupts a raging pillar of fire all around him' },
        type: 'area',
        iconColor: '#F97316'
      },
      {
        id: 'firen_dash',
        name: { ar: 'الاندفاع الناري (Blazing Charge)', en: 'Blazing Charge' },
        command: 'D > J',
        mpCost: 45,
        description: { ar: 'اندفاع هجومي سريع يشعل الأرض بالنيران الحارقة', en: 'Superfast forward charge igniting the ground' },
        type: 'melee',
        iconColor: '#F59E0B'
      }
    ]
  },
  {
    id: 'freeze',
    name: { ar: 'فريز', en: 'Freeze' },
    title: { ar: 'ساحر الجليد الأزلي', en: 'Cryo Sorcerer' },
    color: '#0284C7', // Sky Cyan
    accentColor: '#38BDF8',
    hairColor: '#BAE6FD', // White-Blue
    element: 'ice',
    elementName: { ar: 'جليد وصقيع', en: 'Frost & Ice' },
    description: {
      ar: 'يتحكم في البرد القارس، يجمد الأعداء ويقضي عليهم بسيوف الجليد الحادة.',
      en: 'Master of frost who freezes opponents in solid ice blocks and summons icy blades.'
    },
    baseStats: {
      hp: 470,
      maxHp: 470,
      mp: 230,
      maxMp: 230,
      speed: 3.9,
      attackPower: 38,
      defense: 14
    },
    moves: [
      {
        id: 'freeze_ball',
        name: { ar: 'كرة التجميد (Ice Ball)', en: 'Ice Ball' },
        command: 'D > A',
        mpCost: 40,
        description: { ar: 'كرة جليدية تجمد العدو لمدة 3 ثوانٍ وتمنعه من الحركة', en: 'Freezes target completely in a block of ice' },
        type: 'projectile',
        iconColor: '#38BDF8'
      },
      {
        id: 'freeze_icicles',
        name: { ar: 'عاصفة الشظايا (Icicle Storm)', en: 'Icicle Storm' },
        command: 'D ^ A',
        mpCost: 55,
        description: { ar: 'تساقط شظايا ثلجية حادة من السماء على ساحة المعركة', en: 'Summons sharp ice stalactites falling from the sky' },
        type: 'area',
        iconColor: '#0284C7'
      },
      {
        id: 'freeze_sword',
        name: { ar: 'سيف الجليد (Ice Sword Slash)', en: 'Ice Sword' },
        command: 'D v A',
        mpCost: 35,
        description: { ar: 'استدعاء سيف جليدي عملاق يقطع الأعداء بضربة واسعة النطاق', en: 'Conjures a chilling ice greatsword slash' },
        type: 'melee',
        iconColor: '#93C5FD'
      }
    ]
  },
  {
    id: 'woody',
    name: { ar: 'وودي', en: 'Woody' },
    title: { ar: 'فارس الريح الأكروباتي', en: 'Acrobatic Wind Fighter' },
    color: '#059669', // Emerald Green
    accentColor: '#34D399',
    hairColor: '#D97706', // Brown
    element: 'wind',
    elementName: { ar: 'رياح وخفة', en: 'Wind & Agility' },
    description: {
      ar: 'أسرع مقاتل في اللعبة، حركاته أكروباتية وركلاته الدائرية لا يمكن تفاديها.',
      en: 'The most agile fighter, executing lightning flips, teleport dives, and wind crescents.'
    },
    baseStats: {
      hp: 480,
      maxHp: 480,
      mp: 210,
      maxMp: 210,
      speed: 4.6,
      attackPower: 34,
      defense: 11
    },
    moves: [
      {
        id: 'woody_crescent',
        name: { ar: 'هلال الرياح (Wind Crescent)', en: 'Wind Crescent' },
        command: 'D > A',
        mpCost: 35,
        description: { ar: 'شفرة هوائية حادة تقطع صفوف الأعداء وتدفعهم للخلف', en: 'Crescent energy wave slicing across enemies' },
        type: 'projectile',
        iconColor: '#10B981'
      },
      {
        id: 'woody_tiger',
        name: { ar: 'ركلة النمر الشقلبية (Tiger Flip)', en: 'Tiger Flip' },
        command: 'D ^ A',
        mpCost: 40,
        description: { ar: 'قفزة بهلوانية مروعة وركلة طائرة تضرب عدة مرات في الهواء', en: 'Spinning somersault kick hitting multiple times' },
        type: 'melee',
        iconColor: '#34D399'
      },
      {
        id: 'woody_teleport',
        name: { ar: 'الانتقال الفوري (Teleport Dive)', en: 'Teleport Dive' },
        command: 'D v J',
        mpCost: 45,
        description: { ar: 'انتقال خاطف خلف أقرب عدو مع ركلة هابطة مباغتة', en: 'Teleports directly above enemy and drop-kicks' },
        type: 'teleport',
        iconColor: '#059669'
      }
    ]
  },
  {
    id: 'rudolf',
    name: { ar: 'رودولف', en: 'Rudolf' },
    title: { ar: 'نينجا الظل والسراب', en: 'Shadow Ninja Assassin' },
    color: '#4B5563', // Slate / Ninja
    accentColor: '#9CA3AF',
    hairColor: '#1F2937', // Black
    element: 'shadow',
    elementName: { ar: 'ظل وسرعة', en: 'Shadow & Stealth' },
    description: {
      ar: 'نينجا ملثم يرمي نجوم الشوريكين، ويصنع نسخ ظل تقاتل معه في الميدان.',
      en: 'Masked ninja who throws triple shurikens, slashes with katana, and creates shadow clones.'
    },
    baseStats: {
      hp: 450,
      maxHp: 450,
      mp: 220,
      maxMp: 220,
      speed: 4.4,
      attackPower: 36,
      defense: 10
    },
    moves: [
      {
        id: 'rudolf_shuriken',
        name: { ar: 'نجوم الشوريكين (Triple Shuriken)', en: 'Triple Shuriken' },
        command: 'D > A',
        mpCost: 30,
        description: { ar: 'إلقاء 3 نجوم نينجا في شكل مروحة تصيب عدة أهداف', en: 'Throws 3 deadly shurikens in spread formation' },
        type: 'projectile',
        iconColor: '#9CA3AF'
      },
      {
        id: 'rudolf_katana',
        name: { ar: 'اندفاع السيف (Katana Flash)', en: 'Katana Flash' },
        command: 'D ^ A',
        mpCost: 45,
        description: { ar: 'اندفاعة شبحية مع سيف الكاتانا تخترق خطوط الأعداء بنزيف حاد', en: 'High-speed katana dash slicing through enemies' },
        type: 'melee',
        iconColor: '#E5E7EB'
      },
      {
        id: 'rudolf_clone',
        name: { ar: 'نسخة الظل (Shadow Clone)', en: 'Shadow Clone' },
        command: 'D v A',
        mpCost: 65,
        description: { ar: 'استدعاء نسخة ظل نينجا مستقلة تقاتل بجانبك وتشتت الأعداء', en: 'Spawns an AI shadow clone ally to fight alongside you' },
        type: 'buff',
        iconColor: '#6B7280'
      }
    ]
  }
];

export const ENEMY_CHARACTERS: Record<string, CharacterDef> = {
  bandit: {
    id: 'bandit',
    name: { ar: 'قطاع الطرق (Bandit)', en: 'Bandit' },
    title: { ar: 'عصابة الشوارع', en: 'Thug' },
    color: '#B45309', // Brown/Amber
    accentColor: '#F59E0B',
    hairColor: '#78350F',
    element: 'martial',
    elementName: { ar: 'ملاكمة عادية', en: 'Physical' },
    description: { ar: 'أحد أفراد العصابة الأساسيين، يقاتل باللكمات والركلات الجماعية.', en: 'Standard street brawler.' },
    baseStats: {
      hp: 180,
      maxHp: 180,
      mp: 60,
      maxMp: 60,
      speed: 3.2,
      attackPower: 18,
      defense: 6
    },
    moves: []
  },
  hunter: {
    id: 'hunter',
    name: { ar: 'صياد السهام (Hunter)', en: 'Hunter' },
    title: { ar: 'رامي السهام', en: 'Archer' },
    color: '#15803D', // Forest green
    accentColor: '#86EFAC',
    hairColor: '#854D0E',
    element: 'wind',
    elementName: { ar: 'رماية عن بعد', en: 'Ranged' },
    description: { ar: 'يهاجم عن بعد بالسهام السريعة ويتراجع عند الاقتراب منه.', en: 'Keeps distance and fires arrows.' },
    baseStats: {
      hp: 160,
      maxHp: 160,
      mp: 100,
      maxMp: 100,
      speed: 3.6,
      attackPower: 22,
      defense: 5
    },
    moves: []
  },
  mark: {
    id: 'mark',
    name: { ar: 'مارك العملاق (Mark)', en: 'Mark' },
    title: { ar: 'المقاتل الثقيل', en: 'Heavy Brawler' },
    color: '#4338CA', // Indigo
    accentColor: '#818CF8',
    hairColor: '#312E81',
    element: 'martial',
    elementName: { ar: 'قوة بدنية خارقة', en: 'Brute Force' },
    description: { ar: 'ملاكم ضخم يصعب طرحه أرضاً، يمتلك ضربات ثقيلة وطاقة تحمل عالية.', en: 'Heavy tank with high armor and devastating slam.' },
    baseStats: {
      hp: 340,
      maxHp: 340,
      mp: 100,
      maxMp: 100,
      speed: 2.8,
      attackPower: 28,
      defense: 16
    },
    moves: []
  },
  julian: {
    id: 'julian',
    name: { ar: 'جوليان الشرير (Lord Julian)', en: 'Lord Julian' },
    title: { ar: 'زعيم الظلام والدمار', en: 'Dark Overlord Boss' },
    color: '#7E22CE', // Purple / Dark
    accentColor: '#A855F7',
    hairColor: '#581C87',
    element: 'shadow',
    elementName: { ar: 'طاقة مظلمة', en: 'Dark Chaos' },
    description: { ar: 'الزعيم النهائي الجبار، يطلق مقذوفات ظلامية كاسحة وموجات صدمة تزلزل الأرض.', en: 'The ultimate dark boss wielding massive soul skulls and crushing shockwaves.' },
    baseStats: {
      hp: 1200,
      maxHp: 1200,
      mp: 400,
      maxMp: 400,
      speed: 3.5,
      attackPower: 48,
      defense: 22
    },
    moves: [
      {
        id: 'julian_blast',
        name: { ar: 'قذيفة الظلام (Dark Sphere)', en: 'Dark Sphere' },
        command: 'D > A',
        mpCost: 40,
        description: { ar: 'كرة مظلمة ضخمة تسبب انفجاراً كاسحاً', en: 'Huge dark sphere exploding on impact' },
        type: 'projectile',
        iconColor: '#A855F7'
      }
    ]
  }
};
