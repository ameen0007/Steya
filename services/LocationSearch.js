export const locationSearch = async (query) => {
  console.log('🔍 Fetching from Geoapify for:', query);

  const GEOAPIFY_KEY = "a3363d4e16d944de87c0779d510e448c";

  if (!query?.trim()) {
    return { success: false, message: "Please enter a location" };
  }

  const cleanQuery = query.trim();
  if (cleanQuery.length <= 2) {
    return { success: false, message: "Please enter at least 3 characters" };
  }

  const apiUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(cleanQuery)}&limit=15&countrycodes=in&apiKey=${GEOAPIFY_KEY}`;
  console.log('🌐 Request URL:', apiUrl);

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.warn('⚠️ API responded with status:', response.status);
      return {
        success: false,
        message: `API request failed with status ${response.status}`
      };
    }

    const data = await response.json();
    console.log('📦 Raw API data:', data);

    if (!Array.isArray(data.features)) {
      return { success: false, message: "Invalid data format from API" };
    }

    const processedResults = data.features
      .filter(item => !!item.properties?.formatted)
      .map(item => {
        const name = item.properties.formatted.toLowerCase();
        let score = 0;

        if (name.startsWith(cleanQuery.toLowerCase())) score = 3;
        else if (name.includes(` ${cleanQuery.toLowerCase()}`)) score = 2;
        else if (name.includes(cleanQuery.toLowerCase())) score = 1;

        return {
          ...item.properties,
          score,
          id: item.properties.place_id,
        };
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(result => ({
        id: result.place_id,
        formatted: result.formatted,
        city: result.city || '',
        state: result.state || '',
        country: result.country || '',
        lat: result.lat,
        lon: result.lon
      }));

    if (processedResults.length === 0) {
      return {
        success: false,
        message: "Location not found. Please try another location."
      };
    }

    return {
      success: true,
      data: processedResults
    };

  } catch (error) {
    console.error('❌ Geoapify fetch error:', error?.message || error);
    if (error.message?.includes("Network request failed")) {
      return {
        success: false,
        message: "No internet or unable to reach Geoapify."
      };
    }

    return {
      success: false,
      message: "Something went wrong. Please try again later."
    };
  }
};
