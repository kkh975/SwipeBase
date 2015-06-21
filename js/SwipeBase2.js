/*!*
 * @autor: Blim - Koo Chi Hoon(kkh975@naver.com)
 * @license http://blim.mit-license.org/
 */
( function( $ ){

	'use strict';

	/**
	 * @method: 슬라이더 플러그인
	 */
	$.fn.swipeBase = function( option ){
		option         = option || {};
		option.$list   = option.$list || $( this ).find( '> ul > li' );
		option.$wrap   = option.$wrap || $( this ).find( '> ul' );
		option.wrap    = option.$wrap.toArray() || [];
		option.list    = option.$list.toArray() || [];
		option.pages   = ( option.$pages && option.$pages.toArray ) ? option.$pages.toArray() : [];
		option.toStart = ( option.$toStart && option.$toStart.toArray ) ? option.$toStart.toArray() : [];
		option.toStop  = ( option.$toStop && option.$toStop.toArray ) ? option.$toStop.toArray() : [];
		option.toPrev  = ( option.$toPrev && option.$toPrev.toArray ) ? option.$toPrev.toArray() : [];
		option.toNext  = ( option.$toNext && option.$toNext.toArray ) ? option.$toNext.toArray() : [];

		return this.each( function(){
			$( this ).data( 'swipeBase', new SwipeBase( option ));
		});
	};

	/**
	 * @method: 슬라이더쇼 시작 플러그인
	 */
	$.fn.swipeBase2start = function(){
		return this.each( function(){
			$( this ).data( 'swipeBase' ).startSlideShow();
		});
	};

	/**
	 * @method: 슬라이더쇼 정지 플러그인
	 */
	$.fn.swipeBase2stop = function(){
		return this.each( function(){
			$( this ).data( 'swipeBase' ).stopSlideShow();
		});
	};

	/**
	 * @method: 이전 슬라이더 이동 플러그인
	 */
	$.fn.swipeBase2prev = function(){
		return this.each( function(){
			$( this ).data( 'swipeBase' ).toPrev();
		});
	};

	/**
	 * @method: 다음 슬라이더 이동 플러그인
	 */
	$.fn.swipeBase2next = function(){
		return this.each( function(){
			$( this ).data( 'swipeBase' ).toNext();
		});
	};

	/**
	 * @method: 특정 슬라이더 이동 플러그인
	 */
	$.fn.swipeBase2slide = function( _idx ){
		return this.each( function(){
			$( this ).data( 'swipeBase' ).toSlide( _idx );
		});
	};

	/**
	 * @method: 슬라이드 제거
	 */       
	$.fn.swipeBase2destory = function( _idx ){
		return this.each( function(){
			$( this ).data( 'swipeBase' ).destory();
		});
	};
}( jQuery ));

/*!*
 * @method: SwipeBase 함수
 */
