
import { pool } from "../Config/db.js";

//===================DROPDOWN FETCHING================================
// this is all fecthing things of DIV, SUB_DIV, SECTION, ROLES,
//Divison

export const getZonee = async () => {
  const [result] = await pool.execute(
    `SELECT DISTINCT zone, zone_code  FROM zone_codes ORDER BY ZONE;`
  )
  return result;
}
export const getCirclee = async (zone_code) => {
  const [result] = await pool.execute(
    `SELECT DISTINCT circle, circle_code FROM zone_codes WHERE zone_code = ?;`,
    [zone_code]
  );
  return result;
}
export const getDivisionss = async (circle_code) => {
  const [result] = await pool.execute(
    `SELECT DISTINCT division, div_code FROM zone_codes WHERE circle_code = ? ORDER BY division;`,
    [circle_code]
  );
  return result;
};
// Fetch Sub-Divisions by Division Code
export const getSubDivisionss = async (div_code) => {
  const [result] = await pool.execute(
    `SELECT DISTINCT sub_division, sd_code FROM zone_codes WHERE div_code = ? ORDER BY sub_division;`,
    [div_code]
  );
  return result;
};

// ========================= SECTION WITH EXCLUDE ================
export const getSectionss = async (sd_code, exclude_sections = []) => {

  let query = `
        SELECT DISTINCT section_office, so_code
        FROM zone_codes
        WHERE sd_code = ?
    `;

  let params = [sd_code];

  // If any sections already selected, remove them
  if (exclude_sections.length > 0) {
    const placeholders = exclude_sections.map(() => "?").join(",");
    query += ` AND so_code NOT IN (${placeholders})`;
    params.push(...exclude_sections);
  }

  query += " ORDER BY section_office";

  const [result] = await pool.execute(query, params);
  return result;
};

export const getRoless = async () => {
  const [result] = await pool.execute(
    `SELECT Role_Id, RoleName 
         FROM roles 
         WHERE RoleName <> 'Admin';
`
  );
  return result;
}
// ============================================================================================================
// ============================================================================================================



/*
 * USERS: fetch users (first name and id) filtered by role and optionally by zone/circle/div/sd/so
 * - roleId: required (to open user dropdown)
 * - filters: object { zone_code, circle_code, div_code, sd_code, so_code } (all optional)
 * - If so_code is an array, use IN
 */
export const getUsersByRoleAndLocation = async (roleId, filters = {}) => {
  const { zone_code, circle_code, div_code, sd_code, so_code } = filters;

  let query = `
    SELECT 
        u.User_Id,
        u.FirstName
    FROM user u
    INNER JOIN userzoneaccess uza ON u.User_Id = uza.User_Id
    WHERE u.Role_Id = ?
  `;
  const params = [roleId];

  if (zone_code) {
    query += ` AND zone_code = ?`;
    params.push(zone_code);
  }
  if (circle_code) {
    query += ` AND circle_code = ?`;
    params.push(circle_code);
  }
  if (div_code) {
    query += ` AND div_code = ?`;
    params.push(div_code);
  }
  if (sd_code) {
    query += ` AND sd_code = ?`;
    params.push(sd_code);
  }
  if (so_code) {
    if (Array.isArray(so_code) && so_code.length > 0) {
      const placeholders = so_code.map(() => "?").join(",");
      query += ` AND so_code IN (${placeholders})`;
      params.push(...so_code);
    } else {
      query += ` AND so_code = ?`;
      params.push(so_code);
    }
  }

  query += ` ORDER BY FirstName`;

  const [rows] = await pool.execute(query, params);
  return rows;
};



// export const getReportData = async (filters = {}, dateRange = {}) => {
//     const {
//         zone_code,
//         circle_code,
//         div_code,
//         sd_code,
//         so_code,
//         role_id,
//         user_id
//     } = filters;

//     let query = `
//     SELECT *
//     FROM report_data
//     WHERE 1 = 1
//   `;
//     const params = [];

//     // Location filters
//     if (zone_code) {
//         query += ` AND zone_code = ?`; params.push(zone_code);
//     }
//     if (circle_code) {
//         query += ` AND circle_code = ?`; params.push(circle_code);
//     }
//     if (div_code) {
//         query += ` AND div_code = ?`; params.push(div_code);
//     }
//     if (sd_code) {
//         query += ` AND sd_code = ?`; params.push(sd_code);
//     }
//     if (so_code) {
//         if (Array.isArray(so_code) && so_code.length > 0) {
//             const placeholders = so_code.map(() => "?").join(",");
//             query += ` AND so_code IN (${placeholders})`;
//             params.push(...so_code);
//         } else {
//             query += ` AND so_code = ?`;
//             params.push(so_code);
//         }
//     }

