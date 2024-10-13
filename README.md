# steady-timer

> steady-timer主要解决浏览器setTimeout和setInterval中存在的一些问题，例如计时不准确，浏览器标签页失活时计时器的节流问题，steady-timer会劫持模拟主线程的setTimeout和setInterval，提高其计时的准确性，以及确保失活标签页下的计时器也能正常运转。



## Installation

```
npm i steady-timer

yarn add steady-timer

pnpm i steady-timer
```



## Usage

> 在程序主入口引入即可

```ts
import 'steady-timer'
```
