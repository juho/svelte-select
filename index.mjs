function noop() {}

function assign(tar, src) {
	for (var k in src) tar[k] = src[k];
	return tar;
}

function assignTrue(tar, src) {
	for (var k in src) tar[k] = 1;
	return tar;
}

function append(target, node) {
	target.appendChild(node);
}

function insert(target, node, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function detachBetween(before, after) {
	while (before.nextSibling && before.nextSibling !== after) {
		before.parentNode.removeChild(before.nextSibling);
	}
}

function destroyEach(iterations, detach) {
	for (var i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detach);
	}
}

function createElement(name) {
	return document.createElement(name);
}

function createText(data) {
	return document.createTextNode(data);
}

function createComment() {
	return document.createComment('');
}

function addListener(node, event, handler, options) {
	node.addEventListener(event, handler, options);
}

function removeListener(node, event, handler, options) {
	node.removeEventListener(event, handler, options);
}

function setAttribute(node, attribute, value) {
	if (value == null) node.removeAttribute(attribute);
	else node.setAttribute(attribute, value);
}

function setData(text, data) {
	text.data = '' + data;
}

function blankObject() {
	return Object.create(null);
}

function destroy(detach) {
	this.destroy = noop;
	this.fire('destroy');
	this.set = noop;

	this._fragment.d(detach !== false);
	this._fragment = null;
	this._state = {};
}

function _differs(a, b) {
	return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function fire(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		var handler = handlers[i];

		if (!handler.__calling) {
			try {
				handler.__calling = true;
				handler.call(this, data);
			} finally {
				handler.__calling = false;
			}
		}
	}
}

function flush(component) {
	component._lock = true;
	callAll(component._beforecreate);
	callAll(component._oncreate);
	callAll(component._aftercreate);
	component._lock = false;
}

function get() {
	return this._state;
}

function init(component, options) {
	component._handlers = blankObject();
	component._slots = blankObject();
	component._bind = options._bind;
	component._staged = {};

	component.options = options;
	component.root = options.root || component;
	component.store = options.store || component.root.store;

	if (!options.root) {
		component._beforecreate = [];
		component._oncreate = [];
		component._aftercreate = [];
	}
}

function on(eventName, handler) {
	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};
}

function set(newState) {
	this._set(assign({}, newState));
	if (this.root._lock) return;
	flush(this.root);
}

function _set(newState) {
	var oldState = this._state,
		changed = {},
		dirty = false;

	newState = assign(this._staged, newState);
	this._staged = {};

	for (var key in newState) {
		if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
	}
	if (!dirty) return;

	this._state = assign(assign({}, oldState), newState);
	this._recompute(changed, this._state);
	if (this._bind) this._bind(changed, this._state);

	if (this._fragment) {
		this.fire("state", { changed: changed, current: this._state, previous: oldState });
		this._fragment.p(changed, this._state);
		this.fire("update", { changed: changed, current: this._state, previous: oldState });
	}
}

function _stage(newState) {
	assign(this._staged, newState);
}

function callAll(fns) {
	while (fns && fns.length) fns.shift()();
}

function _mount(target, anchor) {
	this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
}

var proto = {
	destroy,
	get,
	fire,
	on,
	set,
	_recompute: noop,
	_set,
	_stage,
	_mount,
	_differs
};

/* src/Item.html generated by Svelte v2.15.3 */

function create_main_fragment(component, ctx) {
	var raw_value = ctx.getOptionLabel(ctx.item), raw_before, raw_after;

	return {
		c() {
			raw_before = createElement('noscript');
			raw_after = createElement('noscript');
		},

		m(target, anchor) {
			insert(target, raw_before, anchor);
			raw_before.insertAdjacentHTML("afterend", raw_value);
			insert(target, raw_after, anchor);
		},

		p(changed, ctx) {
			if ((changed.getOptionLabel || changed.item) && raw_value !== (raw_value = ctx.getOptionLabel(ctx.item))) {
				detachBetween(raw_before, raw_after);
				raw_before.insertAdjacentHTML("afterend", raw_value);
			}
		},

		d(detach) {
			if (detach) {
				detachBetween(raw_before, raw_after);
				detachNode(raw_before);
				detachNode(raw_after);
			}
		}
	};
}

