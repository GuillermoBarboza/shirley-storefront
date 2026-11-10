import { useEffect, useState } from "react";
import axios from "axios";
import { ExperiencesPage } from "../types/experience";

type Status = "loading" | "ready" | "error";

/** Rejects anything that isn't page-shaped, e.g. an HTML fallback page. */
const isPage = (data: unknown): data is ExperiencesPage => {
    const d = data as ExperiencesPage | null;
    return (
        !!d &&
        typeof d === "object" &&
        typeof d.intro === "object" &&
        d.intro !== null &&
        Array.isArray(d.experiences)
    );
};

/**
 * The /experiencias content. Fetched per mount rather than cached like the
 * contact phone: Shirley edits it from the admin and a visitor should see the
 * current version on the next visit.
 */
export const useExperiences = (): {
    status: Status;
    page: ExperiencesPage | null;
} => {
    const [status, setStatus] = useState<Status>("loading");
    const [page, setPage] = useState<ExperiencesPage | null>(null);

    useEffect(() => {
        // Same guard as /galeria: an unset endpoint would request
        // "/undefined/", which a static host answers with index.html.
        const endpoint = process.env.REACT_APP_API_EXPERIENCES_ENDPOINT;
        if (!endpoint) {
            console.error("REACT_APP_API_EXPERIENCES_ENDPOINT is not set");
            setStatus("error");
            return;
        }

        let alive = true;
        axios
            .get(endpoint + "/")
            .then((res) => {
                if (!alive) return;
                if (!isPage(res.data)) {
                    console.error("Unexpected experiences response");
                    setStatus("error");
                    return;
                }
                setPage(res.data);
                setStatus("ready");
            })
            .catch((error) => {
                console.error("Error fetching experiences:", error);
                if (alive) setStatus("error");
            });
        return () => {
            alive = false;
        };
    }, []);

    return { status, page };
};
