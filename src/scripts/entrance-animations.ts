import gsap from "gsap";

export const initEntranceAnimations = () => {
    const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
    });

    // 1. Ambient Background Glows (Scale Up & Fade In)
    tl.to(
        "#glow-1",
        {
            scale: 1,
            opacity: 1,
            duration: 5,
            ease: "power1.inOut",
        },
        0,
    );

    // 2. Navbar (Header) Entrance
    tl.to(
        "#main-header",
        {
            y: 0,
            opacity: 1,
            duration: 1.5,
            ease: "power4.out",
        },
        1.0,
    );

    return tl;
};
