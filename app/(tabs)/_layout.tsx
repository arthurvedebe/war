import React, { useEffect, useRef } from 'react';
import { SymbolView } from 'expo-symbols';
import { Link, Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import { useGameStore } from '../../src/store/gameStore';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  const isCombat = useGameStore((state) => state.setupPhase === 'playing');
  const selectedMenuMusic = useGameStore((state) => state.selectedMenuMusic);
  const activePreviewTrackId = useGameStore((state) => state.activePreviewTrackId);
  const soundRef = useRef<Audio.Sound | null>(null);
  // Track the currently-loaded music key to avoid unnecessary reloads
  const currentMusicKeyRef = useRef<string>('');

  const musicKey = isCombat ? 'combat' : selectedMenuMusic;

  // Gérer la mise en pause/lecture de la musique de fond lors d'une préécoute
  useEffect(() => {
    if (!soundRef.current) return;
    if (activePreviewTrackId !== null) {
      soundRef.current.pauseAsync().catch(() => {});
    } else {
      soundRef.current.playAsync().catch(() => {});
    }
  }, [activePreviewTrackId]);

  useEffect(() => {
    // Skip if the same music is already loaded
    if (currentMusicKeyRef.current === musicKey) return;
    currentMusicKeyRef.current = musicKey;

    let active = true;

    async function switchMusic() {
      // Unload previous sound
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch (e) {
          console.log('Unload sound error', e);
        }
        soundRef.current = null;
      }

      if (!active) return;

      let musicSource: number;
      if (isCombat) {
        musicSource = require('../../assets/audio/combat_music.mp3');
      } else {
        switch (selectedMenuMusic) {
          case 'menu_ancient':
            musicSource = require('../../assets/audio/music_menu_ancient.mp3');
            break;
          case 'menu_space':
            musicSource = require('../../assets/audio/music_menu_space.mp3');
            break;
          case 'menu_tribal':
            musicSource = require('../../assets/audio/music_menu_tribal.mp3');
            break;
          default:
            musicSource = require('../../assets/audio/menu_music.mp3');
        }
      }

      const sound = new Audio.Sound();
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          playThroughEarpieceAndroid: false,
        });
        await sound.loadAsync(musicSource, { isLooping: true, volume: 0.4 });
        soundRef.current = sound;
        if (active) {
          // Si on est en train de préécouter une musique dans la boutique, on ne lance pas la musique de fond tout de suite
          if (useGameStore.getState().activePreviewTrackId !== null) {
            await sound.pauseAsync();
          } else {
            await sound.playAsync();
          }
        }
      } catch (e) {
        console.log('Load sound error', e);
      }
    }

    switchMusic();

    return () => {
      active = false;
    };
  }, [musicKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);


  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Boutique',
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable style={{ marginRight: 15 }}>
                {({ pressed }) => (
                  <SymbolView
                    name={{ ios: 'info.circle', android: 'info', web: 'info' } as any}
                    size={22}
                    tintColor={Colors[colorScheme].text}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: 'Jeu Tactique',
          href: null,
        }}
      />
    </Tabs>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  // Masquer complètement la Tab Bar lorsque l'utilisateur est sur l'écran de combat / jeu tactique (route 'game')
  const currentRouteName = state.routes[state.index].name;
  if (currentRouteName === 'game') {
    return null;
  }

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        // Skip auxiliary screens that shouldn't show in the tab bar
        if (route.name.startsWith('_') || options.href === null || route.name === 'game') {
          return null;
        }

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Render icons based on route name
        let iconName = 'house.fill';
        if (route.name === 'index') {
          iconName = 'house.fill';
        } else if (route.name === 'game') {
          iconName = 'gamecontroller.fill';
        } else if (route.name === 'shop') {
          iconName = 'bag.fill';
        } else if (route.name === 'profile') {
          iconName = 'person.crop.circle.fill';
        }

        const activeColor = '#3b82f6';
        const inactiveColor = '#94a3b8';
        const tint = isFocused ? activeColor : inactiveColor;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              styles.tabButton,
              isFocused ? styles.tabButtonActive : styles.tabButtonInactive,
            ]}
          >
            <SymbolView
              name={iconName as any}
              tintColor={tint}
              size={20}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: tint, fontWeight: isFocused ? 'bold' : 'normal' },
              ]}
            >
              {label}
            </Text>
            {isFocused && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 24,
    left: 15,
    right: 15,
    height: 66,
    backgroundColor: 'rgba(15, 23, 42, 0.92)', // Glassmorphism dark background
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(51, 65, 85, 0.7)',
    padding: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#3b82f6', // Glowing shadow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    position: 'relative',
    gap: 3,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)', // Glowing background tab
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabLabel: {
    fontSize: 9,
    marginTop: 1,
    letterSpacing: 0.2,
  },
  indicator: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowRadius: 3,
    shadowOpacity: 1,
  },
});
