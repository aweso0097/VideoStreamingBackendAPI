class ApiError extends Error {
    constructor (
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = nullthis.message = message
        this.success = false
        this.errors = errors
    }
}
export {ApiError}