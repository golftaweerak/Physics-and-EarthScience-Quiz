import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

export class Pet3DViewer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas with id "${canvasId}" not found.`);
            return;
        }

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.loader = new GLTFLoader();
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.animations = {};

        this.setupScene();
        this.setupControls();
        this.animate();

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    setupScene() {
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        this.scene.add(directionalLight);

        this.camera.position.z = 5;
        this.camera.position.y = 2;
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 10;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.target.set(0, 1, 0); // Aim slightly higher
    }

    loadPet(petType) {
        // Assuming models are in /assets/models/ and named like 'dog.glb'
        const modelPath = `../assets/models/${petType}.glb`;

        this.loader.load(modelPath, (gltf) => {
            // Clear previous model
            if (this.currentModel) {
                this.scene.remove(this.currentModel);
            }

            this.currentModel = gltf.scene;
            this.scene.add(this.currentModel);

            // Setup animations
            this.mixer = new THREE.AnimationMixer(this.currentModel);
            this.animations = {};
            gltf.animations.forEach((clip) => {
                this.animations[clip.name.toLowerCase()] = this.mixer.clipAction(clip);
            });

            // Play idle animation by default
            this.playAnimation('idle');

        }, undefined, (error) => {
            console.error(`An error happened while loading the pet model: ${petType}`, error);
        });
    }

    playAnimation(name, loop = true) {
        if (!this.mixer || !this.animations[name]) {
            console.warn(`Animation "${name}" not found.`);
            return;
        }

        // Fade out other animations
        Object.values(this.animations).forEach(action => {
            if (action.isRunning()) {
                action.fadeOut(0.5);
            }
        });

        const action = this.animations[name];
        action.reset().fadeIn(0.5).play();
        action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
        action.clampWhenFinished = !loop;

        if (!loop) {
            // When a non-looping animation finishes, go back to idle
            this.mixer.addEventListener('finished', () => {
                this.playAnimation('idle');
            });
        }
    }

    onWindowResize() {
        this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const delta = this.clock.getDelta();
        if (this.mixer) {
            this.mixer.update(delta);
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}