class @Subset

  constructor: (options={}) ->
    @source = options.source or new Backbone.Collection
    @collection = options.collection or new options.source.constructor
    @filters = new Subset.Filters(options.filters)
    @source.on('reset', @filterAll, @)
    @source.on('add', @modelAdded, @)
    @source.on('remove', @modelRemoved, @)
    @source.on('change', @modelChanged, @)
    @filters.on('all', @filterAll, @)
    @filterAll()

  filterAll: (eventName) ->
    # Avoid reseting twice because "change" and "change:<attribute>" are both catched by "all" 
    unless eventName == 'change'
      @collection.reset(@query())
      @collection.add(@union.toArray()) if @union
    @

  modelAdded: (model) ->
    @collection.add model if @filters.match model

  modelRemoved: (model) ->
    @collection.remove model

  modelChanged: (model) ->
    if @filters.match model
      @collection.add model
    else
      @collection.remove model

  query: ->
    _.filter(@source.models, @filters.match)

  match: (args...) ->
    @filters.match args...

class @Subset.Filter extends Backbone.Model
  defaults: 
    'operator': '=='

  match: (model)->
    @buildMatcher()(model)

  buildMatcher: ->
    @["match_#{@get('operator')}"](@get('attribute'), @get('value'))

  'match_==': (attribute, value) ->
    (model) -> `model.get(attribute) == value`

  'match_===': (attribute, value) ->
    (model) -> model.get(attribute) == value

  match_in: (attribute, value) ->
    (model) -> _(value).include(model.get(attribute))

  match_any: (attribute, value) ->
    (model) -> _.intersection(model.get(attribute), value).length > 0

  match_all: (attribute, value) ->
    (model) -> _.intersection(model.get(attribute), value).length is value.length

class @Subset.Filters extends Backbone.Collection
  model: Subset.Filter

  initialize: () ->
    @on('all', @clearCache, @)

  matchers: ->
    @_matchers or= @buildMatchers()

  buildMatchers: ->
    @map((filter) -> filter.buildMatcher())

  clearCache: ->
    @_matchers = null

  match: (model) =>
    for matcher in @matchers()
      return false unless matcher(model)
    true

class @Union

  constructor: (options) ->
    @collection = options.collection or new Backbone.Collection()
    @sources = options.sources

    for source in @sources
      source.on('add', @collection.add, @collection)
      source.on('remove', @removeItem, @)
      source.on('reset', @reset, @) # TODO: can probably be optimized
    @reset()

  removeItem: (model) ->
    @collection.remove(model) unless _(@sources).any((source) -> source.get(model.id))

  reset: ->
    @collection.reset _.flatten(@sources.map((s) -> s.toArray()))

