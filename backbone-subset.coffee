class @Subset extends Backbone.View

  initialize: (options) ->
    options || (options = {})
    @source = options.source || new Backbone.Collection
    @collection = new options.source.constructor
    @filters = new Subset.Filters(options.filters)
    @source.on('reset', @filterAll, @)
    @source.on('add', @modelAdded, @)
    @source.on('remove', @modelRemoved, @)
    @source.on('change', @modelChanged, @)
    @filters.on('all', @filterAll, @)
    @filterAll()

  filterAll: ->
    @collection.reset(@query())
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
    @source.filter(@filters.match)

class @Subset.Filter extends Backbone.Model
  defaults: 
    'operator': '=='

  buildMatcher: ->
    @["match_#{@get('operator')}"](@get('attribute'), @get('value'))

  'match_==': (attribute, value) ->
    (model) -> `model.get(attribute) == value`

  'match_===': (attribute, value) ->
    (model) -> model.get(attribute) == value

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