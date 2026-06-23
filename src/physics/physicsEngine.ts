import Matter from 'matter-js';
import { Unit, FactionType } from '../types';
import { FACTION_UNIT_TEMPLATES } from '../store/gameStore';

export interface PhysicsWorldConfig {
  width: number;
  height: number;
  units: Unit[];
}

export interface PhysicsWorldResult {
  engine: Matter.Engine;
  world: Matter.World;
  boundaries: Matter.Body[];
  obstacles: Matter.Body[];
  unitBodies: { [unitId: string]: Matter.Body };
}

// Constantes physiques locales pour éviter le couplage avec le store
const FACTION_PHYSICS: {
  [key in FactionType]: { density: number; restitution: number; friction: number };
} = {
  golems: { density: 0.015, restitution: 0.05, friction: 0.6 },
  sylvains: { density: 0.003, restitution: 0.75, friction: 0.15 },
  technos: { density: 0.007, restitution: 0.35, friction: 0.4 },
};

/**
 * Initialise le monde physique Matter.js avec de l'asymétrie
 */
export const createPhysicsWorld = ({
  width,
  height,
  units,
}: PhysicsWorldConfig): PhysicsWorldResult => {
  // 1. Créer le moteur physique
  const engine = Matter.Engine.create({
    gravity: { x: 0, y: 1.0 },
  });
  const { world } = engine;

  // 2. Créer les bordures statiques (Sol, Murs, Plafond)
  const groundThickness = 60;
  const wallThickness = 40;

  const ground = Matter.Bodies.rectangle(
    width / 2,
    height - groundThickness / 2,
    width,
    groundThickness,
    { isStatic: true, label: 'ground', friction: 0.8, restitution: 0.1 }
  );

  const leftWall = Matter.Bodies.rectangle(
    wallThickness / 2,
    height / 2,
    wallThickness,
    height,
    { isStatic: true, label: 'leftWall', friction: 0.1, restitution: 0.8 }
  );

  const rightWall = Matter.Bodies.rectangle(
    width - wallThickness / 2,
    height / 2,
    wallThickness,
    height,
    { isStatic: true, label: 'rightWall', friction: 0.1, restitution: 0.8 }
  );

  const ceiling = Matter.Bodies.rectangle(
    width / 2,
    wallThickness / 2,
    width,
    wallThickness,
    { isStatic: true, label: 'ceiling', friction: 0.1, restitution: 0.8 }
  );

  const boundaries = [ground, leftWall, rightWall, ceiling];

  // 3. Créer des obstacles tactiques au milieu de la carte
  const platformA = Matter.Bodies.rectangle(
    width * 0.3,
    height * 0.6,
    140,
    20,
    { isStatic: true, label: 'platform', friction: 0.5, restitution: 0.2 }
  );

  const platformB = Matter.Bodies.rectangle(
    width * 0.7,
    height * 0.6,
    140,
    20,
    { isStatic: true, label: 'platform', friction: 0.5, restitution: 0.2 }
  );

  const centralCrate = Matter.Bodies.rectangle(
    width * 0.5,
    height * 0.45,
    60,
    60,
    { isStatic: false, label: 'crate', friction: 0.4, density: 0.002, restitution: 0.3 }
  );

  const obstacles = [platformA, platformB, centralCrate];

  // 4. Créer les corps physiques des unités (cercles asymétriques)
  const unitBodies: { [unitId: string]: Matter.Body } = {};

  const p1Units = units.filter(u => u.player === 'player1');
  const p2Units = units.filter(u => u.player === 'player2');

  units.forEach((unit) => {
    const isPlayer1 = unit.player === 'player1';
    
    // Déterminer l'index pour espacer les troupes sur le terrain
    const playerUnits = isPlayer1 ? p1Units : p2Units;
    const index = playerUnits.findIndex(u => u.id === unit.id);
    const count = playerUnits.length;
    
    // Calcul de la position de départ (répartition linéaire)
    const initialX = isPlayer1
      ? width * (0.15 + (index * (0.2 / Math.max(1, count - 1))))
      : width * (0.85 - (index * (0.2 / Math.max(1, count - 1))));
    
    // On fait tomber les scouts plus haut et les lourds plus bas
    const initialY = unit.unitType === 'scout' ? height * 0.2 : height * 0.35;

    // Récupérer le template précis de l'unité
    const templates = FACTION_UNIT_TEMPLATES[unit.factionId];
    const template = templates.find((t) => t.id === unit.templateId) || templates[0];

    const radius = template.physics.radius;
    const density = template.physics.density;
    const restitution = template.physics.restitution;
    const friction = template.physics.friction;
    const frictionAir = unit.unitType === 'scout' ? 0.015 : 0.02;

    const body = Matter.Bodies.circle(initialX, initialY, radius, {
      label: `unit:${unit.id}`,
      restitution: restitution,
      friction: friction,
      frictionAir: frictionAir,
      density: density,
    });

    unitBodies[unit.id] = body;
  });

  // 5. Ajouter tout le monde
  Matter.World.add(world, [
    ...boundaries,
    ...obstacles,
    ...Object.values(unitBodies),
  ]);

  return {
    engine,
    world,
    boundaries,
    obstacles,
    unitBodies,
  };
};

/**
 * Applique une impulsion/force physique sur un corps Matter.js
 * @param body Le corps physique cible
 * @param forceVector Le vecteur de force {x, y}
 */
export const applyForceToBody = (
  body: Matter.Body,
  forceVector: { x: number; y: number }
) => {
  // Ajuster la force selon la masse du corps pour garder une maniabilité comparable
  const forceScale = 0.05 * body.mass;
  
  Matter.Body.applyForce(body, body.position, {
    x: forceVector.x * forceScale,
    y: forceVector.y * forceScale,
  });
};
