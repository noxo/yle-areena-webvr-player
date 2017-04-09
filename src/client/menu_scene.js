import * as THREE from 'three';
import YleClient from './yle-api/client.js'
import Sky from './shaders/skyshader.js';
import YleConfig from './yle_config.js'

/**
 * @author Erkki Nokso-Koivisto / http://www.vihrearobotti.com/
 */

export default class MenuScene {

    constructor() {

        this.LIGHTS_MAX_BRIGHTNESS = 0.675;

        this.HEADER_WIDTH = 320;
        this.HEADER_HEIGHT = 50;

        this.MENU_Z = -1200;
        this.MENU_ITEM_WIDTH = 320;
        this.MENU_ITEM_HEIGHT = 240;
        this.MENU_ITEM_PADDING = 20;
        this.MENU_ITEMS_PER_ROW = 5;
        this.MENU_ITEM_ROWS = 4;

        const yleConfig = new YleConfig();
        this.yleClient = new YleClient(yleConfig);

        this.scene = new THREE.Scene();
        this.raycaster = new THREE.Raycaster();

        const skyParams = {
            turbidity: 10,
            rayleigh: 0.120,
            mieCoefficient: 0.005,
            mieDirectionalG: this.LIGHTS_MAX_BRIGHTNESS,
            luminance: 1,
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

        this.menuMeshGroup = new THREE.Group();
        this.menuMeshGroup.position.z = this.MENU_Z;
        const selectorMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD800 });
        const selectorPlane = new THREE.PlaneGeometry(this.MENU_ITEM_WIDTH + 2 * this.MENU_ITEM_PADDING, this.MENU_ITEM_HEIGHT + 2 * this.MENU_ITEM_PADDING, 4, 4);
        this.selectorMesh = new THREE.Mesh(selectorPlane, selectorMaterial);
        this.selectorMesh.visible = false;

        this.addHeader();
        this.scene.add(this.menuMeshGroup);

