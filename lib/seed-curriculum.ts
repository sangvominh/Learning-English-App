import type { CurriculumData, LearningCard, Lesson, Unit } from "./types";

export const SEED_CURRICULUM: CurriculumData = {
  version: 1,
  updatedAt: "2026-11-25T00:00:00.000Z",
  units: [
    {
      id: "unit-1",
      title: "Chặng 1: Âm S - A - T & Chào hỏi",
      descriptionVi: "Làm quen 3 âm đầu tiên để tự ghép thành chữ, kèm từ vựng & câu chào.",
      color: "emerald",
      emoji: "🌱",
      lessons: [
        {
          id: "lesson-1-1",
          title: "Âm S, A, T & ghép vần SAT",
          subtitleVi: "Nghe âm bật rõ, ghép vần đầu tiên",
          track: "phonics",
          emoji: "🔤",
          cards: [
            {
              id: "card-s",
              type: "phonics",
              text: "s",
              spokenText: "s... sun",
              meaningVi: "Âm /s/ — như tiếng rắn xì hơi nhẹ",
              ipa: "/s/",
              phonicsBreakdown: "s - s - sun",
              imageUrl: "/illustrations/sun.svg",
              pronunciationTipVi:
                "Khép nhẹ hai hàm răng, đẩy luồng hơi nhẹ ra ngoài thành tiếng 'xì' mảnh (không đọc thành 'ét-sì').",
              focusPhonemes: ["/s/"],
            },
            {
              id: "card-a",
              type: "phonics",
              text: "a",
              spokenText: "a... ant",
              meaningVi: "Âm /æ/ — mở miệng rộng giữa 'a' và 'e'",
              ipa: "/æ/",
              phonicsBreakdown: "a - a - ant",
              imageUrl: "/illustrations/ant.svg",
              pronunciationTipVi:
                "Mở rộng miệng theo chiều ngang như sắp cắn quả táo, đọc dứt khoát giữa âm 'a' và 'e'.",
              focusPhonemes: ["/æ/"],
            },
            {
              id: "card-t",
              type: "phonics",
              text: "t",
              spokenText: "t... tiger",
              meaningVi: "Âm /t/ — bật hơi nhẹ đầu lưỡi",
              ipa: "/t/",
              phonicsBreakdown: "t - t - tiger",
              imageUrl: "/illustrations/tiger.svg",
              pronunciationTipVi:
                "Đặt đầu lưỡi chạm nhẹ mặt trong răng trên rồi bật hơi ra 't-h', đừng thêm âm 'ờ' phía sau.",
              focusPhonemes: ["/t/"],
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
            },
          ],
        },
        {
          id: "lesson-1-2",
          title: "Mặt trời, Quả táo & Chào bạn",
          subtitleVi: "Từ vựng quen thuộc và câu chào vui vẻ",
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
                "Bật nhẹ chữ 'cờ' trong cổ họng + âm /æ/ mở rộng + nhớ bật âm /t/ ở cuối nhé!",
              focusPhonemes: ["/k/", "/æ/", "/t/"],
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
      descriptionVi: "Thêm 3 âm mới để ghép chữ nhanh hơn và gọi tên các bạn động vật.",
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
              phonicsBreakdown: "p - p - pig",
              imageUrl: "/illustrations/pig.svg",
              pronunciationTipVi:
                "Mím chặt hai môi rồi bật mạnh hơi ra (giơ tay trước miệng sẽ thấy hơi thổi vào tay, khác với chữ 'pờ' tiếng Việt).",
              focusPhonemes: ["/p/"],
            },
            {
              id: "card-i",
              type: "phonics",
              text: "i",
              spokenText: "i... igloo",
              meaningVi: "Âm /ɪ/ — đọc gọn giữa 'i' và 'ê'",
              ipa: "/ɪ/",
              phonicsBreakdown: "i - i - igloo",
              imageUrl: "/illustrations/igloo.svg",
              pronunciationTipVi:
                "Thả lỏng miệng, đọc ngắn gọn âm 'i' dứt khoát (không kéo dài như 'ii').",
              focusPhonemes: ["/ɪ/"],
            },
            {
              id: "card-n",
              type: "phonics",
              text: "n",
              spokenText: "n... nest",
              meaningVi: "Âm /n/ — đầu lưỡi chạm nóc miệng",
              ipa: "/n/",
              phonicsBreakdown: "n - n - nest",
              imageUrl: "/illustrations/nest.svg",
              pronunciationTipVi:
                "Chạm đầu lưỡi lên phần lợi phía trên răng và ngân nhẹ qua mũi 'nnn'.",
              focusPhonemes: ["/n/"],
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
            },
          ],
        },
        {
          id: "lesson-2-2",
          title: "Bạn thú cưng đáng yêu",
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
      id: "unit-3",
      title: "Chặng 3: Màu sắc & Đồ dùng lớp 3",
      descriptionVi: "Từ vựng ngay quanh bàn học của bé, nói câu mô tả màu sắc và đồ vật.",
      color: "amber",
      emoji: "🎒",
      lessons: [
        {
          id: "lesson-3-1",
          title: "Màu sắc rực rỡ",
          subtitleVi: "Nhận biết màu đỏ, xanh và ngôi sao",
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
            },
            {
              id: "card-star",
              type: "word",
              text: "star",
              meaningVi: "ngôi sao",
              ipa: "/stɑːr/",
              phonicsBreakdown: "st - ar",
              imageUrl: "/illustrations/star.svg",
              pronunciationTipVi:
                "Xì nhẹ /s/ rồi vào ngay 'ta-r', uốn nhẹ đầu lưỡi ở cuối từ.",
              focusPhonemes: ["/s/", "/t/", "/r/"],
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
          title: "Đồ dùng học tập của em",
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
                "Âm 'u' ngắn gọn và đừng quên bật tiếng /k/ nhỏ ở cuối từ 'book' nhé!",
              focusPhonemes: ["/b/", "/k/"],
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
