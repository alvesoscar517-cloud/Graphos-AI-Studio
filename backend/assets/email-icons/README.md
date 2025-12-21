# Email Icons (CID Attachments)

Thư mục này chứa các icon được sử dụng trong email templates.

## Cách hoạt động

Thay vì sử dụng URL từ GitHub Pages (có thể bị Google chặn), các icon này được đính kèm trực tiếp vào email sử dụng phương pháp CID (Content-ID).

### Ưu điểm của CID:
- ✅ Hiển thị tốt trên hầu hết các email client
- ✅ Không bị chặn bởi các bộ lọc spam
- ✅ Không phụ thuộc vào server bên ngoài
- ✅ Tải nhanh hơn vì ảnh đã được đính kèm

### Cách sử dụng trong code:

```javascript
const { cidIcon, cidLogo, cidHeaderIcon } = require('../utils/emailCid');

// Tạo icon
const iconHtml = cidIcon('check', 'black', 20);
// Output: <img src="cid:circle_check_black" .../>

// Tạo logo
const logoHtml = cidLogo(36);
// Output: <img src="cid:logo_content" .../>

// Tạo header icon với background tròn
const headerHtml = cidHeaderIcon('mail', 'black', 32);
```

### Danh sách icon có sẵn:
- `check` (circle-check)
- `message` (message-square)
- `mail`
- `creditCard` (credit-card)
- `file` (file-text)
- `database`
- `download`
- `barChart` (chart-bar)
- `info`
- `user`
- `calendar`
- `alertCircle` (circle-alert)
- `logo` (content.png)

Mỗi icon có 2 phiên bản: `black` và `white`.

## Thêm icon mới

1. Thêm file PNG vào thư mục này với format: `{name}-{color}.png`
2. Cập nhật `ICON_FILES` trong `src/utils/emailCid.js`
