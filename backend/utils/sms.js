import twilio from "twilio";
import logger from "./logger.js";

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } =
  process.env;

const isTwilioConfigured =
  TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER;

let client;
if (isTwilioConfigured) {
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

/**
 * Send an SMS message.
 * Falls back gracefully if Twilio is not configured (dev mode).
 *
 * @param {string} to   - E.164 phone number, e.g. "+918074296677"
 * @param {string} body - Message text
 * @returns {Promise<boolean>} true if sent via Twilio, false if skipped
 */
export const sendSms = async (to, body) => {
  if (!isTwilioConfigured) {
    logger.warn({ to, event: "sms_skipped_no_twilio_config" });
    return false;
  }

  try {
    const message = await client.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
      to,
    });
    logger.info({ to, sid: message.sid, event: "sms_sent" });
    return true;
  } catch (err) {
    logger.error({ to, err: err.message, event: "sms_send_failed" });
    throw err;
  }
};
