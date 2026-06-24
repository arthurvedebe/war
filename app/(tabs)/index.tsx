import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore, PLAYABLE_FACTIONS, FACTION_UNIT_TEMPLATES, XP_THRESHOLDS } from '../../src/store/gameStore';
import { FactionType } from '../../src/types';
import UnitSkinPreview from '../../src/components/UnitSkinPreview';
import { playSfx } from '../../src/utils/sfx';

const PROGRESSION_MILESTONES = [
  { id: 'milestone-200', xpNeeded: XP_THRESHOLDS[0], goldReward: 100, label: `Niveau 2 (${XP_THRESHOLDS[0]} XP)` },
  { id: 'milestone-500', xpNeeded: XP_THRESHOLDS[1], goldReward: 200, label: `Niveau 3 (${XP_THRESHOLDS[1]} XP)` },
  { id: 'milestone-1000', xpNeeded: XP_THRESHOLDS[2], goldReward: 350, label: `Niveau 4 (${XP_THRESHOLDS[2]} XP)` },
  { id: 'milestone-1800', xpNeeded: XP_THRESHOLDS[3], goldReward: 500, label: `Niveau 5 (${XP_THRESHOLDS[3]} XP)` },
  { id: 'milestone-3000', xpNeeded: XP_THRESHOLDS[4], goldReward: 700, label: `Niveau 6 (${XP_THRESHOLDS[4]} XP)` },
  { id: 'milestone-5000', xpNeeded: XP_THRESHOLDS[5], goldReward: 1000, label: `Niveau 7 (${XP_THRESHOLDS[5]} XP)` },
];

