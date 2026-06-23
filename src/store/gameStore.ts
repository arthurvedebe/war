import { create } from 'zustand';
import { Player, Unit, Skin, Reward, Faction, FactionType, UnitTemplate } from '../types';

export const XP_THRESHOLDS = [200, 500, 1000, 1800, 3000, 5000];

export const getAvatarSource = (avatarUri: string) => {
  switch (avatarUri) {
    case 'golem_avatar':
      return require('../../assets/images/golem_avatar.png');
    case 'sylvain_avatar':
      return require('../../assets/images/sylvain_avatar.png');
    case 'techno_avatar':
      return require('../../assets/images/techno_avatar.png');
    case 'gold_coin':
      return require('../../assets/images/gold_coin.png');
    case 'icon_alien':
      return require('../../assets/images/icon_alien.png');
    case 'icon_robot':
      return require('../../assets/images/icon_robot.png');
    case 'icon_dragon':
      return require('../../assets/images/icon_dragon.png');
    case 'icon_wizard':
      return require('../../assets/images/icon_wizard.png');
    case 'icon_phoenix':
      return require('../../assets/images/icon_phoenix.png');
    case 'icon_crown':
      return require('../../assets/images/icon_crown.png');
    case 'icon_controller':
      return require('../../assets/images/icon_controller.png');
    case 'icon_ninja':
      return require('../../assets/images/icon_ninja.png');
    case 'icon_skull':
      return require('../../assets/images/icon_skull.png');
    default:
      return require('../../assets/images/techno_avatar.png');
  }
};

export const getSkinSource = (skinId: string) => {
  switch (skinId) {
    case 'skin-neon':
      return require('../../assets/images/skin_neon.png');
    case 'skin-plasma':
      return require('../../assets/images/skin_plasma.png');
    default:
      return require('../../assets/images/techno_avatar.png');
  }
};

// Retourne l'image spécifique à chaque unité selon sa faction et son type
export const getUnitSkinSource = (factionId: string, unitType: string) => {
  const key = `${factionId}_${unitType}`;
  switch (key) {
    // Golems
    case 'golems_hero':   return require('../../assets/images/skin_golem_hero.png');
    case 'golems_heavy':  return require('../../assets/images/skin_golem_heavy.png');
    case 'golems_scout':  return require('../../assets/images/skin_golem_scout.png');
    case 'golems_ranged': return require('../../assets/images/skin_golem_ranged.png');
    // Sylvains
    case 'sylvains_hero':   return require('../../assets/images/skin_sylvain_hero.png');
    case 'sylvains_heavy':  return require('../../assets/images/skin_sylvain_heavy.png');
    case 'sylvains_scout':  return require('../../assets/images/skin_sylvain_scout.png');
    case 'sylvains_ranged': return require('../../assets/images/skin_sylvain_ranged.png');
    // Technos
    case 'technos_hero':   return require('../../assets/images/skin_techno_hero.png');
    case 'technos_heavy':  return require('../../assets/images/skin_techno_heavy.png');
    case 'technos_scout':  return require('../../assets/images/skin_techno_scout.png');
    case 'technos_ranged': return require('../../assets/images/skin_techno_ranged.png');
    default: return require('../../assets/images/techno_avatar.png');
  }
};

// Musiques de menu disponibles
export const MENU_MUSIC_TRACKS = [
  { id: 'menu_default', name: 'Cyber Horizon', theme: 'Cyberpunk électronique', cost: 0, unlocked: true },
  { id: 'menu_ancient', name: 'Légendes Anciennes', theme: 'Épique orchestral médiéval', cost: 200, unlocked: false },
  { id: 'menu_space',   name: 'Void Protocol',    theme: 'Synthwave spatial',              cost: 250, unlocked: false },
  { id: 'menu_tribal',  name: 'Tambours de la Faille', theme: 'Tribal / percussions guerrières', cost: 180, unlocked: false },
];


// Factions jouables et constantes physiques associées (niveau macro)
export const PLAYABLE_FACTIONS: Faction[] = [
  {
    id: 'golems',
    name: 'Golems de Rune',
    description: 'Lourds et résistants. Difficiles à repousser, infligent des dégâts colossaux à l\'impact.',
    avatar: require('../../assets/images/golem_avatar.png'),
    physics: { density: 0.015, restitution: 0.05, friction: 0.6 }
  },
  {
    id: 'sylvains',
    name: 'Sylvains de l\'Orée',
    description: 'Légers, agiles et très rebondissants. Parfaits pour contourner les obstacles.',
    avatar: require('../../assets/images/sylvain_avatar.png'),
    physics: { density: 0.003, restitution: 0.75, friction: 0.15 }
  },
  {
    id: 'technos',
    name: 'Technomanciens',
    description: 'Armure équilibrée. Standard et polyvalents dans toutes les situations.',
    avatar: require('../../assets/images/techno_avatar.png'),
    physics: { density: 0.007, restitution: 0.35, friction: 0.4 }
  }
];

