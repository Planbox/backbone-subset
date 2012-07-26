(function() {
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Subset = (function() {

    function Subset(options) {
      if (options == null) options = {};
      this.intermediateCollections = {};
      this.source = options.source || new Backbone.Collection;
      this.collection = options.collection || new options.source.constructor;
      this.filters = new Subset.Filters(options.filters);
      this.source.on('reset', this.filterAll, this);
      this.source.on('add', this.modelAdded, this);
      this.source.on('remove', this.modelRemoved, this);
      this.source.on('change', this.modelChanged, this);
      this.filters.on('all', this.filterAll, this);
      this.filterAll();
    }

    Subset.prototype.filterAll = function(eventName) {
      var oldCache, previous;
      var _this = this;
      if (eventName === 'change') return this;
      oldCache = this.intermediateCollections;
      this.intermediateCollections = {};
      previous = this.source;
      this.filters.each(function(filter, index) {
        var intermediate;
        intermediate = _this.intermediateCollections[filter.cid] = oldCache[filter.cid] || new _this.collection.constructor;
        intermediate.reset(filter.select(previous));
        return previous = intermediate;
      });
      this.collection.reset(previous.models);
      return this;
    };

    Subset.prototype.after = function(filter) {
      return this.intermediateCollections[filter.cid] || this.collection;
    };

    Subset.prototype.before = function(filter) {
      var index, _ref;
      index = this.filters.indexOf(filter);
      if (index === 0) return this.source;
      return this.intermediateCollections[(_ref = this.filters.at(index - 1)) != null ? _ref.cid : void 0] || this.collection;
    };

    Subset.prototype.modelAdded = function(model) {
      if (this.filters.match(model)) return this.collection.add(model);
    };

    Subset.prototype.modelRemoved = function(model) {
      return this.collection.remove(model);
    };

    Subset.prototype.modelChanged = function(model) {
      if (this.source.get(model.id) && this.filters.match(model)) {
        return this.collection.add(model);
      } else {
        return this.collection.remove(model);
      }
    };

    Subset.prototype.query = function() {
      return _.filter(this.source.models, this.filters.match);
    };

    Subset.prototype.match = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.filters).match.apply(_ref, args);
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

    Filter.prototype.match = function(model) {
      return this.buildMatcher()(model);
    };

    Filter.prototype.select = function(collection) {
      return _.filter(collection.models, this.buildMatcher());
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

    Filter.prototype.match_in = function(attribute, value) {
      return function(model) {
        return _(value).include(model.get(attribute));
      };
    };

    Filter.prototype.match_any = function(attribute, value) {
      return function(model) {
        return _.intersection(model.get(attribute), value).length > 0;
      };
    };

    Filter.prototype.match_all = function(attribute, value) {
      return function(model) {
        return _.intersection(model.get(attribute), value).length === value.length;
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

  this.Union = (function() {

    function Union(options) {
      var source, _i, _len, _ref;
      this.collection = options.collection || new Backbone.Collection();
      this.sources = options.sources;
      _ref = this.sources;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        source = _ref[_i];
        source.on('add', this.collection.add, this.collection);
        source.on('remove', this.removeItem, this);
        source.on('reset', this.reset, this);
      }
      this.reset();
    }

    Union.prototype.removeItem = function(model) {
      if (!_(this.sources).any(function(source) {
        return source.get(model.id);
      })) {
        return this.collection.remove(model);
      }
    };

    Union.prototype.reset = function() {
      return this.collection.reset(_.flatten(this.sources.map(function(s) {
        return s.toArray();
      })));
    };

    return Union;

  })();

}).call(this);
