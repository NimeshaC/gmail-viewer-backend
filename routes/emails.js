const express = require("express");
const router = express.Router();
const { fetchEmails } = require("../services/emailService");
const EmailMetadata = require("../models/emailMetaDta");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const emails = await EmailMetadata.findAndCountAll({
      where: { userId: req.user.id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["receivedDate", "DESC"]],
    });

    res.json({
      emails: emails.rows,
      total: emails.count,
      currentPage: page,
      totalPages: Math.ceil(emails.count / limit),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch emails", error: error.message });
  }
});

router.get("/sync", authMiddleware, async (req, res) => {
  try {
    const emails = await fetchEmails(req.user);
    res.json({ message: "Emails synced successfully", count: emails.length });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to sync emails", error: error.message });
  }
});

module.exports = router;
