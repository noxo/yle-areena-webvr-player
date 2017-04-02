import * as THREE from 'three';
import Sky from './shaders/skyshader.js';

/**
 * @author Erkki Nokso-Koivisto / http://www.vihrearobotti.com/
 */

export default class PlayerScene {

    constructor() {

        this.LIGHTS_DEFAULT_LUMINANCE = 1.00;
        this.LIGHTS_MAX_LUMINANCE = 1.19;

        this.scene = new THREE.Scene();

        const skyParams = {
            turbidity: 10,
            rayleigh: 0.120,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.0,
            luminance: this.LIGHTS_DEFAULT_LUMINANCE,
            inclination: 0.49, // elevation / inclination
            azimuth: 0.25, // Facing front,
            sun: ! true
        };

        this.sky = new THREE.Sky();
        let uniforms = this.sky.uniforms;
        uniforms.turbidity.value = skyParams.turbidity;
        uniforms.rayleigh.value = skyParams.rayleigh;
        uniforms.luminance.value = skyParams.luminance;
        uniforms.mieCoefficient.value = skyParams.mieCoefficient;
        uniforms.mieDirectionalG.value = skyParams.mieDirectionalG;
        uniforms.sunPosition.value = new THREE.Vector3(0, 12000, -400000);
        this.scene.add(this.sky.mesh);

        this.image = document.createElement('canvas');
        this.image.width = 480;
        this.image.height = 204;

        this.imageContext = this.image.getContext('2d');
        this.imageContext.fillStyle = '#000000';
        this.imageContext.fillRect(0, 0, 480, 204);

        this.texture = new THREE.Texture(this.image);
        const material = new THREE.MeshBasicMaterial({ map: this.texture, overdraw: 0.5 });

        // TODO: should scale the plane mesh agains aspect ratio of movie

        const geometry = new THREE.PlaneGeometry(480, 204, 4, 4);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.z = -650;
        this.mesh.scale.y = this.mesh.scale.z = 1.5;
        this.scene.add(this.mesh);

    }

    getScene()
    {
        return this.scene;
    }

    start(url) {
        
        // clear texture
        this.imageContext.fillStyle = '#000000';
        this.imageContext.fillRect(0,0,480,240);
        this.texture.needsUpdate = true;

        // restore default lightning
        let uniforms = this.sky.uniforms;
        uniforms.luminance.value = this.LIGHTS_DEFAULT_LUMINANCE;
       
        // create HTML video element
        this.video = document.createElement('video');
        this.video.autoplay = true;
        this.video.loop = true;
        document.body.appendChild(this.video);
        // and set the movie source on it
        const source = document.createElement('source');
        source.src = url;
        this.video.appendChild(source);

        // roll in movie screen
        this.mesh.scale.x = 0.1;
        this.movieRevealInInterval = setInterval(() => {
            this.mesh.scale.x += 0.05;
            if (this.mesh.scale.x >= 1.5) {
                clearInterval(this.movieRevealInInterval);
            }
        }, 30);

        // after 5s dim all lights
        setTimeout(() => {
            this.turnOffLightsFully();
        }, 5000);
    }

    stop() {
        document.body.removeChild(this.video);
    }

    turnOffLightsFully() {
        this.lightsOffInterval = setInterval(() => {
            let uniforms = this.sky.uniforms;
            uniforms.luminance.value = uniforms.luminance.value + 0.005;
            if (uniforms.luminance.value >= this.LIGHTS_MAX_LUMINANCE) {
                clearInterval(this.lightsOffInterval);
            }

        }, 30);
    }

    render(renderer, camera) {
        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            this.imageContext.drawImage(this.video, 0, 0);
            if (this.texture) {
                this.texture.needsUpdate = true;
            }
        }
        renderer.render(this.scene, camera);
    }

}