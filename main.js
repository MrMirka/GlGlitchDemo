import './style.css'

import * as THREE from 'three';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

import modelPath from './src/models/model.gltf?url';
import fragmentShader from './src/shaders/fragmant.frag'
import vertexShader from './src/shaders/vertex.vert'
import { createTextTexture } from './utils';


const BlackWhiteShader = {
    uniforms: {
        "tDiffuse": { value: null },
        "uTime": { value: 0.0 },
        "uMouse": { value: new THREE.Vector2(-1, -1) },
        "uAspectRatio": { value: null },
        
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
};


const gltfLoader = new GLTFLoader()

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 2.6
scene.add(camera)

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio( window.devicePixelRatio )
renderer.physicallyCorrectLights = true
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.logarithmicDepthBuffer = true
renderer.autoClear = true
document.body.appendChild( renderer.domElement );

const aspectRatio = renderer.domElement.width / renderer.domElement.height;


//light
const pointLight = new THREE.PointLight( 0xffffff, 161, 100 )
 pointLight.position.set( 1, 1, 1 )
 pointLight.castShadow = true
 pointLight.shadow.normalBias = 0.05
 scene.add( pointLight )


gltfLoader.load(modelPath, gltf => {
    scene.add(gltf.scene)
})

// Инициализация EffectComposer
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// Добавление кастомного шейдера как ShaderPass
const blackWhitePass = new ShaderPass(BlackWhiteShader);
composer.addPass(blackWhitePass);

blackWhitePass.uniforms.uAspectRatio.value = window.innerWidth / window.innerHeight;




//renderer.render(scene, camera)
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    blackWhitePass.uniforms.uMouse.value.set(x, y);
});

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    blackWhitePass.uniforms.uAspectRatio.value = window.innerWidth / window.innerHeight;
});


const textTexture = createTextTexture('Привет BETBOOM', 512, 68)
const textureWidth = textTexture.image.width;
const textureHeight = textTexture.image.height;
const material = new THREE.MeshBasicMaterial({ 
    map: textTexture,
    transparent: true, // Важно для прозрачности
    alphaTest: 0.5 // Убираем полностью прозрачные части, чтобы избежать проблем с сортировкой
});
const geo = new THREE.PlaneGeometry(textureWidth * 0.005,textureHeight * 0.005)
const mesh = new THREE.Mesh(geo, material)
mesh.position.x = -1.8
mesh.position.y = 1
scene.add(mesh)


animate()
function animate(){
    //renderer.render(scene, camera)
    requestAnimationFrame(animate)
    blackWhitePass.uniforms.uTime.value = performance.now() / 1000;
    composer.render();
} 

