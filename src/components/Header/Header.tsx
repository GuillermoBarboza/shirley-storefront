import React from "react";
import { NavLink, Link } from "react-router-dom";
import styles from "./Header.module.css";

const links = [
    { to: "/", label: "Inicio", end: true },
    { to: "/galeria", label: "Galería" },
    { to: "/experiencias", label: "Experiencias" },
    { to: "/virtual-gallery", label: "Sala Virtual" },
];

export const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link to="/" className={styles.wordmark}>
                    Shirley Madero
                </Link>
                <nav className={styles.nav}>
                    {links.map(({ to, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                isActive
                                    ? `${styles.link} ${styles.active}`
                                    : styles.link
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </header>
    );
};