// Les templates d'unités (6 par faction : 1 Héros, 2 Heavies, 2 Scouts, 1 Ranged)
export const FACTION_UNIT_TEMPLATES: {
  [faction in FactionType]: UnitTemplate[];
} = {
  golems: [
    {
      id: 'golem_hero_granite',
      unitType: 'hero',
      name: 'Colosse de Granite',
      cost: 550,
      maxHp: 170,
      description: 'Héros colossal sculpté dans du granite runique. PV massifs, très lourd, difficile à repousser.',
      physics: { radius: 24, density: 0.022, restitution: 0.02, friction: 0.7 },
      tactical: { moveRange: 65, attackRange: 95, gridMoveRange: 2, gridAttackRange: 1 },
      visuals: { glowColor: '#eab308', symbol: '👑' }
    },
    {
      id: 'golem_heavy_obsidian',
      unitType: 'heavy',
      name: 'Bastion d\'Obsidienne',
      cost: 300,
      maxHp: 110,
      description: 'Garde défensif en roche noire volcanique. Masse extrême bloquant les passages.',
      physics: { radius: 27, density: 0.018, restitution: 0.05, friction: 0.8 },
      tactical: { moveRange: 55, attackRange: 75, gridMoveRange: 1, gridAttackRange: 1 },
      visuals: { glowColor: '#ef4444', symbol: '🛡️' }
    },
    {
      id: 'golem_heavy_magnetite',
      unitType: 'heavy',
      name: 'Protecteur de Magnétite',
      cost: 290,
      maxHp: 105,
      description: 'Sentinelle magnétique dense. Friction élevée qui l\'arrête net après un impact.',
      physics: { radius: 25, density: 0.016, restitution: 0.03, friction: 0.9 },
      tactical: { moveRange: 60, attackRange: 80, gridMoveRange: 1, gridAttackRange: 1 },
      visuals: { glowColor: '#78716c', symbol: '🛡️' }
    },
    {
      id: 'golem_scout_pebble',
      unitType: 'scout',
      name: 'Galet Roulant',
      cost: 130,
      maxHp: 50,
      description: 'Débris de roche rapide. Léger, idéal pour propulser les obstacles à faible coût.',
      physics: { radius: 16, density: 0.010, restitution: 0.20, friction: 0.5 },
      tactical: { moveRange: 105, attackRange: 125, gridMoveRange: 3, gridAttackRange: 1 },
      visuals: { glowColor: '#a8a29e', symbol: '⚡' }
    },
    {
      id: 'golem_scout_flint',
      unitType: 'scout',
      name: 'Éclat de Silex',
      cost: 140,
      maxHp: 55,
      description: 'Fragment de pierre affilé. Très faible friction pour glisser rapidement.',
      physics: { radius: 15, density: 0.012, restitution: 0.15, friction: 0.3 },
      tactical: { moveRange: 115, attackRange: 135, gridMoveRange: 3, gridAttackRange: 1 },
      visuals: { glowColor: '#cbd5e1', symbol: '⚡' }
    },
    {
      id: 'golem_ranged_bombard',
      unitType: 'ranged',
      name: 'Bombarde de Rune-Roche',
      cost: 380,
      maxHp: 80,
      description: 'Artillerie lourde tirant des rochers magiques géants dévastateurs (Très longue portée d\'attaque).',
      physics: { radius: 20, density: 0.014, restitution: 0.05, friction: 0.6 },
      tactical: { moveRange: 65, attackRange: 185, gridMoveRange: 2, gridAttackRange: 5 },
      visuals: { glowColor: '#f97316', symbol: '🎯' }
    }
  ],
  sylvains: [
    {
      id: 'sylvain_hero_gaia',
      unitType: 'hero',
      name: 'Avatar de Gaia',
      cost: 480,
      maxHp: 130,
      description: 'Esprit sylvestre légendaire. Très agile et rebondissant, il ricoche avec grâce.',
      physics: { radius: 22, density: 0.0035, restitution: 0.85, friction: 0.10 },
      tactical: { moveRange: 95, attackRange: 115, gridMoveRange: 2, gridAttackRange: 1 },
      visuals: { glowColor: '#22c55e', symbol: '👑' }
    },
    {
      id: 'sylvain_heavy_bark',
      unitType: 'heavy',
      name: 'Écorce-Bouclier',
      cost: 280,
      maxHp: 95,
      description: 'Protecteur de la forêt en bois de fer. Absorbe les impacts en oscillant.',
      physics: { radius: 26, density: 0.0055, restitution: 0.60, friction: 0.20 },
      tactical: { moveRange: 75, attackRange: 90, gridMoveRange: 1, gridAttackRange: 1 },
      visuals: { glowColor: '#15803d', symbol: '🛡️' }
    },
    {
      id: 'sylvain_heavy_trunk',
      unitType: 'heavy',
      name: 'Tronc Pétrifié Ancien',
      cost: 270,
      maxHp: 100,
      description: 'Souche séculaire pétrifiée. Très stable, offre une excellente défense végétale.',
      physics: { radius: 25, density: 0.0065, restitution: 0.40, friction: 0.35 },
      tactical: { moveRange: 65, attackRange: 80, gridMoveRange: 1, gridAttackRange: 1 },
      visuals: { glowColor: '#854d0e', symbol: '🛡️' }
    },
    {
      id: 'sylvain_scout_leaf',
      unitType: 'scout',
      name: 'Voltigeur Feuille-Vent',
      cost: 170,
      maxHp: 65,
      description: 'Créature foliaire super légère. Rebondit intensément sur toutes les surfaces.',
      physics: { radius: 15, density: 0.0020, restitution: 0.95, friction: 0.05 },
      tactical: { moveRange: 135, attackRange: 145, gridMoveRange: 3, gridAttackRange: 1 },
      visuals: { glowColor: '#84cc16', symbol: '⚡' }
    },
    {
      id: 'sylvain_scout_spore',
      unitType: 'scout',
      name: 'Graine de Pissenlit',
      cost: 160,
      maxHp: 60,
      description: 'Spore aérienne à densité minimale. Flotte longuement et rebondit avec légèreté.',
      physics: { radius: 16, density: 0.0015, restitution: 0.90, friction: 0.10 },
      tactical: { moveRange: 145, attackRange: 135, gridMoveRange: 3, gridAttackRange: 1 },
      visuals: { glowColor: '#f8fafc', symbol: '⚡' }
    },
    {
      id: 'sylvain_ranged_sap',
      unitType: 'ranged',
      name: 'Baliste de Sève Sauvage',
      cost: 320,
      maxHp: 60,
      description: 'Propulse des grappes de sève collante (Moyenne portée d\'attaque).',
      physics: { radius: 19, density: 0.0030, restitution: 0.70, friction: 0.15 },
      tactical: { moveRange: 80, attackRange: 175, gridMoveRange: 2, gridAttackRange: 3 },
      visuals: { glowColor: '#ec4899', symbol: '🎯' }
    }
  ],
  technos: [
    {
      id: 'techno_hero_apex',
      unitType: 'hero',
      name: 'Méca-Commandeur Apex',
      cost: 500,
      maxHp: 150,
      description: 'Exosquelette blindé équipé de stabilisateurs. Équilibré et robuste pour mener l\'assaut.',
      physics: { radius: 23, density: 0.0085, restitution: 0.35, friction: 0.40 },
      tactical: { moveRange: 85, attackRange: 105, gridMoveRange: 2, gridAttackRange: 1 },
      visuals: { glowColor: '#3b82f6', symbol: '👑' }
    },
    {
      id: 'techno_heavy_sentry',
      unitType: 'heavy',
      name: 'Sentinelle Cuirassée',
      cost: 320,
      maxHp: 100,
      description: 'Garde robotique d\'acier. Masse équilibrée pour repousser les lignes ennemies.',
      physics: { radius: 27, density: 0.0120, restitution: 0.25, friction: 0.50 },
      tactical: { moveRange: 70, attackRange: 85, gridMoveRange: 1, gridAttackRange: 1 },
      visuals: { glowColor: '#06b6d4', symbol: '🛡️' }
    },
    {
      id: 'techno_heavy_shield',
      unitType: 'heavy',
      name: 'Barrière Tactique Holo',
      cost: 310,
      maxHp: 105,
      description: 'Robot bouclier lourd avec friction renforcée pour maintenir les positions.',
      physics: { radius: 26, density: 0.0140, restitution: 0.15, friction: 0.60 },
      tactical: { moveRange: 65, attackRange: 75, gridMoveRange: 1, gridAttackRange: 1 },
      visuals: { glowColor: '#22d3ee', symbol: '🛡️' }
    },
    {
      id: 'techno_scout_probe',
      unitType: 'scout',
      name: 'Drone Cyber-Sonde',
      cost: 150,
      maxHp: 60,
      description: 'Drone de reconnaissance rapide doté de micro-propulseurs électriques.',
      physics: { radius: 16, density: 0.0050, restitution: 0.45, friction: 0.30 },
      tactical: { moveRange: 120, attackRange: 130, gridMoveRange: 3, gridAttackRange: 1 },
      visuals: { glowColor: '#eab308', symbol: '⚡' }
    },
    {
      id: 'techno_scout_brawler',
      unitType: 'scout',
      name: 'Micro-Brawler Vecteur',
      cost: 160,
      maxHp: 65,
      description: 'Mini-drone de combat sur chenilles, plus dense, conçu pour foncer sur les ennemis.',
      physics: { radius: 17, density: 0.0070, restitution: 0.30, friction: 0.35 },
      tactical: { moveRange: 110, attackRange: 120, gridMoveRange: 3, gridAttackRange: 1 },
      visuals: { glowColor: '#f97316', symbol: '⚡' }
    },
    {
      id: 'techno_ranged_plasma',
      unitType: 'ranged',
      name: 'Exo-Canon à Fission Plasma',
      cost: 350,
      maxHp: 70,
      description: 'Tire des obus plasma thermiques (Longue portée d\'attaque).',
      physics: { radius: 19, density: 0.0070, restitution: 0.30, friction: 0.35 },
      tactical: { moveRange: 75, attackRange: 165, gridMoveRange: 2, gridAttackRange: 4 },
      visuals: { glowColor: '#8b5cf6', symbol: '🎯' }
    }
  ]
};

