import type { APIRoute } from 'astro';
import { checkCredentials, setAdminSession } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!checkCredentials(username, password)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid administrator credentials. Please check username and password.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    setAdminSession(cookies);

    return new Response(JSON.stringify({
      success: true,
      message: 'Authentication successful.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Authentication error: ' + err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
