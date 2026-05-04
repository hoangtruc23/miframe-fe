import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // // 1. Lấy token từ cookie
  // const token = request.cookies.get("token")?.value;
  // // 2. Lấy đường dẫn hiện tại mà người dùng đang truy cập
  // const { pathname } = request.nextUrl;
  // // 3. Nếu người dùng vào /admin mà không có token -> Redirect về trang login
  // if (pathname.startsWith("/admin") && !token) {
  //   // Bạn có thể đính kèm ?callbackUrl để sau khi login xong chuyển hướng lại đúng trang đó
  //   const loginUrl = new URL("/", request.url);
  //   return NextResponse.redirect(loginUrl);
  // }
  // // 4. Nếu đã login rồi mà cố tình vào lại trang login/home -> Redirect thẳng vào /admin
  // if (pathname === "/" && token) {
  //   const adminUrl = new URL("/admin", request.url);
  //   return NextResponse.redirect(adminUrl);
  // }
  // return NextResponse.next();
}

// Cấu hình Middleware chỉ chạy cho các route nhất định
export const config = {
  matcher: [
    /*
     * Khớp với tất cả các route bắt đầu bằng /admin
     * Hoặc trang login/home (/) để xử lý redirect
     */
    "/",
    "/admin/:path*",
  ],
};
