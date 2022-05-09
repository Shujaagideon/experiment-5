import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';

import vertex from './shaders/vertex'
import fragment from './shaders/fragment'
import earth from './assets/diffuse_4k.jpg'
import earthExtra from './assets/extras_4k.jpg'

import * as dat from 'dat.gui'
// import datGuiImage from 'dat.gui.image'
// datGuiImage(dat)
import gsap from 'gsap'

import { TimelineMax } from 'gsap'
import { OrthographicCamera } from 'three'
let OrbitControls = require('three-orbit-controls')(THREE);

// const createInputEvents = require('simple-input-events')
// const event = createInputEvents(window);



export default class Template {
    constructor(selector) {

        // getting the heights of the containing windows
        this.container = selector;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor('#0D0E0F', 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.autoClear = false;

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            70, this.width / this.height,
            0.001,
            1000
        );

        // let frustumSize = 10;
        // let aspect = window.innerWidth / window.innerHeight;
        // this.camera = new THREE.OrthographicCamera(frustumSize* aspect / -2, frustumSize*aspect);
        this.camera.position.set(0, 0, 4);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.enableZoom = false;
        this.controls.enablePan = false;
        this.time = 0;

        this.paused = false;
        this.postprocessing = {};
        
        this.setupResize();
        this.tabEvents();
        this.addObjects();
        this.initPostprocessing();
        this.resize();
        this.render();
        // this.settings();
    }
    settings() {
        let that = this;
        this.settings = {
            time: 0,
        };
        this.gui = new dat.GUI();
        this.gui.add(this.settings, 'time', 0, 100, 0.01);
        this.gui.addImage(this.settings, 'texturePath').onChange((image) => {
            body.append(image);
        });
    }

    setupResize() {
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.postprocessing.composer.setSize( this.width, this.height );
        this.camera.aspect = this.width / this.height;

        this.imageAspect = 853 / 1280;
        let a1; let a2;
        if (this.height / this.width > this.imageAspect) {
            a1 = (this.width / this.height) * this.imageAspect;
            a2 = 1;
        } else {
            a2 = (this.height / this.width) * this.imageAspect;
            a1 = 1;
        }
        this.material.uniforms.resolution.value.x = this.width;
        this.material.uniforms.resolution.value.y = this.height;
        this.material.uniforms.resolution.value.z = a1;
        this.material.uniforms.resolution.value.w = a2;

        // const dist = this.camera.position.z;
        // const height = 1;
        // this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist));

        // if (this.width / this.height > 1) {
        //     this.mesh ? this.mesh.scale.x = this.camera.aspect: null;
        //     // this.plane.scale.y = this.camera.aspect;
        // } else {
        //     this.mesh ? this.mesh.scale.y = 1 / this.camera.aspect: null;
        // }

        this.camera.updateProjectionMatrix();
    }

    addObjects() {
        let that = this;
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: '#extension GL_OES_standard_derivatives : enable'
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { type: "f", value: 0 },
                u_color:{value: new THREE.Color('#151618')},
                uTexture1: { type: "t", value: new THREE.TextureLoader().load(earth) },
                uTexture2: { type: "t", value: new THREE.TextureLoader().load(earthExtra) },
                resolution: { type: "v4", value: new THREE.Vector4() },
                uvRate: {
                    value: new THREE.Vector2(1, 1)
                }
            },
            // wireframe: true,
            // transparent: true,
            vertexShader: vertex,
            fragmentShader: fragment
        });

        this.geometry = new THREE.SphereBufferGeometry(2, 50, 50);

        this.earth = new THREE.Mesh(this.geometry, this.material);
        this.earth.rotation.y += 0.002;
        this.scene.add(this.earth);
    }

    tabEvents() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop()
            } else {
                this.play();
            }
        });
    }
    stop() {
        this.paused = true;
    }

    play() {
        this.paused = false;
    }

    initPostprocessing() {

        const effectController = {
            focus: 80.0,
            aperture: 2.7,
            maxblur: 0.01
        };
        this.bloomPass = new BloomPass(
            0.6,    // strength
            25,   // kernel size
            4,    // sigma ?
            256,  // blur render target resolution
        );
        this.bloomPass2 = new UnrealBloomPass( new THREE.Vector2( this.width, this.height ), 25, 0.8, 5.85 );

        this.filmPass = new FilmPass(
            0.35,   // noise intensity
            0.025,  // scanline intensity
            648,    // scanline count
            false,  // grayscale
        );
        this.filmPass.renderToScreen = true;
        this.renderPass = new RenderPass( this.scene, this.camera );
        
        this.composer = new EffectComposer( this.renderer );
        
        this.composer.addPass( this.renderPass );
        this.composer.addPass(this.bloomPass);
        // this.composer.addPass(this.bloomPass2);
        this.composer.addPass(this.filmPass);

        this.postprocessing.composer = this.composer;

    }


    render() {
        if (this.paused) return;
        this.time += 0.05;
        
        this.earth.rotation.y += 0.002;
        this.controls.update()
        this.material.uniforms.time.value = this.time;
        requestAnimationFrame(this.render.bind(this));
        // this.renderer.render(this.scene, this.camera);
        this.renderer.clear();
        this.postprocessing.composer.render( 0.1 );
    }
}

new Template(document.getElementById('container'));