export const convertToUrl = (title: string) => {
    //also remove "ñ" and accents and " and other special characters
    return title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/á/g, "a")
        .replace(/é/g, "e")
        .replace(/í/g, "i")
        .replace(/ó/g, "o")
        .replace(/ú/g, "u")
        .replace(/ñ/g, "n")
        .replace(/[^a-zA-Z0-9-]/g, "");
};
