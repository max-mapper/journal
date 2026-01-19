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
    kanji: "東京",
    en: "Tokyo",
    lat: 35.6812,
    lon: 139.7671,
  },
  {
    kanji: "新宿",
    en: "Shinjuku",
    lat: 35.6909,
    lon: 139.7005,
  },
  {
    kanji: "池袋",
    en: "Ikebukuro",
    lat: 35.7295,
    lon: 139.7109,
  },
  {
    kanji: "渋谷",
    en: "Shibuya",
    lat: 35.658,
    lon: 139.7016,
  },
  {
    kanji: "上野",
    en: "Ueno",
    lat: 35.7137,
    lon: 139.7774,
  },
  {
    kanji: "品川",
    en: "Shinagawa",
    lat: 35.6285,
    lon: 139.7392,
  },
  {
    kanji: "浅草",
    en: "Asakusa",
    lat: 35.7106,
    lon: 139.7966,
  },
  {
    kanji: "北千住",
    en: "Kita-Senju",
    lat: 35.7494,
    lon: 139.8051,
  },
  {
    kanji: "八王子",
    en: "Hachioji",
    lat: 35.6556,
    lon: 139.3389,
  },
  {
    kanji: "立川",
    en: "Tachikawa",
    lat: 35.6983,
    lon: 139.4139,
  },
  {
    kanji: "青梅",
    en: "Ome",
    lat: 35.7906,
    lon: 139.2582,
  },
  {
    kanji: "奥多摩",
    en: "Okutama",
    lat: 35.8096,
    lon: 139.0962,
  },
  {
    kanji: "日暮里",
    en: "Nippori",
    lat: 35.7281,
    lon: 139.7706,
  },
  {
    kanji: "京成上野",
    en: "Keisei-Ueno",
    lat: 35.7109,
    lon: 139.7735,
  },
  {
    kanji: "豊洲",
    en: "Toyosu",
    lat: 35.655,
    lon: 139.7961,
  },
  {
    kanji: "西武新宿",
    en: "Seibu-Shinjuku",
    lat: 35.6958,
    lon: 139.7,
  },
  {
    kanji: "高尾山口",
    en: "Takaosanguchi",
    lat: 35.6322,
    lon: 139.2699,
  },
  {
    kanji: "大宮",
    en: "Omiya",
    lat: 35.9064,
    lon: 139.6239,
  },
  {
    kanji: "熊谷",
    en: "Kumagaya",
    lat: 36.14,
    lon: 139.39,
  },
  {
    kanji: "本川越",
    en: "Hon-Kawagoe",
    lat: 35.9138,
    lon: 139.4812,
  },
  {
    kanji: "飯能",
    en: "Hanno",
    lat: 35.8515,
    lon: 139.3184,
  },
  {
    kanji: "西武秩父",
    en: "Seibu-Chichibu",
    lat: 35.9901,
    lon: 139.0831,
  },
  {
    kanji: "所沢",
    en: "Tokorozawa",
    lat: 35.787,
    lon: 139.4734,
  },
  {
    kanji: "春日部",
    en: "Kasukabe",
    lat: 35.98,
    lon: 139.7526,
  },
  {
    kanji: "小川町",
    en: "Ogawamachi",
    lat: 36.0589,
    lon: 139.2608,
  },
  {
    kanji: "横浜",
    en: "Yokohama",
    lat: 35.4658,
    lon: 139.6223,
  },
  {
    kanji: "新横浜",
    en: "Shin-Yokohama",
    lat: 35.5086,
    lon: 139.6175,
  },
  {
    kanji: "小田原",
    en: "Odawara",
    lat: 35.2564,
    lon: 139.155,
  },
  {
    kanji: "箱根湯本",
    en: "Hakone-Yumoto",
    lat: 35.2333,
    lon: 139.1039,
  },
  {
    kanji: "片瀬江ノ島",
    en: "Katase-Enoshima",
    lat: 35.3089,
    lon: 139.4833,
  },
  {
    kanji: "藤沢",
    en: "Fujisawa",
    lat: 35.3372,
    lon: 139.4872,
  },
  {
    kanji: "鎌倉",
    en: "Kamakura",
    lat: 35.319,
    lon: 139.5504,
  },
  {
    kanji: "横須賀",
    en: "Yokosuka",
    lat: 35.2842,
    lon: 139.655,
  },
  {
    kanji: "三崎口",
    en: "Misakiguchi",
    lat: 35.1769,
    lon: 139.6297,
  },
  {
    kanji: "海老名",
    en: "Ebina",
    lat: 35.4528,
    lon: 139.3908,
  },
  {
    kanji: "湘南台",
    en: "Shonandai",
    lat: 35.3962,
    lon: 139.4666,
  },
  {
    kanji: "元町・中華街",
    en: "Motomachi-Chukagai",
    lat: 35.4422,
    lon: 139.6508,
  },
  {
    kanji: "橋本",
    en: "Hashimoto",
    lat: 35.5947,
    lon: 139.3444,
  },
  {
    kanji: "千葉",
    en: "Chiba",
    lat: 35.6134,
    lon: 140.1133,
  },
  {
    kanji: "成田空港",
    en: "Narita Airport",
    lat: 35.7658,
    lon: 140.3863,
  },
  {
    kanji: "銚子",
    en: "Choshi",
    lat: 35.7292,
    lon: 140.8275,
  },
  {
    kanji: "館山",
    en: "Tateyama",
    lat: 34.9965,
    lon: 139.8699,
  },
  {
    kanji: "船橋",
    en: "Funabashi",
    lat: 35.7017,
    lon: 139.9852,
  },
  {
    kanji: "安房鴨川",
    en: "Awa-Kamogawa",
    lat: 35.1076,
    lon: 140.1037,
  },
  {
    kanji: "勝浦",
    en: "Katsuura",
    lat: 35.1529,
    lon: 140.312,
  },
  {
    kanji: "宇都宮",
    en: "Utsunomiya",
    lat: 36.5595,
    lon: 139.8985,
  },
  {
    kanji: "那須塩原",
    en: "Nasushiobara",
    lat: 36.9316,
    lon: 140.0207,
  },
  {
    kanji: "東武日光",
    en: "Tobu-Nikko",
    lat: 36.7481,
    lon: 139.6201,
  },
  {
    kanji: "鬼怒川温泉",
    en: "Kinugawa-Onsen",
    lat: 36.8227,
    lon: 139.7163,
  },
  {
    kanji: "甲府",
    en: "Kofu",
    lat: 35.6672,
    lon: 138.569,
  },
  {
    kanji: "大月",
    en: "Otsuki",
    lat: 35.6132,
    lon: 138.9427,
  },
  {
    kanji: "小淵沢",
    en: "Kobuchizawa",
    lat: 35.8635,
    lon: 138.3169,
  },
  {
    kanji: "河口湖",
    en: "Kawaguchiko",
    lat: 35.4983,
    lon: 138.7686,
  },
  {
    kanji: "富士山",
    en: "Mt. Fuji (Fujisan)",
    lat: 35.4836,
    lon: 138.7958,
  },
  {
    kanji: "熱海",
    en: "Atami",
    lat: 35.1033,
    lon: 139.0778,
  },
  {
    kanji: "三島",
    en: "Mishima",
    lat: 35.1272,
    lon: 138.9106,
  },
  {
    kanji: "伊東",
    en: "Ito",
    lat: 34.9748,
    lon: 139.0922,
  },
  {
    kanji: "伊豆急下田",
    en: "Izukyu-Shimoda",
    lat: 34.6792,
    lon: 138.9444,
  },
  {
    kanji: "修善寺",
    en: "Shuzenji",
    lat: 34.9791,
    lon: 138.9505,
  },
  {
    kanji: "沼津",
    en: "Numazu",
    lat: 35.1031,
    lon: 138.8593,
  },
  {
    kanji: "御殿場",
    en: "Gotemba",
    lat: 35.3005,
    lon: 138.9344,
  },
  {
    kanji: "富士",
    en: "Fuji",
    lat: 35.1515,
    lon: 138.6512,
  },
  {
    kanji: "新富士",
    en: "Shin-Fuji",
    lat: 35.1424,
    lon: 138.6632,
  },
  {
    kanji: "富士宮",
    en: "Fujinomiya",
    lat: 35.2214,
    lon: 138.6153,
  },
  {
    kanji: "静岡",
    en: "Shizuoka",
    lat: 34.9716,
    lon: 138.3891,
  },
  {
    kanji: "掛川",
    en: "Kakegawa",
    lat: 34.7697,
    lon: 138.015,
  },
  {
    kanji: "浜松",
    en: "Hamamatsu",
    lat: 34.7036,
    lon: 137.7344,
  },
  {
    kanji: "金谷",
    en: "Kanaya",
    lat: 34.8191,
    lon: 138.1255,
  },
  {
    kanji: "千頭",
    en: "Senzu",
    lat: 35.1078,
    lon: 138.1366,
  },
  {
    kanji: "大崎",
    en: "Osaki",
    lat: 35.6197,
    lon: 139.7282,
  },
  {
    kanji: "田端",
    en: "Tabata",
    lat: 35.7381,
    lon: 139.7608,
  },
  {
    kanji: "磯子",
    en: "Isogo",
    lat: 35.4005,
    lon: 139.6179,
  },
  {
    kanji: "大船",
    en: "Ofuna",
    lat: 35.3541,
    lon: 139.5313,
  },
  {
    kanji: "逗子",
    en: "Zushi",
    lat: 35.2974,
    lon: 139.5786,
  },
  {
    kanji: "久里浜",
    en: "Kurihama",
    lat: 35.2312,
    lon: 139.7027,
  },
  {
    kanji: "高尾",
    en: "Takao",
    lat: 35.642,
    lon: 139.2822,
  },
  {
    kanji: "武蔵五日市",
    en: "Musashi-Itsukaichi",
    lat: 35.7326,
    lon: 139.2281,
  },
  {
    kanji: "拝島",
    en: "Haijima",
    lat: 35.7212,
    lon: 139.3435,
  },
  {
    kanji: "三鷹",
    en: "Mitaka",
    lat: 35.7027,
    lon: 139.5606,
  },
  {
    kanji: "御茶ノ水",
    en: "Ochanomizu",
    lat: 35.6996,
    lon: 139.7649,
  },
  {
    kanji: "蘇我",
    en: "Soga",
    lat: 35.5815,
    lon: 140.1309,
  },
  {
    kanji: "桜木町",
    en: "Sakuragicho",
    lat: 35.451,
    lon: 139.6312,
  },
  {
    kanji: "茅ヶ崎",
    en: "Chigasaki",
    lat: 35.3304,
    lon: 139.4068,
  },
  {
    kanji: "南浦和",
    en: "Minami-Urawa",
    lat: 35.8478,
    lon: 139.6692,
  },
  {
    kanji: "川越",
    en: "Kawagoe",
    lat: 35.9071,
    lon: 139.4828,
  },
  {
    kanji: "高麗川",
    en: "Komagawa",
    lat: 35.8955,
    lon: 139.3385,
  },
  {
    kanji: "川崎",
    en: "Kawasaki",
    lat: 35.5313,
    lon: 139.6975,
  },
  {
    kanji: "鶴見",
    en: "Tsurumi",
    lat: 35.5085,
    lon: 139.6761,
  },
  {
    kanji: "海芝浦",
    en: "Umi-Shibaura",
    lat: 35.4855,
    lon: 139.7001,
  },
  {
    kanji: "成田",
    en: "Narita",
    lat: 35.7766,
    lon: 140.3142,
  },
  {
    kanji: "我孫子",
    en: "Abiko",
    lat: 35.8732,
    lon: 140.0105,
  },
  {
    kanji: "木更津",
    en: "Kisarazu",
    lat: 35.3814,
    lon: 139.9264,
  },
  {
    kanji: "君津",
    en: "Kimitsu",
    lat: 35.3341,
    lon: 139.8952,
  },
  {
    kanji: "上総亀山",
    en: "Kazusa-Kameyama",
    lat: 35.2348,
    lon: 140.0631,
  },
  {
    kanji: "大網",
    en: "Oami",
    lat: 35.5204,
    lon: 140.3096,
  },
  {
    kanji: "日光",
    en: "Nikko",
    lat: 36.7472,
    lon: 139.619,
  },
  {
    kanji: "黒磯",
    en: "Kuroiso",
    lat: 36.9701,
    lon: 140.0594,
  },
  {
    kanji: "小山",
    en: "Oyama",
    lat: 36.3128,
    lon: 139.8064,
  },
  {
    kanji: "烏山",
    en: "Karasuyama",
    lat: 36.6508,
    lon: 140.1506,
  },
  {
    kanji: "国府津",
    en: "Kozu",
    lat: 35.2811,
    lon: 139.2141,
  },
  {
    kanji: "荻窪",
    en: "Ogikubo",
    lat: 35.7047,
    lon: 139.6199,
  },
  {
    kanji: "方南町",
    en: "Honancho",
    lat: 35.6837,
    lon: 139.6599,
  },
  {
    kanji: "中目黒",
    en: "Naka-Meguro",
    lat: 35.6443,
    lon: 139.6991,
  },
  {
    kanji: "中野",
    en: "Nakano",
    lat: 35.7057,
    lon: 139.6657,
  },
  {
    kanji: "西船橋",
    en: "Nishi-Funabashi",
    lat: 35.7075,
    lon: 139.9592,
  },
  {
    kanji: "綾瀬",
    en: "Ayase",
    lat: 35.7621,
    lon: 139.8243,
  },
  {
    kanji: "代々木上原",
    en: "Yoyogi-Uehara",
    lat: 35.6691,
    lon: 139.6797,
  },
  {
    kanji: "和光市",
    en: "Wakoshi",
    lat: 35.7884,
    lon: 139.6124,
  },
  {
    kanji: "新木場",
    en: "Shin-Kiba",
    lat: 35.6459,
    lon: 139.8262,
  },
  {
    kanji: "押上",
    en: "Oshiage",
    lat: 35.7103,
    lon: 139.8132,
  },
  {
    kanji: "目黒",
    en: "Meguro",
    lat: 35.6339,
    lon: 139.7158,
  },
  {
    kanji: "赤羽岩淵",
    en: "Akabane-Iwabuchi",
    lat: 35.7834,
    lon: 139.7214,
  },
  {
    kanji: "西馬込",
    en: "Nishi-Magome",
    lat: 35.5869,
    lon: 139.7061,
  },
  {
    kanji: "西高島平",
    en: "Nishi-Takashimadaira",
    lat: 35.7909,
    lon: 139.6465,
  },
  {
    kanji: "本八幡",
    en: "Moto-Yawata",
    lat: 35.7206,
    lon: 139.9272,
  },
  {
    kanji: "光が丘",
    en: "Hikarigaoka",
    lat: 35.7584,
    lon: 139.6293,
  },
  {
    kanji: "都庁前",
    en: "Tochomae",
    lat: 35.6908,
    lon: 139.6917,
  },
  {
    kanji: "あざみ野",
    en: "Azamino",
    lat: 35.5683,
    lon: 139.554,
  },
  {
    kanji: "中山",
    en: "Nakayama",
    lat: 35.5147,
    lon: 139.5401,
  },
  {
    kanji: "日吉",
    en: "Hiyoshi",
    lat: 35.5534,
    lon: 139.6468,
  },
  {
    kanji: "東武動物公園",
    en: "Tobu-Dobutsu-Koen",
    lat: 36.0249,
    lon: 139.7262,
  },
  {
    kanji: "亀戸",
    en: "Kameido",
    lat: 35.6974,
    lon: 139.8262,
  },
  {
    kanji: "大師前",
    en: "Daishimae",
    lat: 35.7845,
    lon: 139.782,
  },
  {
    kanji: "新藤原",
    en: "Shin-Fujiwara",
    lat: 36.8732,
    lon: 139.7151,
  },
  {
    kanji: "下今市",
    en: "Shimo-Imaichi",
    lat: 36.7247,
    lon: 139.6922,
  },
  {
    kanji: "柏",
    en: "Kashiwa",
    lat: 35.8622,
    lon: 139.9709,
  },
  {
    kanji: "坂戸",
    en: "Sakado",
    lat: 35.9567,
    lon: 139.3957,
  },
  {
    kanji: "越生",
    en: "Ogose",
    lat: 35.9626,
    lon: 139.2995,
  },
  {
    kanji: "寄居",
    en: "Yorii",
    lat: 36.1182,
    lon: 139.1947,
  },
  {
    kanji: "練馬",
    en: "Nerima",
    lat: 35.7374,
    lon: 139.6548,
  },
  {
    kanji: "西武球場前",
    en: "Seibukyujo-mae",
    lat: 35.7709,
    lon: 139.4206,
  },
  {
    kanji: "小平",
    en: "Kodaira",
    lat: 35.7371,
    lon: 139.4883,
  },
  {
    kanji: "西武園",
    en: "Seibuen",
    lat: 35.7656,
    lon: 139.4497,
  },
  {
    kanji: "国分寺",
    en: "Kokubunji",
    lat: 35.7001,
    lon: 139.4802,
  },
  {
    kanji: "多摩湖",
    en: "Tamako",
    lat: 35.7618,
    lon: 139.4312,
  },
  {
    kanji: "京成津田沼",
    en: "Keisei-Tsudanuma",
    lat: 35.6838,
    lon: 140.0249,
  },
  {
    kanji: "千葉中央",
    en: "Chiba-Chuo",
    lat: 35.6094,
    lon: 140.1192,
  },
  {
    kanji: "京成高砂",
    en: "Keisei-Takasago",
    lat: 35.7511,
    lon: 139.8669,
  },
  {
    kanji: "印旛日本医大",
    en: "Inba-Nihon-Idai",
    lat: 35.7876,
    lon: 140.1997,
  },
  {
    kanji: "京王八王子",
    en: "Keio-Hachioji",
    lat: 35.6576,
    lon: 139.3421,
  },
  {
    kanji: "調布",
    en: "Chofu",
    lat: 35.6521,
    lon: 139.5445,
  },
  {
    kanji: "吉祥寺",
    en: "Kichijoji",
    lat: 35.7031,
    lon: 139.5798,
  },
  {
    kanji: "高幡不動",
    en: "Takahatafudo",
    lat: 35.6617,
    lon: 139.4128,
  },
  {
    kanji: "多摩動物公園",
    en: "Tama-Dobutsu-Koen",
    lat: 35.6499,
    lon: 139.4045,
  },
  {
    kanji: "相模大野",
    en: "Sagami-Ono",
    lat: 35.5317,
    lon: 139.4379,
  },
  {
    kanji: "新百合ヶ丘",
    en: "Shin-Yurigaoka",
    lat: 35.6041,
    lon: 139.5074,
  },
  {
    kanji: "唐木田",
    en: "Karakida",
    lat: 35.6148,
    lon: 139.4116,
  },
  {
    kanji: "大井町",
    en: "Oimachi",
    lat: 35.6074,
    lon: 139.7348,
  },
  {
    kanji: "溝の口",
    en: "Mizonokuchi",
    lat: 35.6001,
    lon: 139.6106,
  },
  {
    kanji: "中央林間",
    en: "Chuo-Rinkan",
    lat: 35.5085,
    lon: 139.4442,
  },
  {
    kanji: "五反田",
    en: "Gotanda",
    lat: 35.6264,
    lon: 139.7236,
  },
  {
    kanji: "蒲田",
    en: "Kamata",
    lat: 35.5624,
    lon: 139.716,
  },
  {
    kanji: "こどもの国",
    en: "Kodomonokuni",
    lat: 35.5583,
    lon: 139.4883,
  },
  {
    kanji: "長津田",
    en: "Nagatsuta",
    lat: 35.5319,
    lon: 139.495,
  },
  {
    kanji: "三軒茶屋",
    en: "Sangen-Jaya",
    lat: 35.6437,
    lon: 139.669,
  },
  {
    kanji: "泉岳寺",
    en: "Sengakuji",
    lat: 35.6377,
    lon: 139.7408,
  },
  {
    kanji: "浦賀",
    en: "Uraga",
    lat: 35.2505,
    lon: 139.7153,
  },
  {
    kanji: "京急蒲田",
    en: "Keikyu-Kamata",
    lat: 35.5611,
    lon: 139.7233,
  },
  {
    kanji: "羽田空港第1・第2ターミナル",
    en: "Haneda Airport T1/T2",
    lat: 35.5492,
    lon: 139.7845,
  },
  {
    kanji: "金沢八景",
    en: "Kanazawa-Hakkei",
    lat: 35.3314,
    lon: 139.62,
  },
  {
    kanji: "逗子・葉山",
    en: "Zushi-Hayama",
    lat: 35.2982,
    lon: 139.5824,
  },
  {
    kanji: "西谷",
    en: "Nishiya",
    lat: 35.4783,
    lon: 139.5658,
  },
  {
    kanji: "浜松町",
    en: "Hamamatsucho",
    lat: 35.6554,
    lon: 139.7571,
  },
  {
    kanji: "新橋",
    en: "Shimbashi",
    lat: 35.6655,
    lon: 139.7597,
  },
  {
    kanji: "秋葉原",
    en: "Akihabara",
    lat: 35.6984,
    lon: 139.7731,
  },
  {
    kanji: "多摩センター",
    en: "Tama-Center",
    lat: 35.6247,
    lon: 139.4239,
  },
  {
    kanji: "新杉田",
    en: "Shin-Sugita",
    lat: 35.3857,
    lon: 139.6198,
  },
  {
    kanji: "湘南江の島",
    en: "Shonan-Enoshima",
    lat: 35.3117,
    lon: 139.4867,
  },
  {
    kanji: "強羅",
    en: "Gora",
    lat: 35.2506,
    lon: 139.0483,
  },
  {
    kanji: "早雲山",
    en: "Sounzan",
    lat: 35.2464,
    lon: 139.0378,
  },
  {
    kanji: "大雄山",
    en: "Daiyuzan",
    lat: 35.3188,
    lon: 139.1026,
  },
  {
    kanji: "伊勢原",
    en: "Isehara",
    lat: 35.3961,
    lon: 139.3148,
  },
  {
    kanji: "浦和美園",
    en: "Urawa-Misono",
    lat: 35.8943,
    lon: 139.728,
  },
  {
    kanji: "羽生",
    en: "Hanyu",
    lat: 36.1706,
    lon: 139.5398,
  },
  {
    kanji: "三峰口",
    en: "Mitsumineguchi",
    lat: 35.9525,
    lon: 138.9715,
  },
  {
    kanji: "松戸",
    en: "Matsudo",
    lat: 35.7844,
    lon: 139.9009,
  },
  {
    kanji: "流山",
    en: "Nagareyama",
    lat: 35.857,
    lon: 139.9022,
  },
  {
    kanji: "五井",
    en: "Goi",
    lat: 35.5132,
    lon: 140.089,
  },
  {
    kanji: "上総中野",
    en: "Kazusa-Nakano",
    lat: 35.2676,
    lon: 140.1772,
  },
  {
    kanji: "大原",
    en: "Ohara",
    lat: 35.2514,
    lon: 140.392,
  },
  {
    kanji: "外川",
    en: "Tokawa",
    lat: 35.6983,
    lon: 140.8587,
  },
  {
    kanji: "下館",
    en: "Shimodate",
    lat: 36.3045,
    lon: 139.9781,
  },
  {
    kanji: "茂木",
    en: "Motegi",
    lat: 36.5414,
    lon: 140.1192,
  },
  {
    kanji: "間藤",
    en: "Mato",
    lat: 36.6508,
    lon: 139.4316,
  },
  {
    kanji: "芳賀・高根沢工業団地",
    en: "Haga-Takanezawa",
    lat: 36.5925,
    lon: 140.0164,
  },
  {
    kanji: "吉原",
    en: "Yoshiwara",
    lat: 35.1437,
    lon: 138.6946,
  },
  {
    kanji: "岳南江尾",
    en: "Gakunan-Enoo",
    lat: 35.1481,
    lon: 138.7611,
  },
  {
    kanji: "新清水",
    en: "Shin-Shimizu",
    lat: 35.0163,
    lon: 138.4896,
  },
  {
    kanji: "新静岡",
    en: "Shin-Shizuoka",
    lat: 34.9748,
    lon: 138.3868,
  },
  {
    kanji: "井川",
    en: "Ikawa",
    lat: 35.2155,
    lon: 138.2238,
  },
  {
    kanji: "新所原",
    en: "Shin-Johara",
    lat: 34.7332,
    lon: 137.5144,
  },
  {
    kanji: "新浜松",
    en: "Shin-Hamamatsu",
    lat: 34.7047,
    lon: 137.7329,
  },
  {
    kanji: "西鹿島",
    en: "Nishi-Kashima",
    lat: 34.8488,
    lon: 137.8105,
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
  const results = [
    {
      station_name_kanji: "井の頭湖園",
      station_name_en: "Inokashira Koen",
      lat: 35.697435,
      lon: 139.582582,
      station_code: "1605",
    },
  ];

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
