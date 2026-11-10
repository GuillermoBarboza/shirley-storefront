/**
 * Shape served by GET /api/experiences. Mirrors the backend's ExperiencesPage
 * model and the admin's types — there is no shared types package, so keep the
 * three in step.
 */

export type Accent = "olive" | "gold";

export interface Experience {
    _id?: string;
    kicker: string;
    title: string;
    /** Her words, stored without «» — rendering adds them. */
    quote: string;
    place: string;
    description: string;
    steps: string[];
    note: string;
    accent: Accent;
    visible: boolean;
    photoUrl?: string | null;
    photoWebUrl?: string | null;
}

export interface ExperiencesIntro {
    eyebrow: string;
    title: string;
    lede: string;
}

export interface ExperiencesPage {
    intro: ExperiencesIntro;
    experiences: Experience[];
}
