import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// Template-wise settings
const TEMPLATE_CONFIG = {
    "/certificates/template1.pdf": {
        y: 215,
        fontSize: 42,
        color: rgb(0.1, 0.2, 0.45),
    },

    // Image 1 (gold template)
    "/certificates/template2.pdf": {
        y: 310,
        fontSize: 52,
        color: rgb(0.78, 0.58, 0.15),
    },

    // Image 2 (blue template)
    "/certificates/template3.pdf": {
        y: 290,
        fontSize: 46,
        color: rgb(0.1, 0.25, 0.5),
    },
};

export const generateCertificate = async (templatePath, employeeName) => {
    try {
        const existingPdfBytes = await fetch(templatePath).then((res) =>
            res.arrayBuffer()
        );

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        pdfDoc.registerFontkit(fontkit);

        const fontBytes = await fetch("/fonts/AlexBrush-Regular.ttf").then((res) =>
            res.arrayBuffer()
        );

        const customFont = await pdfDoc.embedFont(fontBytes);

        const page = pdfDoc.getPages()[0];
        const { width } = page.getSize();

        const config = TEMPLATE_CONFIG[templatePath];

        if (!config) {
            throw new Error("Template config not found");
        }

        let fontSize = config.fontSize;

        // Auto reduce font size for long names
        if (employeeName.length > 20) fontSize -= 6;
        if (employeeName.length > 28) fontSize -= 10;

        const textWidth = customFont.widthOfTextAtSize(
            employeeName,
            fontSize
        );

        page.drawText(employeeName, {
            x: (width - textWidth) / 2,
            y: config.y,
            size: fontSize,
            font: customFont,
            color: config.color,
        });

        const pdfBytes = await pdfDoc.save();

        const blob = new Blob([pdfBytes], {
            type: "application/pdf",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${employeeName}_certificate.pdf`;
        link.click();
    } catch (error) {
        console.log("Certificate Error:", error);
    }
};