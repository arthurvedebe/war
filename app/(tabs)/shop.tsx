import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { useGameStore, getAvatarSource, getSkinSource } from '../../src/store/gameStore';
import { Skin, Unit } from '../../src/types';

const SHOP_TITLES = [
  { id: 'title_gladiator', name: 'Gladiateur Cybernétique', cost: 80 },
  { id: 'title_runemaster', name: 'Maître des Runes', cost: 100 },
  { id: 'title_forestlord', name: 'Seigneur de la Forêt', cost: 120 },
  { id: 'title_plasma', name: 'Commandant Plasma', cost: 180 },
  { id: 'title_warlord', name: 'Dieu de la Faille', cost: 300 },
];

const SHOP_ICONS = [
  { id: 'icon_alien', name: 'Alien Cyber', cost: 100, emoji: '👽' },
  { id: 'icon_robot', name: 'Robot Sentinelle', cost: 120, emoji: '🤖' },
  { id: 'icon_dragon', name: 'Dragon de Feu', cost: 200, emoji: '🐉' },
  { id: 'icon_wizard', name: 'Magicien Virtuel', cost: 150, emoji: '🧙‍♂️' },
  { id: 'icon_phoenix', name: 'Phénix Solaire', cost: 250, emoji: '🔥' },
  { id: 'icon_crown', name: 'Couronne Impériale', cost: 300, emoji: '👑' },
  { id: 'icon_controller', name: 'Pro Gamer', cost: 100, emoji: '🎮' },
  { id: 'icon_ninja', name: 'Ninja Tactique', cost: 150, emoji: '🥷' },
  { id: 'icon_skull', name: 'Crâne Cybernétique', cost: 200, emoji: '💀' },
];

