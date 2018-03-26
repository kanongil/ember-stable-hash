import Ember from 'ember';
import HashHandler from '../helpers/stable-hash';

const emberRequire = Ember.__loader.require;
const Glimmer = emberRequire('ember-glimmer');

const { Environment } = Glimmer;

export default function hookStableHash(name = 'stable-hash') {
  const origCreate = Environment.create;
  Environment.create = function () {
    let env = origCreate.call(this, ...arguments);

    let { builtInHelpers } = env;
    if (!builtInHelpers) {
      // ember@3.1 has moved builtInHelpers to a resolver

      const Container = emberRequire('container');
      const rootTemplate = env.owner.lookup(Container.privatize`template:-root`);

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
