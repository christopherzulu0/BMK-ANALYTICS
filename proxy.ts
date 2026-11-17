import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const staticExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.css', '.js', '.woff', '.woff2', '.ttf', '.eot'];
const isStaticAsset = staticExtensions.some(ext => pathname.toLowerCase().endsWith(ext));
if (isStaticAsset) {
  return NextResponse.next();
}
  // Check if the path is a public path that doesn't require authentication
  const isPublicPath =
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/api/auth/') ||
      pathname === '/' ||
      pathname.startsWith('/LandingPage');

  // Check if the user is authenticated by verifying the session token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  // Only consider authenticated if token exists and has a valid email (indicating user exists)
  const isAuthenticated = !!token && !!token.email;

  console.log(`Path: ${pathname}, Token exists: ${!!token}, Has email: ${!!token?.email}, isAuthenticated: ${isAuthenticated}`);

  // If the path requires authentication and the user is not authenticated, redirect to sign-in
  if (!isPublicPath && !isAuthenticated) {
    // Use absolute URL to ensure consistent redirection
    const redirectUrl = new URL('/auth/signin', request.url);
    console.log(`Redirecting unauthenticated user from ${pathname} to ${redirectUrl.toString()}`);
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is authenticated and trying to access auth pages (except error page), redirect to dashboard


  return NextResponse.next();
}


// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api/auth (NextAuth API routes)
     * 2. /_next (Next.js internals)
     * 3. /fonts (static files)
     * 4. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!api/auth|_next|fonts|favicon.ico|sitemap.xml).*)',
  ],
};
