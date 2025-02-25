# Observable

A simple Observable implementation in JavaScript.

![Test](https://github.com/dobschal/Observable/actions/workflows/test.yml/badge.svg)
[![NPM](https://img.shields.io/npm/v/@dobschal/observable)](https://www.npmjs.com/package/@dobschal/observable)

## Installation

```bash
npm install --save @dobschal/Observable
```

## Usage

Observe values and get notified when they change:
```javascript
import { Observable } from '@dobschal/observable';

const count = Observable(5);

count.subscribe(value => {
  console.log(value);
});

count.set(10); // will trigger the subscription and log 10
count.value = 15; // will trigger the subscription and log 15
```

Watch computed values:
```javascript
import { Computed, Observable } from '@dobschal/observable';

const count = Observable(5);
const multiplied = Computed(() => count.value * 2);

multiplied.subscribe(value => {
  console.log(value);
});
```
