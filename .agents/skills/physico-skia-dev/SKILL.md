---
name: physico-skia-dev
description: Guide et contraintes d'architecture pour le développement de jeux 2D physiques utilisant React Native Skia, Matter.js et Zustand dans Expo
---
# Architecture et Règles de Développement Physico-Skia

Ce skill contient les règles d'architecture et de performance indispensables pour maintenir et faire évoluer le projet **Physico-Skia**. Tout agent travaillant sur ce codebase doit impérativement respecter ces contraintes.

## 1. Rendu Performant 60 FPS (JSI)

* **Pas de Re-renders React dans la boucle de jeu** : Ne jamais mettre à jour le state local React (`useState`) pour les coordonnées physiques ($x, y$, angle) à chaque frame.
* **Shared Values & Derived Values** : Utiliser uniquement les valeurs partagées Reanimated (`useSharedValue`) pour synchroniser les positions du moteur physique avec le Canvas Skia.
* **Groupes Relatifs** : Pour dessiner des entités complexes (comme une unité avec ses particules et son outline), regrouper ses éléments enfants dans un composant `<Group>` Skia dont le `transform` est piloté par un `useDerivedValue` de translation (translateX/translateY). Dessiner tous les éléments internes (cercles, rectangles) relativement à `(0, 0)`.
* **Règle de Hook dans Skia** : Ne jamais instancier de hooks Reanimated (comme `useSharedValue`, `useDerivedValue` ou `useDerivedValue`) à l'intérieur d'une boucle `.map()` de rendu. Utiliser la structure de groupe relatif pour appliquer des coordonnées statiques à l'intérieur de la boucle.

## 2. Intégration Matter.js (Physique)

* **Nettoyage des Moteurs physiques** : Toujours vider le monde physique (`Matter.World.clear`) et arrêter le moteur (`Matter.Engine.clear`) lors du démontage (`unmount`) des composants de jeu pour éviter toute fuite de mémoire.
* **Mise à jour dans Frame Ticker** : Utiliser `useFrameCallback` de Reanimated pour déclencher `Matter.Engine.update(engine, delta)` de façon synchrone avec le taux de rafraîchissement natif de l'écran.
* **Gestion des Collisions** : Les écouteurs de collision (`collisionStart`, `collisionActive`) s'exécutent sur le thread de calcul physique. Pour modifier l'état global du jeu (Zustand) suite à un impact (ex: infliger des dégâts à une unité), encapsuler l'appel dans un callback `runOnJS` de Reanimated ou un mécanisme asynchrone sécurisé.

## 3. Gestion d'État avec Zustand

* **Découplage de la physique** : Le store Zustand (`src/store/gameStore.ts`) gère l'état théorique et logique du tour (Points d'Action restants, joueur actif, PV logiques des unités, skins, récompenses). Le monde Matter.js gère la simulation physique en temps réel.
* **Bascule de tour** : La fin de tour réinitialise les Points d'Action à 3 et active le joueur suivant.
