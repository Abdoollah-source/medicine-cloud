import puppeteer from '@cloudflare/puppeteer';

var corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders
      });
    }

    var url = new URL(request.url);
    var targetParam = url.searchParams.get('url');

    if (!targetParam) {
      return new Response('Missing "url" query parameter', {
        status: 400,
        headers: corsHeaders
      });
    }

    var targetUrl;
    try {
      targetUrl = new URL(targetParam);
    } catch (e) {
      return new Response('Invalid URL: ' + e.message, {
        status: 400,
        headers: corsHeaders
      });
    }

    var allowedOrigin = env.APP_ORIGIN;
    if (!allowedOrigin) {
      return new Response('Server configuration error: APP_ORIGIN not set', {
        status: 500,
        headers: corsHeaders
      });
    }

    var allowedOriginParsed;
    try {
      allowedOriginParsed = new URL(allowedOrigin);
    } catch (e) {
      return new Response('Server configuration error: invalid APP_ORIGIN', {
        status: 500,
        headers: corsHeaders
      });
    }

    var targetHost = targetUrl.hostname;
    var allowedHost = allowedOriginParsed.hostname;

    var isAllowed = (targetHost === allowedHost) || 
                    (targetHost.endsWith('.medicine-cloud.pages.dev') && targetUrl.protocol === 'https:');

    if (!isAllowed) {
      return new Response('Forbidden', {
        status: 403,
        headers: corsHeaders
      });
    }

    if (!env.MY_BROWSER) {
      return new Response('Browser rendering binding not configured', {
        status: 500,
        headers: corsHeaders
      });
    }

    var browser;
    try {
      browser = await puppeteer.launch(env.MY_BROWSER);
      var page = await browser.newPage();
      await page.goto(targetParam, {
        waitUntil: 'networkidle0',
        timeout: 15000
      });

      var pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm'
        },
        printBackground: true
      });

      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="note.pdf"',
          ...corsHeaders
        }
      });
    } catch (e) {
      var status = e.message.includes('timeout') ? 504 : 500;
      return new Response('PDF generation failed: ' + e.message, {
        status: status,
        headers: corsHeaders
      });
    } finally {
      if (browser) {
        try { await browser.close(); } catch (e) {}
      }
    }
  }
};
