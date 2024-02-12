import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

import modelPath from './src/models/model.gltf?url';
import fragmentShader from './src/shaders/fragmant.frag'
import vertexShader from './src/shaders/vertex.vert'
import { addTextBlock, createTextTextureFromHtml, getObjectDimention, getScreenDimention } from './utils';

document.addEventListener('DOMContentLoaded', function () {

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


    let monkey = null

    const gltfLoader = new GLTFLoader()
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2.6
    scene.add(camera)

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.physicallyCorrectLights = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.logarithmicDepthBuffer = true
    renderer.autoClear = true
    document.body.appendChild(renderer.domElement);




    //light
    const pointLight = new THREE.PointLight(0xffffff, 161, 100)
    pointLight.position.set(1, 1, 1)
    pointLight.castShadow = true
    pointLight.shadow.normalBias = 0.05
    scene.add(pointLight)

    //Model
    gltfLoader.load(modelPath, gltf => {
        monkey = gltf.scene
        monkey.position.x = 1
        scene.add(monkey)
    })

    // Инициализация EffectComposer
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // Добавление кастомного шейдера как ShaderPass
    const blackWhitePass = new ShaderPass(BlackWhiteShader);
    composer.addPass(blackWhitePass);

    blackWhitePass.uniforms.uAspectRatio.value = window.innerWidth / window.innerHeight;


    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        blackWhitePass.uniforms.uMouse.value.set(x, y);
    });

    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        blackWhitePass.uniforms.uAspectRatio.value = window.innerWidth / window.innerHeight;
    });

    
    const scrollGroup = new THREE.Group()
    const tBlock1 = addTextBlock(0,0,'hello', camera)
    const tBlock2 = addTextBlock(0,0.5,'testText', camera)
    scrollGroup.add(tBlock1)
    scrollGroup.add(tBlock2)
    scene.add(scrollGroup)


    const scrollSpeed = 0.1;
    document.addEventListener('wheel', function (event) {
        const deltaY = event.deltaY * 0.01;
        scrollGroup.position.y += deltaY * scrollSpeed;
        if(monkey) {
            monkey.rotation.y +=deltaY * scrollSpeed * 0.1;
        }
    });


    animate()
    function animate() {
        requestAnimationFrame(animate)
        blackWhitePass.uniforms.uTime.value = performance.now() / 1000;
        composer.render();
    }
})


