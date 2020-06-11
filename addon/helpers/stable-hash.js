import { setProperties } from '@ember/object';
import Helper from '@ember/component/helper';

export default class StableHash extends Helper {
  constructor(...args) {
    super(...args);

    this.obj = {};
  }

  compute(positional, named) {
    setProperties(this.obj, named);
    return this.obj;
  }
}