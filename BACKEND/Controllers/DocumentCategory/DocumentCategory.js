import { getDocumentCategoryDetails, addDocumentCategoryDetails, editDocumentCategoryDetails } from "../../models/DocumentCategory.js"

export const documentCategory = async (req, res) => {
    const {Category_Id, CategoryName, Description, IsActive, flagId, requestUserName } = req.body;
    try {
        let results;

        if (flagId === 1) {
            results = await getDocumentCategoryDetails(requestUserName);
            return res.status(201).json({status:"success", message:"fetched successfully", data: results})
        } else if (flagId === 2) {
            results = await addDocumentCategoryDetails(CategoryName, Description, IsActive, requestUserName);
            return res.status(201).json({status:"success", message:"Added successfully",})
        }
        else if (flagId === 3) {
            results = await editDocumentCategoryDetails(Category_Id,CategoryName, Description, IsActive, requestUserName);
            return res.status(201).json({status:"success", message:"Edited successfully",})
        } else {
            return res.status(400).json({ error: "Invalid flagId" });
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
