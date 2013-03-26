var SuggestWidget = function(hintText, inputHiddenName, renderToId, url, useId) {
	this.hintText = hintText;
	this.inputHiddenName = inputHiddenName;
	this.renderToId = renderToId;
	this.url = url;
	this.useId = useId;
	
	this.selected = false;
	
	this._initializeWrapperDom();
	this._initializeInputDom();
	this._initializeHintDom();
	this._initializeLoadingAndEmptyDom();
	this._initializePopupDom();
	this._addDomsAndRenderToTarget();
};

SuggestWidget.WIDTH = '250px';

SuggestWidget.prototype = {
	
	_initializeWrapperDom : function() {
		this.wrapperDom = Dom.create('div', { id : 'suggest_component_wrapper' }, { color : 'blue' });
	},

	_initializeInputDom : function() {
		this.inputHiddenDom = Dom.create(
				'input',
				{ id : this.inputHiddenName + '_hidden', type : 'hidden', name : this.inputHiddenName, value : '' },
				{}
			);
		this.inputLabelDom = Dom.create('label', {}, { display : 'none' });
		
		this.inputDom = Dom.create(
				'input',
				{ type : 'text', value : '' },
				{ width : SuggestWidget.WIDTH, position : 'relative', display : 'none' });
		
		var widget = this;
		Dom.addListener(this.inputLabelDom, 'ondblclick', function() {
			widget.showInput();
		});
		
		var dom = this.inputDom;
		var timeOut;
		Dom.addListener(this.inputDom, 'onkeyup', function() {
			if (timeOut) window.clearTimeout(timeOut);
			timeOut = window.setTimeout(function() {
				Dom.hide(widget.emptyDom);
				Dom.innerHTML(widget.inputHiddenDom, '');
				Dom.innerHTML(widget.inputLabelDom, '');
				
				if (dom.value) {
					widget.mockAjax({ input : dom.value });
				}
			}, 1000);
		});
		
		Dom.addListener(this.inputDom, 'onblur', function() {
			// alert('input blur');
			setTimeout(function() {
				Dom.show(widget.inputLabelDom);
				Dom.hide(widget.inputDom);
				Dom.hide(widget.emptyDom);
				Dom.hide(widget.popupDom);
			}, 200);
		});
	},
	
	_initializeHintDom : function() {
		this.hintDom = Dom.create('label', { id : 'suggest_component_hint' }, {});
		Dom.innerHTML(this.hintDom, this.hintText);
		
		var widget = this;
		Dom.addListener(this.hintDom, 'onclick', function() {
			widget.showInput();
		});
	},
	
	_initializeLoadingAndEmptyDom : function() {
		// this.loadingDom = Dom.create('img',	{ src : '/eedb/nokialayout1/spinner.gif' },	{ display : 'none' });
		this.emptyDom = Dom.create('div', {}, { width : SuggestWidget.WIDTH, color : 'red', display : 'none' });
		Dom.innerHTML(this.emptyDom, 'No records found...');
	},
	
	_initializePopupDom : function() {
		this.popupDom = Dom.create(
			'div',
			{},
			{
				width : SuggestWidget.WIDTH,
				position : 'absolute',
				zIndex : 2,
				border : '1px solid gray',
				overflowX : 'hidden',
				display : 'none'
			}
		);
		
		var widget = this;
		/*
		Dom.addListener(this.popupDom, 'onmousedown', function() {
			widget.inputDom.focus();
			// alert('mouse down');
		});
		*/
		
		/*
		Dom.addListener(this.popupDom, 'onscroll', function() {
			widget.inputDom.focus();
			alert('scrolling');
		});
		*/
		
	},
	
	_addDomsAndRenderToTarget : function() {
		Dom.append(this.wrapperDom, this.inputHiddenDom);
		Dom.append(this.wrapperDom, this.inputLabelDom);
		Dom.append(this.wrapperDom, this.inputDom);
		Dom.append(this.wrapperDom, this.popupDom);
		Dom.append(this.wrapperDom, this.hintDom);
		// Dom.append(this.wrapperDom, this.loadingDom);
		Dom.append(this.wrapperDom, this.emptyDom);
		
		var scrollHintDiv = Dom.create('div', {}, { display : 'none' });
		Dom.innerHTML(scrollHintDiv, "Scrolling...");
		
		Dom.append(this.wrapperDom, scrollHintDiv);
		Dom.append(document.getElementById(this.renderToId), this.wrapperDom);
	},
	
	showInput : function() {
		Dom.value(this.inputDom, this.selected ? this.inputHiddenDom.value : '');
		Dom.hide(this.inputLabelDom);
		Dom.show(this.inputDom);
		this.inputDom.focus();
	},
	
	showPopup : function(data) {
		Dom.innerHTML(this.popupDom, '');
		
		if (data.length <= 15) {
			Dom.styles(this.popupDom, { height : data.length * 20 + 'px', overflowY : 'hidden' });
		} else {
			Dom.styles(this.popupDom, { height : 15 * 20 + 'px', overflowY : 'scroll' });
		}
		
		var widget = this;
		for (var key in data) {
			Dom.append(widget.popupDom, widget.createOption(data[key]));
		}
		
		this.selected = false;
		Dom.show(this.popupDom);
	},

	createOption : function(item) {
		var option = Dom.create(
			'div',
			{ id : item.id },
			{ background : 'white', height : '20px', overflow : 'hidden', color : 'blue' }
		);
		Dom.innerHTML(option, item.value);
		
		var widget = this;
		Dom.addListener(option, 'onmouseover', function() {
			Dom.styles(dom, { background : 'blue', color : 'white' });
		});
		Dom.addListener(option, 'onmouseout', function() {
			Dom.styles(dom, { background : 'white', color : 'blue' });
		});
		
		var dom = option;
		Dom.addListener(option, 'onclick', function() {
			Dom.innerHTML(widget.inputLabelDom, item.value);
			
			var hiddenValue = widget.useId ? item.id : item.value;
			Dom.value(widget.inputHiddenDom, hiddenValue);
			
			widget.selected = true;
			Dom.hide(widget.popupDom);
		});
		
		return option;
	},
	
	ajax : function(params) {
		var additionalParams = this.getAdditionalParameters();
		var array = new Array();
		for (var key in params) {
			  array.push(key + ":'" + params[key] + "'");
		}
		for (var key in additionalParams) {
			  array.push(key + ":'" + additionalParams[key] + "'");
		}
		p = eval("([" + array.join(',') + "])");
		var widget = this;
		new Ajax.Request(widget.url, {
			parameters: p,
			onSuccess: function(transport, data) {
				// To be nocommented.
				// Dom.hide(widget.loadingDom);
				var json = eval('(' + transport.responseText + ')');
				if (!json.count) {
					// Can this be deleted?
					// Dom.hide(widget.popupDom);
					Dom.show(widget.emptyDom);
				} else {
					// modifed.
					widget.inputDom.blur();
				
					widget.showPopup(json.data);
				}
			},
			
			onFailure: function(transport, data) {
				alert("Error happned");
			}
		});
	},
	
	mockAjax : function(params) {
		var input = params.input;
		var array = new Array();
		for (var index in db) {
			if (db[index].indexOf(input) != -1) {
				array.push(eval("({ id : '" + index + "', value : '" + db[index] + "' })"));
			}
		}
		this.showPopup(array);
	},
	
	getAdditionalParameters : function() {
		return {};
	}
	
};

