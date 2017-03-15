import Ember from 'ember';

/* eslint-disable no-console */

export default Ember.Component.extend({
  didRender() {
    this._super(...arguments);

    console.log('didRender', this.get('v.first'), this.get('v.second'), this.get('v.third'));
  },

  firstObserver: Ember.observer('v.first', function () {
    console.log('first', this.get('v.first'));
  }),

  secondObserver: Ember.observer('v.second', function () {
    console.log('second');
  }),

  thirdObserver: Ember.observer('v.third', function () {
    console.log('third', this.get('v.third')); // !!! not triggered
  }),
});