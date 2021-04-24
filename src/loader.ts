import axios from "axios";
import * as yaml from "js-yaml";

export class Loader {
    url: string;

    constructor(url: string) {
        this.url = encodeURI(url);
    }

    public async load(): Promise<any> {
        const data = (await axios.get(this.url)).data;
        return yaml.load(data);
    }
}