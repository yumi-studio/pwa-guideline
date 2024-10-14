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
