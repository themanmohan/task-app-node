const mongooose=require('mongoose')


mongooose.connect(process.env.MDCONNECTION, {
          useNewUrlParser:true,
          useCreateIndex:true,
           useUnifiedTopology: true 
});





