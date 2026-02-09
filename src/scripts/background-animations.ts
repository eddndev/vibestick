import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const initBackgroundAnimations = () => {
    const isMobile = window.innerWidth < 768;

    // --- Info Section Background Transition ---
    // Fade out glow and move hexagons to center
    const bgTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#info-section",
            start: "top 80%",
            end: "center center",
            scrub: 1,
        },
    });

    // Fade out the main glow
    bgTl.to(
        "#glow-1",
        {
            opacity: 0,
            duration: 1,
            ease: "power1.out",
            immediateRender: false,
        },
        0,
    );

    // Solid Hexagons (1 & 3) -> Fade Out
    bgTl.to(
        [".hex-1", ".hex-3"],
        {
            opacity: 0,
            scale: 0.5,
            duration: 1,
            ease: "power1.out",
            immediateRender: false,
        },
        0,
    );

    // Outline Hexagons (2 & 4) -> Center perfectly
    // Hex 2 (Large Outline)
    bgTl.to(
        ".hex-2",
        {
            top: "50%",
            right: "50%",
            xPercent: 50,
            yPercent: -50,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            ease: "power2.inOut",
            immediateRender: false,
        },
        0,
    );

    // Hex 4 (Small Outline)
    bgTl.to(
        ".hex-4",
        {
            top: "50%",
            right: "50%",
            xPercent: 50,
            yPercent: -50,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            ease: "power2.inOut",
            immediateRender: false,
        },
        0,
    );


    // Skip heavy hexagon scroll-driven animations on mobile
    if (isMobile) return;

    // --- Lab Section Background Animation ---
    // Animate WRAPPERS (not SVGs directly) to avoid conflicts with bgTl
    const labBgTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#lab-section",
            start: "top bottom",
            end: "center center",
            scrub: 1,
            immediateRender: false,
        },
    });

    // Hex 2 Wrapper -> Move LEFT, scale DOWN to ~30vw
    labBgTl.to(
        ".hex-2-wrap",
        {
            x: "-13vw",
            rotation: 360,
            scale: 0.5,
            ease: "power2.inOut",
        },
        0,
    );

    // Hex 4 Wrapper -> Move RIGHT, scale UP to ~30vw
    labBgTl.to(
        ".hex-4-wrap",
        {
            x: "13vw",
            rotation: 360,
            scale: 2,
            ease: "power2.inOut",
        },
        0,
    );


    // --- Tech Section Background Animation ---
    // Move hexagons to LEFT side, concentric and rotating
    const techBgTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#tech-section",
            start: "top bottom",
            end: "center center",
            scrub: 1,
            immediateRender: false,
        },
    });

    // Hex 2 Wrapper -> Move to LEFT, align with container edge
    // Container max-width: 1280px (xl), left edge at: calc(50vw - 640px)
    // Position from center: calc(-50vw + 640px) - hex_radius
    // Hex-2 at scale 0.4 → 24vw effective → ~10.4vw radius
    techBgTl.to(
        ".hex-2-wrap",
        {
            x: "calc(-50vw + 640px - 10vw)", // Align right edge with container left edge
            y: 0,
            rotation: 720,
            scale: 0.8,
            ease: "power2.inOut",
        },
        0,
    );

    // Hex 4 Wrapper -> Same position, nested inside
    techBgTl.to(
        ".hex-4-wrap",
        {
            x: "calc(-50vw + 640px - 10vw)",
            y: 0,
            rotation: -720,
            scale: 0.6,
            ease: "power2.inOut",
        },
        0,
    );


    // --- Mission Section Background Animation ---
    // Hexagons spread to opposite corners, framing the content diagonally
    const missionBgTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#mission-section",
            start: "top bottom",
            end: "center center",
            scrub: 1,
            immediateRender: false,
        },
    });

    // Hex 2 -> Top right corner
    missionBgTl.to(
        ".hex-2-wrap",
        {
            x: "35vw",
            y: "-30vh",
            rotation: 1080,
            scale: 0.6,
            ease: "power2.inOut",
        },
        0,
    );

    // Hex 4 -> Bottom left corner
    missionBgTl.to(
        ".hex-4-wrap",
        {
            x: "-35vw",
            y: "30vh",
            rotation: -1080,
            scale: 0.4,
            ease: "power2.inOut",
        },
        0,
    );
};
