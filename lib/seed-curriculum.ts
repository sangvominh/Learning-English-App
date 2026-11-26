import type { CurriculumData, LearningCard, Lesson, Unit } from "./types";

export const SEED_CURRICULUM: CurriculumData = {
  version: 3,
  updatedAt: "2026-11-26T06:00:00.000Z",
  units: [
    {
      id: "unit-daily-1",
      title: "Giao tiếp hằng ngày",
      descriptionVi: "Những câu chào hỏi, cảm xúc và giao tiếp quen thuộc dùng ngay.",
      color: "emerald",
      emoji: "💬",
      lessons: [
        {
          id: "lesson-greetings",
          title: "Chào hỏi & Làm quen",
          subtitleVi: "Chào buổi sáng, cảm ơn và giới thiệu tên mình",
          track: "daily_talk",
          emoji: "👋",
          cards: [
            {
              id: "card-hello",
              type: "sentence",
              text: "Hello!",
              meaningVi: "Xin chào!",
              imageUrl: "/illustrations/wave.svg",
              pronunciationTipVi:
                "Đọc nhẹ nhàng 'hơ-lâu', hơi nhấn ở phần 'lâu' nghe rất thân thiện.",
              exampleEn: "Hello! Nice to meet you.",
              exampleVi: "Xin chào! Rất vui được gặp bạn.",
            },
            {
              id: "card-good-morning",
              type: "sentence",
              text: "Good morning!",
              meaningVi: "Chào buổi sáng!",
              imageUrl: "/illustrations/sun.svg",
              pronunciationTipVi:
                "Nối tự nhiên 'gút mo-ning', nói vui vẻ khi vừa thức dậy hoặc đến lớp.",
              exampleEn: "Good morning, Mom!",
              exampleVi: "Chào buổi sáng, mẹ!",
            },
            {
              id: "card-thank-you",
              type: "sentence",
              text: "Thank you!",
              meaningVi: "Cảm ơn bạn!",
              imageUrl: "/illustrations/thankyou.svg",
              pronunciationTipVi:
                "Đầu lưỡi chạm nhẹ răng rồi nói 'thenh-kiu', nói rõ ràng khi nhận đồ từ ai đó.",
              exampleEn: "Thank you for your help.",
              exampleVi: "Cảm ơn bạn đã giúp mình.",
            },
            {
              id: "card-my-name-is",
              type: "sentence",
              text: "My name is Minh.",
              meaningVi: "Tên mình là Minh.",
              imageUrl: "/illustrations/happy.svg",
              pronunciationTipVi:
                "Đọc rõ từng chữ 'mai nêm iz Minh', có thể thay bằng tên thật của con khi nói ngoài đời.",
              exampleEn: "Hello! My name is Minh.",
              exampleVi: "Xin chào! Tên mình là Minh.",
            },
            {
              id: "card-how-are-you",
              type: "sentence",
              text: "How are you?",
              meaningVi: "Bạn có khỏe không?",
              imageUrl: "/illustrations/wave.svg",
              pronunciationTipVi:
                "Lên giọng nhẹ ở chữ 'you' cuối câu: 'hao a diu?'.",
              exampleEn: "Hi! How are you today?",
              exampleVi: "Chào bạn! Hôm nay bạn thế nào?",
            },
          ],
        },
        {
          id: "lesson-feelings",
          title: "Cảm xúc hằng ngày",
          subtitleVi: "Nói khi mình vui, đói bụng, mệt và hỏi thăm bạn",
          track: "daily_talk",
          emoji: "😊",
          cards: [
            {
              id: "card-happy",
              type: "word",
              text: "happy",
              meaningVi: "vui vẻ",
              imageUrl: "/illustrations/happy.svg",
              pronunciationTipVi:
                "Nhấn rõ phần đầu 'hép-pi', hơi thở nhẹ ở chữ H đầu tiên.",
              exampleEn: "I feel happy today.",
              exampleVi: "Hôm nay mình cảm thấy vui.",
            },
            {
              id: "card-hungry",
              type: "word",
              text: "hungry",
              meaningVi: "đói bụng",
              imageUrl: "/illustrations/hungry.svg",
              pronunciationTipVi:
                "Đọc 'hăng-gri', dùng khi muốn báo với bố mẹ là mình đói rồi.",
              exampleEn: "Mom, I am hungry.",
              exampleVi: "Mẹ ơi, con đói bụng rồi.",
            },
            {
              id: "card-tired",
              type: "word",
              text: "tired",
              meaningVi: "mệt mỏi",
              imageUrl: "/illustrations/tired.svg",
              pronunciationTipVi:
                "Đọc nhẹ nhàng 'tai-ợt', hơi khép nhẹ chữ cuối.",
              exampleEn: "I am tired after school.",
              exampleVi: "Mình hơi mệt sau giờ học.",
            },
            {
              id: "card-i-am-happy",
              type: "sentence",
              text: "I am happy.",
              meaningVi: "Mình rất vui.",
              imageUrl: "/illustrations/happy.svg",
              pronunciationTipVi:
                "Nối nhịp nhàng 'ai em hép-pi' khi trả lời câu hỏi 'How are you?'.",
              exampleEn: "I am happy. Thank you!",
              exampleVi: "Mình rất vui. Cảm ơn bạn!",
            },
            {
              id: "card-are-you-okay",
              type: "sentence",
              text: "Are you okay?",
              meaningVi: "Bạn có sao không?",
              imageUrl: "/illustrations/thankyou.svg",
              pronunciationTipVi:
                "Lên giọng ở cuối 'a diu ô-kây?' khi thấy bạn bị ngã hoặc buồn.",
              exampleEn: "Are you okay? Let me help.",
              exampleVi: "Bạn ổn không? Để mình giúp nhé.",
            },
          ],
        },
        {
          id: "lesson-daily-talk",
          title: "Câu nói lịch sự & Giao tiếp nhanh",
          subtitleVi: "Xin phép, xin lỗi, rủ bạn chơi và tạm biệt",
          track: "daily_talk",
          emoji: "🤝",
          cards: [
            {
              id: "card-please",
              type: "word",
              text: "Please",
              meaningVi: "làm ơn / vui lòng",
              imageUrl: "/illustrations/thankyou.svg",
              pronunciationTipVi:
                "Đọc liền 'p-liz', thêm vào đầu hoặc cuối câu khi muốn nhờ ai giúp.",
              exampleEn: "Water, please.",
              exampleVi: "Làm ơn cho mình xin nước.",
            },
            {
              id: "card-sorry",
              type: "sentence",
              text: "Sorry!",
              meaningVi: "Xin lỗi!",
              imageUrl: "/illustrations/wave.svg",
              pronunciationTipVi:
                "Đọc nhẹ 'so-ri', dùng ngay khi lỡ làm rơi đồ hoặc đụng trúng người khác.",
              exampleEn: "Sorry! I am late.",
              exampleVi: "Xin lỗi! Mình đến muộn.",
            },
            {
              id: "card-lets-go",
              type: "sentence",
              text: "Let's go!",
              meaningVi: "Đi thôi nào!",
              imageUrl: "/illustrations/run.svg",
              pronunciationTipVi:
                "Nhớ có tiếng 'xì' nhỏ ở chữ Let's rồi nối qua 'gâu': 'lét-s gâu!'.",
              exampleEn: "Let's go to school!",
              exampleVi: "Cùng đi học thôi nào!",
            },
            {
              id: "card-want-to-play",
              type: "sentence",
              text: "I want to play.",
              meaningVi: "Mình muốn đi chơi.",
              imageUrl: "/illustrations/play.svg",
              pronunciationTipVi:
                "Đọc tự nhiên theo cụm 'ai oăn tu p-lây'.",
              exampleEn: "I want to play outside.",
              exampleVi: "Mình muốn ra ngoài chơi.",
            },
            {
              id: "card-see-you-tomorrow",
              type: "sentence",
              text: "See you tomorrow!",
              meaningVi: "Hẹn gặp lại ngày mai!",
              imageUrl: "/illustrations/wave.svg",
              pronunciationTipVi:
                "Đọc vui vẻ 'xi diu tu-mo-râu!', dùng lúc tan học chào bạn và cô giáo.",
              exampleEn: "Goodbye! See you tomorrow!",
              exampleVi: "Tạm biệt! Hẹn gặp lại ngày mai!",
            },
          ],
        },
      ],
    },
    {
      id: "unit-life-2",
      title: "Thế giới quanh em",
      descriptionVi: "Gia đình, ăn uống, lớp học, con vật, màu sắc và sinh hoạt hằng ngày.",
      color: "sky",
      emoji: "🌍",
      lessons: [
        {
          id: "lesson-family",
          title: "Gia đình của em",
          subtitleVi: "Gọi tên bố, mẹ, anh chị em và nói câu yêu thương",
          track: "vocab_use",
          emoji: "👪",
          cards: [
            {
              id: "card-mom",
              type: "word",
              text: "mom",
              meaningVi: "mẹ",
              imageUrl: "/illustrations/mom.svg",
              pronunciationTipVi:
                "Đọc 'măm', khép hai môi lại khi kết thúc từ.",
              exampleEn: "My mom is kind.",
              exampleVi: "Mẹ của mình rất tốt bụng.",
            },
            {
              id: "card-dad",
              type: "word",
              text: "dad",
              meaningVi: "bố / ba",
              imageUrl: "/illustrations/dad.svg",
              pronunciationTipVi:
                "Đọc rõ 'đét-đ', nhẹ nhàng kết thúc từ.",
              exampleEn: "Dad drives me to school.",
              exampleVi: "Bố chở mình đi học.",
            },
            {
              id: "card-brother",
              type: "word",
              text: "brother",
              meaningVi: "anh trai / em trai",
              imageUrl: "/illustrations/brother.svg",
              pronunciationTipVi:
                "Đọc 'bra-đơ', nhấn ở phần đầu 'bra'.",
              exampleEn: "My brother likes football.",
              exampleVi: "Anh trai mình thích đá bóng.",
            },
            {
              id: "card-sister",
              type: "word",
              text: "sister",
              meaningVi: "chị gái / em gái",
              imageUrl: "/illustrations/sister.svg",
              pronunciationTipVi:
                "Đọc 'xít-tơ', giữ tiếng xì nhẹ ở giữa từ.",
              exampleEn: "My sister is eight.",
              exampleVi: "Chị gái mình tám tuổi.",
            },
            {
              id: "card-love-family",
              type: "sentence",
              text: "I love my family.",
              meaningVi: "Mình yêu gia đình của mình.",
              imageUrl: "/illustrations/family.svg",
              pronunciationTipVi:
                "Đọc tình cảm 'ai lơv mai phe-mi-li'.",
              exampleEn: "I love my family very much.",
              exampleVi: "Mình rất yêu gia đình của mình.",
            },
          ],
        },
        {
          id: "lesson-food",
          title: "Đồ ăn & Thức uống",
          subtitleVi: "Gọi tên nước, sữa, cơm, táo và nói món mình thích",
          track: "vocab_use",
          emoji: "🍎",
          cards: [
            {
              id: "card-water",
              type: "word",
              text: "water",
              meaningVi: "nước uống",
              imageUrl: "/illustrations/water.svg",
              pronunciationTipVi:
                "Đọc 'oa-tơ', nói khi con khát và muốn xin nước uống.",
              exampleEn: "I drink water every day.",
              exampleVi: "Mình uống nước mỗi ngày.",
            },
            {
              id: "card-milk",
              type: "word",
              text: "milk",
              meaningVi: "sữa",
              imageUrl: "/illustrations/milk.svg",
              pronunciationTipVi:
                "Đọc gọn 'miu-k', bật nhẹ chữ cuối.",
              exampleEn: "I drink milk in the morning.",
              exampleVi: "Mình uống sữa vào buổi sáng.",
            },
            {
              id: "card-rice",
              type: "word",
              text: "rice",
              meaningVi: "cơm",
              imageUrl: "/illustrations/rice.svg",
              pronunciationTipVi:
                "Đọc 'rai-s', nhớ tiếng xì nhẹ ở cuối từ.",
              exampleEn: "We eat rice for dinner.",
              exampleVi: "Nhà mình ăn cơm buổi tối.",
            },
            {
              id: "card-apple",
              type: "word",
              text: "apple",
              meaningVi: "quả táo",
              imageUrl: "/illustrations/apple.svg",
              pronunciationTipVi:
                "Đọc nhẹ 'áp-pồ', nhấn ở phần 'áp'.",
              exampleEn: "This apple is sweet.",
              exampleVi: "Quả táo này rất ngọt.",
            },
            {
              id: "card-like-apples",
              type: "sentence",
              text: "I like apples.",
              meaningVi: "Mình thích ăn táo.",
              imageUrl: "/illustrations/apple.svg",
              pronunciationTipVi:
                "Đọc trôi chảy 'ai lai-k áp-pồ-z', có thể đổi sang món con thích.",
              exampleEn: "I like apples and milk.",
              exampleVi: "Mình thích táo và sữa.",
            },
          ],
        },
        {
          id: "lesson-school",
          title: "Trong lớp học",
          subtitleVi: "Sách, bút, cặp, thầy cô và nói đồ mình có",
          track: "vocab_use",
          emoji: "🎒",
          cards: [
            {
              id: "card-book",
              type: "word",
              text: "book",
              meaningVi: "quyển sách",
              imageUrl: "/illustrations/book.svg",
              pronunciationTipVi:
                "Đọc gọn 'búc-k', bật nhẹ âm cuối để phân biệt rõ.",
              exampleEn: "Open your book, please.",
              exampleVi: "Làm ơn mở sách của con ra.",
            },
            {
              id: "card-pen",
              type: "word",
              text: "pen",
              meaningVi: "cây bút",
              imageUrl: "/illustrations/pen.svg",
              pronunciationTipVi:
                "Bật nhẹ môi ở đầu thành 'p-en', không đọc nhẹ như 'ben'.",
              exampleEn: "Can I borrow a pen?",
              exampleVi: "Cho mình mượn một cây bút được không?",
            },
            {
              id: "card-bag",
              type: "word",
              text: "bag",
              meaningVi: "cái cặp sách",
              imageUrl: "/illustrations/bag.svg",
              pronunciationTipVi:
                "Đọc rõ 'béc-g' (không đọc thành 'béc' cụt).",
              exampleEn: "Put the book in your bag.",
              exampleVi: "Bỏ quyển sách vào cặp của con nhé.",
            },
            {
              id: "card-teacher",
              type: "word",
              text: "teacher",
              meaningVi: "thầy / cô giáo",
              imageUrl: "/illustrations/teacher.svg",
              pronunciationTipVi:
                "Đọc 'tích-chờ', nhấn rõ ở phần đầu.",
              exampleEn: "My teacher is very nice.",
              exampleVi: "Cô giáo của mình rất hiền.",
            },
            {
              id: "card-have-new-book",
              type: "sentence",
              text: "I have a new book.",
              meaningVi: "Mình có một quyển sách mới.",
              imageUrl: "/illustrations/book.svg",
              pronunciationTipVi:
                "Đọc tự nhiên 'ai hev ơ niu búc-k'.",
              exampleEn: "Look! I have a new book.",
              exampleVi: "Nhìn nè! Mình có một quyển sách mới.",
            },
          ],
        },
        {
          id: "lesson-animals",
          title: "Con vật quanh em",
          subtitleVi: "Mèo, chó, chim, cá và câu mô tả con vật nhìn thấy",
          track: "vocab_use",
          emoji: "🐾",
          cards: [
            {
              id: "card-cat",
              type: "word",
              text: "cat",
              meaningVi: "con mèo",
              imageUrl: "/illustrations/cat.svg",
              pronunciationTipVi:
                "Đọc gọn 'két-t', nhớ bật nhẹ chữ t cuối từ.",
              exampleEn: "The cat is sleeping.",
              exampleVi: "Con mèo đang ngủ.",
            },
            {
              id: "card-dog",
              type: "word",
              text: "dog",
              meaningVi: "con chó",
              imageUrl: "/illustrations/dog.svg",
              pronunciationTipVi:
                "Đọc 'đo-g', kết thúc nhẹ bằng tiếng 'g' nhỏ.",
              exampleEn: "The dog can run fast.",
              exampleVi: "Chú chó chạy rất nhanh.",
            },
            {
              id: "card-bird",
              type: "word",
              text: "bird",
              meaningVi: "con chim",
              imageUrl: "/illustrations/bird.svg",
              pronunciationTipVi:
                "Đọc 'bơ-đ', hơi cong nhẹ lưỡi ở giữa từ.",
              exampleEn: "A blue bird is singing.",
              exampleVi: "Một chú chim xanh đang hót.",
            },
            {
              id: "card-fish",
              type: "word",
              text: "fish",
              meaningVi: "con cá",
              imageUrl: "/illustrations/fish.svg",
              pronunciationTipVi:
                "Kết thúc bằng tiếng 'sh' nhẹ như đang ra hiệu giữ im lặng.",
              exampleEn: "The fish swims in water.",
              exampleVi: "Con cá bơi trong nước.",
            },
            {
              id: "card-see-cute-dog",
              type: "sentence",
              text: "I see a cute dog.",
              meaningVi: "Mình thấy một chú chó dễ thương.",
              imageUrl: "/illustrations/dog.svg",
              pronunciationTipVi:
                "Đọc liền mạch 'ai xi ơ kiu-t đo-g'.",
              exampleEn: "Look! I see a cute dog.",
              exampleVi: "Nhìn kìa! Mình thấy một chú chó dễ thương.",
            },
          ],
        },
        {
          id: "lesson-colors",
          title: "Màu sắc quen thuộc",
          subtitleVi: "Đỏ, xanh dương, xanh lá, vàng và câu hỏi màu gì",
          track: "vocab_use",
          emoji: "🎨",
          cards: [
            {
              id: "card-red",
              type: "word",
              text: "red",
              meaningVi: "màu đỏ",
              imageUrl: "/illustrations/red.svg",
              pronunciationTipVi:
                "Hơi chu môi đọc 'rét-đ' (không rung lưỡi).",
              exampleEn: "I have a red pen.",
              exampleVi: "Mình có một cây bút đỏ.",
            },
            {
              id: "card-blue",
              type: "word",
              text: "blue",
              meaningVi: "màu xanh dương",
              imageUrl: "/illustrations/blue.svg",
              pronunciationTipVi:
                "Đọc liền 'b-lu' gọn gàng, không tách thành 'bờ-lu'.",
              exampleEn: "The sky is blue.",
              exampleVi: "Bầu trời màu xanh dương.",
            },
            {
              id: "card-green",
              type: "word",
              text: "green",
              meaningVi: "màu xanh lá",
              imageUrl: "/illustrations/green.svg",
              pronunciationTipVi:
                "Nối liền 'g-rin', kéo nhẹ âm 'i'.",
              exampleEn: "The grass is green.",
              exampleVi: "Bãi cỏ màu xanh lá.",
            },
            {
              id: "card-yellow",
              type: "word",
              text: "yellow",
              meaningVi: "màu vàng",
              imageUrl: "/illustrations/yellow.svg",
              pronunciationTipVi:
                "Đọc 'déo-lâu', nhấn nhẹ phần đầu.",
              exampleEn: "The sun is yellow.",
              exampleVi: "Mặt trời màu vàng.",
            },
            {
              id: "card-what-color",
              type: "sentence",
              text: "What color is it?",
              meaningVi: "Nó có màu gì vậy?",
              imageUrl: "/illustrations/star.svg",
              pronunciationTipVi:
                "Hỏi tự nhiên 'oắt ca-lơ iz ít?', dùng khi muốn hỏi màu của đồ vật.",
              exampleEn: "What color is it? It is blue.",
              exampleVi: "Nó màu gì vậy? Nó màu xanh dương.",
            },
          ],
        },
        {
          id: "lesson-actions",
          title: "Hoạt động mỗi ngày",
          subtitleVi: "Ăn, uống, chơi, ngủ và nói điều em làm được",
          track: "vocab_use",
          emoji: "🏃",
          cards: [
            {
              id: "card-eat",
              type: "word",
              text: "eat",
              meaningVi: "ăn",
              imageUrl: "/illustrations/eat.svg",
              pronunciationTipVi:
                "Đọc kéo nhẹ 'ít-t', bật nhẹ chữ cuối.",
              exampleEn: "Let's eat rice!",
              exampleVi: "Cùng ăn cơm thôi!",
            },
            {
              id: "card-drink",
              type: "word",
              text: "drink",
              meaningVi: "uống",
              imageUrl: "/illustrations/water.svg",
              pronunciationTipVi:
                "Đọc gọn 'đờ-rinh-k', nói khi uống nước hoặc sữa.",
              exampleEn: "Drink more water.",
              exampleVi: "Hãy uống thêm nước nhé.",
            },
            {
              id: "card-play",
              type: "word",
              text: "play",
              meaningVi: "chơi",
              imageUrl: "/illustrations/play.svg",
              pronunciationTipVi:
                "Đọc liền 'p-lây', bật nhẹ chữ p ở đầu.",
              exampleEn: "Can we play together?",
              exampleVi: "Mình chơi cùng nhau được không?",
            },
            {
              id: "card-sleep",
              type: "word",
              text: "sleep",
              meaningVi: "ngủ",
              imageUrl: "/illustrations/sleep.svg",
              pronunciationTipVi:
                "Xì nhẹ rồi vào luôn 'x-líp-p'.",
              exampleEn: "It is time to sleep.",
              exampleVi: "Đến giờ đi ngủ rồi.",
            },
            {
              id: "card-can-read",
              type: "sentence",
              text: "I can read.",
              meaningVi: "Mình biết đọc rồi.",
              imageUrl: "/illustrations/read.svg",
              pronunciationTipVi:
                "Đọc tự tin 'ai ken ri-đ'.",
              exampleEn: "I can read English books.",
              exampleVi: "Mình có thể đọc sách tiếng Anh.",
            },
          ],
        },
        {
          id: "lesson-home",
          title: "Đồ vật trong nhà",
          subtitleVi: "Giường, bàn, ghế, cửa và hỏi đồ ở đâu",
          track: "vocab_use",
          emoji: "🏠",
          cards: [
            {
              id: "card-bed",
              type: "word",
              text: "bed",
              meaningVi: "cái giường",
              imageUrl: "/illustrations/bed.svg",
              pronunciationTipVi:
                "Đọc rõ 'bét-đ', khép nhẹ cuối từ.",
              exampleEn: "My bed is soft.",
              exampleVi: "Cái giường của mình rất êm.",
            },
            {
              id: "card-table",
              type: "word",
              text: "table",
              meaningVi: "cái bàn",
              imageUrl: "/illustrations/table.svg",
              pronunciationTipVi:
                "Đọc 'tây-bồ', nhấn ở phần 'tây'.",
              exampleEn: "The book is on the table.",
              exampleVi: "Quyển sách ở trên cái bàn.",
            },
            {
              id: "card-chair",
              type: "word",
              text: "chair",
              meaningVi: "cái ghế",
              imageUrl: "/illustrations/chair.svg",
              pronunciationTipVi:
                "Đọc 'che-ơ', bắt đầu giống âm 'ch' nhẹ.",
              exampleEn: "Sit on the chair, please.",
              exampleVi: "Mời con ngồi lên ghế.",
            },
            {
              id: "card-door",
              type: "word",
              text: "door",
              meaningVi: "cánh cửa",
              imageUrl: "/illustrations/door.svg",
              pronunciationTipVi:
                "Đọc rõ 'đo-r', dùng khi nói đóng hoặc mở cửa.",
              exampleEn: "Close the door, please.",
              exampleVi: "Làm ơn đóng cửa lại nhé.",
            },
            {
              id: "card-where-bag",
              type: "sentence",
              text: "Where is my bag?",
              meaningVi: "Cái cặp của mình đâu rồi?",
              imageUrl: "/illustrations/bag.svg",
              pronunciationTipVi:
                "Lên giọng nhẹ khi hỏi: 'oe iz mai béc-g?'.",
              exampleEn: "Mom, where is my bag?",
              exampleVi: "Mẹ ơi, cặp của con đâu rồi?",
            },
          ],
        },
      ],
    },
  ],
};

export interface FlattenedCard {
  card: LearningCard;
  lesson: Lesson;
  unit: Unit;
}

export function flattenCards(curriculum: CurriculumData): FlattenedCard[] {
  const result: FlattenedCard[] = [];
  for (const unit of curriculum.units) {
    for (const lesson of unit.lessons) {
      for (const card of lesson.cards) {
        result.push({ card, lesson, unit });
      }
    }
  }
  return result;
}

export function findLessonById(
  curriculum: CurriculumData,
  lessonId: string
): { unit: Unit; lesson: Lesson } | null {
  for (const unit of curriculum.units) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      return { unit, lesson };
    }
  }
  return null;
}
