import { later } from '@ember/runloop';
import Controller from '@ember/controller';

/* eslint-disable no-console */

export default Controller.extend({
    a: '123',
    b: 'abc',

    init() {
        later(() => {
            console.log('update');
            this.set('a', '321');
        })

        return this._super(...arguments);
    }
});
