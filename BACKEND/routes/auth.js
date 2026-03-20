const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });

    await user.save();
    res.json({ message: "User created successfully" });

  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN
router.post("/login", async (req, res) => {

  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return res.status(404).json("User not found");

  const validPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!validPassword)
    return res.status(400).json("Wrong password");

  res.json({
    message: "Login successful",
    user
  });
});

module.exports = router;