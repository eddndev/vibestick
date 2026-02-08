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

    const fillLight = new THREE.DirectionalLight(0xffffff, 8);
    fillLight.position.set(5, 0, 5);
    scene.add(fillLight);

    // Load GLB Model
    let model: THREE.Group | null = null;
    let particleSystem: THREE.Points | null = null;
    const loader = new GLTFLoader();

    loader.load(
        "/assets/models/sticker.glb",
        (gltf: any) => {
            const sceneModel = gltf.scene;


            // --- 1. HIERARCHY SETUP ---
            // Create nested groups to separate animation concerns and avoid conflicts
            // Structure: Scene -> scrollGroup -> labGroup -> exitGroup -> floatGroup -> entranceGroup -> Model
            const scrollGroup = new THREE.Group(); // Handles Scroll movement (Hero -> Info)
            const labGroup = new THREE.Group();    // Handles Lab Section movement (Info -> Lab)
            const exitGroup = new THREE.Group();   // Handles Exit movement (Lab -> Exit)
            const floatGroup = new THREE.Group();  // Handles Idle floating/swaying
            const entranceGroup = new THREE.Group(); // Handles initial Entrance drop/spin

            scene.add(scrollGroup);
            scrollGroup.add(labGroup);
            labGroup.add(exitGroup);
            exitGroup.add(floatGroup);
            floatGroup.add(entranceGroup);
            entranceGroup.add(sceneModel);

            model = scrollGroup; // Reference for interactive tilt (optional)

            // Center the model geometry
            const box = new THREE.Box3().setFromObject(sceneModel);
            const center = box.getCenter(new THREE.Vector3());
            sceneModel.position.sub(center);

            // --- 2. BASE POSE ---
            // Set the fundamental orientation and scale of the model
            sceneModel.scale.set(2.5, 2.5, 2.5);
            sceneModel.rotation.x = Math.PI / 2;
            sceneModel.rotation.y = THREE.MathUtils.degToRad(-120);

            // Set Initial Global Position (via ScrollGroup)
            // This is the "Hero" position
            scrollGroup.position.y = -2.5;
            scrollGroup.position.x = 0; // Center initially

            // --- 3. ENTRANCE ANIMATION (Target: entranceGroup) ---
            const animDuration = 4.0;
            const animEase = "power3.out";

            const entranceTl = gsap.timeline();

            // Fall from top (relative y)
            entranceTl.from(entranceGroup.position, {
                y: 15,
                duration: animDuration,
                ease: animEase
            }, 0);

            // Spin Entry
            entranceTl.from(entranceGroup.rotation, {
                z: -Math.PI * 4, // Spin around Z
                x: -Math.PI / 4, // Flip
                duration: animDuration,
                ease: animEase
            }, 0);


            // --- 4. IDLE ANIMATION (Target: floatGroup) ---
            // Continuous gentle movement
            // Starts immediately but blends nicely since it targets a different group
            const idleTl = gsap.timeline({
                repeat: -1,
                yoyo: true,
                defaults: { ease: "sine.inOut", duration: 4 }
            });

            // Float up/down
            idleTl.to(floatGroup.position, {
                y: 0.25, // Move up slightly
            }, 0);

            // Gentle Sway
            idleTl.to(floatGroup.rotation, {
                x: 0.1, // Slight tilt
                z: -0.05, // Slight roll
            }, 0);


            // --- 5. SCROLL ANIMATION (Target: scrollGroup) ---
            // Transitions from Hero to Info Section
            const scrollTl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#info-section",
                    start: "top bottom",
                    end: "center center",
                    scrub: 1.5,
                    immediateRender: false,
                }
            });

            // Move Left
            scrollTl.to(scrollGroup.position, {
                x: -3.5, // Move to left side
                y: 0, // Move up slightly
                ease: "power2.inOut"
            }, 0);

            // Rotate to Profile View
            // We rotate the Wrapper Group, so it affects everything inside
            // Adjust these values to get the perfect "wheel" profile view
            scrollTl.to(scrollGroup.rotation, {
                y: THREE.MathUtils.degToRad(30), // Rotate to side profile
                x: THREE.MathUtils.degToRad(-20), // Keep it level
                z: THREE.MathUtils.degToRad(20), // Slight dynamic angle
                ease: "power2.inOut"
            }, 0);


            // --- PARTICLES SETUP (Lab Section) ---
            // Subtle "magic dust" that appears when synthesized
            const particlesGeometry = new THREE.BufferGeometry();
            const particleCount = 300;
            const posArray = new Float32Array(particleCount * 3);

            for (let i = 0; i < particleCount * 3; i++) {
                // Random spread around the center
                posArray[i] = (Math.random() - 0.5) * 14;
            }

            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

            const particlesMaterial = new THREE.PointsMaterial({
                size: 0.04,
                color: 0x22d3ee, // Cyan-ish
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
            });

            const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
            labGroup.add(particlesMesh);

            // Expose for animation loop
            particleSystem = particlesMesh;


            // --- LAB ANIMATION (Info -> Lab Section) ---
            const labTl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#lab-section",
                    start: "top bottom",
                    end: "center center",
                    scrub: 1.5,
                    immediateRender: false,
                }
            });

            // Move to Right
            // Also move closer (z: 2.5) to compensate for perspective size reduction
            labTl.to(labGroup.position, {
                x: 7.5,
                z: 2.5,
                y: -2,
                ease: "power2.inOut"
            }, 0);

            // Rotate comfortably - Face Front (as in start)
            labTl.to(labGroup.rotation, {
                y: THREE.MathUtils.degToRad(-45), // Cancel scrollGroup's 30deg to return to front
                x: THREE.MathUtils.degToRad(0),  // Slight tilt forward for better visibility
                z: THREE.MathUtils.degToRad(-10),   // Subtle angle
                ease: "power2.inOut"
            }, 0);

            // Particles Reveal
            labTl.to(particlesMaterial, {
                opacity: 0.8,
                duration: 0.5,
                ease: "power2.in"
            }, ">-0.5");

            // Rotate particles
            labTl.to(particlesMesh.rotation, {
                y: 2,
                ease: "none"
            }, 0);


            // --- EXIT ANIMATION (Lab -> Exit Section) ---
            // Sticker flies away and particles disperse
            const exitTl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#exit-section",
                    start: "top bottom",
                    end: "center center",
                    scrub: 1,
                    immediateRender: false,
                }
            });

            // Particles Disperse/Fade
            exitTl.to(particlesMaterial, {
                opacity: 0,
                size: 0, // Shrink points
                duration: 0.5,
                ease: "power1.out"
            }, 0);

            // Sticker Departure
            // Fly up and scale down to vanish
            exitTl.to(exitGroup.position, {
                y: 5,
                z: -5,
                ease: "power2.in"
            }, 0);

            exitTl.to(exitGroup.scale, {
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.in"
            }, 0);

            // Spin on exit for style
            exitTl.to(exitGroup.rotation, {
                y: THREE.MathUtils.degToRad(180),
                ease: "power2.in"
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

        // Interactive Particles (Lab Section)
        if (particleSystem) {
            // Respond to mouse movement on X and Z axes (Y is animated by GSAP)
            particleSystem.rotation.x = mouseY * 0.8;
            particleSystem.rotation.z = mouseX * 0.8;
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


