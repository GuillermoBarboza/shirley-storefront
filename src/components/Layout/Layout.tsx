import React from "react";
import { Header } from "../Header/Header";
import { Analytics } from "@vercel/analytics/react";
import styles from "./Layout.module.css";

export const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className={styles.app}>
            <Header />
            <main className={styles.main}>{children}</main>
            <footer className={styles.footer}>
                <div className={styles.wordmark}>Shirley Madero</div>
                <div className={styles.year}>© 2023</div>
            </footer>
            <Analytics />
        </div>
    );
};
