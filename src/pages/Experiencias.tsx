import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout/Layout";
import styles from "./Experiencias.module.css";
import PhotoSlot from "../components/PhotoSlot/PhotoSlot";
import { useContactPhone, waLink } from "../hooks/useContactPhone";

type ExperienceType = "mate" | "murales";

const LABELS: Record<ExperienceType, string> = {
    mate: "Ritual del Mate",
    murales: "Recorrido de Murales",
};

const MATE_STEPS = [
    "1. Origen y memoria del mate",
    "2. Clasificación de yerbas",
    "3. Leyenda y símbolo",
    "4. El ritual",
    "5. Momento de creación",
    "6. Cierre compartido",
];

interface ReservationForm {
    nombre: string;
    fecha: string;
    personas: string;
    mensaje: string;
}

const EMPTY_FORM: ReservationForm = {
    nombre: "",
    fecha: "",
    personas: "",
    mensaje: "",
};

const Experiencias: React.FC = () => {
    const [openType, setOpenType] = useState<ExperienceType | null>(null);
    const [form, setForm] = useState<ReservationForm>(EMPTY_FORM);
    const phone = useContactPhone();

    const open = (type: ExperienceType) => {
        setForm(EMPTY_FORM);
        setOpenType(type);
    };

    const close = () => setOpenType(null);

    // Lock the page behind the dialog and wire Escape to close it.
    useEffect(() => {
        if (!openType) return;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", onKey);
        };
    }, [openType]);

    const set = (key: keyof ReservationForm) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!openType) return;

        const label =
            openType === "mate"
                ? "el Ritual del Mate"
                : "el Recorrido de Murales";

        let msg = `¡Hola Shirley! Quiero reservar ${label}.`;
        if (form.nombre) msg += ` Mi nombre es ${form.nombre}.`;
        if (form.personas) msg += ` Somos ${form.personas} persona(s).`;
        if (form.fecha) msg += ` Fecha preferida: ${form.fecha}.`;
        if (form.mensaje) msg += ` ${form.mensaje}`;

        window.open(waLink(phone, msg), "_blank", "noopener,noreferrer");
        close();
    };

    return (
        <Layout>
            <section className={styles.intro}>
                <div className={styles.eyebrow}>Además de la pintura</div>
                <h1 className={styles.pageTitle}>Experiencias</h1>
                <p className={styles.lede}>
                    Dos maneras de conocer a Shirley más allá del lienzo: un
                    ritual sensorial con mate, y recorridos a pie por las
                    historias y murales escondidos de Montevideo.
                </p>
            </section>

            <section className={styles.section}>
                <PhotoSlot
                    className={styles.photo}
                    src="./experiencia-mate.jpg"
                    alt="Ritual del Mate"
                    placeholder="foto del ritual del mate"
                />
                <div className={styles.copy}>
                    <div className={`${styles.kicker} ${styles.kickerOlive}`}>
                        Experiencia sensorial
                    </div>
                    <h2 className={styles.title}>Ritual del Mate</h2>
                    <p className={styles.quote}>
                        «El mate no es una bebida, es una forma de estar en el
                        mundo.»
                    </p>
                    <div className={styles.place}>Ciudad Vieja, Montevideo</div>
                    <ul className={styles.steps}>
                        {MATE_STEPS.map((step) => (
                            <li key={step}>{step}</li>
                        ))}
                    </ul>
                    <p className={styles.note}>
                        Incluye degustación de distintas yerbas, bizcochos y uso
                        de mates seleccionados.
                    </p>
                    <button
                        className="btn btn--olive"
                        onClick={() => open("mate")}
                    >
                        Reservar mi lugar
                    </button>
                </div>
            </section>

            <section
                className={`${styles.section} ${styles.sectionLast} ${styles.reverse}`}
            >
                <div className={styles.copy}>
                    <div className={`${styles.kicker} ${styles.kickerGold}`}>
                        Recorrido guiado
                    </div>
                    <h2 className={styles.title}>Recorridos Murales</h2>
                    <p className={styles.quote}>
                        «Amo mi ciudad y puedo mostrarla en todo su esplendor —
                        sobre todo sus historias y los murales escondidos en los
                        barrios.»
                    </p>
                    <div className={styles.place}>
                        A pie, por los barrios de Montevideo
                    </div>
                    <p className={styles.body}>
                        Un paseo caminando entre relatos de barrio, arquitectura
                        y murales, con paradas para fotos y un cierre
                        compartiendo unos mates.
                    </p>
                    <button className="btn" onClick={() => open("murales")}>
                        Reservar mi lugar
                    </button>
                </div>
                <PhotoSlot
                    className={styles.photo}
                    src="./experiencia-murales.jpg"
                    alt="Recorrido de murales por Montevideo"
                    placeholder="foto del recorrido de murales"
                />
            </section>

            {openType && (
                <div
                    className={styles.overlay}
                    onClick={close}
                    role="presentation"
                >
                    <div
                        className={styles.dialog}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Reservar ${LABELS[openType]}`}
                    >
                        <button
                            className={styles.close}
                            onClick={close}
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>
                        <h2 className={styles.dialogTitle}>Reservar</h2>
                        <div className={styles.dialogSub}>
                            {LABELS[openType]}
                        </div>

                        <form onSubmit={submit}>
                            <div className={styles.field}>
                                <label
                                    className={styles.label}
                                    htmlFor="res-nombre"
                                >
                                    Nombre
                                </label>
                                <input
                                    id="res-nombre"
                                    className={styles.input}
                                    value={form.nombre}
                                    onChange={set("nombre")}
                                />
                            </div>

                            <div className={styles.row}>
                                <div>
                                    <label
                                        className={styles.label}
                                        htmlFor="res-fecha"
                                    >
                                        Fecha preferida
                                    </label>
                                    <input
                                        id="res-fecha"
                                        className={styles.input}
                                        placeholder="ej. 20 de agosto"
                                        value={form.fecha}
                                        onChange={set("fecha")}
                                    />
                                </div>
                                <div>
                                    <label
                                        className={styles.label}
                                        htmlFor="res-personas"
                                    >
                                        Personas
                                    </label>
                                    <input
                                        id="res-personas"
                                        className={styles.input}
                                        inputMode="numeric"
                                        value={form.personas}
                                        onChange={set("personas")}
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label
                                    className={styles.label}
                                    htmlFor="res-mensaje"
                                >
                                    Mensaje (opcional)
                                </label>
                                <textarea
                                    id="res-mensaje"
                                    className={styles.textarea}
                                    value={form.mensaje}
                                    onChange={set("mensaje")}
                                />
                            </div>

                            <p className={styles.disclaimer}>
                                Al enviar se abre WhatsApp con tu mensaje ya
                                redactado para confirmar con Shirley.
                            </p>

                            <button
                                type="submit"
                                className={`btn btn--terracotta ${styles.submit}`}
                                disabled={!phone}
                            >
                                Enviar por WhatsApp
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Experiencias;
