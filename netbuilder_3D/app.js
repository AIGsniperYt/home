// 3D Setup
const canvas3d = document.getElementById('view3d');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true });
renderer.setSize(canvas3d.clientWidth, canvas3d.clientHeight);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

let mesh;
function createCube(w, h, d) {
  if (mesh) scene.remove(mesh);
  const geometry = new THREE.BoxGeometry(w, h, d);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff88, wireframe: true });
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}
createCube(5, 5, 5);
camera.position.z = 15;

function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.y += 0.01;
  mesh.rotation.x += 0.005;
  renderer.render(scene, camera);
}
animate();

// Net Generator
function generateCubeNet(w, h, d) {
  const svg = document.getElementById('view2d');
  svg.innerHTML = '';
  svg.setAttribute('viewBox', `0 0 ${w*4} ${h*3}`);
  svg.style.width = '100%';
  svg.style.height = '100%';

  const faces = [
    {x:w, y:0, w:w, h:h}, // top
    {x:0, y:h, w:d, h:h}, // left
    {x:w, y:h, w:w, h:h}, // front
    {x:w*2, y:h, w:d, h:h}, // right
    {x:w*3, y:h, w:w, h:h}, // back
    {x:w, y:h*2, w:w, h:d}, // bottom
  ];

  faces.forEach(f => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    rect.setAttribute('x', f.x);
    rect.setAttribute('y', f.y);
    rect.setAttribute('width', f.w);
    rect.setAttribute('height', f.h);
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', 'black');
    svg.appendChild(rect);
  });
}
generateCubeNet(5, 5, 5);

// Event Listeners
document.getElementById('update3d').addEventListener('click', () => {
  const w = parseFloat(document.getElementById('width').value);
  const h = parseFloat(document.getElementById('height').value);
  const d = parseFloat(document.getElementById('depth').value);
  createCube(w, h, d);
});
document.getElementById('generateNet').addEventListener('click', () => {
  const w = parseFloat(document.getElementById('width').value);
  const h = parseFloat(document.getElementById('height').value);
  const d = parseFloat(document.getElementById('depth').value);
  generateCubeNet(w, h, d);
});
document.getElementById('exportNet').addEventListener('click', () => {
  const svgData = new XMLSerializer().serializeToString(document.getElementById('view2d'));
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'net.svg';
  link.click();
});
