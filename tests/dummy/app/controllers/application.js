import Ember from 'ember';

/* eslint-disable no-console */

export default Ember.Controller.extend({
    a: '123',
    b: 'abc',

    init() {
        Ember.run.later(() => {
            console.log('update');
            this.set('a', '321');
        })
    }
});
