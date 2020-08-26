const mongooose=require('mongoose');
const validator=require('validator')
const bcript = require('bcrypt');
const jwt =require('jsonwebtoken');
const Task = require('../model/task');


const userSchema = new mongooose.Schema({
    name: {
        trim: true,
        type: String,
        required: true
    },
    email: {
        lowercase: true,
        type: String,
        unique:true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error(" email not valid");
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minlength: 6,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error(" cnot be password");
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('age cnnot be negative')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            
           
        }
    }],
    avtar:{
        type:Buffer
    }
})
userSchema.virtual('task',{
    ref: 'Tasks',
    localField:'_id',
    foreignField:'owner'
})
//hide data

userSchema.methods.toJSON=function(){
     const  user=this
       let object=user.toObject()
       delete object.password
       delete object.tokens
       delete object.avtar
      
       return object

}
//authentication 

userSchema.methods.getjwtAuthToken=async function(){
        const user=this
         const token =await jwt.sign({_id:user._id.toString()},process.env.JWT_SCERETKEY)
         user.tokens=user.tokens.concat({token})
          await user.save()
          return token
       

}

//authentication after save


userSchema.statics.findByCredentials = async (email, password) => {
     const user =await User.findOne({email:email})
     if(!user){
         throw new Error('unable to login')
     }
     const ismatch = await bcript.compare(password, user.password)
     if (!ismatch) {
         throw new Error('unable to login')
     }
     return user
}

//saving hashed password
userSchema.pre('save', async function (next) {
     const user = this
    if(user.isModified('password')){
        user.password=await bcript.hash(user.password,8)
    }
    next()
})

//removing task whn removing user

userSchema.pre('remove',async function(next){
    const user=this
    await Task.deleteMany({owner:user._id})
    next()
})
const User = mongooose.model('Users',userSchema )





module.exports= User