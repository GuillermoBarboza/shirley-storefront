import React from "react";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import Experiencias from "./Experiencias";
import { ExperiencesPage } from "../types/experience";

jest.mock("axios", () => ({
    __esModule: true,
    default: { get: jest.fn() },
}));

const PAGE: ExperiencesPage = {
    intro: {
        eyebrow: "Además de la pintura",
        title: "Experiencias",
        lede: "Dos maneras de conocer a Shirley.",
    },
    experiences: [
        {
            _id: "a",
            kicker: "Experiencia sensorial",
            title: "Ritual del Mate",
            quote: "El mate es una forma de estar.",
            place: "Ciudad Vieja",
            description: "",
            steps: ["1. Origen", "2. Yerbas"],
            note: "Incluye bizcochos.",
            accent: "olive",
            visible: true,
        },
        {
            _id: "b",
            kicker: "Recorrido guiado",
            title: "Recorridos Murales",
            quote: "Amo mi ciudad.",
            place: "A pie",
            description: "Un paseo entre murales.",
            steps: [],
            note: "",
            accent: "gold",
            visible: true,
        },
        {
            _id: "c",
            kicker: "",
            title: "Taller Desnudo",
            quote: "",
            place: "",
            description: "",
            steps: [],
            note: "",
            accent: "gold",
            visible: true,
        },
    ],
};

// Experiencias fetches its content and the contact phone on mount. CRA resets
// mocks before each test, so the implementation is reapplied here.
const serve = (experiences: Promise<unknown>) =>
    (axios.get as jest.Mock).mockImplementation((url: string) =>
        url.includes("experiences")
            ? experiences
            : Promise.resolve({ data: { phoneNumber: "+59899000000" } })
    );

beforeEach(() => serve(Promise.resolve({ data: PAGE })));

const renderPage = async () => {
    render(
        <MemoryRouter>
            <Experiencias />
        </MemoryRouter>
    );
    await act(async () => undefined);
};

const sectionOf = (title: string) =>
    screen.getByRole("heading", { name: title }).closest("section")!;

describe("Experiencias", () => {
    it("renders the intro from data", async () => {
        await renderPage();
        expect(screen.getByText("Además de la pintura")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { level: 1, name: "Experiencias" })
        ).toBeInTheDocument();
        expect(
            screen.getByText("Dos maneras de conocer a Shirley.")
        ).toBeInTheDocument();
    });

    it("renders experiences in order with alternating sides", async () => {
        await renderPage();
        const titles = screen
            .getAllByRole("heading", { level: 2 })
            .map((h) => h.textContent);
        expect(titles).toEqual([
            "Ritual del Mate",
            "Recorridos Murales",
            "Taller Desnudo",
        ]);
        expect(sectionOf("Ritual del Mate")).not.toHaveClass("reverse");
        expect(sectionOf("Recorridos Murales")).toHaveClass("reverse");
        expect(sectionOf("Taller Desnudo")).toHaveClass("sectionLast");
        expect(sectionOf("Ritual del Mate")).not.toHaveClass("sectionLast");
    });

    it("wraps the quote in guillemets", async () => {
        await renderPage();
        expect(
            screen.getByText("«El mate es una forma de estar.»")
        ).toBeInTheDocument();
    });

    it("renders steps and note only where present", async () => {
        await renderPage();
        const mate = within(sectionOf("Ritual del Mate"));
        expect(mate.getAllByRole("listitem").map((li) => li.textContent)).toEqual(
            ["1. Origen", "2. Yerbas"]
        );
        expect(mate.getByText("Incluye bizcochos.")).toBeInTheDocument();
        expect(
            within(sectionOf("Recorridos Murales")).getByText(
                "Un paseo entre murales."
            )
        ).toBeInTheDocument();
    });

    it("omits empty optional parts", async () => {
        await renderPage();
        const bare = sectionOf("Taller Desnudo");
        expect(bare.textContent).not.toContain("«");
        expect(bare.querySelector("ul")).toBeNull();
        for (const cls of ["kicker", "quote", "place", "body", "note"]) {
            expect(bare.querySelector(`.${cls}`)).toBeNull();
        }
    });

    it("uses the accent for the button", async () => {
        await renderPage();
        const button = (title: string) =>
            within(sectionOf(title)).getByRole("button", {
                name: "Reservar mi lugar",
            });
        expect(button("Ritual del Mate")).toHaveClass("btn--olive");
        expect(button("Recorridos Murales")).not.toHaveClass("btn--olive");
    });

    it("shows the intro alone when there are no experiences", async () => {
        serve(Promise.resolve({ data: { ...PAGE, experiences: [] } }));
        await renderPage();
        expect(screen.getByText("Además de la pintura")).toBeInTheDocument();
        expect(screen.queryByText("Reservar mi lugar")).toBeNull();
    });

    it("shows an error panel when the API fails", async () => {
        jest.spyOn(console, "error").mockImplementation(() => undefined);
        serve(Promise.reject(new Error("down")));
        await renderPage();
        expect(
            screen.getByText(/No pudimos cargar las experiencias/)
        ).toBeInTheDocument();
    });

    it("shows the error panel when the response is not a page", async () => {
        serve(Promise.resolve({ data: "<!doctype html><html></html>" }));
        await renderPage();
        expect(
            screen.getByText(/No pudimos cargar las experiencias/)
        ).toBeInTheDocument();
    });

    it("shows the error panel without fetching when the endpoint is unset", async () => {
        const saved = process.env.REACT_APP_API_EXPERIENCES_ENDPOINT;
        delete process.env.REACT_APP_API_EXPERIENCES_ENDPOINT;
        try {
            await renderPage();
            expect(
                screen.getByText(/No pudimos cargar las experiencias/)
            ).toBeInTheDocument();
            const urls = (axios.get as jest.Mock).mock.calls.map((c) => c[0]);
            expect(urls.some((u: string) => u.includes("undefined"))).toBe(
                false
            );
        } finally {
            process.env.REACT_APP_API_EXPERIENCES_ENDPOINT = saved;
        }
    });

    it("treats whitespace-only fields as empty", async () => {
        serve(
            Promise.resolve({
                data: {
                    ...PAGE,
                    experiences: [
                        {
                            ...PAGE.experiences[2],
                            kicker: " ",
                            quote: "   ",
                            place: " ",
                            note: "  ",
                            description: " ",
                        },
                    ],
                },
            })
        );
        await renderPage();
        const bare = sectionOf("Taller Desnudo");
        expect(bare.textContent).not.toContain("«");
        for (const cls of ["kicker", "quote", "place", "body", "note"]) {
            expect(bare.querySelector(`.${cls}`)).toBeNull();
        }
    });

    it("opens WhatsApp with the experience title", async () => {
        const open = jest.spyOn(window, "open").mockImplementation(() => null);
        await renderPage();
        fireEvent.click(
            within(sectionOf("Recorridos Murales")).getByRole("button", {
                name: "Reservar mi lugar",
            })
        );
        fireEvent.click(
            screen.getByRole("button", { name: "Enviar por WhatsApp" })
        );
        const url = open.mock.calls[0][0] as string;
        expect(decodeURIComponent(url)).toContain(
            "Quiero reservar «Recorridos Murales»"
        );
    });
});
