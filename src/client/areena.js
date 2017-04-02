import MenuScene from './menu_scene.js';
import PlayerScene from './player_scene.js';
import * as THREE from 'three';
import URL from 'url-parse';
import VREffect from './vr/vreffect.js'
import VRControls from './vr/vrcontrols.js'
import FirstPersonControls from './fps/fps.js';
import WEBVR from './vr/webvr.js';

/**
 * @author Erkki Nokso-Koivisto / http://www.vihrearobotti.com/
 */

export default class Areena {

    constructor() {

        this.MOUSE_LOOK = false;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000000);

        this.crosshair = new THREE.Mesh(
            new THREE.RingGeometry(0.02, 0.04, 32),
            new THREE.MeshBasicMaterial({
                color: 0x606060,
                opacity: 0.6,
                transparent: true
            })
        );
        this.crosshair.position.z = -4;
        this.camera.add(this.crosshair);

        this.clock = new THREE.Clock();

        if (this.MOUSE_LOOK) {
            this.fps = new FirstPersonControls(this.camera);  
            this.fps.lookSpeed = 0.1;
            this.fps.movementSpeed = 20;
            this.fps.lookVertical = true;
            this.fps.constrainVertical = true;
            this.fps.verticalMin = 1.0;
            this.fps.verticalMax = 2.0;
        }
        
        this.vrEffect = new THREE.VREffect(this.renderer, (error) => {
            console.log(error);
        });
        this.vrControls = new THREE.VRControls(this.camera);

        if (WEBVR.isAvailable() === false) {
            document.body.appendChild(WEBVR.getMessage());
        }
        else {
            document.body.appendChild(WEBVR.getButton(this.vrEffect));
        }

        document.body.appendChild(this.renderer.domElement);

        this.menuScene = new MenuScene();
        this.playerScene = new PlayerScene();

        document.addEventListener('mousedown', (e) => this.handleMouseDown(e), false);
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.vrEffect.setSize(window.innerWidth, window.innerHeight);
        }, false);

        this.changeScene(this.menuScene);
        this.animate();

    }

    handleMouseDown(e) {
        var inPlayerScene = this.currentScene == this.playerScene;

        if (!inPlayerScene) {
            this.crosshair.visible = false;
            this.menuScene.getSelectedProgramPlayStream((error, streams) => {
                if (!error) {
                    this.menuScene.switchLights(false, () => {
                        this.changeScene(this.playerScene);
                        const playUrl = streams[0].url;
                        let proxiedThruLocalHostPlayUrl = new URL(playUrl);
                        proxiedThruLocalHostPlayUrl.set('hostname', "localhost");
                        proxiedThruLocalHostPlayUrl.set('port', "8080");
                        this.playerScene.start(proxiedThruLocalHostPlayUrl.toString());

                    });
                }
            });
        }
        else {
            this.crosshair.visible = true;
            this.playerScene.stop();
            this.changeScene(this.menuScene);
            this.menuScene.switchLights(true, () => { });
        }

    }

    changeScene(scene) {
        if (this.currentScene) {
            this.currentScene.getScene().remove(this.camera);
        }
        this.currentScene = scene;
        this.currentScene.getScene().add(this.camera);
    }

    animate() {
        this.vrEffect.requestAnimationFrame(() => this.animate());
        this.render();
    }

    render() {
        const delta = this.clock.getDelta();
        if (this.MOUSE_LOOK) {
            this.fps.update(delta);
        }
        this.vrControls.update();
        this.currentScene.render(this.vrEffect, this.camera);
    }
}