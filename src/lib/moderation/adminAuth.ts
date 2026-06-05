import { NextResponse } from 'next/server';

export const ensureAdminRequest = (request: Request) => {
  const configuredToken = process.env.ADMIN_API_TOKEN;
  if (!configuredToken) {
    return NextResponse.json({ error: 'Admin authorization required: missing ADMIN_API_TOKEN' }, { status: 403 });
  }

  const token = request.headers.get('x-admin-token');
  if (token !== configuredToken) {
    return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
  }
  return null;
};
