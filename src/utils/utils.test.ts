import { convertToUrl } from "./utils";

/**
 * These slugs are the hash half of every shared /galeria#<slug> link, so the
 * outputs below are a compatibility contract, not just current behaviour.
 * Changing them silently breaks links that are already out in the world.
 * `tools/check-deeplink.mjs` keeps its own copy of this function in sync.
 */
describe("convertToUrl", () => {
    it("lowercases and joins words with dashes", () => {
        expect(convertToUrl("Hojas en el pelo")).toBe("hojas-en-el-pelo");
    });

    it("folds Spanish accents and ñ", () => {
        expect(convertToUrl("Niña con pañuelo")).toBe("nina-con-panuelo");
    });

    it("folds accents that only appear once lowercased", () => {
        expect(convertToUrl("Óleo sobre tela")).toBe("oleo-sobre-tela");
    });

    it("strips quotes, matching the real 'Serie \"Baldomero\"' record", () => {
        expect(convertToUrl('Serie "Baldomero"')).toBe("serie-baldomero");
    });

    it("drops characters with no ASCII equivalent rather than transliterating", () => {
        expect(convertToUrl("Retrato Nº 5")).toBe("retrato-n-5");
    });

    it("returns an empty slug for an untitled artwork", () => {
        // At least one live record has an empty title; it simply has no deep link.
        expect(convertToUrl("")).toBe("");
    });
});
