// App.tsx - Entry point setup cho Expo Router
//
// Với expo-router ("main": "expo-router/entry"), file này KHÔNG được
// dùng làm root component tự động.
// → Đã chuyển setTokenStorage vào app/_layout.tsx (xem file đó).
//
// File này có thể để trống hoặc giữ lại như dưới đây nếu
// bạn muốn dùng App.tsx làm entry thủ công.

export { default } from 'expo-router/entry';
