export const dummyListings = [
  {
    _id: "1",
    category: "shared",
    title: "Spacious Shared Room for Bachelors near Infopark, Kochi.",
    description: "Well-ventilated, fully furnished shared room available for male bachelors near Infopark. Includes high-speed Wi-Fi, washing machine, refrigerator, and 24x7 water supply. Gated building with CCTV security. Just 5 mins walk to bus stop and shops. Peaceful neighborhood, ideal for IT professionals.",
    images: [
      "https://images.squarespace-cdn.com/content/v1/56dfd5cc9f7266ed7f04b64d/1585743751085-N2317B7K3I2YBZHPHENO/image-asset.jpeg",
      "https://images.squarespace-cdn.com/content/v1/56dfd5cc9f7266ed7f04b64d/1585743749675-UQS61BCNTIARPMQNRA4Y/image-asset.jpeg",
      "https://images.nobroker.in/images/8a9f8503904a58bb01904a66d1f80339/8a9f8503904a58bb01904a66d1f80339_70592_500210_medium.jpg" // Added simple shared kitchen
    ],
    location: {
     district: "Ernakulam",
       fullAddress: "Kakkanad, Kochi",
      state: "Kerala",
      latitude: 9.9675,
      longitude: 76.2999
    },
    contactPhone: "+91-9999999999",
    showPhonePublic: true,
    monthlyRent: 4000,
    roommatesWanted: 1,
    genderPreference: "male",
    habitPreferences: ["Non-Smoker", "Fitness Focused","Clean & Organized","Respects Privacy"],
    purpose: ["Any Purpose"],
    createdAt: "2025-05-01T08:00:00.000Z",
    postedBy: {
      name: "Arjun R",
      profileImage: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  },
    {
      _id: "2",
      category: "shared",
      title: "Roommate Needed – Shared Room near MG Road, Kochi",
      description: "Looking for a male roommate to share a fully furnished 1BHK flat near MG Road. The room has a single bed, fan, wardrobe, and high-speed Wi-Fi. Friendly and peaceful environment, ideal for working professionals. Located close to metro station, supermarkets, and cafes. Rent is ₹5,000/month including Wi-Fi and water. Electricity split separately.",
      images: [
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQPQS1kz6UW6Wha5BZORaGto4FdwzpMQz98w&s",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYjLgO5egNtPzY99bx0EvMipulTYhHQ4JV_N8iOff5ifY4OG4H1JQa_OoniPdKjXoi6wY&usqp=CAU", // Basic shared bedroom
        "https://img.staticmb.com/mbphoto/property/cropped_images/2025/Mar/07/Photo_h180_w240/77857937_12_IMG20250218WA00211_180_240.jpg" // Simple bathroom
      ],
      location: {
        fullAddress: "MG Road, Kochi",
        district: "Ernakulam",
        state: "Kerala",
        latitude: 9.9816,
        longitude: 76.2999
      },
      contactPhone: "+91-8888888888",
      showPhonePublic: false,
      monthlyRent: 5000,
      roommatesWanted: 2,
      genderPreference: "female",
      habitPreferences: ['Non-Smoker','Non-Alcoholic','Early Riser',"Fitness Focused"],
      purpose: ["Studying"],
      createdAt: "2025-05-02T10:30:00.000Z",
      postedBy: {
        name: "Aarav Binu",
    profileImage: "https://randomuser.me/api/portraits/men/61.jpg"
      }
    },
    {
      _id: "3",
      category: "shared",
      title: "Shared Room for Rent near Kakkanad – Ideal for IT Professionals",
      description: "Spacious and clean shared room available in a 2BHK apartment located just 10 minutes from Infopark, Kakkanad. Fully furnished with single bed, table, wardrobe, washing machine, fridge, and Wi-Fi. Peaceful and well-maintained flat, currently occupied by a software engineer. Looking for a friendly, non-smoking male roommate. Rent ₹4,800/month including Wi-Fi and maintenance. Electricity extra.",
      images: [
        "https://content.jdmagicbox.com/v2/comp/ernakulam/p8/0484px484.x484.230625160847.g9p8/catalogue/c-k-residency-pullepady-ernakulam-hotels-n0kmixssrh.jpg",
        "https://imagecdn.99acres.com/media1/27090/0/541800599M-1744217791393.jpg", // Study area
        "https://imagecdn.99acres.com/media1/27090/0/541800607M-1744219756831.jpg" // Typical apartment exterior
      ],
      location: {
        fullAddress: "MG Road, Kochi",
        district: "Ernakulam",
        state: "Kerala",
        latitude: 9.9816,
        longitude: 76.2999
      },
      contactPhone: "+91-8888888888",
      showPhonePublic: false,
      monthlyRent: 5500,
      roommatesWanted: 2,
      genderPreference: "any",
      habitPreferences: ['Non-Smoker','Non-Alcoholic','Early Riser',"Fitness Focused"],
      purpose: ["Working Professional"],
      createdAt: "2025-05-02T10:30:00.000Z",
      postedBy: {
      name: "Diya Varkey",
    profileImage: "https://randomuser.me/api/portraits/women/60.jpg"
      }
    },
    {
      _id: "4",
      category: "pg_hostel",
      title: "Green Nest Ladies PG – Near Lulu Mall, Edappally",
      description: "Premium ladies-only PG just 5 minutes from Lulu Mall and Edappally Metro Station. Fully furnished AC/non-AC rooms with attached bathrooms, high-speed Wi-Fi, and 24/7 security. Rent includes 3 vegetarian meals, laundry, and housekeeping. Ideal for female students and working professionals. Rent starts at ₹7,500/month.",
      images: ["https://content3.jdmagicbox.com/comp/ernakulam/q4/0484px484.x484.210104164018.f1q4/catalogue/flamingos-ladies-hostel-cochin-special-economic-zone-ernakulam-hostels-lg1cd6ac74.jpg","https://asset-cdn.stanzaliving.com/stanza-living/image/upload/f_auto,q_auto,w_600/e_improve/e_sharpen:10/e_saturation:10/f_auto,q_auto/v1663822622/Website/CMS-Uploads/c6hdh58d28xmmver5f3d.jpg","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_kAL3obhSyNxk2i2TBLdak9Z7eadNGl7ev4IOl0-dSXd6eLidTq_BSmJUycAQObq5-w8&usqp=CAU"],
      AvailableSpace:"6",
      location: {
        fullAddress: "Calicut Beach, Kozhikode",
        district: "Kozhikode",
        state: "Kerala",
        latitude: 11.2588,
        longitude: 75.7804
      },
      priceRange: { min: 6000, max: 8000 },
      pgGenderCategory: "ladies",
      roomTypesAvailable: ["single", "double"],
      mealsProvided: ["breakfast", "dinner"],
      amenities: ["wifi", "ac", "hot_water"],
      rules: ["no_pet","No Alcohol","No Smoking Inside","Respect Privacy"],
      createdAt: "2025-04-29T14:00:00.000Z", contactPhone: "+91 9876543210",
      showPhonePublic: true,
      postedBy: {
        name: "Zainal Nizar",
    profileImage: "https://randomuser.me/api/portraits/men/61.jpg"
      }
    },
    {
      _id: "5",
      category: "pg_hostel",
      title: "Tech Stay Gents Hostel – Opposite Infopark, Kakkanad",
      description: "Well-maintained gents hostel located opposite Infopark main gate. Single and double sharing rooms available with cots, wardrobes, Wi-Fi, and hot water. Healthy home-cooked meals provided thrice daily. Walking distance to IT offices and bus stops. Suitable for male working professionals. Rent from ₹6,000/month including food.",
      images: ["https://content.jdmagicbox.com/comp/ernakulam/c5/0484px484.x484.170213124522.e2c5/catalogue/raees-gents-hostel-infopark-kochi-ernakulam-paying-guest-accommodations-4iqqfom.jpg","https://imagecdn.99acres.com/media1/15510/1/310201472M-1736920740750.webp","https://content.jdmagicbox.com/comp/ernakulam/k7/0484px484.x484.220316224821.e4k7/catalogue/fisat-pg-hostel-ernakulam-dormitory-services-kcjs0pycev.jpg"],
      location: {
        fullAddress: "Vytilla, Kochi",
        district: "Ernakulam",
        state: "Kerala",
        latitude: 9.9491,
        longitude: 76.3087
      },
      AvailableSpace:"6",
      priceRange: { min: 5000, max: 7000 },
      pgGenderCategory: "gents",
      roomTypesAvailable: ["single","Double","triple"],
      mealsProvided: ["lunch"],
      amenities: ["wifi","hot_water"],
      rules: ["no_pet","No Alcohol"],
      createdAt: "2025-04-30T09:15:00.000Z",
      contactPhone: "+91 9876543210",
      showPhonePublic: true,
      postedBy: {
    name: "Keerthi Saji",
    profileImage: "https://randomuser.me/api/portraits/women/58.jpg"
      }
    },
    {
      _id: "6",
      category: "flat_home",
      title: "2BHK Fully Furnished Flat near Kakkanad – Family-Friendly",
      description: "Spacious and well-lit 2BHK flat available for rent in a peaceful residential area near Kakkanad, Kochi. Ideal for small families or working couples. The apartment is fully furnished with sofa, dining table, double beds, wardrobes, fridge, washing machine, and modular kitchen. Located in a gated society with 24/7 security, lift, power backup, and covered parking.",
      images: [
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ0Jj-ej-IUUuFOUC28LXmhYfXrL3HttWa0g&s",
        "https://5.imimg.com/data5/SELLER/Default/2024/1/375486950/CM/VQ/OZ/10335204/furnished-rental-house-for-1-month-in-athirampuzha-near-caritas-hospital.jpeg",
        "https://4.imimg.com/data4/CT/HX/ANDROID-58662519/product-500x500.jpeg" // Standard flat kitchen
      ],
      location: {
        fullAddress: "Panampilly Nagar, Kochi",
        district: "Ernakulam",
        state: "Kerala",
        latitude: 9.9561,
        longitude: 76.2998
      },
      propertyType: "flat",
      furnishedStatus: "furnished",
      securityDeposit: 15000,
      squareFeet: 950,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      floorNumber: 2,
      totalFloors: 5,
      tenantPreference: "family",
      parking: "four_wheeler",
      createdAt: "2025-04-28T17:20:00.000Z",
      contactPhone: "+91 9876543210",
      showPhonePublic: true,
      postedBy: {
      name: "Rishan Jose",
    profileImage: "https://randomuser.me/api/portraits/men/57.jpg"
      },
      monthlyRent: 12000
    },
    {
      _id: "7",
      category: "flat_home",
      title: "Premium 2BHK Flat for Rent – Edappally Metro Vicinity",
      description: "Modern 2BHK flat located just 400m from Edappally Metro Station. Comes fully furnished with AC, beds, wardrobes, modular kitchen, and a spacious balcony with city view. Close to Lulu Mall, NH66, and well-connected to public transport. Ideal for families looking for a convenient and stylish place to stay.",
      images: ["https://preview.redd.it/how-to-rent-out-my-house-v0-9d42dssrddfc1.jpg?width=640&crop=smart&auto=webp&s=92bed3849c77aa9cdc764a69675e4481fa25d448","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3IYgsvCC7_GrW4mqlzJXiUHRbQfK3MPCh8g&s"],
      location: {
        fullAddress: "Palarivattom, Kochi",
        district: "Ernakulam",
        state: "Kerala",
        latitude: 9.9816,
        longitude: 76.2850
      },
      propertyType: "apartment",
      furnishedStatus: "semi-furnished",
      securityDeposit: 10000,
      squareFeet: 550,
      bedrooms: 1,
      bathrooms: 1,
      balconies: 0,
      floorNumber: 3,
      totalFloors: 4,
      tenantPreference: "any",
      parking: "two_wheeler",
      createdAt: "2025-04-26T11:40:00.000Z",
      contactPhone: "+91 9876543210",
      showPhonePublic: true,
      postedBy: {
        name: "Aarya Kuriakose",
    profileImage: "https://randomuser.me/api/portraits/women/56.jpg"
      },
      monthlyRent: 12000
    }
  ];
  