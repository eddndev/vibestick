import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const initBackgroundAnimations = () => {
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
};
