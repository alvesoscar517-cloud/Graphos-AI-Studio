/**
 * Localized Avatar System
 * Provides culturally appropriate avatars and names based on user's locale
 * Each persona has a specific avatar matching their gender and ethnicity
 */

const AVATARS = {
  // East Asian avatars (Vietnamese, Japanese, Korean, Chinese, Thai, Indonesian)
  asian: {
    female: [
      'https://this-person-does-not-exist.com/img/avatar-genf167206a0cb11f0d8c8aada7f68141bf.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen5026535dd8ad76f38d297bff2304d537.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen54adb941387ab4b0792b6180b84ebd0a.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gencb8809668058c733c9107f2e80f188d9.jpg',
      'https://this-person-does-not-exist.com/img/avatar-genbb474f62012e0c868f9fcaed2abbe140.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen8d492e60bb8e8fe99a3ee98c0071210e.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gene01085d615b53c3fc787dec7a02202af.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen04691427378d60fddc8a4ccfa3b98f60.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen4f9279d5e09eb394a7e2c85e63aef5b8.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen2e5b44f454601610460f661f51726774.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen443fd842e19b710e681d6b32f83ed5d5.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen0e0cd8314527878fbf827b7d5d29df45.jpg',
    ],
    male: [
      'https://this-person-does-not-exist.com/img/avatar-gen3893554a973987dabf06075dd13e23dd.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gena977b30ca10fc3982b915dc3e1b93c57.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen1d83cce06b8b962d11071e999b2dcbe0.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen370480c24b85cd4efb553f0a452c88f2.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gencd0687a5c3beb51eccb7b9afea4f12fa.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen234a907aa0583a3e7b2b0d7f095448f9.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gena349546d407d4caff346beee19b32d41.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen24cad40119da1d275bcfdaada458a06c.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen5da666603975e9f1c79942579afcfd23.jpg',
      'https://this-person-does-not-exist.com/img/avatar-genc892e451bbe7bf9446913f025e355bdb.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gena977b30ca10fc3982b915dc3e1b93c57.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen1a902ef0467e586c0a62b83a41ce9052.jpg',
    ],
  },
  // South Asian avatars (Indian, Arabic, Middle Eastern) - Dùng chung ảnh Asian
  southAsian: {
    female: [
      'https://this-person-does-not-exist.com/img/avatar-genf167206a0cb11f0d8c8aada7f68141bf.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen5026535dd8ad76f38d297bff2304d537.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen54adb941387ab4b0792b6180b84ebd0a.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gencb8809668058c733c9107f2e80f188d9.jpg',
      'https://this-person-does-not-exist.com/img/avatar-genbb474f62012e0c868f9fcaed2abbe140.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen8d492e60bb8e8fe99a3ee98c0071210e.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gene01085d615b53c3fc787dec7a02202af.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen04691427378d60fddc8a4ccfa3b98f60.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen4f9279d5e09eb394a7e2c85e63aef5b8.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen2e5b44f454601610460f661f51726774.jpg',
    ],
    male: [
      'https://this-person-does-not-exist.com/img/avatar-gen3893554a973987dabf06075dd13e23dd.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gena977b30ca10fc3982b915dc3e1b93c57.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen1d83cce06b8b962d11071e999b2dcbe0.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen370480c24b85cd4efb553f0a452c88f2.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gencd0687a5c3beb51eccb7b9afea4f12fa.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen234a907aa0583a3e7b2b0d7f095448f9.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gena349546d407d4caff346beee19b32d41.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen24cad40119da1d275bcfdaada458a06c.jpg',
      'https://this-person-does-not-exist.com/img/avatar-gen5da666603975e9f1c79942579afcfd23.jpg',
      'https://this-person-does-not-exist.com/img/avatar-genc892e451bbe7bf9446913f025e355bdb.jpg',
    ],
  },
  // Western avatars (European, American) - Đã có sẵn từ Unsplash
  western: {
    female: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
    ],
    male: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
    ],
  },
}

// Fallback avatar generator using UI Avatars (name-based initials)
const generateFallbackAvatar = (name, colorIndex = 0) => {
  const colors = ['6366f1', '8b5cf6', 'ec4899', 'f43f5e', 'f97316', '22c55e', '14b8a6', '06b6d4', '3b82f6', 'a855f7', '10b981', '0ea5e9']
  const bgColor = colors[colorIndex % colors.length]
  const encodedName = encodeURIComponent(name)
  return `https://ui-avatars.com/api/?name=${encodedName}&background=${bgColor}&color=fff&size=150&bold=true&format=svg`
}

// Locale to region mapping
const LOCALE_REGIONS = {
  vi: 'vietnam', ja: 'japan', ko: 'korea', 'zh-CN': 'china', zh: 'china',
  th: 'thailand', id: 'indonesia', hi: 'india', ar: 'arabic',
  en: 'western', de: 'germany', fr: 'france', es: 'spain', it: 'italy', pt: 'brazil', ru: 'russia',
}

