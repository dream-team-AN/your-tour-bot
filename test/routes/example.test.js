/* eslint-disable no-unused-vars */
// eslint-disable-next-line lines-around-directive
'use strict';

const { test } = require('tap');
const { build } = require('../helper');

// test('example is loaded', async (t) => {
//   const app = build(t);

//   const res = await app.inject({
//     url: '/example'
//   });
//   t.equal(res.payload, 'some code');
// });

// inject callback style:
//
// test('example is loaded', (t) => {
//   t.plan(2)
//   const app = build(t)
//
//   app.inject({
//     url: '/example'
//   }, (err, res) => {
//     t.error(err)
//     t.equal(res.payload, 'this is an example')
//   })
// })
