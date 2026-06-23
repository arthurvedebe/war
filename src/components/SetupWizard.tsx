import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useGameStore, PLAYABLE_FACTIONS, FACTION_UNIT_TEMPLATES } from '../store/gameStore';
import { Faction, Player, UnitTemplate } from '../types';
import { router } from 'expo-router';
import UnitSkinPreview from './UnitSkinPreview';

export default function SetupWizard() {
  const {
    setupPhase,
    pointsLimit,
    player1Faction,
    player2Faction,
    player1DraftPoints,
    player2DraftPoints,
    draftTurn,
    units,
    setPointsLimit,
    selectFaction,
    draftUnit,
    completeDraft,
  } = useGameStore();

  const activeFactionId = draftTurn === 'player1' ? player1Faction : player2Faction;
  const activeFaction = PLAYABLE_FACTIONS.find((f) => f.id === activeFactionId);

  // Rendu de la phase de choix des points
  if (setupPhase === 'setup_points') {
    return (
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Format de Bataille</Text>
          <TouchableOpacity style={styles.quitButton} onPress={() => router.replace('/')}>
            <Text style={styles.quitButtonText}>Quitter</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Déterminez le budget d'armée disponible pour chaque joueur.</Text>

        <View style={styles.cardGroup}>
          {[
            { pts: 1000, label: 'Escrarmouche Courte', desc: 'Partie rapide (~3-4 unités par joueur)' },
            { pts: 1500, label: 'Conflit Standard', desc: 'Partie équilibrée (~4-6 unités par joueur)' },
            { pts: 2000, label: 'Grande Campagne', desc: 'Partie longue (~6-8 unités par joueur)' },
          ].map((item) => (
            <TouchableOpacity
              key={item.pts}
              style={styles.pointsCard}
              onPress={() => setPointsLimit(item.pts)}
            >
              <Text style={styles.pointsVal}>{item.pts} pts</Text>
              <Text style={styles.pointsLabel}>{item.label}</Text>
              <Text style={styles.pointsDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // Rendu de la phase de sélection des Factions
  if (setupPhase === 'setup_factions') {
    const selectingPlayer: Player = player1Faction === null ? 'player1' : 'player2';
    const playerLabel = selectingPlayer === 'player1' ? 'JOUEUR 1 (ROUGE)' : 'JOUEUR 2 (BLEU)';

    return (
      <View style={styles.container}>
        <View style={styles.headerIndicatorRow}>
          <View style={styles.headerIndicator}>
            <Text style={[styles.playerBadge, selectingPlayer === 'player1' ? styles.badgeP1 : styles.badgeP2]}>
              {playerLabel}
            </Text>
          </View>
          <TouchableOpacity style={styles.quitButtonCompact} onPress={() => router.replace('/')}>
            <Text style={styles.quitButtonText}>Quitter</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Choisissez votre Faction</Text>
        <Text style={styles.subtitle}>Chaque faction possède un style physique de pion unique.</Text>

        <ScrollView contentContainerStyle={styles.factionsScroll} showsVerticalScrollIndicator={false}>
          {PLAYABLE_FACTIONS.map((faction) => {
            const isTaken = selectingPlayer === 'player2' && faction.id === player1Faction;
            return (
              <TouchableOpacity
                key={faction.id}
                style={[styles.factionCard, isTaken && styles.shopCardDisabled]}
                onPress={() => !isTaken && selectFaction(selectingPlayer, faction.id)}
                disabled={isTaken}
              >
                <Image source={faction.avatar} style={styles.factionAvatar} />
                <View style={styles.factionInfo}>
                  <Text style={styles.factionName}>{faction.name}</Text>
                  <Text style={styles.factionDesc}>{faction.description}</Text>
                  {isTaken && <Text style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 'bold' }}>Déjà sélectionnée</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Rendu de la phase de Draft / Achat d'Armée
  if (setupPhase === 'setup_draft') {
    const currentPoints = draftTurn === 'player1' ? player1DraftPoints : player2DraftPoints;
    const playerLabel = draftTurn === 'player1' ? 'JOUEUR 1 (ROUGE)' : 'JOUEUR 2 (BLEU)';

    const p1UnitsCount = units.filter((u) => u.player === 'player1').length;
    const p2UnitsCount = units.filter((u) => u.player === 'player2').length;
    
    const canStartGame = p1UnitsCount > 0 && p2UnitsCount > 0;

    const handleBuyUnit = (template: UnitTemplate) => {
      const success = draftUnit(draftTurn, template.id);
      if (!success) {
        // Optionnel : Retour visuel en cas d'erreur
      }
    };

    const activeTemplates = activeFactionId ? FACTION_UNIT_TEMPLATES[activeFactionId] : null;

    return (
      <View style={styles.container}>
        <View style={styles.draftHeader}>
          <Text style={[styles.playerBadge, draftTurn === 'player1' ? styles.badgeP1 : styles.badgeP2]}>
            DRAFT : {playerLabel}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>⚡ {currentPoints} / {pointsLimit} pts</Text>
            </View>
            <TouchableOpacity style={styles.quitButtonCompact} onPress={() => router.replace('/')}>
              <Text style={styles.quitButtonText}>Quitter</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.draftFactionInfo}>
          Faction : <Text style={{ fontWeight: 'bold' }}>{activeFaction?.name}</Text>
        </Text>

        <Text style={styles.draftTitle}>Recrutez vos troupes :</Text>

        <ScrollView style={{ maxHeight: '42%' }} contentContainerStyle={styles.shopGrid} showsVerticalScrollIndicator={false}>
          {activeTemplates && activeTemplates.map((template) => {
            const isAffordable = currentPoints >= template.cost;
            const isHero = template.unitType === 'hero';
            const hasHero = units.some((u) => u.player === draftTurn && u.unitType === 'hero');

            const isDisabled = !isAffordable || (isHero && hasHero);

            return (
              <TouchableOpacity
                key={template.id}
                style={[styles.shopCard, isDisabled && styles.shopCardDisabled]}
                onPress={() => !isDisabled && handleBuyUnit(template)}
                disabled={isDisabled}
              >
                <View style={styles.cardHeaderRow}>
                  <UnitSkinPreview
                    templateId={template.id}
                    unitType={template.unitType}
                    symbol={template.visuals.symbol}
                    glowColor={template.visuals.glowColor}
                    size={38}
                  />
                  <Text style={styles.shopCardName}>{template.name}</Text>
                </View>
                <Text style={styles.shopCardHp}>❤️ {template.maxHp} PV</Text>
                <Text style={styles.shopCardRanges}>🏃 {template.tactical.moveRange} | 🎯 {template.tactical.attackRange}</Text>
                <View style={styles.shopCardCost}>
                  <Text style={styles.shopCardCostText}>{template.cost} pts</Text>
                </View>
                {isHero && hasHero && <Text style={styles.limitText}>Max 1 Héros</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.draftSubTitle}>Armée constituée :</Text>
        <ScrollView style={styles.armyList} showsVerticalScrollIndicator={false}>
          {units
            .filter((u) => u.player === draftTurn)
            .map((unit) => {
              const uTemplate = activeTemplates?.find(t => t.id === unit.templateId);
              return (
                <View key={unit.id} style={styles.armyItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {uTemplate && (
                      <UnitSkinPreview
                        templateId={unit.templateId}
                        unitType={unit.unitType}
                        symbol={uTemplate.visuals.symbol}
                        glowColor={uTemplate.visuals.glowColor}
                        size={24}
                      />
                    )}
                    <Text style={styles.armyItemName}>{unit.name.split(' - ')[1]}</Text>
                  </View>
                  <Text style={styles.armyItemCost}>{unit.cost} pts</Text>
                </View>
              );
            })}
          {units.filter((u) => u.player === draftTurn).length === 0 && (
            <Text style={styles.emptyText}>Aucune unité recrutée pour l'instant.</Text>
          )}
        </ScrollView>

        <View style={styles.actionFooter}>
          <TouchableOpacity
            style={[styles.launchButton, !canStartGame && styles.launchButtonDisabled]}
            onPress={() => canStartGame && completeDraft()}
            disabled={!canStartGame}
          >
            <Text style={styles.launchButtonText}>LANCER LE COMBAT TACTIQUE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  cardGroup: {
    gap: 15,
  },
  pointsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
  },
  pointsVal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eab308',
  },
  pointsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  pointsDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center',
  },
  headerIndicator: {
    alignItems: 'center',
    marginBottom: 10,
  },
  playerBadge: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  badgeP1: {
    backgroundColor: '#ef4444',
  },
  badgeP2: {
    backgroundColor: '#3b82f6',
  },
  factionsScroll: {
    gap: 15,
    paddingBottom: 20,
  },
  factionCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
    alignItems: 'center',
  },
  factionAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  factionInfo: {
    flex: 1,
    marginLeft: 15,
  },
  factionName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  factionDesc: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  physicsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
  },
  physLabel: {
    color: '#38bdf8',
    fontSize: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 15,
  },
  pointsBadge: {
    backgroundColor: '#334155',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  pointsText: {
    color: '#eab308',
    fontWeight: 'bold',
    fontSize: 14,
  },
  draftFactionInfo: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 20,
    textAlign: 'center',
  },
  draftTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  shopCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 4,
  },
  shopCardDisabled: {
    opacity: 0.4,
    borderColor: '#1e293b',
  },
  shopCardName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'left',
    flex: 1,
  },
  shopCardHp: {
    color: '#ef4444',
    fontSize: 10,
    marginTop: 2,
  },
  shopCardCost: {
    backgroundColor: '#eab308',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginTop: 6,
  },
  shopCardCostText: {
    color: '#0f172a',
    fontSize: 10,
    fontWeight: 'bold',
  },
  limitText: {
    color: '#ef4444',
    fontSize: 8,
    marginTop: 2,
  },
  draftSubTitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  armyList: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 10,
    marginBottom: 20,
  },
  armyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#1e293b',
  },
  armyItemName: {
    color: '#fff',
    fontSize: 13,
  },
  armyItemCost: {
    color: '#eab308',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#475569',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 15,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
  },
  cardSymbol: {
    fontSize: 12,
  },
  shopCardRanges: {
    color: '#94a3b8',
    fontSize: 9,
    marginTop: 2,
    fontWeight: '500',
  },
  actionFooter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  launchButton: {
    width: '100%',
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowRadius: 8,
    shadowOpacity: 0.4,
  },
  launchButtonDisabled: {
    backgroundColor: '#475569',
    shadowOpacity: 0,
    opacity: 0.5,
  },
  launchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 5,
  },
  headerIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 5,
  },
  quitButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#334155',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  quitButtonCompact: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#334155',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
  },
  quitButtonText: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
