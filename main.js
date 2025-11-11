import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/controls/OrbitControls.js';
import { BVHLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/BVHLoader.js';

let mixer, skeletonHelper, clock, speed = 1;
let scene, camera, renderer, controls;
let isPlaying = false;

init();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 200, 300);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  light.position.set(0, 200, 0);
  scene.add(light);

  const grid = new THREE.GridHelper(400, 20, 0x444444, 0x222222);
  scene.add(grid);

  clock = new THREE.Clock();

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  if (mixer && isPlaying) mixer.update(clock.getDelta() * speed);
  renderer.render(scene, camera);
}

document.getElementById('bvhInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const contents = event.target.result;
    loadBVH(contents);
  };
  reader.readAsText(file);
});

document.getElementById('playPauseBtn').addEventListener('click', () => {
  isPlaying = !isPlaying;
  document.getElementById('playPauseBtn').textContent = isPlaying ? 'Pause' : 'Play';
});

document.getElementById('speedSlider').addEventListener('input', e => {
  speed = parseFloat(e.target.value);
});

function loadBVH(contents) {
  const loader = new BVHLoader();
  const result = loader.parse(contents);

  if (skeletonHelper) {
    scene.remove(skeletonHelper);
  }

  const skeleton = result.skeleton;
  skeletonHelper = new THREE.SkeletonHelper(skeleton.bones[0]);
  skeletonHelper.skeleton = skeleton;

  scene.add(skeletonHelper);
  scene.add(skeleton.bones[0]);

  mixer = new THREE.AnimationMixer(skeletonHelper);
  mixer.clipAction(result.clip).play();

  clock.start();

  isPlaying = false;
  document.getElementById('playPauseBtn').disabled = false;
  document.getElementById('playPauseBtn').textContent = 'Play';
}
