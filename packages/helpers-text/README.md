# @lpr/helpers-text

Small, dependency-free JavaScript helpers for transforming text between common naming conventions.

## Installation

```bash
pnpm add @lpr/helpers-text
```

## API

| Function                      | Description                                               |
| ----------------------------- | --------------------------------------------------------- |
| `camelize(text)`              | Converts text to camelCase                                |
| `pascalize(text)`             | Converts text to PascalCase                               |
| `decamelize(str, separator)`  | Converts camelCase/PascalCase to lowercase separated text |
| `constantize(str, separator)` | Converts camelCase/PascalCase to uppercase separated text |

## Usage

```js
import { camelize, pascalize, decamelize, constantize } from '@lpr/helpers-text';
```

### `camelize(text)`

```js
camelize('hello world');
// "helloWorld"

camelize('Hello world');
// "helloWorld"

camelize('hello-world');
// "helloWorld"
```

### `pascalize(text)`

```js
pascalize('hello world');
// "HelloWorld"

pascalize('hello-world');
// "HelloWorld"

pascalize('helloWorld');
// "HelloWorld"
```

### `decamelize(str, separator = "_")`

```js
decamelize('helloWorld');
// "hello_world"

decamelize('HelloWorld');
// "hello_world"

decamelize('helloWorld', '-');
// "hello-world"

decamelize('XMLHttpRequest');
// "xml_http_request"
```

### `constantize(str, separator = "_")`

```js
constantize('helloWorld');
// "HELLO_WORLD"

constantize('HelloWorld');
// "HELLO_WORLD"

constantize('helloWorld', '-');
// "HELLO-WORLD"

constantize('XMLHttpRequest');
// "XML_HTTP_REQUEST"
```
