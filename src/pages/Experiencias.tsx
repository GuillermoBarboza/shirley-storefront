import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout/Layout";
import styles from "./Experiencias.module.css";
import PhotoSlot from "../components/PhotoSlot/PhotoSlot";
import { useContactPhone, waLink } from "../hooks/useContactPhone";
import { useExperiences } from "../hooks/useExperiences";
import { Experience } from "../types/experience";
import {
    ReservationForm,
    EMPTY_FORM,
    buildReservationMessage,
} from "../utils/reservation";

const Experiencias: React.FC = () => {
    const { status, page } = useExperiences();
    const [booking, setBooking] = useState<Experience | null>(null);
    const [form, setForm] = useState<ReservationForm>(EMPTY_FORM);
    const phone = useContactPhone();

    const open = (experience: Experience) => {
        setForm(EMPTY_FORM);
        setBooking(experience);
    };

    const close = () => setBooking(null);

    // Lock the page behind the dialog and wire Escape to close it.
    useEffect(() => {
        if (!booking) return;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", onKey);
        };
    }, [booking]);

    const set = (key: keyof ReservationForm) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!booking) return;
        window.open(
            waLink(phone, buildReservationMessage(booking.title, form)),
            "_blank",
            "noopener,noreferrer"
        );
        close();
    };

    const experiences = page?.experiences ?? [];

    const renderSection = (experience: Experience, index: number) => {
        const reversed = index % 2 === 1;
        const last = index === experiences.length - 1;
        const olive = experience.accent === "olive";

        const photo = (
            <PhotoSlot
                className={styles.photo}
                src={experience.photoWebUrl || experience.photoUrl || undefined}
                alt={experience.title}
                placeholder={`foto de ${experience.title}`}
            />
        );

        const copy = (
            <div className={styles.copy}>
                {experience.kicker.trim() && (
                    <div
                        className={`${styles.kicker} ${
                            olive ? styles.kickerOlive : styles.kickerGold
                        }`}
                    >
                        {experience.kicker}
                    </div>
                )}
                <h2 className={styles.title}>{experience.title}</h2>
                {experience.quote.trim() && (
                    <p className={styles.quote}>
                        «{experience.quote.trim()}»
                    </p>
                )}
                {experience.place.trim() && (
                    <div className={styles.place}>{experience.place}</div>
                )}
                {experience.description.trim() && (
                    <p className={styles.body}>{experience.description}</p>
                )}
                {experience.steps.length > 0 && (
                    <ul className={styles.steps}>
                        {experience.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                        ))}
                    </ul>
                )}
                {experience.note.trim() && (
                    <p className={styles.note}>{experience.note}</p>
                )}
                <button
                    className={olive ? "btn btn--olive" : "btn"}
                    onClick={() => open(experience)}
                >
                    Reservar mi lugar
                </button>
            </div>
        );

        // Odd sections keep the markup the hardcoded murales section had:
        // copy first in the DOM plus `reverse`, which the CSS reorders.
        return (
            <section
                key={experience._id ?? index}
                className={[
                    styles.section,
                    last ? styles.sectionLast : "",
                    reversed ? styles.reverse : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                {reversed ? (
                    <>
                        {copy}
                        {photo}
                    </>
                ) : (
                    <>
                        {photo}
                        {copy}
                    </>
                )}
            </section>
        );
    };

    return (
        <Layout>
            {status === "error" ? (
                <div className={styles.errorPanel}>
                    <div className={styles.errorTitle}>
                        No pudimos cargar las experiencias.
                    </div>
                    <div className={styles.errorBody}>
                        Hubo un problema de conexión con el servidor. Intentá
                        de nuevo en unos minutos.
                    </div>
                </div>
            ) : status === "loading" ? (
                <div className={styles.loading}>Cargando…</div>
            ) : (
                page && (
                    <>
                        <section className={styles.intro}>
                            <div className={styles.eyebrow}>
                                {page.intro.eyebrow}
                            </div>
                            <h1 className={styles.pageTitle}>
                                {page.intro.title}
                            </h1>
                            <p className={styles.lede}>{page.intro.lede}</p>
                        </section>

                        {experiences.map(renderSection)}
                    </>
                )
            )}

            {booking && (
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
                        aria-label={`Reservar ${booking.title}`}
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
                            {booking.title}
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
