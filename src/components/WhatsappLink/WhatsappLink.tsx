import React from "react";
import { useContactPhone, waLink } from "../../hooks/useContactPhone";

/**
 * "Consultar por WhatsApp" CTA used from the artwork modal. `className` lets the
 * caller apply the surrounding surface's button treatment.
 */
const WhatsAppLink = (props: { title: string; className?: string }) => {
    const phone = useContactPhone();

    const url = waLink(
        phone,
        `Hola, me interesa esta pintura: "${props.title}", ¿está disponible?`
    );

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={props.className}
        >
            Consultar por WhatsApp
        </a>
    );
};

export default WhatsAppLink;
