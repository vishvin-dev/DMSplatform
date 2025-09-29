
import { pool } from "../Config/db.js"
//===============INDENT===================================

//==================THIS IS THE INSERTING THE INDNET ZONES AND GENERATING THE INDENT_ID AND INSERTED AUTOMATICALLY=============
export const insertIndentCreation = async () => {
    try {
        const [rows] = await pool.execute(`
            
            
            
        
            
            
            `,[]
        );
        return rows
    } catch (error) {
        console.log("Error Inserting the IndentCreation", error)
    }
}


export const fetchCreatedIndenetViews=async()=>{
    try {
        const [rows]=await pool.execute(`
            

            
            `);
            return rows
    } catch (error) {
        console.log("Error fetching The CreatedIndenetView",error)
    }
}