/* utilities for manipulating DOMs */

var Dom = function() {
};

Dom.create = function(tag, attrs, styles) {
	var dom = document.createElement(tag);
	Dom.attrs(dom, attrs);
	Dom.styles(dom, styles);
	return dom;
};

Dom.attrs = function(dom, attrs) {
	for (var key in attrs) dom.setAttribute(key, attrs[key]);
};

Dom.styles = function(dom, styles) {
	for (var key in styles) {
		try {
			dom.style[key] = styles[key];
		} catch(e) {
		}
	}
};

Dom.addListener = function (dom, event, handler) {
	dom[event] = handler;
};

Dom.append = function(dom, child) {
	dom.appendChild(child);
};

Dom.show = function(dom) {
	Dom.styles(dom, { display : 'block', color : 'black' });
};

Dom.hide = function(dom) {
	Dom.styles(dom, { display : 'none' });
};

Dom.innerHTML = function(dom, html) {
	try {
		dom.innerHTML = html;
	} catch(e) {
	}
};

Dom.value = function(dom, val) {
	dom.value = val;
}

/* local database */
var db = [
	"achilles",
	"adrastea",
	"agit01",
	"agnfs01t",
	"agsmb01t",
	"alaska",
	"amalthea",
	"atesxs20",
	"atesxs21",
	"Athens",
	"athstn01",
	"athwsn01",
	"atlina10",
	"atlina10-rm",
	"atling01",
	"atling02",
	"atlinn01",
	"atoba001-rm",
	"atoba002-rm",
	"atqaan01",
	"atrndn01",
	"auriga",
	"Bangalore_DHN",
	"Bangalore_PN",
	"bastard",
	"bebnt001",
	"bechla10",
	"bechov20",
	"bechov21",
	"beeecc11",
	"beeecc11-m",
	"beeecc12",
	"beeecc12-m",
	"beeecc13",
	"bevxwg01",
	"bevxwg02",
	"bevxwg03",
	"bevxwv22",
	"bh4labs01",
	"bh4labs02",
	"bh4labs03",
	"bharcn60",
	"bhchblr",
	"bhchcc01",
	"bhchcc01-m",
	"bhchcc02",
	"bhchcc02-m",
	"bhchlg01",
	"bhchlg02",
	"bhchlg10",
	"bhchlg10-m",
	"bhchlg11",
	"bheecc13",
	"bheecc13-old-m",
	"bheecc14",
	"bheecc14-m",
	"bheecc15",
	"bheecc16",
	"bheecc16-m",
	"bheecc17",
	"bheecc17-m",
	"bheecc18",
	"bheecc18-m",
	"bheecc19",
	"bheecc19-m",
	"bheecc61",
	"bheecc61-m",
	"bheecc62",
	"bheecc62-m",
	"bheeccl01",
	"bheeccl50",
	"bheecct13",
	"bheeccw63",
	"bheeccw63-m",
	"bheeccw64-m",
	"bheecluster20",
	"bheeclusterdhn",
	"bheedim01",
	"bheeec60",
	"bheeec60-m",
	"bheeec70",
	"bheeec70-m",
	"bheeec71",
	"bheeec71-m",
	"bheeec72",
	"bheeec72-m",
	"bheeec73",
	"bheeec73-m",
	"bheeec74",
	"bheeec74-m",
	"bheeec75",
	"bheeec75-m",
	"bheeec76",
	"bheeec76-m",
	"bheeec77",
	"bheeec77-m",
	"bheeec78",
	"bhhwsn10",
	"bhisop60",
	"bhisop60-m",
	"bhisop61",
	"bhisop61-m",
	"bhling22-m",
	"bhling23",
	"bhling23-m",
	"bhling24",
	"bhling24-rm",
	"bhling25",
	"bhling26",
	"bhling26-rm",
	"bhling27",
	"bhling27-m",
	"bhling28",
	"bhling29",
	"bhling29-m",
	"bhling30",
	"bhling30-m",
	"bhling31",
	"bhling31-m",
	"bhling32",
	"bhling32-m",
	"bhling33",
	"bhling33-m",
	"bhling34",
	"bhling34-m",
	"bhling35",
	"bhling35-m",
	"bhling36",
	"bhling36-m",
	"bhling37",
	"bhling61",
	"bhling61-m",
	"bhling62",
	"bhling62-m",
	"bhling63",
	"bhling63-m",
	"bhling64",
	"bhling64-m",
	"buchon10",
	"Budapest",
	"budmxn10",
	"bueecc01",
	"bueecc01-rm",
	"bueecluster",
	"bueeec20",
	"bueeec20-m",
	"bueeec21",
	"bueeec21-m",
	"bueeec22",
	"bueeec22-m",
	"bueeec23",
	"bueeec23-m",
	"bueeec24",
	"bueeec24-m",
	"bueeec25",
	"bueeec25-m",
	"bueeec26",
	"buling09",
	"buling09-rm",
	"buling10",
	"buling10-rm",
	"buling11",
	"buling11-rm",
	"buling12",
	"buling12-rm",
	"bulinn10",
	"buoba003-m",
	"buoba004-m",
	"burke",
	"burndn10",
	"camus",
	"cdchon10",
	"cdeecc01",
	"cdeecc01-rm",
	"cdeecc02",
	"cdeecc02-rm",
	"cdeecc03",
	"cdeecc03-rm",
	"cdeecc04",
	"cdeecc04-rm",
	"cdeecc05",
	"cdeecc05-rm",
	"cdeecc07",
	"cdeecc07-rm",
	"cdeecc23-tmp-rm",
	"cdeecca01",
	"cdeecca01-rm",
	"cdeecluster",
	"cdeefil10",
	"cdeefil11",
	"cdeeoa001",
	"cdeeoa002",
	"cdeeoa003",
	"cdeeoa004",
	"cdeesf10",
	"cdeesn10",
	"cdeevc01",
	"chlina10",
	"chlina10-m",
	"chlina60",
	"chlina60-m",
	"chling10-m",
	"chling11-m",
	"chling60-m",
	"chling61-m",
	"chlinn10",
	"chwidfm01-m",
	"chwidfm02-m",
	"cicero",
	"cmcy",
	"conan",
	"cosamba02",
	"cosmb01t",
	"crater",
	"crux",
	"cupid",
	"dachon01",
	"daeefil01",
	"daeesn01",
	"daesxn01",
	"dahwsn01",
	"dalina10",
	"dueefil12",
	"dueesn10",
	"duhem",
	"duhstn10",
	"duisop12",
	"duisop12-m",
	"duisop13",
	"duisop13-m",
	"dulina11",
	"dulina11-m",
	"dulinn10",
	"dusvnn10",
	"eedirqa",
	"eehstt60",
	"es4labs60",
	"esciseernc03old",
	"esciseernc07",
	"esclos01",
	"esclos105",
	"esclos105-m",
	"esclos106",
	"esclos106-m",
	"esclos107",
	"esclos107-m",
	"esclos108",
	"esclos127",
	"esclos127-m",
	"esclos128",
	"esclos128-m",
	"esclos129",
	"esclos130",
	"esclos23",
	"esclos23-m",
	"esclos24",
	"esclos24-m",
	"esclos25",
	"esclos25-m",
	"esclos26",
	"esclos26-m",
	"esclos27",
	"eseeoba83-m",
	"eseeoba84-m",
	"eseeoba85-m",
	"eseeoba86-m",
	"eseesf10",
	"eseesim",
	"eseevc87-m",
	"eseevc88-m",
	"eseevc90-m",
	"esesx001",
	"esesx001-m",
	"esesxn10",
	"esesxn60",
	"esesxn70",
	"esesxs20",
	"esesxs20-m",
	"esesxs21",
	"esjirq67-m",
	"esjirq68",
	"esjirt65",
	"esjirt66",
	"esjirt67",
	"esjirt68",
	"eskick10",
	"eskick10-rm",
	"eskick60",
	"eskick60-m",
	"eskvms20",
	"eskvms20-m",
	"eskvms21",
	"eskvms21-m",
	"eskvms60",
	"eskvms60-m",
	"eskvms61",
	"eskvms61-m",
	"eslimbo02",
	"eslina10",
	"esling64-m",
	"esling65",
	"esling65-m",
	"esling66",
	"esling66-m",
	"esling67",
	"esling67-m",
	"esling68",
	"esling68-m",
	"esling69",
	"esling69-m",
	"eslinmysqlv20",
	"eslinn10",
	"eslinn60",
	"esmaisa50-m",
	"esmsdb61",
	"esntca02p",
	"esoba003-rm",
	"esoba004-rm",
	"esoba005-m",
	"esoba006-m",
	"esodts015",
	"esodts051",
	"esodts052",
	"esodts053",
	"esodts054",
	"esodts055",
	"esodts056",
	"esopman60",
	"esopman60-rm",
	"esose060",
	"esose060-m",
	"esose061",
	"esose061-m",
	"esosev01",
	"ESOSEV02",
	"esvmstne10",
	"esvmstne11",
	"esvmstnea07",
	"esvmstnea08",
	"esvmstnes11",
	"fivaeew012",
	"flexman1",
	"fluke",
	"gata",
	"gemini",
	"hades",
	"Hangzhou",
	"hempel",
	"High",
	"himalia",
	"hubvob01",
	"hubvob02",
	"hubvob03",
	"hubvob04",
	"hubvob05",
	"hubvob06",
	"humakt",
	"hunter",
	"hupu",
	"hydra",
	"hypnos",
	"hzchblr",
	"hzchcc01",
	"hzchcc01-rm",
	"hzchcc02",
	"hzchcc02-rm",
	"hzchcc03",
	"hzlnxc03-m",
	"hzoba001",
	"hzoba001-rm",
	"hzoba002",
	"hzoba002-rm",
	"hzvxwv27",
	"joutseno",
	"kolat",
	"lieecc01",
	"lieecc01-rm",
	"lieecc02",
	"lieecc02-rm",
	"lieecluster",
	"lieefil60",
	"lieefil61",
	"lilinn01",
	"lioness",
	"lionet",
	"lip",
	"liqaan01",
	"lirndn01",
	"Lisbon",
	"liseehst10-rm",
	"liseehst11-rm",
	"litte",
	"Local",
	"lorian",
	"lux",
	"lyotard",
	"lysithea",
	"matikka3",
	"mchp7yba",
	"metis",
	"michon01",
	"michov20",
	"michov21",
	"midmxn01",
	"mieecc01",
	"mieecc02",
	"mudmxn10",
	"mueecc11",
	"mueecc11-rm",
	"mueecc12",
	"mueecc12-rm",
	"mueecc13",
	"mueecc13-rm",
	"mueevc02b",
	"muesxn10",
	"muesxs20",
	"muesxs20-rm",
	"muesxs21",
	"muvmp069",
	"muvmp070",
	"muvmp084",
	"mvs2",
	"mvs4",
	"norma",
	"Normal",
	"nox",
	"No_Backup",
	"obsoletes",
	"orthanc",
	"ouarcn10",
	"oucgw03",
	"oucgw04",
	"oudmxn10",
	"oudmxn60",
	"oueecc01",
	"oueecc01-t-m",
	"oueecc02",
	"oueecc02-t-m",
	"oueecluster",
	"ouhwsg92-m",
	"ouhwsn10",
	"ouhwsn60",
	"oulina10",
	"oulina10-m",
	"oulina60",
	"ourndn60",
	"ouwicatq",
	"pandora",
	"pax",
	"persian",
	"piroska",
	"polaris",
	"pulu",
	"pvcsou01",
	"pvcsou60",
	"pvcsou60-m",
	"rhevmgr",
	"salmon",
	"seeoa610-m",
	"sf-watt",
	"Shanghai",
	"shchcc01",
	"shchcc02",
	"shchon01",
	"shrndn01",
	"shvxwg01",
	"sieecc01",
	"sieecc02",
	"singer",
	"sirius",
	"SKADI",
	"storage-dev",
	"SVM00004",
	"szneess01",
	"tachon01",
	"taeecc01",
	"taeecc02",
	"taeecluster",
	"taeefil01",
	"taeeoa01-rm",
	"taeesf01",
	"taeesn01",
	"taeevc01",
	"taeevc02",
	"taesxn01",
	"taesxs20",
	"taesxs21",
	"tahwsn01",
	"talina10",
	"talina10-rm",
	"taling01",
	"talinn01",
	"talinv01",
	"talinv02",
	"Tampere",
	"taqaan01",
	"tarndn01",
	"tavxwg01",
	"tavxwg02",
	"trsrv020",
	"ttcn-master-1",
	"ttcn-sun1-rastre",
	"ttcn-sun2-rastre",
	"typhon",
	"ulchon10",
	"uleefil10",
	"uleefil11",
	"uleeoa01",
	"uleeoa02",
	"uleeoa03",
	"ullteb45-rm",
	"ullteb46",
	"ullteb46-rm",
	"ullteb47",
	"ullteb47-rm",
	"ullteb48",
	"ullteb48-rm",
	"ullteb50",
	"ullteb50-rm",
	"ulqaan10",
	"ulsmb01",
	"ulsvnn10",
	"vavmsas02",
	"vavmsiatest",
	"vavmsing01",
	"vavmsing02",
	"vavmsp01",
	"vavmstne00",
	"vavmstne07",
	"vavmstne08",
	"vavmstning0",
	"vavmsvs08",
	"vendace",
	"virgo",
	"vogon",
	"wasps003",
	"wasps004",
	"wasrv001net",
	"wrbtsn10",
	"wreecc01",
	"wreecc01-rm",
	"wreecc02",
	"wreecc02-rm",
	"wrqaan01",
	"wrrndn01",
	"wrsvnn01",
	"wrsvnn10",
	"xeseew003",
	"yanafal",
	"zeus",
	"zeusbpm",
	"zizek"
];
