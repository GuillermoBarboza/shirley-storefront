import { parseSize, paintingSize } from "./size";

describe("parseSize", () => {
    it.each([
        ["50x40", 50, 40],
        ["80 x70", 80, 70],
        ["28x 30 cm", 28, 30],
        ["25 x29cm", 25, 29],
        ["35 x 35 cm", 35, 35],
        ["28 cm x 30", 28, 30],
        ["50x70cm", 50, 70],
        ["40,5 x 30", 40.5, 30],
        ["50×40", 50, 40],
    ])("parses %s", (s, a, b) => {
        expect(parseSize(s)).toEqual({ a, b });
    });

    it.each(["", "   ", undefined, "grande", "50"])("rejects %p", (s) => {
        expect(parseSize(s as string | undefined)).toBeNull();
    });
});

describe("paintingSize", () => {
    it("puts the long side on the photo's long side (portrait photo)", () => {
        expect(paintingSize("50x40", 1536, 2048)).toEqual({
            w: 0.375,
            h: 0.5,
            approximate: false,
        });
    });

    it("handles a landscape photo", () => {
        expect(paintingSize("40x50", 2000, 1000)).toEqual({
            w: 0.5,
            h: 0.25,
            approximate: false,
        });
    });

    it("never distorts: aspect equals the photo's", () => {
        const s = paintingSize("35x35", 900, 1200);
        expect(s.w / s.h).toBeCloseTo(900 / 1200, 6);
        expect(Math.max(s.w, s.h)).toBeCloseTo(0.35, 6);
    });

    it("is approximate when size is empty", () => {
        expect(paintingSize("", 1000, 800)).toEqual({
            w: 0.6,
            h: 0.48,
            approximate: true,
        });
    });
});
