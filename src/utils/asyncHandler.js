const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((error) => next(error))
    }
}


export {asyncHandler}

// const asyncHandler --> it takes fn as a parameter and this is a wrapper fn for 
// async handler which can be used anywhere.
// const asyncHandler = (fn) =>async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     }catch(error) {
//         res.status(error.code|| 500).json ({
//             success: false,
//             message: error.message
//         })
//     }
// }