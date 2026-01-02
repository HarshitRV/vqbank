/**
 * Utils
 */
const redirect = require("../../../utils/redirect.js");

const ROLES = {
    Admin: 'ROLE_ADMIN',
    User: 'ROLE_USER',
};

/**
 * @description - This middleware calls next only if the user role matches the role passed in the route.
 * 
 * @param  {...Array} roles - roles to check
 * @returns {function} - next middleware
 * @returns {error} - if user is not authorized
 */
const checkRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        req.flash("error", "You need to login first");
        redirect(res, '/api/v1/login');
        return;
    }
    
    const hasRole = roles.find(role => req.user.role === role);
    if (!hasRole) {
        req.flash("error", "You are not authorized to perform this action");
        redirect(res, "/api/v1/papers");
        return;
    }
    return next();
};

const role = { ROLES, checkRole };

module.exports = role;