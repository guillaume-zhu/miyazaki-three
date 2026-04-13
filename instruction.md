## Objectif



On veut permettre à l’utilisateur de **faire pivoter la caméra sans déplacer sa position**.



Concrètement :



- la caméra doit **rester fixe dans l’espace**

- seul son **angle de vue** doit changer

- la rotation doit se faire **uniquement quand l’utilisateur maintient le clic**

- hors drag, la souris doit rester libre pour :

    - le **hover**

    - le **clic sur les objets**

- il faut donc éviter `OrbitControls`, car `OrbitControls` fait tourner la caméra **autour d’une cible**, donc change sa position



---



## Comportement attendu



### Sans clic maintenu



- la caméra ne bouge pas

- la souris sert uniquement au raycaster

- on peut hover et cliquer les éléments



### Avec clic maintenu



- la caméra pivote selon le mouvement de la souris

- sa position ne change jamais

- seul son angle change



### Au relâchement



- la caméra garde son orientation actuelle

- la souris redevient libre pour les interactions



---



## Principe technique



Au lieu de déplacer directement la caméra dans la scène, on la place dans un **pivot** (`THREE.Group`).



### Pourquoi utiliser un pivot



Parce que ça permet de :



- garder la caméra à une position locale fixe

- faire tourner le groupe parent

- obtenir une rotation propre et compréhensible



En gros :



- `camera.position.set(...)` définit où la caméra se trouve

- `cameraPivot.rotation.x / y` définit vers où elle regarde



---



## Variables à gérer



Il faut stocker :



- `isDragging` → savoir si l’utilisateur maintient le clic

- `hasMoved` → distinguer un vrai drag d’un simple clic

- `yaw` → rotation horizontale gauche / droite

- `pitch` → rotation verticale haut / bas



---



## Logique des événements



### `mousedown`



Quand on appuie sur le clic :



- on active le mode rotation

- on reset `hasMoved` à `false`



### `mousemove`



Si `isDragging === true` :



- on met à jour `yaw` avec `movementX`

- on met à jour `pitch` avec `movementY`

- on applique ces valeurs au pivot

- on passe `hasMoved` à `true` si la souris a vraiment bougé



### `mouseup`



Quand on relâche :



- on désactive le mode rotation



### `click`



Quand il y a un clic :



- si `hasMoved === true`, on ignore ce clic

    - car ça veut dire qu’on était en train de drag la caméra

- sinon, on laisse le raycaster faire le clic objet



---



## Pourquoi `hasMoved` est important



Sans ça, un drag caméra pourrait être interprété comme un clic sur un objet à la fin.



Donc :



- **clic simple** = interaction objet

- **clic maintenu + déplacement** = rotation caméra



C’est ce qui permet de faire cohabiter proprement :



- navigation caméra

- raycaster



---



## Limites à prévoir



Il faut limiter la rotation pour éviter que la caméra fasse n’importe quoi.



Par exemple :



- limiter `yaw` pour ne pas tourner trop loin à gauche/droite

- limiter `pitch` pour éviter de regarder complètement vers le haut ou vers le bas



Ça permet :



- un cadre de vue maîtrisé

- une navigation plus propre

- moins de risques de casser la mise en scène



## Exemple de code complet



```jsx

import * as THREE from "three"



const scene = new THREE.Scene()



const sizes = {

width: window.innerWidth,

height: window.innerHeight,

}



const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)



// Position fixe de la caméra

camera.position.set(0, 2, 8)



// Pivot de caméra

const cameraPivot = new THREE.Group()

scene.add(cameraPivot)

cameraPivot.add(camera)



// Variables de rotation

let isDragging = false

let hasMoved = false

let yaw = 0

let pitch = 0



// Sensibilité

const rotationSpeed = 0.003



// Limites

const minYaw = -Math.PI / 4

const maxYaw = Math.PI / 4

const minPitch = -0.3

const maxPitch = 0.3



window.addEventListener("mousedown", (event) => {

// clic gauche uniquement

if (event.button !== 0) return



isDragging = true

hasMoved = false

})



window.addEventListener("mouseup", () => {

isDragging = false

})



window.addEventListener("mouseleave", () => {

isDragging = false

})



window.addEventListener("mousemove", (event) => {

if (!isDragging) return



if (event.movementX !== 0 || event.movementY !== 0) {

hasMoved = true

}



yaw -= event.movementX * rotationSpeed

pitch -= event.movementY * rotationSpeed



// Clamp des angles

yaw = Math.max(minYaw, Math.min(maxYaw, yaw))

pitch = Math.max(minPitch, Math.min(maxPitch, pitch))



cameraPivot.rotation.order = "YXZ"

cameraPivot.rotation.y = yaw

cameraPivot.rotation.x = pitch

})



window.addEventListener("click", () => {

if (hasMoved) return



// Ici on laisse le raycaster gérer le clic objet

console.log("clic simple")

})

```