# echarts-fis

[echarts](https://github.com/ecomfe/echarts) for [fis](https://github.com/fex-team/fis).

## USAGE

- clone the project or install by bower:

```bash
$ bower install http://gitlab.pro/bdg/echarts.git
```

After installed, you can use it:

in fis ENV

```javascript
var echarts = reuqire("echarts");
require("echarts/bar");

var ec = echarts.init(el);
ec.setOption({});

// async

require.async([
    "echarts"
    , "echarts/bar"
], function(echarts) {
    var ec = echarts.init(el);
    ec.setOption({});
});
```

## DEVELOP

- install deps

```bash
$ npm i -g bower gulp; npm i
```

- update & rebuild

```bash
$ gulp
```