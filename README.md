```ts
export class MergeModifier implements Modifier {
    async modify(subs: Subscriptions): Promise<Subscriptions> {
      // ... 
      return subs
    }
}
```
```yaml
mode: interval
subscriptions:
  dlercloud:
    type: clash
    url: https://dler.cloud/xxx
  jms:
    type: links
    url: https://example.net/xxx
period: 3600
modifier:
  name: MergeModifier
  file: ../merge.ts

write-to: "/etc/clash/config.yaml"
read-from: "/etc/clash/config.yaml"
controller: http://172.18.0.2:9090
```