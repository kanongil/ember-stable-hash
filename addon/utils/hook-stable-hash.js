import Ember from 'ember';
import HashHandler from '../helpers/stable-hash';

const emberRequire = Ember.__loader.require;
const requireMethod = function (method, ...modules) {
  for (let idx = 0; idx < modules.length; idx++) {
    try {
      const module = emberRequire(modules[idx]);
      if (module[method]) {
        return module[method];
      }
    } catch (err) { /* nothing */ }
  }
}

const Environment = requireMethod('Environment', '@ember/-internals/glimmer', 'ember-glimmer');

export default function hookStableHash(name = 'stable-hash') {
  const origCreate = Environment.create;
  Environment.create = function () {
    let env = origCreate.call(this, ...arguments);

    let { builtInHelpers } = env;
    if (!builtInHelpers) {
      // ember@3.1 has moved builtInHelpers to a resolver

      const privatize = requireMethod('privatize', '@ember/-internals/container', 'container');
      const rootTemplate = env.owner.lookup(privatize`template:-root`);

      if (rootTemplate.compiler && rootTemplate.compiler.resolver) {
        builtInHelpers = rootTemplate.compiler.resolver.resolver.builtInHelpers;
      } else {
        builtInHelpers = rootTemplate.options.resolver.resolver.builtInHelpers;
      }
    }

    builtInHelpers[name] = HashHandler;

    return env;
  };

  Environment.isServiceFactory = true;

  return Environment;
}
