import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { getUnitSkinSource } from '../store/gameStore';
import { UnitType } from '../types';

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
  glowColor,
  size = 40,
}: UnitSkinPreviewProps) {
  // Déterminer la faction à partir de templateId
  let factionId = 'technos';
  if (templateId.startsWith('golem')) {
    factionId = 'golems';
  } else if (templateId.startsWith('sylvain')) {
    factionId = 'sylvains';
  }

  const skinSource = getUnitSkinSource(factionId, unitType);

  let borderRadius = size / 2;
  if (unitType === 'scout') {
    // Les scouts ont des angles plus vifs
    borderRadius = size * 0.25;
  } else if (unitType === 'heavy') {
    // Les lourds sont plus carrés
    borderRadius = size * 0.2;
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: borderRadius,
          borderColor: glowColor,
          borderWidth: unitType === 'hero' ? 2.5 : 1.5,
          shadowColor: glowColor,
          shadowOpacity: unitType === 'hero' ? 0.6 : 0.3,
          shadowRadius: unitType === 'hero' ? 6 : 3,
          elevation: 4,
        },
      ]}
    >
      <Image
        source={skinSource}
        style={[
          styles.image,
          {
            borderRadius: borderRadius - 1.5,
          },
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
