import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // Set white background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// // Lighting
// const light = new THREE.HemisphereLight(0xffffff, 0x444444);
// light.position.set(0, 20, 0);
// scene.add(light);

// const directionalLight = new THREE.DirectionalLight(0xffffff);
// directionalLight.position.set(0, 10, 5).normalize();
// scene.add(directionalLight);

// Lights

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

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


// //Adding a plane or the ground
// const geometry = new THREE.PlaneGeometry( 10, 10 );
// const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
// const plane = new THREE.Mesh( geometry, material );
// scene.add( plane );

// plane.rotateX(-Math.PI/2);


camera.position.z = 15;



// Helpers

const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 50, 0xffffff);
scene.add( gridHelper)

const controls = new OrbitControls(camera, renderer.domElement);

//clock to hover the cat 
let clock = new THREE.Clock();

function hoverCharacter(model){
  const elapsed = clock.getElapsedTime();

  if (model) {
    // Hover up and down using sine wave
    model.position.y = Math.sin(elapsed * 2) * 0.5; // 2 is speed, 0.5 is height
  }
}


//tracking keypresses
const keysPressed = {};

window.addEventListener('keydown', (event) => {
  keysPressed[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
  keysPressed[event.key.toLowerCase()] = false;
});

console.log(keysPressed);
function moveCharacter(model,keysPressed){
  const speed =0.085;
 if(model){
    if(keysPressed['w']){model.position.x+=speed}
    if(keysPressed['a']){model.position.z -=speed}
    if(keysPressed['s']){model.position.x-=speed}
    if(keysPressed['d']){model.position.z+=speed}
 }
}

function animate() {
  requestAnimationFrame(animate);
  catModel.rotation.y =Math.PI/2;


  // const elapsed = clock.getElapsedTime();

  // if (catModel) {
  //   // Hover up and down using sine wave
  //   catModel.position.y = Math.sin(elapsed * 2) * 0.5; // 2 is speed, 0.5 is height
  // }

  hoverCharacter(catModel);
  moveCharacter(catModel,keysPressed)
  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
