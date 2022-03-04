const router = require("express").Router()
const userAuth = require("../middleware/userAuth")
const bcrypt = require("bcrypt")
const User = require("../model/UserSchema")
const jwt = require("jsonwebtoken")

// router.post("/register", async (req, res) => {
//     let { email, password } = req.body
//     try {
//         password=await bcrypt.hash(password,10)
//         let user =await User.create({ email, password })
//         res.status(200).json(user)
//     } catch (err) {
//         res.status(400).json({error:err.message})
//     }
// })

router.post("/login", async (req, res) => {

    let { email, password } = req.body
    try {
        const existEmail = await User.findOne({ email: email })

        if (!existEmail) {
            res.status(400).json({error:"Wrong Information"})
        } else {
            const loginUser = await User.findOne({ email: email })
            
            const checkPassword = await bcrypt.compare(password, loginUser.password)

            if (checkPassword) {
                const token = jwt.sign({ _id: loginUser._id }, process.env.SECRET_KEY, {expiresIn:"7d"})
                if (token) {
                    res.cookie("shajib_jwt", token, {expire : new Date() + 604800000}).status(200).json({message:"User Successfully Login"})
                }
            } else {
                res.status(400).json({errror:"Wrong Information"})
            }
        }
    } catch (err) {
        res.status(500).json({error:err.message})
    }
})


//TODO: LOGOUT a User
router.get("/logout", userAuth, (req, res) => {
    try {
        res.clearCookie("shajib_jwt")
        res.status(200).json({message:"Successfully logout"})
        console.log('Logout');
    } catch (err) {
        res.status(400).json({error:err})
    }
})

module.exports=router