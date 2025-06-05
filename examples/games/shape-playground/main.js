import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 30, 120);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20);

// --- Renderer ---
// const renderer = new THREE.WebGLRenderer({ antialias: true });
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'), // Links Three.js to the canvas
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// --- Lighting ---
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
hemisphereLight.position.set(0, 50, 0);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionalLight.position.set(25, 40, 15);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -30;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -30;
directionalLight.shadow.bias = -0.0005;
scene.add(directionalLight);
scene.add(directionalLight.target);

// --- Floor ---
const floorGeometry = new THREE.PlaneGeometry(250, 250);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x999999,
  roughness: 0.9,
  metalness: 0.1
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
floor.position.y = 0;
scene.add(floor);

// --- Player Character Model ---
let characterModel; // This will hold the loaded cat model or fallback
const basePosition = new THREE.Vector3(); // Initialize base position, will be set by loader

const playerModelLoader = new GLTFLoader();
playerModelLoader.load(
  'catto.glb',
  function (gltf) {
    characterModel = gltf.scene;
    characterModel.scale.set(1.5, 1.5, 1.5);
    basePosition.set(0, 0, 0);
    characterModel.position.copy(basePosition);

    characterModel.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    scene.add(characterModel);
    console.log('Player cat model (catto.glb) loaded successfully.');

    // Ensure initial position and hover are applied correctly after load
    if (characterModel) {
      characterModel.position.x = basePosition.x;
      characterModel.position.z = basePosition.z;
      // Apply hover based on the now-set basePosition.y
      hoverCharacter(characterModel, basePosition);
    }
  },
  undefined, // onProgress callback
  function (error) {
    console.error('Error loading player model (catto.glb):', error);
    // Fallback: if player cat model fails, add a simple red sphere
    const fallbackSphereRadius = 0.5;
    const fallbackSphereScale = 1.5;
    const fallbackGeometry = new THREE.SphereGeometry(fallbackSphereRadius, 16, 16);
    const fallbackMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    characterModel = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
    characterModel.scale.set(fallbackSphereScale, fallbackSphereScale, fallbackSphereScale);

    // Position fallback sphere on the floor
    basePosition.set(0, fallbackSphereRadius * fallbackSphereScale, 0);
    characterModel.position.copy(basePosition);

    characterModel.castShadow = true;
    characterModel.receiveShadow = true;
    scene.add(characterModel);
    console.log("Added fallback red sphere for player character.");
  }
);

// --- Decorative Elements (Existing Cat Model) ---
const decorativeElements = new THREE.Group();
scene.add(decorativeElements);

//Random element Element 2: A torus knot
const torusKnotGeometry = new THREE.TorusKnotGeometry(1.2, 0.35, 120, 18);
const torusKnotMaterial = new THREE.MeshStandardMaterial({
  color: 0xff4500, roughness: 0.1, metalness: 0.8, emissive: 0x330000
});
const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
torusKnot.position.set(-9, 1.2 + 0.35 + 1, 5);
torusKnot.castShadow = true; torusKnot.receiveShadow = true;
decorativeElements.add(torusKnot);

// Element 3: Simple "Crystal" Structures
function createCrystal(x, y, z, color, height, radius) {
  const crystalGeo = new THREE.ConeGeometry(radius, height, 8);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: color, roughness: 0.1, metalness: 0.3,
    transparent: true, opacity: 0.85, emissive: new THREE.Color(color).multiplyScalar(0.2)
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.set(x, y + height / 2, z);
  crystal.castShadow = true; crystal.receiveShadow = true;
  decorativeElements.add(crystal);
}
createCrystal(12, 0, 10, 0xAFEEEE, 4, 1.5);
createCrystal(15, 0, 8, 0xFFC0CB, 3, 1);
createCrystal(-13, 0, -9, 0xDA70D6, 5, 2);

// --- Controls & Animation ---
const keysPressed = {};
window.addEventListener('keydown', (e) => keysPressed[e.key.toLowerCase()] = true, false);
window.addEventListener('keyup', (e) => keysPressed[e.key.toLowerCase()] = false, false);

const clock = new THREE.Clock();

