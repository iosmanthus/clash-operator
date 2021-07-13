import { Subscriptions } from ".";
import axios from "axios";

export interface Fetcher {
    fetch(subs: Subscriptions): Promise<Subscriptions>;
}

export class AxiosFetcher implements Fetcher {
    async fetch(subs: Subscriptions): Promise<Subscriptions> {
        for (const [name, sub] of subs) {
            sub.data = (await axios.get(sub.url)).data;
            subs.set(name, sub);
        }
        return subs;
    }
}

