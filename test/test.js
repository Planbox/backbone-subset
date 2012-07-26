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
    var authorFilter, books, booksSelection, categoryFilter, ender, guardsGuards, h2g2, homecoming, menAtArms, menAtArmsBook, orsonBooks, shadow, terryBooks;
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
    menAtArms = {
      id: 72,
      name: "Men at Arms",
      author: "Terry Pratchett",
      categories: ['fantasy', 'humour']
    };
    guardsGuards = {
      id: 75,
      name: "Guards! Guards!",
      author: "Terry Pratchett",
      categories: ['fantasy', 'humour']
    };
    orsonBooks = books = booksSelection = terryBooks = menAtArmsBook = null;
    authorFilter = categoryFilter = null;
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
    describe('intermediate collections', function() {
      beforeEach(function() {
        books = new Books([h2g2, ender, homecoming, shadow, menAtArms, guardsGuards]);
        authorFilter = new Subset.Filter({
          attribute: 'author',
          value: 'Douglas Adams'
        });
        categoryFilter = new Subset.Filter({
          attribute: 'categories',
          value: ['humour'],
          operator: 'any'
        });
        return booksSelection = new Subset({
          source: books,
          filters: [categoryFilter, authorFilter]
        });
      });
      it('allow to access intermediate results', function() {
        expect(booksSelection.collection.length).toBe(1);
        expect(booksSelection.after(authorFilter).length).toBe(1);
        return expect(booksSelection.after(categoryFilter).length).toBe(3);
      });
      return it('allow to access query state before the filter', function() {
        expect(booksSelection.collection.length).toBe(1);
        expect(booksSelection.before(authorFilter).length).toBe(3);
        return expect(booksSelection.before(categoryFilter).length).toBe(6);
      });
    });
    describe('union', function() {
      beforeEach(function() {
        menAtArmsBook = new Book(menAtArms);
        terryBooks = new Books([menAtArmsBook]);
        return booksSelection = new Union({
          collection: new Books,
          sources: [orsonBooks.collection, terryBooks]
        });
      });
      it('should contain books from unified collection', function() {
        return expect(booksSelection.collection.contains(menAtArmsBook)).toBe(true);
      });
      it('should however not consider them as selected', function() {
        return expect(orsonBooks.filters.match(menAtArmsBook)).toBe(false);
      });
      it('should propagate unified collection removals', function() {
        expect(booksSelection.collection.length).toBe(3);
        terryBooks.remove(menAtArmsBook);
        return expect(booksSelection.collection.length).toBe(2);
      });
      it('should propagate unified collection insertions', function() {
        expect(booksSelection.collection.length).toBe(3);
        terryBooks.add(guardsGuards);
        return expect(booksSelection.collection.length).toBe(4);
      });
      it('should not propagate unified collection removals if the same model is also selected throught the source collection', function() {
        var orsonBook;
        orsonBook = orsonBooks.collection.first();
        expect(booksSelection.collection.length).toBe(3);
        terryBooks.add(orsonBook);
        expect(booksSelection.collection.length).toBe(3);
        terryBooks.remove(orsonBook);
        return expect(booksSelection.collection.length).toBe(3);
      });
      return it('should propagate resets', function() {
        expect(booksSelection.collection.length).toBe(3);
        terryBooks.reset();
        return expect(booksSelection.collection.length).toBe(2);
      });
    });
    describe('triggered events', function() {
      var eventsCount;
      eventsCount = 0;
      beforeEach(function() {
        return eventsCount = 0;
      });
      it('should trigger only one reset when adding a filter', function() {
        orsonBooks.collection.on('reset', function() {
          return eventsCount += 1;
        });
        orsonBooks.filters.add({
          attribute: 'name',
          value: ender.name
        });
        return expect(eventsCount).toEqual(1);
      });
      return it('should trigger only one reset when editing a filter', function() {
        orsonBooks.filters.add({
          attribute: 'name',
          value: ender.name
        });
        orsonBooks.collection.on('reset', function() {
          return eventsCount += 1;
        });
        orsonBooks.filters.first().set({
          value: h2g2.name
        });
        return expect(eventsCount).toEqual(1);
      });
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
