import fs from 'fs';
import * as yaml from 'js-yaml';

export class Config {
    interval: number = 3600;
    subscription!: string;
    controller!: string;
    script?: string;
    secret?: string;
    'watch-file': boolean = false;
    'write-to': string;
    'read-from': string;
    constructor(path: string) {
        const keys = ["subscription", "controller", "write-to", "read-from"];
        const config = yaml.load(fs.readFileSync(path).toString());
        for (const requireProps of keys) {
            if (config[requireProps] === undefined) {
                throw `missing config for \`${requireProps}\` in ${path}`
            }
        }
        Object.assign(this, config);
        this.interval *= 1000;
    }
}