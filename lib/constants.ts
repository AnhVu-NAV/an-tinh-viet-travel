
import type { Tour, Location, Course, Review, Discount, User } from "@/lib/types";

export const LOCATIONS: Location[] = [
  {
    id: 'l1',
    name: { vi: 'Chùa Bái Đính', en: 'Bai Dinh Pagoda' },
    type: 'Quần thể Chùa',
    region: 'Ninh Bình',
    tags: ['#MindfulWalking', '#Zen'],
    image: 'https://images.unsplash.com/photo-1599709222625-24017f8b5443?q=80&w=2069&auto=format&fit=crop',
    description: {
      vi: 'Ngôi chùa lớn nhất Đông Nam Á, nơi sở hữu nhiều kỷ lục nhưng vẫn giữ được nét thanh tịnh giữa núi non hùng vĩ.',
      en: 'The largest pagoda complex in Southeast Asia, holding many records yet retaining serenity amidst majestic mountains.'
    },
    introduction: {
      vi: 'Chùa Bái Đính là một quần thể chùa lớn với nhiều kỷ lục châu Á và Việt Nam được xác lập như chùa có tượng Phật bằng đồng dát vàng lớn nhất châu Á, chùa có hành lang La Hán dài nhất châu Á, chùa có tượng Di Lặc bằng đồng lớn nhất Đông Nam Á...',
      en: 'Bai Dinh Pagoda is a large temple complex with many Asian and Vietnamese records established such as the temple with the largest gold-plated bronze Buddha statue in Asia, the temple with the longest Arhat corridor in Asia, the temple with the largest bronze Maitreya statue in Southeast Asia...'
    },
    history: {
      vi: 'Chùa Bái Đính cổ được xây dựng cách đây hơn 1000 năm, vào thời nhà Đinh. Quần thể chùa mới được xây dựng từ năm 2003.',
      en: 'The ancient Bai Dinh Pagoda was built over 1000 years ago, during the Dinh Dynasty. The new pagoda complex has been built since 2003.'
    },
    significance: {
      vi: 'Nơi đây không chỉ là điểm du lịch tâm linh mà còn là nơi lưu giữ những giá trị văn hóa, lịch sử hào hùng của dân tộc.',
      en: 'This place is not only a spiritual tourist destination but also a place to preserve the heroic cultural and historical values of the nation.'
    }
  },
  {
    id: 'l2',
    name: { vi: 'Chùa Tam Chúc', en: 'Tam Chuc Pagoda' },
    type: 'Khu tâm linh',
    region: 'Hà Nam',
    tags: ['#InnerLight', '#Nature'],
    image: 'https://images.unsplash.com/photo-1626083049187-d51d38260a9c?q=80&w=2070&auto=format&fit=crop',
    description: {
      vi: 'Được ví như "Vịnh Hạ Long trên cạn", Tam Chúc là điểm đến lý tưởng để tìm lại sự cân bằng giữa thiên nhiên và tâm hồn.',
      en: 'Likened to "Halong Bay on land", Tam Chuc is the ideal destination to find balance between nature and soul.'
    },
    introduction: {
      vi: 'Khu du lịch Quốc gia Tam Chúc là điểm đến tâm linh hấp dẫn, nơi kết hợp hoàn hảo giữa vẻ đẹp cổ kính của ngôi chùa nghìn năm tuổi và sự hùng vĩ của thiên nhiên non nước.',
      en: 'Tam Chuc National Tourist Area is an attractive spiritual destination, perfectly combining the ancient beauty of a thousand-year-old pagoda and the majesty of nature.'
    },
    history: {
      vi: 'Chùa Tam Chúc cổ được xây dựng từ thời nhà Đinh, gắn liền với truyền thuyết "Tiền Lục nhạc - hậu Thất Tinh".',
      en: 'Ancient Tam Chuc Pagoda was built during the Dinh Dynasty, associated with the legend of "Front Six Music - Back Seven Stars".'
    },
    significance: {
      vi: 'Tam Chúc được xem là ngôi chùa lớn nhất thế giới trong tương lai, là biểu tượng của sự trường tồn và phát triển của Phật giáo Việt Nam.',
      en: 'Tam Chuc is considered the largest pagoda in the world in the future, a symbol of the longevity and development of Vietnamese Buddhism.'
    }
  },
  {
    id: 'l3',
    name: { vi: 'Legacy Yên Tử', en: 'Legacy Yen Tu' },
    type: 'Thánh địa Thiền',
    region: 'Quảng Ninh',
    tags: ['#Ancestors', '#Transformation'],
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0ea49b?q=80&w=2000&auto=format&fit=crop',
    description: {
      vi: 'Cái nôi của Thiền phái Trúc Lâm Yên Tử, nơi mây núi giao hòa, mang lại năng lượng chữa lành mạnh mẽ.',
      en: 'The cradle of Truc Lam Zen Buddhism, where clouds and mountains meet, bringing powerful healing energy.'
    },
    introduction: {
      vi: 'Yên Tử là ngọn núi cao trong dãy núi Đông Triều vùng đông bắc Việt Nam. Vốn là là một thắng cảnh thiên nhiên, ngọn Yên Tử còn lưu giữ nhiều di tích lịch sử với mệnh danh "đất tổ Phật giáo Việt Nam".',
      en: 'Yen Tu is a high mountain in the Dong Trieu mountain range in northeastern Vietnam. Originally a natural scenic spot, Yen Tu mountain also preserves many historical relics known as the "ancestral land of Vietnamese Buddhism".'
    },
    history: {
      vi: 'Nơi đây gắn liền với tên tuổi Phật hoàng Trần Nhân Tông, người đã từ bỏ ngai vàng để lên núi tu hành và sáng lập ra Thiền phái Trúc Lâm.',
      en: 'This place is associated with the name of Buddha Emperor Tran Nhan Tong, who gave up the throne to go up the mountain to practice and founded the Truc Lam Zen sect.'
    },
    significance: {
      vi: 'Yên Tử là trung tâm Phật giáo của nước Đại Việt xưa, nơi hội tụ khí thiêng sông núi.',
      en: 'Yen Tu was the Buddhist center of ancient Dai Viet, where the sacred energy of rivers and mountains converged.'
    }
  },
  {
    id: 'l4',
    name: { vi: 'Thiền Viện Chơn Không', en: 'Chon Khong Monastery' },
    type: 'Thiền viện',
    region: 'Vũng Tàu',
    tags: ['#SeaZen', '#Compassion'],
    image: 'https://images.unsplash.com/photo-1688616149247-c0e817025816?q=80&w=2069&auto=format&fit=crop',
    description: {
      vi: 'Nằm trên triền núi Lớn, hướng ra biển Đông, nơi đây mang lại sự tĩnh lặng tuyệt đối để quán chiếu nội tâm.',
      en: 'Located on the slopes of Big Mountain facing the East Sea, offering absolute silence for inner contemplation.'
    },
    introduction: {
      vi: 'Thiền viện Chơn Không tọa lạc trên Hòn Sụp - Núi Lớn, thành phố Vũng Tàu. Nổi bật trên nền cảnh quan thiên nhiên hùng vĩ là tượng Phật bằng vàng khổng lồ.',
      en: 'Chon Khong Monastery is located on Hon Sup - Big Mountain, Vung Tau city. Standing out against the majestic natural landscape is a giant golden Buddha statue.'
    },
    history: {
      vi: 'Được Hòa thượng Thích Thanh Từ khai sơn vào năm 1966, là một trong những thiền viện đầu tiên khôi phục thiền phái Trúc Lâm tại miền Nam.',
      en: 'Founded by Most Venerable Thich Thanh Tu in 1966, it is one of the first monasteries to restore the Truc Lam Zen sect in the South.'
    },
    significance: {
      vi: 'Là nơi tu tập của tăng ni và phật tử, giúp con người tìm lại sự thanh thản trong tâm hồn giữa cuộc sống bộn bề.',
      en: 'A place of practice for monks, nuns and Buddhists, helping people find peace in their souls amidst the busy life.'
    }
  },
  {
    id: 'l5',
    name: { vi: 'Làng gốm Bát Tràng', en: 'Bat Trang Pottery Village' },
    type: 'Làng nghề Gốm',
    region: 'Gia Lâm, Hà Nội',
    tags: ['#KineticZen', '#Grounding', '#HandOnMindfulness'],
    image: 'https://images.unsplash.com/photo-1623945238210-9280d9653457?q=80&w=2070&auto=format&fit=crop',
    description: {
      vi: 'Làng nghề truyền thống nghìn năm tuổi, nơi đất và lửa hòa quyện tạo nên nghệ thuật.',
      en: 'A thousand-year-old traditional village where earth and fire blend to create art.'
    },
    introduction: {
      vi: 'Bát Tràng là làng gốm lâu đời và nổi tiếng nhất Việt Nam. Đến đây, bạn không chỉ được chiêm ngưỡng những sản phẩm gốm tinh xảo mà còn được tự tay trải nghiệm quy trình làm gốm.',
      en: 'Bat Trang is the oldest and most famous pottery village in Vietnam. Coming here, you can not only admire exquisite ceramic products but also experience the pottery making process yourself.'
    },
    history: {
      vi: 'Làng gốm Bát Tràng được hình thành từ thời nhà Lý. Trải qua bao thăng trầm lịch sử, làng nghề vẫn giữ được nét tinh hoa vốn có.',
      en: 'Bat Trang pottery village was formed during the Ly Dynasty. Through many ups and downs of history, the craft village still retains its inherent quintessence.'
    },
    significance: {
      vi: 'Biểu tượng của văn hóa làng nghề Việt Nam, nơi lưu giữ và phát triển nghệ thuật gốm sứ truyền thống.',
      en: 'Symbol of Vietnamese craft village culture, where traditional ceramic art is preserved and developed.'
    }
  },
  {
    id: 'l6',
    name: { vi: 'Làng hương Quảng Phú Cầu', en: 'Quang Phu Cau Incense Village' },
    type: 'Làng nghề Hương',
    region: 'Ứng Hòa, Hà Nội',
    tags: ['#SenseOfSmell', '#Patience', '#VisualMeditation'],
    image: 'https://images.unsplash.com/photo-1674997380952-47526b772457?q=80&w=2070',
    description: {
      vi: 'Rực rỡ sắc đỏ của những bó hương phơi nắng, mang vẻ đẹp tâm linh thuần Việt.',
      en: 'Brilliant red colors of incense bundles drying in the sun, carrying pure Vietnamese spiritual beauty.'
    },
    introduction: {
      vi: 'Làng nghề tăm hương Quảng Phú Cầu nổi tiếng với những sân phơi hương đỏ rực, tạo nên khung cảnh vô cùng ấn tượng và bắt mắt.',
      en: 'Quang Phu Cau incense stick craft village is famous for its bright red incense drying yards, creating an extremely impressive and eye-catching scene.'
    },
    history: {
      vi: 'Nghề làm hương ở đây đã có từ hơn 100 năm nay, được truyền từ đời này sang đời khác.',
      en: 'The incense making craft here has existed for over 100 years, passed down from generation to generation.'
    },
    significance: {
      vi: 'Hương không chỉ là vật phẩm tâm linh mà còn là nét đẹp văn hóa, gắn kết con người với thế giới tâm linh.',
      en: 'Incense is not only a spiritual item but also a cultural beauty, connecting people with the spiritual world.'
    }
  },
  {
    id: 'l7',
    name: { vi: 'Làng Nón Chuông', en: 'Chuong Conical Hat Village' },
    type: 'Làng nghề Nón lá',
    region: 'Thanh Oai, Hà Nội',
    tags: ['#DigitalDetox', '#DeepFocus', '#Concentration'],
    image: 'https://images.unsplash.com/photo-1575468750692-7d22b6459344?q=80&w=2070&auto=format&fit=crop',
    description: {
      vi: 'Nổi tiếng với nón lá truyền thống, nơi lưu giữ hồn quê Bắc Bộ qua từng đường kim mũi chỉ.',
      en: 'Famous for traditional conical hats, preserving the soul of Northern countryside through every stitch.'
    },
    introduction: {
      vi: 'Làng Chuông nổi tiếng với nghề làm nón lá truyền thống. Những chiếc nón Chuông bền, đẹp, đường khâu tỉ mỉ đã trở thành thương hiệu nổi tiếng khắp cả nước.',
      en: 'Chuong village is famous for its traditional conical hat making craft. Durable, beautiful Chuong hats with meticulous stitching have become a famous brand throughout the country.'
    },
    history: {
      vi: 'Làng có lịch sử làm nón từ hàng trăm năm nay, từng là nơi cung cấp nón cho cung đình Huế.',
      en: 'The village has a history of making hats for hundreds of years, once supplying hats to the Hue royal court.'
    },
    significance: {
      vi: 'Chiếc nón lá là biểu tượng của người phụ nữ Việt Nam, của vẻ đẹp dịu dàng và chịu thương chịu khó.',
      en: 'The conical hat is a symbol of Vietnamese women, of gentle beauty and hard work.'
    }
  }
];

