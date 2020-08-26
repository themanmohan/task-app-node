const mongoose=require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Users'
    }
})

// taskSchema.pre('save', async function(next){
//      const task=this
//      console.log('before upade')

//     next()
// })
const Tasks = mongoose.model('Tasks',taskSchema )

module.exports=Tasks