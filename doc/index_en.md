Introduce
=========
This is a Swipe Plugin for useful Mobile Web.
This support in jQuery, Javascript
But, You can't use unsupport broswer in CSS3 like IE7, IE8...



Getting Started
===============

###HTML
You must has HTML Structor like the 'Wrap the List tag > List tag > each List';
Look at the example in below.

	<div class="wrap">
		<ul class="list">
			<li class="items">Slide 1</li>
			<li class="items">Slide 2</li>
			<li class="items">Slide 3</li>
		</ul>
	</div>

	<div class="btns">
		<button type="button" class="to-start">slide show start</button>
		<button type="button" class="to-stop">slide show stop</button>
		<button type="button" class="to-prev">move prev</button>
		<button type="button" class="to-next">move next</button>

		<div class="pages">
			<button type="button">1</button>
			<button type="button">2</button>
			<button type="button">3</button>
		</div>
	</div>



###CSS
You must has options Width size and Height size.
Look at the example in below.

	.wrap {
		overflow: hidden;
		width: ...;
		height: ...;
	}
	.list {
		width: 100%; 
		height: 100px;
	}
	.items {
		width: 100%;
		height: 100px;
	}



###JQUERY
Look at the Example in below.

	$( '.wrap' ).slide4swipe( );



###JAVASCRIPT
You must has List option.
Look at the example in below.

	new Slide4Swipe( {
		list: document.querySelectorAll( '.wrap li' )
	} );



Function
--------
- **toPrev**: Move to Prev Slide
- **toNext**: Move to Next Slide
- **toSlide(index)**: Move to Slide
- **getPos**: get Slide Index
- **startSlideShow**: Slide Show Start
- **stopSlideShow**: Slide Show Stop

###jQuery Function Example
	
	$( '.wrap' ).slide4swipe( {
		$toStart: $( '.to-start' ),
		$toStop: $( '.to-stop' ),
		$toPrev: $( '.to-prev' ),
		$toNext: $( '.to-next' ),
		$pages: $( '.pages button' )
	} );

###JavaScript Function Example

	new Slide4Swipe( {
		list: document.querySelectorAll( '.wrap li' ),
		toStart: document.querySelectorAll( '.to-start' ),
		toStop: document.querySelectorAll( '.to-stop' ),
		toPrev: document.querySelectorAll( '.to-prev' ),
		toNext: document.querySelectorAll( '.to-next' ),
		pages: document.querySelectorAll( '.pages button' )
	} );

	// or

	var swipe = new Slide4Swipe( {
		list: document.querySelectorAll( '.wrap li' ),
		toStart: document.querySelectorAll( '.to-start' ),
		toStop: document.querySelectorAll( '.to-stop' ),
		toPrev: document.querySelectorAll( '.to-prev' ),
		toNext: document.querySelectorAll( '.to-next' ),
		pages: document.querySelectorAll( '.pages button' )
	} );

	document.querySelectorAll( '.to-start' )[ 0 ].addEventListener( 'click', swipe.slideShowStart, false );
	document.querySelectorAll( '.to-stop' )[ 0 ].addEventListener( 'click', swipe.slideShowStop, false );
	document.querySelectorAll( '.to-prev' )[ 0 ].addEventListener( 'click', swipe.toPrev, false );
	document.querySelectorAll( '.to-next' )[ 0 ].addEventListener( 'click', swipe.toNext, false );

	document.querySelectorAll( '.pages .button' )[ 0 ].addEventListener( 'click', function( ) {
		swipe.toSlide( 0 );
	}, false );

	document.querySelectorAll( '.pages .button' )[ 1 ].addEventListener( 'click', function( ) {
		swipe.toSlide( 1 );
	}, false );

	document.querySelectorAll( '.pages .button' )[ 2 ].addEventListener( 'click', function( ) {
		swipe.toSlide( 2 );
	}, false );



jQuery Options
--------------
- **$list**: require, List jQuery Selector / Default = $( this ).find( 'ul li' )
- **$pages**: Button jQuery Selector for Move to Slide / Default = null
- **$toStart**: Button jQuery Selector for Start Slide Show / Default = null
- **$toStop**: Button jQuery Selector for Stop Slide Show / Default = null
- **$toPrev**: Button jQuery Selector for Move to Prev Slide / Default = null
- **$toNext**: Button jQuery Selector for Move to Next Slide / Default = null

Javascript Options
------------------
- **list**: require, List Elements / Default = null
- **pages**: Button Elements for Move to Slide / Default = null
- **toStart**: Button Elements for Start Slide Show / Default = null
- **toStop**: Button Elements for Stop Slide Show / Default = null
- **toPrev**: Button Elements for Move to Prev Slide / Default = null
- **toNext**: Button Elements for Move to Next Slide / Default = null

Common Options
--------------
- **startEvents(Array)**: toStart elements events / Default = [ 'click', 'mouseover' ]
- **stopEvents(Array)**: toStop element events / Default = [ 'click', 'mouseover' ]
- **moveEvents(Array)**: toNext and toPrev elements events / Default = [ 'click', 'mouseover' ]
- **pageEvents(Array)**: pages elements events / Default = [ 'click', 'mouseover' ]
- **touchMinumRange(Integer)**: When touched, Value for move to prev and next slide(percentage). Range = 1~100 / Default = 10
- **duration(Integer)**: Animate time. Default = 300
- **loop(Boolean)**: is loop. Default = true
- **slideShowTime(Integer or Boolean)**: Slide show time, If you have false, it doesn't slide show. Default = 3000
- **create(Function)**: Create after Callback Function.
- **active(Function)**: Slide move after Callback Function.



###jQuery Option Example
	
	$( '.wrap' ).slide4swipe( {
		startEvents: [ 'click' ],
		stopEvents: [ 'click' ],
		moveEvents: [ 'click' ],
		pageEvents: [ 'click' ],
		touchMinumRange: 25,
		duration: 300,
		loop: false,
		slideShowTime: false,
		create: function( ) {
			alert( 'Install' );
		},
		active: function( index ) {
			alert( 'This slide is ' + index );
		}		
	} );

###Javascript Option Example

	new BaseSwipe( {
		startEvents: [ 'click' ],
		stopEvents: [ 'click' ],
		moveEvents: [ 'click' ],
		pageEvents: [ 'click' ],
		touchMinumRange: 25,
		duration: 300,
		loop: false,
		slideShowTime: false,
		create: function( ) {
			alert( 'Install' );
		},
		active: function( index ) {
			alert( 'This slide is ' + index );
		}	
	} );



Copyright And Contact
---------------------
- Linense: http://blim.mit-license.org/
- Email: kkh975@naver.com
