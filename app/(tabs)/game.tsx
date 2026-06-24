import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import {
  Canvas,
  Circle,
  Rect,
  Group,
  Line,
  LinearGradient,
  vec,
  useImage,
  Image as SkiaImage,
  rrect,
  rect,
  Skia,
  Path,
  Text as SkiaText,
  matchFont,
} from '@shopify/react-native-skia';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  runOnJS,
  makeMutable,
  SharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useGameStore, PLAYABLE_FACTIONS, FACTION_UNIT_TEMPLATES, getSkinSource, getUnitSkinSource, XP_THRESHOLDS } from '../../src/store/gameStore';

import SetupWizard from '../../src/components/SetupWizard';
import { Player, Unit, FactionType } from '../../src/types';
import { playSfx } from '../../src/utils/sfx';

// Composant Projectile Techno avec traînée (hooks autorisés ici)
type TechnoProjectileProps = {
  currentX: SharedValue<number>;
  currentY: SharedValue<number>;
  opacity: SharedValue<number>;
  targetPixelX: number;
  startPixelX: number;
  targetPixelY: number;
  startPixelY: number;
};
const TechnoProjectile: React.FC<TechnoProjectileProps> = ({
  currentX, currentY, opacity, targetPixelX, startPixelX, targetPixelY, startPixelY,
}) => {
  const trail1X = useDerivedValue(() => currentX.value - (targetPixelX - startPixelX) * 0.05);
  const trail1Y = useDerivedValue(() => currentY.value - (targetPixelY - startPixelY) * 0.05);
  const trail2X = useDerivedValue(() => currentX.value - (targetPixelX - startPixelX) * 0.1);
  const trail2Y = useDerivedValue(() => currentY.value - (targetPixelY - startPixelY) * 0.1);
  return (
    <Group opacity={opacity}>
      <Circle cx={currentX as unknown as number} cy={currentY as unknown as number} r={8} color="rgba(56, 189, 248, 0.4)" />
      <Circle cx={currentX as unknown as number} cy={currentY as unknown as number} r={4} color="#38bdf8" />
      <Circle cx={trail1X as unknown as number} cy={trail1Y as unknown as number} r={4} color="rgba(56, 189, 248, 0.6)" />
      <Circle cx={trail2X as unknown as number} cy={trail2Y as unknown as number} r={2} color="rgba(56, 189, 248, 0.3)" />
    </Group>
  );
};

const AttackAnimationItem: React.FC<{
  anim: any;
  projGolem: any;
  projSylvain: any;
  cellWidth: number;
  cellHeight: number;
}> = ({ anim, projGolem, projSylvain, cellWidth, cellHeight }) => {
  const transform = useDerivedValue(() => {
    return [
      { translateX: anim.currentX.value },
      { translateY: anim.currentY.value },
    ];
  });

  if (anim.type === 'ranged') {
    if (anim.factionId === 'golems' && projGolem) {
      return (
        <Group opacity={anim.opacity} transform={transform}>
          <SkiaImage
            image={projGolem}
            x={-20}
            y={-20}
            width={40}
            height={40}
            fit="contain"
          />
        </Group>
      );
    } else if (anim.factionId === 'sylvains' && projSylvain) {
      return (
        <Group opacity={anim.opacity} transform={transform}>
          <SkiaImage
            image={projSylvain}
            x={-20}
            y={-20}
            width={40}
            height={40}
            fit="contain"
          />
        </Group>
      );
    } else {
      return (
        <TechnoProjectile
          currentX={anim.currentX}
          currentY={anim.currentY}
          opacity={anim.opacity}
          targetPixelX={anim.targetPixelX}
          startPixelX={anim.startPixelX}
          targetPixelY={anim.targetPixelY}
          startPixelY={anim.startPixelY}
        />
      );
    }
  } else {
    if (anim.factionId === 'golems') {
      return (
        <Group opacity={anim.opacity} transform={transform}>
          <Circle cx={0} cy={0} r={24} color="rgba(245, 158, 11, 0.2)" />
          <Circle cx={0} cy={0} r={18} color="#f59e0b" style="stroke" strokeWidth={2} />
          <Circle cx={-14} cy={-14} r={3} color="#b45309" />
          <Circle cx={14} cy={-10} r={2} color="#b45309" />
          <Circle cx={-10} cy={14} r={4} color="#78350f" />
          <Circle cx={12} cy={12} r={3} color="#78350f" />
        </Group>
      );
    } else if (anim.factionId === 'sylvains') {
      return (
        <Group opacity={anim.opacity} transform={transform}>
          <Path
            path={(() => {
              const path = Skia.Path.Make();
              path.moveTo(-18, -8);
              path.quadTo(0, 15, 18, -8);
              return path;
            })()}
            color="#10b981"
            style="stroke"
            strokeWidth={3}
          />
          <Circle cx={-5} cy={6} r={2} color="#34d399" />
          <Circle cx={5} cy={6} r={2} color="#34d399" />
        </Group>
      );
    } else if (anim.factionId === 'necro') {
      return (
        <Group opacity={anim.opacity} transform={transform}>
          <Path
            path={(() => {
              const path = Skia.Path.Make();
              path.moveTo(-15, -15);
              path.quadTo(15, 0, -15, 15);
              path.moveTo(15, -15);
              path.quadTo(-15, 0, 15, 15);
              return path;
            })()}
            color="#a855f7"
            style="stroke"
            strokeWidth={3}
          />
          <Circle cx={0} cy={0} r={10} color="rgba(168, 85, 247, 0.3)" />
        </Group>
      );
    } else {
      return (
        <Group opacity={anim.opacity} transform={transform}>
          <Line p1={vec(-15, -15)} p2={vec(15, 15)} color="#38bdf8" strokeWidth={2.5} />
          <Line p1={vec(15, -15)} p2={vec(-15, 15)} color="#38bdf8" strokeWidth={2.5} />
          <Circle cx={0} cy={0} r={12} color="rgba(56, 189, 248, 0.25)" />
        </Group>
      );
    }
  }
};


// Helpers tactiques
const getUnitTemplateRanges = (unit: Unit) => {
  const templates = FACTION_UNIT_TEMPLATES[unit.factionId] || [];
  const template = templates.find((t) => t.id === unit.templateId);
  if (template) {
    return {
      move: template.tactical.gridMoveRange,
      attack: template.tactical.gridAttackRange,
    };
  }
  return { move: 2, attack: 1 };
};

