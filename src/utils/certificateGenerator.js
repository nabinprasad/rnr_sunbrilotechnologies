import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// Template-wise settings
const TEMPLATE_CONFIG = {
    "/certificates/ABOVE AND BEYOND.pdf": {
        y: 310,
        fontSize: 52,
        color: rgb(0.78, 0.58, 0.15),
       qr: { x: 90, y: 100, size: 70 },
        categoryY: 380,
        contentY: 240,
        contentWidth: 450,
        awardTitleY: 420,
        awardTitleFontSize: 32,
       leftSignature: { x: 170, y: 130, label: "Manager" },
        rightSignature: { x: 690, y: 130, label: "CEO", name: "Sunil Kumar" },
    },

    "/certificates/Employee of the Year.pdf": {
        y: 215,
        fontSize: 42,
        color: rgb(0.1, 0.2, 0.45),
        qr: { x: 80, y: 70, size: 60 },
        categoryY: 280,
        contentY: 160,
        contentWidth: 450,
        awardTitleY: 350,
        awardTitleFontSize: 28,
        leftSignature: { x: 100, y: 80, label: "Manager" },
        rightSignature: { x: 690, y: 80, label: "CEO", name: "Sunil Kumar" },
        
    },

    "/certificates/General.pdf": {
        y: 310,
        fontSize: 52,
        color: rgb(0.78, 0.58, 0.15),
        qr: { x: 90, y: 80, size: 90 },
        categoryY: 380,
        contentY: 240,
        contentWidth: 450,
        awardTitleY: 420,
        awardTitleFontSize: 32,
        leftSignature: { x: 170, y: 90, label: "Manager" },
        rightSignature: { x: 690, y: 80, label: "CEO", name: "Sunil Kumar" },
    },

    "/certificates/Long Service.pdf": {
        y: 290,
        fontSize: 46,
        color: rgb(0.1, 0.25, 0.5),
        qr: { y: 100, size: 70 },
        categoryY: 360,
        contentY: 220,
        contentWidth: 450,
        awardTitleY: 400,
        awardTitleFontSize: 30,
       leftSignature: { x: 120, y: 120, label: "Manager" },
        rightSignature: { x: 690, y: 120,label: "CEO", name: "Sunil Kumar" },
    },

    "/certificates/QUALITY CHAMPION.pdf": {
        y: 310,
        fontSize: 52,
        color: rgb(0.78, 0.58, 0.15),
        qr: { x: 90, y: 100, size: 70 },
        categoryY: 380,
        contentY: 240,
        contentWidth: 450,
        awardTitleY: 420,
        awardTitleFontSize: 32,
        leftSignature: { x: 170, y: 130, label: "Manager" },
        rightSignature: { x: 690, y: 130, label: "CEO", name: "Sunil Kumar" },   
    },

    "/certificates/SPECIAL AWARDS.pdf": {
        y: 310,
        fontSize: 52,
        color: rgb(0.78, 0.58, 0.15),
         qr: { x: 90, y: 100, size: 70 },
        categoryY: 380,
        contentY: 240,
        contentWidth: 450,
        awardTitleY: 420,
        awardTitleFontSize: 32,
        leftSignature: { x: 170, y: 130, label: "Manager" },
        rightSignature: { x: 690, y: 130, label: "CEO", name: "Sunil Kumar" },       
    },

    "/certificates/TECHNICAL STEWARDSHIP.pdf": {
        y: 310,
        fontSize: 52,
        color: rgb(0.78, 0.58, 0.15),
        qr: { x: 90, y: 100, size: 70 },
        categoryY: 380,
        contentY: 240,
        contentWidth: 450,
        awardTitleY: 420,
        awardTitleFontSize: 32,
        leftSignature: { x: 170, y: 130, label: "Manager" },
        rightSignature: { x: 690, y: 130, label: "CEO", name: "Sunil Kumar" },           
    },
};

