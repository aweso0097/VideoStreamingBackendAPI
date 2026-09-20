import 'dotenv/config';
import connectDB from "./db/index.js";

connectDB();

/*
;(async () => {
    try {
        await mongoose.connect('${process.env.MONGODB_URI}/${DB_Name}')
        app.on("error",(error) => {
            console.log(("Error:" , error));
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log("App is listening on port ${process.env.PORT}");
        })
    }
    catch (error){
        console.error("Error: ",error)
    }
})()
    */