function hoverCharacter(model, charBasePos) {
  const elapsed = clock.getElapsedTime();
  if (model) { // Check if model is loaded
    const hoverAmplitude = 0.20;
    const hoverSpeed = 3.5;
    const hoverOffset = Math.sin(elapsed * hoverSpeed) * hoverAmplitude;
    model.position.y = charBasePos.y + hoverOffset; // Hover relative to basePosition.y
  }
}

function moveCharacter(charBasePos, delta) {
  let speed = 8.0;
  if (keysPressed['shift']) speed = 15;

  const moveDistance = speed * delta;
  const moveInputVector = new THREE.Vector3();
  if (keysPressed['w'] || keysPressed['arrowup']) moveInputVector.z += 1;
  if (keysPressed['s'] || keysPressed['arrowdown']) moveInputVector.z -= 1;
  if (keysPressed['a'] || keysPressed['arrowleft']) moveInputVector.x += 1;
  if (keysPressed['d'] || keysPressed['arrowright']) moveInputVector.x -= 1;

  if (moveInputVector.lengthSq() > 0) {
    const cameraForward = new THREE.Vector3();
    camera.getWorldDirection(cameraForward);
    cameraForward.y = 0; cameraForward.normalize();

    const cameraRight = new THREE.Vector3().crossVectors(camera.up, cameraForward).normalize();

    const moveDirection = new THREE.Vector3();
    moveDirection.add(cameraForward.multiplyScalar(moveInputVector.z));
    moveDirection.add(cameraRight.multiplyScalar(moveInputVector.x));
    moveDirection.normalize();

    const actualMove = moveDirection.multiplyScalar(moveDistance);
    charBasePos.add(actualMove);

    if (characterModel) { // Check if characterModel is loaded
      characterModel.position.x = charBasePos.x;
      characterModel.position.z = charBasePos.z;
      // Y position is handled by hoverCharacter

      if (actualMove.lengthSq() > 0.0001) {
        const lookAtTarget = characterModel.position.clone().add(actualMove.setY(0));
        characterModel.lookAt(lookAtTarget);
      }
    }
  }
  directionalLight.target.position.copy(charBasePos);
}

function updateCameraFollow(charBasePos) {
  const offset = new THREE.Vector3(0, 12, 22);
  const desiredPosition = charBasePos.clone().add(offset);
  const lerpFactor = 0.04;
  camera.position.lerp(desiredPosition, lerpFactor);

  let lookAtY = charBasePos.y;
  if (characterModel && characterModel.scale) { // If model is loaded, use its scale
    // Approximate center based on scale; assumes model is ~1 unit tall before scaling
    lookAtY += characterModel.scale.y * 0.5;
  } else { // Fallback if model not loaded yet
    lookAtY += 0.75; // Generic offset (half of a 1.5 scaled unit)
  }
  camera.lookAt(charBasePos.clone().setY(lookAtY));
}

async function simpleChat() {
  const messageInput = document.getElementById('userMessage');

  // 2. Get the current value (the text entered by the user) from the input element.
  const messageText = messageInput.value;

  // 3. Get a reference to the span where we want to display the message.
  const displayArea = document.getElementById('displayMessage');

  const userMessageText = messageText;

  if (userMessageText === "") {
    return; // Don't send empty messages
  }


  try {
    // Send message to the Flask backend
    const response = await fetch('http://127.0.0.1:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: userMessageText, shapesincID: "tenshi" })
    });

    if (!response.ok) {
      // If the response status is not OK (e.g., 404, 500), throw an error
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const botReply = data.reply;

    //  Set the text content of the span to the message.
    displayArea.textContent = botReply;

    console.log(botReply);


  } catch (error) {
    console.error('Error sending/receiving message:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const chatButton = document.getElementById('chatButton');
  if (chatButton) {
    chatButton.addEventListener('click', simpleChat);
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

function animate() {
  // console.log(keysPressed);
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  moveCharacter(basePosition, delta);
  hoverCharacter(characterModel, basePosition); // Pass characterModel (which might be null initially)
  updateCameraFollow(basePosition);

  torusKnot.rotation.x += 0.008 * (60 * delta);
  torusKnot.rotation.y += 0.004 * (60 * delta);

  // Optional: Animate decorative cat if loaded
  // if (decorativeCatModel) {
  //     decorativeCatModel.rotation.y += 0.005 * (60 * delta);
  // }

  renderer.render(scene, camera);
}
animate();