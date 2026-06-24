import { Audio } from 'expo-av';

const sfxSources = {
  click: require('../../assets/audio/sfx_click.wav'),
  laser: require('../../assets/audio/sfx_laser.wav'),
  melee: require('../../assets/audio/sfx_melee.wav'),
  hit: require('../../assets/audio/sfx_hit.wav'),
  victory: require('../../assets/audio/sfx_victory.wav'),
};

export async function playSfx(type: keyof typeof sfxSources) {
  try {
    const { sound } = await Audio.Sound.createAsync(
      sfxSources[type],
      { shouldPlay: true, volume: 0.5 }
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (e) {
    console.log('Error playing SFX:', e);
  }
}