// Region to ethnicity mapping for avatar selection
const REGION_ETHNICITY = {
  vietnam: 'asian', japan: 'asian', korea: 'asian', china: 'asian', thailand: 'asian', indonesia: 'asian',
  india: 'southAsian', arabic: 'southAsian',
  western: 'western', germany: 'western', france: 'western', spain: 'western', italy: 'western', brazil: 'western', russia: 'western',
}

// Get avatar by ethnicity, gender and index
// Uses AVATARS array if available, falls back to name-based avatar
const getAvatar = (ethnicity, gender, index = 0, name = '') => {
  const avatarSet = AVATARS[ethnicity] || AVATARS.western
  const genderAvatars = avatarSet[gender] || avatarSet.female
  const avatarUrl = genderAvatars[index % genderAvatars.length]
  
  // If avatar URL exists and is not empty, use it
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl
  }
  
  // Fallback to name-based avatar if no URL available
  return generateFallbackAvatar(name || 'User', index)
}

// Vietnamese personas with gender
const VIETNAM_PERSONAS = {
  testimonials: [
    { name: 'Nguyễn Minh Anh', gender: 'female' },
    { name: 'Trần Đức Hùng', gender: 'male' },
    { name: 'Lê Hoàng Nam', gender: 'male' },
    { name: 'Phạm Thu Hà', gender: 'female' },
    { name: 'Võ Quang Minh', gender: 'male' },
    { name: 'Đặng Thị Lan', gender: 'female' },
  ],
  useCases: {
    contentCreators: { name: 'Bùi Thanh Tâm', gender: 'female', role: 'Người sáng tạo nội dung' },
    students: { name: 'Hoàng Văn Đức', gender: 'male', role: 'Sinh viên' },
    marketers: { name: 'Ngô Thị Mai', gender: 'female', role: 'Chuyên viên Marketing' },
    educators: { name: 'TS. Lý Minh Tuấn', gender: 'male', role: 'Giảng viên Đại học' },
    businesses: { name: 'Trịnh Hồng Nhung', gender: 'female', role: 'Giám đốc Truyền thông' },
    freelancers: { name: 'Đinh Công Thành', gender: 'male', role: 'Nhà văn tự do' },
  },
  features: {
    aiDetection: [
      { name: 'TS. Vũ Thị Hương', gender: 'female', role: 'Giáo sư Đại học' },
      { name: 'Phan Quốc Bảo', gender: 'male', role: 'Giám đốc Nội dung' },
      { name: 'Lương Thị Yến', gender: 'female', role: 'Biên tập viên' },
    ],
    humanization: [
      { name: 'Cao Minh Đức', gender: 'male', role: 'Người sáng tạo nội dung' },
      { name: 'Hồ Thanh Sơn', gender: 'male', role: 'Giám đốc Marketing' },
      { name: 'TS. Đỗ Thị Nga', gender: 'female', role: 'Giáo sư Nghiên cứu' },
    ],
    aiWorkspace: [
      { name: 'Tạ Quỳnh Chi', gender: 'female', role: 'Nhà văn Nội dung' },
      { name: 'Dương Văn Hải', gender: 'male', role: 'Quản lý Marketing' },
      { name: 'Mai Thị Linh', gender: 'female', role: 'Doanh nhân' },
    ],
  },
}

// Japanese personas
const JAPAN_PERSONAS = {
  testimonials: [
    { name: '田中 美咲', gender: 'female' },
    { name: '佐藤 健一', gender: 'male' },
    { name: '山本 大輔', gender: 'male' },
    { name: '伊藤 さくら', gender: 'female' },
    { name: '渡辺 隆', gender: 'male' },
    { name: '小林 愛', gender: 'female' },
  ],
  useCases: {
    contentCreators: { name: '高橋 由美', gender: 'female', role: 'コンテンツクリエイター' },
    students: { name: '中村 翔太', gender: 'male', role: '大学生' },
    marketers: { name: '加藤 真理', gender: 'female', role: 'マーケティング担当' },
    educators: { name: '鈴木 博士', gender: 'male', role: '大学教授' },
    businesses: { name: '松本 恵子', gender: 'female', role: '広報部長' },
    freelancers: { name: '井上 誠', gender: 'male', role: 'フリーランスライター' },
  },
  features: {
    aiDetection: [
      { name: '木村 教授', gender: 'male', role: '大学教授' },
      { name: '斎藤 浩二', gender: 'male', role: 'コンテンツディレクター' },
      { name: '森 美穂', gender: 'female', role: '編集長' },
    ],
    humanization: [
      { name: '清水 陽子', gender: 'female', role: 'コンテンツクリエイター' },
      { name: '橋本 拓也', gender: 'male', role: 'マーケティング部長' },
      { name: '藤田 教授', gender: 'male', role: '研究教授' },
    ],
    aiWorkspace: [
      { name: '岡田 麻衣', gender: 'female', role: 'コンテンツライター' },
      { name: '近藤 健太', gender: 'male', role: 'マーケティングマネージャー' },
      { name: '石井 あかり', gender: 'female', role: '起業家' },
    ],
  },
}

