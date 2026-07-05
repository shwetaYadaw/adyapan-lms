/**
 * Run once to create the first admin account.
 * Usage:  node seedAdmin.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcrypt");
const User     = require("./models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const email    = "admin@adyapan.com";
    const password = "Admin@123";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`ℹ️  Admin already exists: ${email}`);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name: "Admin", email, password: hashed, role: "admin" });

    console.log("✅ Admin account created:");
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log("\n   ⚠️  Change the password after first login!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
