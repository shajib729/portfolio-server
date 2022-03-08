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

router.get("/auth", userAuth, async (req, res) => {
    try {
        res.status(201).json({message:"Authorized"})
    } catch (err) {
        res.status(401).json({error:err.message})
    }
})

router.post("/login", async (req, res) => {

    let { newEmail, newPassword } = req.body
    
    try {
        if (newEmail && newPassword) {
            const existEmail = await User.findOne({ email: newEmail })

            if (!existEmail) {
                res.status(400).json({error:"Wrong Information"})
            } else {
                const loginUser = await User.findOne({ email: newEmail })
                
                const checkPassword = await bcrypt.compare(newPassword, loginUser.password)

                if (checkPassword) {
                    const token = jwt.sign({ _id: loginUser._id }, process.env.SECRET_KEY, {expiresIn:"7d"})
                    if (token) {
                        res.cookie("shajib_jwt", token, {
                            expires: new Date(Date.now() + 25892000000),
                            httpOnly:true,
                        }).status(200).json({ message: "User Successfully Login", token })
                    }
                } else {
                    res.status(400).json({errror:"Wrong Information"})
                }
            }
        } else {
            res.status(400).json({error:'Please, Fill the form correctly'})
        }
    } catch (err) {
        console.log({err});
        res.status(500).json({error:err.message})
    }
})

//Get users image
router.get("/get_image", userAuth, async (req, res) => {
    try {
        const user=await User.findOne({_id:req.userId})
        res.status(200).json({message:user.image})
    } catch (err) {
        res.status(400).json({error:err.message})
    }
})

//Update users image
router.patch("/update_image", userAuth, async (req, res) => {
    try {
        const { image } = req.body
        if (image) {
            await User.updateOne({_id:req.userId},{image:image})
            res.status(200).json({message:"Successfully Updated Image"})
        } else {
            res.status(400).json({error:"Didn't get any imagae"})
        }
    } catch (err) {
        res.status(400).json({error:err.message})
    }
})

//Update users CV
router.patch("/update_cv", userAuth, async (req, res) => {
    try {
        const { cv } = req.body
        if (cv) {
            await User.updateOne({_id:req.userId},{cv})
            res.status(200).json({message:"Successfully Updated CV"})
        } else {
            res.status(400).json({error:"Didn't get any CV"})
        }
    } catch (err) {
        res.status(400).json({error:err.message})
    }
})

//TODO: LOGOUT a User
router.get("/logout", userAuth, (req, res) => {
    try {
        res.clearCookie("shajib_jwt")
        res.status(200).json({message:"Successfully logout"})
        console.log('Logout');
    } catch (err) {
        res.status(400).json({error:err.message})
    }
})

module.exports=router