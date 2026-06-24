/**
 * Représente les deux joueurs du jeu.
 */
export type Player = 'player1' | 'player2';

/**
 * Les différentes factions jouables.
 */
export type FactionType = 'golems' | 'sylvains' | 'technos' | 'necro';

/**
 * Les différents rôles ou classes d'unités tactiques.
 */
export type UnitType = 'hero' | 'heavy' | 'scout' | 'ranged';

/**
 * Propriétés physiques et descriptives d'une Faction.
 */
export interface Faction {
  id: FactionType;
  name: string;
  description: string;
  avatar: any; // Référence locale de l'image (require)
  physics: {
    density: number;
    restitution: number;
    friction: number;
  };
}

export interface UnitTemplate {
  id: string;
  unitType: UnitType;
  name: string;
  cost: number;
  maxHp: number;
  description: string;
  physics: {
    radius: number;
    density: number;
    restitution: number;
    friction: number;
  };
  tactical: {
    moveRange: number;
    attackRange: number;
    gridMoveRange: number;
    gridAttackRange: number;
  };
  visuals: {
    glowColor: string;
    symbol: string;
  };
}

/**
 * Configuration d'un skin d'unité (généré par IA ou prédéfini).
 */
export interface Skin {
  id: string;
  name: string;
  uri: string; // URI de l'image de secours pour le rendu de texture
  particleLevel: number; // Intensité des particules Skia (de 0 à 5)
  unlocked: boolean;
  cost: number;
}

/**
 * Représente une unité tactique en jeu.
 */
export interface Unit {
  id: string;
  name: string;
  player: Player;
  factionId: FactionType;
  unitType: UnitType;
  templateId: string;
  hp: number;
  maxHp: number;
  position: { x: number; y: number }; // Position de départ théorique (en pixels)
  skin: Skin;
  cost: number; // Coût en points de bataille
  hasMoved: boolean;
  hasAttacked: boolean;
  actionsPerformed?: number;
}

/**
 * Représente une récompense/trophée déverrouillable.
 */
export interface Reward {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}
