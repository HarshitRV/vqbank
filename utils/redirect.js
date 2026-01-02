const redirect = (res, path) => {
    const base = process.env.BASE_PATH || "";
    res.redirect(base + path);
};

module.exports = redirect;