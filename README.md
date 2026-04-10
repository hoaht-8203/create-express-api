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

Sau khi command hoàn tất, bạn cần di chuyển vào thư mục dự án, tiến hành cài đặt (nếu chưa cài tự động ở bước trước) và khởi tạo database:

```bash
cd <project-name>

# Khởi chạy database bằng Docker (trong trường hợp bạn chưa có DB thật) (Có thể bỏ qua nếu có rồi)
docker compose up -d

# Cài đặt dependencies (nếu chưa chọn tự động cài đặt)
npm install

# Sinh Prisma Client
npx prisma generate

# Chạy migrate để tạo database, các table... theo cấu trúc mặc định
npx prisma migrate dev

# Chạy seed data
npx prisma db seed

# Khởi chạy server ở chế độ dev
npm run dev
```

### Làm việc với Database

Quy trình làm việc mỗi khi bạn có sự thay đổi về cấu trúc database (thêm bảng, sửa cột, ...):

1. Thực hiện thay đổi trong file `prisma/schema.prisma`.
2. Chạy lệnh migrate để tạo và áp dụng migration vào database:

   ```bash
   npx prisma migrate dev
   ```

   (Lệnh này cũng tự động cập nhật lại Prisma Client).

**Khởi tạo dữ liệu mẫu (Seed Data):**
Để đưa các dữ liệu seed ban đầu vào database, hãy chạy lệnh sau:

```bash
npx prisma db seed
```

_(Lệnh này gọi thực thi nội dung `prisma.seed` đã định nghĩa trong `package.json` của project mới)._

**Các lệnh prisma tiện ích khác (cấu hình sẵn trong `package.json`):**

- `npm run prisma:generate`: Tương đương `npx prisma generate`.
- `npm run prisma:migrate`: Thực hiện apply các file migration trên production (tương đương `npx prisma migrate deploy`).
