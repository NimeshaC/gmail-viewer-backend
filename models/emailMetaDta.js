const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EmailMetadata = sequelize.define("EmailMetadata", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  messageId: {
    type: DataTypes.STRING,
    unique: true,
  },
  subject: {
    type: DataTypes.STRING,
  },
  sender: {
    type: DataTypes.STRING,
  },
  receivedDate: {
    type: DataTypes.DATE,
  },
});

module.exports = EmailMetadata;