function SwipeBase( __setting ){

	'use strict';

	var BASE_DISTANCE    = 100,
		setting          = null,
		D_Wrap           = null,
		D_Plist          = null,
		D_List           = null,
		D_To_Pages       = null,
		D_To_Start       = null,
		D_To_Stop        = null,
		D_To_Prev        = null,
		D_To_Next        = null,
		slide_Show_Timer = null,
		is_Loop_Len_2    = false,
		is_Slide_Show    = false,
		is_Move          = false,
		list_Width       = 0,
		space_Width      = 0,
		list_Len         = 0,
		now_Idx          = 0,
		to_Idx           = 0,
		browser_Prefix   = {};

	var default_Option = {
		wrap            : null,		// require, 리스트 감싸는 태그
		list            : null,		// require, 리스트
		pages           : null,		// 슬라이더 페이징 이동
		toStart         : null,		// 애니메이션 시작 버튼
		toStop          : null,		// 애니메이션 멈춤 버튼
		toPrev          : null,		// 이전 이동 버튼
		toNext          : null,		// 다음 이동 버튼
		startEvents     : 'click',	// 슬라이드쇼 시작 이벤트
		stopEvents      : 'click',	// 슬라이드쇼 정지 이벤트
		moveEvents      : 'click',	// 이동 작동 이벤트
		pageEvents      : 'click',	// 페이징 작동 이벤트
		slideShowTime   : 3000,		// 슬라이드쇼 시간
		touchMinumRange : 10,		// 터치시 최소 이동 거리
		loop            : true,		// 무한 여부
		duration        : 300,		// 애니메이션 시간
		create          : null,		// 생성 후 콜백함수
		before          : null,		// 액션 전 콜백함수
		active          : null		// 액션 후 콜백함수
	};

	var helper = { 
		/**
		 * @method: jQuery extend 기능
		 */
		extend: function( _target, _object ){
			var prop = null,
				return_obj = {};

			for( prop in _target ){
				return_obj[ prop ] = prop in _object ? _object[ prop ] : _target[ prop ];
			}

			return return_obj;
		},

		/**
		 * @method: 배열 여부
		 */
		isArray: function( _arr ){
			return _arr && Object.prototype.toString.call( _arr ) === '[object Array]';
		},

		/**
		 * @method: DOM에서 배열변환(Array.slice 안먹힘)
		 */
		dom2Array: function( _dom ){
			var arr = [],
				i = 0,
				len = 0;

			if ( _dom ){
				len = _dom.length;

				if ( len > 0 ){
					for ( i = 0; i < len; i++ ){
						arr.push( _dom[ i ] );
					}
				} else {
					arr.push( _dom );
				}

				return arr;
			} else {
				return null;
			}
		},

		/**
		 * @method: DOM에서 배열변환(Array.slice 안먹힘)
		 */
		object2Array: function( _obj ){
			var arr = [];

			for ( var key in _obj ){
				arr.push( _obj[ key ] );
			}

			return arr;
		},

		/**
		 * @method: css3의 transition 접미사
		 */
		getCssPrefix: function(){
			/*TRANSITIONENDEVENT_VENDORS = [
				'transitionEnd',
				'transitionend',
				'otransitionend',
				'oTransitionEnd',
				'webkitTransitionEnd' ]
			ANIMATIONEVENT_VENDORS = [
				'animationEnd',
				'MSAnimationEnd',
				'oanimationEnd',
				'webkitAnimationEnd' ]*/
			var transitionsCss   = [ '-webkit-transition', 'transition' ],
				transformsCss    = [ '-webkit-transform', 'transform' ],
				transitionsJs    = [ 'webkitTransition', 'transition' ],
				transformsJs     = [ 'webkitTransform', 'transform' ],
				transitionsendJs = [ 'webkitTransitionEnd', 'transitionend' ],
				styles           = window.getComputedStyle( document.body, '' ),
				prefixCss        = ( helper.object2Array( styles ).join('').match( /-(webkit|moz|ms|o)-/ ) || (styles.OLink === '' && [ '', 'o' ]))[ 1 ],
				prefixJs         = ( 'WebKit|Moz|MS|O' ).match( new RegExp('(' + prefixCss + ')', 'i' ))[ 1 ],
				isWebkit         = prefixCss === 'webkit';

			return {
				'prefixCss'        : prefixCss,
				'prefixJs'         : prefixJs.toLowerCase(),
				'transitionsCss'   : transitionsCss[ isWebkit ? 0 : 1 ],
				'transformsCss'    : transformsCss[ isWebkit ? 0 : 1 ],
				'transformsJs'     : transformsJs[ isWebkit ? 0 : 1 ],
				'transitionsJs'    : transitionsJs[ isWebkit ? 0 : 1 ],
				'transitionsendJs' : transitionsendJs[ isWebkit ? 0 : 1 ]
			};
		},

		/**
		 * @method: css3 animation 지원 여부
		 */
		hasCss3Animation: function(){
			return browser_Prefix.transitionsJs in document.createElement( 'div' ).style;
		},

		/**
		 * @method: 현재 위치 알아오기
		 */
		getCss3TransformPos: function( _dom ){
			var css_txt = '';

			css_txt = _dom.style[ browser_Prefix.transformsJs ];
			css_txt = css_txt.substring( css_txt.indexOf( '(' ) + 1, css_txt.indexOf( '%' ));

			return parseFloat( css_txt );
		},

		/**
		 * @method: 애니메이션 설정
		 */
		setCss3Transition: function( _dom, _speed, _pos ){
			helper.setCss3( _dom, 'transition', _speed + 'ms' );
			helper.setCss3( _dom, 'transform', 'translateX('+ _pos + '%)' );
		},

		/**
		 * @method: css3 설정
		 */
		setCss3: function( _dom, _prop, _value ){
			if ( _prop === 'transition' ){
				_dom.style[ browser_Prefix.transitionsJs ] = _value;
			} else if ( _prop === 'transform' ){
				_dom.style[ browser_Prefix.transformsJs ] = _value;
			} else {
				_dom.style[ _prop ] = _value;
				_dom.style[ '-' + browser_Prefix.prefixJs + '-' + _prop ] =  _value;
			}
		},

		/**
		 * @method: 버튼 이벤트 설정
		 */
		setBtnEvent: function( _doms, _evts, _callback ){
			var evt_arr = _evts.split( ',' ),
				evt_idx = evt_arr.length,
				idx = _doms.length,
				evt = '';

			while( --evt_idx > -1 ){
				while( --idx > -1 ){
					( function( __idx ){
						_doms[ __idx ].addEventListener( evt_arr[ evt_idx ], function( e ){
							_callback( __idx );
							e.preventDefault();
						});
					}( idx ));
				}
			}
		}
	};

	var touchEvents = { 
		is_touch_start : false,
		touch_start_x  : 0,
		touch_start_y  : 0,
		move_dx        : 0,

		/**
		 * @method: 변수 초기화
		 */
		setInitVaiable: function(){
			touchEvents.is_touch_start = false;
			touchEvents.touch_start_x  = 0;
			touchEvents.touch_start_y  = 0;
			touchEvents.move_dx        = 0;
		},

		/**
		 * @method: 이전으로 이동가능한가
		 */
		canPrevMove: function(){
			// 루프가 아니면서 가장자리에 있을때
			if ( !setting.loop && getPrevIdx() === -1 ){ 
				return false;
			}

			return true;
		},

		/**
		 * @method: 이후로 이동가능한가
		 */
		canNextMove: function(){
			var next_idx = getNextIdx(),
				len = ( is_Loop_Len_2 ? list_Len - 2 : list_Len ) - 1;

			// 루프가 아니면서 가장자리에 있을때
			if ( !setting.loop && ( next_idx === -1 || next_idx > len )){ 
				return false;
			}

			return true;
		},

		/**
		 * @method: 터치 시작 이벤트
		 * @param: {Object} 이벤트 객체
		 */
		setStart: function( e ){
			// 이미 start된 동작이 있거나 움직이면 중복되지 않게 막음
			if ( touchEvents.is_touch_start || is_Move ){
				return false;
			}

			stopSlideShow();

			if ( !touchEvents.is_touch_start && e.type === 'touchstart' && e.touches.length === 1 ){
				touchEvents.is_touch_start = true;
				touchEvents.touch_start_x  = e.touches[ 0 ].pageX;
				touchEvents.touch_start_y  = e.touches[ 0 ].pageY;
			}
		},

		/**
		 * @method: 터치 중 이벤트
		 * @param: {Object} 이벤트 객체
		 */
		setMove: function( e ){
			var drag_dist = 0,
				scroll_dist = 0;

			if ( is_Move ){
				return;
			}

			// 이미 start된 동작이 있어야만 작동
			if ( touchEvents.is_touch_start && e.type === 'touchmove' && e.touches.length === 1 ){
				drag_dist   = e.touches[ 0 ].pageX - touchEvents.touch_start_x;	// 가로 이동 거리
				scroll_dist = e.touches[ 0 ].pageY - touchEvents.touch_start_y;	// 세로 이동 거리
				touchEvents.move_dx = ( drag_dist / list_Width ) * 100;			// 가로 이동 백분률

				// 드래그길이가 스크롤길이 보다 클때
				if ( Math.abs( drag_dist ) > Math.abs( scroll_dist )){
					touchEvents.move_dx = Math.max( -100, Math.min( 100, touchEvents.move_dx ));
					helper.setCss3Transition( D_Plist, 0, touchEvents.move_dx );	
					e.preventDefault();
				}
			}
		},

		/**
		 * @method: 터치 완료 이벤트
		 * @param: {Object} 이벤트 객체
		 */
		setEnd: function( e ){
			var over_touch = Math.abs( touchEvents.move_dx ) > setting.touchMinumRange,
				is_to_next = touchEvents.move_dx < 0,
				can_move = is_to_next ? touchEvents.canNextMove() : touchEvents.canPrevMove();

			if ( is_Move ){
				return;
			}

			if ( over_touch && can_move ){
				is_to_next ? toNext() : toPrev();
			} else {
				helper.setCss3Transition( D_Plist, setting.duration, 0 );
			
				// 움직이없음에도 is_Move가 true로 설정되어 다운됨.
				// 현재 보이는 위치가 0 그대로이면 is_Move를 해제
				if ( helper.getCss3TransformPos( D_List[ now_Idx ] ) === 0 ){
					is_Move = false;
				}
			}

			touchEvents.setInitVaiable();
		}
	};

	/**
	 * @method: 생성자
	 */
	function constructor(){
		// 플러그인에서 배열로 넘겨줄때 패스
		// javascrit로 바로 들어오면 dom2Array
		setting = helper.extend( default_Option, __setting );
		D_Plist = helper.isArray( setting.wrap ) ? setting.wrap : helper.dom2Array( setting.wrap ); 
		D_List  = helper.isArray( setting.list ) ? setting.list : helper.dom2Array( setting.list ); 

		// 필수요소 체크
		if ( !D_List || !D_Plist ){ 
			return false;
		}

		list_Len = D_List.length;
		D_Plist = D_Plist[ 0 ];
		D_Wrap = D_Plist.parentNode;

		browser_Prefix = helper.getCssPrefix();
		setting.touchMinumRange = Math.max( 1, Math.min( 100, setting.touchMinumRange ));

		// list이거나, 리스트가 1이하이면 함수 종료
		if ( list_Len < 2 ){ 
			return false;
		}

		// 필수 요소 체크
		if ( !( helper.hasCss3Animation() && 'addEventListener' in window && 'querySelector' in document )){
			return false;
		}

		// 슬라이드쇼 옵션 존재
		if ( setting.slideShowTime ){ 
			if ( typeof setting.slideShowTime === 'boolean' ){
				is_Slide_Show = setting.slideShowTime;

				// true일때, 숫자값 대입
				if ( is_Slide_Show ){ 
					setting.slideShowTime = default_Option.slideShowTime;
				}
			}

			if ( typeof setting.slideShowTime === 'string' ){
				setting.slideShowTime = parseInt( setting.slideShowTime, 10 );
			}

			// 타입이 숫자가 아니면
			if ( isNaN( setting.slideShowTime )){ 
				is_Slide_Show = false;
			} else {
				is_Slide_Show = true;

				// 슬라이드쇼가 애니메이션 시간보다 짧을때
				if ( setting.duration * 2 >= setting.slideShowTime ){ 
					setting.slideShowTime = setting.duration * 2;
				}
			}
		}

		// 애니메이션 시작 버튼
		if ( setting.toStart ){ 
			D_To_Start = helper.isArray( setting.toStart ) ? setting.toStart : helper.dom2Array( setting.toStart );
			helper.setBtnEvent( D_To_Start, setting.startEvents, startSlideShow );
		}

		// 애니메이션 멈춤 버튼
		if ( setting.toStop ){ 
			D_To_Stop  = helper.isArray( setting.toStop ) ? setting.toStop : helper.dom2Array( setting.toStop );
			helper.setBtnEvent( D_To_Stop, setting.stopEvents, stopSlideShow );
		}

		// 왼쪽 버튼
		if ( setting.toPrev ){ 
			D_To_Prev  = helper.isArray( setting.toPrev ) ? setting.toPrev : helper.dom2Array( setting.toPrev );
			helper.setBtnEvent( D_To_Prev, setting.moveEvents, toPrev );
		}

		// 오른쪽 버튼
		if ( setting.toNext ){ 
			D_To_Next  = helper.isArray( setting.toNext ) ? setting.toNext : helper.dom2Array( setting.toNext );
			helper.setBtnEvent( D_To_Next, setting.moveEvents, toNext );
		}

		// 페이징 이동
		if ( setting.pages ){ 
			D_To_Pages = helper.isArray( setting.pages ) ? setting.pages : helper.dom2Array( setting.pages );
			helper.setBtnEvent( D_To_Pages, setting.moveEvents, function( _idx ){
				toSlide( _idx );
			});
		}

		// 루프이면서 리스트가 두개일때
		if ( list_Len === 2 && setting.loop ){ 
			var tmp_dom = null;

			// 처음 노드 복사
			tmp_dom = D_List[ 0 ].cloneNode( true );
			D_List.push( tmp_dom );
			D_Plist.appendChild( tmp_dom );

			// 두번째 노드 복사
			tmp_dom = D_List[ 1 ].cloneNode( true ); 
			D_List.push( tmp_dom );
			D_Plist.appendChild( tmp_dom );

			is_Loop_Len_2 = true;
			list_Len = 4;
		}

		D_Wrap.addEventListener( 'touchstart', touchEvents.setStart );
		D_Wrap.addEventListener( 'touchmove', touchEvents.setMove );
		D_Wrap.addEventListener( 'touchend', touchEvents.setEnd );
		D_Wrap.addEventListener( 'touchcancel', touchEvents.setEnd );
		D_Wrap.addEventListener( browser_Prefix.transitionsendJs, toSlideAnimateAfter, false );

		var idx = D_List.length;

		while( --idx > -1 ){ 			
			// 포커스시 애니메이션 on/off
			D_List[ idx ].addEventListener( 'focus', stopSlideShow, false );
			D_List[ idx ].addEventListener( 'blur', startSlideShow, false );
		}

		return true;
	}

	/**
	 * @method: 초기화 스타일
	 */
	function setInitStyle(){
		D_Wrap.style.overflow = 'hidden';

		D_Plist.style.position = 'relative';
		helper.setCss3( D_Plist, 'transform-style', 'preserve-3d' );
		helper.setCss3Transition( D_Plist, 0, 0 );	

		list_Width  = D_Wrap.offsetWidth;
		space_Width = ( 100 - ( ( D_List[ 0 ].offsetWidth / list_Width ) * 100 ) ) / 2;

		for ( var i = 0, len = list_Len, pos = 0; i < len; i++ ){
			pos = setting.loop && list_Len - 1 === i ? -BASE_DISTANCE : BASE_DISTANCE * i;
			pos += space_Width;

			D_List[ i ].style.position = 'absolute';
			helper.setCss3Transition( D_List[ i ], 0, pos );
		}

		startSlideShow();

		if ( typeof setting.create === 'function' ){ 
			setting.create( getNowIdx());
		}
	}

	/**
	 * @method: 제거
	 */
	function destory(){
		var idx = D_List.length;

		D_Wrap.removeEventListener( 'touchstart', touchEvents.setStart );
		D_Wrap.removeEventListener( 'touchmove', touchEvents.setMove );
		D_Wrap.removeEventListener( 'touchend', touchEvents.setEnd );
		D_Wrap.removeEventListener( 'touchcancel', touchEvents.setEnd );
		D_Wrap.removeEventListener( browser_Prefix.transitionsendJs, toSlideAnimateAfter, false );

		while( --idx > -1 ){
			// 포커스시 애니메이션 on/off
			D_List[ idx ].removeEventListener( 'focus', stopSlideShow, false );
			D_List[ idx ].removeEventListener( 'blur', startSlideShow, false );
		}
	}

	/**
	 * @method: 애니메이션 시작
	 */
	function startSlideShow(){
		if ( is_Slide_Show && slide_Show_Timer === null ){
			slide_Show_Timer = setInterval( toNext, setting.slideShowTime );
		}
	}

	/**
	 * @method: 애니메이션 멈춤
	 */
	function stopSlideShow(){
		clearInterval( slide_Show_Timer );
		slide_Show_Timer = null;
	}

	/**
	 * @method: 화면 리사이즈
	 */
	function refreshSize(){
		list_Width  = D_Wrap.offsetWidth;
		space_Width = ( 100 - ( ( D_List[ 0 ].offsetWidth / list_Width ) * 100 ) ) / 2;
	}

	/**
	 * @method: 현재 포지션 얻기
	 */
	function getNowIdx(){
		return now_Idx;
	}

	/**
	 * @method: 현재 포지션 셋팅
	 */
	function setNowIdx( _now_idx ){
		now_Idx = _now_idx;
	}

	/**
	 * @method: 이동할 포지션 얻기
	 */
	function getToIdx(){
		return to_Idx;
	}

	/**
	 * @method: 이동할 포지션 셋팅
	 */
	function setToIdx( _to_idx ){
		to_Idx = _to_idx;
	}

	/**
	 * @method: 이전 인덱스 얻기
	 */
	function getPrevIdx(){
		var idx = getNowIdx();

		if ( --idx < 0 ){
			idx = setting.loop ? list_Len - 1 : -1;
		}

		return idx;
	}

	/**
	 * @method: 다음 인덱스 얻기
	 */
	function getNextIdx(){
		var idx = getNowIdx();

		if ( ++idx > list_Len - 1 ){
			idx = setting.loop ? 0 : -1;
		}

		return idx;
	}

	/**
	 * @method: 이전 슬라이더 이동
	 */
	function toPrev(){
		toSlide( getPrevIdx(), 'prev' );
	}

	/**
	 * @method: 이후 슬라이더 이동
	 */
	function toNext(){
		toSlide( getNextIdx(), 'next' );
	}

	/**
	 * @method: 슬라이더로 이동
	 */
	function toSlide( _to_idx, _way ){
		var now_idx = getNowIdx(),
			gap = _to_idx - now_idx,
			is_direct_access = arguments.length === 1;

		// 이동중이면 종료
		if ( is_Move ){
			return false;
		}

		// 현재 슬라이면 종료
		if ( _to_idx === now_idx ){ 
			return false;
		}

		// 범위 초과면 종료
		if ( _to_idx < 0 || _to_idx > list_Len - 1 ){ 
			return false;
		}

		// 루프이면서 길이가 2이면서 다이렉트 접근시 범위 초과이거나 같은 위치일때
		if ( is_Loop_Len_2 && is_direct_access && ( _to_idx > 1 || _to_idx % 2 === now_idx % 2 )){
			return false;
		}

		// toSlide 함수를 직접 들어왔을 시
		if ( is_direct_access ){ 
			_way = gap > 0 ? 'next' : 'prev';
		}

		// 방향 교정
		if ( is_Loop_Len_2 && is_direct_access && ( _to_idx % 2 === 1 && now_idx % 2 === 0 )){
			_way = 'next';
		}

		setToIdx( _to_idx );
		toSlideAnimateBefore( _way );
		toSlideAnimate( setting.duration, _way );
	}

	/**
	 * @method: 슬라이더 애니메이션 이전
	 */
	function toSlideAnimateBefore( _way ){
		var now_idx = getNowIdx(),
			to_idx  = getToIdx(),
			i       = list_Len;

		setAnimateBefore();

		// 선택 화면만 보이기
		while( --i > -1 ){ 
			D_List[ i ].style.visibility = ( i === now_idx || i === to_idx ) ? 'visible' : 'hidden';
		}

		// 위치 정해주기
		helper.setCss3Transition( D_List[ now_idx ], 0, 0 + space_Width );
		helper.setCss3Transition( D_List[ to_idx ], 0, ( _way === 'next' ? BASE_DISTANCE : -BASE_DISTANCE ) + space_Width );

		if ( typeof setting.before === 'function' ){
			setting.before( is_Loop_Len_2 ? now_idx % 2 : now_idx );
		}
	}

	/**
	 * @method: 슬라이더 애니메이션
	 */
	function toSlideAnimate( _time, _way ){
		var now_idx = getNowIdx(),
			now_pos = helper.getCss3TransformPos( D_Plist ),
			pos     = 0;

		pos = _way === 'next' ? -BASE_DISTANCE : BASE_DISTANCE;
		pos = _way === 'next' ? pos + ( space_Width * 2 ) : pos - ( space_Width * 2 );

		if ( Math.abs( now_pos.toFixed( 2 ) ) == space_Width.toFixed( 2 ) ){
			helper.setCss3Transition( D_Plist, _time, pos );	
		} else {
			// touch로 접근시, 사용자가 빠르게 터치해서 이미 끝으로 도달 했을 시
			if ( now_pos % BASE_DISTANCE === 0 ){ 
				toSlideAnimateAfter({
					target: D_List[ now_idx ]
				});
			} else {
				// swipe 탄력적으로
				// 거리:전체거리 = 남은거리(x):전체시간 -> 거리 * 전체시간 / 전체거리
				// _time = _time * ( BASE_DISTANCE - Math.abs( now_pos )) / BASE_DISTANCE;
				helper.setCss3Transition( D_Plist, _time, pos );
			}	
		}
	}

	/**
	 * @method: 슬라이더 애니메이션 이후
	 */
	function toSlideAnimateAfter( e ){
		var now_idx  = getNowIdx(),
			to_idx   = getToIdx(),
			prev_idx = 0,
			next_idx = 0,
			side_idx = 0;

		// 이동 완료후 위치 셋팅
		setNowIdx( to_idx );

		prev_idx = getPrevIdx();
		next_idx = getNextIdx();
		side_idx = now_idx < to_idx ? next_idx : prev_idx;

		// 현재 item는 이전으로
		// 다음 item은 현재로
		helper.setCss3Transition( D_Plist, 0, 0 );	
		helper.setCss3Transition( D_List[ now_idx ], 0, ( now_idx < to_idx ? -BASE_DISTANCE : BASE_DISTANCE ) + space_Width );
		helper.setCss3Transition( D_List[ to_idx ], 0, 0 + space_Width );
		helper.setCss3Transition( D_List[ side_idx ], 0, ( now_idx < to_idx ? BASE_DISTANCE : -BASE_DISTANCE ) + space_Width );

		if ( prev_idx !== -1 ){
			helper.setCss3Transition( D_List[ prev_idx ], 0, -BASE_DISTANCE + space_Width );
		}

		if ( next_idx !== -1 ){
			helper.setCss3Transition( D_List[ next_idx ], 0, BASE_DISTANCE + space_Width );
		}

		now_idx = getNowIdx();

		var i = list_Len;

		// 선택 화면만 보이기
		while( --i > -1 ){ 
			D_List[ i ].style.visibility = ( i === now_idx || i === prev_idx || i === next_idx ) ? 'visible' : 'hidden';
		}

		setAnimateAfter();

		if ( typeof setting.active === 'function' ){
			setting.active( is_Loop_Len_2 ? now_idx % 2 : now_idx );
		}
	}

	/**
	 * 애니메이션 이전
	 */
	function setAnimateBefore(){
		is_Move = true;
		stopSlideShow();
	}

	/**
	 * 애니메이션 이후
	 */
	function setAnimateAfter(){
		is_Move = false;
		startSlideShow();
	}

	if ( constructor()){
		setInitStyle();
		
		return {
			startSlideShow : startSlideShow,
			stopSlideShow  : stopSlideShow,
			refreshSize    : refreshSize,
			getIdx         : getNowIdx,
			toNext         : toNext,
			toPrev         : toPrev,
			toSlide        : toSlide,
			destory        : destory
		};
	}
}