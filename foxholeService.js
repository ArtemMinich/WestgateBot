const axios = require("axios");
require("dotenv").config();

const BASE_URL = process.env.FOXHOLE_API_BASE;

async function getDynamicMapData(mapName) {
    try {
        const url = `${BASE_URL}/worldconquest/maps/${mapName}/dynamic/public`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("❌ API error:", error.message);
        throw error;
    }
}

module.exports = { getDynamicMapData };
