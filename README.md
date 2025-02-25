# Observable

A simple Observable implementation in JavaScript.

## Installation

```bash
npm install --save @dobschal/Observable
```

## Usage

```javascript
import Observable from '@dobschal/Observable';

const count = new Observable(5);

count.subscribe(value => {
  console.log(value);
});

count.set(10); // will trigger the subscription and log 10
count.value = 15; // will trigger the subscription and log 15
```