export const TOURS: Tour[] = [
  // SEG 1
  {
    id: 't1',
    title: { vi: 'Đường Thiền Tĩnh Tại', en: 'The Zen Path' },
    description: { vi: 'Thiền hành và hít thở tại chùa Bái Đính.', en: 'Mindful walking and breathing at Bai Dinh.' },
    introduction: { 
      vi: 'Hành trình đưa bạn đến với Chùa Bái Đính, quần thể chùa lớn nhất Đông Nam Á. Không chỉ là tham quan, đây là cơ hội để bạn thực hành thiền hành giữa không gian mênh mông của núi non, lắng nghe tiếng chuông chùa ngân vang và tìm lại sự tĩnh tại trong từng hơi thở.',
      en: 'A journey to Bai Dinh Pagoda, the largest complex in Southeast Asia. More than sightseeing, this is an opportunity to practice mindful walking amidst vast mountains, listen to the temple bells, and find stillness in every breath.'
    },
    meaning: {
      vi: 'Giúp bạn rũ bỏ những lo toan thường nhật, học cách bước đi chậm rãi và trân trọng giây phút hiện tại. "Tĩnh tại" không phải là đứng yên, mà là tâm an giữa dòng đời vạn biến.',
      en: 'Helps you shed daily worries, learn to walk slowly, and cherish the present moment. "Stillness" is not standing still, but keeping a calm mind amidst life\'s changes.'
    },
    price_vnd: 2850000,
    duration_days: 2,
    level: 'light',
    suitable_for: { vi: 'Người mới bắt đầu', en: 'Beginners' },
    locations: ['l1'],
    images: ['https://images.unsplash.com/photo-1605649487552-e18ae55d660d?q=80&w=2000', 'https://images.unsplash.com/photo-1627546417973-585c57d54e42?q=80&w=2000'],
    schedule: [{ id: 's1', startDate: '2024-06-15', slots: 20, slotsLeft: 12 }]
  },
  {
    id: 't2',
    title: { vi: 'Vũng Tàu Bình Yên', en: 'Serene Insightful Odyssey' },
    description: { vi: 'Thoát ly thành phố, tìm sự bình yên nhanh chóng.', en: 'Escaping the city to find peace quickly.' },
    introduction: {
      vi: 'Một chuyến đi ngắn ngày đến thành phố biển Vũng Tàu, nhưng không phải để vui chơi ồn ào. Chúng ta sẽ đến Thiền Viện Chơn Không, nơi bạn có thể ngắm nhìn biển cả từ trên cao và thực hành thiền buông thư.',
      en: 'A short trip to Vung Tau coastal city, but not for noisy entertainment. We will visit Chon Khong Monastery, where you can gaze at the ocean from above and practice relaxation meditation.'
    },
    meaning: {
      vi: 'Biển cả luôn có khả năng chữa lành. Sự mênh mông của đại dương giúp bạn nhận ra những nỗi buồn của mình thật nhỏ bé, từ đó dễ dàng buông bỏ và tìm lại niềm vui sống.',
      en: 'The ocean always has healing powers. The vastness of the sea helps you realize your sorrows are small, making it easier to let go and rediscover the joy of living.'
    },
    price_vnd: 2350000,
    duration_days: 2,
    level: 'light',
    suitable_for: { vi: 'Người bận rộn', en: 'Busy people' },
    locations: ['l4'],
    images: ['https://images.unsplash.com/photo-1526715629161-5367825d109f?q=80&w=2000', 'https://images.unsplash.com/photo-1688616149247-c0e817025816?q=80&w=2000'],
    schedule: [{ id: 's2', startDate: '2024-06-20', slots: 15, slotsLeft: 10 }]
  },
  {
    id: 't3',
    title: { vi: 'Hành Trình Hòa Bình', en: 'Peace Journey' },
    description: { vi: 'Tìm ánh sáng nội tâm qua bài thực hành đơn giản.', en: 'Finding inner light through simple practices.' },
    introduction: {
      vi: 'Khám phá Tam Chúc - "Vịnh Hạ Long trên cạn". Giữa khung cảnh non nước hữu tình, bạn sẽ được hướng dẫn các bài tập thiền đơn giản để kết nối lại với chính mình và thiên nhiên.',
      en: 'Explore Tam Chuc - "Halong Bay on Land". Amidst the picturesque landscape, you will be guided through simple meditation exercises to reconnect with yourself and nature.'
    },
    meaning: {
      vi: 'Hòa bình không phải là không có xung đột, mà là khả năng giữ tâm bình an ngay cả khi bão giông. Chuyến đi giúp bạn xây dựng "ngôi nhà nội tâm" vững chãi.',
      en: 'Peace is not the absence of conflict, but the ability to remain calm even in a storm. The trip helps you build a sturdy "inner home".'
    },
    price_vnd: 2250000,
    duration_days: 2,
    level: 'light',
    suitable_for: { vi: 'Mọi người', en: 'Everyone' },
    locations: ['l2'],
    images: ['https://images.unsplash.com/photo-1518182170546-0766aaef31e8?q=80&w=2000', 'https://images.unsplash.com/photo-1599709222625-24017f8b5443?q=80&w=2000'],
    schedule: [{ id: 's3', startDate: '2024-07-01', slots: 25, slotsLeft: 5 }]
  },
  // SEG 2
  {
    id: 't4',
    title: { vi: 'Sự Im Lặng Chữa Lành', en: 'Healing Silence' },
    description: { vi: 'Tịnh khẩu hoàn toàn để quay vào bên trong sâu sắc.', en: 'Noble silence retreat to look inward deeply.' },
    introduction: {
      vi: 'Một khóa tu đặc biệt kéo dài 5 ngày, nơi bạn sẽ thực hành "Tịnh khẩu" (không nói chuyện). Không điện thoại, không giao tiếp xã hội, chỉ có bạn và tâm trí của mình.',
      en: 'A special 5-day retreat where you will practice "Noble Silence" (no talking). No phones, no social interaction, just you and your mind.'
    },
    meaning: {
      vi: 'Khi miệng dừng nói, tâm mới bắt đầu lắng nghe. Sự im lặng là liều thuốc mạnh nhất để chữa lành những tổn thương sâu sắc và thấu hiểu bản thân mình hơn bao giờ hết.',
      en: 'When the mouth stops speaking, the mind begins to listen. Silence is the most powerful medicine to heal deep wounds and understand yourself better than ever.'
    },
    price_vnd: 8500000,
    duration_days: 5,
    level: 'deep',
    suitable_for: { vi: 'Người cần chữa lành sâu', en: 'Deep seekers' },
    locations: ['l1', 'l2'],
    images: ['https://images.unsplash.com/photo-1507643179173-61b0453c06fe?q=80&w=2000', 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=2000'],
    schedule: [{ id: 's4', startDate: '2024-08-05', slots: 10, slotsLeft: 2 }]
  },
  {
    id: 't5',
    title: { vi: 'Hành Trình Tâm Tĩnh', en: 'Journey to Still Mind' },
    description: { vi: 'Làm lắng dịu những suy nghĩ xáo trộn.', en: 'Calming the chaotic thoughts.' },
    introduction: {
      vi: 'Dành cho những ai đang bị quá tải bởi công việc và áp lực cuộc sống. Chương trình kết hợp giữa nghỉ dưỡng và các liệu pháp tâm lý nhẹ nhàng tại không gian xanh mát.',
      en: 'For those overwhelmed by work and life pressures. The program combines relaxation with gentle psychological therapies in a green space.'
    },
    meaning: {
      vi: 'Giúp tâm trí bạn được nghỉ ngơi thực sự. Giống như ly nước đục, khi để yên, cặn sẽ lắng xuống và nước sẽ trong trở lại.',
      en: 'Helps your mind truly rest. Like a glass of muddy water, when left still, the sediment settles and the water becomes clear again.'
    },
    price_vnd: 6800000,
    duration_days: 4,
    level: 'moderate',
    suitable_for: { vi: 'Người căng thẳng', en: 'Stressed people' },
    locations: ['l1'],
    images: ['https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=2000', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?q=80&w=2000'],
    schedule: [{ id: 's5', startDate: '2024-08-15', slots: 15, slotsLeft: 8 }]
  },
  {
    id: 't6',
    title: { vi: 'Thức Tỉnh Bình Yên', en: 'Awakening Inner Peace' },
    description: { vi: 'Khơi gợi sự bình yên bị che lấp bởi nỗi buồn.', en: 'Reawakening peace hidden by sorrow.' },
    introduction: {
      vi: 'Chuyến đi được thiết kế riêng để xoa dịu những nỗi buồn mất mát hoặc chia ly. Bạn sẽ được tham gia các buổi chia sẻ nhóm và thiền từ bi.',
      en: 'A trip designed specifically to soothe the sorrows of loss or separation. You will participate in group sharing sessions and compassion meditation.'
    },
    meaning: {
      vi: 'Nỗi buồn không xấu, nó là dấu hiệu cho thấy bạn đã yêu thương sâu sắc. Chuyến đi giúp bạn ôm ấp nỗi buồn và chuyển hóa nó thành sức mạnh của sự bình yên.',
      en: 'Sadness is not bad; it is a sign that you have loved deeply. The trip helps you embrace sadness and transform it into the power of peace.'
    },
    price_vnd: 4150000,
    duration_days: 3,
    level: 'moderate',
    suitable_for: { vi: 'Người có nỗi buồn', en: 'Those with sorrow' },
    locations: ['l2'],
    images: ['https://images.unsplash.com/photo-1512353087810-25dfcd100962?q=80&w=2000', 'https://images.unsplash.com/photo-1528360983277-13d9b152c6d4?q=80&w=2000'],
    schedule: [{ id: 's6', startDate: '2024-09-01', slots: 20, slotsLeft: 18 }]
  },
  // SEG 3
  {
    id: 't7',
    title: { vi: 'Hành Hương Tỉnh Thức', en: 'The Mindful Pilgrimage' },
    description: { vi: 'Hiểu về triết lý nhân sinh và bài học của Phật.', en: 'Understanding life philosophy & Buddha lessons.' },
    introduction: {
      vi: 'Hành trình dài ngày qua 3 thánh địa tâm linh lớn: Bái Đính, Tam Chúc và Yên Tử. Một cơ hội hiếm có để tìm hiểu sâu về lịch sử, kiến trúc và triết lý Phật giáo Việt Nam.',
      en: 'A long journey through 3 major spiritual sites: Bai Dinh, Tam Chuc, and Yen Tu. A rare opportunity to deeply explore the history, architecture, and philosophy of Vietnamese Buddhism.'
    },
    meaning: {
      vi: 'Không chỉ là du lịch, đây là hành trình về nguồn. Hiểu về quy luật nhân quả, vô thường để sống một cuộc đời ý nghĩa và trách nhiệm hơn.',
      en: 'More than tourism, this is a journey to the source. Understanding the laws of karma and impermanence to live a more meaningful and responsible life.'
    },
    price_vnd: 10500000,
    duration_days: 6,
    level: 'deep',
    suitable_for: { vi: 'Phật tử, người nghiên cứu', en: 'Buddhists' },
    locations: ['l1', 'l2', 'l3'],
    images: ['https://images.unsplash.com/photo-1583253724330-9743c6837920?q=80&w=2000', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000'],
    schedule: [{ id: 's7', startDate: '2024-10-10', slots: 12, slotsLeft: 4 }]
  },
  {
    id: 't8',
    title: { vi: 'Đỉnh Cao Tỉnh Thức', en: 'Peak Of Mindfulness' },
    description: { vi: 'Thiền định tại đất tổ thiền phái Trúc Lâm.', en: 'Meditating at the cradle of Truc Lam Zen.' },
    introduction: {
      vi: 'Chinh phục đỉnh thiêng Yên Tử, nơi Phật Hoàng Trần Nhân Tông tu hành. Bạn sẽ được trải nghiệm ngủ đêm tại Legacy Yên Tử và đón bình minh trên đỉnh núi mây phủ.',
      en: 'Conquer the sacred Yen Tu peak, where Buddha Emperor Tran Nhan Tong practiced. You will experience staying overnight at Legacy Yen Tu and catching the sunrise on the cloudy peak.'
    },
    meaning: {
      vi: 'Hành trình leo núi cũng là hành trình vượt qua chính mình. Đứng trên đỉnh cao, nhìn lại chặng đường đã qua, bạn sẽ thấy mình mạnh mẽ và kiên cường hơn.',
      en: 'The mountain climb is also a journey of overcoming oneself. Standing at the peak, looking back at the path, you will feel stronger and more resilient.'
    },
    price_vnd: 4950000,
    duration_days: 3,
    level: 'deep',
    suitable_for: { vi: 'Thiền sinh', en: 'Zen practitioners' },
    locations: ['l3'],
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000', 'https://images.unsplash.com/photo-1465310477141-6fb93167a273?q=80&w=2000'],
    schedule: [{ id: 's8', startDate: '2024-07-20', slots: 15, slotsLeft: 5 }]
  },
  // SEG 4
  {
    id: 't9',
    title: { vi: 'Sống Tỉnh Thức', en: 'Mindful Living Experience' },
    description: { vi: 'Kết hợp vẻ đẹp Hạ Long và núi thiền Yên Tử.', en: 'Blend of Halong beauty & Yen Tu Zen mountain.' },
    introduction: {
      vi: 'Sự kết hợp hoàn hảo giữa nghỉ dưỡng trên du thuyền Hạ Long và tĩnh tâm tại Yên Tử. Dành cho những ai muốn tận hưởng vẻ đẹp thiên nhiên hùng vĩ một cách trọn vẹn nhất.',
      en: 'A perfect combination of relaxing on a Halong Bay cruise and finding peace at Yen Tu. For those who want to fully enjoy the majestic beauty of nature.'
    },
    meaning: {
      vi: 'Thiên nhiên là người thầy vĩ đại. Khi hòa mình vào thiên nhiên, bạn sẽ học được cách sống thuận theo dòng chảy, buông bỏ sự kiểm soát và tận hưởng từng khoảnh khắc.',
      en: 'Nature is a great teacher. When immersing yourself in nature, you learn to live with the flow, let go of control, and enjoy every moment.'
    },
    price_vnd: 7200000,
    duration_days: 4,
    level: 'moderate',
    suitable_for: { vi: 'Du khách quốc tế', en: 'Intl travelers' },
    locations: ['l3'],
    images: ['https://images.unsplash.com/photo-1506606401543-2e73709cebb4?q=80&w=2000', 'https://images.unsplash.com/photo-1533552839932-d04b6113b91b?q=80&w=2000'],
    schedule: [{ id: 's9', startDate: '2024-11-05', slots: 20, slotsLeft: 15 }]
  },
  // SEG 5 (Craft)
  {
    id: 't10',
    title: { vi: 'Thiền Gốm Bát Tràng', en: 'The Art of Clay Zen' },
    description: { vi: 'Trải nghiệm kết nối Thân - Tâm qua việc điều khiển khối đất.', en: 'Connecting Body & Mind by mastering clay.' },
    introduction: {
      vi: 'Về làng gốm Bát Tràng, tự tay nhào nặn khối đất sét trên bàn xoay. Không cần khéo tay, chỉ cần bạn đặt trọn tâm trí vào đôi bàn tay.',
      en: 'Visit Bat Trang pottery village, mold clay on the wheel with your own hands. No skill needed, just put your whole mind into your hands.'
    },
    meaning: {
      vi: 'Làm gốm là một dạng thiền động. Khi tâm bạn xao động, gốm sẽ méo. Khi tâm bạn tĩnh, gốm sẽ tròn. Bài học về sự tập trung và kiên nhẫn.',
      en: 'Pottery is a form of active meditation. When your mind is agitated, the clay wobbles. When your mind is still, the clay is round. A lesson in focus and patience.'
    },
    price_vnd: 1250000,
    duration_days: 1,
    level: 'light',
    suitable_for: { vi: 'Gia đình, Cặp đôi', en: 'Family, Couples' },
    locations: ['l5'],
    images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2000', 'https://images.unsplash.com/photo-1565193566173-7a641c76e63b?q=80&w=2000'],
    schedule: [{ id: 's10', startDate: '2024-06-05', slots: 30, slotsLeft: 20 }]
  },
  {
    id: 't11',
    title: { vi: 'Hương Sắc Tỉnh Thức', en: 'The Scent of Mindfulness' },
    description: { vi: 'Thực hành sự kiên nhẫn qua kỹ thuật sắp xếp chân hương.', en: 'Practicing patience through manual incense arranging.' },
    introduction: {
      vi: 'Ghé thăm làng hương Quảng Phú Cầu rực rỡ sắc màu. Bạn sẽ được học cách se hương, phơi hương và sắp xếp những bó hương thành những đóa hoa khổng lồ.',
      en: 'Visit the colorful Quang Phu Cau incense village. You will learn how to roll incense, dry it, and arrange incense bundles into giant flowers.'
    },
    meaning: {
      vi: 'Mùi hương là cầu nối tâm linh. Tự tay làm ra nén hương sạch là cách bạn gửi gắm lòng thành kính và rèn luyện sự tỉ mỉ, trân trọng những điều nhỏ bé.',
      en: 'Scent is a spiritual bridge. Making clean incense by hand is how you send your reverence and practice meticulousness, cherishing small things.'
    },
    price_vnd: 1150000,
    duration_days: 1,
    level: 'light',
    suitable_for: { vi: 'Người yêu nhiếp ảnh', en: 'Photographers' },
    locations: ['l6'],
    images: ['https://images.unsplash.com/photo-1616745281861-18e385202979?q=80&w=2000', 'https://images.unsplash.com/photo-1674997380952-47526b772457?q=80&w=2000'],
    schedule: [{ id: 's11', startDate: '2024-06-12', slots: 30, slotsLeft: 10 }]
  },
  {
    id: 't12',
    title: { vi: 'Nét Khâu Tập Trung', en: 'The Stitch of Stillness' },
    description: { vi: 'Rèn luyện sự tập trung và tách rời thiết bị số qua từng đường kim khâu nón.', en: 'Cultivating deep focus and digital detox through hat making.' },
    introduction: {
      vi: 'Trải nghiệm một ngày làm nghệ nhân tại làng nón Chuông. Từng đường kim mũi chỉ đòi hỏi sự chính xác và tập trung cao độ, giúp bạn quên đi điện thoại và công nghệ.',
      en: 'Experience a day as an artisan at Chuong conical hat village. Every stitch requires precision and high concentration, helping you forget phones and technology.'
    },
    meaning: {
      vi: 'Digital Detox (Cai nghiện kỹ thuật số) một cách tự nhiên. Khi đôi tay bận rộn tạo tác cái đẹp, tâm trí bạn sẽ được giải phóng khỏi những lo âu ảo.',
      en: 'Natural Digital Detox. When your hands are busy creating beauty, your mind is freed from virtual anxieties.'
    },
    price_vnd: 1050000,
    duration_days: 1,
    level: 'light',
    suitable_for: { vi: 'Người làm văn phòng', en: 'Office workers' },
    locations: ['l7'],
    images: ['https://images.unsplash.com/photo-1531505324128-444743c2c56a?q=80&w=2000', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000'],
    schedule: [{ id: 's12', startDate: '2024-06-18', slots: 20, slotsLeft: 12 }]
  }
];

export const COURSES: Course[] = [
  {
    id: 'c1',
    title: { vi: 'Sức Mạnh Tâm Trí', en: 'The Power of Mind' },
    description: { vi: 'Khóa trải nghiệm ngắn cho người mới bắt đầu.', en: 'Short introductory course for beginners.' },
    price_vnd: 950000,
    duration: '1/2 Ngày',
    group_link: '#',
    image: 'https://images.unsplash.com/photo-1508672019048-805c276b2554?q=80&w=2000'
  },
  {
    id: 'c2',
    title: { vi: 'Nhập Môn Thiền Định', en: 'Meditation for Beginners' },
    description: { vi: 'Học cách kiểm soát hơi thở và tâm trí trong 7 ngày.', en: 'Learn to control breath and mind in 7 days.' },
    price_vnd: 500000,
    duration: '7 Ngày (Online)',
    group_link: '#',
    image: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?q=80&w=2000'
  },
  {
    id: 'c3',
    title: { vi: 'Chữa Lành Cảm Xúc', en: 'Emotional Healing' },
    description: { vi: 'Phương pháp viết nhật ký và đối thoại nội tâm.', en: 'Journaling methods and inner dialogue.' },
    price_vnd: 1200000,
    duration: '30 Ngày',
    group_link: '#',
    image: 'https://images.unsplash.com/photo-1515023115689-589c33041697?q=80&w=2000'
  }
];

export const DISCOUNTS: Discount[] = [
  { code: 'CHILL10', percent: 10, valid_until: '2024-12-31', usage_limit: 100, used_count: 5 },
  { code: 'AN YEN', percent: 15, valid_until: '2024-12-31', usage_limit: 50, used_count: 12 },
  { code: 'WELCOME', percent: 5, valid_until: '2025-01-01', usage_limit: 1000, used_count: 45 },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Nguyen Van An', email: 'user@antinh.com', role: 'USER', active: true },
  { id: 'a1', name: 'Master Admin', email: 'admin@antinh.com', role: 'ADMIN', active: true },
  { id: 's1', name: 'Sale Staff', email: 'sale@antinh.com', role: 'SALE', active: true },
];

export const REVIEWS: Review[] = [
  { id: 'r1', tourId: 't1', user: 'Minh Anh', rating: 5, comment: 'Một trải nghiệm thay đổi cuộc đời, Bái Đính thật sự linh thiêng.', date: '2024-01-12', bookingId: 'b1' },
  { id: 'r2', tourId: 't10', user: 'John Doe', rating: 4, comment: 'Pottery making was fun and relaxing.', date: '2024-02-20' },
  { id: 'r3', tourId: 't4', user: 'Thanh Hằng', rating: 5, comment: 'Sự im lặng giúp tôi nhìn sâu vào bên trong. Cảm ơn An Tinh Viet.', date: '2024-03-10' },
];

export const EXCHANGE_RATE = 24500;
