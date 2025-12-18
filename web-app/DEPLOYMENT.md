# Deployment Guide - Graphos AI Web App

## 🚀 Deploy lên GitHub + Firebase Hosting

### Bước 1: Tạo GitHub Repository

```bash
cd web-app
git init
git add .
git commit -m "Initial commit - Graphos AI Web App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/graphos-ai-web-app.git
git push -u origin main
```

### Bước 2: Cấu hình GitHub Secrets

Vào GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Thêm các secrets sau:

| Secret Name | Value | Lấy từ đâu |
|-------------|-------|------------|
| `VITE_FIREBASE_API_KEY` | `AIza...` | Firebase Console → Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | `your-project-id` | Firebase Console |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` | Firebase Console |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | Firebase Console |
| `VITE_FIREBASE_APP_ID` | `1:123:web:abc` | Firebase Console |
| `VITE_GOOGLE_CLIENT_ID` | `94136052128-xxx.apps.googleusercontent.com` | Google Cloud Console |
| `VITE_API_BASE_URL` | `https://your-backend.run.app` | Backend API URL |
| `FIREBASE_SERVICE_ACCOUNT` | `{...}` | Xem hướng dẫn bên dưới |

### Bước 3: Tạo Firebase Service Account

1. Vào [Firebase Console](https://console.firebase.google.com)
2. Project Settings → Service accounts
3. Click **"Generate new private key"**
4. Download file JSON
5. Copy toàn bộ nội dung file JSON
6. Paste vào GitHub Secret `FIREBASE_SERVICE_ACCOUNT`

### Bước 4: Kết nối Firebase với GitHub

```bash
firebase init hosting:github
```

Hoặc thủ công:
1. Firebase Console → Hosting → Get started
2. Kết nối với GitHub repo

### Bước 5: Deploy

Sau khi setup xong, mỗi lần push code lên `main` branch sẽ tự động deploy!

```bash
git add .
git commit -m "Update feature"
git push
```

---

## 🔧 Deploy thủ công (không dùng GitHub Actions)

```bash
# Build
npm run build

# Deploy
firebase deploy --only hosting
```

---

## 🌐 Custom Domain

1. Firebase Console → Hosting → Add custom domain
2. Thêm domain: `app.graphosai.com`
3. Cập nhật DNS records theo hướng dẫn Firebase
4. Chờ SSL certificate (tự động)

---

## ✅ Checklist trước khi Deploy

- [ ] `.env` file đã có đầy đủ biến môi trường
- [ ] Google OAuth đã cấu hình đúng redirect URIs
- [ ] Firebase project đã enable Authentication
- [ ] Backend API đã deploy và hoạt động
- [ ] Domain đã trỏ về Firebase Hosting

---

## 🔍 Troubleshooting

### Lỗi "Firebase project not found"
- Kiểm tra `VITE_FIREBASE_PROJECT_ID` đúng chưa
- Chạy `firebase use your-project-id`

### Lỗi OAuth "redirect_uri_mismatch"
- Thêm URL vào Google Cloud Console → Credentials → OAuth Client
- Authorized JavaScript origins: `https://app.graphosai.com`
- Authorized redirect URIs: `https://app.graphosai.com`

### Lỗi CORS
- Kiểm tra backend đã allow origin `https://app.graphosai.com`
