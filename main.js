import './css/main.css'
import './css/module.css'

document.querySelector('body').innerHTML = `
<div class="main">
    <button id="voltar">
        Voltar
    </button>
    <h1>HandsOn</h1>
    <h2>Engenharia De Computação</h2>
    <div id="subTextDiv" style="padding: 5%;">
        <p id="subText">Projeto do Metaverso Mauá junto com a coordenação da Engenharia da Computação. Mostra uma utilidade possivel de um projeto AR/VR.</p>
    </div>
    <div id="canvas">
    </div>
    <div style="width: 100%;display: flex;justify-content: center;bottom: 0px;padding: 30px 0px 30px 0px;">
        <button id="escolher">
            Escolher
        </button>
    </div>
    <div id="buttonsXR" >
    </div>
</div>
`

import { scene,camera,renderer } from './scripts/init';

let canvasDiv = document.querySelector("#canvas");

let display = renderer.domElement;
display.style = "";
display.style.aspectRatio = window.innerWidth.toString() + " / " + canvasDiv.clientHeight.toString();
display.height = canvasDiv.clientHeight;
display.width = window.innerWidth;

document.querySelector("#canvas").style.aspectRatio = window.innerWidth.toString() + " / " + canvasDiv.clientHeight.toString();

document.querySelector("#canvas").appendChild(display);

renderer.setSize(window.innerWidth, canvasDiv.clientHeight, false);
camera.aspect = window.innerWidth / canvasDiv.clientHeight;

camera.position.z = .73;

camera.updateProjectionMatrix();

import { ModelosDisplay } from './scripts/modelo_constructor'

const modelosDisplay = new ModelosDisplay();

document.querySelector("#escolher").onclick = () => {
    modelosDisplay.modoDisplay = false;

    document.querySelector("#buttonsXR").classList.add("transicao");

    let button = document.querySelector("#escolher");
    button.disabled = true;
    button.classList.add("transicao");

    document.querySelector("#voltar").classList.add("transicao");

    document.querySelector("#subTextDiv").classList.add("transicao");
    document.querySelector("#subText").classList.add("transicao");

    modelosDisplay.animarSelecao()
};

document.querySelector("#voltar").onclick = () => {
    modelosDisplay.modoDisplay = true;

    document.querySelector("#buttonsXR").classList.remove("transicao");

    let button = document.querySelector("#escolher");
    button.disabled = false;
    button.classList.remove("transicao");

    document.querySelector("#voltar").classList.remove("transicao");

    document.querySelector("#subTextDiv").classList.remove("transicao");
    document.querySelector("#subText").classList.remove("transicao");

    modelosDisplay.animarDeselecao()
};

let sessionXR = null;
let funcConfig = null;
let firstConfig = true;

function animate() {
    // resizeCanvasToDisplaySize();

    requestAnimationFrame( animate );
    renderer.setAnimationLoop(() => {
        if (sessionXR == null) {
            sessionXR = renderer.xr.getSession();
        }
    
        if (sessionXR != null && funcConfig != null && firstConfig) {
            firstConfig = false;
    
            sessionXR.addEventListener("end", funcConfig);
        }

        renderer.render( scene, camera );
    })
}

animate();

let oldPosition_x = null;

var mousedownID = false;

function mousedown(event) {
    if(!mousedownID && modelosDisplay.modoDisplay)  {
        oldPosition_x = event.screenX;
        mousedownID = true;
    }
}

function mouseup(event) {
    if(mousedownID) {  //Only stop if exists
        clearInterval(mousedownID);
        mousedownID=false;
    }

}

function whilemousedown(event) {
    if (mousedownID) {
        let offSetX = event.screenX - oldPosition_x;

        modelosDisplay.moverModelos(offSetX/((renderer.domElement.width/2)));

        oldPosition_x = event.screenX;
    }
}

var touchdownID = false;

function touchdown(event) {
    if(!touchdownID && modelosDisplay.modoDisplay)  {
        oldPosition_x = event.targetTouches[0].screenX;
        touchdownID = true;

        modelosDisplay.limparAnimacoes();
    }
}