// Korean personas
const KOREA_PERSONAS = {
  testimonials: [
    { name: '김지현', gender: 'female' },
    { name: '박성민 교수', gender: 'male' },
    { name: '이준호', gender: 'male' },
    { name: '최수연', gender: 'female' },
    { name: '정우진', gender: 'male' },
    { name: '한예진', gender: 'female' },
  ],
  useCases: {
    contentCreators: { name: '윤서아', gender: 'female', role: '콘텐츠 크리에이터' },
    students: { name: '강민수', gender: 'male', role: '대학생' },
    marketers: { name: '송지은', gender: 'female', role: '마케팅 담당자' },
    educators: { name: '임재현 교수', gender: 'male', role: '대학 교수' },
    businesses: { name: '오하나', gender: 'female', role: '홍보 이사' },
    freelancers: { name: '신동현', gender: 'male', role: '프리랜서 작가' },
  },
  features: {
    aiDetection: [
      { name: '조은영 교수', gender: 'female', role: '대학 교수' },
      { name: '황준혁', gender: 'male', role: '콘텐츠 디렉터' },
      { name: '배수진', gender: 'female', role: '편집장' },
    ],
    humanization: [
      { name: '류민지', gender: 'female', role: '콘텐츠 크리에이터' },
      { name: '안성호', gender: 'male', role: '마케팅 이사' },
      { name: '권지영 교수', gender: 'female', role: '연구 교수' },
    ],
    aiWorkspace: [
      { name: '문하늘', gender: 'female', role: '콘텐츠 작가' },
      { name: '서재원', gender: 'male', role: '마케팅 매니저' },
      { name: '노유나', gender: 'female', role: '기업가' },
    ],
  },
}

// Chinese personas
const CHINA_PERSONAS = {
  testimonials: [
    { name: '王小雨', gender: 'female' },
    { name: '李明教授', gender: 'male' },
    { name: '张伟', gender: 'male' },
    { name: '刘芳', gender: 'female' },
    { name: '陈强', gender: 'male' },
    { name: '杨丽', gender: 'female' },
  ],
  useCases: {
    contentCreators: { name: '赵雪', gender: 'female', role: '内容创作者' },
    students: { name: '孙浩', gender: 'male', role: '大学生' },
    marketers: { name: '周婷', gender: 'female', role: '市场营销专员' },
    educators: { name: '吴教授', gender: 'male', role: '大学教授' },
    businesses: { name: '郑美玲', gender: 'female', role: '公关总监' },
    freelancers: { name: '黄志远', gender: 'male', role: '自由撰稿人' },
  },
  features: {
    aiDetection: [
      { name: '林教授', gender: 'male', role: '大学教授' },
      { name: '何建国', gender: 'male', role: '内容总监' },
      { name: '罗晓燕', gender: 'female', role: '主编' },
    ],
    humanization: [
      { name: '谢雨欣', gender: 'female', role: '内容创作者' },
      { name: '唐志明', gender: 'male', role: '市场总监' },
      { name: '韩教授', gender: 'male', role: '研究教授' },
    ],
    aiWorkspace: [
      { name: '冯小琳', gender: 'female', role: '内容作家' },
      { name: '曹俊杰', gender: 'male', role: '市场经理' },
      { name: '邓晓华', gender: 'female', role: '企业家' },
    ],
  },
}

// Thai personas
const THAILAND_PERSONAS = {
  testimonials: [
    { name: 'สมหญิง วงศ์สุข', gender: 'female' },
    { name: 'ศ.ดร.สมชาย ใจดี', gender: 'male' },
    { name: 'วิชัย รักษ์ไทย', gender: 'male' },
    { name: 'นภา สุขสันต์', gender: 'female' },
    { name: 'ประเสริฐ มั่นคง', gender: 'male' },
    { name: 'พิมพ์ใจ รุ่งเรือง', gender: 'female' },
  ],
  useCases: {
    contentCreators: { name: 'กานดา แสงทอง', gender: 'female', role: 'ผู้สร้างเนื้อหา' },
    students: { name: 'ธนกร เจริญสุข', gender: 'male', role: 'นักศึกษา' },
    marketers: { name: 'รัตนา พงษ์ไพบูลย์', gender: 'female', role: 'นักการตลาด' },
    educators: { name: 'ศ.ดร.วิทยา สมบูรณ์', gender: 'male', role: 'อาจารย์มหาวิทยาลัย' },
    businesses: { name: 'สุนิสา ธนาวัฒน์', gender: 'female', role: 'ผู้อำนวยการฝ่ายสื่อสาร' },
    freelancers: { name: 'อนุชา ศรีสุข', gender: 'male', role: 'นักเขียนอิสระ' },
  },
  features: {
    aiDetection: [
      { name: 'ศ.ดร.มาลี ศรีวิไล', gender: 'female', role: 'อาจารย์มหาวิทยาลัย' },
      { name: 'ชัยวัฒน์ กิจเจริญ', gender: 'male', role: 'ผู้อำนวยการเนื้อหา' },
      { name: 'ปิยะนุช วัฒนา', gender: 'female', role: 'บรรณาธิการ' },
    ],
    humanization: [
      { name: 'ดวงใจ สุขใส', gender: 'female', role: 'ผู้สร้างเนื้อหา' },
      { name: 'สุรชัย พัฒนกุล', gender: 'male', role: 'ผู้อำนวยการการตลาด' },
      { name: 'ศ.ดร.อรุณี ภูมิไทย', gender: 'female', role: 'ศาสตราจารย์วิจัย' },
    ],
    aiWorkspace: [
      { name: 'จิราภรณ์ ทองดี', gender: 'female', role: 'นักเขียนเนื้อหา' },
      { name: 'ภาณุพงศ์ รักชาติ', gender: 'male', role: 'ผู้จัดการการตลาด' },
      { name: 'ณัฐธิดา เจริญรุ่ง', gender: 'female', role: 'ผู้ประกอบการ' },
    ],
  },
}

