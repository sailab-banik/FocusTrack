import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  HOME_PATH,
  isAuthPage,
  isPublicPath,
  SIGN_IN_PATH,
} from "@/features/auth/routes";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          for (const [key, value] of Object.entries(headers)) {
            response.headers.set(key, value);
          }
        },
      },
    },
  );

  // Refreshes an expired session so Server Components read a valid one.
  const { data } = await supabase.auth.getClaims();
  const signedIn = data !== null;
  const { pathname } = request.nextUrl;

  if (!signedIn && !isPublicPath(pathname)) {
    return redirectKeepingCookies(request, response, SIGN_IN_PATH);
  }
  if (signedIn && isAuthPage(pathname)) {
    return redirectKeepingCookies(request, response, HOME_PATH);
  }
  return response;
}

// Pages still check the user themselves; this redirect is only for UX.
// Copies cookies so a session refreshed above is not lost on redirect.
function redirectKeepingCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url));
  for (const cookie of response.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
