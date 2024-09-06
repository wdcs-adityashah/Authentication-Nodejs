const {v4:uuidv4} = require('uuid');
const User = require('../models/user');
const {setUser} = require('../service/auth');
async function handleSignUp(req,res){
    const{name,email,password} = req.body;
    await User.create({
        name,
        email,
        password
    });
    return res.redirect("/");
}
async function handleLogin(req,res){
    const{email,password} = req.body;
    const user = await User.findOne({email,password});
    if(!user)
        return res.render("login",{
        error:"Invalid Username or Password",    
        });

        const sessionId = uuidv4();
        setUser(sessionId,user);
        res.cookie("uid",sessionId);
        const token = setUser(user);
        res.cookie("uid",token);
        return res.redirect("/");
}
module.exports = {handleSignUp,handleLogin};