const DEFAULT_SKINS: Skin[] = [
  {
    id: 'skin-default',
    name: 'Pion Standard',
    uri: 'skin-default',
    particleLevel: 0,
    unlocked: true,
    cost: 0,
  },
  {
    id: 'skin-neon',
    name: 'Luminescence Néon',
    uri: 'skin-neon',
    particleLevel: 3,
    unlocked: false,
    cost: 150,
  },
  {
    id: 'skin-plasma',
    name: 'Plasma Stellaire',
    uri: 'skin-plasma',
    particleLevel: 5,
    unlocked: false,
    cost: 350,
  },
];

const INITIAL_REWARDS: Reward[] = [
  {
    id: 'rew-first-shot',
    title: 'Premier Impact',
    description: 'Infliger des dégâts à une unité ennemie.',
    unlocked: false,
  },
  {
    id: 'rew-tactician',
    title: 'Tacticien Agile',
    description: 'Terminer un tour avec des points d\'action restants.',
    unlocked: false,
  },
  {
    id: 'rew-rich',
    title: 'Génie Capitaliste',
    description: 'Accumuler plus de 500 pièces d\'or. Récompense : Icône d\'Or',
    unlocked: false,
  },
  {
    id: 'rew-first-win',
    title: 'Première Victoire',
    description: 'Remporter un combat tactique.',
    unlocked: false,
  },
  {
    id: 'rew-golem-fan',
    title: 'Maître de la Roche',
    description: 'Gagner un combat avec la faction des Golems.',
    unlocked: false,
  },
  {
    id: 'rew-sylvain-fan',
    title: 'Esprit de la Forêt',
    description: 'Gagner un combat avec la faction des Sylvains.',
    unlocked: false,
  },
  {
    id: 'rew-techno-fan',
    title: 'Savant Fou',
    description: 'Gagner un combat avec la faction des Technomanciens.',
    unlocked: false,
  },
  {
    id: 'rew-collector',
    title: 'Collectionneur Cyber',
    description: 'Débloquer au moins 3 skins dans la boutique.',
    unlocked: false,
  },
  {
    id: 'rew-level-5',
    title: 'Vétéran de la Faille',
    description: 'Atteindre le niveau 5 de profil.',
    unlocked: false,
  },
  {
    id: 'rew-xp-hunter',
    title: 'Chasseur d\'XP',
    description: 'Accumuler plus de 1500 XP au total.',
    unlocked: false,
  },
];

