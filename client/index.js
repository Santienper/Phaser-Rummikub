import { WorkerEntrypoint } from "cloudflare:workers";

export default class extends WorkerEntrypoint {
    async fetch(request) {
        const url = new URL(request.url);
        let path = url.toString();
        path = path.replace("/.proxy/", "/");

        const req = new Request(path);

        // You can then just fetch the assets as normal, or you could pass in a custom Request object here if you wanted to fetch some other specific asset
        return await this.env.ASSETS.fetch(req);
    }
}