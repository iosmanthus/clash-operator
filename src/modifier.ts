import { Subscriptions } from ".";

export interface Modifier {
    modify(subs: Subscriptions): Promise<Subscriptions>;
}

export class IdentityModifier implements Modifier {
    async modify(sub: Subscriptions): Promise<Subscriptions> {
        return sub;
    }
}