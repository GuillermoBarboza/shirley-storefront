import { buildReservationMessage, EMPTY_FORM } from "./reservation";

describe("buildReservationMessage", () => {
    it("names the experience by title", () => {
        expect(buildReservationMessage("Ritual del Mate", EMPTY_FORM)).toBe(
            "¡Hola Shirley! Quiero reservar «Ritual del Mate»."
        );
    });

    it("appends only the parts that were filled in, in order", () => {
        expect(
            buildReservationMessage("Recorridos Murales", {
                nombre: "Ana",
                fecha: "20 de agosto",
                personas: "3",
                mensaje: "Gracias",
            })
        ).toBe(
            "¡Hola Shirley! Quiero reservar «Recorridos Murales». Mi nombre es Ana. Somos 3 persona(s). Fecha preferida: 20 de agosto. Gracias"
        );
    });
});
