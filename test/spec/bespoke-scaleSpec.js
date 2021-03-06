Function.prototype.bind = Function.prototype.bind || require('function-bind');

var bespoke = require('bespoke');
var scale = require('../../lib-instrumented/bespoke-scale.js');

describe("bespoke-scale", function() {

  var container, deck,

    createDeck = function(width, height, pluginValue) {
      var style = document.createElement('style'),
        parent = document.createElement('article');

      container = document.createElement('div');

      style.innerText =
        '.bespoke-parent { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }' +
        '.bespoke-scale-parent { position: absolute; left: 50%; top: 50%; width: ' + width + 'px; height: ' + height + 'px; margin-left: -' + (width/2) + 'px; margin-top: -' + (height/2) + 'px; }' +
        '.bespoke-slide { position: absolute; left: 50%; top: 50%; width: 100px; height: 100px; margin-left: -50px; margin-top: -50px; }';

      for (var i = 0; i < 10; i++) {
        parent.appendChild(document.createElement('section'));
      }

      container.appendChild(style);
      container.appendChild(parent);
      document.body.appendChild(container);

      deck = bespoke.from(parent, [
        scale(pluginValue)
      ]);
    },

    destroyDeck = function() {
      document.body.removeChild(container);
    },

    resize = function(el, width, height) {
      el.style.width = width + 'px';
      el.style.height = height + 'px';

      var evt = document.createEvent('UIEvents');
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    },

    transformProperty = (function(property) {
      var prefixes = 'Moz Webkit O ms'.split(' ');
      return prefixes.reduce(function(currentProperty, prefix) {
          return prefix + property in document.createElement('div').style ? prefix + property : currentProperty;
        }, property.toLowerCase());
    }('Transform')),

    actualSize = function(el, dimension) {
      return el['offset' + (dimension === 'width' ? 'Width' : 'Height')] *
        (el.parentNode.style.zoom != null && el.parentNode.style.zoom !== '' ?
          el.parentNode.style.zoom :
          el.parentNode.style[transformProperty].match(/scale\(([0-9.]+)\)/)[1]
        );
    };

    [undefined, 'zoom', 'transform'].forEach(function (option) {

      describe("option value of '" + option + "'", function () {

        describe("loading a 4x3 pressentation", function () {

          beforeEach(createDeck.bind(null, 1024, 768, option));

          if (option === 'transform') {
            it("should wrap each of the slides in a 'bespoke-scale-parent'", function () {
              deck.slides.forEach(function (slide) {
                expect(slide.parentNode.className).toBe('bespoke-scale-parent');
              });
            });
          }

          it("should resize the slide to fit the height of the deck", function () {
            expect(actualSize(deck.slides[0], 'height')).toBe(deck.parent.offsetHeight);
          });

          describe("resizing the window to a 3x4 ratio", function () {

            beforeEach(function () {
              resize(deck.parent, 768, 1024, option)
            });

            it("should resize the slide to fit the width of the deck", function () {
              expect(actualSize(deck.slides[0], 'width')).toBe(deck.parent.offsetWidth);
            });

          });

        });

        describe("loading a 16x9 pressentation", function () {

          beforeEach(createDeck.bind(null, 1280, 720, option));

          it("should resize the slide to fit the height of the deck", function () {
            expect(actualSize(deck.slides[0], 'height')).toBe(deck.parent.offsetHeight);
          });

        });

        describe("loading a 3x4 pressentation", function () {

          beforeEach(createDeck.bind(null, 480, 640, option));

          it("should resize the slide to fit the width of the deck", function () {
            expect(actualSize(deck.slides[0], 'width')).toBe(deck.parent.offsetWidth);
          });

        });

      });

    });
});
