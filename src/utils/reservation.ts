export interface ReservationForm {
    nombre: string;
    fecha: string;
    personas: string;
    mensaje: string;
}

export const EMPTY_FORM: ReservationForm = {
    nombre: "",
    fecha: "",
    personas: "",
    mensaje: "",
};

/** The prewritten WhatsApp message for booking an experience. */
export const buildReservationMessage = (
    title: string,
    form: ReservationForm
): string => {
    let msg = `¡Hola Shirley! Quiero reservar «${title}».`;
    if (form.nombre) msg += ` Mi nombre es ${form.nombre}.`;
    if (form.personas) msg += ` Somos ${form.personas} persona(s).`;
    if (form.fecha) msg += ` Fecha preferida: ${form.fecha}.`;
    if (form.mensaje) msg += ` ${form.mensaje}`;
    return msg;
};