// Indonesian personas
const INDONESIA_PERSONAS = {
  testimonials: [
    { name: 'Siti Nurhaliza', gender: 'female' },
    { name: 'Prof. Budi Santoso', gender: 'male' },
    { name: 'Agus Wijaya', gender: 'male' },
    { name: 'Dewi Lestari', gender: 'female' },
    { name: 'Hendra Gunawan', gender: 'male' },
    { name: 'Rina Kartika', gender: 'female' },
  ],
  useCases: {
    contentCreators: { name: 'Maya Putri', gender: 'female', role: 'Kreator Konten' },
    students: { name: 'Rizky Pratama', gender: 'male', role: 'Mahasiswa' },
    marketers: { name: 'Anita Sari', gender: 'female', role: 'Spesialis Marketing' },
    educators: { name: 'Prof. Wahyu Hidayat', gender: 'male', role: 'Dosen Universitas' },
    businesses: { name: 'Linda Kusuma', gender: 'female', role: 'Direktur Komunikasi' },
    freelancers: { name: 'Fajar Nugroho', gender: 'male', role: 'Penulis Lepas' },
  },
  features: {
    aiDetection: [
      { name: 'Prof. Sri Mulyani', gender: 'female', role: 'Dosen Universitas' },
      { name: 'Dimas Prasetyo', gender: 'male', role: 'Direktur Konten' },
      { name: 'Ratna Dewi', gender: 'female', role: 'Pemimpin Redaksi' },
    ],
    humanization: [
      { name: 'Indah Permata', gender: 'female', role: 'Kreator Konten' },
      { name: 'Eko Susanto', gender: 'male', role: 'Direktur Marketing' },
      { name: 'Prof. Yuni Astuti', gender: 'female', role: 'Profesor Riset' },
    ],
    aiWorkspace: [
      { name: 'Fitri Handayani', gender: 'female', role: 'Penulis Konten' },
      { name: 'Arief Rahman', gender: 'male', role: 'Manajer Marketing' },
      { name: 'Citra Maharani', gender: 'female', role: 'Pengusaha' },
    ],
  },
}

// Indian personas
const INDIA_PERSONAS = {
  testimonials: [
    { name: 'प्रिया शर्मा', gender: 'female' },
    { name: 'डॉ. राजेश कुमार', gender: 'male' },
    { name: 'अमित पटेल', gender: 'male' },
    { name: 'नेहा गुप्ता', gender: 'female' },
    { name: 'विकास सिंह', gender: 'male' },
    { name: 'अंजलि वर्मा', gender: 'female' },
  ],
  useCases: {
    contentCreators: { name: 'काव्या मेहता', gender: 'female', role: 'कंटेंट क्रिएटर' },
    students: { name: 'आदित्य राव', gender: 'male', role: 'छात्र' },
    marketers: { name: 'स्वाति जोशी', gender: 'female', role: 'मार्केटिंग विशेषज्ञ' },
    educators: { name: 'डॉ. सुनील शास्त्री', gender: 'male', role: 'विश्वविद्यालय प्रोफेसर' },
    businesses: { name: 'रीता अग्रवाल', gender: 'female', role: 'संचार निदेशक' },
    freelancers: { name: 'मनोज त्रिपाठी', gender: 'male', role: 'स्वतंत्र लेखक' },
  },
  features: {
    aiDetection: [
      { name: 'डॉ. मीरा देसाई', gender: 'female', role: 'विश्वविद्यालय प्रोफेसर' },
      { name: 'संजय मिश्रा', gender: 'male', role: 'कंटेंट डायरेक्टर' },
      { name: 'पूजा चौधरी', gender: 'female', role: 'संपादक' },
    ],
    humanization: [
      { name: 'दीपिका नायर', gender: 'female', role: 'कंटेंट क्रिएटर' },
      { name: 'रोहित भारद्वाज', gender: 'male', role: 'मार्केटिंग डायरेक्टर' },
      { name: 'डॉ. अनुराधा पांडे', gender: 'female', role: 'रिसर्च प्रोफेसर' },
    ],
    aiWorkspace: [
      { name: 'श्रुति कपूर', gender: 'female', role: 'कंटेंट राइटर' },
      { name: 'करण मल्होत्रा', gender: 'male', role: 'मार्केटिंग मैनेजर' },
      { name: 'तनवी सक्सेना', gender: 'female', role: 'उद्यमी' },
    ],
  },
}

