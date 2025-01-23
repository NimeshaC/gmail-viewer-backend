const Imap = require("imap");
const { simpleParser } = require("mailparser");
const EmailMetadata = require("../models/emailMetaDta");

const fetchEmails = async (user, options = {}) => {
  const imap = new Imap({
    user: user.email,
    xoauth2: user.accessToken,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
  });

  return new Promise((resolve, reject) => {
    imap.once("ready", () => {
      imap.openBox("INBOX", false, (err, box) => {
        if (err) reject(err);

        const fetch = imap.seq.fetch("1:*", {
          bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)"],
          struct: true,
        });

        const emails = [];

        fetch.on("message", (msg) => {
          msg.on("body", (stream) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) reject(err);

              const email = {
                messageId: parsed.messageId,
                subject: parsed.subject,
                sender: parsed.from.text,
                receivedDate: parsed.date,
              };

              await EmailMetadata.create({
                ...email,
                userId: user.id,
              });

              emails.push(email);
            });
          });
        });

        fetch.once("error", (err) => {
          reject(err);
        });

        fetch.once("end", () => {
          imap.end();
          resolve(emails);
        });
      });
    });

    imap.once("error", (err) => {
      reject(err);
    });

    imap.connect();
  });
};

module.exports = { fetchEmails };
