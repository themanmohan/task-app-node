const express= require('express')
const User=require('../model/user')
const { use } = require('./task')

const multer =require('multer')
const auth = require('../middleware/auth')
const router = express.Router()


router.post('/users', async (req, res) => {
    const Users = new User(req.body)
    try {
       const token=await Users.getjwtAuthToken()
        await Users.save()
        res.json({Users,token})
    } catch (e) {
        res.status(500).json(e)
    }
})

//login

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token =await user.getjwtAuthToken()
        res.send({user,token})
    } catch(e){
        res.status(500).send(e+'error found')
    }
})

//get user by id



router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).send()
        }
        res.status(200).json(user)
    } catch (e) {
        res.status(500).json(e)
    }

})


router.get('/users/me',auth, async (req, res) => {

    res.send(req.user)

})

//logoutall

router.post('/users/logoutall',auth,async(req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send(req.user.name)
    }catch(e){
       res.status(500).send(e)
    }
})
//logout
router.post('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter(token=>{
        return token.token!==req.token
    })
     await req.user.save()
     res.send(req.user.name)
}catch(e){
     res.send(500).send(e)
}
})

router.patch('/user/me',auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedupdate = ['name', 'email', 'password', 'age'];
    const isvalidation = updates.every((updates) => allowedupdate.includes(updates))
    if (!isvalidation) {
        return res.status(400).send('incalid upadte')
    }
    try {
        
        updates.forEach(updates=>req.user[updates]=req.body[updates])
        await req.user.save()
    //    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //         new: true,
    //        runValidators: true
    //     })
       

        res.send(req.user)
    } catch (e) {
        res.status(50).send(e)
    }
})



//delete 

router.delete('/user/me',auth, async (req, res) => {
    try {
       await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/user/me/avtar',auth,async(req,res)=>{
    req.user.avtar=undefined
   await req.user.save()
   res.send()

})

router.get('/user/:id/avtar',async(req,res)=>{
   try{
       const user =await User.findById(req.params.id)
       if(!user || !user.avtar){
           throw new Error()
       }
        res.set('Content-Type','image/png')
        res.send(user.avtar)
   }catch(e){
       res.status(400).send(e)
   }
})

const  upload=multer({
   
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
         if (!file.originalname.match(/\.(jpeg|jpg|png)$/)){
             return cb(new Error('upload correct file'))
         }
         cb(undefined,true)
    }
})

router.post('/user/me/avtar',auth,upload.single('avtar'),async(req,res)=>{
//   const buffer=await sharp(req.file.buffer).resize({width:250,heigth:250}).png().toBuffer()
     req.user.avtar=req.file.buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
      res.status(400).send({
          error: error.message
      })
    
})


module.exports=router