// Arabic personas
const ARABIC_PERSONAS = {
  testimonials: [
    { name: 'فاطمة الزهراء', gender: 'female' },
    { name: 'د. أحمد محمود', gender: 'male' },
    { name: 'خالد العلي', gender: 'male' },
    { name: 'نورة السعيد', gender: 'female' },
    { name: 'محمد الحسن', gender: 'male' },
    { name: 'سارة القحطاني', gender: 'female' },
  ],
  useCases: {
    contentCreators: { name: 'ليلى الأمين', gender: 'female', role: 'صانعة محتوى' },
    students: { name: 'عمر الشريف', gender: 'male', role: 'طالب جامعي' },
    marketers: { name: 'هدى المنصور', gender: 'female', role: 'أخصائية تسويق' },
    educators: { name: 'د. يوسف الكريم', gender: 'male', role: 'أستاذ جامعي' },
    businesses: { name: 'رنا الفهد', gender: 'female', role: 'مديرة الاتصالات' },
    freelancers: { name: 'طارق النجار', gender: 'male', role: 'كاتب مستقل' },
  },
  features: {
    aiDetection: [
      { name: 'د. مريم الخالد', gender: 'female', role: 'أستاذة جامعية' },
      { name: 'سامي الرشيد', gender: 'male', role: 'مدير المحتوى' },
      { name: 'دانة العتيبي', gender: 'female', role: 'رئيسة التحرير' },
    ],
    humanization: [
      { name: 'جنى الحربي', gender: 'female', role: 'صانعة محتوى' },
      { name: 'فيصل الدوسري', gender: 'male', role: 'مدير التسويق' },
      { name: 'د. عائشة البلوشي', gender: 'female', role: 'أستاذة بحث' },
    ],
    aiWorkspace: [
      { name: 'لمى الغامدي', gender: 'female', role: 'كاتبة محتوى' },
      { name: 'ناصر المطيري', gender: 'male', role: 'مدير تسويق' },
      { name: 'ريم الشمري', gender: 'female', role: 'رائدة أعمال' },
    ],
  },
}

// Western personas (English default)
const WESTERN_PERSONAS = {
  testimonials: [
    { name: 'Sarah Mitchell', gender: 'female' },
    { name: 'Dr. James Kim', gender: 'male' },
    { name: 'Michael Roberts', gender: 'male' },
    { name: 'Emily Thompson', gender: 'female' },
    { name: 'David Lee', gender: 'male' },
    { name: 'Lisa Chen', gender: 'female' },
  ],
  useCases: {
    contentCreators: { name: 'Amanda Foster', gender: 'female', role: 'Content Creator' },
    students: { name: 'Kevin Nguyen', gender: 'male', role: 'Student' },
    marketers: { name: 'Rachel Martinez', gender: 'female', role: 'Marketing Specialist' },
    educators: { name: 'Dr. Robert Wilson', gender: 'male', role: 'University Professor' },
    businesses: { name: 'Jennifer Park', gender: 'female', role: 'Communications Director' },
    freelancers: { name: 'Marcus Johnson', gender: 'male', role: 'Freelance Writer' },
  },
  features: {
    aiDetection: [
      { name: 'Dr. Sarah Chen', gender: 'female', role: 'University Professor' },
      { name: 'Michael Torres', gender: 'male', role: 'Content Director' },
      { name: 'Emma Williams', gender: 'female', role: 'Editor-in-Chief' },
    ],
    humanization: [
      { name: 'Jessica Brown', gender: 'female', role: 'Content Creator' },
      { name: 'Daniel Garcia', gender: 'male', role: 'Marketing Director' },
      { name: 'Dr. Laura White', gender: 'female', role: 'Research Professor' },
    ],
    aiWorkspace: [
      { name: 'Ashley Taylor', gender: 'female', role: 'Content Writer' },
      { name: 'Christopher Lee', gender: 'male', role: 'Marketing Manager' },
      { name: 'Megan Davis', gender: 'female', role: 'Entrepreneur' },
    ],
  },
}

