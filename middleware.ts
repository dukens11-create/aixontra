import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  // Only check /setup route
  if (request.nextUrl.pathname === '/setup') {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Check if admin exists
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

      // If there's an error, allow access (fail open for setup)
      // This ensures setup page is accessible even if there's a temporary DB issue
      if (error) {
        console.error('Error checking admin existence:', error);
        return NextResponse.next();
      }

      // If admin exists, redirect to home
      if (data && data.length > 0) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // On any unexpected error, allow access to setup page
      console.error('Middleware error:', error);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/setup',
};
