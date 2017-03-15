import Ember from 'ember';

const { setProperties } = Ember;

class StableHashReference {

  constructor(args) {
    this.tag = args.tag;
    this.args = args;
    this.inner = null;
  }

  value() {
    let { args, inner } = this;

    let hash = args.value();
    if (!inner) {
      this.inner = inner = hash;
    } else {
      setProperties(inner, hash);
    }

    return inner;
  }

  get(path) {
    let { args } = this;
    return args.get(path);
  }
}

export default function (vm, args) {
  return new StableHashReference(args.named);
}
