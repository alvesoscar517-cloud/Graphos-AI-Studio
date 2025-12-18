# SEO Setup Guide for Graphos AI Web App

## 🔍 Search Engine Verification

### Google Search Console
1. Truy cập: https://search.google.com/search-console
2. Thêm property: `https://app.graphosai.com`
3. Chọn phương thức xác minh: **HTML tag**
4. Copy mã verification (dạng: `abc123xyz...`)
5. Thay thế `YOUR_GOOGLE_VERIFICATION_CODE` trong `index.html`:
   ```html
   <meta name="google-site-verification" content="abc123xyz..." />
   ```
6. Deploy và click "Verify" trong Google Search Console
7. Submit sitemap: `https://app.graphosai.com/sitemap.xml`

### Bing Webmaster Tools
1. Truy cập: https://www.bing.com/webmasters
2. Thêm site: `https://app.graphosai.com`
3. Chọn phương thức: **Meta tag**
4. Copy mã verification
5. Thay thế `YOUR_BING_VERIFICATION_CODE` trong `index.html`:
   ```html
   <meta name="msvalidate.01" content="your-bing-code" />
   ```
6. Deploy và verify
7. Submit sitemap

### Yandex Webmaster (Optional - cho thị trường Nga)
1. Truy cập: https://webmaster.yandex.com
2. Thêm site và lấy mã verification
3. Thay thế `YOUR_YANDEX_VERIFICATION_CODE`

---

## 🚀 Prerender Service Setup

### Option 1: Prerender.io (Recommended - Free 250 pages/month)

1. **Đăng ký**: https://prerender.io
2. **Lấy Token** từ dashboard
3. **Cấu hình Firebase Functions**:

```bash
cd web-app
npm install firebase-functions firebase-admin
```

4. **Tạo file `functions/index.js`**:
```javascript
const functions = require('firebase-functions');
const fetch = require('node-fetch');

const PRERENDER_TOKEN = 'YOUR_PRERENDER_TOKEN';
const BOT_AGENTS = [
  'googlebot', 'bingbot', 'yandex', 'baiduspider', 'facebookexternalhit',
  'twitterbot', 'rogerbot', 'linkedinbot', 'embedly', 'quora link preview',
  'showyoubot', 'outbrain', 'pinterest', 'slackbot', 'vkShare', 'W3C_Validator'
];

exports.prerender = functions.https.onRequest(async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const isBot = BOT_AGENTS.some(bot => userAgent.toLowerCase().includes(bot));
  
  if (isBot) {
    const prerenderUrl = `https://service.prerender.io/${req.protocol}://${req.hostname}${req.originalUrl}`;
    const response = await fetch(prerenderUrl, {
      headers: { 'X-Prerender-Token': PRERENDER_TOKEN }
    });
    const html = await response.text();
    res.set('Content-Type', 'text/html');
    res.send(html);
  } else {
    res.redirect(req.originalUrl);
  }
});
```

5. **Cập nhật `firebase.json`**:
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "function": "prerender"
      }
    ]
  },
  "functions": {
    "source": "functions"
  }
}
```

### Option 2: Rendertron (Self-hosted - Free)

1. **Deploy Rendertron lên Cloud Run**:
```bash
gcloud run deploy rendertron \
  --image=nickreese/rendertron \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated
```

2. **Cấu hình tương tự như Prerender.io**

### Option 3: Cloudflare Workers (Free tier available)

Xem file `cloudflare-worker-prerender.js` đã tạo sẵn.

---

## 📊 Sau khi Setup

### Kiểm tra SEO
1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema Validator**: https://validator.schema.org
3. **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
4. **PageSpeed Insights**: https://pagespeed.web.dev

### Monitor
1. Google Search Console → Performance
2. Bing Webmaster → Search Performance
3. Check indexing status sau 1-2 tuần

---

## ✅ Checklist

- [ ] Google Search Console verified
- [ ] Bing Webmaster verified
- [ ] Sitemap submitted to Google
- [ ] Sitemap submitted to Bing
- [ ] Prerender service configured (optional but recommended)
- [ ] Rich Results test passed
- [ ] Mobile-friendly test passed
- [ ] PageSpeed score > 90

---

## 🔗 Useful Links

- Google Search Console: https://search.google.com/search-console
- Bing Webmaster: https://www.bing.com/webmasters
- Prerender.io: https://prerender.io
- Schema Validator: https://validator.schema.org
- Rich Results Test: https://search.google.com/test/rich-results
