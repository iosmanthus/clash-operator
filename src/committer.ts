import { Subscriptions } from ".";
import { Fetcher, AxiosFetcher } from "./fetcher";
import { Decoder, GenericDecoder } from "./decoder";
import { Modifier, IdentityModifier } from "./modifier";
import { Clash } from "./client";
import { Logger } from "tslog";

import * as yaml from "js-yaml";
import * as wf from "write-file-atomic";
import fs from "fs";

export interface Committer {
    fetcher: Fetcher;
    decoder: Decoder;
    modifier: Modifier;
    commit(subscriptions: Subscriptions): void;
}

export class BaseCommitter implements Committer {
    fetcher: Fetcher = new AxiosFetcher();
    decoder: Decoder = new GenericDecoder();
    modifier: Modifier = new IdentityModifier();
    protected committed: Subscriptions | null = null;

    constructor(fetcher?: Fetcher, decoder?: Decoder, modifier?: Modifier) {
        if (fetcher)
            this.fetcher = fetcher;
        if (decoder)
            this.decoder = decoder;
        if (modifier)
            this.modifier = modifier;
    }

    async commit(subscriptions: Subscriptions): Promise<void> {
        let fetched = await this.fetcher.fetch(subscriptions);
        for (let [name, sub] of fetched) {
            fetched.set(name, await this.decoder.decode(sub));
        }
        fetched = await this.modifier.modify(fetched);
        this.committed = fetched;
    }
}

export interface IntervalConfig {
    interval: number;
    readFrom: string;
    writeTo: string;
    controller: string;
    secret?: string;
}

export class Interval extends BaseCommitter {
    config: IntervalConfig;
    logger: Logger = new Logger({ name: "interval" });
    validate(config: IntervalConfig): IntervalConfig {
        if (!config.writeTo) {
            throw new Error('missing config write-to');
        }
        if (!config.readFrom) {
            throw new Error('missing config read-from');
        }
        if (!config.controller) {
            throw new Error('missing config controller');
        }
        if (!config.interval) {
            config.interval = 3600;
        }
        return config;
    }
    constructor(config: IntervalConfig, fetcher?: Fetcher, decoder?: Decoder, modifier?: Modifier) {
        super(fetcher, decoder, modifier);
        this.config = this.validate(config);
    }

    async task(subscriptions: Subscriptions): Promise<void> {
        try {
            await super.commit(subscriptions);
            wf.sync(this.config.writeTo + '.tmp', yaml.dump(this.committed, { noRefs: true }))
            const clash = new Clash({ controller: this.config.controller, secret: this.config.secret })
            await clash.forceReload(this.config.readFrom + '.tmp');
            this.logger.info('Prewrite succefully');
            fs.renameSync(this.config.writeTo + '.tmp', this.config.writeTo);
            this.logger.info('Commit succefully');
        } catch (err) {
            this.logger.error(err.toString())
        }
    }

    async commit(subscriptions: Subscriptions): Promise<void> {
        await this.task(subscriptions);
        setInterval(async () => {
            await this.task(subscriptions)
        }, this.config.interval * 1000);
    }
}