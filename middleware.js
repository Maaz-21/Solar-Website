import { NextResponse } from 'next/server';

export const config = {
  matcher: '/api/:path*',
};

export default function middleware(request) {
  console.log(`Request Method: ${request.method}, Request URL: ${request.url}`);
  return NextResponse.next();
}
