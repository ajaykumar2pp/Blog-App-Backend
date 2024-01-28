require('dotenv').config()
const User = require("../model/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const moment = require('moment');
moment().format();

function userController() {
  return {
    async createUser(req, resp) {
      try {
        const { username, email, password } = req.body;

        // Validate input data
        if (!username || !email || !password) {
          return resp.status(400).json({ message: 'Missing required fields' });
        }

        // Check if a user with the provided Email ID already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
          return resp.status(409).json({ message: 'User already exists with this Email ID Register' });
        }

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create the user
        const newUser = await User.create({
          username,
          email: email.toLowerCase(),
          password: hashedPassword,
          date: moment().format('MMMM Do YYYY, h:mm:ss a')
        });


        // Remove the password field from the response
        const userWithoutPassword = newUser.toObject();
        delete userWithoutPassword.password;

        resp.status(201).json({ data: { user: userWithoutPassword } });
        console.log(userWithoutPassword)
      } catch (err) {
        resp.status(500).json({ error: "Failed to create user" });
      }
    },

    async loginUser(req, resp) {
      const { email, password } = req.body;
      // console.log(req.body)

      // Validate input data
      if (!email || !password) {
        return resp.status(400).json({ message: 'Missing required fields' });
      }

      // Check if a user with the provided name exists
      const userLogin = await User.findOne({ email });
      // console.log(userLogin)

      if (!userLogin) {
        return resp.status(404).json({ message: 'User not found' });
      }


      // Compare the provided password with the stored hashed password
      const passwordMatch = await bcrypt.compare(password, userLogin.password);

      if (!passwordMatch) {
        return resp.status(401).json({ message: 'Invalid  password' });
      }

      // Create and sign a JWT token
      const token = jwt.sign({ _id: userLogin._id, username: userLogin.username, email: userLogin.email, isAdmin: userLogin.isAdmin, isBlocked: userLogin.isBlocked },
         process.env.SECRET_KEY, {
        expiresIn: '365d',  // it will be expired after 365 days
        // expiresIn: "24h",  // it will be expired after 24 hours
        // expiresIn: "120", // it will be expired after 120ms
        // expiresIn: "120s" // it will be expired after 120s
      });

      // console.log(token)

      // resp.status(201).json({ data: { user: userWithoutPassword } });
      return resp.status(200).json({
        data: {
          message: 'User Login in successful',
          user: {
            token,
            _id: userLogin._id,
            username: userLogin.username,
            email: email
            // isAdmin:userLogin.isAdmin

          }
        }

      });
    },



  };
}
module.exports = userController;
