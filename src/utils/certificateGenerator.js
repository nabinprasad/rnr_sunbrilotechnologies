import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// Template-wise settings
const TEMPLATE_CONFIG = {
    "/certificates/template1.pdf": {
        y: 215,
        fontSize: 42,
        color: rgb(0.1, 0.2, 0.45),
        qr: { x: 80, y: 70, size: 60 }
    },

    // Image 1 (gold template)
    "/certificates/template2.pdf": {
        y: 310,
        fontSize: 52,
        color: rgb(0.78, 0.58, 0.15),
        qr: { x: 90, y: 80, size: 90 }
    },

    // Image 2 (blue template)
    "/certificates/template3.pdf": {
        y: 290,
        fontSize: 46,
        color: rgb(0.1, 0.25, 0.5),
        qr: { y: 80, size: 90 }
    },
};

export const generateCertificate = async (templatePath, employeeName, certificateId, download = true) => {
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
        const { width, height } = page.getSize();

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

        // Add verification QR Code if certificateId is provided
        if (certificateId && config.qr) {
            const verificationUrl = `${window.location.origin}/verify-certificate/${certificateId}`;
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;
            try {
                const qrImageBytes = await fetch(qrApiUrl).then((res) => res.arrayBuffer());
                const qrImage = await pdfDoc.embedPng(qrImageBytes);

                const qrSize = config.qr.size;
                // Center the QR Code horizontally to overlay the template's placeholder QR
                page.drawImage(qrImage, {
                    x: (width - qrSize) / 2,
                    y: config.qr.y,
                    width: qrSize,
                    height: qrSize,
                });
            } catch (qrErr) {
                console.log("Failed to load or embed QR code image", qrErr);
            }
        }

        const pdfBytes = await pdfDoc.save();

        const blob = new Blob([pdfBytes], {
            type: "application/pdf",
        });

        const url = URL.createObjectURL(blob);

        if (download) {
            const link = document.createElement("a");
            link.href = url;
            link.download = `${employeeName}_certificate.pdf`;
            link.click();
        }

        return url;
    } catch (error) {
        console.log("Certificate Error:", error);
    }
};