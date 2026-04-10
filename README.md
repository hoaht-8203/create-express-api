# create-express-api

CLI tool để khởi tạo nhanh một project Express.js.

## Cài đặt (Local)

1. Clone repository về máy:

   ```bash
   git clone git@github.com:hoaht-8203/create-express-api.git
   ```

2. Di chuyển vào thư mục project và cài đặt các thư viện cần thiết, sau đó chạy `npm link` để đăng ký command global:

   ```bash
   cd create-express-api
   npm install
   npm link
   ```

## Cách sử dụng

Sau khi đã link thành công, bạn có thể sử dụng công cụ nảy ở bất kỳ đâu trên máy tính bằng cách mở terminal và gõ:

```bash
create-express-api
```

Hoặc nếu bạn muốn chỉ định lưu tên project ngay từ đầu:

```bash
create-express-api <project-name>
```

Tiếp theo, CLI sẽ xuất hiện một số câu hỏi thiết lập (prompts) để tùy chỉnh project của bạn:

- **Tên project mới là gì?**
- **Port mặc định?** (mặc định: 3000)
- **Tên database?**
- **DATABASE_URL?** (bằng PostgreSQL)
- **ACCESS_SECRET và REFRESH_SECRET?** (để trống sẽ tự sinh chuỗi an toàn)
- **THỜI GIAN EXPIRES của Token?**
- **Cài dependencies luôn không?** (tự chạy `npm install`)
- **Khởi tạo git luôn không?** (tự chạy `git init`)

Xong các bước trên, template sẽ được tự động copy và cấu hình thay thế bằng các thông tin bạn đã nhập.

### Khởi chạy dự án vừa tạo

Sau khi command hoàn tất, bạn có thể start server bằng cách:

```bash
cd <project-name>
npm run dev
```
