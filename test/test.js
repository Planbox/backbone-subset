(function() {
  var Book, Books;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Book = (function() {

    __extends(Book, Backbone.Model);

    function Book() {
      Book.__super__.constructor.apply(this, arguments);
    }

    return Book;

  })();

  Books = (function() {

    __extends(Books, Backbone.Collection);

    function Books() {
      Books.__super__.constructor.apply(this, arguments);
    }

    Books.prototype.model = Book;

    return Books;

  })();

  describe('Subset', function() {
    var books, ender, h2g2, homecoming, orsonBooks, shadow;
    h2g2 = {
      id: 42,
      name: "The Hitchhiker's Guide to the Galaxy",
      author: 'Douglas Adams',
      categories: ['scify', 'humour']
    };
    ender = {
      id: 512,
      name: "Ender's Game",
      author: 'Orson Scott Card',
      categories: ['scify']
    };
    homecoming = {
      id: 1337,
      name: "Homecoming Saga",
      author: 'Orson Scott Card',
      categories: ['scify']
    };
    shadow = {
      id: 65536,
      name: "Shadow Saga",
      author: 'Orson Scott Card',
      categories: ['scify']
    };
    orsonBooks = books = null;
    beforeEach(function() {
      books = new Books([h2g2, ender, homecoming]);
      return orsonBooks = new Subset({
        source: books,
        filters: [
          {
            attribute: 'author',
            value: 'Orson Scott Card'
          }
        ]
      });
    });
    it('should filter models', function() {
      return expect(orsonBooks.collection.length).toBe(2);
    });
    it('should refresh if a criteria is added', function() {
      expect(orsonBooks.collection.length).toBe(2);
      orsonBooks.filters.add({
        attribute: 'name',
        value: "Ender's Game"
      });
      return expect(orsonBooks.collection.length).toBe(1);
    });
    it('should refresh if a criteria is changed', function() {
      expect(orsonBooks.collection.length).toBe(2);
      orsonBooks.filters.first().set({
        value: "Douglas Adams"
      });
      return expect(orsonBooks.collection.length).toBe(1);
    });
    it('should handle newly added items', function() {
      expect(orsonBooks.collection.length).toBe(2);
      books.add(shadow);
      return expect(orsonBooks.collection.length).toBe(3);
    });
    it('should not filter anything is the filter collection is empty', function() {
      expect(orsonBooks.collection.length).toBe(2);
      orsonBooks.filters.reset();
      return expect(orsonBooks.collection.length).toBe(3);
    });
    return describe('operators', function() {
      var book;
      book = new Book(h2g2);
      it('should coerce by default', function() {
        var filter;
        filter = new Subset.Filter({
          attribute: 'id',
          value: '42'
        });
        return expect(filter.match(book)).toBe(true);
      });
      it('should allow === operator', function() {
        var filter;
        filter = new Subset.Filter({
          attribute: 'id',
          value: '42',
          operator: '==='
        });
        expect(filter.match(book)).toBe(false);
        filter = new Subset.Filter({
          attribute: 'id',
          value: 42,
          operator: '==='
        });
        return expect(filter.match(book)).toBe(true);
      });
      it('should allow `in` operator', function() {
        var filter;
        filter = new Subset.Filter({
          attribute: 'id',
          value: [41, 43],
          operator: 'in'
        });
        expect(filter.match(book)).toBe(false);
        filter = new Subset.Filter({
          attribute: 'id',
          value: [41, 42, 43],
          operator: 'in'
        });
        return expect(filter.match(book)).toBe(true);
      });
      it('should allow `any` operator', function() {
        var filter;
        filter = new Subset.Filter({
          attribute: 'categories',
          value: ['scify', 'romance'],
          operator: 'any'
        });
        expect(filter.match(book)).toBe(true);
        filter = new Subset.Filter({
          attribute: 'categories',
          value: ['fantasy', 'romance'],
          operator: 'any'
        });
        return expect(filter.match(book)).toBe(false);
      });
      return it('should allow `any` operator', function() {
        var filter;
        filter = new Subset.Filter({
          attribute: 'categories',
          value: ['scify', 'humour'],
          operator: 'all'
        });
        expect(filter.match(book)).toBe(true);
        filter = new Subset.Filter({
          attribute: 'categories',
          value: ['scify'],
          operator: 'all'
        });
        expect(filter.match(book)).toBe(true);
        filter = new Subset.Filter({
          attribute: 'categories',
          value: ['scify', 'romance'],
          operator: 'all'
        });
        return expect(filter.match(book)).toBe(false);
      });
    });
  });

}).call(this);
