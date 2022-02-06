const express = require("express");
const router = require("express").Router();
const { UserModel } = require("../models");
const { UniqueConstraintError } = require("sequelize/lib/errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validateJWT = require('../middleware/validate-jwt');



router.post("/register", async (req, res) => {
  let {  passwordhash, email, firstName, lastName, location, image } = req.body.user;

  try {
    const User = await UserModel.create({
      email,
      passwordhash: bcrypt.hashSync(passwordhash, 13),
      firstName,
      lastName,
      location,
      image
      
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

router.post('/checkToken', validateJWT, async (req, res) => {
  res.status(200).json({
    message: "Valid token",
    userId: req.user.id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
  });
})

module.exports = router;