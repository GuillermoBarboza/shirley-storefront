import { wallLink, findDeepLinkIndex, wantsWall } from "./link";
import { convertToUrl } from "../utils/utils";

const works = [
    { _id: "a1", title: 'Serie "Las Oswaldas"' },
    { _id: "a2", title: 'Serie "Las Oswaldas"' },
    { _id: "a3", title: "" },
    { _id: "a4", title: "morisot" },
];

describe("wallLink", () => {
    it("carries the id and the slug", () => {
        expect(wallLink(works[1], "https://x")).toBe(
            `https://x/galeria?pared=1&obra=a2#${convertToUrl(works[1].title)}`
        );
    });

    it("link works for an untitled work", () => {
        expect(wallLink(works[2], "https://x")).toBe("https://x/galeria?pared=1&obra=a3");
    });
});

describe("findDeepLinkIndex", () => {
    const oswaldas = convertToUrl('Serie "Las Oswaldas"');

    it("prefers obra over a duplicated slug", () => {
        expect(findDeepLinkIndex(works, "?pared=1&obra=a2", oswaldas)).toBe(1);
    });

    it("finds an untitled work by obra", () => {
        expect(findDeepLinkIndex(works, "?obra=a3", "")).toBe(2);
    });

    it("falls back to the slug when obra is unknown", () => {
        expect(findDeepLinkIndex(works, "?obra=gone", "morisot")).toBe(3);
    });

    it("plain slug links still work", () => {
        expect(findDeepLinkIndex(works, "", "morisot")).toBe(3);
    });

    it("no match", () => {
        expect(findDeepLinkIndex(works, "?obra=gone", "nada")).toBe(-1);
        expect(findDeepLinkIndex(works, "", "")).toBe(-1);
    });
});

describe("wantsWall", () => {
    it("reads pared=1", () => {
        expect(wantsWall("?pared=1&obra=a1")).toBe(true);
        expect(wantsWall("?obra=a1")).toBe(false);
        expect(wantsWall("")).toBe(false);
    });
});
