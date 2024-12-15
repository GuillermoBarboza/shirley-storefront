import React, { useEffect, useState } from "react";
import axios from "axios";

const WhatsAppLink = (props: { title: string }) => {
    const [phoneNumber, setPhoneNumber] = useState("");

    useEffect(() => {
        const fetchPhoneNumber = async () => {
            try {
                const response = await axios.get(
                    process.env.REACT_APP_API_CONTACT_INFO_ENDPOINT + "/"
                );
                setPhoneNumber(response.data.phoneNumber);
            } catch (error) {
                console.error("Error fetching phone number:", error);
            }
        };

        fetchPhoneNumber();
    }, []);

    const message = encodeURIComponent(
        `Hola, me interesa esta pintura: "${props.title}", esta disponible?`
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Contact Us on WhatsApp
        </a>
    );
};

export default WhatsAppLink;
