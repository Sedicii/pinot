# pinot

Transform Pino HTTP log messages with a format string

```sh
$ npm install -g pinot
```

```sh
$ pinot --help
```

```sh

    pinot [-e] [-h]

    -e | --show-errors     show erros
    -h | --show-headers    show response headers

    --help                 show this help
```


### Example

Spin up a server that uses a pino http logger, pipe it to `pinot` and enjoy

```sh
$ node server | pinot
```
