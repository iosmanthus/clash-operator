import fs from "fs";
import yargs from "yargs";
import * as yaml from "js-yaml";
import tmp from "tmp";
import { Logger } from "tslog";


import { Config } from "./config";
import { Loader } from "./loader";
import { Clash } from "./client";

const argv = yargs(process.argv)
  .options({
    'config': {
      alias: 'c',
      type: 'string',
      describe: 'config file',
      demandOption: true,
    }
  }).argv;

const log: Logger = new Logger({ name: "clash-operator" });

async function run(config: Config) {
  const loader = new Loader(config.subscription);

  const subscription = await loader.load()

  if (config.script !== undefined) {
    const tmpObj = tmp.fileSync({ postfix: '.ts' });
    let needRecover = fs.existsSync(config["write-to"]);
    let recover = null;

    try {
      fs.writeFileSync(tmpObj.name, config.script as string);
      const { override } = await import(tmpObj.name);
      let newConfig = override(subscription);
      if (needRecover) {
        recover = fs.readFileSync(config["write-to"]);
      }
      fs.writeFileSync(config["write-to"], yaml.dump(newConfig, { noRefs: true }));
    } catch (error) {
      tmpObj.removeCallback();
      throw error;
    }
    tmpObj.removeCallback();
    const client = new Clash({
      controller: config.controller,
      secret: config.secret
    });

    try {
      await client.forceReload(config['read-from']);
    } catch (error) {
      // Restore old config
      if (recover !== null) {
        fs.writeFileSync(config["write-to"], recover);
      }
      const message = error.response?.data?.message;
      if (message !== undefined) {
        throw message;
      }
      throw error;
    }
  }

  log.info("Synced finished");
}

function main(): NodeJS.Timeout | undefined {
  const config = new Config(argv.config);
  const task = () => {
    run(config).catch(err => log.error(err.toString()));
  };
  task();
  const timeout = setInterval(task, config.interval);
  return config["watch-file"] ? timeout : undefined;
}

try {
  let timeout = main();
  if (timeout !== undefined) {
    fs.watchFile(argv.config, () => {
      if (timeout !== undefined) {
        log.info("Change of config file detected, rebuilding config template.");
        clearTimeout(timeout);
        timeout = main();
      } else {
        fs.unwatchFile(argv.config);
      }
    });
  }
} catch (err) {
  log.error(err.toString());
}