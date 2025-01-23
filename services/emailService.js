const { google } = require("googleapis");
const EmailMetadata = require("../models/emailMetaDta");

const fetchEmails = async (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 100,
    });

    const emails = [];

    for (const message of response.data.messages) {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
      });

      const headers = msg.data.payload.headers;
      const email = {
        messageId: message.id,
        subject:
          headers.find((h) => h.name === "Subject")?.value || "No Subject",
        sender:
          headers.find((h) => h.name === "From")?.value || "Unknown Sender",
        receivedDate:
          headers.find((h) => h.name === "Date")?.value || new Date(),
      };

      await EmailMetadata.create({
        ...email,
        userId: user.id,
      });

      emails.push(email);
    }

    return emails;
  } catch (error) {
    console.error("Email sync error:", error);
    throw error;
  }
};

module.exports = { fetchEmails };
