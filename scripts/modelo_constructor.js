import { loadModel } from '/scripts/model_loader';
import { scene,camera } from '/scripts/init';
import * as THREE from 'three';

import models_json_link from '/modelos/metadados.json?url';

class ModelosDisplay {
    constructor() {
        this.posicoesDisplay = [
            new THREE.Vector3(-1,0,-0.7),
            new THREE.Vector3(-0.5,0,-0.7),
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0.5,0,-0.7),
            new THREE.Vector3(1,0,-0.7)
        ];

        this.rotacoesDisplay = [
            new THREE.Vector3(0,Math.PI * 4,0),
            new THREE.Vector3(0,Math.PI * 4,0),
            new THREE.Vector3(0,Math.PI * 2,0),
            new THREE.Vector3(0,Math.PI * 4,0),
            new THREE.Vector3(0,Math.PI * 4,0),
        ];

        this.modelosCarregados = false;
        this.modoDisplay = true;

        this.modelos = {};

        this.modelsInDisplay = []; 

        fetch(models_json_link).then (data => {return   data.json()}).then(json => this.carregarModelos(json));

        // this.carregarModelos(models_data);
    }

    moverModelos(offSetX) {
        if (this.modoDisplay) {
            for (let modelInDisplay of this.modelsInDisplay) {
                modelInDisplay.moveModel(offSetX);
            }
        }
    }

    carregarModelos(models_data) {

        let order_modelos = []
        
        for (let key in models_data) {
            order_modelos.push(key)
            loadModel(key,(gltfScene)=>{this.processarModelo(gltfScene,key,()=>{this.salvarModelos(order_modelos,this.setarModelosNaPosicoesIniciais)})});
        }
    }

    processarModelo(gltfScene,name,callback=null) {
        for (let child of gltfScene.scene.children) {
            if (child.isObject3D) {
                var box = new THREE.Box3().setFromObject( child );
                box.getCenter( child.position ); // this re-sets the mesh position
                child.position.multiplyScalar( - 1 );
                var pivot = new THREE.Group();
                pivot.add( child );

                this.modelos[name] = pivot;
            }
        }

        if (callback != null) {
            callback();
        }
    }

    salvarModelos(order_modelos,callback) {
        if (order_modelos.length != Object.keys(this.modelos).length) return;

        let modelos_correto = [];

        for (let key of order_modelos) {
            modelos_correto.push({"name":key,"model":this.modelos[key]})
        }

        this.modelosCarregados = true;
        this.modelos = modelos_correto;

        callback(this);
    }

    setarModelosNaPosicoesIniciais(self) {
        let modelName = localStorage.getItem("model_name");

        if (modelName == null) {
            modelName = self.modelos[Object.keys(self.modelos)[0]]["name"];
        }

        let indexRef = null;

        for (let model of self.modelos) {
            if (model["name"] == modelName) {
                indexRef = self.modelos.indexOf(model);
            }
        }

        if (indexRef == null) return;

        let indexModelosSemPosicao = [
            self.getIndexLeft(indexRef,2),
            self.getIndexLeft(indexRef,1),
            indexRef,
            self.getIndexRight(indexRef,1),
            self.getIndexRight(indexRef,2)
        ]

        for (let modelIndex of indexModelosSemPosicao) {
            let modelo = self.modelos[modelIndex]["model"];

            let index = indexModelosSemPosicao.indexOf(modelIndex);

            self.modelsInDisplay.push(new ModeloDisplay(index,(index-1<0)?null:index-1,(index+1>=indexModelosSemPosicao.length)?null:index+1,modelo,self.posicoesDisplay,self.rotacoesDisplay,self.modelsInDisplay,modelIndex,self));

            scene.add(modelo);

            modelo.position.copy(self.posicoesDisplay[index]);

            modelo.rotation.y = self.rotacoesDisplay[index].y;
        }

        let modelInDisplay = self.modelsInDisplay[2]["model"];

        camera.position.y = modelInDisplay.position.y;
    }

    getIndexLeft(index,distance=1) {
        if (index - distance < 0) {
            return this.modelos.length - (distance - index);
        } else {
            return (index - distance);
        }
    }

    createModelLeft(modelIndex) {
        let indexModelLeft = this.getIndexLeft(modelIndex);

        let modelo = this.modelos[indexModelLeft]["model"];

        this.modelsInDisplay.unshift(new ModeloDisplay(0,null,1,modelo,this.posicoesDisplay,this.rotacoesDisplay,this.modelsInDisplay,indexModelLeft,this));
    }

    getIndexRight(index,distance=1) {
        if (index + distance >= this.modelos.length) {
            return (index + distance) - this.modelos.length;
        } else {
            return (index + distance);
        }
    }

    createModelRight(modelIndex) {
        let indexModelRight = this.getIndexRight(modelIndex);

        let modelo = this.modelos[indexModelRight]["model"];

        this.modelsInDisplay.push(new ModeloDisplay(this.posicoesDisplay.length-1,this.posicoesDisplay.length-2,null,modelo,this.posicoesDisplay,this.rotacoesDisplay,this.modelsInDisplay,indexModelRight,this));
    }

    limparAnimacoes() {
        for (let model of this.modelsInDisplay) {
            if (model.animationTimeout != null) {
                clearInterval(model.animationTimeout);
                model.animationTimeout = null;
            }
        }
    }

    entrarXR() {
        for (let model of this.modelsInDisplay) {
            model.model.visible = false;
        }
        
        let modeloPrincipal = this.modelsInDisplay[2].model;

        modeloPrincipal.visible = true;

        return modeloPrincipal;
    }

    sairXR() {
        for (let model of this.modelsInDisplay) {
            model.model.visible = true;
        }

        return this.posicoesDisplay[2];
    }

    animarSelecao() {
        for (let model of this.modelsInDisplay.slice(0, 2)) {
            setTimeout(()=>{model.snapAnimationNeg (-0.01,-1,true)}, 10);
        }

        let modelInDisplay = this.modelsInDisplay[2];

        let rotacaoInicial = modelInDisplay.model.rotation.y;
        let rotacaoFinal = rotacaoInicial + (Math.PI * 2);

        let posicaoInicial = modelInDisplay.model.position.z;
        let posicaoFinal = posicaoInicial;

        setTimeout(()=>{animarSelecao(modelInDisplay.model,rotacaoInicial,rotacaoFinal,0.01,0,posicaoInicial,posicaoFinal,0.01,0)}, 10);
        
        for (let model of this.modelsInDisplay.slice((this.modelsInDisplay.length - 2), this.modelsInDisplay.length)) {
            setTimeout(()=>{model.snapAnimationPos (0.01,1,true)}, 10);
        }
    }

    animarDeselecao() {
        for (let model of this.modelsInDisplay.slice(0, 2)) {
            setTimeout(()=>{model.snapAnimationPos(0.01,0,true)}, 10);
        }

        let modelInDisplay = this.modelsInDisplay[2];

        let rotacaoInicial = modelInDisplay.model.rotation.y;
        let rotacaoFinal = this.rotacoesDisplay[2].y;

        let posicaoInicial = modelInDisplay.model.position.z;
        let posicaoFinal = this.posicoesDisplay[2].z;

        setTimeout(()=>{animarDeselecao(modelInDisplay.model,rotacaoInicial,rotacaoFinal,0.01,1,posicaoInicial,posicaoFinal,0.01,1)}, 10);
        
        for (let model of this.modelsInDisplay.slice((this.modelsInDisplay.length - 2), this.modelsInDisplay.length)) {
            setTimeout(()=>{model.snapAnimationNeg(-0.01,0,true)}, 10);
        }
    }
}

