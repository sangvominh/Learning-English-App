# SunnyBee English — PWA Học Tiếng Anh Lớp 3

Ứng dụng web PWA tối ưu cho điện thoại Android giúp bé lớp 3 mới bắt đầu học tiếng Anh từ số 0: **mở là học ngay, không cần tài khoản**.

## Tính năng chính
- **Song song Phonics + Từ vựng & Câu ngắn**: 3 chặng mẫu (6 bài học, 24 thẻ, 19 hình minh họa SVG) dễ mở rộng.
- **Âm thanh mẫu chuẩn & chậm**: Hỗ trợ tạo giọng đọc bằng Gemini TTS trong `/admin`, tải file `.mp3`/`.wav` riêng, hoặc tự đọc bằng giọng trình duyệt khi chưa gắn key.
- **Chấm & sửa phát âm bằng AI**: Thu âm giọng bé kèm sóng âm trực tiếp, nghe so sánh giọng mẫu – giọng con, và nhận hướng dẫn sửa âm dễ hiểu bằng tiếng Việt qua Gemini Audio API.
- **4 Mini-game ôn bài**: Nghe – Chọn hình, Xếp chữ/Ghép câu, Lật thẻ ghép cặp, Nhìn hình nói to.
- **Ôn tập khoa học SRS (FSRS)**: Thuật toán `ts-fsrs` tự động tính lịch ôn dựa trên kết quả chơi và phát âm, lưu cục bộ bằng IndexedDB trên máy bé.
- **Trang quản trị phụ huynh (`/admin`)**: Khóa bằng mã PIN (mặc định `1234`), soạn chặng/bài/thẻ học, xem nhật ký các âm bé hay sai, và xuất/nhập JSON.

## Chạy cục bộ (Local)
```bash
npm install
npm run dev
```
Mở `http://localhost:3000` (trang quản trị: `http://localhost:3000/admin`, PIN mặc định `1234`).

## Deploy lên Vercel (HTTPS cho Micro & Cài app PWA Android)
1. Kết nối repo GitHub này trên [Vercel](https://vercel.com/new) (chạy sẵn Node `24.x` và `npm run build`).
2. Thêm các biến môi trường (tùy chọn, có thể thêm bất cứ lúc nào trong **Project Settings → Environment Variables** — xem mẫu trong `.env.example`):
   - `GEMINI_API_KEY`: Bật chấm & sửa phát âm AI + tạo giọng đọc TTS trong `/admin`.
   - `ADMIN_PIN`: Đổi mã PIN vào `/admin` (mặc định `1234`).
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: Lưu nội dung & ảnh/audio lên Supabase để soạn trên máy tính là điện thoại của bé nhận bài mới ngay.
3. Nếu dùng Supabase, chạy file `supabase/schema.sql` trong **Supabase SQL Editor** để tạo bảng `curriculum_store` và bucket `learning-media`.
