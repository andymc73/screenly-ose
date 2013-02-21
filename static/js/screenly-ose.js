// Generated by CoffeeScript 1.4.0

/* screenly-ose ui
*/


(function() {
  var API, App, Asset, AssetRowView, Assets, AssetsView, EditAssetView, date_to, default_duration, delay, get_mimetype, get_template, mimetypes, now, y2ts, years_from_now,
    _this = this,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  API = (window.Screenly || (window.Screenly = {}));

  API.date_to = date_to = {
    iso: function(d) {
      return (new Date(d)).toISOString();
    },
    string: function(d) {
      return (moment(new Date(d))).format("MM/DD/YYYY hh:mm:ss A");
    },
    date: function(d) {
      return (new Date(d)).toLocaleDateString();
    },
    time: function(d) {
      return (new Date(d)).toLocaleTimeString();
    },
    timestamp: function(d) {
      return (new Date(d)).getTime();
    }
  };

  now = function() {
    return new Date();
  };

  y2ts = function(years) {
    return years * 365 * 24 * 60 * 60000;
  };

  years_from_now = function(years) {
    return new Date((y2ts(years)) + date_to.timestamp(now()));
  };

  get_template = function(name) {
    return _.template(($("#" + name + "-template")).html());
  };

  delay = function(wait, fn) {
    return _.delay(fn, wait);
  };

  mimetypes = [['jpg jpeg png pnm gif bmp'.split(' '), 'image'], ['avi mkv mov mpg mpeg mp4 ts flv'.split(' '), 'video']];

  get_mimetype = function(filename) {
    var ext, mt;
    ext = (_.last(filename.split('.'))).toLowerCase();
    mt = _.find(mimetypes, function(mt) {
      return __indexOf.call(mt[0], ext) >= 0;
    });
    if (mt) {
      return mt[1];
    } else {
      return null;
    }
  };

  default_duration = 10;

  Backbone.emulateJSON = true;

  API.Asset = Asset = (function(_super) {

    __extends(Asset, _super);

    function Asset() {
      this.defaults = __bind(this.defaults, this);
      return Asset.__super__.constructor.apply(this, arguments);
    }

    Asset.prototype.idAttribute = "asset_id";

    Asset.prototype.fields = 'name mimetype uri start_date end_date duration'.split(' ');

    Asset.prototype.defaults = function() {
      return {
        name: '',
        mimetype: 'webpage',
        uri: '',
        start_date: now(),
        end_date: now(),
        duration: default_duration
      };
    };

    return Asset;

  })(Backbone.Model);

  API.Assets = Assets = (function(_super) {

    __extends(Assets, _super);

    function Assets() {
      return Assets.__super__.constructor.apply(this, arguments);
    }

    Assets.prototype.url = "/api/assets";

    Assets.prototype.model = Asset;

    return Assets;

  })(Backbone.Collection);

  EditAssetView = (function(_super) {

    __extends(EditAssetView, _super);

    function EditAssetView() {
      this.updateMimetype = __bind(this.updateMimetype, this);

      this.updateFileUploadMimetype = __bind(this.updateFileUploadMimetype, this);

      this.updateUriMimetype = __bind(this.updateUriMimetype, this);

      this.clickTabNavUpload = __bind(this.clickTabNavUpload, this);

      this.clickTabNavUri = __bind(this.clickTabNavUri, this);

      this.cancel = __bind(this.cancel, this);

      this.change = __bind(this.change, this);

      this.save = __bind(this.save, this);

      this.viewmodel = __bind(this.viewmodel, this);

      this.render = __bind(this.render, this);

      this.initialize = __bind(this.initialize, this);

      this.$fv = __bind(this.$fv, this);

      this.$f = __bind(this.$f, this);
      return EditAssetView.__super__.constructor.apply(this, arguments);
    }

    EditAssetView.prototype.$f = function(field) {
      return this.$("[name='" + field + "']");
    };

    EditAssetView.prototype.$fv = function() {
      var field, val, _ref;
      field = arguments[0], val = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return (_ref = this.$f(field)).val.apply(_ref, val);
    };

    EditAssetView.prototype.initialize = function(options) {
      ($('body')).append(this.$el.html(get_template('asset-modal')));
      (this.$('input.time')).timepicker({
        minuteStep: 5,
        showInputs: true,
        disableFocus: true,
        showMeridian: true
      });
      (this.$('.modal-header .close')).remove();
      (this.$el.children(":first")).modal();
      this.model.bind('change', this.render);
      return this.render();
    };

    EditAssetView.prototype.render = function() {
      var date, f, field, which, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      this.undelegateEvents();
      if (!this.model.isNew()) {
        _ref = 'mimetype uri file_upload'.split(' ');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          f = _ref[_i];
          (this.$(f)).attr('disabled', true);
        }
        (this.$('#modalLabel')).text("Edit Asset");
        (this.$('.asset-location')).hide();
        (this.$('.asset-location.edit')).show();
      }
      (this.$('.duration')).toggle((this.model.get('mimetype')) !== 'video');
      if ((this.model.get('mimetype')) === 'webpage') {
        this.clickTabNavUri();
      }
      _ref1 = this.model.fields;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        field = _ref1[_j];
        if (field !== 'uri') {
          if ((this.$fv(field)) !== this.model.get(field)) {
            this.$fv(field, this.model.get(field));
          }
        }
      }
      (this.$('.uri-text')).html(this.model.get('uri'));
      _ref2 = ['start', 'end'];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        which = _ref2[_k];
        date = this.model.get("" + which + "_date");
        this.$fv("" + which + "_date_date", date_to.date(date));
        (this.$f("" + which + "_date_date")).datepicker({
          autoclose: true
        });
        (this.$f("" + which + "_date_date")).datepicker('setValue', date_to.date(date));
        this.$fv("" + which + "_date_time", date_to.time(date));
      }
      this.delegateEvents();
      return false;
    };

    EditAssetView.prototype.viewmodel = function() {
      var field, which, _i, _j, _len, _len1, _ref, _ref1, _results,
        _this = this;
      _ref = ['start', 'end'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        which = _ref[_i];
        this.$fv("" + which + "_date", date_to.iso((function() {
          return (_this.$fv("" + which + "_date_date")) + " " + (_this.$fv("" + which + "_date_time"));
        })()));
      }
      _ref1 = this.model.fields;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        field = _ref1[_j];
        if (!(this.$f(field)).prop('disabled')) {
          _results.push(this.model.set(field, this.$fv(field), {
            silent: true
          }));
        }
      }
      return _results;
    };

    EditAssetView.prototype.events = {
      'submit form': 'save',
      'click .cancel': 'cancel',
      'change': 'change',
      'keyup': 'change',
      'click .tabnav-uri': 'clickTabNavUri',
      'click .tabnav-file_upload': 'clickTabNavUpload',
      'paste [name=uri]': 'updateUriMimetype',
      'change [name=file_upload]': 'updateFileUploadMimetype'
    };

    EditAssetView.prototype.save = function(e) {
      var isNew, save,
        _this = this;
      e.preventDefault();
      this.viewmodel();
      isNew = this.model.isNew();
      save = null;
      if ((this.$('#tab-file_upload')).hasClass('active')) {
        (this.$('.progress')).show();
        this.$el.fileupload({
          url: this.model.url(),
          progressall: function(e, data) {
            if (data.loaded && data.total) {
              return (_this.$('.progress .bar')).css('width', "" + (data.loaded / data.total * 100) + "%");
            }
          }
        });
        save = this.$el.fileupload('send', {
          fileInput: this.$f('file_upload')
        });
      } else {
        save = this.model.save();
      }
      (this.$('input, select')).prop('disabled', true);
      save.done(function(data) {
        default_duration = _this.model.get('duration');
        if (!_this.model.collection) {
          _this.collection.add(_this.model);
        }
        (_this.$el.children(":first")).modal('hide');
        _.extend(_this.model.attributes, data);
        if (isNew) {
          return _this.model.collection.add(_this.model);
        }
      });
      save.fail(function() {
        (_this.$('.progress')).hide();
        return (_this.$('input, select')).prop('disabled', false);
      });
      return false;
    };

    EditAssetView.prototype.change = function(e) {
      var _this = this;
      this._change || (this._change = _.throttle((function() {
        _this.viewmodel();
        _this.model.trigger('change');
        return true;
      }), 500));
      return this._change.apply(this, arguments);
    };

    EditAssetView.prototype.cancel = function(e) {
      this.model.set(this.model.previousAttributes());
      if (this.model.isNew()) {
        this.model.destroy();
      }
      return (this.$el.children(":first")).modal('hide');
    };

    EditAssetView.prototype.clickTabNavUri = function(e) {
      if (!(this.$('#tab-uri')).hasClass('active')) {
        (this.$('ul.nav-tabs li')).removeClass('active');
        (this.$('.tab-pane')).removeClass('active');
        (this.$('.tabnav-uri')).addClass('active');
        (this.$('#tab-uri')).addClass('active');
        this.updateUriMimetype();
      }
      return false;
    };

    EditAssetView.prototype.clickTabNavUpload = function(e) {
      if (!(this.$('#tab-file_upload')).hasClass('active')) {
        (this.$('ul.nav-tabs li')).removeClass('active');
        (this.$('.tab-pane')).removeClass('active');
        (this.$('.tabnav-file_upload')).addClass('active');
        (this.$('#tab-file_upload')).addClass('active');
        if ((this.$fv('mimetype')) === 'webpage') {
          this.$fv('mimetype', 'image');
        }
      }
      this.updateFileUploadMimetype;
      return false;
    };

    EditAssetView.prototype.updateUriMimetype = function() {
      var _this = this;
      return _.defer(function() {
        return _this.updateMimetype(_this.$fv('uri'));
      });
    };

    EditAssetView.prototype.updateFileUploadMimetype = function() {
      var _this = this;
      return _.defer(function() {
        return _this.updateMimetype(_this.$fv('file_upload'));
      });
    };

    EditAssetView.prototype.updateMimetype = function(filename) {
      var mt;
      mt = get_mimetype(filename);
      if (mt) {
        return this.$fv('mimetype', mt);
      }
    };

    return EditAssetView;

  })(Backbone.View);

  AssetRowView = (function(_super) {

    __extends(AssetRowView, _super);

    function AssetRowView() {
      this.hidePopover = __bind(this.hidePopover, this);

      this.showPopover = __bind(this.showPopover, this);

      this["delete"] = __bind(this["delete"], this);

      this.edit = __bind(this.edit, this);

      this.setEnabled = __bind(this.setEnabled, this);

      this.toggleActive = __bind(this.toggleActive, this);

      this.render = __bind(this.render, this);

      this.initialize = __bind(this.initialize, this);
      return AssetRowView.__super__.constructor.apply(this, arguments);
    }

    AssetRowView.prototype.tagName = "tr";

    AssetRowView.prototype.initialize = function(options) {
      return this.template = get_template('asset-row');
    };

    AssetRowView.prototype.render = function() {
      this.$el.html(this.template(this.model.toJSON()));
      (this.$(".delete-asset-button")).popover({
        content: get_template('confirm-delete')
      });
      (this.$(".toggle input")).prop("checked", this.model.get('is_active'));
      (this.$(".asset-icon")).addClass((function() {
        switch (this.model.get("mimetype")) {
          case "video":
            return "icon-facetime-video";
          case "image":
            return "icon-picture";
          case "webpage":
            return "icon-globe";
          default:
            return "";
        }
      }).call(this));
      return this.el;
    };

    AssetRowView.prototype.events = {
      'change .activation-toggle input': 'toggleActive',
      'click .edit-asset-button': 'edit',
      'click .delete-asset-button': 'showPopover'
    };

    AssetRowView.prototype.toggleActive = function(e) {
      var save,
        _this = this;
      if (this.model.get('is_active')) {
        this.model.set({
          is_active: false,
          end_date: date_to.iso(now())
        });
      } else {
        this.model.set({
          is_active: true,
          start_date: date_to.iso(now()),
          end_date: date_to.iso(years_from_now(10))
        });
      }
      this.setEnabled(false);
      save = this.model.save();
      delay(300, function() {
        save.done(function() {
          _this.remove();
          return _this.model.collection.trigger('add', _([_this.model]));
        });
        return save.fail(function() {
          _this.model.set(_this.model.previousAttributes(), {
            silent: true
          });
          _this.setEnabled(true);
          return _this.render();
        });
      });
      return true;
    };

    AssetRowView.prototype.setEnabled = function(enabled) {
      if (enabled) {
        this.$el.removeClass('warning');
        this.delegateEvents();
        return (this.$('input, button')).prop('disabled', false);
      } else {
        this.hidePopover();
        this.undelegateEvents();
        this.$el.addClass('warning');
        return (this.$('input, button')).prop('disabled', true);
      }
    };

    AssetRowView.prototype.edit = function(e) {
      new EditAssetView({
        model: this.model
      });
      return false;
    };

    AssetRowView.prototype["delete"] = function(e) {
      var xhr,
        _this = this;
      this.hidePopover();
      if ((xhr = this.model.destroy()) === !false) {
        xhr.done(function() {
          return _this.remove();
        });
      } else {
        this.remove();
      }
      return false;
    };

    AssetRowView.prototype.showPopover = function() {
      if (!($('.popover')).length) {
        (this.$(".delete-asset-button")).popover('show');
        ($('.confirm-delete')).click(this["delete"]);
        ($(window)).one('click', this.hidePopover);
      }
      return false;
    };

    AssetRowView.prototype.hidePopover = function() {
      (this.$(".delete-asset-button")).popover('hide');
      return false;
    };

    return AssetRowView;

  })(Backbone.View);

  AssetsView = (function(_super) {

    __extends(AssetsView, _super);

    function AssetsView() {
      this.render = __bind(this.render, this);

      this.initialize = __bind(this.initialize, this);
      return AssetsView.__super__.constructor.apply(this, arguments);
    }

    AssetsView.prototype.initialize = function(options) {
      var event, _i, _len, _ref, _results;
      _ref = ['reset', 'add', 'sync'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        _results.push(this.collection.bind(event, this.render));
      }
      return _results;
    };

    AssetsView.prototype.render = function() {
      var which, _i, _j, _len, _len1, _ref, _ref1,
        _this = this;
      _ref = ['active', 'inactive'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        which = _ref[_i];
        (this.$("#" + which + "-assets")).html('');
      }
      this.collection.each(function(model) {
        which = model.get('is_active') ? 'active' : 'inactive';
        return (_this.$("#" + which + "-assets")).append((new AssetRowView({
          model: model
        })).render());
      });
      _ref1 = ['inactive', 'active'];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        which = _ref1[_j];
        this.$("." + which + "-table thead").toggle(!!(this.$("#" + which + "-assets tr").length));
      }
      return this.el;
    };

    return AssetsView;

  })(Backbone.View);

  API.App = App = (function(_super) {

    __extends(App, _super);

    function App() {
      this.add = __bind(this.add, this);

      this.initialize = __bind(this.initialize, this);
      return App.__super__.constructor.apply(this, arguments);
    }

    App.prototype.initialize = function() {
      var _this = this;
      ($(window)).ajaxError(function() {
        return ($('#request-error')).html((get_template('request-error'))());
      });
      (API.assets = new Assets()).fetch();
      return API.assetsView = new AssetsView({
        collection: API.assets,
        el: this.$('#assets')
      });
    };

    App.prototype.events = {
      'click #add-asset-button': 'add'
    };

    App.prototype.add = function(e) {
      new EditAssetView({
        model: new Asset({}, {
          collection: API.assets
        })
      });
      return false;
    };

    return App;

  })(Backbone.View);

  jQuery(function() {
    return API.app = new App({
      el: $('body')
    });
  });

}).call(this);