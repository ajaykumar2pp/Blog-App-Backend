require('dotenv').config()
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  
    // Check if the "Authorization" header is present in the request
    // const token = req.headers['authorization'];
    const token = req.header('Authorization');
    // Check if the token is missing

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - Token missing' });
    }
    
    const bearerToken = token.split(' ')[1];
    // Verify the JWT token  { ignoreExpiration: true }, Bearer
    jwt.verify(bearerToken, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
      }

      // Attach the authenticated user data to the request object
      req.user = user;
      console.log(req.user)

      // Continue to the next middleware or route handler
      next();
    });
  
};