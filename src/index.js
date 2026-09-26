import 'dotenv/config';
import connectDB from "./db/index.js";

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`server is running at port : ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("MongoDB connection failed!!" ,err);
})




















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