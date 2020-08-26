const  express = require('express')

require('./db/mongoose')
const userRouter=require('./router/user')
const taskRouter=require('./router/task')
const { update } = require('./model/user')
const app=express()




app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
const Port = process.env.Port;



app.listen(Port,()=>{
    console.log('running at '+Port)
})


