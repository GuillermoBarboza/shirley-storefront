import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import WallEntry from "./WallEntry";
import { useWallMode } from "../../hooks/useWallMode";
import { wallLink } from "../../wall/link";
import { Artwork } from "../../types/artwork";
import { startWallView } from "../WallView/WallView";

jest.mock("../../hooks/useWallMode", () => ({ useWallMode: jest.fn() }));
jest.mock("qrcode", () => ({
    __esModule: true,
    default: { toDataURL: jest.fn() },
    toDataURL: jest.fn(),
}));
// The AR module is three.js + WebXR; it is only ever loaded lazily.
jest.mock("../WallView/WallView", () => ({ startWallView: jest.fn() }));

const ARTWORK = {
    _id: "a2",
    title: 'Serie "Las Oswaldas"',
    url: "https://img/x.jpg",
    size: "50x40",
} as Artwork;

const mode = (m: string | null) => (useWallMode as jest.Mock).mockReturnValue(m);

beforeEach(async () => {
    const qr = await import("qrcode");
    (qr.toDataURL as jest.Mock).mockResolvedValue("data:image/png;base64,QR");
    ((qr as any).default.toDataURL as jest.Mock).mockResolvedValue("data:image/png;base64,QR");
});

const settle = () => act(async () => undefined);

describe("WallEntry", () => {
    it("renders nothing while checking", () => {
        mode(null);
        const { container } = render(<WallEntry artwork={ARTWORK} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("shows the AR button on AR phones", async () => {
        mode("ar");
        render(<WallEntry artwork={ARTWORK} />);
        await settle();
        expect(screen.getByRole("button", { name: "Ver en tu pared" })).toBeInTheDocument();
    });

    it("tells the visitor when the camera can't open", async () => {
        mode("ar");
        jest.spyOn(console, "error").mockImplementation(() => undefined);
        (startWallView as jest.Mock).mockRejectedValue(new Error("NotAllowedError"));
        render(<WallEntry artwork={ARTWORK} />);
        await settle();
        fireEvent.click(screen.getByRole("button", { name: "Ver en tu pared" }));
        await settle();
        expect(
            screen.getByText("No pudimos abrir la cámara. Revisá los permisos del navegador.")
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Ver en tu pared" })).toBeEnabled();
    });

    it("shows the Android note on iPhone", () => {
        mode("iphone");
        render(<WallEntry artwork={ARTWORK} />);
        expect(screen.getByText("Por ahora, ver en tu pared funciona en Android.")).toBeInTheDocument();
        expect(screen.queryByRole("button")).toBeNull();
    });

    it("offers copy link on phones without AR", async () => {
        mode("phone-no-ar");
        const writeText = jest.fn().mockResolvedValue(undefined);
        Object.assign(navigator, { clipboard: { writeText } });
        render(<WallEntry artwork={ARTWORK} />);
        expect(screen.getByText(/abrí esta página en Chrome/)).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Copiar enlace" }));
        await settle();
        expect(writeText).toHaveBeenCalledWith(wallLink(ARTWORK, window.location.origin));
        expect(screen.getByRole("button", { name: "Enlace copiado" })).toBeInTheDocument();
    });

    it("shows a QR on desktop", async () => {
        mode("desktop");
        render(<WallEntry artwork={ARTWORK} />);
        await settle();
        expect(screen.getByText("¿Querés verlo en tu pared? Abrilo en tu celular")).toBeInTheDocument();
        expect(screen.getByRole("img", { name: /código QR/i })).toHaveAttribute("src", "data:image/png;base64,QR");
    });

    it("labels approximate sizes", async () => {
        mode("desktop");
        render(<WallEntry artwork={{ ...ARTWORK, size: "" }} />);
        await settle();
        expect(screen.getByText("Tamaño aproximado")).toBeInTheDocument();
    });

    it("does not label works with a size", async () => {
        mode("ar");
        render(<WallEntry artwork={ARTWORK} />);
        await settle();
        expect(screen.queryByText("Tamaño aproximado")).toBeNull();
    });
});
