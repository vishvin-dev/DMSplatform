
import axios from "axios";

export const fetchAppDetails = async () => {
  try {
    const obj = JSON.parse(sessionStorage.getItem("authUser"));
    const username = obj?.user?.loginName;

    if (!username) throw new Error("Username not found in sessionStorage");

    const response = await axios.post("/application-detail/", {
      username,
    });

    return {
      success: true,
      username,
      appDetails: response.data, 
    };
  } catch (error) {
    console.error("Error fetching application details:", error);
    return { success: false, error };
  }
};
