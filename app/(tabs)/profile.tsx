import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import { useGameStore, XP_THRESHOLDS, getAvatarSource } from '../../src/store/gameStore';
import { SymbolView } from 'expo-symbols';

export default function ProfileScreen() {
  const {
    gold,
    rewards,
    xp,
    level,
    username,
    avatarUri,
    unlockedTitles,
    selectedTitle,
    unlockedIcons,
    updateUsername,
    updateAvatar,
    updateTitle,
    resetProfile,
  } = useGameStore();

  const unlockedCount = rewards.filter((r) => r.unlocked).length;
  const totalCount = rewards.length;

  const prevThreshold = level > 1 ? XP_THRESHOLDS[level - 2] : 0;
  const nextThreshold = level - 1 < XP_THRESHOLDS.length ? XP_THRESHOLDS[level - 1] : 99999;
  const xpInLevel = xp - prevThreshold;
  const xpNeededForNext = nextThreshold - prevThreshold;
  const xpPct = Math.min(100, Math.max(0, (xpInLevel / xpNeededForNext) * 100));

  // États pour le modal d'édition
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarUri);
  const [tempTitle, setTempTitle] = useState(selectedTitle);
  const [showResetConfirm, setShowResetConfirm] = useState(false);



  const handleOpenEdit = () => {
    setTempUsername(username);
    setSelectedAvatar(avatarUri);
    setTempTitle(selectedTitle);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (tempUsername.trim().length > 0) {
      updateUsername(tempUsername.trim());
    }
    updateAvatar(selectedAvatar);
    updateTitle(tempTitle);
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Profil Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image
            source={getAvatarSource(avatarUri)}
            style={styles.avatar}
          />
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>LV.{level}</Text>
          </View>
        </View>

        <Text style={styles.gamerTag}>{username}</Text>
        <Text style={styles.gamerTitle}>{selectedTitle}</Text>

        {/* Bouton d'édition du profil */}
        <TouchableOpacity style={styles.editProfileButton} onPress={handleOpenEdit}>
          <Text style={styles.editProfileButtonText}>✏️ MODIFIER LE PROFIL</Text>
        </TouchableOpacity>

        {/* Barre d'XP */}
        <View style={styles.xpContainer}>
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>XP Combat</Text>
            <Text style={styles.xpVal}>{xp} / {nextThreshold} XP</Text>
          </View>
          <View style={styles.xpBarBackground}>
            <View style={[styles.xpBarFill, { width: `${xpPct}%` }]} />
          </View>
        </View>
      </View>

      {/* Statistiques Rapides */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <SymbolView name="dollarsign.circle.fill" tintColor="#eab308" size={24} />
          <Text style={styles.statVal}>{gold}</Text>
          <Text style={styles.statLabel}>Or disponible</Text>
        </View>
        <View style={styles.statCard}>
          <SymbolView name="trophy.fill" tintColor="#fbbf24" size={24} />
          <Text style={styles.statVal}>{unlockedCount}/{totalCount}</Text>
          <Text style={styles.statLabel}>Trophées Débloqués</Text>
        </View>
      </View>

      {/* Affinité de Faction */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Affinités de Factions</Text>
        <View style={styles.affinityCard}>
          {/* Golems */}
          <View style={styles.affinityItem}>
            <View style={styles.affinityHeader}>
              <Text style={[styles.affinityName, { color: '#fbbf24' }]}>⚡ Golems de Rune</Text>
              <Text style={styles.affinityVal}>75%</Text>
            </View>
            <View style={styles.affinityBarBg}>
              <View style={[styles.affinityBarFill, { backgroundColor: '#fbbf24', width: '75%' }]} />
            </View>
          </View>

          {/* Sylvains */}
          <View style={styles.affinityItem}>
            <View style={styles.affinityHeader}>
              <Text style={[styles.affinityName, { color: '#22c55e' }]}>🍃 Sylvains de l'Orée</Text>
              <Text style={styles.affinityVal}>45%</Text>
            </View>
            <View style={styles.affinityBarBg}>
              <View style={[styles.affinityBarFill, { backgroundColor: '#22c55e', width: '45%' }]} />
            </View>
          </View>

          {/* Technomanciens */}
          <View style={styles.affinityItem}>
            <View style={styles.affinityHeader}>
              <Text style={[styles.affinityName, { color: '#3b82f6' }]}>🔮 Technomanciens</Text>
              <Text style={styles.affinityVal}>60%</Text>
            </View>
            <View style={styles.affinityBarBg}>
              <View style={[styles.affinityBarFill, { backgroundColor: '#3b82f6', width: '60%' }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Liste des Succès */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Succès & Récompenses</Text>
        <View style={styles.trophiesContainer}>
          {rewards.map((reward) => (
            <View
              key={reward.id}
              style={[
                styles.trophyItem,
                reward.unlocked ? styles.trophyItemUnlocked : styles.trophyItemLocked,
              ]}
            >
              <View style={styles.trophyIconContainer}>
                <SymbolView
                  name={reward.unlocked ? 'trophy.fill' : 'lock.fill'}
                  tintColor={reward.unlocked ? '#fbbf24' : '#64748b'}
                  size={20}
                />
              </View>
              <View style={styles.trophyInfo}>
                <Text style={[styles.trophyTitle, reward.unlocked ? styles.textActive : styles.textLocked]}>
                  {reward.title}
                </Text>
                <Text style={styles.trophyDesc}>{reward.description}</Text>
              </View>
              {reward.unlocked && (
                <View style={styles.checkContainer}>
                  <SymbolView name="checkmark.circle.fill" tintColor="#10b981" size={18} />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Modal d'édition de profil */}
      <Modal visible={isEditing} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✏️ Édition du Profil</Text>

            {/* Saisie du pseudo */}
            <Text style={styles.inputLabel}>Pseudo du Commandant :</Text>
            <TextInput
              style={styles.textInput}
              value={tempUsername}
              onChangeText={setTempUsername}
              placeholder="Entrez votre pseudo..."
              placeholderTextColor="#64748b"
              maxLength={20}
            />

            {/* Choix du titre */}
            <Text style={styles.inputLabel}>Titre du Commandant :</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.titleSelectorList} contentContainerStyle={{ gap: 8, paddingBottom: 6 }}>
              {unlockedTitles.map((title) => {
                const isActive = tempTitle === title;
                return (
                  <TouchableOpacity
                    key={title}
                    style={[styles.titleSelectorPill, isActive && styles.titleSelectorPillActive]}
                    onPress={() => setTempTitle(title)}
                  >
                    <Text style={[styles.titleSelectorPillText, isActive && styles.titleSelectorPillTextActive]}>
                      {title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Sélecteur d'avatar */}
            <Text style={styles.avatarSelectorLabel}>Sélectionnez votre avatar :</Text>
            <ScrollView style={styles.avatarSelectorGridScroll} contentContainerStyle={styles.avatarSelectorGridContainer} showsVerticalScrollIndicator={true}>
              {unlockedIcons.map((icon) => {
                const isSelected = selectedAvatar === icon;

                return (
                  <TouchableOpacity
                    key={icon}
                    style={[styles.avatarGridItem, isSelected && styles.avatarGridItemActive]}
                    onPress={() => setSelectedAvatar(icon)}
                  >
                    <Image
                      source={getAvatarSource(icon)}
                      style={styles.selectorAvatarImage}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Actions du modal */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                <Text style={styles.modalBtnText}>ANNULER</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.modalBtnText}>SAUVEGARDER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bouton de Réinitialisation complète */}
      <TouchableOpacity
        style={styles.resetProfileButton}
        onPress={() => setShowResetConfirm(true)}
      >
        <Text style={styles.resetProfileButtonText}>⚠️ RÉINITIALISER LE PROFIL</Text>
      </TouchableOpacity>

      {/* Modal de Confirmation de Réinitialisation */}
      <Modal visible={showResetConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.modalContentDanger]}>
            <Text style={styles.modalTitleDanger}>⚠️ RÉINITIALISATION</Text>
            
            <Text style={styles.modalWarningText}>
              Attention : Cette action réinitialisera l'intégralité de votre progression.
            </Text>
            
            <View style={styles.warningBox}>
              <Text style={styles.warningBoxItem}>• Or disponible remis à 200</Text>
              <Text style={styles.warningBoxItem}>• Niveau et XP remis à 1 et 0 XP</Text>
              <Text style={styles.warningBoxItem}>• Progression de récompenses réinitialisée</Text>
              <Text style={styles.warningBoxItem}>• Succès verrouillés à nouveau</Text>
              <Text style={styles.warningBoxItem}>• Skins de boutique reverrouillés</Text>
              <Text style={styles.warningBoxItem}>• Pseudo et avatar par défaut rétablis</Text>
            </View>

            <Text style={styles.modalConfirmPrompt}>
              Voulez-vous vraiment continuer ? Cette action est irréversible.
            </Text>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowResetConfirm(false)}
              >
                <Text style={styles.modalBtnText}>ANNULER</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resetConfirmButton}
                onPress={() => {
                  resetProfile();
                  setShowResetConfirm(false);
                }}
              >
                <Text style={styles.modalBtnText}>RÉINITIALISER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 110,
  },
  profileCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#38bdf8',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#38bdf8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#1e293b',
  },
  levelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  gamerTag: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'center',
  },
  gamerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38bdf8',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  editProfileButton: {
    marginBottom: 18,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  editProfileButtonText: {
    color: '#38bdf8',
    fontSize: 9.5,
    fontWeight: 'bold',
  },
  xpContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 15,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  xpVal: {
    fontSize: 11,
    color: '#38bdf8',
    fontWeight: 'bold',
  },
  xpBarBackground: {
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 0.48,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 6,
  },
  statVal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  affinityCard: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    gap: 15,
  },
  affinityItem: {
    width: '100%',
  },
  affinityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  affinityName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  affinityVal: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  affinityBarBg: {
    height: 6,
    backgroundColor: '#0f172a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  affinityBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  trophiesContainer: {
    gap: 10,
  },
  trophyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  trophyItemUnlocked: {
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    borderColor: '#fbbf24',
  },
  trophyItemLocked: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    opacity: 0.6,
  },
  trophyIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyInfo: {
    flex: 1,
    gap: 2,
  },
  trophyTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  textActive: {
    color: '#fbbf24',
  },
  textLocked: {
    color: '#94a3b8',
  },
  trophyDesc: {
    fontSize: 11,
    color: '#64748b',
  },
  checkContainer: {
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: '#fff',
    fontSize: 14,
    marginBottom: 20,
  },
  avatarSelectorLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  avatarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  avatarGridItem: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: 'transparent',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  avatarGridItemActive: {
    borderColor: '#38bdf8',
  },
  selectorAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#38bdf8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  resetProfileButton: {
    marginTop: 10,
    marginBottom: 30,
    paddingVertical: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetProfileButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalContentDanger: {
    borderColor: '#ef4444',
    borderWidth: 1.5,
  },
  modalTitleDanger: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 1,
  },
  modalWarningText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  warningBoxItem: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 4,
  },
  modalConfirmPrompt: {
    color: '#cbd5e1',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  resetConfirmButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  avatarEmojiContainer: {
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#38bdf8',
    borderRadius: 45,
    width: 90,
    height: 90,
  },
  avatarEmojiText: {
    fontSize: 46,
    textAlign: 'center',
    lineHeight: Platform.OS === 'ios' ? 56 : undefined,
    includeFontPadding: false,
  },
  titleSelectorList: {
    maxHeight: 45,
    marginBottom: 15,
  },
  titleSelectorPill: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSelectorPillActive: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  titleSelectorPillText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  titleSelectorPillTextActive: {
    color: '#38bdf8',
  },
  avatarSelectorGridScroll: {
    maxHeight: 140,
    marginBottom: 20,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 8,
  },
  avatarSelectorGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  selectorAvatarEmoji: {
    fontSize: 32,
    textAlign: 'center',
    lineHeight: Platform.OS === 'ios' ? 42 : undefined,
    includeFontPadding: false,
  },
});
