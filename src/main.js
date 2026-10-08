import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const MODEL_URL = '/models/model.glb'; // sesuaikan nama file

// Scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060f);

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const dir = new THREE.DirectionalLight(0xffffff, 3);
dir.position.set(5, 5, 5);
scene.add(dir);

// Bintang (kreasi tambahan)
const pos = [];
for (let i = 0; i < 1500; i++)
  pos.push((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.08, color: 0xffffff }));
scene.add(stars);

// Load model
const container = new THREE.Group();
scene.add(container);
let mixer = null;
let isRotating = true;
const clock = new THREE.Clock();

new GLTFLoader().load(
  MODEL_URL,
  (gltf) => {
    const model = gltf.scene;
    container.add(model);

    // Auto-fit ukuran & posisi
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = 2 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

    // Jalankan animasi bawaan model (kalau ada)
    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
    }
  },
  undefined,
  (err) => console.error('Model gagal dimuat:', err)
);

// Interaksi: Space = pause/lanjut rotasi
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); isRotating = !isRotating; }
});

// Render loop
function animate() {
  requestAnimationFrame(animate);
  if (mixer) mixer.update(clock.getDelta());
  if (isRotating) container.rotation.y += 0.005;
  stars.rotation.y += 0.0003;
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Responsive
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});