function animarSelecao(modelo,rotacaoInicial,rotacaoFinal,offsetRotacao,lerpRotacao,posicaoInicial,posicaoFinal,offsetPosicao,lerpPosicao) {
    if (lerpRotacao < 1) {
        lerpRotacao += offsetRotacao;

        modelo.rotation.y = lerp(rotacaoInicial,rotacaoFinal,lerpRotacao)
    } else {
        modelo.rotation.y = rotacaoFinal;
    }
    
    if (lerpPosicao < 1) {
        lerpPosicao += offsetPosicao;

        modelo.position.z = lerp(posicaoInicial,posicaoFinal,lerpPosicao)
    } else {
        modelo.position.z = rotacaoFinal;
    }

    if (lerpRotacao < 1 || lerpPosicao < 1) {
        setTimeout(()=>{animarSelecao(modelo,rotacaoInicial,rotacaoFinal,offsetRotacao,lerpRotacao,posicaoInicial,posicaoFinal,offsetPosicao,lerpPosicao)}, 10);
    }
}

function animarDeselecao(modelo,rotacaoInicial,rotacaoFinal,offsetRotacao,lerpRotacao,posicaoInicial,posicaoFinal,offsetPosicao,lerpPosicao) {
    if (lerpRotacao > 0) {
        lerpRotacao -= offsetRotacao;

        modelo.rotation.y = lerp(rotacaoInicial,rotacaoFinal,lerpRotacao)
    } else {
        modelo.rotation.y = rotacaoFinal;
    }
    
    if (lerpPosicao > 0) {
        lerpPosicao -= offsetPosicao;

        modelo.position.z = lerp(posicaoInicial,posicaoFinal,lerpPosicao)
    } else {
        modelo.position.z = rotacaoFinal;
    }

    if (lerpRotacao > 0 || lerpPosicao > 0) {
        setTimeout(()=>{animarDeselecao(modelo,rotacaoInicial,rotacaoFinal,offsetRotacao,lerpRotacao,posicaoInicial,posicaoFinal,offsetPosicao,lerpPosicao)}, 10);
    }
}

