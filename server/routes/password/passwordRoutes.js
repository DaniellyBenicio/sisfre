const express = require("express");
const router = express.Router();

const passwordController = require("../../controllers/password/passwordController");

router.post("/forgot-password", passwordController.forgotPassword);
router.post("/resetPassword/:token", passwordController.resetPassword);

module.exports = router;