const isObstacle = (col: number, row: number) => {
  // Obstacles centraux adaptés à la grille 9x9 (centrée sur row 4)
  if (col === 4 && row === 4) return true; // Caisse centrale
  if (col === 2 && (row === 4 || row === 5)) return true; // Plateforme gauche
  if (col === 6 && (row === 4 || row === 5)) return true; // Plateforme droite
  return false;
};

const checkAttackPattern = (attacker: Unit, targetCol: number, targetRow: number) => {
  const range = getUnitTemplateRanges(attacker).attack;
  const ax = attacker.position.x;
  const ay = attacker.position.y;
  const dx = Math.abs(ax - targetCol);
  const dy = Math.abs(ay - targetRow);
  const dist = dx + dy;

  // 1. Ranged Artillery
  // "tire tout droit loin (horizontal/vertical, min dist 2), ou de près autour de lui (dist <= 1)"
  if (attacker.unitType === 'ranged') {
    if (dist <= 1 && dist > 0) return true;
    if (dist >= 2 && dist <= range) {
      return ax === targetCol || ay === targetRow;
    }
    return false;
  }

  // 2. Faction-specific / Scout Directional Pattern
  // "ne peut attaquer que du côté droit s'il est du côté gauche (col < 4) et inversement (col > 4 s'il est à droite)"
  if (attacker.unitType === 'scout') {
    if (dist <= range && dist > 0) {
      if (ax < 4) {
        return targetCol > ax;
      } else if (ax > 4) {
        return targetCol < ax;
      }
      return true;
    }
    return false;
  }

  // 3. Héros et Heavies (Pattern Standard)
  if (range === 1) {
    return dx <= 1 && dy <= 1 && (dx > 0 || dy > 0);
  } else {
    return dist <= range && (dx > 0 || dy > 0);
  }
};

const isCellOccupied = (col: number, row: number, units: Unit[]) => {
  return units.some((u) => u.hp > 0 && u.position.x === col && u.position.y === row);
};

