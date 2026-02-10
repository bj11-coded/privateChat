import userSchema from "../schema/user.schems.js"

export const getAllUsers = async(req, res) =>{
    try {
        const users = await userSchema.find()

        if(!users){
            res.status(404).json({
                message:"Users not found",
                success:false,
            })
        }

        res.status(200).json({
            message:"Users fetched successfully",
            success:true,
            users,
        })
        
    } catch (error) {
        res.status(500).json({
            message:error.message,
            success:false,
        })
    }
}

export const getById = async(req,res ) =>{
    try {
        const { id } = req.params
        const user = await userSchema.findById(Number(id))

        if(!user){
            res.status(400).json({
                message:"User Not Found",
                success:false,
            })
        }

        res.status(200).json({
            message:"User fetched successfully",
            success:true,
            user,
        })
        
    } catch (error) {
        res.status(500).json({
            message:error.message,
            success:false,
        })
    }
}

export const updateUser = async(req, res) =>{
    try {
        const {id} = Number(req.params)
        const {username, email, password} = req.body

        const user = await userSchema.findById(id)

        if(!username || !email || !password){
            res.status(400).json({
                message:"All fields are required",
                success: false,
            })
        }

        if(!user){
            res.status(400).json({
                message:"User Not Found",
                success:false,
            })
        }

        const salt = bcrypt.genSaltSync(10)
        const hashpassword = bcrypt.hashSync(password, salt)

        const updateUser = await userSchema.findByIdAndUpdate(id,{
            username,
            email,
            password:hashpassword,
        })

        await updateUser.save()

        res.status(200).json({
            message:"User Updated Successfully",
            success:true,
            user:updateUser,
        })
        
    } catch (error) {
        res.status(500).json({
            message:error.message,
            success:false,
        })
    }
}

export const deleteUser = async(req, res) =>{
    try {
        const {id} = Number( req.params)
        const user = await userSchema.findById(id)

        if(!user){
            res.status(400).json({
                message:"User Not Found",
                success:false,
            })
        }

        await userSchema.findByIdAndDelete(id)

        res.status(200).json({
            message:"User Deleted Successfully",
            success:true,
        })
        
    } catch (error) {
        res.status(500).json({
            message:error.message,
            success:false,
        })
    }
}