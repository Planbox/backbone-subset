class @Subset extends Backbone.Collection

  constructor: (args...) ->
    super(args...)
    @filterAll()

  initialize: (options) ->
    options || (options = {})
    @source = options.source
    @filters = new Subset.Filters(options.filters)
    @source.on('reset', @filterAll, @)
    @source.on('add', @modelAdded, @)
    @source.on('remove', @modelRemoved, @)
    @source.on('change', @modelChanged, @)
    @filters.on('all', @filterAll, @)

  filterAll: ->
    @reset(@query())
    @

  modelAdded: (model) ->
    @add model if @filters.match model

  modelRemoved: (model) ->
    @remove model

  modelChanged: (model) ->
    if @filters.match model
      @add model
    else
      @remove model

  query: ->
    @source.filter(@filters.match)

class @Subset.Filter extends Backbone.Model
  defaults: 
    'operator': '=='

  buildMatcher: ->
    @["match_#{@get('operator')}"](@get('attribute'), @get('value'))

  'match_==': (attribute, value) ->
    (model) ->
      model.get(attribute) == value

class @Subset.Filters extends Backbone.Collection
  model: Subset.Filter

  matchers: ->
    @map (filter) -> filter.buildMatcher()

  match: (model) =>
    for matcher in @matchers()
      return false unless matcher(model)
    true