function Item(options) {
	init(this, options);
	this._state = assign({}, options.data);
	this._intro = true;

	this._fragment = create_main_fragment(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(Item.prototype, proto);

/* src/List.html generated by Svelte v2.15.3 */

function data() {
  return {
    hoverItemIndex: 0,
    optionIdentifier: 'value',
    items: [],
    Item,
    selectedItem: undefined,
    getOptionLabel: (option) => option.label
  }
}
function itemClasses(hoverItemIndex, item, itemIndex, items, selectedItem, optionIdentifier) {
  return `${selectedItem && (selectedItem[optionIdentifier] === item[optionIdentifier]) ? 'active ' : ''}${hoverItemIndex === itemIndex || items.length === 1 ? 'hover' : ''}`;
}
var methods = {
  handleSelect(item) {
    this.fire('itemSelected', item);
  },
  handleHover(i) {
    if(this.get().isScrolling) return;
    this.set({hoverItemIndex: i});
  },
  handleClick(item, i, event) {
    event.stopPropagation();
    this.set({activeItemIndex: i, hoverItemIndex: i});
    this.handleSelect(item);
  },
  updateHoverItem(increment) {
    let {items, hoverItemIndex} = this.get();

    if (increment > 0 && hoverItemIndex === (items.length - 1)) {
      hoverItemIndex = 0;
    }
    else if (increment < 0 && hoverItemIndex === 0) {
      hoverItemIndex = items.length - 1;
    }
    else {
      hoverItemIndex = hoverItemIndex + increment;
    }

    this.set({hoverItemIndex});
    this.scrollToActiveItem('hover');
  },
  handleKeyDown(e) {
    const {items, hoverItemIndex} = this.get();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        items.length && this.updateHoverItem(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        items.length && this.updateHoverItem(-1);
        break;
      case 'Enter':
        e.preventDefault();
        this.set({activeItemIndex: hoverItemIndex});
        this.handleSelect(items[hoverItemIndex]);
        break;
      case 'Tab':
        e.preventDefault();
        this.set({activeItemIndex: hoverItemIndex});
        this.handleSelect(items[hoverItemIndex]);
        break;
    }
  },
  scrollToActiveItem(className) {
    const {container} = this.refs;
    let offsetBounding;
    const focusedElemBounding = container.querySelector(`.listItem.${className}`);

    if (focusedElemBounding) {
      offsetBounding = container.getBoundingClientRect().bottom - focusedElemBounding.getBoundingClientRect().bottom;
    }

    container.scrollTop -= offsetBounding;
  }
};

function oncreate() {
  this.isScrollingTimer = 0;

  this.refs.container.addEventListener('scroll', (event) => {
    console.log(event);
    clearTimeout(this.isScrollingTimer);

    this.set({
      isScrolling: true
    });

    this.isScrollingTimer = setTimeout(() => {
      this.set({
        isScrolling: false
      });
    }, 100);
  }, false);
}
function ondestroy() {
  clearTimeout(this.isScrollingTimer);
}
function onupdate({changed, current}) {
  if (changed.items && current.items.length > 0) {
    if (!current.items[current.hoverItemIndex]) {
      this.set({
        hoverItemIndex: current.items.length - 1
      });
    }
  }
  if (changed.activeItemIndex && current.activeItemIndex > -1) {
    this.set({
      hoverItemIndex: current.activeItemIndex,
    });

    this.scrollToActiveItem('active');
  }
  if (changed.selectedItem && current.selectedItem) {
    this.scrollToActiveItem('active');
    if (current.items) {
      const hoverItemIndex = current.items.findIndex((item) => item.value === current.selectedItem.value);

      if (hoverItemIndex) {
        this.set({hoverItemIndex});
      }
    }
  }
}
function add_css() {
	var style = createElement("style");
	style.id = 'svelte-1q7fygl-style';
	style.textContent = ".listContainer.svelte-1q7fygl{box-shadow:0 2px 3px 0 rgba(44, 62, 80, 0.24);border-radius:4px;max-height:250px;overflow-y:auto;background:#fff}.listGroupTitle.svelte-1q7fygl{color:#8f8f8f;cursor:default;font-size:12px;height:40px;line-height:40px;padding:0 20px;text-overflow:ellipsis;overflow-x:hidden;white-space:nowrap;text-transform:uppercase}.listItem.svelte-1q7fygl{cursor:default;height:40px;line-height:40px;padding:0 20px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.listItem.hover.svelte-1q7fygl{background:#e7f2ff}.listItem.svelte-1q7fygl:active{background:#b9daff}.listItem.svelte-1q7fygl:first-child{border-radius:4px 4px 0 0}.listItem.active.svelte-1q7fygl{background:#007aff;color:#fff}.empty.svelte-1q7fygl{text-align:center;padding:20px 0;color:#78848F}";
	append(document.head, style);
}

function click_handler(event) {
	const { component, ctx } = this._svelte;

	component.handleClick(ctx.item, ctx.i, event);
}

function mouseover_handler(event) {
	const { component, ctx } = this._svelte;

	component.handleHover(ctx.i);
}

function get_each_context(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.item = list[i];
	child_ctx.i = i;
	return child_ctx;
}

function create_main_fragment$1(component, ctx) {
	var div;

	function onwindowkeydown(event) {
		component.handleKeyDown(event);	}
	window.addEventListener("keydown", onwindowkeydown);

	var each_value = ctx.items;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
	}

	var each_else = null;

	if (!each_value.length) {
		each_else = create_else_block(component, ctx);
		each_else.c();
	}

	return {
		c() {
			div = createElement("div");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			div.className = "listContainer svelte-1q7fygl";
		},

		m(target, anchor) {
			insert(target, div, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			if (each_else) {
				each_else.m(div, null);
			}

			component.refs.container = div;
		},

		p(changed, ctx) {
			if (changed.hoverItemIndex || changed.items || changed.selectedItem || changed.optionIdentifier || changed.Item || changed.getOptionLabel || changed.noOptionsMessage) {
				each_value = ctx.items;

				for (var i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block(component, child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}

			if (!each_value.length && each_else) {
				each_else.p(changed, ctx);
			} else if (!each_value.length) {
				each_else = create_else_block(component, ctx);
				each_else.c();
				each_else.m(div, null);
			} else if (each_else) {
				each_else.d(1);
				each_else = null;
			}
		},

		d(detach) {
			window.removeEventListener("keydown", onwindowkeydown);

			if (detach) {
				detachNode(div);
			}

			destroyEach(each_blocks, detach);

			if (each_else) each_else.d();

			if (component.refs.container === div) component.refs.container = null;
		}
	};
}

// (15:2) {:else}
function create_else_block(component, ctx) {
	var div, text;

	return {
		c() {
			div = createElement("div");
			text = createText(ctx.noOptionsMessage);
			div.className = "empty svelte-1q7fygl";
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, text);
		},

		p(changed, ctx) {
			if (changed.noOptionsMessage) {
				setData(text, ctx.noOptionsMessage);
			}
		},

		d(detach) {
			if (detach) {
				detachNode(div);
			}
		}
	};
}

// (5:2) {#if item.groupValue}
function create_if_block(component, ctx) {
	var div, text_value = ctx.item.groupValue, text;

	return {
		c() {
			div = createElement("div");
			text = createText(text_value);
			div.className = "listGroupTitle svelte-1q7fygl";
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, text);
		},

		p(changed, ctx) {
			if ((changed.items) && text_value !== (text_value = ctx.item.groupValue)) {
				setData(text, text_value);
			}
		},

		d(detach) {
			if (detach) {
				detachNode(div);
			}
		}
	};
}

// (4:2) {#each items as item, i}
function create_each_block(component, ctx) {
	var text0, div, text1, div_class_value;

	var if_block = (ctx.item.groupValue) && create_if_block(component, ctx);

	var switch_value = ctx.Item;

	function switch_props(ctx) {
		var switch_instance_initial_data = {
		 	item: ctx.item,
		 	getOptionLabel: ctx.getOptionLabel
		 };
		return {
			root: component.root,
			store: component.store,
			data: switch_instance_initial_data
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));
	}

	return {
		c() {
			if (if_block) if_block.c();
			text0 = createText("\n\n  ");
			div = createElement("div");
			if (switch_instance) switch_instance._fragment.c();
			text1 = createText("\n  ");
			div._svelte = { component, ctx };

			addListener(div, "mouseover", mouseover_handler);
			addListener(div, "click", click_handler);
			div.className = div_class_value = "listItem " + itemClasses(ctx.hoverItemIndex, ctx.item, ctx.i, ctx.items, ctx.selectedItem, ctx.optionIdentifier) + " svelte-1q7fygl";
		},

		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, text0, anchor);
			insert(target, div, anchor);

			if (switch_instance) {
				switch_instance._mount(div, null);
			}

			append(div, text1);
		},

		p(changed, _ctx) {
			ctx = _ctx;
			if (ctx.item.groupValue) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block(component, ctx);
					if_block.c();
					if_block.m(text0.parentNode, text0);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			var switch_instance_changes = {};
			if (changed.items) switch_instance_changes.item = ctx.item;
			if (changed.getOptionLabel) switch_instance_changes.getOptionLabel = ctx.getOptionLabel;

			if (switch_value !== (switch_value = ctx.Item)) {
				if (switch_instance) {
					switch_instance.destroy();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					switch_instance._fragment.c();
					switch_instance._mount(div, text1);
				} else {
					switch_instance = null;
				}
			}

			else if (switch_value) {
				switch_instance._set(switch_instance_changes);
			}

			div._svelte.ctx = ctx;
			if ((changed.hoverItemIndex || changed.items || changed.selectedItem || changed.optionIdentifier) && div_class_value !== (div_class_value = "listItem " + itemClasses(ctx.hoverItemIndex, ctx.item, ctx.i, ctx.items, ctx.selectedItem, ctx.optionIdentifier) + " svelte-1q7fygl")) {
				div.className = div_class_value;
			}
		},

		d(detach) {
			if (if_block) if_block.d(detach);
			if (detach) {
				detachNode(text0);
				detachNode(div);
			}

			if (switch_instance) switch_instance.destroy();
			removeListener(div, "mouseover", mouseover_handler);
			removeListener(div, "click", click_handler);
		}
	};
}

