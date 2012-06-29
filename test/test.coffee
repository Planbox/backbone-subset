class Book extends Backbone.Model

class Books extends Backbone.Collection
  model: Book

describe 'Subset', ->
  h2g2 =
    id: 42
    name: "The Hitchhiker's Guide to the Galaxy"
    author: 'Douglas Adams'
    categories: ['scify', 'humour']
  ender =
    id: 512
    name: "Ender's Game"
    author: 'Orson Scott Card'
    categories: ['scify']
  homecoming = 
    id: 1337
    name: "Homecoming Saga"
    author: 'Orson Scott Card'
    categories: ['scify']
  shadow =
    id: 65536
    name: "Shadow Saga"
    author: 'Orson Scott Card'
    categories: ['scify']

  orsonBooks = books = null

  beforeEach ->
    books = new Books([h2g2, ender, homecoming])
    orsonBooks = new Subset(source: books, filters: [
      {attribute: 'author', value: 'Orson Scott Card'}
    ])

  it 'should filter models', ->
    expect(orsonBooks.collection.length).toBe(2)

  it 'should refresh if a criteria is added', ->
    expect(orsonBooks.collection.length).toBe(2)
    orsonBooks.filters.add(attribute: 'name', value: "Ender's Game")
    expect(orsonBooks.collection.length).toBe(1)

  it 'should refresh if a criteria is changed', ->
    expect(orsonBooks.collection.length).toBe(2)
    orsonBooks.filters.first().set(value: "Douglas Adams")
    expect(orsonBooks.collection.length).toBe(1)

  it 'should handle newly added items', ->
    expect(orsonBooks.collection.length).toBe(2)
    books.add shadow
    expect(orsonBooks.collection.length).toBe(3)

  it 'should not filter anything is the filter collection is empty', ->
    expect(orsonBooks.collection.length).toBe(2)
    orsonBooks.filters.reset()
    expect(orsonBooks.collection.length).toBe(3)

  describe 'triggered events', ->
    eventsCount = 0

    beforeEach ->
      eventsCount = 0

    it 'should trigger only one reset when adding a filter', ->
      orsonBooks.collection.on 'reset', -> eventsCount += 1
      orsonBooks.filters.add(attribute: 'name', value: ender.name)
      expect(eventsCount).toEqual 1

    it 'should trigger only one reset when editing a filter', ->
      orsonBooks.filters.add(attribute: 'name', value: ender.name)
      orsonBooks.collection.on 'reset', -> eventsCount += 1
      orsonBooks.filters.first().set(value: h2g2.name)
      expect(eventsCount).toEqual 1

  describe 'operators', ->
    book = new Book(h2g2)

    it 'should coerce by default', ->
      filter = new Subset.Filter(attribute: 'id', value: '42')
      expect(filter.match(book)).toBe true

    it 'should allow === operator', ->
      filter = new Subset.Filter(attribute: 'id', value: '42', operator: '===')
      expect(filter.match(book)).toBe false

      filter = new Subset.Filter(attribute: 'id', value: 42, operator: '===')
      expect(filter.match(book)).toBe true

    it 'should allow `in` operator', ->
      filter = new Subset.Filter(attribute: 'id', value: [41, 43], operator: 'in')
      expect(filter.match(book)).toBe false

      filter = new Subset.Filter(attribute: 'id', value: [41, 42, 43], operator: 'in')
      expect(filter.match(book)).toBe true

    it 'should allow `any` operator', ->
      filter = new Subset.Filter(attribute: 'categories', value: ['scify', 'romance'], operator: 'any')
      expect(filter.match(book)).toBe true

      filter = new Subset.Filter(attribute: 'categories', value: ['fantasy', 'romance'], operator: 'any')
      expect(filter.match(book)).toBe false

    it 'should allow `any` operator', ->
      filter = new Subset.Filter(attribute: 'categories', value: ['scify', 'humour'], operator: 'all')
      expect(filter.match(book)).toBe true

      filter = new Subset.Filter(attribute: 'categories', value: ['scify'], operator: 'all')
      expect(filter.match(book)).toBe true

      filter = new Subset.Filter(attribute: 'categories', value: ['scify', 'romance'], operator: 'all')
      expect(filter.match(book)).toBe false

