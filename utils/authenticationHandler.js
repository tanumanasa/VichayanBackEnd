const jwt = require('jsonwebtoken');
const config = require('../config');

const verifyToken = (req, res, next) => {
  let token = req.headers.authorization;
  // console.log("==> token", req.headers)

  if (!token) return res.status(400).json({message: 'Authorization Header Required'})

  if (!token.startsWith('Bearer ')) return res.status(403).json({message: 'Bearer Or Token Not Found'});

  // token = token.slice(7, token.length);

  if (!token) return res.status(400).json({message: 'Bearer Or Token Not Found'});

  jwt.verify(token, config.get("jwt.secret"), (err, decoded) => {
    if (err) {
      return res.status(401).json({message: 'Invalid Bearer Token'});
    }
    req.decoded = decoded;
    next();
  });
};

const generateToken = async (userId, userEmail,userIsVendor,userIsAdmin,userIsCustomer) => {
  const token = jwt.sign({
   id: userId,
   email: userEmail,
   isVendor: userIsVendor,
   isAdmin: userIsAdmin,
   isCustomer: userIsCustomer
 }, config.get("jwt.secret"), {
   expiresIn: config.get("jwt.expiry"),
 });

  return token;
};


module.exports = { verifyToken, generateToken };