// German personas
const GERMANY_PERSONAS = {
  testimonials: [
    { name: 'Anna Müller', gender: 'female' },
    { name: 'Prof. Dr. Hans Weber', gender: 'male' },
    { name: 'Thomas Schmidt', gender: 'male' },
    { name: 'Julia Fischer', gender: 'female' },
    { name: 'Markus Bauer', gender: 'male' },
    { name: 'Sabine Wagner', gender: 'female' },
  ],
  useCases: {
    contentCreators: { name: 'Lena Hoffmann', gender: 'female', role: 'Content Creator' },
    students: { name: 'Felix Schneider', gender: 'male', role: 'Student' },
    marketers: { name: 'Katharina Koch', gender: 'female', role: 'Marketing-Spezialistin' },
    educators: { name: 'Prof. Dr. Klaus Richter', gender: 'male', role: 'Universitätsprofessor' },
    businesses: { name: 'Stefanie Wolf', gender: 'female', role: 'Kommunikationsdirektorin' },
    freelancers: { name: 'Christian Braun', gender: 'male', role: 'Freier Autor' },
  },
  features: {
    aiDetection: [
      { name: 'Prof. Dr. Maria Schulz', gender: 'female', role: 'Universitätsprofessorin' },
      { name: 'Andreas Krause', gender: 'male', role: 'Content-Direktor' },
      { name: 'Petra Zimmermann', gender: 'female', role: 'Chefredakteurin' },
    ],
    humanization: [
      { name: 'Nina Hartmann', gender: 'female', role: 'Content Creator' },
      { name: 'Stefan Lange', gender: 'male', role: 'Marketing-Direktor' },
      { name: 'Prof. Dr. Eva Schwarz', gender: 'female', role: 'Forschungsprofessorin' },
    ],
    aiWorkspace: [
      { name: 'Laura Meier', gender: 'female', role: 'Content-Autorin' },
      { name: 'Daniel Keller', gender: 'male', role: 'Marketing-Manager' },
      { name: 'Sophie Neumann', gender: 'female', role: 'Unternehmerin' },
    ],
  },
}

// French personas
const FRANCE_PERSONAS = {
  testimonials: [
    { name: 'Marie Dubois', gender: 'female' },
    { name: 'Prof. Jean-Pierre Martin', gender: 'male' },
    { name: 'Nicolas Bernard', gender: 'male' },
    { name: 'Camille Petit', gender: 'female' },
    { name: 'Antoine Moreau', gender: 'male' },
    { name: 'Léa Laurent', gender: 'female' },
  ],
  useCases: {
    contentCreators: { name: 'Chloé Roux', gender: 'female', role: 'Créatrice de contenu' },
    students: { name: 'Lucas Girard', gender: 'male', role: 'Étudiant' },
    marketers: { name: 'Émilie Bonnet', gender: 'female', role: 'Spécialiste marketing' },
    educators: { name: 'Prof. Philippe Leroy', gender: 'male', role: 'Professeur universitaire' },
    businesses: { name: 'Nathalie Simon', gender: 'female', role: 'Directrice de communication' },
    freelancers: { name: 'Julien Mercier', gender: 'male', role: 'Écrivain indépendant' },
  },
  features: {
    aiDetection: [
      { name: 'Prof. Claire Fontaine', gender: 'female', role: 'Professeure universitaire' },
      { name: 'Pierre Durand', gender: 'male', role: 'Directeur de contenu' },
      { name: 'Isabelle Lefebvre', gender: 'female', role: 'Rédactrice en chef' },
    ],
    humanization: [
      { name: 'Sophie Garnier', gender: 'female', role: 'Créatrice de contenu' },
      { name: 'Marc Fournier', gender: 'male', role: 'Directeur marketing' },
      { name: 'Prof. Anne Rousseau', gender: 'female', role: 'Professeure de recherche' },
    ],
    aiWorkspace: [
      { name: 'Manon Chevalier', gender: 'female', role: 'Rédactrice de contenu' },
      { name: 'Thomas Blanc', gender: 'male', role: 'Responsable marketing' },
      { name: 'Julie Morel', gender: 'female', role: 'Entrepreneure' },
    ],
  },
}

// Spanish personas
const SPAIN_PERSONAS = {
  testimonials: [
    { name: 'María García', gender: 'female' },
    { name: 'Dr. Carlos Rodríguez', gender: 'male' },
    { name: 'Alejandro Martínez', gender: 'male' },
    { name: 'Laura Fernández', gender: 'female' },
    { name: 'Javier López', gender: 'male' },
    { name: 'Ana Sánchez', gender: 'female' },
  ],
  useCases: {
    contentCreators: { name: 'Sofía Hernández', gender: 'female', role: 'Creadora de contenido' },
    students: { name: 'Diego Moreno', gender: 'male', role: 'Estudiante' },
    marketers: { name: 'Carmen Ruiz', gender: 'female', role: 'Especialista en marketing' },
    educators: { name: 'Dr. Miguel Álvarez', gender: 'male', role: 'Profesor universitario' },
    businesses: { name: 'Patricia Jiménez', gender: 'female', role: 'Directora de comunicación' },
    freelancers: { name: 'Roberto Díaz', gender: 'male', role: 'Escritor independiente' },
  },
  features: {
    aiDetection: [
      { name: 'Dra. Elena Torres', gender: 'female', role: 'Profesora universitaria' },
      { name: 'Pablo Navarro', gender: 'male', role: 'Director de contenido' },
      { name: 'Lucía Romero', gender: 'female', role: 'Editora jefe' },
    ],
    humanization: [
      { name: 'Isabel Molina', gender: 'female', role: 'Creadora de contenido' },
      { name: 'Fernando Ortega', gender: 'male', role: 'Director de marketing' },
      { name: 'Dra. Marta Serrano', gender: 'female', role: 'Profesora de investigación' },
    ],
    aiWorkspace: [
      { name: 'Claudia Vega', gender: 'female', role: 'Redactora de contenido' },
      { name: 'Andrés Castro', gender: 'male', role: 'Gerente de marketing' },
      { name: 'Natalia Ramos', gender: 'female', role: 'Emprendedora' },
    ],
  },
}

