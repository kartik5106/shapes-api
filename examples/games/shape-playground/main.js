import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // Set white background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
light.position.set(0, 20, 0);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(0, 10, 5).normalize();
scene.add(directionalLight);

// Load cat model
const loader = new GLTFLoader();
let catModel;

loader.load(
  'catto.glb', // adjust path if needed
  function (gltf) {
    catModel = gltf.scene;
    catModel.scale.set(1.5, 1.5, 1.5);
    catModel.position.y = -1;
    scene.add(catModel);
  },
  undefined,
  function (error) {
    console.error('Error loading model:', error);
  }
);

camera.position.z = 15;

// Animation
function animate() {
  if (catModel) {
    catModel.rotation.y += 0.005;
  }
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