export default function HomeScreen() {
  const router = useRouter();

  // Zustand Store
  const { xp, level, claimedRewards, claimProgressionReward } = useGameStore();

  // État local pour le Codex
  const [activeFactionId, setActiveFactionId] = useState<FactionType>('golems');

  const currentFaction = PLAYABLE_FACTIONS.find((f) => f.id === activeFactionId) || PLAYABLE_FACTIONS[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* 1. Voie de Progression d'XP (Trophy Road) */}
      <View style={styles.progressionContainer}>
        <Text style={styles.progressionTitle}>🏆 Voie de Progression 🏆</Text>
        <Text style={styles.progressionSubtitle}>Niveau {level} • {xp} XP accumulés</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.progressionScroll}>
          {PROGRESSION_MILESTONES.map((milestone, idx) => {
            const isUnlocked = xp >= milestone.xpNeeded;
            const isClaimed = claimedRewards.includes(milestone.id);
            const canClaim = isUnlocked && !isClaimed;

            return (
              <View key={milestone.id} style={styles.milestoneNode}>
                {/* Ligne de liaison */}
                {idx > 0 && (
                  <View
                    style={[
                      styles.milestoneLine,
                      xp >= milestone.xpNeeded ? styles.lineActive : styles.lineInactive,
                    ]}
                  />
                )}
                
                <View
                  style={[
                    styles.milestoneBadge,
                    isClaimed
                      ? styles.badgeClaimed
                      : canClaim
                      ? styles.badgeCanClaim
                      : styles.badgeLocked,
                  ]}
                >
                  <Text style={styles.milestoneLabel}>{milestone.label}</Text>
                  <View style={styles.rewardRow}>
                    <Image source={require('../../assets/images/gold_coin.png')} style={styles.goldIcon} />
                    <Text style={[styles.milestoneReward, { marginVertical: 0 }]}>+{milestone.goldReward}</Text>
                  </View>
                  
                  {isClaimed ? (
                    <View style={styles.statusLabelContainer}>
                      <Text style={styles.statusLabelTextClaimed}>ACQUIS ✓</Text>
                    </View>
                  ) : canClaim ? (
                    <TouchableOpacity
                      style={styles.claimButton}
                      onPress={() => {
                        playSfx('click');
                        claimProgressionReward(milestone.id, milestone.goldReward);
                      }}
                    >
                      <Text style={styles.claimButtonText}>RÉCLAMER</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.statusLabelContainer}>
                      <Text style={styles.statusLabelTextLocked}>🔒 VERROUILLÉ</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. Bouton Commencer la Partie (CTA Agrandi) */}
      <TouchableOpacity
        style={styles.playButton}
        onPress={() => {
          playSfx('click');
          router.push('/game');
        }}
      >
        <Text style={styles.playButtonText}>LANCER LE COMBAT TACTIQUE</Text>
      </TouchableOpacity>

      {/* 3. Codex des Armées (Races & Troupes) */}
      <View style={styles.codexSection}>
        <Text style={styles.sectionTitle}>Codex des Armées</Text>
        <Text style={styles.sectionSubtitle}>
          Découvrez l'asymétrie physique et les troupes de chaque faction.
        </Text>

        {/* Boutons d'onglets Factions */}
        <View style={styles.codexTabs}>
          {PLAYABLE_FACTIONS.map((fac) => {
            const isActive = fac.id === activeFactionId;
            let activeColorStyle = styles.tabGolems;
            if (fac.id === 'sylvains') activeColorStyle = styles.tabSylvains;
            else if (fac.id === 'technos') activeColorStyle = styles.tabTechnos;
            else if (fac.id === 'necro') activeColorStyle = styles.tabNecro;

            return (
              <TouchableOpacity
                key={fac.id}
                style={[
                  styles.codexTabButton,
                  isActive ? activeColorStyle : styles.tabInactive,
                ]}
                onPress={() => {
                  playSfx('click');
                  setActiveFactionId(fac.id);
                }}
              >
                <Text
                  style={[
                    styles.codexTabButtonText,
                    isActive ? styles.tabTextActive : styles.tabTextInactive,
                  ]}
                >
                  {fac.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Fiche de la faction active */}
        <View style={styles.codexSheet}>
          <View style={styles.factionMeta}>
            <Image source={currentFaction.avatar} style={styles.codexAvatar} />
            <View style={styles.factionMetaText}>
              <Text style={styles.factionMetaName}>{currentFaction.name}</Text>
              <Text style={styles.factionMetaDesc}>{currentFaction.description}</Text>
              
              {/* Descriptifs physiques */}
              <View style={styles.physicsPillGroup}>
                <View style={styles.physPill}>
                  <Text style={styles.physPillText}>
                    Masse: {activeFactionId === 'golems' ? 'Lourde 🪨' : activeFactionId === 'sylvains' ? 'Légère 🍃' : activeFactionId === 'necro' ? 'Semi-lourde 💀' : 'Standard ⚖️'}
                  </Text>
                </View>
                <View style={styles.physPill}>
                  <Text style={styles.physPillText}>
                    Élasticité: {activeFactionId === 'golems' ? 'Nulle 🧱' : activeFactionId === 'sylvains' ? 'Élevée 🟢' : activeFactionId === 'necro' ? 'Faible ⚡' : 'Moyenne 🟡'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Grille des 3 types de troupes */}
          <Text style={styles.codexTroupesTitle}>Unités de Combat :</Text>
          <View style={styles.troupesList}>
            {FACTION_UNIT_TEMPLATES[activeFactionId].map((tmpl) => {
              return (
                <View key={tmpl.id} style={styles.troupeCard}>
                  <View style={styles.troupeCardRow}>
                    <UnitSkinPreview
                      templateId={tmpl.id}
                      unitType={tmpl.unitType}
                      symbol={tmpl.visuals.symbol}
                      glowColor={tmpl.visuals.glowColor}
                      size={50}
                    />
                    <View style={styles.troupeCardBody}>
                      <View style={styles.troupeCardHeader}>
                        <Text style={tmpl.unitType === 'hero' ? [styles.troupeName, { color: '#fbbf24' }] : styles.troupeName}>
                          {tmpl.name}
                        </Text>
                        <View style={styles.costBadge}>
                          <Text style={styles.costBadgeText}>{tmpl.cost} pts</Text>
                        </View>
                      </View>
                      <Text style={styles.troupeHp}>
                        ❤️ {tmpl.maxHp} PV | 🗡️ {tmpl.baseDamage} Dgts | 🏃 Dépl: {tmpl.tactical.gridMoveRange} {tmpl.tactical.gridMoveRange > 1 ? 'cases' : 'case'} | 🎯 Att: {tmpl.tactical.gridAttackRange} {tmpl.tactical.gridAttackRange > 1 ? 'cases' : 'case'}
                      </Text>
                      <Text style={styles.troupeDesc}>{tmpl.description}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 110,
  },
  progressionContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    marginBottom: 24,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  progressionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 2,
  },
  progressionSubtitle: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressionScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  milestoneNode: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  milestoneLine: {
    width: 30,
    height: 4,
    position: 'absolute',
    left: -30,
    top: 52,
    zIndex: -1,
  },
  lineActive: {
    backgroundColor: '#10b981',
  },
  lineInactive: {
    backgroundColor: '#334155',
  },
  milestoneBadge: {
    width: 115,
    height: 105,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    marginRight: 12,
  },
  badgeClaimed: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: '#10b981',
  },
  badgeCanClaim: {
    backgroundColor: 'rgba(234, 179, 8, 0.18)',
    borderColor: '#eab308',
    shadowColor: '#eab308',
    shadowRadius: 6,
    shadowOpacity: 0.4,
  },
  badgeLocked: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    opacity: 0.7,
  },
  milestoneLabel: {
    color: '#e2e8f0',
    fontSize: 10,
    fontWeight: 'bold',
  },
  milestoneReward: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statusLabelContainer: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  statusLabelTextClaimed: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: 'bold',
  },
  statusLabelTextLocked: {
    color: '#64748b',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  claimButton: {
    backgroundColor: '#eab308',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  claimButtonText: {
    color: '#0f172a',
    fontSize: 9,
    fontWeight: 'bold',
  },
  playButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#ef4444',
    shadowRadius: 15,
    shadowOpacity: 0.55,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  playButtonSubtext: {
    color: '#ffccd5',
    fontSize: 11,
    marginTop: 4,
    opacity: 0.85,
    letterSpacing: 0.5,
  },
  codexSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 15,
  },
  codexTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  codexTabButton: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderBottomWidth: 3,
  },
  tabGolems: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
  },
  tabSylvains: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
  },
  tabTechnos: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
  },
  tabNecro: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: '#a855f7',
  },
  tabInactive: {
    backgroundColor: '#1e293b',
    borderColor: 'transparent',
  },
  codexTabButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabTextInactive: {
    color: '#64748b',
  },
  codexSheet: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  factionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  codexAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  factionMetaText: {
    flex: 1,
    marginLeft: 14,
  },
  factionMetaName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  factionMetaDesc: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  physicsPillGroup: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  physPill: {
    backgroundColor: '#0f172a',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  physPillText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: 'bold',
  },
  codexTroupesTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  troupesList: {
    gap: 10,
  },
  troupeCard: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  troupeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  troupeName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  costBadge: {
    backgroundColor: '#eab308',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  costBadgeText: {
    color: '#0f172a',
    fontSize: 10,
    fontWeight: 'bold',
  },
  troupeHp: {
    color: '#ef4444',
    fontSize: 10,
    marginTop: 2,
  },
  troupeDesc: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 6,
    lineHeight: 15,
  },
  troupeCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  troupeCardBody: {
    flex: 1,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    gap: 4,
  },
  goldIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
});
