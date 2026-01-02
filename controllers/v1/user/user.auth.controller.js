/**
 * Node modules
 */
const validator = require("validator");

/**
 * Models
 */
const User = require("../../../models/user.model.js");

/**
 * Utils
 */
const { newToken } = require("../../../utils/jwt.js");
const catchAsync = require("../../../utils/server-error-handling/catchAsyncError.js");
const redirect = require("../../../utils/redirect.js");

/**
 * @description: Render the register page
 */
module.exports.renderRegister = (req, res) => {
	if (req.token) {
		req.flash(
			"success",
			"You are already logged in, try logging out before signing up again"
		);

		redirect(res, "/api/v1/papers");
		return;
	} else {
		return res.render("auth/user/register");
	}
};

/**
 * @description - Registers new user.
 */
module.exports.registerUser = catchAsync(async (req, res) => {
	const { email, password } = req.body;
	if (!validator.isEmail(email)) {
		req.flash("error", "Invalid email address");
		redirect(res, "/api/v1/register");
		return;
	}
	if (!validator.isLength(password, { min: 6, max: 50 })) {
		req.flash("error", "Password must be between 6 and 50 characters");
		redirect(res, "/api/v1/register");
	}

	const existingUser = await User.findOne({
		$or: [
			{
				email,
			},
		],
	});

	if (existingUser) {
		req.flash("error", "This email is already in use.");
		redirect(res, "/api/v1/register");
		return;
	}

	const user = new User({
		email,
		password,
	});

	const token = newToken(user._id);

	await user.save();

	// setting token to session and logging user in
	res.cookie("token", token, { signed: true });
	req.flash("success", "Welcome to vqbank");

	redirect(res, "/api/v1/papers");
});

/**
 * @description: Render the login page
 */
module.exports.renderLogin = (req, res) => {
	return res.render("auth/user/login");
};

/**
 * @description - Logs in user.
 */
module.exports.loginUser = catchAsync(async (req, res) => {
	const { email, password } = req.body;
	if (!validator.isEmail(email)) {
		req.flash("error", "Invalid email address");
		redirect(res, "/api/v1/login");
		return;
	}

	const user = await User.findOne({
		$or: [
			{
				email,
			},
		],
	});

	if (!user) {
		req.flash("error", "Invalid email or password");
		redirect(res, "/api/v1/login");
		return;
	}

	const isMatch = await user.checkPassword(password);

	if (!isMatch) {
		req.flash("error", "Invalid email or password");
		redirect(res, "/api/v1/login");
		return;
	}

	const token = newToken(user._id);

	// setting token to session and logging user in
	res.cookie("token", token, { signed: true });
	req.flash("success", "Welcome back to vqbank");

	redirect(res, "/api/v1/papers");
});

/**
 * @description - Logs out user.
 */
module.exports.logoutUser = catchAsync(async (req, res) => {
	res.clearCookie("token");
	req.flash("success", "You have been logged out");
	redirect(res, "/api/v1/login");
});