function List(options) {
	init(this, options);
	this.refs = {};
	this._state = assign(data(), options.data);
	this._intro = true;
	this._handlers.update = [onupdate];

	this._handlers.destroy = [ondestroy];

	if (!document.getElementById("svelte-1q7fygl-style")) add_css();

	this._fragment = create_main_fragment$1(this, this._state);

	this.root._oncreate.push(() => {
		oncreate.call(this);
		this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
	});

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		flush(this);
	}
}

assign(List.prototype, proto);
assign(List.prototype, methods);

/* src/Selection.html generated by Svelte v2.15.3 */

function create_main_fragment$2(component, ctx) {
	var text_value = ctx.getSelectionLabel(ctx.selectedItem), text;

	return {
		c() {
			text = createText(text_value);
		},

		m(target, anchor) {
			insert(target, text, anchor);
		},

		p(changed, ctx) {
			if ((changed.getSelectionLabel || changed.selectedItem) && text_value !== (text_value = ctx.getSelectionLabel(ctx.selectedItem))) {
				setData(text, text_value);
			}
		},

		d(detach) {
			if (detach) {
				detachNode(text);
			}
		}
	};
}

function Selection(options) {
	init(this, options);
	this._state = assign({}, options.data);
	this._intro = true;

	this._fragment = create_main_fragment$2(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(Selection.prototype, proto);

/* src/Select.html generated by Svelte v2.15.3 */



function showSelectedItem({selectedItem, filterText}) {
  return selectedItem && filterText.length === 0;
}
function placeholderText({selectedItem, placeholder}) {
  return selectedItem ? '' : placeholder
}
function filteredItems({items, filterText, groupBy, groupFilter, getOptionLabel}) {
  const filteredItems = items.filter(item => {
    if (filterText.length < 1) return true;
    return getOptionLabel(item).toLowerCase().includes(filterText.toLowerCase());
  });

  if(groupBy) {
    const groupValues = [];
    const groups = {};

    filteredItems.forEach((item) => {
      const groupValue = groupBy(item);

      if(!groupValues.includes(groupValue)) {
        groupValues.push(groupValue);
        groups[groupValue] = [];
        groups[groupValue].push(Object.assign({groupValue}, item));
      } else {
        groups[groupValue].push(Object.assign({}, item));
      }

      groups[groupValue].push();
    });

    const sortedGroupedItems = [];

    groupFilter(groupValues).forEach((groupValue) => {
      sortedGroupedItems.push(...groups[groupValue]);
    });

    return sortedGroupedItems;
  }

  return filteredItems;
}
function data$1() {
  return {
    autoFocus: false,
    containerStyles: undefined,
    items: [],
    filterText: '',
    listOpen: false,
    Item,
    Selection,
    paddingLeft: 0,
    list: undefined,
    target: undefined,
    selectedItem: undefined,
    isClearable: true,
    isSearchable: true,
    optionIdentifier: 'value',
    getOptionLabel: (option) => option.label,
    getSelectionLabel: (option) => option.label,
    placeholder: 'Select...',
    groupBy: undefined,
    groupFilter: (groups) => groups,
    getOptions: undefined,
    loadOptionsInterval: 200,
    noOptionsMessage: 'No options'
  }
}
var methods$1 = {
  getPosition() {
    const {target} = this.get();
    if (!target) return;
    const {top, height, width} = this.refs.container.getBoundingClientRect();
    target.style.top = `${height + 5}px`;
    target.style.width = `${width}px`;
    target.style.left = '0';
    this.set({target});
  },
  handleKeyDown(e) {
    const {isFocused, listOpen} = this.get();

    if (!isFocused) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.set({listOpen: true});
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.set({listOpen: true});
        break;
      case 'Tab':
        if (!listOpen) this.set({isFocused: false});
        break;
    }
  },
  handleFocus() {
    this.set({isFocused: true});
    if (this.refs.input) this.refs.input.focus();
  },
  removeList() {
    let {list, target} = this.get();
    this.set({filterText: ''});

    if (!list) return;
    list.destroy();
    list = undefined;

    if (!target) return;
    target.parentNode.removeChild(target);
    target = undefined;

    this.set({list, target});
  },
  handleWindowClick(event) {
    if (!this.refs.container) return;
    if (this.refs.container.contains(event.target)) return;
    this.set({isFocused: false, listOpen: false});
    if (this.refs.input) this.refs.input.blur();
  },
  handleClick() {
    const {isDisabled, listOpen} = this.get();
    if (isDisabled) return;
    this.set({isFocused: true, listOpen: !listOpen});
  },
  handleClear(e) {
    e.stopPropagation();
    this.set({selectedItem: undefined, listOpen: false});
    this.handleFocus();
  },
  loadList() {
    let {target, list} = this.get();
    if (target && list) return;
    target = document.createElement('div');

    Object.assign(target.style, {
      position: 'absolute',
      'z-index': 2
    });

    this.set({list, target});

    this.getPosition();
    this.refs.container.appendChild(target);

    const {Item: Item$$1, getOptionLabel, optionIdentifier, noOptionsMessage} = this.get();
    const data = {Item: Item$$1, optionIdentifier, noOptionsMessage};

    if (getOptionLabel) {
      data.getOptionLabel = getOptionLabel;
    }

    list = new List({
      target,
      data
    });

    const {items, selectedItem, filteredItems} = this.get();

    if (items) {
      // const match = JSON.stringify(selectedItem);
      // const activeItemIndex = items.findIndex(item => JSON.stringify(item) === match);
      list.set({items: filteredItems, selectedItem});
    }

    list.on('itemSelected', (newSelection) => {
      if (newSelection) {
        const selection = Object.assign({}, newSelection);

        this.set({
          selectedItem: {...selectedItem, ...selection},
          listOpen: false
        });
      }
    });

    this.set({list, target});
  }
};

function oncreate$1() {
  const {isFocused,listOpen} = this.get();
  this.loadOptionsTimeout = undefined;

  if (isFocused) this.refs.input.focus();
  if (listOpen) this.loadList();
}
function ondestroy$1() {
  this.removeList();
}
function onstate({changed, current, previous}) {
  if (!previous) return;

  if (changed.listOpen) {
    if (current.listOpen) {
      this.loadList();
    } else {
      this.removeList();
    }
  }

  if (changed.filterText) {
    if(current.loadOptions) {
      clearTimeout(this.loadOptionsTimeout);
      this.set({isWaiting:true});

      this.loadOptionsTimeout = setTimeout(() => {
        if(current.filterText) {
          current.loadOptions(current.filterText).then((response) => {
            this.set({ items: response });
          });
        } else {
          this.set({ items: [] });
        }

        this.set({isWaiting:false});
        this.set({listOpen: true});
      }, current.loadOptionsInterval);
    } else {
      this.loadList();
      this.set({listOpen: true});
    }
  }

  if (changed.isFocused) {
    const {isFocused} = current;
    if (isFocused) {
      this.handleFocus();
    } else {
      this.set({filterText: ''});
    }
  }

  if (changed.filteredItems && current.list) {
    current.list.set({items: current.filteredItems});
  }
}
function add_css$1() {
	var style = createElement("style");
	style.id = 'svelte-1r3r83f-style';
	style.textContent = ".selectContainer.svelte-1r3r83f{border:1px solid #D8DBDF;border-radius:3px;height:44px;position:relative;padding:0 16px}.selectContainer.svelte-1r3r83f input.svelte-1r3r83f{cursor:default;border:none;color:#3F4F5F;height:44px;line-height:44px;padding:0 16px;width:100%;background:transparent;font-size:14px;letter-spacing:-0.08px;position:absolute;left:0}.selectContainer.svelte-1r3r83f input.svelte-1r3r83f::placeholder{color:#78848F}.selectContainer.svelte-1r3r83f input.svelte-1r3r83f:focus{outline:none}.selectContainer.svelte-1r3r83f:hover{border-color:#b2b8bf}.selectContainer.focused.svelte-1r3r83f{border-color:#006FE8}.selectContainer.disabled.svelte-1r3r83f{background:#F6F7F8;border-color:#F6F7F8;color:#C1C6CC}.selectContainer.disabled.svelte-1r3r83f input.svelte-1r3r83f::placeholder{color:#C1C6CC}.selectedItem.svelte-1r3r83f{line-height:44px;text-overflow:ellipsis;overflow-x:hidden;white-space:nowrap;padding-right:20px}.selectedItem.svelte-1r3r83f:focus{outline:none}.clearSelectedItem.svelte-1r3r83f{position:absolute;right:10px;top:11px;width:20px;height:20px;color:#c5cacf}.clearSelectedItem.svelte-1r3r83f:hover{color:#2c3e50}.selectContainer.focused.svelte-1r3r83f .clearSelectedItem.svelte-1r3r83f{color:#3F4F5F}.indicator.svelte-1r3r83f{position:absolute;right:10px;top:11px;width:20px;height:20px;color:#c5cacf}.indicator.svelte-1r3r83f svg.svelte-1r3r83f{display:inline-block;fill:currentcolor;line-height:1;stroke:currentcolor;stroke-width:0}.spinner.svelte-1r3r83f{position:absolute;right:10px;top:11px;width:20px;height:20px;color:#51ce6c;animation:svelte-1r3r83f-rotate 0.75s linear infinite}.spinner_icon.svelte-1r3r83f{display:block;height:100%;transform-origin:center center;width:100%;position:absolute;top:0;bottom:0;left:0;right:0;margin:auto;-webkit-transform:none}.spinner_path.svelte-1r3r83f{stroke-dasharray:90;stroke-linecap:round}@keyframes svelte-1r3r83f-rotate{100%{transform:rotate(360deg)}}";
	append(document.head, style);
}

function create_main_fragment$3(component, ctx) {
	var div, input, input_updating = false, input_readonly_value, text0, text1, text2, div_class_value;

	function onwindowclick(event) {
		component.handleWindowClick(event);	}
	window.addEventListener("click", onwindowclick);

	function onwindowkeydown(event) {
		component.handleKeyDown(event);	}
	window.addEventListener("keydown", onwindowkeydown);

	function onwindowresize(event) {
		component.getPosition();	}
	window.addEventListener("resize", onwindowresize);

	function input_input_handler() {
		input_updating = true;
		component.set({ filterText: input.value });
		input_updating = false;
	}

	function focus_handler(event) {
		component.handleFocus();
	}

	var if_block0 = (ctx.showSelectedItem) && create_if_block_2(component, ctx);

	var if_block1 = (!ctx.isSearchable && !ctx.isDisabled && !ctx.isWaiting && (ctx.showSelectedItem && !ctx.isClearable || !ctx.showSelectedItem)) && create_if_block_1(component, ctx);

	var if_block2 = (ctx.isWaiting) && create_if_block$1(component, ctx);

	function click_handler(event) {
		component.handleClick();
	}

	return {
		c() {
			div = createElement("div");
			input = createElement("input");
			text0 = createText("\n\n  ");
			if (if_block0) if_block0.c();
			text1 = createText("\n\n  ");
			if (if_block1) if_block1.c();
			text2 = createText("\n\n  ");
			if (if_block2) if_block2.c();
			addListener(input, "input", input_input_handler);
			addListener(input, "focus", focus_handler);
			input.readOnly = input_readonly_value = !ctx.isSearchable;
			input.autocomplete = "off";
			setAttribute(input, "autocorrect", "off");
			input.spellcheck = "false";
			input.placeholder = ctx.placeholderText;
			input.disabled = ctx.isDisabled;
			input.style.cssText = ctx.inputStyles;
			input.className = "svelte-1r3r83f";
			addListener(div, "click", click_handler);
			div.className = div_class_value = "selectContainer " + (ctx.isDisabled ? 'disabled' : '') + (ctx.isFocused ? 'focused' : '') + " svelte-1r3r83f";
			div.style.cssText = ctx.containerStyles;
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, input);
			component.refs.input = input;

			input.value = ctx.filterText;

			append(div, text0);
			if (if_block0) if_block0.m(div, null);
			append(div, text1);
			if (if_block1) if_block1.m(div, null);
			append(div, text2);
			if (if_block2) if_block2.m(div, null);
			component.refs.container = div;
		},

		p(changed, ctx) {
			if (!input_updating && changed.filterText) input.value = ctx.filterText;
			if ((changed.isSearchable) && input_readonly_value !== (input_readonly_value = !ctx.isSearchable)) {
				input.readOnly = input_readonly_value;
			}

			if (changed.placeholderText) {
				input.placeholder = ctx.placeholderText;
			}

			if (changed.isDisabled) {
				input.disabled = ctx.isDisabled;
			}

			if (changed.inputStyles) {
				input.style.cssText = ctx.inputStyles;
			}

			if (ctx.showSelectedItem) {
				if (if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0 = create_if_block_2(component, ctx);
					if_block0.c();
					if_block0.m(div, text1);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (!ctx.isSearchable && !ctx.isDisabled && !ctx.isWaiting && (ctx.showSelectedItem && !ctx.isClearable || !ctx.showSelectedItem)) {
				if (!if_block1) {
					if_block1 = create_if_block_1(component, ctx);
					if_block1.c();
					if_block1.m(div, text2);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (ctx.isWaiting) {
				if (!if_block2) {
					if_block2 = create_if_block$1(component, ctx);
					if_block2.c();
					if_block2.m(div, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if ((changed.isDisabled || changed.isFocused) && div_class_value !== (div_class_value = "selectContainer " + (ctx.isDisabled ? 'disabled' : '') + (ctx.isFocused ? 'focused' : '') + " svelte-1r3r83f")) {
				div.className = div_class_value;
			}

			if (changed.containerStyles) {
				div.style.cssText = ctx.containerStyles;
			}
		},

		d(detach) {
			window.removeEventListener("click", onwindowclick);

			window.removeEventListener("keydown", onwindowkeydown);

			window.removeEventListener("resize", onwindowresize);

			if (detach) {
				detachNode(div);
			}

			removeListener(input, "input", input_input_handler);
			removeListener(input, "focus", focus_handler);
			if (component.refs.input === input) component.refs.input = null;
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			removeListener(div, "click", click_handler);
			if (component.refs.container === div) component.refs.container = null;
		}
	};
}

// (22:2) {#if showSelectedItem }
function create_if_block_2(component, ctx) {
	var div, text, if_block_anchor;

	var switch_value = ctx.Selection;

	function switch_props(ctx) {
		var switch_instance_initial_data = {
		 	selectedItem: ctx.selectedItem,
		 	getSelectionLabel: ctx.getSelectionLabel
		 };
		return {
			root: component.root,
			store: component.store,
			data: switch_instance_initial_data
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));
	}

	function focus_handler(event) {
		component.handleFocus();
	}

	var if_block = (ctx.isClearable && !ctx.isDisabled && !ctx.isWaiting) && create_if_block_3(component, ctx);

	return {
		c() {
			div = createElement("div");
			if (switch_instance) switch_instance._fragment.c();
			text = createText("\n  ");
			if (if_block) if_block.c();
			if_block_anchor = createComment();
			addListener(div, "focus", focus_handler);
			div.className = "selectedItem svelte-1r3r83f";
		},

		m(target, anchor) {
			insert(target, div, anchor);

			if (switch_instance) {
				switch_instance._mount(div, null);
			}

			component.refs.selectedItem = div;
			insert(target, text, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},

		p(changed, ctx) {
			var switch_instance_changes = {};
			if (changed.selectedItem) switch_instance_changes.selectedItem = ctx.selectedItem;
			if (changed.getSelectionLabel) switch_instance_changes.getSelectionLabel = ctx.getSelectionLabel;

			if (switch_value !== (switch_value = ctx.Selection)) {
				if (switch_instance) {
					switch_instance.destroy();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					switch_instance._fragment.c();
					switch_instance._mount(div, null);
				} else {
					switch_instance = null;
				}
			}

			else if (switch_value) {
				switch_instance._set(switch_instance_changes);
			}

			if (ctx.isClearable && !ctx.isDisabled && !ctx.isWaiting) {
				if (!if_block) {
					if_block = create_if_block_3(component, ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},

		d(detach) {
			if (detach) {
				detachNode(div);
			}

			if (switch_instance) switch_instance.destroy();
			removeListener(div, "focus", focus_handler);
			if (component.refs.selectedItem === div) component.refs.selectedItem = null;
			if (detach) {
				detachNode(text);
			}

			if (if_block) if_block.d(detach);
			if (detach) {
				detachNode(if_block_anchor);
			}
		}
	};
}

// (26:2) {#if isClearable && !isDisabled && !isWaiting}
function create_if_block_3(component, ctx) {
	var div;

	function click_handler(event) {
		component.handleClear(event);
	}

	return {
		c() {
			div = createElement("div");
			div.innerHTML = `<svg width="100%" height="100%" viewBox="-2 -2 50 50" focusable="false" role="presentation" class="svelte-1r3r83f"><path fill="currentColor" d="M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124 l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z"></path></svg>`;
			addListener(div, "click", click_handler);
			div.className = "clearSelectedItem svelte-1r3r83f";
		},

		m(target, anchor) {
			insert(target, div, anchor);
		},

		d(detach) {
			if (detach) {
				detachNode(div);
			}

			removeListener(div, "click", click_handler);
		}
	};
}

// (37:2) {#if !isSearchable && !isDisabled && !isWaiting && (showSelectedItem && !isClearable || !showSelectedItem)}
function create_if_block_1(component, ctx) {
	var div;

	return {
		c() {
			div = createElement("div");
			div.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 20 20" focusable="false" class="css-19bqh2r svelte-1r3r83f"><path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path></svg>`;
			div.className = "indicator svelte-1r3r83f";
		},

		m(target, anchor) {
			insert(target, div, anchor);
		},

		d(detach) {
			if (detach) {
				detachNode(div);
			}
		}
	};
}

// (46:2) {#if isWaiting}
function create_if_block$1(component, ctx) {
	var div;

	return {
		c() {
			div = createElement("div");
			div.innerHTML = `<svg class="spinner_icon svelte-1r3r83f" viewBox="25 25 50 50"><circle class="spinner_path svelte-1r3r83f" cx="50" cy="50" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-miterlimit="10"></circle></svg>`;
			div.className = "spinner svelte-1r3r83f";
		},

		m(target, anchor) {
			insert(target, div, anchor);
		},

		d(detach) {
			if (detach) {
				detachNode(div);
			}
		}
	};
}

function Select(options) {
	init(this, options);
	this.refs = {};
	this._state = assign(data$1(), options.data);

	this._recompute({ selectedItem: 1, filterText: 1, placeholder: 1, items: 1, groupBy: 1, groupFilter: 1, getOptionLabel: 1 }, this._state);
	this._intro = true;

	this._handlers.state = [onstate];

	this._handlers.destroy = [ondestroy$1];

	if (!document.getElementById("svelte-1r3r83f-style")) add_css$1();

	onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

	this._fragment = create_main_fragment$3(this, this._state);

	this.root._oncreate.push(() => {
		oncreate$1.call(this);
		this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
	});

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		flush(this);
	}
}

assign(Select.prototype, proto);
assign(Select.prototype, methods$1);

Select.prototype._recompute = function _recompute(changed, state) {
	if (changed.selectedItem || changed.filterText) {
		if (this._differs(state.showSelectedItem, (state.showSelectedItem = showSelectedItem(state)))) changed.showSelectedItem = true;
	}

	if (changed.selectedItem || changed.placeholder) {
		if (this._differs(state.placeholderText, (state.placeholderText = placeholderText(state)))) changed.placeholderText = true;
	}

	if (changed.items || changed.filterText || changed.groupBy || changed.groupFilter || changed.getOptionLabel) {
		if (this._differs(state.filteredItems, (state.filteredItems = filteredItems(state)))) changed.filteredItems = true;
	}
};

export default Select;
