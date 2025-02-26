import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Tạo scene và camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const canvas = document.querySelector('canvas');
if (!canvas) {
  throw new Error('Canvas not found');
}

// Đảm bảo canvas có kích thước đúng với toàn bộ màn hình
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight); // Cập nhật kích thước canvas
camera.position.z = 500; // Đặt camera ở khoảng cách hợp lý để có thể nhìn thấy mô hình và hình cầu

// Tạo hình cầu trong suốt làm background
const sphereGeometry = new THREE.SphereGeometry(100, 128, 128); // Tạo một hình cầu lớn
const sphereMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000, // Màu đen cho sphere
  opacity: 1, // Trong suốt
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// Thêm ánh sáng môi trường và ánh sáng điểm
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1, 1000);
pointLight.position.set(100, 100, 100);
scene.add(pointLight);
// Ánh sáng chiếu sáng (Directional Light)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize(); // Chỉnh vị trí ánh sáng
scene.add(directionalLight);

// Tạo một loader cho mô hình GLB
const loader = new GLTFLoader();
const modelURL = '../../../public/thienlyglb.glb';

// Load model GLB
loader.load(
  modelURL,
  (gltf) => {
    const model = gltf.scene;
    model.traverse((child: any) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xffffff, // Thêm màu sắc mặc định cho vật liệu
          metalness: 0.5,
          roughness: 0.5,
        });
      }
    });
    model.position.set(0, 0, 0); // Đặt mô hình vào vị trí mong muốn
    sphere.add(model); // Thêm mô hình vào trong sphere
  },
  undefined, // Hàm này được gọi trong quá trình tải mô hình
  (error) => {
    console.error('Error loading model:', error);
  }
);

// Hàm animate để cập nhật vị trí camera và xoay mô hình
function animate(): void {
  requestAnimationFrame(animate);

  // Xoay hình cầu và mô hình
  sphere.rotation.y += 0.005; // Xoay sphere quanh trục Y
  scene.traverse((object: any) => {
    if (object.isMesh) {
      object.rotation.y += 0.01; // Xoay mô hình 3D quanh trục Y
    }
  });

  // Render the scene
  renderer.render(scene, camera);
}

animate();
