export interface GeoLocation {
  ip: string;
  city: string;
  country: string;
  countryCode: string;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    if (ips[0]) return ips[0];
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return '127.0.0.1';
}

export async function lookupIp(ip: string): Promise<GeoLocation> {
  // If local / private IP
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {
      ip: ip || '127.0.0.1',
      city: 'Local Network',
      country: 'Development Host',
      countryCode: 'DEV'
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500); // 2.5s fast timeout

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,query`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        return {
          ip,
          city: data.city || 'Unknown City',
          country: data.country || 'Unknown Country',
          countryCode: data.countryCode || 'UN'
        };
      }
    }
  } catch (err) {
    // Fallback on timeout or network error
  }

  return {
    ip,
    city: 'Global',
    country: 'International',
    countryCode: 'INTL'
  };
}
