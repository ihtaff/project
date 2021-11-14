const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/Auth");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password,username } = req.body;
    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }
    if (password.length < 6)
      return res.status(400).json({
        errorMessage: "Please enter a password of at least 6 characteres.",
      });
      

        const existingUser = await User.findOne({ email });
        if (existingUser)
          return res
            .status(400)
            .json({ errorMessage: "An account with this email already exists." });
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create new user
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });

    //save user and respond
    const savedUser = await newUser.save();
    //log the user in
    //sign the token
    const token = jwt.sign(
      {
        user: savedUser._id,
      },
     process.env.JWT_SECRET
    );
     //send the token inhttp_only cookie
     res
     .cookie("token", token, {
      httpOnly: true,
     })
  //   .send();
   // res.json({response: "ok"});
   //res.send("ok");
    res.status(200).json(savedUser);
  } catch (err) {
    res.status(500).json(err)
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    //validate
    if (!email || !password) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }

    const user = await User.findOne({ email });
    !user && res.status(401).json({ errorMessage: "Wrong email or password" });

    const validPassword = await bcrypt.compare(password, user.password)
    !validPassword && res.status(401).json({ errorMessage: "Wrong email or password" })
 //sign the token
 const token = jwt.sign(
  {
    user: user._id,
  },
  process.env.JWT_SECRET
);

//send the token inhttp_only cookie
res
.cookie("token", token, {
  httpOnly: true,
})
.send();
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json(err)
  }
});

//LOGOUT
router.get("/logout", (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .send();
});

router.get("/loggedIn", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json(false);
    jwt.verify(token, process.env.JWT_SECRET);

    res.send(true);
  } catch (error) {
    console.error(error);
    res.json(false);
  }
});
//

router.get("/currentUser",auth, (req,res) =>{
    
    User.findById(req.user)
       .select('-password')
       .then(user => res.json(user));
});

module.exports = router;
