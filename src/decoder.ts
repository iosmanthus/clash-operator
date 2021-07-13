import { Subscription, Subscriptions } from ".";
import * as yaml from "js-yaml";
import * as base64 from "js-base64";


export interface Decoder {
    decode(sub: Subscription): Promise<Subscription>;
}

export class YamlDecoder implements Decoder {
    async decode(sub: Subscription): Promise<Subscription> {
        if (sub.data == null)
            throw "Subscription is missing data";
        sub.data = yaml.load(sub.data.toString());
        return sub;
    }
}

export class ShadowsocksDecoder implements Decoder {
    async decode(sub: Subscription): Promise<Subscription> {
        if (sub.data == null)
            throw "Subscription is missing data";

        const links = base64.decode(sub.data.toString()).split('\n');
        let decoded = [];
        for (const link of links) {
            let obj: any = {};
            let l = link
            if (l.startsWith('ss://')) {
                l = l.slice(5).split('#')[0]
                l = base64.decode(l)
                let colonIndex = l.indexOf(':');
                obj['method'] = l.slice(0, colonIndex);
                l = l.slice(colonIndex + 1);
                const atIndex = l.indexOf('@');
                obj['password'] = l.slice(0, atIndex);
                l = l.slice(atIndex + 1);
                colonIndex = l.indexOf(':');
                obj['hostname'] = l.slice(0, colonIndex);
                l = l.slice(colonIndex + 1);
                obj['port'] = l;
                decoded.push(obj);
            }
        }
        sub.data = decoded;
        return sub;
    }
}

export class GenericDecoder implements Decoder {
    async decode(sub: Subscription): Promise<Subscription> {
        switch (sub.type) {
            case "clash":
                return await new YamlDecoder().decode(sub);
            case "links":
                return await new ShadowsocksDecoder().decode(sub)
            default:
                throw "Unsupported subscription type";
        }
    }
}

