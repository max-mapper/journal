/**
 * Script to lookup Station Codes from Ekitan API for major Tokyo cities.
 *
 * Requirements: Node.js v18+ (for native fetch)
 * Usage: node get_tokyo_station_codes.js
 */

// 1. Define the list of Cities/Wards and their primary station + coordinates.
// The API does not return Lat/Lon, so we must provide it here to meet the output requirement.
const targetStations = [
  {
    kanji: "赤羽",
    en: "Akabane",
    lat: 35.778,
    lon: 139.721,
  },
  {
    kanji: "赤羽岩淵",
    en: "Akabane-Iwabuchi",
    lat: 35.7828,
    lon: 139.7214,
  },
  {
    kanji: "秋葉原",
    en: "Akihabara",
    lat: 35.6984,
    lon: 139.7731,
  },
  {
    kanji: "青砥",
    en: "Aoto",
    lat: 35.7456,
    lon: 139.8569,
  },
  {
    kanji: "浅草",
    en: "Asakusa",
    lat: 35.7115,
    lon: 139.7972,
  },
  {
    kanji: "熱海",
    en: "Atami",
    lat: 35.1037,
    lon: 139.0778,
  },
  {
    kanji: "千葉",
    en: "Chiba",
    lat: 35.6131,
    lon: 140.1132,
  },
  {
    kanji: "調布",
    en: "Chofu",
    lat: 35.6521,
    lon: 139.5441,
  },
  {
    kanji: "中央林間",
    en: "Chuo-Rinkan",
    lat: 35.5097,
    lon: 139.4447,
  },
  {
    kanji: "台場",
    en: "Daiba",
    lat: 35.6268,
    lon: 139.7704,
  },
  {
    kanji: "大門",
    en: "Daimon",
    lat: 35.6568,
    lon: 139.7547,
  },
  {
    kanji: "府中",
    en: "Fuchu",
    lat: 35.6721,
    lon: 139.4804,
  },
  {
    kanji: "府中本町",
    en: "Fuchu-Hommachi",
    lat: 35.6662,
    lon: 139.477,
  },
  {
    kanji: "二子玉川",
    en: "Futako-Tamagawa",
    lat: 35.6119,
    lon: 139.6264,
  },
  {
    kanji: "銀座",
    en: "Ginza",
    lat: 35.6712,
    lon: 139.765,
  },
  {
    kanji: "八王子",
    en: "Hachioji",
    lat: 35.6554,
    lon: 139.339,
  },
  {
    kanji: "拝島",
    en: "Haijima",
    lat: 35.7212,
    lon: 139.3546,
  },
  {
    kanji: "浜松町",
    en: "Hamamatsucho",
    lat: 35.6554,
    lon: 139.7571,
  },
  {
    kanji: "羽田空港第2ターミナル",
    en: "Haneda Airport Terminal 2",
    lat: 35.5516,
    lon: 139.7865,
  },
  {
    kanji: "飯能",
    en: "Hanno",
    lat: 35.8512,
    lon: 139.3175,
  },
  {
    kanji: "日比谷",
    en: "Hibiya",
    lat: 35.6751,
    lon: 139.7601,
  },
  {
    kanji: "光が丘",
    en: "Hikarigaoka",
    lat: 35.7592,
    lon: 139.6293,
  },
  {
    kanji: "本厚木",
    en: "Hon-Atsugi",
    lat: 35.4402,
    lon: 139.3639,
  },
  {
    kanji: "本川越",
    en: "Hon-Kawagoe",
    lat: 35.9136,
    lon: 139.4816,
  },
  {
    kanji: "市ヶ谷",
    en: "Ichigaya",
    lat: 35.691,
    lon: 139.7356,
  },
  {
    kanji: "飯田橋",
    en: "Iidabashi",
    lat: 35.702,
    lon: 139.745,
  },
  {
    kanji: "池袋",
    en: "Ikebukuro",
    lat: 35.7295,
    lon: 139.7109,
  },
  {
    kanji: "神保町",
    en: "Jimbocho",
    lat: 35.6959,
    lon: 139.7583,
  },
  {
    kanji: "自由が丘",
    en: "Jiyugaoka",
    lat: 35.6074,
    lon: 139.6687,
  },
  {
    kanji: "海浜幕張",
    en: "Kaihin-Makuhari",
    lat: 35.6484,
    lon: 140.0419,
  },
  {
    kanji: "鎌倉",
    en: "Kamakura",
    lat: 35.319,
    lon: 139.5504,
  },
  {
    kanji: "上大岡",
    en: "Kami-Ooka",
    lat: 35.4093,
    lon: 139.596,
  },
  {
    kanji: "柏",
    en: "Kashiwa",
    lat: 35.8544,
    lon: 139.9689,
  },
  {
    kanji: "霞ケ関",
    en: "Kasumigaseki",
    lat: 35.6749,
    lon: 139.7516,
  },
  {
    kanji: "川越",
    en: "Kawagoe",
    lat: 35.9086,
    lon: 139.4853,
  },
  {
    kanji: "川崎",
    en: "Kawasaki",
    lat: 35.5314,
    lon: 139.6969,
  },
  {
    kanji: "京急蒲田",
    en: "Keikyu Kamata",
    lat: 35.5611,
    lon: 139.7245,
  },
  {
    kanji: "京王八王子",
    en: "Keio-Hachioji",
    lat: 35.6575,
    lon: 139.3444,
  },
  {
    kanji: "京成船橋",
    en: "Keisei Funabashi",
    lat: 35.7004,
    lon: 139.9854,
  },
  {
    kanji: "京成上野",
    en: "Keisei Ueno",
    lat: 35.7113,
    lon: 139.775,
  },
  {
    kanji: "吉祥寺",
    en: "Kichijoji",
    lat: 35.7031,
    lon: 139.5798,
  },
  {
    kanji: "錦糸町",
    en: "Kinshicho",
    lat: 35.6967,
    lon: 139.8144,
  },
  {
    kanji: "北綾瀬",
    en: "Kita-Ayase",
    lat: 35.7766,
    lon: 139.8296,
  },
  {
    kanji: "北千住",
    en: "Kita-Senju",
    lat: 35.7494,
    lon: 139.8051,
  },
  {
    kanji: "国際展示場",
    en: "Kokusai-Tenjijo",
    lat: 35.6346,
    lon: 139.7941,
  },
  {
    kanji: "久里浜",
    en: "Kurihama",
    lat: 35.2307,
    lon: 139.7026,
  },
  {
    kanji: "町田",
    en: "Machida",
    lat: 35.542,
    lon: 139.4455,
  },
  {
    kanji: "舞浜",
    en: "Maihama",
    lat: 35.6366,
    lon: 139.8837,
  },
  {
    kanji: "松戸",
    en: "Matsudo",
    lat: 35.7844,
    lon: 139.9022,
  },
  {
    kanji: "目黒",
    en: "Meguro",
    lat: 35.634,
    lon: 139.7157,
  },
  {
    kanji: "明大前",
    en: "Meidaimae",
    lat: 35.6685,
    lon: 139.6504,
  },
  {
    kanji: "南流山",
    en: "Minami-Nagareyama",
    lat: 35.8385,
    lon: 139.9038,
  },
  {
    kanji: "南浦和",
    en: "Minami-Urawa",
    lat: 35.8478,
    lon: 139.6692,
  },
  {
    kanji: "三田",
    en: "Mita",
    lat: 35.648,
    lon: 139.7424,
  },
  {
    kanji: "三鷹",
    en: "Mitaka",
    lat: 35.7027,
    lon: 139.5606,
  },
  {
    kanji: "水戸",
    en: "Mito",
    lat: 36.3712,
    lon: 140.4764,
  },
  {
    kanji: "本八幡",
    en: "Moto-Yawata",
    lat: 35.7208,
    lon: 139.9272,
  },
  {
    kanji: "武蔵小杉",
    en: "Musashi-Kosugi",
    lat: 35.5755,
    lon: 139.6596,
  },
  {
    kanji: "永田町",
    en: "Nagatacho",
    lat: 35.679,
    lon: 139.7432,
  },
  {
    kanji: "中目黒",
    en: "Naka-Meguro",
    lat: 35.6444,
    lon: 139.6991,
  },
  {
    kanji: "中野",
    en: "Nakano",
    lat: 35.7058,
    lon: 139.6658,
  },
  {
    kanji: "成増",
    en: "Narimasu",
    lat: 35.7777,
    lon: 139.6307,
  },
  {
    kanji: "成田空港",
    en: "Narita Airport",
    lat: 35.7649,
    lon: 140.3863,
  },
  {
    kanji: "練馬",
    en: "Nerima",
    lat: 35.7378,
    lon: 139.6543,
  },
  {
    kanji: "日本橋",
    en: "Nihombashi",
    lat: 35.6811,
    lon: 139.7744,
  },
  {
    kanji: "日暮里",
    en: "Nippori",
    lat: 35.7278,
    lon: 139.7709,
  },
  {
    kanji: "西船橋",
    en: "Nishi-Funabashi",
    lat: 35.7075,
    lon: 139.9592,
  },
  {
    kanji: "西国分寺",
    en: "Nishi-Kokubunji",
    lat: 35.6997,
    lon: 139.4659,
  },
  {
    kanji: "西馬込",
    en: "Nishi-Magome",
    lat: 35.5869,
    lon: 139.7058,
  },
  {
    kanji: "西日暮里",
    en: "Nishi-Nippori",
    lat: 35.7321,
    lon: 139.7668,
  },
  {
    kanji: "西高島平",
    en: "Nishi-Takashimadaira",
    lat: 35.7938,
    lon: 139.6542,
  },
  {
    kanji: "西新井",
    en: "Nishiarai",
    lat: 35.7775,
    lon: 139.7904,
  },
  {
    kanji: "登戸",
    en: "Noborito",
    lat: 35.6206,
    lon: 139.5699,
  },
  {
    kanji: "小田原",
    en: "Odawara",
    lat: 35.2562,
    lon: 139.1553,
  },
  {
    kanji: "大船",
    en: "Ofuna",
    lat: 35.3536,
    lon: 139.5312,
  },
  {
    kanji: "小川町",
    en: "Ogawamachi",
    lat: 36.0583,
    lon: 139.2608,
  },
  {
    kanji: "荻窪",
    en: "Ogikubo",
    lat: 35.7053,
    lon: 139.62,
  },
  {
    kanji: "大井町",
    en: "Oimachi",
    lat: 35.6075,
    lon: 139.7348,
  },
  {
    kanji: "奥多摩",
    en: "Okutama",
    lat: 35.8093,
    lon: 139.0963,
  },
  {
    kanji: "青梅",
    en: "Ome",
    lat: 35.7905,
    lon: 139.2745,
  },
  {
    kanji: "大宮",
    en: "Omiya",
    lat: 35.9063,
    lon: 139.624,
  },
  {
    kanji: "表参道",
    en: "Omotesando",
    lat: 35.6652,
    lon: 139.7123,
  },
  {
    kanji: "大崎",
    en: "Osaki",
    lat: 35.6197,
    lon: 139.7283,
  },
  {
    kanji: "押上",
    en: "Oshiage",
    lat: 35.7107,
    lon: 139.8129,
  },
  {
    kanji: "大手町",
    en: "Otemachi",
    lat: 35.6848,
    lon: 139.763,
  },
  {
    kanji: "六本木",
    en: "Roppongi",
    lat: 35.6641,
    lon: 139.7343,
  },
  {
    kanji: "両国",
    en: "Ryogoku",
    lat: 35.6961,
    lon: 139.7928,
  },
  {
    kanji: "三軒茶屋",
    en: "Sangen-Jaya",
    lat: 35.6439,
    lon: 139.6713,
  },
  {
    kanji: "笹塚",
    en: "Sasazuka",
    lat: 35.6736,
    lon: 139.6671,
  },
  {
    kanji: "西武新宿",
    en: "Seibu-Shinjuku",
    lat: 35.6953,
    lon: 139.7003,
  },
  {
    kanji: "泉岳寺",
    en: "Sengakuji",
    lat: 35.6384,
    lon: 139.7402,
  },
  {
    kanji: "石神井公園",
    en: "Shakujii-koen",
    lat: 35.7436,
    lon: 139.6063,
  },
  {
    kanji: "渋谷",
    en: "Shibuya",
    lat: 35.658,
    lon: 139.7016,
  },
  {
    kanji: "新橋",
    en: "Shimbashi",
    lat: 35.6664,
    lon: 139.7583,
  },
  {
    kanji: "下北沢",
    en: "Shimokitazawa",
    lat: 35.662,
    lon: 139.667,
  },
  {
    kanji: "新木場",
    en: "Shin-Kiba",
    lat: 35.6462,
    lon: 139.8273,
  },
  {
    kanji: "新松戸",
    en: "Shin-Matsudo",
    lat: 35.8256,
    lon: 139.9213,
  },
  {
    kanji: "新浦安",
    en: "Shin-Urayasu",
    lat: 35.6493,
    lon: 139.9126,
  },
  {
    kanji: "品川",
    en: "Shinagawa",
    lat: 35.6285,
    lon: 139.7387,
  },
  {
    kanji: "新宿",
    en: "Shinjuku",
    lat: 35.6896,
    lon: 139.7006,
  },
  {
    kanji: "新宿三丁目",
    en: "Shinjuku-sanchome",
    lat: 35.6908,
    lon: 139.7047,
  },
  {
    kanji: "蘇我",
    en: "Soga",
    lat: 35.5822,
    lon: 140.1309,
  },
  {
    kanji: "巣鴨",
    en: "Sugamo",
    lat: 35.7334,
    lon: 139.7395,
  },
  {
    kanji: "立川",
    en: "Tachikawa",
    lat: 35.6978,
    lon: 139.4137,
  },
  {
    kanji: "高田馬場",
    en: "Takadanobaba",
    lat: 35.7132,
    lon: 139.7046,
  },
  {
    kanji: "高尾",
    en: "Takao",
    lat: 35.642,
    lon: 139.282,
  },
  {
    kanji: "多摩センター",
    en: "Tama-Center",
    lat: 35.6247,
    lon: 139.4239,
  },
  {
    kanji: "たまプラーザ",
    en: "Tama-Plaza",
    lat: 35.5786,
    lon: 139.5583,
  },
  {
    kanji: "田無",
    en: "Tanashi",
    lat: 35.7281,
    lon: 139.5401,
  },
  {
    kanji: "天王洲アイル",
    en: "Tennozu Isle",
    lat: 35.6212,
    lon: 139.746,
  },
  {
    kanji: "東武動物公園",
    en: "Tobu-Dobutsu-Koen",
    lat: 36.0249,
    lon: 139.7275,
  },
  {
    kanji: "都庁前",
    en: "Tochomae",
    lat: 35.6891,
    lon: 139.6917,
  },
  {
    kanji: "所沢",
    en: "Tokorozawa",
    lat: 35.7864,
    lon: 139.4678,
  },
  {
    kanji: "東京",
    en: "Tokyo",
    lat: 35.6812,
    lon: 139.7671,
  },
  {
    kanji: "とうきょうスカイツリー",
    en: "Tokyo Skytree",
    lat: 35.7105,
    lon: 139.8095,
  },
  {
    kanji: "東京テレポート",
    en: "Tokyo Teleport",
    lat: 35.6276,
    lon: 139.7801,
  },
  {
    kanji: "東陽町",
    en: "Toyocho",
    lat: 35.6698,
    lon: 139.8174,
  },
  {
    kanji: "豊洲",
    en: "Toyosu",
    lat: 35.6552,
    lon: 139.7964,
  },
  {
    kanji: "月島",
    en: "Tsukishima",
    lat: 35.6644,
    lon: 139.7844,
  },
  {
    kanji: "つくば",
    en: "Tsukuba",
    lat: 36.0827,
    lon: 140.1114,
  },
  {
    kanji: "上野",
    en: "Ueno",
    lat: 35.7141,
    lon: 139.7774,
  },
  {
    kanji: "浦賀",
    en: "Uraga",
    lat: 35.2514,
    lon: 139.7153,
  },
  {
    kanji: "和光市",
    en: "Wakoshi",
    lat: 35.7884,
    lon: 139.6123,
  },
  {
    kanji: "横浜",
    en: "Yokohama",
    lat: 35.4658,
    lon: 139.6223,
  },
  {
    kanji: "四ツ谷",
    en: "Yotsuya",
    lat: 35.686,
    lon: 139.7307,
  },
  {
    kanji: "代々木上原",
    en: "Yoyogi-Uehara",
    lat: 35.6691,
    lon: 139.6797,
  },
  {
    kanji: "有楽町",
    en: "Yurakucho",
    lat: 35.675,
    lon: 139.7628,
  },
];

