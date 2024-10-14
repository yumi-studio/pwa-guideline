# Hướng dẫn thiết lập 1 trang web PWA

## A. PWA là gì
Progressive Web Application (PWA) là một ứng dụng web có thể hoạt động như một ứng dụng di động. Nó cung cấp trải nghiệm người dùng tốt hơn bằng cách hỗ trợ các tính năng như hoạt động offline, tải nhanh và khả năng thêm vào màn hình chính (add to home screen).

## B. Cách thiết lập PWA

### 1. Điều kiện tiên quyết
#### a. Khả năng hỗ trợ của trình duyệt
- Các trình duyệt hiện đại hầu hết đều hỗ trợ khả năng cài đặt ứng dụng PWA, tuy nhiên vẫn còn khá hạn chế trên một số trình duyệt và thiết bị của nhà Apple (iOS Chrome, iOS Safari)
- Do phụ thuộc vào trình duyệt nên bản chất PWA là một trang web hoạt động và hiển thị như một ứng dụng nhưng không hoàn hảo như một ứng dụng được cài đặt từ các hệ thống app store (Play Store, Apple Store, etc)
#### b. Trang web được bảo mật
- Tức là trang web của bạn phải được truy cập qua giao thức được bảo mật
  - VD: https://example.com => OK.
  - VD: http://example.com => Not OK.
- Đối với developer, http://localhost hoặc http://127.0.0.1/ được nghiễm nhiên coi là được truy cập qua giao thức an toàn, vậy nên hãy tận dụng điều này

