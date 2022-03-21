const User = require('../models/User')
const jwt = require('jsonwebtoken')


const protect = async (req,res,next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        try {
          token = req.headers.authorization.split(' ')[1]
    
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
          req.user = await User.findById(decoded.id).select('-password')
    
          next()
        } catch (error) {
          console.error(error)
          res.status(401).json("Authorization denied")
         
        }
      }
    
      if (!token) {
        res.status(401)
        res.status(401).json("Authorization denied")
      }

}

module.export = protect;