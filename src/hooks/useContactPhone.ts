import { useEffect, useState } from "react";
import axios from "axios";

interface ContactInfo {
    phoneNumber: string;
    /** Admin switch for "Ver en tu pared"; on unless explicitly turned off. */
    wallViewEnabled: boolean;
}

/**
 * The contact-info singleton changes about never, but it is needed by the
 * modal, the home CTA and both reservation flows. Cache the request at module
 * level so a session makes one call rather than one per mount.
 */
let cached: Promise<ContactInfo> | null = null;

const fetchContactInfo = (): Promise<ContactInfo> => {
    if (!cached) {
        cached = axios
            .get(process.env.REACT_APP_API_CONTACT_INFO_ENDPOINT + "/")
            .then((res) => ({
                phoneNumber: res.data?.phoneNumber ?? "",
                wallViewEnabled: res.data?.wallViewEnabled !== false,
            }))
            .catch((error) => {
                console.error("Error fetching phone number:", error);
                cached = null; // let a later mount retry
                return { phoneNumber: "", wallViewEnabled: true };
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

const useContactInfo = <T,>(pick: (info: ContactInfo) => T, initial: T): T => {
    const [value, setValue] = useState<T>(initial);

    useEffect(() => {
        let alive = true;
        fetchContactInfo().then((info) => {
            if (alive) setValue(pick(info));
        });
        return () => {
            alive = false;
        };
        // `pick` is a fixed field reader per hook below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return value;
};

export const useContactPhone = (): string =>
    useContactInfo((info) => info.phoneNumber, "");

/**
 * Whether "Ver en tu pared" is switched on in the admin; null until known so
 * the entry never flashes in and out. A failed request counts as on — the
 * feature itself doesn't need the API.
 */
export const useWallViewEnabled = (): boolean | null =>
    useContactInfo<boolean | null>((info) => info.wallViewEnabled, null);

/** Builds a wa.me deep link with a prewritten message. */
export const waLink = (phone: string, message: string): string =>
    `https://wa.me/${toWaNumber(phone)}?text=${encodeURIComponent(message)}`;
