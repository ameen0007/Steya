import axios from 'axios';

const OPENCAGE_API_KEY = '55f11ae180d142dfb3ee2f813d3482b7'; // Replace with your key

export const reverseGeocode = async (lat, lon) => {
  try {
    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
      params: {
        q: `${lat},${lon}`,
        key: OPENCAGE_API_KEY,
        language: 'en',
        pretty: 1,
      },
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        formatted: result.formatted, // Full address
        components: result.components, // Break down: city, state, postcode, etc.
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("OpenCage error", error.message);
    return null;
  }
};
