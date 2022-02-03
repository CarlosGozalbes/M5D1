import PdfPrinter from "pdfmake";
import striptags from "striptags";
import axios from "axios";

export const getPDFReadableStream = async (foundBlogPost) => {
  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Italics",
    },
  };

  const printer = new PdfPrinter(fonts);
  let imagePart ={}
   if (foundBlogPost.cover) {
    const response = await axios.get(foundBlogPost.cover, {
      responseType: "arraybuffer",
    });
    const blogCoverURLParts = foundBlogPost.cover.split("/");
    const fileName = blogCoverURLParts[blogCoverURLParts.length - 1];
    const [id, extension] = fileName.split(".");
    const base64 = response.data.toString("base64");
    const base64Image = `data:image/${extension};base64,${base64}`;
    imagePart = { image: base64Image, width: 480, height: 300, margin: [0, 0, 0, 40] };
  }
  const docDefinition = {
    content: [
      imagePart,
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
