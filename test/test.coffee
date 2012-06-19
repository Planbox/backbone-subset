class Books extends Backbone.Collection

describe 'Subset', ->
  h2g2 =
    name: "The Hitchhiker's Guide to the Galaxy"
    author: 'Douglas Adams'
    categories: ['scify', 'humour']
  ender =
    name: "Ender's Game"
    author: 'Orson Scott Card'
    categories: ['scify']
  homecoming = 
    name: "Homecoming Saga"
    author: 'Orson Scott Card'
    categories: ['scify']
  shadow =
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
    expect(orsonBooks.length).toBe(2)

  it 'should refresh if a criteria is added', ->
    expect(orsonBooks.length).toBe(2)
    orsonBooks.filters.add(attribute: 'name', value: "Ender's Game")
    expect(orsonBooks.length).toBe(1)

  it 'should refresh if a criteria is changed', ->
    expect(orsonBooks.length).toBe(2)
    orsonBooks.filters.first().set(value: "Douglas Adams")
    expect(orsonBooks.length).toBe(1)

  it 'should handle newly added items', ->
    expect(orsonBooks.length).toBe(2)
    books.add shadow
    expect(orsonBooks.length).toBe(3)

  it 'should not filter anything is the filter collection is empty', ->
    expect(orsonBooks.length).toBe(2)
    orsonBooks.filters.reset()
    expect(orsonBooks.length).toBe(3)