export default function ShopScreen() {
  // Zustand Store
  const {
    skins,
    gold,
    units,
    unlockedTitles,
    unlockedIcons,
    buySkin,
    equipSkin,
    buyTitle,
    buyIcon
  } = useGameStore();

  // États pour les modals et notifications
  const [activeTab, setActiveTab] = useState<'skins' | 'titles' | 'icons'>('skins');
  const [selectedSkinForEquip, setSelectedSkinForEquip] = useState<Skin | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Affiche une notification temporaire
  const triggerNotification = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  // Tenter d'acheter un skin
  const handleBuySkin = (skin: Skin) => {
    if (gold < skin.cost) {
      triggerNotification("Or insuffisant pour débloquer ce skin ! 🪙", 'error');
      return;
    }
    const success = buySkin(skin.id);
    if (success) {
      triggerNotification(`Félicitations ! Skin "${skin.name}" déverrouillé ! ✨`, 'success');
    } else {
      triggerNotification("Une erreur est survenue lors de l'achat.", 'error');
    }
  };

  // Acheter un titre
  const handleBuyTitle = (title: { id: string; name: string; cost: number }) => {
    if (gold < title.cost) {
      triggerNotification("Or insuffisant pour débloquer ce titre ! 🪙", 'error');
      return;
    }
    const success = buyTitle(title.id, title.name, title.cost);
    if (success) {
      triggerNotification(`Titre "${title.name}" déverrouillé ! 🏷️`, 'success');
    } else {
      triggerNotification("Une erreur est survenue lors de l'achat.", 'error');
    }
  };

  // Acheter une icône
  const handleBuyIcon = (icon: { id: string; name: string; cost: number }) => {
    if (gold < icon.cost) {
      triggerNotification("Or insuffisant pour débloquer cette icône ! 🪙", 'error');
      return;
    }
    const success = buyIcon(icon.id, '', icon.cost);
    if (success) {
      triggerNotification(`Icône "${icon.name}" déverrouillée ! 🎭`, 'success');
    } else {
      triggerNotification("Une erreur est survenue lors de l'achat.", 'error');
    }
  };

  // Équiper un skin déverrouillé sur une unité
  const handleEquipSkin = (unitId: string) => {
    if (selectedSkinForEquip) {
      equipSkin(unitId, selectedSkinForEquip.id);
      const unit = units.find(u => u.id === unitId);
      triggerNotification(`Skin "${selectedSkinForEquip.name}" équipé sur ${unit?.name} !`, 'success');
      setSelectedSkinForEquip(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* En-tête du Shop */}
      <View style={styles.header}>
        <Text style={styles.title}>Boutique Cyber-Bazar</Text>
        <Text style={styles.subtitle}>Débloquez des skins de combat, des titres exclusifs et des icônes de profil.</Text>
        <View style={styles.goldBadgeRow}>
          <Text style={styles.goldText}>Solde : </Text>
          <Image source={require('../../assets/images/gold_coin.png')} style={styles.goldIcon} />
          <Text style={styles.goldValueText}>{gold}</Text>
        </View>
      </View>

      {/* Sélecteur de catégorie */}
      <View style={styles.categoryTabs}>
        {[
          { key: 'skins', label: '⚔️ PIONS' },
          { key: 'titles', label: '🏷️ TITRES' },
          { key: 'icons', label: '🎭 ICÔNES' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.categoryTabButton, activeTab === tab.key && styles.categoryTabButtonActive]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.categoryTabText, activeTab === tab.key && styles.categoryTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications flottantes */}
      {message && (
        <View
          style={[
            styles.notification,
            message.type === 'success' ? styles.notificationSuccess : styles.notificationError,
          ]}
        >
          <Text style={styles.notificationText}>{message.text}</Text>
        </View>
      )}

      {/* Liste des objets en vente */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Grille des skins */}
        {activeTab === 'skins' && (
          <View style={styles.skinsGrid}>
            {skins.map((skin) => (
              <View key={skin.id} style={styles.skinCard}>
                <Image source={getSkinSource(skin.id)} style={styles.skinImage} />
                
                <View style={styles.skinInfo}>
                  <Text style={styles.skinName}>{skin.name}</Text>
                  
                  {/* Niveau des particules */}
                  <View style={styles.particlesContainer}>
                    <Text style={styles.particlesLabel}>Particules :</Text>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Text
                        key={idx}
                        style={[
                          styles.star,
                          idx < skin.particleLevel ? styles.starFilled : styles.starEmpty,
                        ]}
                      >
                        ★
                      </Text>
                    ))}
                  </View>

                  {/* Bouton d'action */}
                  {skin.unlocked ? (
                    <TouchableOpacity
                      style={styles.equipButton}
                      onPress={() => setSelectedSkinForEquip(skin)}
                    >
                      <Text style={styles.equipButtonText}>Équiper</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.buyButton}
                      onPress={() => handleBuySkin(skin)}
                    >
                      <View style={styles.buyButtonContainer}>
                        <Text style={styles.buyButtonText}>Acheter - </Text>
                        <Image source={require('../../assets/images/gold_coin.png')} style={styles.buttonGoldIcon} />
                        <Text style={styles.buyButtonText}>{skin.cost}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Liste des titres */}
        {activeTab === 'titles' && (
          <View style={styles.titlesList}>
            {SHOP_TITLES.map((title) => {
              const isUnlocked = unlockedTitles.includes(title.name);
              return (
                <View key={title.id} style={[styles.titleCard, isUnlocked && styles.itemCardUnlocked]}>
                  <View style={styles.titleInfo}>
                    <Text style={styles.titleNameText}>{title.name}</Text>
                    <Text style={styles.titleSubtitleText}>Titre honorifique pour votre profil</Text>
                  </View>
                  {isUnlocked ? (
                    <View style={styles.ownedBadge}>
                      <Text style={styles.ownedBadgeText}>Possédé</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.buyItemButton}
                      onPress={() => handleBuyTitle(title)}
                    >
                      <View style={styles.buyItemButtonContainer}>
                        <Image source={require('../../assets/images/gold_coin.png')} style={styles.buttonGoldIcon} />
                        <Text style={styles.buyItemButtonText}>{title.cost}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Grille des icônes de profil */}
        {activeTab === 'icons' && (
          <View style={styles.skinsGrid}>
            {SHOP_ICONS.map((icon) => {
              const isUnlocked = unlockedIcons.includes(icon.id);
              return (
                <View key={icon.id} style={[styles.iconCard, isUnlocked && styles.itemCardUnlocked]}>
                  <View style={styles.iconEmojiContainer}>
                    <Image source={getAvatarSource(icon.id)} style={styles.iconImage} />
                  </View>
                  <View style={styles.iconInfo}>
                    <Text style={styles.iconNameText}>{icon.name}</Text>
                    {isUnlocked ? (
                      <View style={[styles.ownedBadge, { marginTop: 8 }]}>
                        <Text style={styles.ownedBadgeText}>Possédé</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.buyButton, { marginTop: 8, width: '100%' }]}
                        onPress={() => handleBuyIcon(icon)}
                      >
                        <View style={styles.buyButtonContainer}>
                          <Image source={require('../../assets/images/gold_coin.png')} style={styles.buttonGoldIcon} />
                          <Text style={styles.buyButtonText}>{icon.cost}</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal de sélection de l'unité à équiper */}
      <Modal
        visible={selectedSkinForEquip !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedSkinForEquip(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Équiper : {selectedSkinForEquip?.name}</Text>
            <Text style={styles.modalSubtitle}>Sélectionnez l'unité cible pour appliquer les particules :</Text>
            
            <FlatList
              data={units}
              keyExtractor={(item) => item.id}
              renderItem={({ item }: { item: Unit }) => {
                const isP1 = item.player === 'player1';
                const hasSkinEquipped = item.skin.id === selectedSkinForEquip?.id;

                return (
                  <TouchableOpacity
                    style={[
                      styles.unitItem,
                      isP1 ? styles.unitItemP1 : styles.unitItemP2,
                      hasSkinEquipped && styles.unitItemActive,
                    ]}
                    onPress={() => handleEquipSkin(item.id)}
                  >
                    <View>
                      <Text style={styles.unitItemName}>{item.name}</Text>
                      <Text style={styles.unitItemDetails}>
                        Joueur : {isP1 ? 'ROUGE' : 'BLEU'} | Skin : {item.skin.name}
                      </Text>
                    </View>
                    {hasSkinEquipped && <Text style={styles.equippedBadge}>Actif</Text>}
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setSelectedSkinForEquip(null)}
            >
              <Text style={styles.closeModalButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 18,
  },
  goldBadge: {
    backgroundColor: '#eab308',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#eab308',
    shadowRadius: 10,
    shadowOpacity: 0.3,
  },
  goldText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notification: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 8,
    zIndex: 999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowRadius: 5,
    shadowOpacity: 0.3,
  },
  notificationSuccess: {
    backgroundColor: '#10b981',
  },
  notificationError: {
    backgroundColor: '#ef4444',
  },
  notificationText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  scrollContainer: {
    padding: 20,
  },
  skinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skinCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 18,
    overflow: 'hidden',
  },
  skinImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  skinInfo: {
    padding: 12,
  },
  skinName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
  },
  particlesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  particlesLabel: {
    color: '#94a3b8',
    fontSize: 10,
    marginRight: 4,
  },
  star: {
    fontSize: 12,
    marginHorizontal: 1,
  },
  starFilled: {
    color: '#f59e0b',
  },
  starEmpty: {
    color: '#475569',
  },
  buyButton: {
    backgroundColor: '#eab308',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 12,
  },
  equipButton: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  equipButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 15,
    textAlign: 'center',
  },
  unitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  unitItemP1: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  unitItemP2: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  unitItemActive: {
    borderColor: '#fff',
    borderWidth: 1.5,
  },
  unitItemName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  unitItemDetails: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  equippedBadge: {
    backgroundColor: '#10b981',
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  closeModalButton: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: '#475569',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  categoryTabs: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderColor: '#334155',
    padding: 6,
    gap: 8,
  },
  categoryTabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryTabButtonActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: '#38bdf8',
  },
  categoryTabText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  categoryTabTextActive: {
    color: '#38bdf8',
  },
  titlesList: {
    gap: 12,
    paddingBottom: 20,
  },
  titleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
  },
  titleInfo: {
    flex: 1,
    gap: 4,
  },
  titleNameText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  titleSubtitleText: {
    color: '#64748b',
    fontSize: 11,
  },
  ownedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  ownedBadgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buyItemButton: {
    backgroundColor: '#eab308',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buyItemButtonText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 18,
    padding: 12,
    alignItems: 'center',
  },
  iconEmojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconEmojiText: {
    fontSize: 32,
    textAlign: 'center',
  },
  iconInfo: {
    width: '100%',
    alignItems: 'center',
  },
  iconNameText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itemCardUnlocked: {
    borderColor: '#10b981',
  },
  goldBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  goldIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  goldValueText: {
    color: '#fbbf24',
    fontWeight: 'bold',
    fontSize: 13,
  },
  buyButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  buttonGoldIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  buyItemButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});
