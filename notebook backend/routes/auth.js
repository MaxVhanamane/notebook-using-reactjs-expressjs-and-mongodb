const express = require("express")
// bcryptjs is used to encrypt/hash the user's password
const bcrypt = require('bcryptjs');
// jwt is used to generate token. token is used to verify the user once he sign in. like if he wants to visit another secured page which requires
// authentication at that time he doesn't have to give us all his credentials again we can use the token which we gave him when he signed in
// to verify that this is the same user who was signed in.
var jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
// Routers are very helpful in separating concerns and keep relevant portions of our code together. They help in building maintainable code.
// we can use app.get(),app.post() etc. but that makes index.js file not very maintainable to put all the routes into separate folder for the 
// sake of maintainabilty we use routers.
const router = express.Router()
const User = require("../modules/Users") // to add items in Users table/collection
const fetchUser =require("../middleware/fetchuser")

const JWT_PRIVATE_KEY = "abkdjafk$*&*^$*^*jfdjjfsajfkljhs343254325"

// Route 1 : Create user.
router.post("/createuser",

    // Validating a user using express-validator. you can write all code in an array or you can directly put the validations using , only.
    [body('name', "Name must be altleast 3 characters long").isLength({ min: 3 }),
    body('email', "Enter a valid email").isEmail(),
    // password must be at least 5 chars long
    body('password', "Password must be atleast 5 characters long").isLength({ min: 5 })],

    async (req, res) => {

        // const errors = validationResult(req) line of code is from express-validator module. which will give us an error as a object when 
        // validation fails.
        const errors = validationResult(req);
        // If there are errors in validation then return the bad request
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Create new User
        try {
            // Checking if email already exists in database.
            let user = await User.findOne({ email: req.body.email });

            // If email exists in the db then return Email already exists.
            if (user) {
                return res.status(400).json({ error: "Email already exists" })
            }
            // Here salt bcrypt.genSalt() and bcrypt.hash() both returns promise so we have to use await.
            // If we do not use await with salt variable then it will not wait till the promise resolves it move to the next line of code 
            // but on the next line we have bcrypt.hash() which uses salt variable because promise was not resolved we do not have it's value
            // so it will trow an error to avoid that from happening we use await.
            // await ka matlab tabtak ruko jabtak ye promise resolve na ho jaye. resolve hone pe iski value leke jao.
            const salt = await bcrypt.genSalt(10)
            const securedPassword = await bcrypt.hash(req.body.password, salt)
            // If email doesn't exist then create new user.
            newUser = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: securedPassword,
            });
            // console.log(newUser._id) // it will give us new ObjectId("62559c0da58cb81ef6ae3915")
            // console.log(newUser.id)  // it will give us only "62559c0da58cb81ef6ae3915"

            // creating data variable to use it jwt.sign()
            const data = {
                user: {
                    id: newUser.id
                }
            }
            // generating jwt token
            const authToken = jwt.sign(data, JWT_PRIVATE_KEY);

            res.json({authToken}) // in es6 I don't have to write {authToken:authToken} I can directly write {authToken} which will be same as {authToken:authToken}
        }
        // Catching the error if we couldn't add the user in our database.
        catch (err) {
            console.log(err.message)
            res.status(500).send("Internal server error")
        }

    })


    //Route 1 : Login user

    router.post("/login",

    [
    body('email', "Enter a valid email").isEmail(),
    body('password',"Invalid password").exists({checkFalsy:true})],
    // .exists({checkFalsy:true}), fields with falsy values (eg "", 0, false, null) are not allowed as password. read express-validator doc.
    async (req, res) => {

        // const errors = validationResult(req) line of code is from express-validator module.
        const errors = validationResult(req);
        // If there are errors in validation then return the bad request
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
    // destructuring req.body object to get an email and password.
    const {email,password}=req.body

    
    try {
    
    // checking if user exists in the database using email.
    // you can write findOne({email}) or findOne({email:email})
    let foundUser=await User.findOne({email});
    
    // If user is not in the database then return. return statement terminates the function.
    if(!foundUser){
        return res.status(400).json({error:"The username or password you entered is incorrect"})
    }

    // bcrypt.compare()   It will match the password given by the user with the password we have in the database. it return true or false.
    const comparePassword = await bcrypt.compare(password,foundUser.password);
    
    // if password didn't match i.e comparePassword = false. then following if condition will run.
    if(!comparePassword){
        return res.status(400).json({error:"The username or password you entered is incorrect"})
    }
    
    // if user enters correct email and password then we will give him token.
    const data = {
        user: {
            id: foundUser.id
        }
    }

    // generating jwt token
    const authToken = jwt.sign(data, JWT_PRIVATE_KEY);

        res.json({authToken})
    
    // If something goes wrong... catch the error.   
    }   catch (err) {
        res.status(500).send("Internal server error")
    }
    
    
    })

    // Route 3 : Get logged in user details. by using middleware named fetchUser

    router.post("/getuser",fetchUser, 

    async (req, res) => {
      try {
        // console.log(req.user)
          const userId=req.user.id;
          //  here minus password (-password) will ignore/drop the key value pair named password and it will give us all other key value pairs.
          //  If you want to ignore/drop multiple key value pairs then add an array. eg. ["-name","-password"]
          //  If you add a positive key name in select() it will send only that key value pair eg. select("password")
          const user= await User.findById(userId).select("-password") 
          res.send(user)
      } catch (error) {
          res.status(500).send({error:"Internal server error"})
      }
    })

module.exports = router
