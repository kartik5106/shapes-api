import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // White background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, -10); // Initial offset

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Grid for reference
const gridHelper = new THREE.GridHelper(200, 50, 0x888888);
scene.add(gridHelper);

// Cat model
const loader = new GLTFLoader();
let catModel;
let basePosition = new THREE.Vector3(); // base position without hover

// loader.load(
//   'catto.glb',
//   function (gltf) {
//     catModel = gltf.scene;
//     catModel.scale.set(1.5, 1.5, 1.5);
//     basePosition.set(0, 0, 0);
//     catModel.position.copy(basePosition);
//     scene.add(catModel);
//   },
//   undefined,
//   function (error) {
//     console.error('Error loading model:', error);
//   }
// );

//loading a sphere for testing as cat model is very high def
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x3399ff });
catModel = new THREE.Mesh(sphereGeometry, sphereMaterial);
catModel.scale.set(1.5,1.5,1.5);
scene.add(catModel);

// Track keypresses
const keysPressed = {};
window.addEventListener('keydown', (e) => keysPressed[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keysPressed[e.key.toLowerCase()] = false);

// Clock
const clock = new THREE.Clock();

// Hover character visually
function hoverCharacter(model, basePosition) {
  const elapsed = clock.getElapsedTime();
  if (model) {
    const hoverOffset = Math.sin(elapsed * 2) * 0.5;
    model.position.set(basePosition.x, basePosition.y + hoverOffset, basePosition.z);
  }
}

// Move base position using WASD
function moveCharacter(basePos) {
  const speed = 0.0085;
  if (keysPressed['w']) basePos.z += speed;
  if (keysPressed['s']) basePos.z -= speed;
  if (keysPressed['a']) basePos.x += speed;
  if (keysPressed['d']) basePos.x -= speed;
}

// Camera follows base position
function updateCameraFollow(basePos) {
  const offset = new THREE.Vector3(0, 8, -15);
  const desiredPosition = basePos.clone().add(offset);
  camera.position.lerp(desiredPosition, 0.1);
  camera.lookAt(basePos);
}

// Animate
function animate() {
  requestAnimationFrame(animate);
  moveCharacter(basePosition);
  hoverCharacter(catModel, basePosition);
  updateCameraFollow(basePosition);
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