        this.loadPrograms(0, () => {
            console.log("programs loaded");
        });
    }

    getScene() {
        return this.scene;
    }

    loadPrograms(category, callback) {
        this.removeMenuItems(this.menuMeshGroup);
        this.menuMeshGroup.add(this.selectorMesh);

        this.yleClient.getPrograms({ availability: "ondemand", mediaobject: "video" }, (err, programs) => {
            for (let r = 0; r < this.MENU_ITEM_ROWS; r++) {
                for (let c = 0; c < this.MENU_ITEMS_PER_ROW; c++) {
                    let index = [(this.MENU_ITEMS_PER_ROW * r) + c];
                    let program = programs[index];
                    if (program !== undefined) {
                        this.addNewMenuItem(program, r, c);
                    }
                }
            }
            callback();
        });
    }

    addHeader() {

        const TITLE_TEXT = "VR AREENA";

        const canvas = document.createElement('canvas');
        canvas.width = this.HEADER_WIDTH * 2;
        canvas.height = this.HEADER_HEIGHT * 2;
        const context = canvas.getContext('2d');
        // transparent bg
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // title
        context.font = "62px Helvetica";
        const textWidth = context.measureText(TITLE_TEXT).width;
        const textHeight = context.measureText("M").width;
        context.fillStyle = 'rgba(255, 255, 255, 1.0)';
        context.fillText(TITLE_TEXT, this.HEADER_WIDTH/2, this.HEADER_HEIGHT/2+textHeight);
        const texture = new THREE.Texture(canvas)
        texture.minFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        const headerMaterial = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5, transparent: true });
        const headerGeometry = new THREE.PlaneGeometry(this.HEADER_WIDTH, this.HEADER_HEIGHT, 4, 4);
        const headerMesh = new THREE.Mesh(headerGeometry, headerMaterial);

        const y = ((this.MENU_ITEM_HEIGHT * this.MENU_ITEM_ROWS) / 2) + this.MENU_ITEM_HEIGHT/2 + this.HEADER_HEIGHT;

        headerMesh.position.y = y;
        headerMesh.position.z = this.MENU_Z;
        this.scene.add(headerMesh);
    }

    addNewMenuItem(program, r, c) {

        let img = new Image();
        img.src = `http://${location.host}/image/upload/` + program.image.id + ".jpg";
        img.onload = () => {

            const canvas = document.createElement('canvas');
            canvas.width = this.MENU_ITEM_WIDTH * 2;
            canvas.height = this.MENU_ITEM_HEIGHT * 2;
            // background
            const context = canvas.getContext('2d');
            context.drawImage(img, 0, 0);
            // title
            const textPadding = 6;
            context.font = "42px Helvetica";
            const titleTextHeight = context.measureText("M").width;
            // semitransparent placeholder    
            const tboxy = canvas.height - ((2 * titleTextHeight) + (2 * (2 * textPadding)));
            const tboxh = canvas.height - tboxy;
            let tposy = tboxy + textPadding + titleTextHeight;
            context.fillStyle = 'rgba(0, 0, 0, 0.75)';
            context.fillRect(0, tboxy, canvas.width, tboxh);
            // title 
            context.fillStyle = 'rgba(255, 255, 255, 1.0)';
            let title = program.description.fi;
            title = title.length > 30 ? title.substring(0, 30) + ".." : title;
            context.fillText(title, textPadding, tposy);
            // subtitle
            context.font = "32px Helvetica";
            const subTitleTextHeight = context.measureText("M").width;
            tposy += (2 * textPadding) + subTitleTextHeight;
            let subtitle = program.description.fi;
            subtitle = subtitle.length > 40 ? subtitle.substring(0, 40) + ".." : subtitle;
            context.fillText(subtitle, textPadding, tposy);

            const texture = new THREE.Texture(canvas)
            texture.minFilter = THREE.LinearFilter;
            texture.needsUpdate = true;

            const menuItemMaterial = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 });
            const menuItemGeometry = new THREE.PlaneGeometry(this.MENU_ITEM_WIDTH, this.MENU_ITEM_HEIGHT, 4, 4);
            const menuItemMesh = new THREE.Mesh(menuItemGeometry, menuItemMaterial);

            const x = -(((this.MENU_ITEM_WIDTH + this.MENU_ITEM_PADDING) * this.MENU_ITEMS_PER_ROW) / 2) + (this.MENU_ITEM_WIDTH/2 + this.MENU_ITEM_PADDING/2) + (c * (this.MENU_ITEM_WIDTH + this.MENU_ITEM_PADDING));
            const y = ((this.MENU_ITEM_HEIGHT * this.MENU_ITEM_ROWS) / 2) - (r * (this.MENU_ITEM_HEIGHT + this.MENU_ITEM_PADDING));

            menuItemMesh.position.x = x;
            menuItemMesh.position.y = y;

            menuItemMesh.program = program;

            this.menuMeshGroup.add(menuItemMesh);
        };

    }

    updateMenuItems() {
        const intersects = this.raycaster.intersectObjects(this.menuMeshGroup.children);
        if (intersects && intersects.length > 0) {
            const selected = intersects[0];
            const menuItemMesh = selected.object;
            this.selectorMesh.position.x = menuItemMesh.position.x;
            this.selectorMesh.position.y = menuItemMesh.position.y;
            this.selectorMesh.position.z = menuItemMesh.position.z - 10;
            this.selectorMesh.visible = true;
            this.selectedProgram = menuItemMesh.program;
        }
        else {
            this.selectorMesh.visible = false;
            this.selectedProgram = null;
        }

    }

    removeMenuItems(menu) {
        this.menuMeshGroup.children.forEach((menuItem) => {
            this.menuMeshGroup.remove(menuItem);
        });
    }

    getSelectedProgramPlayStream(callback) {
        if (this.selectedProgram) {
            const programId = this.selectedProgram.id;
            this.yleClient.getProgramStream(programId, "PMD", callback);
        }
        else {
            callback("nothing selected");
        }
    }

    switchLights(turnon, callback) {
        this.lightInterval = setInterval(() => {
            let uniforms = this.sky.uniforms;
            if (!turnon) {
                uniforms.mieDirectionalG.value = uniforms.mieDirectionalG.value - 0.01;
                if (uniforms.mieDirectionalG.value <= 0) {
                    clearInterval(this.lightInterval);
                    callback();
                }
            }
            else {
                uniforms.mieDirectionalG.value = uniforms.mieDirectionalG.value + 0.01;
                if (uniforms.mieDirectionalG.value >= this.LIGHTS_MAX_BRIGHTNESS) {
                    clearInterval(this.lightInterval);
                    callback();
                }
            }

        }, 20);
    }

    render(renderer, camera) {
        this.raycaster.set(camera.getWorldPosition(), camera.getWorldDirection());
        this.updateMenuItems();
        renderer.render(this.scene, camera);
    }

}