// Helper to wait between requests
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchStationCode(station) {
  const encodedName = encodeURIComponent(station.kanji);
  const url = `https://mob-gw.ekitan.com/inc/v2/n_station_ex?q=${encodedName}&c=`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-JP,en;q=0.9,ja-JP;q=0.8,ja;q=0.7",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        Referer: "https://ekitan.com/",
      },
      method: "GET",
    });

    if (!response.ok) {
      console.error(`Error fetching ${station.kanji}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // Data format is usually: [{ more: false, result: [ { code, name, ... } ] }]
    if (data && data[0] && data[0].result && data[0].result.length > 0) {
      const resultData = data[0].result[0]; // Take the top match

      return {
        station_name_kanji: station.kanji,
        station_name_en: station.en,
        lat: station.lat,
        lon: station.lon,
        station_code: resultData.code,
      };
    } else {
      console.warn(`No results found for ${station.kanji}`);
      return null;
    }
  } catch (error) {
    console.error(`Network error for ${station.kanji}:`, error.message);
    return null;
  }
}

async function main() {
  console.error(`Processing ${targetStations.length} stations...`);
  const results = [];

  for (const station of targetStations) {
    // Fetch data
    const data = await fetchStationCode(station);
    if (data) {
      results.push(data);
      console.error(
        `[OK] ${station.en} (${station.kanji}) -> Code: ${data.station_code}`
      );
    }

    // Wait 1 second to be polite to the API
    await sleep(1000);
  }

  console.error("\n--- Final Result JSON ---");
  console.log(JSON.stringify(results, null, 2));
}

main();
