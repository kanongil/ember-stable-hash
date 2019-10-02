
import { run } from '@ember/runloop';
import { observer, set, get } from '@ember/object';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

/* eslint-disable ember/no-observers */

module('helper:stable-hash', function(hooks) {
  setupRenderingTest(hooks);

  test('returns a hash with the right key-value', async function(assert) {
    await render(hbs`{{#with (stable-hash name=\"Sergio\") as |person|}}{{person.name}}{{/with}}`);

    assert.dom('*').hasText('Sergio');
  });

  test('can have more than one key-value', async function(assert) {
    await render(
      hbs`{{#with (stable-hash name="Sergio" lastName="Arbeo") as |person|}}{{person.name}} {{person.lastName}}{{/with}}`
    );

    assert.dom('*').hasText('Sergio Arbeo');
  });

  test('binds values when variables are used', async function(assert) {
    this.set('model', {
      firstName: 'Marisa'
    });

    await render(
      hbs`{{#with (stable-hash name=model.firstName lastName="Arbeo") as |person|}}{{person.name}} {{person.lastName}}{{/with}}`
    );
    assert.dom('*').hasText('Marisa Arbeo');

    this.set('model.firstName', 'Sergio');
    assert.dom('*').hasText('Sergio Arbeo');

    this.set('model.firstName', 'Marisa');
    assert.dom('*').hasText('Marisa Arbeo');
  });

  test('binds multiple values when variables are used', async function(assert) {
    this.set('model', {
      firstName: 'Marisa',
      lastName: 'Arbeo'
    });

    await render(
      hbs`{{#with (stable-hash name=model.firstName lastName=model.lastName) as |person|}}{{person.name}} {{person.lastName}}{{/with}}`
    );
    assert.dom('*').hasText('Marisa Arbeo');

    this.set('model.firstName', 'Sergio');
    assert.dom('*').hasText('Sergio Arbeo');

    this.set('model.lastName', 'Smith');
    assert.dom('*').hasText('Sergio Smith');

    this.set('model', {
      firstName: 'Marisa',
      lastName: 'Arbeo'
    });
    assert.dom('*').hasText('Marisa Arbeo');
  });

  test('hash helpers can be nested', async function(assert) {
    this.set('model', {
      firstName: 'Balint'
    });

    await render(
      hbs`{{#with (stable-hash person=(stable-hash name=model.firstName)) as |ctx|}}{{ctx.person.name}}{{/with}}`
    );
    assert.dom('*').hasText('Balint');

    this.set('model.firstName', 'Chad');
    assert.dom('*').hasText('Chad');

    this.set('model', { firstName: 'Balint' });
    assert.dom('*').hasText('Balint');
  });

  test('should yield hash of internal properties', async function(assert) {
    let fooBarInstance;
    let FooBarComponent = Component.extend({
      init() {
        this._super();
        fooBarInstance = this;
        this.model = { firstName: 'Chad' };
      }
    });

    this.owner.register('component:foo-bar', FooBarComponent);
    this.owner.register('template:components/foo-bar', hbs`{{yield (stable-hash firstName=model.firstName)}}`);

    await render(hbs`{{#foo-bar as |values|}}{{values.firstName}}{{/foo-bar}}`);
    assert.dom('*').hasText('Chad');

    run(() => fooBarInstance.set('model.firstName', 'Godfrey'));
    assert.dom('*').hasText('Godfrey');

    run(() => fooBarInstance.set('model', { firstName: 'Chad' }));
    assert.dom('*').hasText('Chad');
  });

  test('should yield hash of internal and external properties', async function(assert) {
    let fooBarInstance;
    let FooBarComponent = Component.extend({
      init() {
        this._super();
        fooBarInstance = this;
        this.model = { firstName: 'Chad' };
      }
    });

    this.owner.register('component:foo-bar', FooBarComponent);
    this.owner.register('template:components/foo-bar', hbs`{{yield (stable-hash firstName=model.firstName lastName=lastName)}}`);

    this.set('model', { lastName: 'Hietala' });

    await render(
      hbs`{{#foo-bar lastName=model.lastName as |values|}}{{values.firstName}} {{values.lastName}}{{/foo-bar}}`
    );
    assert.dom('*').hasText('Chad Hietala');

    run(() => {
      set(fooBarInstance, 'model.firstName', 'Godfrey');
      set(this, 'model.lastName', 'Chan');
    });
    assert.dom('*').hasText('Godfrey Chan');

    run(() => {
      set(fooBarInstance, 'model', { firstName: 'Chad' });
      set(this, 'model', { lastName: 'Hietala' });
    });
    assert.dom('*').hasText('Chad Hietala');
  });

  test('returns stable object when updated', async function(assert) {
    let fooBarInstance;
    let FooBarComponent = Component.extend({
      init() {
        this._super();
        fooBarInstance = this;
      }
    });

    this.owner.register('component:foo-bar', FooBarComponent);
    this.owner.register('template:components/foo-bar', hbs`{{model.firstName}} {{model.lastName}}`);

    this.set('firstName', 'Sergio');
    await render(hbs`{{foo-bar model=(stable-hash firstName=firstName lastName="Arbeo")}}`);

    let hashInstance = get(fooBarInstance, 'model');

    assert.strictEqual(hashInstance, get(fooBarInstance, 'model'));
    assert.dom('*').hasText('Sergio Arbeo');

    this.set('firstName', 'Godfrey');

    assert.strictEqual(hashInstance, get(fooBarInstance, 'model'));
    assert.dom('*').hasText('Godfrey Arbeo');
  });

  test('correctly triggers observers', async function(assert) {
    let modelTriggerCnt = 0;
    let firstNameTriggerCnt = 0;
    let lastNameTriggerCnt = 0;

    let FooBarComponent = Component.extend({
      modelObserver: observer('model', () => {
        modelTriggerCnt++;
      }),

      firstNameObserver: observer('model.firstName', () => {
        firstNameTriggerCnt++;
      }),

      lastNameObserver: observer('model.lastName', () => {
        lastNameTriggerCnt++;
      })
    });

    this.owner.register('component:foo-bar', FooBarComponent);
    this.owner.register('template:components/foo-bar', hbs`{{model.firstName}} {{model.lastName}}`);

    this.set('firstName', 'Sergio');
    await render(hbs`{{foo-bar model=(stable-hash firstName=firstName lastName="Arbeo")}}`);

    assert.equal(modelTriggerCnt, 0);
    assert.equal(firstNameTriggerCnt, 0);
    assert.equal(lastNameTriggerCnt, 0);
    assert.dom('*').hasText('Sergio Arbeo');

    this.set('firstName', 'Godfrey');

    assert.equal(modelTriggerCnt, 0);
    assert.equal(firstNameTriggerCnt, 1);
    assert.equal(lastNameTriggerCnt, 0);
    assert.dom('*').hasText('Godfrey Arbeo');
  });
});
