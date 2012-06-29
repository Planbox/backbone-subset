class @Subset extends Backbone.View

  initialize: (options) ->
    options || (options = {})
    @source = options.source || new Backbone.Collection
    @collection or= new options.source.constructor
    @filters = new Subset.Filters(options.filters)
    @source.on('reset', @filterAll, @)
    @source.on('add', @modelAdded, @)
    @source.on('remove', @modelRemoved, @)
    @source.on('change', @modelChanged, @)
    @filters.on('all', @filterAll, @)
    @filterAll()

  filterAll: (eventName) ->
    # Avoid reseting twice because "change" and "change:<attribute>" are both catched by "all" 
    @collection.reset(@query()) unless eventName == 'change'
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