import * as yaml from "js-yaml";
import { Logger } from "tslog";
import fs from "fs";
import yargs from "yargs";
import { Interval } from "./committer";

export class Subscription {
  public type: string;
  public url: string;
  public data: Object | null = null;
  constructor(type: string, url: string) {
    this.type = type;
    this.url = url;
  }
}

export type Subscriptions = Map<string, Subscription>;

const argv = yargs(process.argv)
  .options({
    'config': {
      alias: 'c',
      type: 'string',
      describe: 'config file',
      demandOption: true,
    }
  }).argv;

const logger = new Logger({ name: 'main' })

async function main() {
  const config = yaml.load(fs.readFileSync(argv.config, 'utf8'));

  async function interval() {
    const modifier = await import(config['modifier']['file']);
    const committer = new Interval({
      controller: config['controller'],
      interval: config['period'],
      readFrom: config['read-from'],
      writeTo: config['write-to']
    },
      undefined,
      undefined,
      new modifier[config['modifier']['name']]());
    committer.commit(new Map(Object.entries(config['subscriptions'])));
  }

  switch (config['mode']) {
    case "interval":
      interval().then(() => { })
      break;
    default:
      break;
  }
}


main().then(() => { })