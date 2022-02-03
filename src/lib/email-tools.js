import sgMail from "@sendgrid/mail";

import { getPDFReadableStream } from "./pdf-tools.js";

sgMail.setApiKey(process.env.SENDGRID_KEY);

export const sendNewBlog = async (newBlog) => {
  try {
    const data = await getPDFReadableStream(newBlog, true);

    const msg = {
      to: newBlog.email,
      from: process.env.SENDGRID_EMAIL,
      subject: "New Post",
      text: "you created a new post",
      attachments: [
        {
          content: data.toString("base64"),
          filename: `${newBlog.title}.pdf`,
          type: "application/pdf",
          disposition: "attachment",
          content_id: "mytext",
        },
      ],
    };

    const res = await sgMail.send(msg);
  } catch (error) {
    console.log({ errors: error.response.body.errors });
  }
};
