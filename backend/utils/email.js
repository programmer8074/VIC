import nodemailer from "nodemailer";
import logger from "./logger.js";

const { EMAIL_USER, EMAIL_PASS } = process.env;

const isEmailConfigured = EMAIL_USER && EMAIL_PASS;

let transporter;
if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

/**
 * Send an email.
 * Falls back gracefully (returns false) if credentials are not configured.
 *
 * @param {string} to      - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html    - HTML body
 * @returns {Promise<boolean>} true if sent, false if skipped
 */
export const sendEmail = async (to, subject, html) => {
  if (!isEmailConfigured) {
    logger.warn({ to, event: "email_skipped_no_config" });
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"VisionConnect" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    logger.info({ to, messageId: info.messageId, event: "email_sent" });
    return true;
  } catch (err) {
    logger.error({ to, err: err.message, event: "email_send_failed" });
    throw err;
  }
};