function touchup(event) {
    if(touchdownID) {
        touchdownID=false;
        for (let modelInDisplay of modelosDisplay.modelsInDisplay) {
            modelInDisplay.snapToPlace();
        }
    }

}

function whiletouchdown(event) {
    if (touchdownID) {
        let offSetX = event.targetTouches[0].screenX - oldPosition_x;

        modelosDisplay.moverModelos(offSetX/(renderer.domElement.width/2));

        oldPosition_x = event.targetTouches[0].screenX;
    }
}

renderer.domElement.addEventListener("mousedown", mousedown);
renderer.domElement.addEventListener("mousemove", whilemousedown);
renderer.domElement.addEventListener("mouseup", mouseup);
renderer.domElement.addEventListener("mouseout", mouseup);


renderer.domElement.addEventListener("touchstart", touchdown);
renderer.domElement.addEventListener("touchmove", whiletouchdown);
renderer.domElement.addEventListener("touchend", touchup);
renderer.domElement.addEventListener("touchcancel", touchup);
renderer.domElement.addEventListener("touchleave", touchup);

import { ARButton } from 'three/addons/webxr/ARButton.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

renderer.xr.enabled = true;

let sessonInit = { requiredFeatures: [ 'hit-test' ] };

let arButton = ARButton.createButton( renderer, sessonInit );
// let function_ar = arButton.onclick;

import * as THREE from 'three';

function arEnd() {
    sessionXR.removeEventListener("end", arEnd);

    location.reload();
}

arButton.addEventListener("click", () => {
    funcConfig = arEnd;

    let modeloXR = modelosDisplay.entrarXR();

    modeloXR.scale.x *= 0.3;
    modeloXR.scale.y *= 0.3;
    modeloXR.scale.z *= 0.3;

    modeloXR.position.z = -.4;

    let controller = renderer.xr.getController( 0 );

    function onSelect() {
        let posicaoInicial = camera.position;

        let vector = new THREE.Vector3();

        controller.getWorldDirection(vector);

        let posicaoFinal = posicaoInicial.add(vector.multiplyScalar(-.5));

        modeloXR.position.set(posicaoFinal.x,posicaoFinal.y,posicaoFinal.z);

        modeloXR.lookAt(controller.position.x,controller.position.y,controller.position.z)
    }

    controller.addEventListener( 'select', onSelect );
    scene.add( controller );
}, false);

arButton.innerText = (arButton.innerText == "AR NOT SUPPORTED")?"AR Não Suportado":"Iniciar AR";
arButton.style = "";

document.querySelector("#buttonsXR").appendChild( arButton );

let vrButton = VRButton.createButton( renderer, sessonInit );

function vrEnd() {
    sessionXR.removeEventListener("end", vrEnd);

    location.reload();
}

import { sceneCreator } from './scripts/vr_scene_creator';

vrButton.addEventListener("click", () => {
    funcConfig = vrEnd;

    let modeloXR = modelosDisplay.entrarXR();

    modeloXR.scale.x *= 0.3;
    modeloXR.scale.y *= 0.3;
    modeloXR.scale.z *= 0.3;

    modeloXR.position.z = -.4;

    sceneCreator(scene,renderer);

    let controller = renderer.xr.getController( 0 );

    function onSelect() {
        let posicaoInicial = camera.position;

        let vector = new THREE.Vector3();

        controller.getWorldDirection(vector);

        let posicaoFinal = posicaoInicial.add(vector.multiplyScalar(-.25));

        modeloXR.position.set(posicaoFinal.x,posicaoFinal.y,posicaoFinal.z);

        modeloXR.lookAt(controller.position.x,controller.position.y,controller.position.z)
    }

    controller.addEventListener( 'select', onSelect );
    scene.add( controller );
}, false);

vrButton.innerText = (vrButton.innerText == "AR NOT SUPPORTED")?"AR Não Suportado":"Iniciar AR";
vrButton.style = "";

document.querySelector("#buttonsXR").appendChild( vrButton );