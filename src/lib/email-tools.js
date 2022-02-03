import sgMail from '@sendgrid/mail'
import { text } from 'stream/consumers'

sgMail.setApiKey(process.env.SENDGRID_KEY)

export const sendNewBlog = async (recipientAddress) => {
    const msg = {
        to: recipientAddress,
        from: process.env.SENDER_EMAIL,
        subject:'New Post',
        text: 'you created a new post'
    }

    await sgMail.send(msg)
}