import React from "react";
import { render, screen, act } from "@testing-library/react";
import axios from "axios";
import App from "./App";

// Home and useContactPhone both fetch on mount. Neither needs to succeed for the
// shell to render, but an unmocked axios throws inside an effect and fails the
// render outright.
jest.mock("axios", () => ({
    __esModule: true,
    default: { get: jest.fn() },
}));

// CRA sets resetMocks: true, which strips the implementation off every mock
// before each test — so it has to be reapplied here, not at mock-factory time.
beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({ data: [] });
});

/**
 * The header renders synchronously, so assertions resolve before the mount
 * fetches do. Draining the microtask queue inside act() lets those setState
 * calls land where React expects them instead of warning after the test ends.
 */
const settleMountEffects = () => act(async () => undefined);

describe("App shell", () => {
    it("renders the wordmark on the home route", async () => {
        render(<App />);
        expect(screen.getAllByText("Shirley Madero").length).toBeGreaterThan(0);
        await settleMountEffects();
    });

    it("renders every top-level nav destination", async () => {
        render(<App />);
        for (const label of ["Inicio", "Galería", "Experiencias"]) {
            expect(screen.getByText(label)).toBeInTheDocument();
        }
        // "Ver en tu pared" replaced the 3D room.
        expect(screen.queryByText("Sala Virtual")).toBeNull();
        await settleMountEffects();
    });

    it("redirects /virtual-gallery to /galeria", async () => {
        window.history.pushState({}, "", "/virtual-gallery");
        render(<App />);
        expect(await screen.findByText("Obras de arte")).toBeInTheDocument();
        expect(window.location.pathname).toBe("/galeria");
        window.history.pushState({}, "", "/");
        await settleMountEffects();
    });
});
