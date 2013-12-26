소개
====
모바일 사이트에서 많이 사용되어지는 플리킹 플러그인입니다. 
자바스크립트와 jQuery 동시에 지원하며 슬라이드의 무한 루프와 페이징 기능등 많이 사용되어지는 기능을 넣었습니다. 
단, IE7, IE8 등 css3를 지원하지 않는 브라우저에서는 사용하실 수 없습니다.



시작하기
========

###HTML
HTML 구조는 '리스를 감싸는 태그 > 리스트 태그 > 각 리스트' 구조를 가져야 합니다.
아래의 예제를 참고하세요.

	<div class="wrap">
		<ul class="list">
			<li class="items">슬라이드 1</li>
			<li class="items">슬라이드 2</li>
			<li class="items">슬라이드 3</li>
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
리스트와 리스트아이템은 반드시 가로, 세로 길이를 명시하여야 합니다. 
다만 세로 길이를 퍼센트로 명시할 경우 화면에서 보이지 않을 수 있습니다.
아래의 예제를 참고하세요.

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
아래의 예제를 참고하세요.

	$( '.wrap' ).slide4swipe( );



###JAVASCRIPT
list 옵션값은 반드시 있어야합니다.
아래의 예제를 참고하세요.

	new Slide4Swipe( {
		list: document.querySelectorAll( '.wrap li' )
	} );



함수
----
- **toPrev**: 이전 슬라이드 이동
- **toNext**: 다음 슬라이드 이동
- **toSlide(index)**: 지정된 슬라이드 이동
- **getPos**: 현재 슬라이드 인덱스
- **startSlideShow**: 슬라이드쇼 멈춤
- **stopSlideShow**: 슬라이드쇼 멈춤

###jQuery 함수 사용 예제
	
	$( '.wrap' ).slide4swipe( {
		$toStart: $( '.to-start' ),
		$toStop: $( '.to-stop' ),
		$toPrev: $( '.to-prev' ),
		$toNext: $( '.to-next' ),
		$pages: $( '.pages button' )
	} );

###JavaScript 함수 사용 예제

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



jQuery 옵션들
-------------
- **$list**: require, 리스트 jQuery Selector / Default = $( this ).find( 'ul li' )
- **$pages**: 슬라이드 이동 버튼 jQuery Selector / Default = null
- **$toStart**: 슬라이드쇼 시작 버튼 jQuery Selector / Default = null
- **$toStop**: 슬라이드쇼 멈춤 버튼 jQuery Selector / Default = null
- **$toPrev**: 이전 이동 버튼 jQuery Selector / Default = null
- **$toNext**: 다음 이동 버튼 jQuery Selector / Default = null

Javascript 옵션들
-----------------
- **list**: require, 리스트 Elements / Default = null
- **pages**: 슬라이드 이동 버튼 Elements / Default = null
- **toStart**: 슬라이드쇼 시작 버튼 Elements / Default = null
- **toStop**: 슬라이드쇼 멈춤 버튼 Elements / Default = null
- **toPrev**: 이전 이동 버튼 Elements / Default = null
- **toNext**: 다음 이동 버튼 Elements / Default = null

공통 옵션들
-----------
- **startEvents(Array)**: toStart element 이벤트 / Default = [ 'click', 'mouseover' ]
- **stopEvents(Array)**: toStop element 이벤트 / Default = [ 'click', 'mouseover' ]
- **moveEvents(Array)**: toPrev, toNext elements 이벤트 / Default = [ 'click', 'mouseover' ]
- **pageEvents(Array)**: pages element 이벤트 / Default = [ 'click', 'mouseover' ]
- **touchMinumRange(Integer)**: 사용자 터치시, 다음(혹은 이전) 슬라이더로 넘어갈 기준값(백분율). Range = 1~100 / Default = 10
- **duration(Integer)**: 슬라이드간 움직인 시간. Default = 300
- **loop(Boolean)**: 루프 여부. Default = true
- **slideShowTime(Integer or Boolean)**: 슬라이드쇼 시간, false 설정시, 슬라이드쇼 설정 안됨. Default = 3000
- **create(Function)**: 생성시 콜백 함수.
- **active(Function)**: 슬라이드 이동 후 콜백 함수.



###jQuery 옵션 예제
	
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

###Javascript 옵션 예제

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



저작권 및 연락처
----------------
- 라이센스: http://blim.mit-license.org/
- 이메일: kkh975@naver.com
