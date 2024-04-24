// import * as THREE from "three";
// import {GLTFLoader} from "three/addons";
//
// const scene = new THREE.Scene();
// let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// //set the background color of the scene
// renderer.setClearColor(0x000000);
//
// document.body.appendChild(renderer.domElement);
//
// const loader = new GLTFLoader();
// let mixer;
// loader.load('/static/scene/untitled.glb', function (gltf) {
//     mixer = new THREE.AnimationMixer(gltf.scene);
//
//     console.log(gltf.scene.children);
//
//     //fix mat error, set depthWrite to true
//     gltf.scene.children[2].children[0].children[0].material.depthWrite = true;
//
//     gltf.scene.children[0] = new THREE.AmbientLight(0xffffff, 3);
//
//     gltf.scene.background = new THREE.Color(0,0,0);
//
//     scene.add(gltf.scene);
//     camera = gltf.cameras[0];
//     const action = mixer.clipAction(gltf.animations[0]);
//     action.play();
// }, undefined, function (error) {
//     console.error(error);
// });
//
// const clock = new THREE.Clock();
//
// function animate() {
//     if (mixer) mixer.update(clock.getDelta());
//     if (camera) {
//         renderer.render(scene, camera);
//     }
// }
//
// window.onresize = function () {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// }
//
// renderer.setAnimationLoop(animate);

import { createRoot } from 'react-dom/client';
import {Viewer} from "./Viewer";
import {ViewerController} from "./SceneLoader";

// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

// Render your React component instead
const root = createRoot(document.getElementById('app'));
const controller = new ViewerController();
root.render(<Viewer controller={controller}/>);