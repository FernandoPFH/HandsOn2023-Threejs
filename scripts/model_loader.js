import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import models_json_link from "/modelos/metadados.json?url";

let models_data = null;

fetch(models_json_link).then (data => {return   data.json()}).then(json => models_data = json);

const gltfLoader = new GLTFLoader();

function loadModel(modelName, callback) {
    if (!models_data.hasOwnProperty(modelName)) return;

    let model_data = models_data[modelName];

    gltfLoader.load(model_data["path"], (gltfScene) => {
        for (let child of gltfScene.scene.children) {
            if (child.isObject3D) {
                if (model_data.hasOwnProperty("scale")) {
                    let sceneScale = model_data["scale"];
                    child.scale.set(sceneScale[0],sceneScale[1],sceneScale[2]);
                }
        
                if (model_data.hasOwnProperty("rotation")) {
                    let sceneRotation = model_data["rotation"];
                    child.rotation.x = sceneRotation[0];
                    child.rotation.y = sceneRotation[1];
                    child.rotation.z = sceneRotation[2];
                }
        
                if (model_data.hasOwnProperty("position")) {
                    let scenePosition = model_data["position"];
                    child.position.x = scenePosition[0];
                    child.position.y = scenePosition[1];
                    child.position.z = scenePosition[2];
                }
            }
        }
        
        callback(gltfScene);
    });
};

export { loadModel };