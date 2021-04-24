import axios, { AxiosRequestConfig } from "axios";

export class Clash {
    controller!: string;
    secret?: string;
    constructor(obj: { controller: string; secret?: string }) {
        Object.assign(this, obj);
    }

    public async forceReload(path: string) {
        let options: AxiosRequestConfig = {
            method: "put",
            url: "/configs",
            baseURL: this.controller,
            params: { force: true },
            data: { path },
        };
        if (this.secret !== undefined) {
            options.headers = { 'Authorization': `Bearer ${this.secret}` };
        }
        await axios(options);
    }
}