// Italian personas
const ITALY_PERSONAS = {
  testimonials: [
    { name: 'Giulia Rossi', gender: 'female' },
    { name: 'Prof. Marco Bianchi', gender: 'male' },
    { name: 'Alessandro Ferrari', gender: 'male' },
    { name: 'Francesca Romano', gender: 'female' },
    { name: 'Luca Colombo', gender: 'male' },
    { name: 'Chiara Ricci', gender: 'female' },
  ],
  useCases: {
    contentCreators: { name: 'Valentina Marino', gender: 'female', role: 'Creatrice di contenuti' },
    students: { name: 'Matteo Greco', gender: 'male', role: 'Studente' },
    marketers: { name: 'Elisa Bruno', gender: 'female', role: 'Specialista marketing' },
    educators: { name: 'Prof. Giuseppe Conti', gender: 'male', role: 'Professore universitario' },
    businesses: { name: 'Silvia De Luca', gender: 'female', role: 'Direttrice comunicazione' },
    freelancers: { name: 'Andrea Mancini', gender: 'male', role: 'Scrittore freelance' },
  },
  features: {
    aiDetection: [
      { name: 'Prof.ssa Laura Galli', gender: 'female', role: 'Professoressa universitaria' },
      { name: 'Davide Barbieri', gender: 'male', role: 'Direttore contenuti' },
      { name: 'Sara Fontana', gender: 'female', role: 'Caporedattrice' },
    ],
    humanization: [
      { name: 'Martina Costa', gender: 'female', role: 'Creatrice di contenuti' },
      { name: 'Simone Moretti', gender: 'male', role: 'Direttore marketing' },
      { name: 'Prof.ssa Elena Santoro', gender: 'female', role: 'Professoressa di ricerca' },
    ],
    aiWorkspace: [
      { name: 'Federica Lombardi', gender: 'female', role: 'Redattrice di contenuti' },
      { name: 'Paolo Marchetti', gender: 'male', role: 'Marketing manager' },
      { name: 'Alessia Rinaldi', gender: 'female', role: 'Imprenditrice' },
    ],
  },
}

// Brazilian/Portuguese personas
const BRAZIL_PERSONAS = {
  testimonials: [
    { name: 'Ana Paula Silva', gender: 'female' },
    { name: 'Prof. Dr. Carlos Santos', gender: 'male' },
    { name: 'Rafael Oliveira', gender: 'male' },
    { name: 'Juliana Costa', gender: 'female' },
    { name: 'Fernando Souza', gender: 'male' },
    { name: 'Mariana Lima', gender: 'female' },
  ],
  useCases: {
    contentCreators: { name: 'Beatriz Ferreira', gender: 'female', role: 'Criadora de conteúdo' },
    students: { name: 'Lucas Almeida', gender: 'male', role: 'Estudante' },
    marketers: { name: 'Camila Rodrigues', gender: 'female', role: 'Especialista em marketing' },
    educators: { name: 'Prof. Dr. Paulo Mendes', gender: 'male', role: 'Professor universitário' },
    businesses: { name: 'Fernanda Carvalho', gender: 'female', role: 'Diretora de comunicação' },
    freelancers: { name: 'Gustavo Pereira', gender: 'male', role: 'Escritor freelancer' },
  },
  features: {
    aiDetection: [
      { name: 'Profa. Dra. Renata Barbosa', gender: 'female', role: 'Professora universitária' },
      { name: 'Thiago Ribeiro', gender: 'male', role: 'Diretor de conteúdo' },
      { name: 'Patrícia Gomes', gender: 'female', role: 'Editora-chefe' },
    ],
    humanization: [
      { name: 'Larissa Martins', gender: 'female', role: 'Criadora de conteúdo' },
      { name: 'Bruno Araújo', gender: 'male', role: 'Diretor de marketing' },
      { name: 'Profa. Dra. Cristina Nunes', gender: 'female', role: 'Professora pesquisadora' },
    ],
    aiWorkspace: [
      { name: 'Amanda Cardoso', gender: 'female', role: 'Redatora de conteúdo' },
      { name: 'Diego Moreira', gender: 'male', role: 'Gerente de marketing' },
      { name: 'Isabela Teixeira', gender: 'female', role: 'Empreendedora' },
    ],
  },
}

