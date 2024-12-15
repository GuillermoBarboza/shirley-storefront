import React, { useEffect, useRef } from "react";
import styles from "./Header.module.css";
import { gsap } from "gsap";

export const Header = () => {
    const headerRef = useRef(null);
    const previousScroll = useRef(0);
    const isAnimating = useRef(false);

    useEffect(() => {
        const headerElement = headerRef.current;
        let isDesktop = window.matchMedia("(min-width: 856px)").matches;

        let desktopAnimation = gsap.timeline({ paused: true });
        desktopAnimation.to(headerElement, {
            yPercent: -100,
            duration: 0.3,
            ease: "power1.out",
        });

        let mobileAnimation = gsap.timeline({ paused: true });
        mobileAnimation.to(headerElement, {
            yPercent: 100,
            duration: 0.3,
            ease: "power1.out",
        });

        const onScroll = () => {
            const currentScroll =
                window.pageYOffset || document.documentElement.scrollTop;
            isDesktop = window.matchMedia("(min-width: 856px)").matches;
            const scrollDown = currentScroll > previousScroll.current;

            if (!isAnimating.current) {
                if (scrollDown) {
                    // Scrolling down - hide header
                    if (isDesktop) {
                        desktopAnimation.play();
                    } else {
                        mobileAnimation.play();
                    }
                } else {
                    // Scrolling up - show header
                    if (isDesktop) {
                        desktopAnimation.reverse();
                    } else {
                        mobileAnimation.reverse();
                    }
                }
                isAnimating.current = true;
                setTimeout(() => {
                    isAnimating.current = false;
                }, 300);
            }

            previousScroll.current = currentScroll <= 0 ? 0 : currentScroll;
        };

        window.addEventListener("scroll", onScroll);
        window.addEventListener("resize", () => {
            isDesktop = window.matchMedia("(min-width: 856px)").matches;
        });

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", () => {
                isDesktop = window.matchMedia("(min-width: 856px)").matches;
            });
        };
    }, []);

    return (
        <header className={styles.header} ref={headerRef}>
            <nav className={styles.nav}>
                <ul>
                    <li>
                        <a href="/">Inicio</a>
                    </li>
                    <li>
                        <a href="/galeria">Galería</a>
                    </li>
                </ul>
            </nav>
        </header>
    );
};
