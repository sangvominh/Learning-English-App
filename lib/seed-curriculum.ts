import type { CurriculumData, LearningCard, Lesson, Unit } from "./types";

export const SEED_CURRICULUM: CurriculumData = {
  version: 2,
  updatedAt: "2026-11-26T00:00:00.000Z",
  units: [
    {
      id: "unit-1",
      title: "Chặng 1: Âm S - A - T & Chào hỏi",
      descriptionVi: "Làm quen 3 âm đầu tiên để ghép vần, kèm từ vựng & câu chào.",
      color: "emerald",
      emoji: "🌱",
      lessons: [
        {
          id: "lesson-1-1",
          title: "Âm S, A, T & ghép vần SAT",
          subtitleVi: "Nghe âm bật rõ và ghép vần đầu tiên",
          track: "phonics",
          emoji: "🔤",
          cards: [
            {
              id: "card-s",
              type: "phonics",
              text: "s",
              spokenText: "s... sun",
              meaningVi: "Âm /s/ — tiếng xì hơi nhẹ",
              ipa: "/s/",
              phonicsBreakdown: "s - sun",
              imageUrl: "/illustrations/sun.svg",
              pronunciationTipVi:
                "Khép nhẹ hai hàm răng, đẩy luồng hơi nhẹ ra ngoài thành tiếng 'xì' mảnh (không đọc thành 'ét-sì').",
              focusPhonemes: ["/s/"],
              exampleEn: "I see the sun.",
              exampleVi: "Mình nhìn thấy mặt trời.",
            },
            {
              id: "card-a",
              type: "phonics",
              text: "a",
              spokenText: "a... ant",
              meaningVi: "Âm /æ/ — mở miệng rộng giữa 'a' và 'e'",
              ipa: "/æ/",
              phonicsBreakdown: "a - ant",
              imageUrl: "/illustrations/ant.svg",
              pronunciationTipVi:
                "Mở rộng miệng theo chiều ngang như sắp cắn quả táo, đọc dứt khoát giữa âm 'a' và 'e'.",
              focusPhonemes: ["/æ/"],
              exampleEn: "It is a small ant.",
              exampleVi: "Đó là một chú kiến nhỏ.",
            },
            {
              id: "card-t",
              type: "phonics",
              text: "t",
              spokenText: "t... tiger",
              meaningVi: "Âm /t/ — bật hơi nhẹ đầu lưỡi",
              ipa: "/t/",
              phonicsBreakdown: "t - tiger",
              imageUrl: "/illustrations/tiger.svg",
              pronunciationTipVi:
                "Đặt đầu lưỡi chạm nhẹ mặt trong răng trên rồi bật hơi ra 't-h', đừng thêm âm 'ờ' phía sau.",
              focusPhonemes: ["/t/"],
              exampleEn: "Look at the tiger.",
              exampleVi: "Hãy nhìn con hổ kìa.",
            },
            {
              id: "card-sat",
              type: "word",
              text: "sat",
              meaningVi: "đã ngồi xuống",
              ipa: "/sæt/",
              phonicsBreakdown: "s - a - t",
              imageUrl: "/illustrations/sat.svg",
              pronunciationTipVi:
                "Nối liền 3 âm: xì /s/ + mở miệng /æ/ + bật rõ âm /t/ ở cuối chữ.",
              focusPhonemes: ["/s/", "/æ/", "/t/"],
              exampleEn: "The cat sat down.",
              exampleVi: "Con mèo đã ngồi xuống.",
            },
          ],
        },
        {
          id: "lesson-1-2",
          title: "Chào hỏi & từ vựng đầu tiên",
          subtitleVi: "Từ quen thuộc và câu chào đơn giản",
          track: "vocab_sentence",
          emoji: "🌞",
          cards: [
            {
              id: "card-sun",
              type: "word",
              text: "sun",
              meaningVi: "mặt trời",
              ipa: "/sʌn/",
              phonicsBreakdown: "s - u - n",
              imageUrl: "/illustrations/sun.svg",
              pronunciationTipVi:
                "Bắt đầu bằng tiếng xì /s/ nhẹ, giữa là âm 'ă' ngắn, kết thúc bằng âm /n/ đóng miệng.",
              focusPhonemes: ["/s/", "/n/"],
              exampleEn: "The sun is bright.",
              exampleVi: "Mặt trời thật sáng.",
            },
            {
              id: "card-apple",
              type: "word",
              text: "apple",
              meaningVi: "quả táo",
              ipa: "/ˈæp.əl/",
              phonicsBreakdown: "ap - ple",
              imageUrl: "/illustrations/apple.svg",
              pronunciationTipVi:
                "Nhấn mạnh vần đầu 'ÁP' (/æp/), vần sau đọc nhẹ 'pồ' — không đọc thành 'ép-pồ' nặng.",
              focusPhonemes: ["/æ/", "/p/"],
              exampleEn: "I eat a red apple.",
              exampleVi: "Mình ăn một quả táo đỏ.",
            },
            {
              id: "card-cat",
              type: "word",
              text: "cat",
              meaningVi: "con mèo",
              ipa: "/kæt/",
              phonicsBreakdown: "c - a - t",
              imageUrl: "/illustrations/cat.svg",
              pronunciationTipVi:
                "Bật nhẹ chữ 'cờ' trong cổ họng + âm /æ/ mở rộng + nhớ bật âm /t/ ở cuối nhé.",
              focusPhonemes: ["/k/", "/æ/", "/t/"],
              exampleEn: "My cat is cute.",
              exampleVi: "Con mèo của mình rất dễ thương.",
            },
            {
              id: "card-hello-happy",
              type: "sentence",
              text: "Hello! I am happy.",
              meaningVi: "Xin chào! Mình rất vui.",
              ipa: "/həˈloʊ aɪ æm ˈhæp.i/",
              phonicsBreakdown: "Hello! | I | am | happy.",
              imageUrl: "/illustrations/happy.svg",
              pronunciationTipVi:
                "Đọc tự nhiên từng nhịp: 'Hơ-lâu! Ai em HÉP-pi.' Nhớ bật hơi chữ H ở từ Hello và happy.",
              focusPhonemes: ["/h/", "/æ/", "/p/"],
            },
          ],
        },
      ],
    },
    {
      id: "unit-2",
      title: "Chặng 2: Âm P - I - N & Bạn thú cưng",
      descriptionVi: "Thêm 3 âm mới để ghép chữ và gọi tên động vật.",
      color: "sky",
      emoji: "🐾",
      lessons: [
        {
          id: "lesson-2-1",
          title: "Âm P, I, N & ghép vần PIN",
          subtitleVi: "Bật hơi chữ P và ghép vần P-I-N",
          track: "phonics",
          emoji: "📌",
          cards: [
            {
              id: "card-p",
              type: "phonics",
              text: "p",
              spokenText: "p... pig",
              meaningVi: "Âm /p/ — mím môi bật hơi mạnh",
              ipa: "/p/",
              phonicsBreakdown: "p - pig",
              imageUrl: "/illustrations/pig.svg",
              pronunciationTipVi:
                "Mím chặt hai môi rồi bật mạnh hơi ra (giơ tay trước miệng sẽ thấy hơi thổi vào tay).",
              focusPhonemes: ["/p/"],
              exampleEn: "It is a pink pig.",
              exampleVi: "Đó là một chú heo hồng.",
            },
            {
              id: "card-i",
              type: "phonics",
              text: "i",
              spokenText: "i... igloo",
              meaningVi: "Âm /ɪ/ — đọc gọn giữa 'i' và 'ê'",
              ipa: "/ɪ/",
              phonicsBreakdown: "i - igloo",
              imageUrl: "/illustrations/igloo.svg",
              pronunciationTipVi:
                "Thả lỏng miệng, đọc ngắn gọn âm 'i' dứt khoát (không kéo dài như 'ii').",
              focusPhonemes: ["/ɪ/"],
              exampleEn: "The igloo is cold.",
              exampleVi: "Lều tuyết rất lạnh.",
            },
            {
              id: "card-n",
              type: "phonics",
              text: "n",
              spokenText: "n... nest",
              meaningVi: "Âm /n/ — đầu lưỡi chạm nóc miệng",
              ipa: "/n/",
              phonicsBreakdown: "n - nest",
              imageUrl: "/illustrations/nest.svg",
              pronunciationTipVi:
                "Chạm đầu lưỡi lên phần lợi phía trên răng và ngân nhẹ qua mũi 'nnn'.",
              focusPhonemes: ["/n/"],
              exampleEn: "Birds are in the nest.",
              exampleVi: "Những chú chim ở trong tổ.",
            },
            {
              id: "card-pin",
              type: "word",
              text: "pin",
              meaningVi: "cái ghim",
              ipa: "/pɪn/",
              phonicsBreakdown: "p - i - n",
              imageUrl: "/illustrations/pin.svg",
              pronunciationTipVi:
                "Bật hơi mạnh ở âm /p/ đầu, đọc gọn /ɪ/, rồi đưa đầu lưỡi lên đóng âm /n/.",
              focusPhonemes: ["/p/", "/ɪ/", "/n/"],
              exampleEn: "This is a red pin.",
              exampleVi: "Đây là một cái ghim đỏ.",
            },
          ],
        },
        {
          id: "lesson-2-2",
          title: "Con vật quen thuộc",
          subtitleVi: "Gọi tên con vật và giới thiệu câu ngắn",
          track: "vocab_sentence",
          emoji: "🐶",
          cards: [
            {
              id: "card-dog",
              type: "word",
              text: "dog",
              meaningVi: "con chó",
              ipa: "/dɔːɡ/",
              phonicsBreakdown: "d - o - g",
              imageUrl: "/illustrations/dog.svg",
              pronunciationTipVi:
                "Đọc rõ âm 'đo-g', nhớ rung nhẹ âm /g/ ở cuống họng khi kết thúc từ.",
              focusPhonemes: ["/d/", "/ɡ/"],
              exampleEn: "The dog can run.",
              exampleVi: "Chú chó có thể chạy.",
            },
            {
              id: "card-pig",
              type: "word",
              text: "pig",
              meaningVi: "con heo / lợn",
              ipa: "/pɪɡ/",
              phonicsBreakdown: "p - i - g",
              imageUrl: "/illustrations/pig.svg",
              pronunciationTipVi:
                "Bật hơi chữ P đầu tiên thật rõ, đừng quên âm /g/ nhỏ ở cuối từ.",
              focusPhonemes: ["/p/", "/ɪ/", "/ɡ/"],
              exampleEn: "The pig is big.",
              exampleVi: "Chú heo rất to.",
            },
            {
              id: "card-duck",
              type: "word",
              text: "duck",
              meaningVi: "con vịt",
              ipa: "/dʌk/",
              phonicsBreakdown: "d - u - ck",
              imageUrl: "/illustrations/duck.svg",
              pronunciationTipVi:
                "Âm giữa giống chữ 'ă' nhanh, kết thúc bằng tiếng bật /k/ gọn gàng.",
              focusPhonemes: ["/d/", "/k/"],
              exampleEn: "A yellow duck swims.",
              exampleVi: "Một chú vịt vàng đang bơi.",
            },
            {
              id: "card-it-is-dog",
              type: "sentence",
              text: "It is a dog.",
              meaningVi: "Đó là một chú chó.",
              ipa: "/ɪt ɪz ə dɔːɡ/",
              phonicsBreakdown: "It | is | a | dog.",
              imageUrl: "/illustrations/dog.svg",
              pronunciationTipVi:
                "Đọc nối nhịp nhàng: 'Ít iz ơ đo-g'. Chú ý âm /z/ nhẹ ở từ 'is' và /g/ ở cuối 'dog'.",
              focusPhonemes: ["/t/", "/z/", "/ɡ/"],
            },
          ],
        },
      ],
    },
    {
      id: "unit-4",
      title: "Chặng 3: Âm C - E - H & Số đếm",
      descriptionVi: "Thêm nhóm âm C-E-H, ghép vần HEN và tập đếm số.",
      color: "emerald",
      emoji: "🐣",
      lessons: [
        {
          id: "lesson-4-1",
          title: "Âm C, E, H & ghép vần HEN",
          subtitleVi: "Phân biệt âm /k/, /e/, /h/ và ghép từ HEN",
          track: "phonics",
          emoji: "🐔",
          cards: [
            {
              id: "card-c",
              type: "phonics",
              text: "c",
              spokenText: "c... cup",
              meaningVi: "Âm /k/ — bật nhẹ từ cuống họng",
              ipa: "/k/",
              phonicsBreakdown: "c - cup",
              imageUrl: "/illustrations/cup.svg",
              pronunciationTipVi:
                "Chạm cuống lưỡi vào vòm họng rồi bật hơi nhẹ 'kh' (nhẹ hơn chữ 'kh' tiếng Việt).",
              focusPhonemes: ["/k/"],
              exampleEn: "I have a blue cup.",
              exampleVi: "Mình có một cái cốc xanh.",
            },
            {
              id: "card-e",
              type: "phonics",
              text: "e",
              spokenText: "e... egg",
              meaningVi: "Âm /e/ — đọc gọn giống chữ 'e'",
              ipa: "/e/",
              phonicsBreakdown: "e - egg",
              imageUrl: "/illustrations/egg.svg",
              pronunciationTipVi:
                "Mở miệng vừa phải, đọc ngắn và dứt khoát âm 'e' (không kéo dài).",
              focusPhonemes: ["/e/"],
              exampleEn: "I eat an egg.",
              exampleVi: "Mình ăn một quả trứng.",
            },
            {
              id: "card-h",
              type: "phonics",
              text: "h",
              spokenText: "h... hat",
              meaningVi: "Âm /h/ — hà hơi nhẹ từ cổ họng",
              ipa: "/h/",
              phonicsBreakdown: "h - hat",
              imageUrl: "/illustrations/hat.svg",
              pronunciationTipVi:
                "Thả lỏng miệng và thở một luồng hơi nhẹ 'h...' như đang hà hơi làm ấm tay.",
              focusPhonemes: ["/h/"],
              exampleEn: "Put on your hat.",
              exampleVi: "Hãy đội mũ lên nào.",
            },
            {
              id: "card-hen",
              type: "word",
              text: "hen",
              meaningVi: "con gà mái",
              ipa: "/hen/",
              phonicsBreakdown: "h - e - n",
              imageUrl: "/illustrations/hen.svg",
              pronunciationTipVi:
                "Hà hơi /h/ + âm /e/ gọn + đưa đầu lưỡi lên đóng âm /n/ ở cuối từ.",
              focusPhonemes: ["/h/", "/e/", "/n/"],
              exampleEn: "The hen is on the farm.",
              exampleVi: "Con gà mái ở trong trang trại.",
            },
          ],
        },
        {
          id: "lesson-4-2",
          title: "Số đếm & giới thiệu tuổi",
          subtitleVi: "Đếm số 1, 2, 3 và nói tuổi của mình",
          track: "vocab_sentence",
          emoji: "🔢",
          cards: [
            {
              id: "card-one",
              type: "word",
              text: "one",
              meaningVi: "số một",
              ipa: "/wʌn/",
              phonicsBreakdown: "o - ne",
              imageUrl: "/illustrations/one.svg",
              pronunciationTipVi:
                "Chu môi đọc 'uăn' thật nhanh và đóng âm /n/ ở cuối (không đọc là 'oan').",
              focusPhonemes: ["/w/", "/n/"],
              exampleEn: "I have one book.",
              exampleVi: "Mình có một quyển sách.",
            },
            {
              id: "card-two",
              type: "word",
              text: "two",
              meaningVi: "số hai",
              ipa: "/tuː/",
              phonicsBreakdown: "tw - o",
              imageUrl: "/illustrations/two.svg",
              pronunciationTipVi:
                "Bật hơi chữ /t/ ở đầu (nghe hơi giống 'th-u'), tròn môi kéo nhẹ âm 'u'.",
              focusPhonemes: ["/t/", "/uː/"],
              exampleEn: "I see two cats.",
              exampleVi: "Mình thấy hai con mèo.",
            },
            {
              id: "card-three",
              type: "word",
              text: "three",
              meaningVi: "số ba",
              ipa: "/θriː/",
              phonicsBreakdown: "th - ree",
              imageUrl: "/illustrations/three.svg",
              pronunciationTipVi:
                "Đặt nhẹ đầu lưỡi giữa hai hàm răng, thổi hơi /θ/ rồi kéo sang 'ri' (tránh đọc thành 'tri').",
              focusPhonemes: ["/θ/", "/r/"],
              exampleEn: "There are three pens.",
              exampleVi: "Có ba cây bút mực.",
            },
            {
              id: "card-eight",
              type: "sentence",
              text: "I am eight.",
              meaningVi: "Mình tám tuổi.",
              ipa: "/aɪ æm eɪt/",
              phonicsBreakdown: "I | am | eight.",
              imageUrl: "/illustrations/eight.svg",
              pronunciationTipVi:
                "Đọc rõ 'Ai em ết', nhớ bật âm /t/ nhẹ ở cuối từ 'eight'.",
              focusPhonemes: ["/æ/", "/t/"],
            },
          ],
        },
      ],
    },
    {
      id: "unit-3",
      title: "Chặng 4: Màu sắc & Đồ dùng lớp 3",
      descriptionVi: "Từ vựng quanh bàn học của bé, nói câu mô tả màu sắc và đồ vật.",
      color: "amber",
      emoji: "🎒",
      lessons: [
        {
          id: "lesson-3-1",
          title: "Màu sắc cơ bản",
          subtitleVi: "Nhận biết màu đỏ, xanh dương và xanh lá",
          track: "vocab_sentence",
          emoji: "🎨",
          cards: [
            {
              id: "card-red",
              type: "word",
              text: "red",
              meaningVi: "màu đỏ",
              ipa: "/red/",
              phonicsBreakdown: "r - e - d",
              imageUrl: "/illustrations/red.svg",
              pronunciationTipVi:
                "Hơi chu môi khi bắt đầu âm /r/ (không rung lưỡi như chữ 'r' tiếng Việt), kết thúc bằng âm /d/.",
              focusPhonemes: ["/r/", "/d/"],
              exampleEn: "My bag is red.",
              exampleVi: "Cái cặp của mình màu đỏ.",
            },
            {
              id: "card-blue",
              type: "word",
              text: "blue",
              meaningVi: "màu xanh dương",
              ipa: "/bluː/",
              phonicsBreakdown: "bl - ue",
              imageUrl: "/illustrations/blue.svg",
              pronunciationTipVi:
                "Đọc liền 'b-lu' (không tách thành 'bờ-lu'), kéo nhẹ âm /uː/ tròn môi.",
              focusPhonemes: ["/b/", "/l/", "/uː/"],
              exampleEn: "The sky is blue.",
              exampleVi: "Bầu trời màu xanh dương.",
            },
            {
              id: "card-green",
              type: "word",
              text: "green",
              meaningVi: "màu xanh lá",
              ipa: "/ɡriːn/",
              phonicsBreakdown: "gr - ee - n",
              imageUrl: "/illustrations/green.svg",
              pronunciationTipVi:
                "Nối liền 'g-r' không tách rời, kéo nhẹ âm 'ii' rồi đóng bằng âm /n/.",
              focusPhonemes: ["/ɡ/", "/r/", "/n/"],
              exampleEn: "The tree is green.",
              exampleVi: "Cái cây có màu xanh lá.",
            },
            {
              id: "card-it-is-red",
              type: "sentence",
              text: "It is red.",
              meaningVi: "Nó có màu đỏ.",
              ipa: "/ɪt ɪz red/",
              phonicsBreakdown: "It | is | red.",
              imageUrl: "/illustrations/red.svg",
              pronunciationTipVi:
                "Nhấn nhẹ ở chữ 'red' cuối câu và giữ âm /d/ khép nhẹ ở cuối.",
              focusPhonemes: ["/t/", "/z/", "/r/", "/d/"],
            },
          ],
        },
        {
          id: "lesson-3-2",
          title: "Đồ dùng học tập",
          subtitleVi: "Bút, sách, cặp đi học và câu I have...",
          track: "vocab_sentence",
          emoji: "📚",
          cards: [
            {
              id: "card-pen",
              type: "word",
              text: "pen",
              meaningVi: "cây bút mực",
              ipa: "/pen/",
              phonicsBreakdown: "p - e - n",
              imageUrl: "/illustrations/pen.svg",
              pronunciationTipVi:
                "Bật hơi rõ âm /p/ ở đầu, sau đó nối 'en' gọn gàng.",
              focusPhonemes: ["/p/", "/n/"],
              exampleEn: "This is my pen.",
              exampleVi: "Đây là cây bút của mình.",
            },
            {
              id: "card-book",
              type: "word",
              text: "book",
              meaningVi: "quyển sách",
              ipa: "/bʊk/",
              phonicsBreakdown: "b - oo - k",
              imageUrl: "/illustrations/book.svg",
              pronunciationTipVi:
                "Âm 'u' ngắn gọn và đừng quên bật tiếng /k/ nhỏ ở cuối từ 'book' nhé.",
              focusPhonemes: ["/b/", "/k/"],
              exampleEn: "Open your book.",
              exampleVi: "Hãy mở sách của con ra.",
            },
            {
              id: "card-bag",
              type: "word",
              text: "bag",
              meaningVi: "cái cặp sách",
              ipa: "/bæɡ/",
              phonicsBreakdown: "b - a - g",
              imageUrl: "/illustrations/bag.svg",
              pronunciationTipVi:
                "Mở rộng miệng ở âm /æ/ giữa từ và khép nhẹ âm /g/ ở cuối (không đọc là 'béc').",
              focusPhonemes: ["/b/", "/æ/", "/ɡ/"],
              exampleEn: "My bag is blue.",
              exampleVi: "Cái cặp của mình màu xanh.",
            },
            {
              id: "card-i-have-book",
              type: "sentence",
              text: "I have a book.",
              meaningVi: "Mình có một quyển sách.",
              ipa: "/aɪ hæv ə bʊk/",
              phonicsBreakdown: "I | have | a | book.",
              imageUrl: "/illustrations/book.svg",
              pronunciationTipVi:
                "Chú ý răng trên chạm nhẹ môi dưới ở cuối từ 'have' (/v/) và bật /k/ ở cuối 'book'.",
              focusPhonemes: ["/v/", "/k/"],
            },
          ],
        },
      ],
    },
    {
      id: "unit-5",
      title: "Chặng 5: Gia đình & Hành động",
      descriptionVi: "Gọi tên người thân trong nhà và nói những việc em làm được.",
      color: "rose",
      emoji: "🏠",
      lessons: [
        {
          id: "lesson-5-1",
          title: "Gia đình của em",
          subtitleVi: "Mẹ, bố, em bé và câu giới thiệu người thân",
          track: "vocab_sentence",
          emoji: "👨‍👩‍👧",
          cards: [
            {
              id: "card-mom",
              type: "word",
              text: "mom",
              meaningVi: "mẹ",
              ipa: "/mɑːm/",
              phonicsBreakdown: "m - o - m",
              imageUrl: "/illustrations/mom.svg",
              pronunciationTipVi:
                "Mím hai môi để đóng lại ở âm /m/ cuối cùng, đọc rõ 'măm / mom'.",
              focusPhonemes: ["/m/"],
              exampleEn: "I love my mom.",
              exampleVi: "Con yêu mẹ của con.",
            },
            {
              id: "card-dad",
              type: "word",
              text: "dad",
              meaningVi: "bố / ba",
              ipa: "/dæd/",
              phonicsBreakdown: "d - a - d",
              imageUrl: "/illustrations/dad.svg",
              pronunciationTipVi:
                "Mở rộng miệng ở âm /æ/ giữa từ và khép nhẹ đầu lưỡi cho âm /d/ cuối từ.",
              focusPhonemes: ["/d/", "/æ/"],
              exampleEn: "My dad is tall.",
              exampleVi: "Bố của mình rất cao.",
            },
            {
              id: "card-baby",
              type: "word",
              text: "baby",
              meaningVi: "em bé",
              ipa: "/ˈbeɪ.bi/",
              phonicsBreakdown: "ba - by",
              imageUrl: "/illustrations/baby.svg",
              pronunciationTipVi:
                "Nhấn vần đầu 'BÂY', vần sau đọc nhẹ 'bi' ('BÂY-bi').",
              focusPhonemes: ["/b/"],
              exampleEn: "The baby is happy.",
              exampleVi: "Em bé đang rất vui.",
            },
            {
              id: "card-this-is-mom",
              type: "sentence",
              text: "This is my mom.",
              meaningVi: "Đây là mẹ của mình.",
              ipa: "/ðɪs ɪz maɪ mɑːm/",
              phonicsBreakdown: "This | is | my | mom.",
              imageUrl: "/illustrations/mom.svg",
              pronunciationTipVi:
                "Đầu lưỡi chạm nhẹ răng cửa ở chữ 'This', đọc nhịp nhàng 'Đít iz mai mom'.",
              focusPhonemes: ["/ð/", "/s/", "/m/"],
            },
          ],
        },
        {
          id: "lesson-5-2",
          title: "Hành động hằng ngày",
          subtitleVi: "Chạy, nhảy, đọc sách và câu I can...",
          track: "vocab_sentence",
          emoji: "🏃",
          cards: [
            {
              id: "card-run",
              type: "word",
              text: "run",
              meaningVi: "chạy",
              ipa: "/rʌn/",
              phonicsBreakdown: "r - u - n",
              imageUrl: "/illustrations/run.svg",
              pronunciationTipVi:
                "Chu nhẹ môi cho âm /r/ (không rung lưỡi), đọc 'răn' và đóng âm /n/ cuối.",
              focusPhonemes: ["/r/", "/n/"],
              exampleEn: "I can run fast.",
              exampleVi: "Mình có thể chạy nhanh.",
            },
            {
              id: "card-jump",
              type: "word",
              text: "jump",
              meaningVi: "nhảy",
              ipa: "/dʒʌmp/",
              phonicsBreakdown: "j - u - mp",
              imageUrl: "/illustrations/jump.svg",
              pronunciationTipVi:
                "Bật gọn âm đầu 'ch-ăm' rồi mím môi bật nhẹ /mp/ ở cuối từ.",
              focusPhonemes: ["/dʒ/", "/m/", "/p/"],
              exampleEn: "I can jump high.",
              exampleVi: "Mình có thể nhảy cao.",
            },
            {
              id: "card-read",
              type: "word",
              text: "read",
              meaningVi: "đọc sách",
              ipa: "/riːd/",
              phonicsBreakdown: "r - ea - d",
              imageUrl: "/illustrations/read.svg",
              pronunciationTipVi:
                "Chu môi đọc 'ri-đ', kéo nhẹ âm 'ii' và giữ âm /d/ nhẹ ở cuối từ.",
              focusPhonemes: ["/r/", "/iː/", "/d/"],
              exampleEn: "I read a book.",
              exampleVi: "Mình đọc một quyển sách.",
            },
            {
              id: "card-i-can-read",
              type: "sentence",
              text: "I can read.",
              meaningVi: "Mình có thể đọc.",
              ipa: "/aɪ kæn riːd/",
              phonicsBreakdown: "I | can | read.",
              imageUrl: "/illustrations/read.svg",
              pronunciationTipVi:
                "Đọc rõ 'Ai ken ri-đ', giữ âm /d/ nhẹ khi kết thúc câu.",
              focusPhonemes: ["/k/", "/r/", "/d/"],
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
