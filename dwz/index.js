addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
});

/**
 * @param {Request} request 
 * @returns {Response}
 */
async function handleRequest(request) {
    const { pathname } = new URL(request.url);
    return new Response();
}