function lerp(v0, v1, t) {
    return (1-(t))*v0 + (t)*v1;
}


class ModeloDisplay {
    constructor(index,indexLeft,indexRight,model,posicoesDisplay,rotacoesDisplay,modelsInDisplay,modelIndex,modelosDisplayRef) {
        this.index = index;
        this.indexLeft = indexLeft;
        this.indexRight = indexRight;
        this.model = model;
        this.modelIndex = modelIndex;

        this.lerp = 0;

        this.posicoesDisplay = posicoesDisplay;
        this.rotacoesDisplay = rotacoesDisplay;
        this.modelsInDisplay = modelsInDisplay;

        this.modelosDisplayRef = modelosDisplayRef;

        this.animationTimeout = null;
    }

    moveModel(offSetX,travado=false) {
        this.lerp += offSetX;

        if (this.lerp >= 0) {
            let posicaoRight = null;
            let rotacaoRight = null;

            if (this.indexRight == null) {
                posicaoRight = new THREE.Vector3(0.5,0,0).add(this.posicoesDisplay[this.posicoesDisplay.length-1]);
                rotacaoRight = this.rotacoesDisplay[this.rotacoesDisplay.length-1];
            } else {
                posicaoRight = this.posicoesDisplay[this.indexRight];
                rotacaoRight = this.rotacoesDisplay[this.indexRight];
            }

            let posicaoAtual = new THREE.Vector3().lerpVectors(this.posicoesDisplay[this.index],posicaoRight,this.lerp);

            this.model.position.copy(posicaoAtual);
            this.model.rotation.y = lerp(this.rotacoesDisplay[this.index].y, rotacaoRight.y,this.lerp);

            if (this.lerp >= 1 && !travado) {
                this.moveIndexRight();
                this.lerp = 0;
                this.moveModel(0);
            }

        } else if (this.lerp < 0) {
            let posicaoLeft = null;
            let rotacaoLeft = null;

            if (this.indexLeft == null) {
                posicaoLeft = new THREE.Vector3(-0.5,0,0).add(this.posicoesDisplay[0]);
                rotacaoLeft = this.rotacoesDisplay[0];
            } else {
                posicaoLeft = this.posicoesDisplay[this.indexLeft];
                rotacaoLeft = this.rotacoesDisplay[this.indexLeft];
            }

            let posicaoAtual = new THREE.Vector3().lerpVectors(this.posicoesDisplay[this.index],posicaoLeft,Math.abs(this.lerp));
            this.model.rotation.y = lerp(this.rotacoesDisplay[this.index].y, rotacaoLeft.y,this.lerp);

            this.model.position.copy(posicaoAtual);

            if (Math.abs(this.lerp) >= 1 && !travado) {
                this.moveIndexLeft();
                this.lerp = 0;
                this.moveModel(0);
            }
        }
    }

