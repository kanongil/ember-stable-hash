import Ember from 'ember';
import HashHandler from '../helpers/stable-hash';

const emberRequire = Ember.__loader.require;
const Glimmer = emberRequire('ember-glimmer');

const { Environment } = Glimmer;

export default function hookStableHash(name = 'stable-hash') {
  const origCreate = Environment.create;
  Environment.create = function () {
    let env = origCreate(...arguments);
    env.builtInHelpers[name] = HashHandler;
    return env;
  };
  Environment.isServiceFactory = true;

  return Environment;
}
