const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

mongoose.connect("mongodb+srv://chyrajendra32_db_user:g0ftyMIaV0eS9CBL@cluster0.g27jk3d.mongodb.net/Color_Nest_Nepal");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
});

const User = mongoose.model("User", userSchema);

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("password(@)123", 10);

  await User.create({
    name: "ColorNest Admin",
    email: "chyrajendra32@gmail.com",
    password: hashedPassword,
    role: "admin"
  });

  console.log("Admin created successfully");
  mongoose.disconnect();
}

createAdmin();
