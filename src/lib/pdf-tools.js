import PdfPrinter from "pdfmake";

export const getPDFReadableStream = (foundBlogPost) => {
  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Italics",
    },
  };

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
      {
        image: foundBlogPost.cover,
        width: 480,
        height: 300,
      },
      '\n',
      {
        text: foundBlogPost.title,
        style: "header",
      },
      '\n',
      foundBlogPost.content
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
      }
    },
    defaultStyle: {
      font: "Helvetica",
    },
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {});
  pdfReadableStream.end();

  return pdfReadableStream;
};