export type SetupPhase = 'setup_points' | 'setup_factions' | 'setup_draft' | 'playing';

interface GameState {
  // Phase de Setup
  setupPhase: SetupPhase;
  pointsLimit: number; // 1000, 1500, 2000
  player1Faction: FactionType | null;
  player2Faction: FactionType | null;
  player1DraftPoints: number;
  player2DraftPoints: number;
  draftTurn: Player;

  // État du jeu
  currentTurn: Player;
  actionPoints: number;
  units: Unit[];
  skins: Skin[];
  rewards: Reward[];
  gold: number;
  winner: Player | null;

  // Progression d'XP
  xp: number;
  level: number;
  claimedRewards: string[];

  // Profil Utilisateur
  username: string;
  avatarUri: string;
  unlockedTitles: string[];
  selectedTitle: string;
  unlockedIcons: string[];

  // Musique de menu
  selectedMenuMusic: string;
  unlockedMusicTracks: string[];

  // Actions de configuration
  setPointsLimit: (points: number) => void;
  selectFaction: (player: Player, faction: FactionType) => void;
  draftUnit: (player: Player, templateId: string) => boolean;
  completeDraft: () => void;

  // Actions de jeu
  switchTurn: () => void;
  useActionPoints: (amount: number) => boolean;
  setUnitMoved: (id: string) => void;
  setUnitAttacked: (id: string) => void;
  moveUnitGrid: (id: string, col: number, row: number) => boolean;
  attackUnitGrid: (attackerId: string, targetId: string, damage: number) => boolean;
  damageUnit: (id: string, amount: number) => void;
  healUnit: (id: string, amount: number) => void;
  addGold: (amount: number) => void;
  buySkin: (skinId: string) => boolean;
  equipSkin: (unitId: string, skinId: string) => void;
  unlockReward: (rewardId: string) => void;
  updateUsername: (name: string) => void;
  updateAvatar: (uri: string) => void;
  updateTitle: (title: string) => void;
  buyTitle: (titleId: string, titleName: string, cost: number) => boolean;
  buyIcon: (iconId: string, iconEmoji: string, cost: number) => boolean;
  buyMusic: (musicId: string, cost: number) => boolean;
  setMenuMusic: (musicId: string) => void;
  resetGame: () => void;
  resetProfile: () => void;
  claimProgressionReward: (milestoneId: string, gold: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Valeurs initiales du setup
  setupPhase: 'setup_points',
  pointsLimit: 1500,
  player1Faction: null,
  player2Faction: null,
  player1DraftPoints: 0,
  player2DraftPoints: 0,
  draftTurn: 'player1',

  // Valeurs de jeu
  currentTurn: 'player1',
  actionPoints: 3,
  skins: DEFAULT_SKINS,
  rewards: INITIAL_REWARDS,
  units: [],
  gold: 0,
  winner: null,

  // Progression d'XP
  xp: 0,
  level: 1,
  claimedRewards: [],

  // Profil Utilisateur
  username: 'COMMANDANT_JULIEN',
  avatarUri: 'techno_avatar',
  unlockedTitles: ['Légende de la Faille Tactique', 'Recrue de la Faille'],
  selectedTitle: 'Légende de la Faille Tactique',
  unlockedIcons: ['techno_avatar', 'golem_avatar', 'sylvain_avatar'],

  // Musique
  selectedMenuMusic: 'menu_default',
  unlockedMusicTracks: ['menu_default'],


  setPointsLimit: (points: number) => {
    set({
      pointsLimit: points,
      setupPhase: 'setup_factions',
    });
  },

  selectFaction: (player: Player, faction: FactionType) => {
    if (player === 'player1') {
      set({ player1Faction: faction });
    } else {
      set({ player2Faction: faction });
    }

    const { player1Faction, player2Faction, pointsLimit } = get();

    // Si les deux joueurs ont choisi leur faction, on passe au draft
    if (
      (player === 'player1' && player2Faction !== null) ||
      (player === 'player2' && player1Faction !== null)
    ) {
      set({
        setupPhase: 'setup_draft',
        player1DraftPoints: pointsLimit,
        player2DraftPoints: pointsLimit,
        draftTurn: 'player1',
      });
    }
  },

  draftUnit: (player: Player, templateId: string) => {
    const { player1DraftPoints, player2DraftPoints, player1Faction, player2Faction, units, skins } = get();
    const factionId = player === 'player1' ? player1Faction : player2Faction;
    if (!factionId) return false;

    // Rechercher le template précis dans la liste
    const templates = FACTION_UNIT_TEMPLATES[factionId];
    const template = templates.find((t) => t.id === templateId);
    if (!template) return false;

    const currentPoints = player === 'player1' ? player1DraftPoints : player2DraftPoints;

    if (currentPoints < template.cost) {
      return false;
    }

    // Limite de 1 Héros par joueur
    if (template.unitType === 'hero') {
      const alreadyHasHero = units.some((u) => u.player === player && u.unitType === 'hero');
      if (alreadyHasHero) return false;
    }

    // Créer la nouvelle unité draftée
    const count = units.filter((u) => u.player === player).length + 1;
    const defaultSkin = skins.find((s) => s.id === 'skin-default') || DEFAULT_SKINS[0];

    const factionObj = PLAYABLE_FACTIONS.find((f) => f.id === factionId);
    
    const newUnit: Unit = {
      id: `unit-${player}-${Date.now()}-${count}`,
      name: `${factionObj?.name} - ${template.name} ${String.fromCharCode(64 + count)}`,
      player,
      factionId,
      unitType: template.unitType,
      templateId: template.id,
      hp: template.maxHp,
      maxHp: template.maxHp,
      position: { x: 0, y: 0 },
      skin: defaultSkin,
      cost: template.cost,
      hasMoved: false,
      hasAttacked: false,
      actionsPerformed: 0,
    };

    const nextPoints = currentPoints - template.cost;

    if (player === 'player1') {
      set({
        units: [...units, newUnit],
        player1DraftPoints: nextPoints,
      });
    } else {
      set({
        units: [...units, newUnit],
        player2DraftPoints: nextPoints,
      });
    }

    // Alternance automatique du tour de draft
    const otherPlayer = player === 'player1' ? 'player2' : 'player1';
    const otherPoints = otherPlayer === 'player1' ? get().player1DraftPoints : get().player2DraftPoints;
    const otherFactionId = otherPlayer === 'player1' ? get().player1Faction : get().player2Faction;
    
    if (otherFactionId) {
      // Trouver le coût minimum de recrutement de la faction adverse
      const otherTemplates = FACTION_UNIT_TEMPLATES[otherFactionId];
      const minCost = Math.min(...otherTemplates.map(t => t.cost));
      
      if (otherPoints >= minCost) {
        set({ draftTurn: otherPlayer });
      }
    }

    return true;
  },

  completeDraft: () => {
    const { units } = get();
    const p1Units = units.filter((u) => u.player === 'player1');
    const p2Units = units.filter((u) => u.player === 'player2');

    const updatedUnits = units.map((unit) => {
      const isP1 = unit.player === 'player1';
      const playerUnits = isP1 ? p1Units : p2Units;
      const index = playerUnits.findIndex((u) => u.id === unit.id);
      
      const col = isP1 ? (index % 2 === 0 ? 0 : 1) : (index % 2 === 0 ? 8 : 7);
      const row = 1 + (index % 5);
      
      return {
        ...unit,
        position: { x: col, y: row },
        actionsPerformed: 0,
      };
    });

    set({
      setupPhase: 'playing',
      currentTurn: 'player1',
      actionPoints: 3,
      units: updatedUnits,
    });
  },

  switchTurn: () => {
    const { currentTurn, actionPoints, units } = get();
    const nextTurn = currentTurn === 'player1' ? 'player2' : 'player1';
    
    if (actionPoints > 0) {
      get().unlockReward('rew-tactician');
    }

    const updatedUnits = units.map((u) => {
      if (u.player === nextTurn) {
        return { ...u, hasMoved: false, hasAttacked: false, actionsPerformed: 0 };
      }
      return u;
    });

    set({
      currentTurn: nextTurn,
      actionPoints: 3,
      units: updatedUnits,
    });
  },

  useActionPoints: (amount: number) => {
    const { actionPoints } = get();
    if (actionPoints >= amount) {
      set({ actionPoints: actionPoints - amount });
      return true;
    }
    return false;
  },

  setUnitMoved: (id: string) => {
    set((state) => ({
      units: state.units.map((u) => (u.id === id ? { ...u, hasMoved: true, actionsPerformed: (u.actionsPerformed || 0) + 1 } : u)),
    }));
  },

  setUnitAttacked: (id: string) => {
    set((state) => ({
      units: state.units.map((u) => (u.id === id ? { ...u, hasAttacked: true, actionsPerformed: (u.actionsPerformed || 0) + 1 } : u)),
    }));
  },

  moveUnitGrid: (id: string, col: number, row: number) => {
    const { units, actionPoints, currentTurn } = get();
    if (actionPoints <= 0) return false;
    const unit = units.find(u => u.id === id);
    if (!unit || (unit.actionsPerformed || 0) >= 2) return false;

    const updatedUnits = units.map((u) => {
      if (u.id === id) {
        return {
          ...u,
          position: { x: col, y: row },
          hasMoved: true,
          actionsPerformed: (u.actionsPerformed || 0) + 1,
        };
      }
      return u;
    });

    const nextActionPoints = actionPoints - 1;

    // Détection de fin de tour automatique
    const activePlayerUnits = updatedUnits.filter(u => u.player === currentTurn && u.hp > 0);
    const allExhausted = activePlayerUnits.length > 0 && activePlayerUnits.every(u => (u.actionsPerformed || 0) >= 2);

    if (nextActionPoints <= 0 || allExhausted) {
      const nextTurn = currentTurn === 'player1' ? 'player2' : 'player1';
      const resetUnits = updatedUnits.map((u) => {
        if (u.player === nextTurn) {
          return { ...u, hasMoved: false, hasAttacked: false, actionsPerformed: 0 };
        }
        return u;
      });
      set({
        units: resetUnits,
        currentTurn: nextTurn,
        actionPoints: 3,
      });
    } else {
      set({
        units: updatedUnits,
        actionPoints: nextActionPoints,
      });
    }
    return true;
  },

  attackUnitGrid: (attackerId: string, targetId: string, damage: number) => {
    const { units, actionPoints, currentTurn } = get();
    if (actionPoints <= 0) return false;
    const attacker = units.find(u => u.id === attackerId);
    if (!attacker || (attacker.actionsPerformed || 0) >= 2) return false;

    get().damageUnit(targetId, damage);

    const currentUnits = get().units;
    const updatedUnits = currentUnits.map((u) => {
      if (u.id === attackerId) {
        return {
          ...u,
          hasAttacked: true,
          actionsPerformed: (u.actionsPerformed || 0) + 1,
        };
      }
      return u;
    });

    const nextActionPoints = get().actionPoints - 1;

    // Détection de fin de tour automatique
    const activePlayerUnits = updatedUnits.filter(u => u.player === currentTurn && u.hp > 0);
    const allExhausted = activePlayerUnits.length > 0 && activePlayerUnits.every(u => (u.actionsPerformed || 0) >= 2);

    if (nextActionPoints <= 0 || allExhausted) {
      const nextTurn = currentTurn === 'player1' ? 'player2' : 'player1';
      const resetUnits = updatedUnits.map((u) => {
        if (u.player === nextTurn) {
          return { ...u, hasMoved: false, hasAttacked: false, actionsPerformed: 0 };
        }
        return u;
      });
      set({
        units: resetUnits,
        currentTurn: nextTurn,
        actionPoints: 3,
      });
    } else {
      set({
        units: updatedUnits,
        actionPoints: nextActionPoints,
      });
    }
    return true;
  },

  damageUnit: (id: string, amount: number) => {
    const { units } = get();
    let madeDamage = false;

    const updatedUnits = units.map((u) => {
      if (u.id === id) {
        const nextHp = Math.max(0, u.hp - amount);
        if (amount > 0) madeDamage = true;
        return { ...u, hp: nextHp };
      }
      return u;
    });

    if (madeDamage) {
      get().unlockReward('rew-first-shot');
    }

    const p1Alive = updatedUnits.some((u) => u.player === 'player1' && u.hp > 0);
    const p2Alive = updatedUnits.some((u) => u.player === 'player2' && u.hp > 0);
    
    let winner: Player | null = null;
    if (updatedUnits.length > 0) {
      if (!p1Alive) winner = 'player2';
      else if (!p2Alive) winner = 'player1';
    }

    const goldEarned = 0;
    const nextGold = get().gold;

    let nextXp = get().xp;
    let nextLevel = get().level;
    if (winner) {
      nextXp += 150;
      while (nextLevel - 1 < XP_THRESHOLDS.length && nextXp >= XP_THRESHOLDS[nextLevel - 1]) {
        nextLevel++;
      }
    }
    
    set({ 
      units: updatedUnits,
      winner,
      gold: nextGold,
      xp: nextXp,
      level: nextLevel,
    });

    if (winner) {
      get().unlockReward('rew-first-win');
      const winningFaction = winner === 'player1' ? get().player1Faction : get().player2Faction;
      if (winningFaction === 'golems') get().unlockReward('rew-golem-fan');
      else if (winningFaction === 'sylvains') get().unlockReward('rew-sylvain-fan');
      else if (winningFaction === 'technos') get().unlockReward('rew-techno-fan');
    }

    if (nextLevel >= 5) {
      get().unlockReward('rew-level-5');
    }

    if (nextXp >= 1500) {
      get().unlockReward('rew-xp-hunter');
    }

    if (nextGold >= 500) {
      get().unlockReward('rew-rich');
    }
  },

  healUnit: (id: string, amount: number) => {
    const { units } = get();
    const updatedUnits = units.map((u) => {
      if (u.id === id) {
        return { ...u, hp: Math.min(u.maxHp, u.hp + amount) };
      }
      return u;
    });
    set({ units: updatedUnits });
  },

  addGold: (amount: number) => {
    const nextGold = get().gold + amount;
    set({ gold: nextGold });

    if (nextGold >= 500) {
      get().unlockReward('rew-rich');
    }
  },

  buySkin: (skinId: string) => {
    const { skins, gold } = get();
    const skin = skins.find((s) => s.id === skinId);
    
    if (skin && !skin.unlocked && gold >= skin.cost) {
      const updatedSkins = skins.map((s) => 
        s.id === skinId ? { ...s, unlocked: true } : s
      );
      
      set({
        skins: updatedSkins,
        gold: gold - skin.cost,
      });

      // Vérifier le succès "Collectionneur" (au moins 3 skins débloqués)
      const unlockedCount = updatedSkins.filter((s) => s.unlocked).length;
      if (unlockedCount >= 3) {
        get().unlockReward('rew-collector');
      }

      return true;
    }
    return false;
  },

  equipSkin: (unitId: string, skinId: string) => {
    const { units, skins } = get();
    const skin = skins.find((s) => s.id === skinId && s.unlocked);
    
    if (skin) {
      const updatedUnits = units.map((u) => 
        u.id === unitId ? { ...u, skin } : u
      );
      set({ units: updatedUnits });
    }
  },

  unlockReward: (rewardId: string) => {
    const { rewards } = get();
    const reward = rewards.find((r) => r.id === rewardId);
    
    if (reward && !reward.unlocked) {
      const updatedRewards = rewards.map((r) => 
        r.id === rewardId ? { ...r, unlocked: true, unlockedAt: new Date().toISOString() } : r
      );
      set({ rewards: updatedRewards });

      // Si le succès de richesse est débloqué, on donne l'icône d'or
      if (rewardId === 'rew-rich') {
        const { unlockedIcons } = get();
        if (!unlockedIcons.includes('gold_coin')) {
          set({
            unlockedIcons: [...unlockedIcons, 'gold_coin']
          });
        }
      }
    }
  },

  resetGame: () => {
    set({
      setupPhase: 'setup_points',
      pointsLimit: 1500,
      player1Faction: null,
      player2Faction: null,
      player1DraftPoints: 0,
      player2DraftPoints: 0,
      draftTurn: 'player1',
      currentTurn: 'player1',
      actionPoints: 3,
      units: [],
      winner: null,
    });
  },

  claimProgressionReward: (milestoneId: string, gold: number) => {
    const { claimedRewards, gold: currentGold } = get();
    if (!claimedRewards.includes(milestoneId)) {
      set({
        claimedRewards: [...claimedRewards, milestoneId],
        gold: currentGold + gold,
      });
    }
  },

  updateUsername: (name: string) => {
    set({ username: name });
  },

  updateAvatar: (uri: string) => {
    set({ avatarUri: uri });
  },

  updateTitle: (title: string) => {
    set({ selectedTitle: title });
  },

  buyTitle: (titleId: string, titleName: string, cost: number) => {
    const { gold, unlockedTitles } = get();
    if (gold >= cost && !unlockedTitles.includes(titleName)) {
      set({
        gold: gold - cost,
        unlockedTitles: [...unlockedTitles, titleName],
      });
      return true;
    }
    return false;
  },

  buyIcon: (iconId: string, iconEmoji: string, cost: number) => {
    const { gold, unlockedIcons } = get();
    if (gold >= cost && !unlockedIcons.includes(iconId)) {
      set({
        gold: gold - cost,
        unlockedIcons: [...unlockedIcons, iconId],
      });
      return true;
    }
    return false;
  },

  buyMusic: (musicId: string, cost: number) => {
    const { gold, unlockedMusicTracks } = get();
    if (gold >= cost && !unlockedMusicTracks.includes(musicId)) {
      set({
        gold: gold - cost,
        unlockedMusicTracks: [...unlockedMusicTracks, musicId],
      });
      return true;
    }
    return false;
  },

  setMenuMusic: (musicId: string) => {
    set({ selectedMenuMusic: musicId });
  },


  resetProfile: () => {
    set({
      gold: 0,
      xp: 0,
      level: 1,
      claimedRewards: [],
      username: 'COMMANDANT_JULIEN',
      avatarUri: 'techno_avatar',
      unlockedTitles: ['Légende de la Faille Tactique', 'Recrue de la Faille'],
      selectedTitle: 'Légende de la Faille Tactique',
      unlockedIcons: ['techno_avatar', 'golem_avatar', 'sylvain_avatar'],
      rewards: INITIAL_REWARDS.map((r) => ({ ...r, unlocked: false, unlockedAt: undefined })),
      skins: DEFAULT_SKINS.map((s) => (s.id === 'skin-default' ? { ...s, unlocked: true } : { ...s, unlocked: false })),
      selectedMenuMusic: 'menu_default',
      unlockedMusicTracks: ['menu_default'],
    });
  },

}));
