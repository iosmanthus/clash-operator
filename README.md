```yaml
subscription: https://dler.cloud/subscribe/xxxxxxxxxxxxxxxx
interval: 1800
watch-file: true
controller: http://172.18.0.2:9090
write-to: /etc/clash/config.yaml
read-from: /etc/clash/config.yaml
script: |
  export function override(old: any): any{
    old = {
      ...old,
      'port': 80,
      'socks-port': 1080,
      'mixed-port': 0,
      'allow-lan': true,
      'mode': 'Script',
      'log-level': 'info',
      'external-controller': '0.0.0.0:9090',
      'profile': {
        'store-selected': true
      },
      'rules': null,
    };
    return old;
  }
```