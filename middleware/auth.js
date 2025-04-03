/**
 * Authentication middleware functions
 */

/**
 * Middleware to check if user is authenticated
 * Redirects to login page if not
 */
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
      return next();
    }
    // Store the original URL they were trying to access
    req.session.returnTo = req.originalUrl;
    res.redirect('/auth/login');
  }
  
  /**
   * Middleware to check if user is already logged in
   * Redirects to home page if they are (for login/register pages)
   */
  function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
      return res.redirect('/');
    }
    next();
  }
  
  module.exports = {
    requireAuth,
    redirectIfAuthenticated
  };