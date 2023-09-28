import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    50, 
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);

const displayLight = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 3 );
displayLight.position.set( 0.5, 1, 0.25 );
scene.add( displayLight );

export {
    scene,
    camera,
    renderer,
    displayLight
};