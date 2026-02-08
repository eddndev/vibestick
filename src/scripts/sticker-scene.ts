import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

gsap.registerPlugin(ScrollTrigger);

export const initStickerScene = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const spotLight = new THREE.SpotLight(0x7e22ce, 5);
    spotLight.position.set(-5, 5, 20);
    scene.add(spotLight);

    const rimLight = new THREE.SpotLight(0x4f46e5, 5);
    rimLight.position.set(0, 5, -10);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 4);
    fillLight.position.set(5, 0, 5);
    scene.add(fillLight);

    // Load GLB Model
    let model: THREE.Group | null = null;
    const loader = new GLTFLoader();

    loader.load(
        "/assets/models/sticker.glb",
        (gltf: any) => {
            const sceneModel = gltf.scene;

            const pivotGroup = new THREE.Group();
            scene.add(pivotGroup);
            pivotGroup.add(sceneModel);

            model = pivotGroup;

            const box = new THREE.Box3().setFromObject(sceneModel);
            const center = box.getCenter(new THREE.Vector3());
            sceneModel.position.sub(center);

            // Updated Scale & Orientation
            sceneModel.scale.set(1.8, 1.8, 1.8); // Huge scale as requested
            sceneModel.rotation.x = Math.PI / 2;
            sceneModel.rotation.y = THREE.MathUtils.degToRad(-120);

            // Resting Position (Bottom half)
            pivotGroup.position.y = -2.5;

            // ENTRANCE ANIMATION: From TOP (y=10) to Resting (-2.5) with Z-Rotation
            const entranceTl = gsap.timeline();

            entranceTl.from(pivotGroup.position, {
                y: 10,
                duration: 2.5,
                ease: "power3.out"
            }, 0);

            entranceTl.from(pivotGroup.rotation, {
                z: -Math.PI / 2, // Start tilted 90 degrees
                duration: 2.5,
                ease: "power3.out"
            }, 0);


        },
        undefined,
        (error: any) => {
            console.error("Error loading GLB:", error);
        },
    );

    // --- SMOG PARTICLE SYSTEM REMOVED FOR OPTIMIZATION ---

    const scrollState = { progress: 0 };
    gsap.to(scrollState, {
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
        },
        progress: 1,
        ease: "none",
    });

    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
    });

    const animate = () => {
        requestAnimationFrame(animate);

        // Optional: Interactive tilt if model exists
        if (model) {
            // model.rotation.x += (mouseY * 0.05); // subtle interaction
            // model.rotation.y += (mouseX * 0.05);
        }

        renderer.render(scene, camera);
    };

    // Start animation loop
    animate();

    // Handle window resize
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};


