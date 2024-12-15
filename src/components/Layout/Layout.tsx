import React from "react";
import { Header } from "../Header/Header";
import { Analytics } from "@vercel/analytics/react";
import styles from "./Layout.module.css";

export const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className={styles.app}>
            <Header />
            <main>{children}</main>
            <footer className={styles.footer}>
                <p>
                    <strong>Hola, soy Shirley Madero</strong>
                </p>
                <p>
                    Hacé tu consulta al{" "}
                    <a
                        href={`https://wa.me/+59892904603`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        +598 92 904 603
                    </a>
                </p>
                <p>
                    <i>© 2023</i>
                </p>
            </footer>
            <Analytics />
        </div>
    );
};
