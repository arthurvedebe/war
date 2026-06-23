import React, { useMemo } from 'react';
import { View, Platform } from 'react-native';
import {
  Canvas,
  Circle,
  Path,
  LinearGradient,
  vec,
  Text as SkiaText,
  matchFont,
  rect,
  rrect,
  Line,
  Group,
  Skia,
} from '@shopify/react-native-skia';
import { UnitType } from '../types';

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

interface UnitSkinPreviewProps {
  templateId: string;
  unitType: UnitType;
  symbol: string;
  glowColor: string;
  size?: number;
}

export default function UnitSkinPreview({
  templateId,
  unitType,
  symbol,
  glowColor,
  size = 40,
}: UnitSkinPreviewProps) {
  const radius = (size / 2) - 4;
  const center = size / 2;

  // 1. Définir la forme géométrique du jeton selon le rôle
  const shapePath = useMemo(() => {
    if (unitType === 'scout') {
      // Losange
      const path = Skia.Path.MakeFromSVGString(`M ${center},${center - radius} L ${center + radius * 0.95},${center} L ${center},${center + radius} L ${center - radius * 0.95},${center} Z`);
      if (path) return path;
    }
    if (unitType === 'heavy') {
      // Carré arrondi
      const path = Skia.Path.Make();
      const r = rect(center - radius, center - radius, radius * 2, radius * 2);
      path.addRRect(rrect(r, radius * 0.35, radius * 0.35));
      return path;
    }
    // Héros & Ranged & Fallback : Cercle standard
    const path = Skia.Path.Make();
    path.addCircle(center, center, radius);
    return path;
  }, [unitType, radius, center]);

  // Chemin pour le liseré interne (heavy et scout)
  const innerShapePath = useMemo(() => {
    if (unitType === 'scout') {
      const rInner = radius - 3.5;
      const path = Skia.Path.MakeFromSVGString(`M ${center},${center - rInner} L ${center + rInner * 0.95},${center} L ${center},${center + rInner} L ${center - rInner * 0.95},${center} Z`);
      if (path) return path;
    } else if (unitType === 'heavy') {
      const path = Skia.Path.Make();
      const rInner = radius - 2.5;
      const r = rect(center - rInner, center - rInner, rInner * 2, rInner * 2);
      path.addRRect(rrect(r, rInner * 0.25, rInner * 0.25));
      return path;
    }
    return Skia.Path.Make();
  }, [unitType, radius, center]);

  // 2. Dégradé de couleur
  const gradientColors = useMemo(() => {
    return getTemplateGradient(templateId);
  }, [templateId]);

  // 3. Préparer la police pour le symbole central (emoji)
  const emojiFontSize = radius * 0.95;
  const emojiFont = useMemo(() => {
    return matchFont({
      fontFamily: Platform.select({
        ios: 'Apple Color Emoji',
        android: 'Noto Color Emoji',
        default: 'System',
      }),
      fontSize: emojiFontSize,
    });
  }, [emojiFontSize]);

  // Mesurer le symbole pour l'alignement
  const textX = useMemo(() => {
    try {
      const width = emojiFont.measureText(symbol).width;
      return center - width / 2;
    } catch (e) {
      return center - emojiFontSize / 2;
    }
  }, [emojiFont, symbol, emojiFontSize, center]);

  const textY = center + emojiFontSize * 0.33; // Centrage vertical approximatif

  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={{ flex: 1 }}>
        {/* Remplissage dégradé */}
        <Path path={shapePath}>
          <LinearGradient
            start={vec(center - radius, center - radius)}
            end={vec(center + radius, center + radius)}
            colors={gradientColors}
          />
        </Path>

        {/* Réticule de visée pour les artilleurs (ranged) */}
        {unitType === 'ranged' && (
          <Group>
            {/* Lignes du réticule */}
            <Line p1={vec(center - radius - 2, center)} p2={vec(center - radius + 3, center)} color={glowColor} strokeWidth={1.5} />
            <Line p1={vec(center + radius - 3, center)} p2={vec(center + radius + 2, center)} color={glowColor} strokeWidth={1.5} />
            <Line p1={vec(center, center - radius - 2)} p2={vec(center, center - radius + 3)} color={glowColor} strokeWidth={1.5} />
            <Line p1={vec(center, center + radius - 3)} p2={vec(center, center + radius + 2)} color={glowColor} strokeWidth={1.5} />
          </Group>
        )}

        {/* Double liseré doré pour le Héros */}
        {unitType === 'hero' && (
          <Circle
            cx={center}
            cy={center}
            r={radius - 2.5}
            color="#fbbf24"
            style="stroke"
            strokeWidth={1}
            opacity={0.8}
          />
        )}

        {/* Liseré interne pour Heavy et Scout */}
        {(unitType === 'heavy' || unitType === 'scout') && (
          <Path
            path={innerShapePath}
            color={glowColor}
            style="stroke"
            strokeWidth={1}
            opacity={0.7}
          />
        )}

        {/* Bordure externe */}
        <Path
          path={shapePath}
          color={glowColor}
          style="stroke"
          strokeWidth={unitType === 'hero' ? 2 : 1.5}
        />

        {/* Plaque d'ombrage centrale sous l'émoticône */}
        <Circle
          cx={center}
          cy={center}
          r={radius * 0.55}
          color="rgba(15, 23, 42, 0.45)"
        />

        {/* Symbole Central */}
        <SkiaText
          text={symbol}
          x={textX}
          y={textY}
          font={emojiFont}
        />
      </Canvas>
    </View>
  );
}