export default function GameScreen() {
  const { width, height } = useWindowDimensions();

  // Aire de jeu (48% de la hauteur de l'écran)
  const gameWidth = width;
  const gameHeight = height * 0.48;

  // Cases carrées parfaites centrées — grille 9x9
  const cellSize = Math.floor(Math.min(width / 9, (height * 0.55) / 9));
  const cellWidth = cellSize;
  const cellHeight = cellSize;
  const boardWidth = cellSize * 9;
  const boardHeight = cellSize * 9;


  // Zustand Store
  const {
    setupPhase,
    currentTurn,
    actionPoints,
    units,
    gold,
    winner,
    switchTurn,
    moveUnitGrid,
    attackUnitGrid,
    resetGame,
    player1Faction,
    player2Faction,
    xp,
    level,
  } = useGameStore();

  // Chargement des textures d'avatars de factions Skia (fallbacks)
  const golemImg = useImage(require('../../assets/images/golem_avatar.png'));
  const sylvainImg = useImage(require('../../assets/images/sylvain_avatar.png'));
  const technoImg = useImage(require('../../assets/images/techno_avatar.png'));
  const necroImg = useImage(require('../../assets/images/necro_avatar.png'));
  const projGolem = useImage(require('../../assets/images/projectile_golem.png'));
  const projSylvain = useImage(require('../../assets/images/projectile_sylvain.png'));
  // Skins spécifiques par unité
  const skinGolemHero   = useImage(require('../../assets/images/skin_golem_hero.png'));
  const skinGolemHeavy  = useImage(require('../../assets/images/skin_golem_heavy.png'));
  const skinGolemScout  = useImage(require('../../assets/images/skin_golem_scout.png'));
  const skinGolemRanged = useImage(require('../../assets/images/skin_golem_ranged.png'));
  const skinSylvainHero   = useImage(require('../../assets/images/skin_sylvain_hero.png'));
  const skinSylvainHeavy  = useImage(require('../../assets/images/skin_sylvain_heavy.png'));
  const skinSylvainScout  = useImage(require('../../assets/images/skin_sylvain_scout.png'));
  const skinSylvainRanged = useImage(require('../../assets/images/skin_sylvain_ranged.png'));
  const skinTechnoHero   = useImage(require('../../assets/images/skin_techno_hero.png'));
  const skinTechnoHeavy  = useImage(require('../../assets/images/skin_techno_heavy.png'));
  const skinTechnoScout  = useImage(require('../../assets/images/skin_techno_scout.png'));
  const skinTechnoRanged = useImage(require('../../assets/images/skin_techno_ranged.png'));
  const skinNecroHero   = useImage(require('../../assets/images/skin_necro_hero.png'));
  const skinNecroHeavy  = useImage(require('../../assets/images/skin_necro_heavy.png'));
  const skinNecroScout  = useImage(require('../../assets/images/skin_necro_scout.png'));
  const skinNecroRanged = useImage(require('../../assets/images/skin_necro_ranged.png'));

  const getUnitSpriteSkia = (factionId: string, unitType: string) => {
    const key = `${factionId}_${unitType}`;
    switch (key) {
      case 'golems_hero':     return skinGolemHero || golemImg;
      case 'golems_heavy':    return skinGolemHeavy || golemImg;
      case 'golems_scout':    return skinGolemScout || golemImg;
      case 'golems_ranged':   return skinGolemRanged || golemImg;
      case 'sylvains_hero':   return skinSylvainHero || sylvainImg;
      case 'sylvains_heavy':  return skinSylvainHeavy || sylvainImg;
      case 'sylvains_scout':  return skinSylvainScout || sylvainImg;
      case 'sylvains_ranged': return skinSylvainRanged || sylvainImg;
      case 'technos_hero':    return skinTechnoHero || technoImg;
      case 'technos_heavy':   return skinTechnoHeavy || technoImg;
      case 'technos_scout':   return skinTechnoScout || technoImg;
      case 'technos_ranged':  return skinTechnoRanged || technoImg;
      case 'necro_hero':      return skinNecroHero || necroImg;
      case 'necro_heavy':     return skinNecroHeavy || necroImg;
      case 'necro_scout':     return skinNecroScout || necroImg;
      case 'necro_ranged':    return skinNecroRanged || necroImg;
      default: return technoImg;
    }
  };


  // ID de l'unité active sélectionnée
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const selectedUnitIdRef = useRef(selectedUnitId);
  useEffect(() => {
    selectedUnitIdRef.current = selectedUnitId;
  }, [selectedUnitId]);

  // Mode d'action tactique actif (Déplacement vs Attaque)
  const [actionMode, setActionMode] = useState<'move' | 'attack'>('move');

  // Valeurs partagées Reanimated créées dynamiquement pour animer la position des unités
  const unitPositionsRef = useRef<{
    [id: string]: {
      x: SharedValue<number>;
      y: SharedValue<number>;
      r: SharedValue<number>;
    };
  }>({});

  // Initialisation des shared values de positions
  const currentPositions = unitPositionsRef.current;
  let hasNewPositions = false;
  units.forEach((unit) => {
    if (!currentPositions[unit.id]) {
      hasNewPositions = true;
    }
  });

  if (hasNewPositions) {
    const nextPositions = { ...currentPositions };
    units.forEach((unit) => {
      if (!nextPositions[unit.id]) {
        const initX = (unit.position.x + 0.5) * cellWidth;
        const initY = (unit.position.y + 0.5) * cellHeight;
        nextPositions[unit.id] = {
          x: makeMutable(initX),
          y: makeMutable(initY),
          r: makeMutable(0),
        };
      }
    });
    unitPositionsRef.current = nextPositions;
  }

  // Synchronisation des positions de grille vers les coordonnées d'affichage (avec ressorts / ressort fluide)
  useEffect(() => {
    units.forEach((unit) => {
      const sharedPos = unitPositionsRef.current[unit.id];
      if (sharedPos) {
        const targetX = (unit.position.x + 0.5) * cellWidth;
        const targetY = (unit.position.y + 0.5) * cellHeight;
        
        sharedPos.x.value = withSpring(targetX, { damping: 15 });
        sharedPos.y.value = withSpring(targetY, { damping: 15 });
      }
    });
  }, [units, cellWidth, cellHeight]);

  // Liste locale des animations de combat actives
  const [animations, setAnimations] = useState<{
    id: string;
    type: 'ranged' | 'melee';
    currentX: SharedValue<number>;
    currentY: SharedValue<number>;
    opacity: SharedValue<number>;
    color: string;
    factionId: FactionType;
    unitType: string;
    startPixelX: number;
    startPixelY: number;
    targetPixelX: number;
    targetPixelY: number;
  }[]>([]);

  const removeAnimation = (id: string) => {
    setAnimations((prev) => prev.filter((a) => a.id !== id));
  };

  // Effet sonore de victoire
  useEffect(() => {
    if (winner) {
      playSfx('victory');
    }
  }, [winner]);

  const triggerAttackAnimation = (
    attackerX: number,
    attackerY: number,
    targetX: number,
    targetY: number,
    factionId: FactionType,
    unitType: string,
    isRanged: boolean
  ) => {
    const animId = `${isRanged ? 'ranged' : 'melee'}-${Date.now()}-${Math.random()}`;
    const startPixelX = (attackerX + 0.5) * cellWidth;
    const startPixelY = (attackerY + 0.5) * cellHeight;
    const targetPixelX = (targetX + 0.5) * cellWidth;
    const targetPixelY = (targetY + 0.5) * cellHeight;

    const sharedX = makeMutable(startPixelX);
    const sharedY = makeMutable(startPixelY);
    const sharedOpacity = makeMutable(1);

    const factionColors = {
      golems: '#f59e0b',
      sylvains: '#10b981',
      technos: '#3b82f6',
      necro: '#a855f7',
    };
    const color = factionColors[factionId] || '#fff';

    if (isRanged) {
      playSfx('laser');
      setAnimations((prev) => [
        ...prev,
        {
          id: animId,
          type: 'ranged',
          currentX: sharedX,
          currentY: sharedY,
          opacity: sharedOpacity,
          color,
          factionId,
          unitType,
          startPixelX,
          startPixelY,
          targetPixelX,
          targetPixelY,
        },
      ]);

      sharedX.value = withTiming(targetPixelX, { duration: 350 });
      sharedY.value = withTiming(targetPixelY, { duration: 350 }, () => {
        runOnJS(playSfx)('hit');
        sharedOpacity.value = withTiming(0, { duration: 100 }, () => {
          runOnJS(removeAnimation)(animId);
        });
      });
    } else {
      playSfx('melee');
      const targetSharedX = makeMutable(targetPixelX);
      const targetSharedY = makeMutable(targetPixelY);

      setAnimations((prev) => [
        ...prev,
        {
          id: animId,
          type: 'melee',
          currentX: targetSharedX,
          currentY: targetSharedY,
          opacity: sharedOpacity,
          color,
          factionId,
          unitType,
          startPixelX,
          startPixelY,
          targetPixelX,
          targetPixelY,
        },
      ]);

      sharedOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(playSfx)('hit');
        runOnJS(removeAnimation)(animId);
      });
    }
  };

  // Animation des orbites de particules
  const particleAngle = useSharedValue(0);

  useEffect(() => {
    if (setupPhase !== 'playing') return;

    let animFrameId: number;
    const tick = () => {
      particleAngle.value = (particleAngle.value + 0.04) % (Math.PI * 2);
      animFrameId = requestAnimationFrame(tick);
    };
    animFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [setupPhase]);

  const selectedUnit = units.find((u) => u.id === selectedUnitId);

  // Auto-sélection de la première unité disponible lors du lancement du combat ou changement de tour
  useEffect(() => {
    if (setupPhase === 'playing') {
      const activePlayerUnits = units.filter((u) => u.player === currentTurn && u.hp > 0);
      if (activePlayerUnits.length > 0) {
        // Sélectionner en priorité une unité qui n'a pas épuisé ses actions
        const selectable = activePlayerUnits.find((u) => (u.actionsPerformed || 0) < 2) || activePlayerUnits[0];
        setSelectedUnitId(selectable.id);
      }
    }
  }, [setupPhase, currentTurn]);

  // Permuter automatiquement de mode d'action si l'un d'eux est déjà fait
  useEffect(() => {
    if (selectedUnit) {
      const performed = selectedUnit.actionsPerformed || 0;
      if (performed >= 2) {
        // Unité épuisée, pas d'action
      }
    }
  }, [selectedUnitId, selectedUnit?.actionsPerformed]);

  // Clic sur une cellule de la grille
  const handleCellTap = (col: number, row: number) => {
    if (winner) return;

    if (!selectedUnitId) return;
    const unit = units.find((u) => u.id === selectedUnitId);
    if (!unit || unit.hp <= 0 || unit.player !== currentTurn) return;

    // Vérifier si l'unité a encore des actions
    const performed = unit.actionsPerformed || 0;
    if (performed >= 2) return;

    // Vérifier si le joueur a des PA globaux
    if (actionPoints <= 0) return;

    if (actionMode === 'move') {
      // Portée de déplacement
      const range = getUnitTemplateRanges(unit).move;
      const dist = Math.abs(unit.position.x - col) + Math.abs(unit.position.y - row);

      if (dist <= range && dist > 0) {
        if (isObstacle(col, row)) return;
        if (isCellOccupied(col, row, units)) return;

        // Déplacer l'unité
        moveUnitGrid(unit.id, col, row);
      }
    } else if (actionMode === 'attack') {
      // Cible ennemie ?
      const targetUnit = units.find((u) => u.hp > 0 && u.position.x === col && u.position.y === row);
      if (!targetUnit || targetUnit.player === currentTurn) return;

      // Portée d'attaque
      const range = getUnitTemplateRanges(unit).attack;
      const isRanged = range > 1;
      const isWithinRange = checkAttackPattern(unit, col, row);

      if (isWithinRange) {
        // Récupérer les dégâts de base depuis le template
        const unitTemplates = FACTION_UNIT_TEMPLATES[unit.factionId] || [];
        const template = unitTemplates.find((t) => t.id === unit.templateId);
        let finalDamage = template?.baseDamage || 30;

        // Effet de Rage des Golems : double dégâts si PV < 50%
        // Concerne le Héros (Colosse) et le Lourd (Bastion)
        if (
          unit.factionId === 'golems' &&
          (unit.hp / unit.maxHp) < 0.5 &&
          (unit.templateId === 'golem_hero_granite' || unit.templateId === 'golem_heavy_obsidian')
        ) {
          finalDamage *= 2;
        }

        const success = attackUnitGrid(unit.id, targetUnit.id, finalDamage);
        if (success) {
          triggerAttackAnimation(
            unit.position.x,
            unit.position.y,
            col,
            row,
            unit.factionId,
            unit.unitType,
            isRanged
          );
        }
      }
    }
  };

  const handleReset = () => {
    resetGame();
    setAnimations([]);
    unitPositionsRef.current = {};
  };

  const tapGesture = Gesture.Tap().onEnd((e) => {
    const offsetX = (gameWidth - boardWidth) / 2;
    const offsetY = (gameHeight - boardHeight) / 2;
    const relativeX = e.x - offsetX;
    const relativeY = e.y - offsetY;

    const col = Math.floor(relativeX / cellWidth);
    const row = Math.floor(relativeY / cellHeight);

    const clampedCol = Math.max(0, Math.min(8, col));
    const clampedRow = Math.max(0, Math.min(8, row));


    runOnJS(handleCellTap)(clampedCol, clampedRow);
  });

  if (setupPhase !== 'playing') {
    return <SetupWizard />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* HUD Haut */}
      <View style={styles.hudHeader}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, width: '100%' }}>
          <View style={{ flexDirection: 'row', gap: 10, flex: 0.8 }}>
            <View
              style={[
                styles.playerCard,
                { flex: 1, height: 40 },
                currentTurn === 'player1' ? styles.cardP1Active : styles.cardInactive,
              ]}
            >
              <Text style={[styles.playerTitle, { fontSize: 12 }]}>ROUGE (P1)</Text>
            </View>
            <View
              style={[
                styles.playerCard,
                { flex: 1, height: 40 },
                currentTurn === 'player2' ? styles.cardP2Active : styles.cardInactive,
              ]}
            >
              <Text style={[styles.playerTitle, { fontSize: 12 }]}>BLEU (P2)</Text>
            </View>
          </View>
          <TouchableOpacity
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: '#334155',
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#475569',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 10,
            }}
            onPress={() => {
              handleReset();
              router.replace('/');
            }}
          >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>QUITTER</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.paContainer}>
          <Text style={styles.paText}>PA restants : </Text>
          {[1, 2, 3].map((pt) => (
            <View
              key={pt}
              style={[
                styles.paDot,
                actionPoints >= pt
                  ? currentTurn === 'player1'
                    ? styles.paDotP1
                    : styles.paDotP2
                  : styles.paDotEmpty,
              ]}
            />
          ))}
          <View style={styles.goldRow}>
            <Image source={require('../../assets/images/gold_coin.png')} style={styles.goldIcon} />
            <Text style={styles.goldText}>{gold}</Text>
          </View>
        </View>
      </View>

      {/* Canvas Skia */}
      <GestureDetector gesture={tapGesture}>
        <View style={{ width: gameWidth, height: gameHeight, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
          <Canvas style={{ width: boardWidth, height: boardHeight }}>
            {/* Dégradé Fond */}
            <Rect x={0} y={0} width={boardWidth} height={boardHeight}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, gameHeight)}
                colors={['#1e293b', '#0f172a']}
              />
            </Rect>

            {/* Dessin de la Grille 9x9 avec highlights tactiques */}
            {Array.from({ length: 9 }).map((_, col) =>
              Array.from({ length: 9 }).map((_, row) => {

                const isObst = isObstacle(col, row);
                const isSelected = selectedUnit && selectedUnit.position.x === col && selectedUnit.position.y === row;

                let highlightColor = 'rgba(30, 41, 59, 0.2)'; // Fond par défaut d'une case vide
                let isTargetable = false;
                let isInAttackRangeZone = false;

                // Calcul des cases à surligner si une unité active est sélectionnée
                if (selectedUnit && (selectedUnit.actionsPerformed || 0) < 2 && actionPoints > 0) {
                  const range = getUnitTemplateRanges(selectedUnit);
                  if (actionMode === 'move') {
                    const dist = Math.abs(selectedUnit.position.x - col) + Math.abs(selectedUnit.position.y - row);
                    const canMoveTo = dist <= range.move && dist > 0 && !isObst && !isCellOccupied(col, row, units);
                    if (canMoveTo) {
                      highlightColor = 'rgba(34, 197, 94, 0.18)'; // Vert
                      isTargetable = true;
                    }
                  } else if (actionMode === 'attack') {
                    const inAttackRange = checkAttackPattern(selectedUnit, col, row);
                    if (inAttackRange) {
                      isInAttackRangeZone = true;
                      // Trouver une cible ennemie vivante sur cette case
                      const targetUnit = units.find(u => u.hp > 0 && u.position.x === col && u.position.y === row && u.player !== currentTurn);
                      if (targetUnit) {
                        highlightColor = 'rgba(239, 68, 68, 0.38)'; // Rouge plus prononcé pour cible ciblable
                        isTargetable = true;
                      } else {
                        highlightColor = 'rgba(239, 68, 68, 0.12)'; // Rouge clair pour portée d'attaque vide
                      }
                    }
                  }
                }

                // Surligner la case sélectionnée
                if (isSelected) {
                  highlightColor = 'rgba(56, 189, 248, 0.25)';
                }

                return (
                  <Group key={`${col}-${row}`}>
                    {/* Fond de cellule */}
                    <Rect
                      x={col * cellWidth}
                      y={row * cellHeight}
                      width={cellWidth}
                      height={cellHeight}
                      color={highlightColor}
                      style="fill"
                    />
                    {/* Lignes de délimitation de la grille */}
                    <Rect
                      x={col * cellWidth}
                      y={row * cellHeight}
                      width={cellWidth}
                      height={cellHeight}
                      color={
                        isSelected
                          ? '#38bdf8'
                          : isTargetable
                          ? actionMode === 'move'
                            ? '#22c55e'
                            : '#ef4444'
                          : isInAttackRangeZone
                          ? 'rgba(239, 68, 68, 0.4)' // Bordure rouge de portée vide
                          : 'rgba(255, 255, 255, 0.08)'
                      }
                      style="stroke"
                      strokeWidth={isSelected || isTargetable || isInAttackRangeZone ? 1.5 : 0.5}
                    />
                  </Group>
                );
              })
            )}

            {/* Obstacles fixes de la Grille - adaptés à la grille 9x9 */}
            {/* Plateforme Gauche (2,4) & (2,5) */}
            <Rect
              x={2 * cellWidth + 4}
              y={4 * cellHeight + 4}
              width={cellWidth - 8}
              height={cellHeight * 2 - 8}
              color="rgba(30, 41, 59, 0.75)"
              style="fill"
            />
            <Rect
              x={2 * cellWidth + 4}
              y={4 * cellHeight + 4}
              width={cellWidth - 8}
              height={cellHeight * 2 - 8}
              color="#3b82f6"
              style="stroke"
              strokeWidth={1.5}
            />

            {/* Plateforme Droite (6,4) & (6,5) */}
            <Rect
              x={6 * cellWidth + 4}
              y={4 * cellHeight + 4}
              width={cellWidth - 8}
              height={cellHeight * 2 - 8}
              color="rgba(30, 41, 59, 0.75)"
              style="fill"
            />
            <Rect
              x={6 * cellWidth + 4}
              y={4 * cellHeight + 4}
              width={cellWidth - 8}
              height={cellHeight * 2 - 8}
              color="#3b82f6"
              style="stroke"
              strokeWidth={1.5}
            />

            {/* Caisse d'obstacle centrale fixe en (4,4) */}
            <Group transform={[{ translateX: (4 + 0.5) * cellWidth }, { translateY: (4 + 0.5) * cellHeight }]}>
              <Rect
                x={-cellWidth * 0.4}
                y={-cellHeight * 0.4}
                width={cellWidth * 0.8}
                height={cellHeight * 0.8}
                color="#78350f"
                style="fill"
              />
              <Rect
                x={-cellWidth * 0.4}
                y={-cellHeight * 0.4}
                width={cellWidth * 0.8}
                height={cellHeight * 0.8}
                color="#92400e"
                style="stroke"
                strokeWidth={2}
              />
              <Line
                p1={vec(-cellWidth * 0.4, -cellHeight * 0.4)}
                p2={vec(cellWidth * 0.4, cellHeight * 0.4)}
                color="#451a03"
                strokeWidth={2.5}
              />
              <Line
                p1={vec(cellWidth * 0.4, -cellHeight * 0.4)}
                p2={vec(-cellWidth * 0.4, cellHeight * 0.4)}
                color="#451a03"
                strokeWidth={2.5}
              />
            </Group>


            {/* Rendu des Projectiles et Slashes d'Animations */}
            {animations.map((anim) => (
              <AttackAnimationItem
                key={anim.id}
                anim={anim}
                projGolem={projGolem}
                projSylvain={projSylvain}
                cellWidth={cellWidth}
                cellHeight={cellHeight}
              />
            ))}

            {/* Rendu des Unités (au centre de leur cellule) */}
            {units.map((unit) => {
              const pos = unitPositionsRef.current[unit.id];
              if (!pos || unit.hp <= 0) return null;

              const isSelected = unit.id === selectedUnitId;
              const activeSprite = getUnitSpriteSkia(unit.factionId, unit.unitType);

              return (
                <TacticalUnit
                  key={unit.id}
                  unit={unit}
                  sharedPos={pos}
                  isSelected={isSelected}
                  activeSprite={activeSprite}
                  particleAngle={particleAngle}
                  actionMode={actionMode}
                  cellHeight={cellHeight}
                />
              );
            })}

          </Canvas>

          {/* Barres de vie superposées sur le Canvas (animées) */}
          {units.map((unit) => {
            if (unit.hp <= 0) return null;
            return (
              <UnitHealthBar
                key={unit.id}
                unit={unit}
                sharedPos={unitPositionsRef.current[unit.id]}
                cellHeight={cellHeight}
              />
            );
          })}
        </View>
      </GestureDetector>

      {/* HUD Bas */}
      <View style={styles.hudFooter}>
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Unité active :</Text>
          <View style={styles.unitButtonGroup}>
            {units
              .filter((u) => u.player === currentTurn && u.hp > 0)
              .map((unit) => {
                const actionsDone = unit.actionsPerformed || 0;
                const isExhausted = actionsDone >= 2;

                return (
                  <TouchableOpacity
                    key={unit.id}
                    style={[
                      styles.unitButton,
                      selectedUnitId === unit.id ? styles.unitButtonSelected : styles.unitButtonInactive,
                    ]}
                    onPress={() => {
                      playSfx('click');
                      setSelectedUnitId(unit.id);
                    }}
                  >
                    <Text style={styles.unitButtonText}>
                      {unit.name.split(' - ')[1] || unit.name}
                    </Text>
                    <Text style={styles.unitButtonHp}>
                      ❤️ {unit.hp} PV | ⚡ {actionsDone}/2 {isExhausted ? '💤' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        </View>

        {/* Sélecteur de Mode d'Action Tactique */}
        {selectedUnit && (
          <View style={styles.actionModeContainer}>
            <TouchableOpacity
              style={[
                styles.actionModeButton,
                actionMode === 'move' ? styles.btnMoveActive : styles.btnInactive,
                (selectedUnit.actionsPerformed || 0) >= 2 && styles.btnDisabled,
              ]}
              disabled={(selectedUnit.actionsPerformed || 0) >= 2}
              onPress={() => {
                playSfx('click');
                setActionMode('move');
              }}
            >
              <Text style={styles.actionModeText}>
                🏃 DEPL {(selectedUnit.actionsPerformed || 0) >= 2 ? '❌' : '✓'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionModeButton,
                actionMode === 'attack' ? styles.btnAttackActive : styles.btnInactive,
                (selectedUnit.actionsPerformed || 0) >= 2 && styles.btnDisabled,
              ]}
              disabled={(selectedUnit.actionsPerformed || 0) >= 2}
              onPress={() => {
                playSfx('click');
                setActionMode('attack');
              }}
            >
              <Text style={styles.actionModeText}>
                🎯 ATT {(selectedUnit.actionsPerformed || 0) >= 2 ? '❌' : '✓'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionButtonGroup}>
          <TouchableOpacity
            style={styles.endTurnButton}
            onPress={() => {
              playSfx('click');
              switchTurn();
            }}
          >
            <Text style={styles.buttonText}>FIN DU TOUR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Victoire */}
      {/* Modal Victoire */}
      <Modal visible={winner !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🏆 COMBAT TERMINÉ 🏆</Text>
            
            {(() => {
              const winningFactionId = winner === 'player1' ? player1Faction : player2Faction;
              const winningFaction = PLAYABLE_FACTIONS.find(f => f.id === winningFactionId);
              
              const prevThreshold = level > 1 ? XP_THRESHOLDS[level - 2] : 0;
              const nextThreshold = level - 1 < XP_THRESHOLDS.length ? XP_THRESHOLDS[level - 1] : 99999;
              const xpInLevel = xp - prevThreshold;
              const xpNeededForNext = nextThreshold - prevThreshold;
              const xpPct = Math.min(100, Math.max(0, (xpInLevel / xpNeededForNext) * 100));

              return (
                <>
                  {winningFaction && (
                    <View style={styles.victoryFactionCard}>
                      <Image source={winningFaction.avatar} style={styles.victoryFactionAvatar} />
                      <Text style={styles.victoryFactionName}>{winningFaction.name}</Text>
                    </View>
                  )}

                  <Text style={styles.modalText}>
                    Le joueur{' '}
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: winner === 'player1' ? '#ef4444' : '#3b82f6',
                      }}
                    >
                      {winner === 'player1' ? 'ROUGE (P1)' : 'BLEU (P2)'}
                    </Text>{' '}
                    est victorieux !
                  </Text>

                  <View style={styles.victoryRewardCard}>
                    <Text style={styles.victoryRewardTitle}>RÉCOMPENSES</Text>
                    <View style={styles.victoryRewardRow}>
                      <Text style={styles.victoryRewardText}>⚡ +150 XP de combat</Text>
                    </View>
                  </View>

                  <View style={styles.victoryXpContainer}>
                    <View style={styles.victoryXpRow}>
                      <Text style={styles.victoryXpLabel}>Niveau {level}</Text>
                      <Text style={styles.victoryXpVal}>{xp} / {nextThreshold} XP</Text>
                    </View>
                    <View style={styles.victoryXpBarBackground}>
                      <View style={[styles.victoryXpBarFill, { width: `${xpPct}%` }]} />
                    </View>
                  </View>
                </>
              );
            })()}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                playSfx('click');
                handleReset();
              }}
            >
              <Text style={styles.modalButtonText}>REJOUER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

// Composant de barre de vie indépendant
function UnitHealthBar({
  unit,
  sharedPos,
  cellHeight,
}: {
  unit: Unit;
  sharedPos: { x: SharedValue<number>; y: SharedValue<number> } | undefined;
  cellHeight: number;
}) {
  const isP1 = unit.player === 'player1';
  const healthPct = (unit.hp / unit.maxHp) * 100;

  const animatedStyle = useAnimatedStyle(() => {
    if (!sharedPos) return { display: 'none' };
    return {
      position: 'absolute',
      left: sharedPos.x.value - 22,
      top: sharedPos.y.value - cellHeight * 0.45,
      width: 44,
      height: 5,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 2.5,
      borderWidth: 0.5,
      borderColor: '#333',
      overflow: 'hidden',
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <View
        style={{
          width: `${healthPct}%`,
          height: '100%',
          backgroundColor: isP1 ? '#ef4444' : '#3b82f6',
        }}
      />
    </Animated.View>
  );
}

// Composant de pion tactique Skia
// Helper pour obtenir le dégradé de couleur d'un personnage
const getTemplateGradient = (templateId: string): string[] => {
  switch (templateId) {
    // Golems
    case 'golem_hero_granite':
      return ['#f59e0b', '#d97706']; // Or et Ambre
    case 'golem_heavy_obsidian':
      return ['#1e1e1e', '#ef4444']; // Noir et Rouge lave
    case 'golem_heavy_magnetite':
      return ['#78716c', '#44403c']; // Gris fer et Slate
    case 'golem_scout_pebble':
      return ['#e7e5e4', '#fafaf9']; // Gris clair et Blanc
    case 'golem_scout_flint':
      return ['#cbd5e1', '#38bdf8']; // Argent et Bleu givré
    case 'golem_ranged_bombard':
      return ['#f97316', '#7c2d12']; // Orange feu et Marron

    // Sylvains
    case 'sylvain_hero_gaia':
      return ['#10b981', '#eab308']; // Vert émeraude et Or
    case 'sylvain_heavy_bark':
      return ['#15803d', '#78350f']; // Vert forêt et Marron écorce
    case 'sylvain_heavy_trunk':
      return ['#a16207', '#451a03']; // Bronze et Marron foncé
    case 'sylvain_scout_leaf':
      return ['#4ade80', '#facc15']; // Vert menthe et Jaune citron
    case 'sylvain_scout_spore':
      return ['#ffffff', '#2dd4bf']; // Blanc et Vert d'eau
    case 'sylvain_ranged_sap':
      return ['#ec4899', '#701a75']; // Rose fuchsia et Violet sève

    // Technomanciens
    case 'techno_hero_apex':
      return ['#1d4ed8', '#06b6d4']; // Bleu royal et Cyan
    case 'techno_heavy_sentry':
      return ['#475569', '#94a3b8']; // Bleu acier et Gris métal
    case 'techno_heavy_shield':
      return ['#06b6d4', '#020617']; // Cyan néon et Noir
    case 'techno_scout_probe':
      return ['#facc15', '#f97316']; // Jaune électrique et Orange
    case 'techno_scout_brawler':
      return ['#b91c1c', '#ea580c']; // Rouge brique et Orange
    case 'techno_ranged_plasma':
      return ['#8b5cf6', '#2563eb']; // Violet plasma et Bleu électrique

    default:
      return ['#3b82f6', '#1d4ed8'];
  }
};

interface TacticalUnitProps {
  unit: Unit;
  sharedPos: {
    x: SharedValue<number>;
    y: SharedValue<number>;
    r: SharedValue<number>;
  } | undefined;
  isSelected: boolean;
  activeSprite: any;
  particleAngle: SharedValue<number>;
  actionMode: 'move' | 'attack';
  cellHeight: number;
}

function TacticalUnit({
  unit,
  sharedPos,
  isSelected,
  activeSprite,
  particleAngle,
  actionMode,
  cellHeight,
}: TacticalUnitProps) {
  const templates = FACTION_UNIT_TEMPLATES[unit.factionId] || [];
  const template = templates.find((t) => t.id === unit.templateId);
  const glowColor = template?.visuals.glowColor || '#38bdf8';
  
  // Utiliser une taille d'avatar proportionnelle à la hauteur de la case
  const radius = cellHeight * 0.35;

  // Charger le skin image (soit le custom skin, soit le skin par défaut spécifique à l'unité)
  const isCustomSkin = unit.skin && unit.skin.id !== 'skin-default';
  const skinSource = isCustomSkin ? getSkinSource(unit.skin.id) : getUnitSkinSource(unit.factionId, unit.unitType);
  const skinImage = useImage(skinSource);

  const transform = useDerivedValue(() => {
    if (!sharedPos) return [{ translateX: 0 }, { translateY: 0 }];
    return [
      { translateX: sharedPos.x.value },
      { translateY: sharedPos.y.value },
    ];
  });

  const groupOpacity = useDerivedValue(() => {
    const isSpent = (unit.actionsPerformed || 0) >= 2;
    return isSpent ? 0.5 : 1.0;
  });

  const p1X = useDerivedValue(() => Math.cos(particleAngle.value) * (radius + 5));
  const p1Y = useDerivedValue(() => Math.sin(particleAngle.value) * (radius + 5));

  const p2X = useDerivedValue(() => Math.cos(particleAngle.value + (2 * Math.PI) / 3) * (radius + 5));
  const p2Y = useDerivedValue(() => Math.sin(particleAngle.value + (2 * Math.PI) / 3) * (radius + 5));

  const p3X = useDerivedValue(() => Math.cos(particleAngle.value + (4 * Math.PI) / 3) * (radius + 5));
  const p3Y = useDerivedValue(() => Math.sin(particleAngle.value + (4 * Math.PI) / 3) * (radius + 5));

  // Particules orbitales additionnelles pour les skins (sens inverse)
  const px1 = useDerivedValue(() => Math.cos(particleAngle.value * -1.5 + 0) * (radius + 6));
  const py1 = useDerivedValue(() => Math.sin(particleAngle.value * -1.5 + 0) * (radius + 6));
  
  const px2 = useDerivedValue(() => Math.cos(particleAngle.value * -1.5 + 1.25) * (radius + 6));
  const py2 = useDerivedValue(() => Math.sin(particleAngle.value * -1.5 + 1.25) * (radius + 6));

  const px3 = useDerivedValue(() => Math.cos(particleAngle.value * -1.5 + 2.5) * (radius + 6));
  const py3 = useDerivedValue(() => Math.sin(particleAngle.value * -1.5 + 2.5) * (radius + 6));

  const px4 = useDerivedValue(() => Math.cos(particleAngle.value * -1.5 + 3.75) * (radius + 6));
  const py4 = useDerivedValue(() => Math.sin(particleAngle.value * -1.5 + 3.75) * (radius + 6));

  const px5 = useDerivedValue(() => Math.cos(particleAngle.value * -1.5 + 5.0) * (radius + 6));
  const py5 = useDerivedValue(() => Math.sin(particleAngle.value * -1.5 + 5.0) * (radius + 6));

  let badgeColor = '#94a3b8';
  if (unit.unitType === 'hero') badgeColor = '#fbbf24';
  else if (unit.unitType === 'heavy') badgeColor = '#ef4444';
  else if (unit.unitType === 'scout') badgeColor = '#a855f7';
  else if (unit.unitType === 'ranged') badgeColor = '#f97316';

  const isP1 = unit.player === 'player1';
  const allianceColor = isP1 ? '#ef4444' : '#3b82f6';

  // 1. Définir la forme géométrique du jeton selon le rôle
  const shapePath = useMemo(() => {
    if (unit.unitType === 'scout') {
      // Losange
      const path = Skia.Path.MakeFromSVGString(`M 0,-${radius} L ${radius * 0.95},0 L 0,${radius} L -${radius * 0.95},0 Z`);
      if (path) return path;
    }
    if (unit.unitType === 'heavy') {
      // Carré arrondi
      const path = Skia.Path.Make();
      const r = rect(-radius, -radius, radius * 2, radius * 2);
      path.addRRect(rrect(r, radius * 0.35, radius * 0.35));
      return path;
    }
    // Héros & Ranged & Fallback : Cercle standard
    const path = Skia.Path.Make();
    path.addCircle(0, 0, radius);
    return path;
  }, [unit.unitType, radius]);

  // Chemin pour le liseré interne (heavy et scout)
  const innerShapePath = useMemo(() => {
    if (unit.unitType === 'scout') {
      const rInner = radius - 3.5;
      const path = Skia.Path.MakeFromSVGString(`M 0,-${rInner} L ${rInner * 0.95},0 L 0,${rInner} L -${rInner * 0.95},0 Z`);
      if (path) return path;
    } else if (unit.unitType === 'heavy') {
      const path = Skia.Path.Make();
      const rInner = radius - 2.5;
      const r = rect(-rInner, -rInner, rInner * 2, rInner * 2);
      path.addRRect(rrect(r, rInner * 0.25, rInner * 0.25));
      return path;
    }
    // Fallback path vide
    return Skia.Path.Make();
  }, [unit.unitType, radius]);

  // 2. Dégradé de couleur
  const gradientColors = useMemo(() => {
    return getTemplateGradient(unit.templateId);
  }, [unit.templateId]);

  // Rendu sans emoji central (skins uniquement)

  return (
    <Group transform={transform} opacity={groupOpacity}>
      {/* Halo de sélection */}
      {isSelected && (
        <Circle
          cx={0}
          cy={0}
          r={radius + 4}
          color={actionMode === 'move' ? 'rgba(74, 222, 128, 0.45)' : 'rgba(248, 113, 113, 0.45)'}
          style="stroke"
          strokeWidth={3}
        />
      )}

      {/* Particules orbitales d'activité (si l'unité a des actions restantes) */}
      {(unit.actionsPerformed || 0) < 2 && (
        <Group>
          <Circle cx={p1X} cy={p1Y} r={2.2} color={glowColor} />
          <Circle cx={p2X} cy={p2Y} r={2.2} color={glowColor} />
          <Circle cx={p3X} cy={p3Y} r={2.2} color={glowColor} />
        </Group>
      )}

      {/* Particules orbitales additionnelles de skin */}
      {unit.skin && unit.skin.particleLevel >= 1 && <Circle cx={px1} cy={py1} r={1.6} color={unit.skin.id === 'skin-neon' ? '#22d3ee' : '#ec4899'} />}
      {unit.skin && unit.skin.particleLevel >= 2 && <Circle cx={px2} cy={py2} r={1.6} color={unit.skin.id === 'skin-neon' ? '#22d3ee' : '#ec4899'} />}
      {unit.skin && unit.skin.particleLevel >= 3 && <Circle cx={px3} cy={py3} r={1.6} color={unit.skin.id === 'skin-neon' ? '#22d3ee' : '#ec4899'} />}
      {unit.skin && unit.skin.particleLevel >= 4 && <Circle cx={px4} cy={py4} r={1.6} color={unit.skin.id === 'skin-neon' ? '#22d3ee' : '#ec4899'} />}
      {unit.skin && unit.skin.particleLevel >= 5 && <Circle cx={px5} cy={py5} r={1.6} color={unit.skin.id === 'skin-neon' ? '#22d3ee' : '#ec4899'} />}

      {/* Corps principal : Forme spécifique avec image de skin et overlay d'alliance */}
      <Group clip={shapePath}>
        {skinImage ? (
          <Group>
            <SkiaImage
              image={skinImage}
              x={-radius}
              y={-radius}
              width={radius * 2}
              height={radius * 2}
              fit="cover"
            />
            {/* Overlay d'alliance translucide pour distinguer les camps */}
            <Path path={shapePath} color={allianceColor} opacity={0.15} />
          </Group>
        ) : (
          <Path path={shapePath}>
            <LinearGradient
              start={vec(-radius, -radius)}
              end={vec(radius, radius)}
              colors={gradientColors}
            />
          </Path>
        )}
      </Group>

      {/* Réticule de visée pour les artilleurs (ranged) */}
      {unit.unitType === 'ranged' && (
        <Group>
          {/* Lignes du réticule */}
          <Line p1={vec(-radius - 2, 0)} p2={vec(-radius + 3, 0)} color={glowColor} strokeWidth={2} />
          <Line p1={vec(radius - 3, 0)} p2={vec(radius + 2, 0)} color={glowColor} strokeWidth={2} />
          <Line p1={vec(0, -radius - 2)} p2={vec(0, -radius + 3)} color={glowColor} strokeWidth={2} />
          <Line p1={vec(0, radius - 3)} p2={vec(0, radius + 2)} color={glowColor} strokeWidth={2} />
        </Group>
      )}

      {/* Double liseré doré pour le Héros */}
      {unit.unitType === 'hero' && (
        <Circle
          cx={0}
          cy={0}
          r={radius - 2.5}
          color="#fbbf24"
          style="stroke"
          strokeWidth={1}
          opacity={0.8}
        />
      )}

      {/* Liseré interne pour Heavy et Scout */}
      {(unit.unitType === 'heavy' || unit.unitType === 'scout') && (
        <Path
          path={innerShapePath}
          color={glowColor}
          style="stroke"
          strokeWidth={1}
          opacity={0.7}
        />
      )}

      {/* Bordure d'alliance (contour externe principal) */}
      <Path
        path={shapePath}
        color={allianceColor}
        style="stroke"
        strokeWidth={unit.unitType === 'hero' ? 2.5 : 1.8}
      />

      {/* Rendu sans emoji central */}

      {/* Badge de rôle miniature (haut-droite) */}
      <Circle
        cx={radius * 0.65}
        cy={-radius * 0.65}
        r={5.5}
        color="#0f172a"
      />
      <Circle
        cx={radius * 0.65}
        cy={-radius * 0.65}
        r={4.2}
        color={badgeColor}
      />
      <Circle
        cx={radius * 0.65}
        cy={-radius * 0.65}
        r={1.5}
        color="#ffffff"
      />
    </Group>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  hudHeader: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderColor: '#1e293b',
  },
  playerCard: {
    flex: 0.48,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cardP1Active: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
  },
  cardP2Active: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3b82f6',
  },
  cardInactive: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  playerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  paContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  paDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginHorizontal: 4,
  },
  paDotP1: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowRadius: 5,
    shadowOpacity: 0.8,
  },
  paDotP2: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowRadius: 5,
    shadowOpacity: 0.8,
  },
  paDotEmpty: {
    backgroundColor: '#334155',
  },
  goldText: {
    color: '#fbbf24',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  hudFooter: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 95,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    justifyContent: 'space-between',
  },
  selectorContainer: {
    marginBottom: 4,
  },
  selectorLabel: {
    color: '#94a3b8',
    fontSize: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },
  unitButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
  },
  unitButton: {
    flex: 0.48,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  unitButtonSelected: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: '#38bdf8',
  },
  unitButtonInactive: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  unitButtonText: {
    color: '#e2e8f0',
    fontSize: 10,
    fontWeight: 'bold',
  },
  unitButtonHp: {
    color: '#94a3b8',
    fontSize: 8.5,
    marginTop: 2.5,
  },
  actionModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginVertical: 4,
  },
  actionModeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnMoveActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: '#4ade80',
  },
  btnAttackActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#f87171',
  },
  btnInactive: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  btnDisabled: {
    opacity: 0.25,
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  actionModeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  resetButton: {
    flex: 0.4,
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  endTurnButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowRadius: 5,
    shadowOpacity: 0.3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  goldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  goldIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  victoryFactionCard: {
    alignItems: 'center',
    marginBottom: 15,
  },
  victoryFactionAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#38bdf8',
    marginBottom: 8,
  },
  victoryFactionName: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  victoryRewardCard: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  victoryRewardTitle: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 1,
  },
  victoryRewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  victoryRewardText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: 'bold',
  },
  victoryXpContainer: {
    width: '100%',
    marginBottom: 20,
  },
  victoryXpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  victoryXpLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  victoryXpVal: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  victoryXpBarBackground: {
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  victoryXpBarFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 3,
  },
});
