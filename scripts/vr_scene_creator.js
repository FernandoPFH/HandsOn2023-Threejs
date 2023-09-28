import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

function createBox() {
    let geometry = new THREE.BoxGeometry( 8, 0.1, 8 ); 
    let material = new THREE.MeshLambertMaterial( {color: 0x666666} ); 
    return new THREE.Mesh( geometry, material ); 
}

function sceneCreator(scene,renderer) {
    // var geometry = new THREE.CubeGeometry( 250, 250, 250 );
    // var cubeMaterials = [
    //     new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( "./skybox/nightsky_ft.png?url" ), side: THREE.DoubleSide }), //front side
    //     new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( '/skybox/nightsky_bk.png?url' ), side: THREE.DoubleSide }), //back side
    //     new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( '/skybox/nightsky_up.png?url' ), side: THREE.DoubleSide }), //up side
    //     new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( '/skybox/nightsky_dn.png?url' ), side: THREE.DoubleSide }), //down side
    //     new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( '/skybox/nightsky_rt.png?url' ), side: THREE.DoubleSide }), //right side
    //     new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( '/skybox/nightsky_lf.png?url' ), side: THREE.DoubleSide }) //left side
    // ];

    // var cubeMaterial = new THREE.MeshFaceMaterial( cubeMaterials );
    // var cube = new THREE.Mesh( geometry, cubeMaterial );
    // scene.add( cube );

    let sky = new Sky();
    sky.scale.setScalar( 450000 );
    scene.add( sky );

    const effectController = {
        turbidity: 10,
        rayleigh: 3,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.7,
        elevation: 2,
        azimuth: 180,
        exposure: renderer.toneMappingExposure
    };

    let sun = new THREE.Vector3();
    
    const uniforms = sky.material.uniforms;
    uniforms[ 'turbidity' ].value = effectController.turbidity;
    uniforms[ 'rayleigh' ].value = effectController.rayleigh;
    uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
    uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
    const theta = THREE.MathUtils.degToRad( effectController.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );

    uniforms[ 'sunPosition' ].value.copy( sun );

    renderer.toneMappingExposure = effectController.exposure;

    let floor = createBox();

    floor.position.z = -2;
    // floor.scale.x = 20;
    // floor.scale.y = 20;
    // floor.scale.z = 0.3;

    scene.add(floor);
}

export {
    sceneCreator
};