//     // role & user filters
//     if (role_id) {
//         query += ` AND Role_Id = ?`; params.push(role_id);
//     }
//     if (user_id) {
//         query += ` AND User_Id = ?`; params.push(user_id);
//     }

//     // date range filter (CreatedOn assumed)
//     if (dateRange && dateRange.startDate && dateRange.endDate) {
//         query += ` AND DATE(CreatedOn) BETWEEN ? AND ?`;
//         params.push(dateRange.startDate, dateRange.endDate);
//     }

//     // final ordering (adjust as needed)
//     query += ` ORDER BY CreatedOn DESC`;

//     const [rows] = await pool.execute(query, params);
//     return rows;
// };



export const getReportData = async (filters = {}, dateRange = {}) => {
  const { div_code, sd_code, so_code } = filters;
  const { startDate, endDate } = dateRange;


  let conditions = [];
  let params = [];

  // AREA FILTERS
  if (div_code) {
    conditions.push("du.div_code = ?");
    params.push(div_code);
  }

  if (sd_code) {
    conditions.push("du.sd_code = ?");
    params.push(sd_code);
  }

  if (so_code) {
    if (Array.isArray(so_code)) {
      // If user sends multiple sections: ["5001", "5002"]
      conditions.push(`du.so_code IN (${so_code.map(() => "?").join(",")})`);
      params.push(...so_code);
    } else {
      // Single section
      conditions.push("du.so_code = ?");
      params.push(so_code);
    }
  }
  // DATE FILTER — FULL DAY RANGE
  if (startDate && endDate) {
    conditions.push("dv.UploadedAt BETWEEN ? AND ?");
    params.push(startDate + " 00:00:00", endDate + " 23:59:59");
  }

  const whereSQL = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

   const sql = `
    SELECT 
      du.DocumentId,
      du.DocumentName,
      du.div_code,
      du.sd_code,
      du.so_code,
      zc.zone,
      zc.circle,
      zc.division AS divisionName,
      zc.section_office AS sectionName,
      zc.sub_division AS subDivisionName,
      dv.Version_Id,
      dv.VersionLabel,
      dv.Status_Id,
      dsm.StatusName,
      dv.UploadedAt,
      dv.UploadedByUser_Id
    FROM documentupload du
    INNER JOIN documentversion dv 
      ON du.DocumentId = dv.DocumentId 
    LEFT JOIN documentstatusmaster dsm 
      ON dv.Status_Id = dsm.Status_Id
    LEFT JOIN zone_codes zc
      ON du.so_code = zc.so_code
    ${whereSQL}
    ORDER BY dv.UploadedAt DESC
  `;

  const [rows] = await pool.execute(sql, params);

  // GROUP REPORT BY SECTION
  const sectionMap = {};

  //  ADDED: overall summary object
  const overallSummary = {
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    reuploaded: 0
  };

  rows.forEach(r => {
    if (!sectionMap[r.so_code]) {
      sectionMap[r.so_code] = {
        sectionCode: r.so_code,
        sectionName: r.sectionName || "Unknown Section",
        divisionName: r.divisionName || null,
        subDivisionName: r.subDivisionName || null,
        circle: r.circle || null,
        zone: r.zone || null,
        summary: {
          total: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          reuploaded: 0
        }
      };
    }

    const sec = sectionMap[r.so_code];

    // ----------------------------
    // SECTION SUMMARY COUNT UPDATE
    // ----------------------------
    sec.summary.total++;
    if (r.Status_Id == 1) sec.summary.pending++;
    if (r.Status_Id == 2) sec.summary.approved++;
    if (r.Status_Id == 3) sec.summary.rejected++;
    if (r.Status_Id == 4) sec.summary.reuploaded++;

    // ----------------------------
    //  ADDED: OVERALL SUMMARY
    // ----------------------------
    overallSummary.total++;
    if (r.Status_Id == 1) overallSummary.pending++;
    if (r.Status_Id == 2) overallSummary.approved++;
    if (r.Status_Id == 3) overallSummary.rejected++;
    if (r.Status_Id == 4) overallSummary.reuploaded++;
  });

  return {
    status: true,

    //  ADDED OVERALL TOTALS HERE
    overallSummary,

    sections: Object.values(sectionMap)
  };
};

export const sectionRoleUsersWiseReports=async()=>{
  try {
    
  } catch (error) {
    
  }
}