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

            // Scroll Trigger: Scene Y Rotation
            gsap.to(pivotGroup.rotation, {
                scrollTrigger: {
                    trigger: "body",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1,
                },
                y: Math.PI * 2,
                ease: "none",
            });
        },
        undefined,
        (error: any) => {
            console.error("Error loading GLB:", error);
        },
    );

    // --- SMOG PARTICLE SYSTEM ---
    const particleCount = 150;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleInitialPositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    const getSmogTexture = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext("2d");
        if (context) {
            // Very diffuse/cloudy gradient
            const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, "rgba(200, 200, 200, 0.15)");
            gradient.addColorStop(0.4, "rgba(100, 100, 100, 0.1)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            context.fillStyle = gradient;
            context.fillRect(0, 0, 64, 64);
        }
        return new THREE.CanvasTexture(canvas);
    };

    for (let i = 0; i < particleCount; i++) {
        const r = 8 + Math.random() * 7;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;

        particleInitialPositions[i * 3] = x;
        particleInitialPositions[i * 3 + 1] = y;
        particleInitialPositions[i * 3 + 2] = z;

        particleSpeeds[i] = 0.3 + Math.random() * 0.4;
    }

    particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePositions, 3),
    );

    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 12.0, // Huge particles for smoke effect
        map: getSmogTexture(),
        transparent: true,
        opacity: 0.15, // Low opacity for soft overlap
        depthWrite: false,
        blending: THREE.NormalBlending,
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

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

        const positions = particlesGeometry.attributes.position.array as Float32Array; // Add type assertion

        for (let i = 0; i < particleCount; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            const convergence = Math.max(
                0,
                1 - scrollState.progress * 1.5 * particleSpeeds[i],
            );

            const time = Date.now() * 0.001;
            const noiseX = Math.sin(time + i) * 0.1;
            const noiseY = Math.cos(time + i * 0.5) * 0.1;

            positions[ix] = particleInitialPositions[ix] * convergence + noiseX;
            positions[iy] = particleInitialPositions[iy] * convergence + noiseY;
            positions[iz] = particleInitialPositions[iz] * convergence;
        }

        particlesGeometry.attributes.position.needsUpdate = true;

        if (scrollState.progress > 0) {
            const fadeProgress = Math.min(scrollState.progress * 1.6, 1);
            particlesMaterial.opacity = THREE.MathUtils.lerp(
                0.15, // Base opacity matches initial setting
                0,
                fadeProgress,
            );
        } else {
            particlesMaterial.opacity = 0.15;
        }

        // Optional: Interactive tilt if model exists
        if (model) {
            // model.rotation.x += (mouseY * 0.05); // subtle interaction
            // model.rotation.y += (mouseX * 0.05);
        }

        renderer.render(scene, camera);
    };

    animate();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};