### 2. Thiết lập manifest.json
File `manifest.json` cung cấp thông tin về ứng dụng như tên, icon, màu chủ đề (theme color), và cách hoạt động khi thêm vào màn hình chính.
Có thể sử dụng công cụ sau để tạo file phù hợp: [PWA Manifest Generator](https://progressier.com/pwa-manifest-generator)

Cấu trúc một file căn bản
```json
{
  "name": "My PWA",
  "short_name": "PWA",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#317EFB",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```
- `name`: Tên đầy đủ của ứng dụng
- `short_name`: Tên rút gọn của ứng dụng
- `start_url`: URL chuyển hướng tới khi người dùng mở ứng dụng từ màn hình chính của thiết bị (desktop pwa app, mobile pwa app)
- `display`: Chế độ hiển thị của ứng dụng
  - standalone: Hiển thị như một ứng dụng di động, loại bỏ các thành phần chính của trình duyệt (thanh search, nút back/forward, etc)
  - fullscreen: Giống như `standalone` nhưng được loại bỏ hết các thành phần của trình duyệt và trông như một ứng dụng toàn màn hình
  - minimal_ui: Hiển thị như một trình duyệt nhưng được tối giản hóa đi các thành phần UI của trình duyệt
  - browser: Hiển thị như một trang web truyền thống và phụ thuộc vào hiển thị từ trình duyệt mà app được cài đặt
- `background_color`: Màu nền của màn hình loading / splash
- `theme_color`: Màu chủ đề của trình duyệt khi sử dụng app
- `icons`: Thiết lập icon của app, khuyến nghị tránh sử dụng ảnh có nền trong suốt, kích thước và nội dung chính của logo cần được thiết kế phù hợp. Có thể sử dụng công cụ [Image Generator](https://www.pwabuilder.com/imageGenerator) để tạo sinh icon phù hợp
- `orientation`: Thiết lập chế độ xoay của app
  - any: Tự động xoay theo chiều của thiết bị
  - portrait: Xoay dọc
  - landscape: Xoay ngang

### 3. Khai báo manifest vào web document
Để trình duyệt nhận diện một trang web có thể cài đặt PWA, cần thêm thẻ link vào head của web document

Cú pháp
```html
<link rel="manifes" href="duong_dan_url_toi_file_manifes"/>
```
Ví dụ đường dẫn url tơi file manifest.json là `https://example.com/abc/xyz/manifest.json`
```html
...
<head>
  ...
  <link rel="manifest" href="https://example.com/abc/xyz/manifest.json">
  ...
</head>
...
```

Sau khi truy cập trang web bằng trình duyệt desktop, nếu thấy trên thanh địa chỉ icon như ảnh sau thì tức là trình duyệt đã nhận diện được website có hỗ trợ PWA

- Trình duyệt Edge

![image](https://github.com/user-attachments/assets/26fe90ad-c45e-47e2-9c20-1a7624959c01)

- Trình duyệt chrome

![image](https://github.com/user-attachments/assets/58467537-44de-47b2-927f-6c0b908ae73d)

Có thể kiểm tra tính khả dụng PWA qua công cụ developer tools (F12), mở đến tab Application > Manifest. Bạn sẽ thấy thông tin PWA hiển thị nếu quá trình thiết lập đúng.

- Trên trình duyệt mobile, thể thông qua hành động "Add to homescreen" hay "Thêm vào màn hình chính" để thực hiện cài đặt pwa app. Tuy nhiên cách này khá thủ công nên ta đến với bước tiếp theo.

### 4. Viết script bật popup thông báo cài đặt ứng dụng
- Hầu hết trong các trường hợp, nếu manifest.json đã được trình duyệt đọc thì một popup đặc biệt theo trình duyệt sẽ tự bật lên và gợi ý người dùng cài đặt PWA app vào thiết bị. Tuy nhiên nếu không được bật tự động, developer cần tích hợp vào website giúp người dùng cài đặt được app.

```html
<body>
    <button id="install_pwa">Cài đặt App</button>
    <script type="module" defer>
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            deferredPrompt = e;
        });
        document.querySelector('#install_pwa').addEventListener('click', (ev) => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(choiceResult => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted PWA ');
                    } else {
                        console.log('User dismissed PWA');
                    }
                    deferredPrompt = null;
                })
            }
        });
    </script>
</body>
```

Giải thích
- Khai báo biến `deferredPrompt` sử dụng để chứa đối tượng event bắt được khi window kích hoạt event `beforeinstallprompt`. Sau đó gán sự kiện click vào nút `Cài đặt App`, khi người dùng click vào nút, gọi tới hàm `promt()` của `deferredPrompt` để kích hoạt popup cài đặt app của trình duyệt
- `beforeinstallprompt` là một event nằm trong chu trình cài đặt ứng dụng PWA, event này được kích hoạt khi trang web thỏa mãn để cài đặt PWA app và người dùng chưa từng cài đặt bao giờ
- `beforeinstallprompt` không phải là một event được hỗ trợ trên toàn bộ các trình duyệt và nền tảng thiết bị
  - Trình duyệt có hỗ trợ
    - Google Chrome: Hỗ trợ trên cả desktop và mobile (Android).
    - Microsoft Edge: Hỗ trợ trên cả desktop và mobile.
    - Samsung Internet: Hỗ trợ trên các thiết bị Samsung chạy Android.
    - Opera: Hỗ trợ tốt trên các phiên bản Chromium của Opera.
  - Trình duyệt không hỗ trợ hoặc khá hạn chế
    - Safari (iOS và macOS): Hiện tại không hỗ trợ sự kiện `beforeinstallprompt`. Trên iOS, việc cài đặt PWA phải được thực hiện thông qua chức năng "Add to Home Screen" mà không có sự can thiệp của developer.
    - Firefox: Mặc dù hỗ trợ PWA nhưng không cung cấp sự kiện `beforeinstallprompt` cho đến nay. Người dùng vẫn có thể cài đặt PWA thông qua giao diện của trình duyệt.
  - Thiết bị có hỗ trợ
    - Android: Sự kiện `beforeinstallprompt` được hỗ trợ đầy đủ trên các trình duyệt như Chrome và các trình duyệt dựa trên Chromium. Android cung cấp trải nghiệm tốt nhất cho việc cài đặt và quản lý PWA thông qua sự kiện này.
    - iOS: Apple không hỗ trợ sự kiện này, do đó không có cách nào để hiển thị một lời nhắc cài đặt PWA được tùy chỉnh trên các thiết bị iOS. Tuy nhiên, người dùng vẫn có thể cài đặt PWA thủ công qua nút "Add to Home Screen" từ trình duyệt Safari.
    - Desktop (Windows, macOS, Linux): Sự hỗ trợ của các trình duyệt desktop phụ thuộc vào trình duyệt và hệ điều hành. Chrome và Edge trên desktop hỗ trợ tốt, trong khi Safari trên macOS không hỗ trợ.
    
Để hướng dẫn người dùng iOS cài đặt PWA app, developer nên tích hợp vào web các hướng dẫn cho người dùng biết cách để cài đặt PWA app trên thiết bị của họ

### 5. Service Worker
**5.1. Service Worker là gì?**

Service Worker (SW) là một tập mã javascript được chạy dưới nền của trình duyệt và tách biệt với web application, và không cần mạng vẫn có thể hoạt động được.

**5.2. Các tính năng chính của SW:**
- Caching và quản lý tài nguyên: Service Worker có thể lưu trữ các tài nguyên (HTML, CSS, JavaScript, hình ảnh, v.v.) vào bộ nhớ cache. Khi người dùng truy cập lại, Service Worker có thể phục vụ các tài nguyên đó từ bộ nhớ cache thay vì tải lại từ mạng, giúp tăng tốc độ tải và giảm băng thông.
- Hỗ trợ hoạt động ngoại tuyến: Bằng cách lưu trữ các tài nguyên trong bộ nhớ cache, Service Worker cho phép trang web hoặc ứng dụng tiếp tục hoạt động ngay cả khi người dùng bị mất kết nối internet.
- Push Notifications: Service Worker có thể nhận thông báo đẩy từ máy chủ và hiển thị cho người dùng ngay cả khi ứng dụng không mở.
- Background Sync: Cho phép ứng dụng hoàn thành các tác vụ (như đồng bộ dữ liệu) ngay cả khi người dùng không mở trang web, giúp cải thiện trải nghiệm người dùng trong các ứng dụng có chức năng gửi dữ liệu.

**5.2. Vòng đời của một Service Worker**
1. Register: Đầu tiên, Service Worker được đăng ký bằng cách gọi hàm `navigator.serviceWorker.register()` từ tệp JavaScript của trang web.
2. Install: Khi Service Worker được tải lần đầu, nó sẽ vào trạng thái "Installing". Trong bước này, bạn có thể sử dụng sự kiện `install` để thiết lập bộ nhớ cache ban đầu.
3. Activate: Sau khi cài đặt, Service Worker chuyển sang trạng thái "activating". Trong bước này, bạn có thể xóa bộ nhớ cache cũ và chuẩn bị cho Service Worker hoạt động.
4. Fetch: Sau khi được kích hoạt, Service Worker có thể chặn các yêu cầu mạng và phục vụ tài nguyên từ bộ nhớ cache, hoặc tải tài nguyên mới từ mạng.

**5.3. Đăng ký Service Worker**
> Lưu ý: Để đăng ký cho một SW chạy thì trang web phải được truy cập qua giao thức được bảo mật (https hoặc localhost). Và không thể chạy service worker trong chế độ riêng tư.
> Lưu ý: Do phụ thuộc vào trình duyệt nên vẫn sẽ có khả năng trình duyệt không hỗ trợ hoặc chỉ khả năng hỗ trợ khá hạn chế ở những phiên bản cập nhật mới

```html
...
<body>
    ...
    <script type="module" defer>
        ...
        if ('serviceWorker' in navigator) {
            console.log('Trình duyệt có hỗ trợ Service Worker');
            window.addEventListener('load', async (ev) => {
                try {
                    const registration = await navigator.serviceWorker.register('/my-pwa-sw.js');
                    console.log('Service Worker đã được đăng ký với phạm vi URL: ', registration.scope);
                    registration.addEventListener('updatefound', () => {
                        console.log('Service Worker có phiên bản mới');
                    })
                } catch (err) {
                    console.log('Service Worker đăng ký thất bại', err);
                }
            });
        } else {
            console.log('Trình duyệt không hỗ trợ Service Worker hoặc đang ở chế độ riêng tư');
        }
    </script>
    ...
</body>
```
Kết quả kiểm tra console log và mục `Application > Service Worker`

![image](https://github.com/user-attachments/assets/da1f000c-082e-41ab-954c-e00f67c6c705)
![image](https://github.com/user-attachments/assets/3895aca1-af37-4b7a-af39-7e05fc9412e2)

**5.4. Service Worker Workbox**

Mặc dù các trình duyệt web có hỗ trợ SW đồng thời cũng cung cấp các công cụ cần thiết để làm việc với SW, tuy nhiên để phát triển và tích hợp lại từ đầu sẽ tốn thời gian để tìm hiểu, đôi khi khá phức tạp.
Để giải quyết vấn đề này, Google cung cấp bộ công cụ và thư viện có sẵn để làm việc với SW hiệu quả hơn.
Xem thêm tại [đây](https://developer.chrome.com/docs/workbox)

Đăng ký SW (Hủy registration đã đăng ký trong mục `Application > Service Worker`
```html
...
<body>
    ...
    <script type="module" defer>
        import {Workbox} from 'https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-window.prod.mjs';
        ...
        if ('serviceWorker' in navigator) {
            console.log('Trình duyệt có hỗ trợ Service Worker');
            const wb = new Workbox('/my-pwa-sw.js');
            wb.register();
        } else {
            console.log('Trình duyệt không hỗ trợ Service Worker hoặc đang ở chế độ riêng tư');
        }
    </script>
    ...
</body>
```
Kết quả kiểm tra console log và mục `Application > Service Worker`

![image](https://github.com/user-attachments/assets/59c4f1ec-39b2-4601-a38c-d62990a66d5a)
![image](https://github.com/user-attachments/assets/c8490562-bf62-4399-b765-43aaaf177f14)

Cập nhật file my-pwa-sw.js
```js
/*
Import bộ thư viện workbox, sau đó có thể sử dụng bộ công cụ thông qua biến `workbox`
VD: workbox.precaching.anyPrecachingFunction()
    workbox.routing.anyRoutingFunction()
*/
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

/*
Có thể khai báo trích xuất class để sử dụng giống các VD của google
VD: const {registerRoute} = workbox.routing;
    const {CacheFirst} = workbox.strategies;
    const {CacheableResponse} = workbox.cacheableResponse;
*/
const { registerRoute } = workbox.routing;
const { CacheFirst } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;

console.log(registerRoute);
console.log(CacheFirst);
console.log(ExpirationPlugin);
```

Gỡ cài đặt SW và thử lại, Kết quả console log hiển thị như sau tức là thư viện Workbox đã có thể sử dụng

![image](https://github.com/user-attachments/assets/bd9a66fe-0980-4402-8132-e7c2070e7c33)

**5.5. Sau khi kết thúc màn khởi động =)) Dưới đây là ví dụ cụ thể 1 file service worker chi tiết**

```js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');
const version = 1;
workbox.setConfig({
    skipWaiting: false,
    clientsClaim: true,
    debug: 1
});
/**
 * Tải toàn bộ package của Workbox
 */
const { BackgroundSyncPlugin } = workbox.backgroundSync;
const { } = workbox.broadcastUpdate;
const { CacheableResponsePlugin } = workbox.cacheableResponse;
const { setCacheNameDetails, cacheNames } = workbox.core;
const { ExpirationPlugin } = workbox.expiration;
const { } = workbox.navigationPreload;
const { precacheAndRoute } = workbox.precaching;
const { } = workbox.rangeRequests;
const { } = workbox.recipes;
const { registerRoute, setCatchHandler } = workbox.routing;
const {
    CacheFirst,
    StaleWhileRevalidate,
    NetworkFirst,
    NetworkOnly
} = workbox.strategies;
const { } = workbox.streams;

/**
 * Tùy chỉnh tên của cache trong bộ nhớ
 */
setCacheNameDetails({
    prefix: "my-cache",
    precache: "my-precache",
    suffix: `v${version}`,
});

/**
 * Lưu trữ cache file manifest.json và trang "fallback-page.html" ngay khi SW hoạt động
 */
precacheAndRoute([
    { url: '/fallback-page.html', revision: null },
    { url: '/manifest.json', revision: null }
]);

/**
 * Khi cache không có và kết nối mạng không có, sử dụng cache của trang "fallback-page.html"
 */
setCatchHandler(({ event }) => {
    switch (event.request.destination) {
        case "document":
            return caches.match("/fallback-page.html");
            break;
        default:
            return Response.error();
    }
});

/**
 * Dọn dẹp cache cũ khi phiên bản SW mới được cài đặt
 */
let currentCacheNames = Object.assign(
    { precacheTemp: cacheNames.precache + "-temp" },
    cacheNames
);
self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            let validCacheSet = new Set(Object.values(currentCacheNames));
            return Promise.all(
                cacheNames
                    .filter(function (cacheName) {
                        return !validCacheSet.has(cacheName);
                    })
                    .map(function (cacheName) {
                        //console.log("deleting cache", cacheName);
                        return caches.delete(cacheName);
                    })
            );
        })
    );
});

/**
 * installing service worker
 */
self.addEventListener(
    "install",
    function (event) {
        event.waitUntil(
            // eslint-disable-next-line no-restricted-globals
            self.skipWaiting(),
        );
    }
);

/**
 * registerRoute: Đọc thêm https://developer.chrome.com/docs/workbox/modules/workbox-routing#method-registerRoute
 * CacheFirst: Đọc thêm https://developer.chrome.com/docs/workbox/modules/workbox-strategies#cache_first_cache_falling_back_to_network
 * 
 * Đăng ký đường dẫn thỏa mãn điều kiện bắt đầu bằng demo và search params có "notification" và giá trị là true
 * VD: GET: https://example.com/demo?notification=true
 *     GET: https://example.com/demo?a=b&c=d&notification=true
 * Các đường dẫn này sẽ được áp dụng chiến lược CachFirst, tức là nếu trong cache có dữ liệu, lập tức trả về, ngược lại, thực hiện request
 * Và được lưu kết quả với cache name là "offline-demo-responses"
 */
registerRoute(
    capture = ({ url, request, sameOrigin, event }) => {
        const notificationParam = url.searchParams.get("notification");
        return (url.pathname.startsWith("/demo") && (notificationParam === "true"));
    },
    handler = new CacheFirst({
        cacheName: "offline-demo-responses",
    }),
    method = 'GET'
);

/**
 * 1. stylesheet css: Cache file css với chiến lược CacheFirst, cache name là "workbox-cache-stylesheets-v1"
 * Chiến lược CacheFirst được bổ sung thêm plugin:
 *   - Điều kiện để cache là response trả về phải có statusCode là 0 hoặc 200
 */
registerRoute(
    new RegExp("\.css$"),
    new CacheFirst({
        cacheName: `workbox-cache-stylesheets-v${version}`,
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            })
        ]
    })
);
/**
 * 2. Javascript: Cache file js với chiến lược CacheFirst, cache name là "workbox-cache-javascript-v1"
 * Chiến lược CacheFirst được bổ sung thêm plugin:
 *   - Thời gian cache hết hạn là 30 ngày
 *   - Điều kiện để cache là response trả về phải có statusCode là 0 hoặc 200
 */
registerRoute(
    new RegExp("\.js$"),
    new CacheFirst({
        cacheName: `workbox-cache-javascript-v${version}`,
        plugins: [
            new ExpirationPlugin({
                maxAgeSeconds: 30 * 24 * 60 * 60
            }),
            new CacheableResponsePlugin({
                statuses: [0, 200],
            })
        ]
    })
);
/**
 * 3. Images: Cache file ảnh với chiến lược CacheFirst, cache name là "workbox-cache-images-v1"
 * Chiến lược CacheFirst được bổ sung thêm plugin:
 *   - Thời gian cache hết hạn là 30 ngày
 *   - Điều kiện để cache là response trả về phải có statusCode là 0 hoặc 200
 */
registerRoute(
    new RegExp("\.(png|svg|jpg|jpeg|ico|gif)$"),
    new CacheFirst({
        cacheName: `workbox-cache-images-v${version}`,
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 30 * 24 * 60 * 60
            })
        ]
    })
);
/**
 * 4. Các trang kết thúc với đuôi .html: Cache trang .html với chiến lược StaleWhileRevalidate, cache name là "workbox-cache-html-v1"
 * 
 * Chiến lược StaleWhileRevalidate: https://developer.chrome.com/docs/workbox/modules/workbox-strategies#type-StaleWhileRevalidate
 * Hiểu ngắn gọn là thực hiện kiểm tra cache và request tới trang cùng một lúc, nếu cache có thì trả ra kết quả cache, nếu không có cache thì lưu
 * cache khi request mới và trả ra nội dung mới
 */
registerRoute(
    new RegExp("\.(html)$"),
    new StaleWhileRevalidate({
        cacheName: `workbox-cache-html-v${version}`
    })
);

/**
 * 5. Các link bên thứ 3, cũng áp dụng chiến thuật CacheFirst và plugin kiểm tra response code là 0 hoặc 200
 */
registerRoute(
    ({ url }) => url.origin === "https://fonts.googleapis.com" ||
        url.origin === "https://cdnjs.cloudflare.com" ||
        url.origin === "https://cdn.loom.com" ||
        url.origin === "https://storage.googleapis.com",
    new CacheFirst({
        cacheName: "workbox-cross-origin-cache",
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            })
        ]
    })
);

/**
 * 6. Fonts: Cache font với chiến lược CacheFirst, cache name là "workbox-cache-fonts-v1"
 * Chiến lược CacheFirst được bổ sung thêm plugin:
 *   - Thời gian cache hết hạn là 30 ngày
 *   - Tối đa chỉ được cache 10 url, quá 10 url thì sẽ xóa url có tần suất truy cập thấp nhất
 *   - Điều kiện để cache là response trả về phải có statusCode là 0 hoặc 200
 */
registerRoute(
    /\.(?:woff|woff2|ttf|otf)$/,
    new CacheFirst({
        cacheName: `workbox-cache-fonts-v${version}`,
        plugins: [
            new ExpirationPlugin({
                maxAgeSeconds: 30 * 24 * 60 * 60,
                maxEntries: 10
            }),
            new CacheableResponsePlugin({
                statuses: [0, 200],
            })
        ]
    })
);
```

Gỡ cài đặt SW và tải lại trang

![image](https://github.com/user-attachments/assets/937c5019-86ba-4ea2-a372-8e6878d5ab1b)
![image](https://github.com/user-attachments/assets/da58ce9d-eee3-474f-b844-da78a7c59f8e)
