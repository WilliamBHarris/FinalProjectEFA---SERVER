const express = require("express");
const router = require("express").Router();
const { UserModel } = require("../models/index.js");
const { UniqueConstraintError } = require("sequelize/lib/errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validateJWT = require('../middleware/validate-jwt');



router.post("/register", async (req, res) => {
  let {  passwordhash, email, firstName, lastName, location, image, role } = req.body.user;

  try {
    const User = await UserModel.create({
      email,
      passwordhash: bcrypt.hashSync(passwordhash, 13),
      firstName,
      lastName,
      location,
      image,
      role
      
    });

    let token = jwt.sign({ id: User.id }, process.env.JWT_SECRET, {
      expiresIn: 60 * 60 * 24,
    });
    res.status(201).json({
      message: "Registration complete!",
      user: User,
      sessionToken: token,
    });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      res.status(409).json({
        message: "Username already in use!",
      });
    } else {
      res.status(500).json({
        message: "Failed to register the User!",
      });
    }
  }
});

router.post("/login", async (req, res) => {

  try {
    const { email, passwordhash } = req.body.user
    const loginUser = await UserModel.findOne({
      where: {
        email,
    }});

    if (loginUser) {
      let passwordComparison = await bcrypt.compare(
        passwordhash,
        loginUser.passwordhash
      );

      if (passwordComparison) {
        let token = jwt.sign({ id: loginUser.id }, process.env.JWT_SECRET, {
          expiresIn: 60 * 60 * 24,
        });

        res.status(200).json({
          user: loginUser,
          message: "Login successful!",
          sessionToken: token,
        });
      } else {
        res.status(401).json({
          message: "Incorrect username or password",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to login user!",
    });
  }
});

router.delete('/delete/:id', validateJWT, async (req, res) => {
  const id = req.params.id;
  
  try {
    const user = await UserModel.destroy({
        where: {
            id: id,
        },
    });
    res.status(200).json({
        message: "User successfully deleted!",
        user: user,
        status: 200,
    });
} catch (error) {
    res.status(500).json({
        message: "Failed to delete user",
        status: 500,
    });
}
})


router.post('/setUser', validateJWT, async (req, res) => {
  res.status(200).json({
    userId: req.user.id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    location: req.user.location,
    image: req.user.image,
    role: req.user.role,
    passwordhash: req.user.passwordhash,
    id: req.user.id
  });
})

router.get('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const user = await UserModel.findOne({
      where: {
        id: id,
      },
    });

    res.status(200).json(user);
  } 
  catch (error) {
    res.status(500).json({
      message: `Failed to get user: ${error}`
    });
  }
})

router.put('/edit/:id', validateJWT, async (req, res) => {
  const { role, firstName, lastName, email, location, image } = req.body.user;
  const id = req.params.id;
  const userID = req.id;

  const updatedProfile = {
    role,
    firstName,
    lastName,
    email,
    location,
    image
  }

  const query = {
    where: {
      id: id
    }
  }

  try {
    if (userID === id || req.user.role === 'admin') {
      await UserModel.update(updatedProfile, query);
  
      res.status(200).json({
        message: 'profile updated',
        updatedProfile: updatedProfile 
      });
    } else {
      res.status(403).json({
        message: 'Forbidden'
      })
    }
  } 
  catch (error) {
    res.status(403).json({
      message: `Failed to update: ${error}`
    });
  }
})

router.get('/userInfo/:id', validateJWT, async (req, res) => {
  const id = req.params.id;
  const userID = req.user.id;

  try {
    if (userID === id || req.user.role === 'admin') {
      const user = await UserModel.findOne({
        where: {
          id: id
        }
      })
      
      res.status(200).json(user)
    } else {
      res.status(403).json({
        message: 'Forbidden'
      })
    }
  } 
  catch (error) {
    res.status(403).json({
      message: `Failed to get user: ${error}`
    });
  }
})

module.exports = router;