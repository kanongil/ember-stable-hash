
import { run } from '@ember/runloop';
import { observer, set, get } from '@ember/object';
import Component from '@ember/component';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('stable-hash', 'helper:stable-hash', {
  integration: true
});

test('returns a hash with the right key-value', function(assert) {
  this.render(hbs`{{#with (stable-hash name=\"Sergio\") as |person|}}{{person.name}}{{/with}}`);

  assert.equal(this.$().text().trim(), 'Sergio');
});

test('can have more than one key-value', function(assert) {
  this.render(hbs`{{#with (stable-hash name="Sergio" lastName="Arbeo") as |person|}}{{person.name}} {{person.lastName}}{{/with}}`);

  assert.equal(this.$().text().trim(), 'Sergio Arbeo');
});

test('binds values when variables are used', function(assert) {
  this.set('model', {
    firstName: 'Marisa'
  });

  this.render(hbs`{{#with (stable-hash name=model.firstName lastName="Arbeo") as |person|}}{{person.name}} {{person.lastName}}{{/with}}`);
  assert.equal(this.$().text().trim(), 'Marisa Arbeo');

  this.set('model.firstName', 'Sergio');
  assert.equal(this.$().text().trim(), 'Sergio Arbeo');

  this.set('model.firstName', 'Marisa');
  assert.equal(this.$().text().trim(), 'Marisa Arbeo');
});

test('binds multiple values when variables are used', function(assert) {
  this.set('model', {
    firstName: 'Marisa',
    lastName: 'Arbeo'
  });

  this.render(hbs`{{#with (stable-hash name=model.firstName lastName=model.lastName) as |person|}}{{person.name}} {{person.lastName}}{{/with}}`);
  assert.equal(this.$().text().trim(), 'Marisa Arbeo');

  this.set('model.firstName', 'Sergio');
  assert.equal(this.$().text().trim(), 'Sergio Arbeo');

  this.set('model.lastName', 'Smith');
  assert.equal(this.$().text().trim(), 'Sergio Smith');

  this.set('model', {
    firstName: 'Marisa',
    lastName: 'Arbeo'
  });
  assert.equal(this.$().text().trim(), 'Marisa Arbeo');
});

test('hash helpers can be nested', function(assert) {
  this.set('model', {
    firstName: 'Balint'
  });

  this.render(hbs`{{#with (stable-hash person=(stable-hash name=model.firstName)) as |ctx|}}{{ctx.person.name}}{{/with}}`);
  assert.equal(this.$().text().trim(), 'Balint');

  this.set('model.firstName', 'Chad');
  assert.equal(this.$().text().trim(), 'Chad');

  this.set('model', { firstName: 'Balint' });
  assert.equal(this.$().text().trim(), 'Balint');
});

test('should yield hash of internal properties', function(assert) {
  let fooBarInstance;
  let FooBarComponent = Component.extend({
    init() {
      this._super();
      fooBarInstance = this;
      this.model = { firstName: 'Chad' };
    }
  });

  this.register('component:foo-bar', FooBarComponent);
  this.register('template:components/foo-bar', hbs`{{yield (stable-hash firstName=model.firstName)}}`);

  this.render(hbs`{{#foo-bar as |values|}}{{values.firstName}}{{/foo-bar}}`);
  assert.equal(this.$().text().trim(), 'Chad');

  run(() => fooBarInstance.set('model.firstName', 'Godfrey'));
  assert.equal(this.$().text().trim(), 'Godfrey');

  run(() => fooBarInstance.set('model', { firstName: 'Chad' }));
  assert.equal(this.$().text().trim(), 'Chad');
});

test('should yield hash of internal and external properties', function(assert) {
  let fooBarInstance;
  let FooBarComponent = Component.extend({
    init() {
      this._super();
      fooBarInstance = this;
      this.model = { firstName: 'Chad' };
    }
  });

  this.register('component:foo-bar', FooBarComponent);
  this.register('template:components/foo-bar', hbs`{{yield (stable-hash firstName=model.firstName lastName=lastName)}}`);

  this.set('model', { lastName: 'Hietala' });

  this.render(hbs`{{#foo-bar lastName=model.lastName as |values|}}{{values.firstName}} {{values.lastName}}{{/foo-bar}}`);
  assert.equal(this.$().text().trim(), 'Chad Hietala');

  run(() => {
    set(fooBarInstance, 'model.firstName', 'Godfrey');
    set(this, 'model.lastName', 'Chan');
  });
  assert.equal(this.$().text().trim(), 'Godfrey Chan');

  run(() => {
    set(fooBarInstance, 'model', { firstName: 'Chad' });
    set(this, 'model', { lastName: 'Hietala' });
  });
  assert.equal(this.$().text().trim(), 'Chad Hietala');
});

test('returns stable object when updated', function(assert) {
  let fooBarInstance;
  let FooBarComponent = Component.extend({
    init() {
      this._super();
      fooBarInstance = this;
    }
  });

  this.register('component:foo-bar', FooBarComponent);
  this.register('template:components/foo-bar', hbs`{{model.firstName}} {{model.lastName}}`);

  this.set('firstName', 'Sergio');
  this.render(hbs`{{foo-bar model=(stable-hash firstName=firstName lastName="Arbeo")}}`);

  let hashInstance = get(fooBarInstance, 'model');

  assert.strictEqual(hashInstance, get(fooBarInstance, 'model'));
  assert.equal(this.$().text().trim(), 'Sergio Arbeo');

  this.set('firstName', 'Godfrey');

  assert.strictEqual(hashInstance, get(fooBarInstance, 'model'));
  assert.equal(this.$().text().trim(), 'Godfrey Arbeo');
});

test('correctly triggers observers', function(assert) {
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

  this.register('component:foo-bar', FooBarComponent);
  this.register('template:components/foo-bar', hbs`{{model.firstName}} {{model.lastName}}`);

  this.set('firstName', 'Sergio');
  this.render(hbs`{{foo-bar model=(stable-hash firstName=firstName lastName="Arbeo")}}`);

  assert.equal(modelTriggerCnt, 0);
  assert.equal(firstNameTriggerCnt, 0);
  assert.equal(lastNameTriggerCnt, 0);
  assert.equal(this.$().text().trim(), 'Sergio Arbeo');

  this.set('firstName', 'Godfrey');

  assert.equal(modelTriggerCnt, 0);
  assert.equal(firstNameTriggerCnt, 1);
  assert.equal(lastNameTriggerCnt, 0);
  assert.equal(this.$().text().trim(), 'Godfrey Arbeo');
});
