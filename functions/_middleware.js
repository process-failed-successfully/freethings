export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Subdomain routing for read.freethings.win / read.freethings.com
  if (url.hostname === "read.freethings.win" || url.hostname === "read.freethings.com") {
    if (url.pathname === "/") {
      url.pathname = "/tools/reading-helper/lite";
    } else {
      url.pathname = `/tools/reading-helper${url.pathname}`;
    }
    // Pass the rewritten URL to the next handler/assets
    return context.next(new Request(url, context.request));
  }

  // Redirect www to apex domain
  if (url.hostname === "www.freethings.win" || url.hostname === "www.freethings.com") {
    url.hostname = url.hostname.replace("www.", "");
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