    moveIndexLeft() {
        if (this.indexLeft == null) {
            let index = this.modelsInDisplay.indexOf(this);
            if (index > -1) {
                scene.remove(this.modelsInDisplay.splice(index, 1)[0]);
            }

            this.modelosDisplayRef.createModelRight(this.modelsInDisplay[this.modelsInDisplay.length-1].modelIndex);

            return;
        }
        
        if (this.indexLeft - 1 < 0) {
            this.indexLeft = null;
        } else {
            this.indexLeft--;
        }

        this.index--;
        if (this.indexRight == null) {
            this.indexRight = this.modelsInDisplay.length-1;
        } else {
            this.indexRight--;
        }
    }

    moveIndexRight() {
        if (this.indexRight == null) {
            let index = this.modelsInDisplay.indexOf(this);
            if (index > -1) {
                scene.remove(this.modelsInDisplay.splice(index, 1)[0]);
            }

            this.modelosDisplayRef.createModelLeft(this.modelsInDisplay[0].modelIndex);

            return;
        } 
        
        if (this.indexRight + 1 == this.modelsInDisplay.length) {
            this.indexRight = null;
        } else {
            this.indexRight++;
        }

        this.index++;
        if (this.indexLeft == null) {
            this.indexLeft = 0;
        } else {
            this.indexLeft++;
        }
    }

    snapAnimationPos (offset,target,travado=false) {
        if (this.lerp + offset < target) {
            if (this.animationTimeout != null) {
                clearTimeout(this.animationTimeout);
                this.animationTimeout = null;
            }

            this.animationTimeout = setTimeout(()=>{this.snapAnimationPos(offset,target,travado)}, 10);
        } else {
            this.lerp = target;
            offset = 0;
        }
        this.moveModel(offset,travado);
    }

    snapAnimationNeg (offset,target,travado=false) {
        if (this.lerp + offset > target) {
            if (this.animationTimeout != null) {
                clearTimeout(this.animationTimeout);
                this.animationTimeout = null;
            }

            this.animationTimeout = setTimeout(()=>{this.snapAnimationNeg(offset,target,travado)}, 10);
        } else {
            this.lerp = target;
            offset = 0;
        }
        this.moveModel(offset,travado);
    }

    snapToPlace() {
        if (this.animationTimeout != null) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = null;
        }

        if (this.lerp < 0.5 && this.lerp > 0) {
            this.animationTimeout = setTimeout(()=>{this.snapAnimationNeg (-0.01,0,false)}, 10);
        } else if (this.lerp >= 0.5){
            this.animationTimeout = setTimeout(()=>{this.snapAnimationPos (0.01,1,false)}, 10);
        } else if (this.lerp > -0.5 && this.lerp < 0) {
            this.animationTimeout = setTimeout(()=>{this.snapAnimationPos (0.01,0,false)}, 10);
        } else {
            this.animationTimeout = setTimeout(()=>{this.snapAnimationNeg (-0.01,-1,false)}, 10);
        }
     }
}

export {
    ModelosDisplay
}