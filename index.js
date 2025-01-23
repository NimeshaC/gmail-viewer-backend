const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const sequelize = require("./config/database");
const authRoutes = require("./routes/auth");
const emailRoutes = require("./routes/emails");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/emails", emailRoutes);

const PORT = process.env.PORT || 3000;

console.log("Starting server...");

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
