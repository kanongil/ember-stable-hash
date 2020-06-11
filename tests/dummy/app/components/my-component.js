import { observer } from '@ember/object';
import Component from '@ember/component';

/* eslint-disable no-console, ember/no-observers, ember/no-get */

export default Component.extend({
  didRender() {
    this._super(...arguments);

    console.log('didRender', this.get('v.first'), this.get('v.second'), this.get('v.third'));
  },

  firstObserver: observer('v.first', function () {
    console.log('first', this.get('v.first'));
  }),

  secondObserver: observer('v.second', function () {
    console.log('second');
  }),

  thirdObserver: observer('v.third', function () {
    console.log('third', this.get('v.third')); // !!! not triggered
  }),
});