module.exports = {
  // ===============================================================================
  // LOGIN VERIFICATION AND TWO FACTOR CHECKUP MIDDLEWARE
  // ===============================================================================
  isAppAdmin: (req, res, next) => {
    if (req.isAuthenticated() && req.user && !req.user.record.admin) {
      // console.log('Admin account');
      req.flash('loginMessage', 'Invalid Access');
      res.redirect('/');
    } else if (
      (req.isAuthenticated()
      && req.user.record.twofa_enabled === true
      && req.user.record.twofa_completed !== true)
      || (req.isAuthenticated() && req.session.twofa_enabled !== undefined
      && req.session.twofa_enabled === true
      && req.session.twofa_completed === false)
    ) {
      res.redirect('/2fa_setup');
    } else if (
      req.isAuthenticated() && req.user.record.twofa_enabled === true
      && req.user.record.twofa_completed === true && req.session.twofa_pass === false
    ) {
      // console.log('Needs to verify 2FA')
      res.redirect('/2fa_checkup');
    } else if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/login');
    }
    return null;
  },

  isLoggedIn: (req, res, next) => {
    // If user is autenticated in the session, carry on
    // console.log('User',req.user ? req.user.record.admin: null);
    if (req.isAuthenticated() && req.user && req.user.record.admin) {
      // req.flash('loginMessage','Regular account access only');
      res.redirect('/admin');
    } else if (
      (req.isAuthenticated() && req.user.record.twofa_enabled === true
      && req.user.record.twofa_completed !== true) || (req.isAuthenticated()
      && req.session.twofa_enabled !== undefined && req.session.twofa_enabled === true
      && req.session.twofa_completed === false)) {
      // console.log('Needs to verify 2FA')
      res.redirect('/2fa_setup');
    } else if (
      req.isAuthenticated() && req.user.record.twofa_enabled === true
      && req.user.record.twofa_completed === true && req.session.twofa_pass === false) {
      // console.log('Needs to verify 2FA')
      res.redirect('/2fa_checkup');
    } else if (req.isAuthenticated()) {
      return next();
    } else {
      // console.log('Needs to log');
      res.redirect('/login');
    }
    return null;
  },

  onlyLoggedIn: (req, res, next) => {
    // If user is autenticated in the session, carry on
    if (req.isAuthenticated()) {
      return next();
    }
    console.log('Needs to log');
    res.redirect('/login');
    return null;
  },
  isLoggedInIndex: (req, res, next) => {
    // If user is autenticated in the session, carry on
    if (req.isAuthenticated() && req.user && req.user.record.admin) {
      // req.flash('loginMessage','Regular account access only');
      res.redirect('/admin');
    } else if (
      (req.isAuthenticated() && req.user.record.twofa_enabled === true
      && req.user.record.twofa_completed !== true) || (req.isAuthenticated()
      && req.session.twofa_enabled !== undefined && req.session.twofa_enabled === true
      && req.session.twofa_completed === false)) {
      res.redirect('/2fa_setup');
    } else if (req.isAuthenticated() && req.user.record.twofa_enabled === true
      && req.user.record.twofa_completed === true && req.session.twofa_pass === false) {
      res.redirect('/2fa_checkup');
    } else if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/gravity');
    }
    return null;
  },
};
