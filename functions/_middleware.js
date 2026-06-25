export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Subdomain routing for read.freethings.win
  if (url.hostname === "read.freethings.win") {
    if (url.pathname === "/") {
      url.pathname = "/tools/reading-helper/lite.html";
    } else {
      url.pathname = `/tools/reading-helper${url.pathname}`;
    }
    // Fetch the rewritten URL from the static assets
    return context.env.ASSETS.fetch(new Request(url, context.request));
  }

  // Redirect www to apex domain
  if (url.hostname === "www.freethings.win") {
    url.hostname = "freethings.win";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