// Russian personas
const RUSSIA_PERSONAS = {
  testimonials: [
    { name: 'Анна Иванова', gender: 'female' },
    { name: 'Проф. Дмитрий Петров', gender: 'male' },
    { name: 'Алексей Смирнов', gender: 'male' },
    { name: 'Екатерина Козлова', gender: 'female' },
    { name: 'Михаил Новиков', gender: 'male' },
    { name: 'Ольга Морозова', gender: 'female' },
  ],
  useCases: {
    contentCreators: { name: 'Мария Волкова', gender: 'female', role: 'Создатель контента' },
    students: { name: 'Иван Соколов', gender: 'male', role: 'Студент' },
    marketers: { name: 'Наталья Лебедева', gender: 'female', role: 'Специалист по маркетингу' },
    educators: { name: 'Проф. Сергей Кузнецов', gender: 'male', role: 'Профессор университета' },
    businesses: { name: 'Елена Попова', gender: 'female', role: 'Директор по коммуникациям' },
    freelancers: { name: 'Андрей Федоров', gender: 'male', role: 'Независимый писатель' },
  },
  features: {
    aiDetection: [
      { name: 'Проф. Татьяна Орлова', gender: 'female', role: 'Профессор университета' },
      { name: 'Павел Николаев', gender: 'male', role: 'Директор по контенту' },
      { name: 'Светлана Егорова', gender: 'female', role: 'Главный редактор' },
    ],
    humanization: [
      { name: 'Виктория Белова', gender: 'female', role: 'Создатель контента' },
      { name: 'Артём Захаров', gender: 'male', role: 'Директор по маркетингу' },
      { name: 'Проф. Ирина Васильева', gender: 'female', role: 'Профессор-исследователь' },
    ],
    aiWorkspace: [
      { name: 'Дарья Макарова', gender: 'female', role: 'Автор контента' },
      { name: 'Никита Романов', gender: 'male', role: 'Менеджер по маркетингу' },
      { name: 'Алиса Павлова', gender: 'female', role: 'Предприниматель' },
    ],
  },
}

// Map region to personas
const REGION_PERSONAS = {
  vietnam: VIETNAM_PERSONAS,
  japan: JAPAN_PERSONAS,
  korea: KOREA_PERSONAS,
  china: CHINA_PERSONAS,
  thailand: THAILAND_PERSONAS,
  indonesia: INDONESIA_PERSONAS,
  india: INDIA_PERSONAS,
  arabic: ARABIC_PERSONAS,
  western: WESTERN_PERSONAS,
  germany: GERMANY_PERSONAS,
  france: FRANCE_PERSONAS,
  spain: SPAIN_PERSONAS,
  italy: ITALY_PERSONAS,
  brazil: BRAZIL_PERSONAS,
  russia: RUSSIA_PERSONAS,
}

/**
 * Get region from locale
 */
export const getRegionFromLocale = (locale) => {
  return LOCALE_REGIONS[locale] || LOCALE_REGIONS[locale?.split('-')[0]] || 'western'
}

/**
 * Get testimonials for a specific locale
 */
export const getLocalizedTestimonials = (locale) => {
  const region = getRegionFromLocale(locale)
  const ethnicity = REGION_ETHNICITY[region] || 'western'
  const personas = REGION_PERSONAS[region] || WESTERN_PERSONAS

  return personas.testimonials.map((person, index) => ({
    id: index + 1,
    name: person.name,
    roleKey: `testimonials.roles.contentCreator`,
    avatar: getAvatar(ethnicity, person.gender, index, person.name),
  }))
}

/**
 * Get use case testimonials for a specific locale
 */
export const getLocalizedUseCaseTestimonial = (locale, useCase) => {
  const region = getRegionFromLocale(locale)
  const ethnicity = REGION_ETHNICITY[region] || 'western'
  const personas = REGION_PERSONAS[region] || WESTERN_PERSONAS
  const person = personas.useCases[useCase] || personas.useCases.contentCreators

  // Use different index based on use case to get variety
  const useCaseIndex = { contentCreators: 0, students: 1, marketers: 2, educators: 3, businesses: 4, freelancers: 5 }
  const index = useCaseIndex[useCase] ?? 0

  return {
    name: person.name,
    role: person.role,
    avatar: getAvatar(ethnicity, person.gender, index, person.name),
  }
}

/**
 * Get feature page testimonials for a specific locale
 */
export const getLocalizedFeatureTestimonials = (locale, feature) => {
  const region = getRegionFromLocale(locale)
  const ethnicity = REGION_ETHNICITY[region] || 'western'
  const personas = REGION_PERSONAS[region] || WESTERN_PERSONAS
  const featurePersonas = personas.features[feature] || personas.features.aiDetection

  return featurePersonas.map((person, index) => ({
    id: index + 1,
    name: person.name,
    role: person.role,
    avatar: getAvatar(ethnicity, person.gender, index + 6, person.name),
  }))
}

/**
 * Get social proof avatars (small avatar group)
 */
export const getLocalizedSocialProofAvatars = (locale, count = 3) => {
  const region = getRegionFromLocale(locale)
  const ethnicity = REGION_ETHNICITY[region] || 'western'
  const personas = REGION_PERSONAS[region] || WESTERN_PERSONAS

  return personas.testimonials.slice(0, count).map((person, index) => 
    getAvatar(ethnicity, person.gender, index + 9, person.name)
  )
}

// For backward compatibility
export const generateAvatar = (name, region = 'western', index = 0) => {
  const ethnicity = REGION_ETHNICITY[region] || 'western'
  return getAvatar(ethnicity, 'female', index, name)
}

export default {
  generateAvatar,
  getRegionFromLocale,
  getLocalizedTestimonials,
  getLocalizedUseCaseTestimonial,
  getLocalizedFeatureTestimonials,
  getLocalizedSocialProofAvatars,
}
