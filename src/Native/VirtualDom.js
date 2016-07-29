//import Native.Json //

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var snabbdomVNode = require("snabbdom/vnode");
var snabbdomThunk = require("snabbdom/thunk");


////////////  VIRTUAL DOM NODES  ////////////


function textNode(string)
{
	return snabbdomVNode(undefined, undefined, undefined, string);
}


function nodeHelp(tag, factList, kidList)
{
	var data = makeData(factList);
	var children;
  var text;

  if (kidList.ctor !== '[]')
  {
    if (kidList._1.ctor !== '[]' ||
        kidList._0.sel ||
        kidList._0.data ||
        kidList._0.children ||
        !kidList._0.text)
    { // hasn't single text node
      children = [];
      
      while (kidList.ctor !== '[]')
	    {
		    var kid = kidList._0;
        if (kid.ctor && kid.ctor === '_Tuple2')
        { // add key for keyed child
          kid._1.data.key = kid._0;
          kid = kid._1;
        }
		    children.push(kid);
		    kidList = kidList._1;
	    }
    }
    else
    { // has single text node
      text = kidList._0.text;
    }
  }

  return snabbdomVNode(tag, data, children, text);
  /*
  // Maybe a right way is adding reference to parent node to children
	var vnode = snabbdomVNode(tag, data, children, text);
  
  if (children)
  {
    for (var i = 0; i < children.length; i++)
    {
      children[i].parent = vnode;
    }
  }

  return vnode;
   */
}

var htmlNode = F3(nodeHelp);


function custom(factList, model, impl)
{
  throw new Error("The 'custom' element still doesn't supported.");
	//var data = makeData(factList);
}


function map(tagger, node)
{
  if (node.mapper)
  { // inner map call
    var _tagger = node.tagger;
    node.tagger = function(msg)
    {
      return tagger(_tagger(msg));
    };
  }
  else
  { // add tagger mapper
    node.tagger = tagger;
  }
  return node;
}


function thunk(args, func)
{
  return snabbdomThunk(undefined, undefined, func, args);
}

function lazy(fn, a)
{
	return thunk([a], fn);
}

