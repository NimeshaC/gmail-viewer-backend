const express = require("express");
const router = express.Router();
const { getAuthUrl } = require("../services/googleAuth");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
require("dotenv").config();

router.get("/google/url", (req, res) => {
  const url = getAuthUrl();
  res.json({
    status_code: 200,
    status: "success",
    message: "URL generated successfully",
    data: {
      auth_url: url,
    },
  });
});

router.post("/google/callback", async (req, res) => {
  try {
    const { code } = req.body;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const tokenResponse = await oauth2Client.getToken(code.toString());
    const tokens = tokenResponse.tokens;

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      expiry_date: tokens.expiry_date,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
    });

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    let user = await User.findOne({ where: { email: data.email } });
    if (!user) {
      user = await User.create({
        email: data.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: new Date(tokens.expiry_date),
      });
    } else {
      await user.update({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: new Date(tokens.expiry_date),
      });
    }

    const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({
      status_code: 200,
      status: "success",
      message: "User authenticated successfully",
      data: {
        jwt: jwtToken,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Authentication failed", error: error.message });
  }
});
module.exports = router;