const wrapText = (text, font, fontSize, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = font.widthOfTextAtSize(currentLine + ' ' + word, fontSize);
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
};

export const generateCertificate = async (templatePath, employeeName, certificateId, category, content, awardTitle = null, leftSignatureName = null, download = true) => {
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
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

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

        // Draw award title
        if (awardTitle && awardTitle !== "Quality Champion" && config.awardTitleY && config.awardTitleFontSize) {
            const awardTitleWidth = helveticaFont.widthOfTextAtSize(awardTitle, config.awardTitleFontSize);
            page.drawText(awardTitle, {
                x: (width - awardTitleWidth) / 2,
                y: config.awardTitleY,
                size: config.awardTitleFontSize,
                font: helveticaFont,
                color: config.color,
            });
        }

        // Draw category
        if (category) {
            const categoryFontSize = 18;
            const categoryWidth = helveticaFont.widthOfTextAtSize(category, categoryFontSize);
            page.drawText(category, {
                x: (width - categoryWidth) / 2,
                y: config.categoryY,
                size: categoryFontSize,
                font: helveticaFont,
                color: config.color,
            });
        }

        // Draw content
        if (content) {
            const contentFontSize = 12;
            const lineHeight = 16;
            const wrappedLines = wrapText(content, helveticaFont, contentFontSize, config.contentWidth);
            
            let currentY = config.contentY;
            wrappedLines.reverse().forEach(line => {
                const lineWidth = helveticaFont.widthOfTextAtSize(line, contentFontSize);
                page.drawText(line, {
                    x: (width - lineWidth) / 2,
                    y: currentY,
                    size: contentFontSize,
                    font: helveticaFont,
                    color: rgb(0.2, 0.2, 0.2),
                });
                currentY += lineHeight;
            });
        }

        // Draw signatures
        if (config.leftSignature) {
            // Draw horizontal line above the name
            if (leftSignatureName) {
                page.drawLine({
                    start: { x: config.leftSignature.x - 50, y: config.leftSignature.y + 15 },
                    end: { x: config.leftSignature.x + 100, y: config.leftSignature.y + 15 },
                    thickness: 1,
                    color: config.color,
                });

                // Draw Name
                page.drawText(leftSignatureName, {
                    x: config.leftSignature.x,
                    y: config.leftSignature.y,
                    size: 12,
                    font: helveticaFont,
                    color: config.color,
                });
            }

            // Draw Label below the name
            if (config.leftSignature.label) {
                page.drawText(config.leftSignature.label, {
                    x: config.leftSignature.x - -9, // adjust alignment
                    y: config.leftSignature.y - 18, // below the name
                    size: 10,
                    font: helveticaFont,
                    color: config.color,
                });
            }
        }

      if (config.rightSignature) {
          // Draw horizontal line above the name
          if (config.rightSignature.name) {
              page.drawLine({
                  start: { x: config.rightSignature.x - 50, y: config.rightSignature.y + 15 },
                  end: { x: config.rightSignature.x + 100, y: config.rightSignature.y + 15 },
                  thickness: 1,
                  color: config.color,
              });
          }

          // Draw Name
          if (config.rightSignature.name) {
              page.drawText(config.rightSignature.name, {
                  x: config.rightSignature.x,
                  y: config.rightSignature.y,
                  size: 12,
                  font: helveticaFont,
                  color: config.color,
              });
          }

          // Draw Label below the name
          if (config.rightSignature.label) {
              page.drawText(config.rightSignature.label, {
                  x: config.rightSignature.x - -14, // adjust alignment
                  y: config.rightSignature.y - 18, // below the name
                  size: 10,
                  font: helveticaFont,
                  color: config.color,
              });
          }
}

        
        

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
            const link = document.createElement('a');
            link.href = url;
            link.download = `${employeeName}_certificate.pdf`;
            link.click();
        }

        return url;
    } catch (error) {
        console.log("Certificate Error:", error);
    }
};