function lazy2(fn, a, b)
{
	return thunk([a,b], function(a, b) {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk([a,b,c], function(a, b, c) {
		return A3(fn, a, b, c);
	});
}


// FACTS

var STYLE = "style",
    ATTR = "attrs",
    DATA = "dataset",
    PROP = "props",
    EVENT = "event",
    ATTR_NS = "attrs";


function makeData(list)
{
	var data = {};

	while (list.ctor !== '[]')
	{
		var entry = list._0;
		var type = entry.type;

    if (!(type in data)) data[type] = {};
    var dict = data[type];
    var key = entry.key, value = entry.value;

		switch (type)
    {
      case STYLE:
      case DATA:
			while (value.ctor !== '[]')
			{
				var item = value._0;
				dict[item._0] = item._1;
				value = value._1;
			}
      break;
      default:
      dict[key] = value;
      if (entry.ns)
      {
        data.ns = entry.ns;
      }
		}
		list = list._1;
	}

	return data;
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
    type: STYLE,
    value: value
  };
}


function property(key, value)
{
	return {
    type: PROP,
    key: key,
    value: value
  };
}


function attribute(key, value)
{
	return {
    type: ATTR,
		key: key,
		value: value
	};
}


function attributeNS(ns, key, value)
{
	return {
		type: ATTR_NS,
		key: key,
		value: value,
		ns: ns
	};
}


function on(name, options, decoder)
{
	return {
		type: EVENT,
		key: name,
    value: {
		  options: options,
		  decoder: decoder
    }
	};
}

// RUN_MODE depended functions

var renderer;

if (process.env.RUN_MODE === "client")
{

/*
 * Handle generic event:
 * 
 * 1. Decode event object
 * 2. send message using tagger
 */
function handleEvent(event, vnode)
{
  var name = event.type,
      tagger = vnode.tagger,
      handlers = vnode.data.event;
  
  if (handlers && handlers[name])
  {
    var handler = handlers[name],
        value = A2(_elm_lang$core$Native_Json.run, handler.decoder, event);
    
		if (value.ctor === 'Ok')
		{
			var options = handler.options;
      
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
      
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			tagger(value._0);
    }
  }
}

/*
 * Create listener function for node
 */
function makeListener()
{
  function handler (event)
  {
    handleEvent(event, handler.vnode);
  }

  return handler;
}

/*
 * Update handlers logic:
 * 
 * add cases:
 *   handler isnt null and _handler is null
 *   elm isnt _elm
 * 
 * remove cases:
 *   handler is null and _handler isnt null
 *   _elm isnt elm
 */

function updateHandlers(_vnode, vnode)
{
  var _handlers = _vnode.data.event,
      _listener = _vnode.listener,
      _elm = _vnode.elm,
      handlers = vnode && vnode.data.event,
      elm = vnode && vnode.elm;

  if (_handlers && _listener)
  { // remove existing handlers
    for (var _name in _handlers)
    {
      if (elm !== _elm || !handlers || !handlers[_name])
      { // element changed or existing handler removed
        console.log("removeListener", _name);
        _elm.removeEventListener(_name, _listener, false);
      }
    }
  }

  if (handlers)
  { // add new handlers
    var listener = vnode.listener = _vnode.listener || makeListener();
    listener.vnode = vnode;
    
    for (var name in handlers)
    {
      if (elm !== _elm || !_handlers || !_handlers[name])
      { // element changed or new handler added
        console.log("addListener", name);
        elm.addEventListener(name, listener, false);
      }
    }
  }
}

var eventHandlers = {
  create: updateHandlers,
  update: updateHandlers,
  destroy: updateHandlers
};

var snabbdomPatch = require("snabbdom").init([
  // Init patch function with choosen modules
  require("snabbdom/modules/props"), // for setting properties on DOM elements
  require("snabbdom/modules/attributes"), // for setting attributes on DOM elements
  require("snabbdom/modules/style"), // handles styling on elements with support for animations
  require("snabbdom/modules/dataset"), // handles dataset on elements
  eventHandlers,
  // diff log
  {
    create: function(_vnode, vnode) { console.log("create", vnode); },
    update: function(_vnode, vnode) { console.log("update", vnode); },
    remove: function(vnode, cb) { console.log("remove", vnode); cb(); }
  }
]);

var snabbdomRead = require("snabbdom-edge/read-dom").init([
  // Init read function with choosen modules
  require("snabbdom-edge/read-dom/modules/attributes")({"class": true}), // for setting attributes on DOM elements
  require("snabbdom-edge/read-dom/modules/style"), // handles styling on elements
  require("snabbdom-edge/read-dom/modules/dataset") // handles dataset on elements
]);



////////////  RENDERER  ////////////

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(cb) { setTimeout(cb, 1000 / 60); };

var NO_REQUEST = 1,
    PENDING_REQUEST = 2,
    EXTRA_REQUEST = 3;

function attachTagger(vnode, tagger)
{
  if (!vnode.sel || !vnode.data) {
    return;
  }

  if (vnode.tagger)
  {
    var _tagger = vnode.tagger,
        _tagger_ = tagger;
    
    tagger = function(msg)
    {
      return _tagger_(_tagger(msg));
    };
  }
  
  vnode.tagger = tagger;
  
  var children = vnode.children;

  if (children)
  {
    for (var i = 0; i < children.length; i++)
    {
      attachTagger(children[i], tagger);
    }
  }
}

renderer = function(domNode, tagger, initialVNode)
{
  var naturalVNode = snabbdomRead(domNode);

  snabbdomPatch(naturalVNode, initialVNode);
  attachTagger(initialVNode, tagger);

	var state = NO_REQUEST;
	var currentVNode = initialVNode;
	var nextVNode = initialVNode;

	function registerVirtualNode(newVNode)
	{
		if (state === NO_REQUEST)
		{
			rAF(updateIfNeeded);
		}
		state = PENDING_REQUEST;
		nextVNode = newVNode;
	}

	function updateIfNeeded()
	{
		switch (state)
		{
			case NO_REQUEST:
			throw new Error(
				'Unexpected draw callback.\n' +
					'Please report this to <http://github.com/kayo/elm-snabbdom/issues>.'
			);
      
			case PENDING_REQUEST:
			rAF(updateIfNeeded);
			state = EXTRA_REQUEST;

      snabbdomPatch(currentVNode, nextVNode);
      attachTagger(nextVNode, tagger);
      
      currentVNode = nextVNode;
			return;
      
			case EXTRA_REQUEST:
			state = NO_REQUEST;
			return;
		}
	}
  
	return { update: registerVirtualNode };
}

}
else
{ // process.env.RUN_MODE === "server"



}

////////////  PROGRAMS  ////////////


function programWithFlags(details)
{
	return {
		init: details.init,
		update: details.update,
		subscriptions: details.subscriptions,
		view: details.view,
		renderer: renderer
	};
}


return {
	node: htmlNode,
	text: textNode,

	custom: custom,

	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: htmlNode,

	programWithFlags: programWithFlags
};

}();
