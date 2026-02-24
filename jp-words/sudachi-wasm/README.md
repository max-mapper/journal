# sudachi-wasm333

> Updated WebAssembly distribution of [sudachi.rs].

This distribution supports both of browser and Node.js.

<!-- #### ✨ [Demo](https://sudachi-wasm.s3.amazonaws.com/index.html) -->

## Why?

Because a lot of Japanese tokenizing projects use [kuromoji.js] ![GitHub last commit](https://img.shields.io/github/last-commit/takuyaa/kuromoji.js) or [Kuroshiro] ![GitHub last commit](https://img.shields.io/github/last-commit/hexenq/kuroshiro) + [kuroshiro-analyzer-kuromoji] ![GitHub last commit](https://img.shields.io/github/last-commit/hexenq/kuroshiro-analyzer-kuromoji) that internally use the [kuromoji] dictionary ![GitHub last commit](https://img.shields.io/github/last-commit/atilika/kuromoji). And although that is not a bad thing, as you may noticed, all of them are considerably outdated.

Fortunately [SudachiDict] is a modern Japanese morphological analyzer that is often updated.
> So we can use [sudachi-wasm] and forget about outdated dicts. Right?

Well... not exactly. The original [sudachi-wasm] embedded the whole sudachi dictionary in its package code. That implies:
- Slower performance.
- Heavier file size.
- Unable to use another dict files besides the one the package was compiled with.

This library fixes all of that by using dynamic dictionary loading, allowing you to use the latest [Sudachi Dictionary] even if for some reason I forget to update this package.

Right now you have to manually download the [Sudachi Dictionary] you want to use, but I plan to add dynamic downloading too, so the package automatically will download the latest dictionary available.

## Features

- Updated structure of the original [sudachi-wasm] to reassemble the actual structure of [sudachi.rs].
- SudachiStateless and SudachiStateful classes implementation.
- Slightly improved library docstrings and types.
- Added dynamic dict loading, so a custom dict path/url can be provided.
- Improved file size because of dynamic dict loading.
- Structure kinda inspired in [Kuroshiro] initialization.
- Improved performance.
![](https://pbs.twimg.com/media/G4Y5I0JWEAAAdjj?format=png&name=small)

## Usage

### Custom Sudachi Dictionary

Sudachi-wasm333 includes a dictionary packaged by default (the small one). But if you want to use a specific version, you can download it from [here][Sudachi Dictionary] and provide the path/url through the class initializer.

### Browser

<!-- [v0.1.4.js](https://sudachi-wasm.s3.amazonaws.com/v0.1.4.js) -->

```html
<script type="module">
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("serviceWorker.js");
  }

  const console = document.querySelector("#console");
  // Please replace to self-hosted script path.
  import { SudachiStateless, TokenizeMode } from "/v1.0.3.js";

  const sudachi = new SudachiStateless();

  await sudachi.initialize_browser();

  console.innerText = JSON.stringify(
    JSON.parse(sudachi.tokenize_stringified("今日は良い天気なり。", TokenizeMode.C)),
    null,
    2
  );
</script>
```

#### ⚠ Script is too large

Gzipped script file is also larger than 50 MB 🐘.
Please use the following mechanisms to delivery it.

- [gzip encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding) for compressing
- [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) for caching

### Node.js

```bash
npm i sudachi-wasm333
```

Then,

```js
import { promises } from 'fs';
import { SudachiStateless, TokenizeMode } from "sudachi";

const sudachi = new SudachiStateless();

await sudachi.initialize_node(promises.readFile);

console.log(sudachi.tokenize_raw("今日は良い天気なり。", TokenizeMode.C));
```

## Development requirements

- [wasm-pack](https://github.com/rustwasm/wasm-pack)
- [zx](https://github.com/google/zx)
- [just](https://github.com/casey/just) (Optional)

## Just (Optional)

All build and test related commands can be found in the justfile.

```bash
just help
```

```bash
just dev
```

```bash
just build test-all
```

## Build

```bash
cd sudachi
wasm-pack build --dev --target web && zx ./wasm-pack-inline.mjs
```

## Test

### Browser

```bash
npx http-server
```

Then, access to the [local server](http://127.0.0.1:8080/test/browser.html).

> I actually prefer [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
> <br>- Benjas333

### Node.js

```bash
cd sudachi
node test/node.mjs
```

```bash
cd sudachi
node test/node_stateful.mjs
```

```bash
cd sudachi
node test/special_chars.mjs
```

## TODO

### Minor
- Add public link (like the original sudachi-wasm: https://sudachi-wasm.s3.amazonaws.com/v0.1.4.js).
- Add SudachiStateful examples.
- Improve documentation.
- Edit [README.ja.md](README.ja.md).
- Add demo (like the original sudachi-wasm: https://sudachi-wasm.s3.amazonaws.com/index.html).
### Major
- Add dict loading from the .zip to reduce library size.
- Add default dict being dynamically downloaded from [SudachiDict][Sudachi Dictionary].
- Add dynamic dict type downloading: "small", "core", "full".

[sudachi.rs]: https://github.com/WorksApplications/sudachi.rs
[sudachi-wasm]: https://github.com/hata6502/sudachi-wasm
[kuromoji]: https://github.com/atilika/kuromoji
[kuromoji.js]: https://github.com/takuyaa/kuromoji.js
[Kuroshiro]: https://github.com/hexenq/kuroshiro
[kuroshiro-analyzer-kuromoji]: https://github.com/hexenq/kuroshiro-analyzer-kuromoji
[SudachiDict]: https://github.com/WorksApplications/SudachiDict
[Sudachi Dictionary]: http://sudachi.s3-website-ap-northeast-1.amazonaws.com/sudachidict/
