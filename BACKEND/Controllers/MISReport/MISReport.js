

export const MISReport = async (req, res) => {
    const {}=req.body
    try {
        if(parseInt(flagId)===1){
            const result=await MISReport()
            return res.status(200).json({status: "success", message:"Report Data is Fetched successfully", data:result})
        }
    } catch (error) {
        console.log("Internal Server Error")
        return res.status(500).json({ status: false, message: "Internal Server Error", error: error.message })
    }
}