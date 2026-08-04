import { useEffect, useState } from "react";
import axios from "axios";

/**
 * The contact number is a singleton document that changes about never, but it is
 * needed by the modal, the home CTA and both reservation flows. Cache the request
 * at module level so a session makes one call rather than one per mount.
 */
let cached: Promise<string> | null = null;

const fetchPhone = (): Promise<string> => {
    if (!cached) {
        cached = axios
            .get(process.env.REACT_APP_API_CONTACT_INFO_ENDPOINT + "/")
            .then((res) => res.data?.phoneNumber ?? "")
            .catch((error) => {
                console.error("Error fetching phone number:", error);
                cached = null; // let a later mount retry
                return "";
            });
    }
    return cached;
};

/** Digits only — what wa.me expects. */
export const toWaNumber = (phone: string): string => phone.replace(/\D/g, "");

/** "+59892904603" -> "+598 92 904 603" */
export const formatPhone = (phone: string): string => {
    const digits = toWaNumber(phone);
    if (digits.length === 11 && digits.startsWith("598")) {
        return `+598 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    }
    return phone;
};

export const useContactPhone = (): string => {
    const [phone, setPhone] = useState("");

    useEffect(() => {
        let alive = true;
        fetchPhone().then((p) => {
            if (alive) setPhone(p);
        });
        return () => {
            alive = false;
        };
    }, []);

    return phone;
};

/** Builds a wa.me deep link with a prewritten message. */
export const waLink = (phone: string, message: string): string =>
    `https://wa.me/${toWaNumber(phone)}?text=${encodeURIComponent(message)}`;
