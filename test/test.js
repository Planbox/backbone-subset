(function() {
  var Books;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Books = (function() {

    __extends(Books, Backbone.Collection);

    function Books() {
      Books.__super__.constructor.apply(this, arguments);
    }

    return Books;

  })();

  describe('Subset', function() {
    var books, ender, h2g2, homecoming, orsonBooks, shadow;
    h2g2 = {
      name: "The Hitchhiker's Guide to the Galaxy",
      author: 'Douglas Adams',
      categories: ['scify', 'humour']
    };
    ender = {
      name: "Ender's Game",
      author: 'Orson Scott Card',
      categories: ['scify']
    };
    homecoming = {
      name: "Homecoming Saga",
      author: 'Orson Scott Card',
      categories: ['scify']
    };
    shadow = {
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
      return expect(orsonBooks.length).toBe(2);
    });
    it('should refresh if a criteria is added', function() {
      expect(orsonBooks.length).toBe(2);
      orsonBooks.filters.add({
        attribute: 'name',
        value: "Ender's Game"
      });
      return expect(orsonBooks.length).toBe(1);
    });
    it('should refresh if a criteria is changed', function() {
      expect(orsonBooks.length).toBe(2);
      orsonBooks.filters.first().set({
        value: "Douglas Adams"
      });
      return expect(orsonBooks.length).toBe(1);
    });
    it('should handle newly added items', function() {
      expect(orsonBooks.length).toBe(2);
      books.add(shadow);
      return expect(orsonBooks.length).toBe(3);
    });
    return it('should not filter anything is the filter collection is empty', function() {
      expect(orsonBooks.length).toBe(2);
      orsonBooks.filters.reset();
      return expect(orsonBooks.length).toBe(3);
    });
  });

}).call(this);
