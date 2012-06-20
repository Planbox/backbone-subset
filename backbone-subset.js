(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Subset = (function() {

    __extends(Subset, Backbone.View);

    function Subset() {
      Subset.__super__.constructor.apply(this, arguments);
    }

    Subset.prototype.initialize = function(options) {
      options || (options = {});
      this.source = options.source || new Backbone.Collection;
      this.collection = new options.source.constructor;
      this.filters = new Subset.Filters(options.filters);
      this.source.on('reset', this.filterAll, this);
      this.source.on('add', this.modelAdded, this);
      this.source.on('remove', this.modelRemoved, this);
      this.source.on('change', this.modelChanged, this);
      this.filters.on('all', this.filterAll, this);
      return this.filterAll();
    };

    Subset.prototype.filterAll = function() {
      this.collection.reset(this.query());
      return this;
    };

    Subset.prototype.modelAdded = function(model) {
      if (this.filters.match(model)) return this.collection.add(model);
    };

    Subset.prototype.modelRemoved = function(model) {
      return this.collection.remove(model);
    };

    Subset.prototype.modelChanged = function(model) {
      if (this.filters.match(model)) {
        return this.collection.add(model);
      } else {
        return this.collection.remove(model);
      }
    };

    Subset.prototype.query = function() {
      return this.source.filter(this.filters.match);
    };

    return Subset;

  })();

  this.Subset.Filter = (function() {

    __extends(Filter, Backbone.Model);

    function Filter() {
      Filter.__super__.constructor.apply(this, arguments);
    }

    Filter.prototype.defaults = {
      'operator': '=='
    };

    Filter.prototype.buildMatcher = function() {
      return this["match_" + (this.get('operator'))](this.get('attribute'), this.get('value'));
    };

    Filter.prototype['match_=='] = function(attribute, value) {
      return function(model) {
        return model.get(attribute) == value;
      };
    };

    Filter.prototype['match_==='] = function(attribute, value) {
      return function(model) {
        return model.get(attribute) === value;
      };
    };

    return Filter;

  })();

  this.Subset.Filters = (function() {

    __extends(Filters, Backbone.Collection);

    function Filters() {
      this.match = __bind(this.match, this);
      Filters.__super__.constructor.apply(this, arguments);
    }

    Filters.prototype.model = Subset.Filter;

    Filters.prototype.initialize = function() {
      return this.on('all', this.clearCache, this);
    };

    Filters.prototype.matchers = function() {
      return this._matchers || (this._matchers = this.buildMatchers());
    };

    Filters.prototype.buildMatchers = function() {
      return this.map(function(filter) {
        return filter.buildMatcher();
      });
    };

    Filters.prototype.clearCache = function() {
      return this._matchers = null;
    };

    Filters.prototype.match = function(model) {
      var matcher, _i, _len, _ref;
      _ref = this.matchers();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        matcher = _ref[_i];
        if (!matcher(model)) return false;
      }
      return true;
    };

    return Filters;

  })();

}).call(this);
