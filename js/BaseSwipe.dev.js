/*!*
 * @method: 슬라이더 플러그인
 * @autor: Blim - Koo Chi Hoon(kkh975@naver.com)
 */
( function( $ ) {

	'use strict';

	/**
	 * @method: 슬라이더 플러그인
	 */
	$.fn.slideSwipe = function( option ) {
		option.$list = option.$list ? option.$list : $( this ).find( '> ul > li' );
		option.$wrap = option.$wrap ? option.$wrap : $( this ).find( '> ul' );
		option.list = option.$list ? option.$list.toArray( ) : [];
		option.wrap = option.$wrap ? option.$wrap.toArray( ) : [];
		option.pages = option.$pages ? option.$pages.toArray( ) : [];
		option.toStart = option.$toStart ? option.$toStart.toArray( ) : [];
		option.toStop = option.$toStop ? option.$toStop.toArray( ) : [];
		option.toPrev = option.$toPrev ? option.$toPrev.toArray( ) : [];
		option.toNext = option.$toNext ? option.$toNext.toArray( ) : [];

		return this.each( function( ) {
			$( this ).data( 'ss', new SlideSwipe( option ) );
		} );
	};

	/**
	 * @method: 슬라이더쇼 시작 플러그인
	 */
	$.fn.slideSwipe2start = function( ) {
		return this.each( function( ) {
			$( this ).data( 'ss' ).startSlideShow( );
		} );
	};

	/**
	 * @method: 슬라이더쇼 정지 플러그인
	 */
	$.fn.slideSwipe2stop = function( ) {
		return this.each( function( ) {
			$( this ).data( 'ss' ).stopSlideShow( );
		} );
	};

	/**
	 * @method: 이전 슬라이더 이동 플러그인
	 */
	$.fn.slideSwipe2prev = function( ) {
		return this.each( function( ) {
			$( this ).data( 'ss' ).toPrev( );
		} );
	};

	/**
	 * @method: 다음 슬라이더 이동 플러그인
	 */
	$.fn.slideSwipe2next = function( ) {
		return this.each( function( ) {
			$( this ).data( 'ss' ).toNext( );
		} );
	};

	/**
	 * @method: 특정 슬라이더 이동 플러그인
	 */
	$.fn.slideSwipe2slide = function( _idx ) {
		return this.each( function( ) {
			$( this ).data( 'ss' ).toSlide( _idx );
		} );
	};

	/**
	 * @method: 슬라이더 업데이트
	 */
	$.fn.slideSwipe2update = function( _$list ) {
		return this.each( function( ) {
			$( this ).data( 'ss' ).update( _$list.toArray( ) );
		} );
	};

	/**s
	 * @method: 슬라이드 제거
	 */
	$.fn.slideSwipe2destory = function( _idx ) {
		return this.each( function( ) {
			$( this ).data( 'ss' ).destory( );
		} );
	};
}( jQuery ) );

/**
 * @method: 플리킹 함수
 */
function SlideSwipe( __setting ) {

	'use strict';

	var TRANSITIONENDEVENT_VENDORS = [
			'transitionEnd',
			'transitionend',
			'otransitionend',
			'oTransitionEnd',
			'webkitTransitionEnd' ],
		ANIMATIONEVENT_VENDORS = [
			'animationEnd',
			'MSAnimationEnd',
			'oanimationEnd',
			'webkitAnimationEnd' ],
		TRANSITION_VENDORS = [
			'',
			'-ms-',
			'-o-',
			'-moz-',
			'-webkit-' ],
		ANIMATION_VENDORS = [
			'',
			'-o-',
			'-moz-',
			'-webkit-' ],
		BASE_VENDORS = [
			'',
			'-ms-',
			'-o-',
			'-moz-',
			'-webkit-' ];

	var MAX_TOUCH_MOVE = 100,
		DISTANCE = 100,
		setting = null,
		wrap_Dom = null,
		list_P_Dom = null,
		list_Dom = null,
		pages_Dom = null,
		to_Start_Dom = null,
		to_Stop_Dom = null,
		to_Prev_Dom = null,
		to_Next_Dom = null,
		style_Dom = null,
		slide_Show_Timer = null,
		is_Loop_Len_2 = false,
		is_Slide_Show = false,
		is_Slide_Showing = false,
		is_Move = false,
		list_Width = 0,
		list_Len = 0,
		list_Pos_Arr = [],
		now_Idx = 0;

	var default_Option = {
		list: [],					// require, 리스트
		wrap: [],					// require, 리스트 감싸는 태그
		pages: [],					// 슬라이더 페이징 이동
		toStart: [],				// 애니메이션 시작 버튼
		toStop: [],					// 애니메이션 멈춤 버튼
		toPrev: [],					// 이전 이동 버튼
		toNext: [],					// 다음 이동 버튼
		startEvents: 'click',		// 슬라이드쇼 시작 이벤트
		stopEvents: 'click',		// 슬라이드쇼 정지 이벤트
		moveEvents: 'click',		// 이동 작동 이벤트
		pageEvents: 'click',		// 페이징 작동 이벤트
		slideShowTime: 3000,		// 슬라이드쇼 시간
		touchMinumRange: 10,		// 터치시 최소 이동 거리
		loop: true,					// 무한 여부
		duration: 500,				// 애니메이션 시간
		create: null,				// 생성 후 콜백함수
		before: null,				// 액션 전 콜백함수
		active: null				// 액션 후 콜백함수
	};

	var helper = { // 보조함수

		/**
		 * @method: jQuery extend 기능
		 */
		extend: function( _target, _object ) {
			var prop = null,
				return_obj = {};

			for( prop in _target ) {
				return_obj[ prop ] = prop in _object ? _object[ prop ] : _target[ prop ];
			}

			return return_obj;
		},

		/**
		 * @method: 배열 여부
		 */
		isArray: function( _arr ) {
			if ( _arr ) {
				return Object.prototype.toString.call( _arr ) === '[object Array]';
			}

			return false;
		},

		/**
		 * @method: string trim
		 */
		trim: function( _txt ) {
			return _txt.replace( /(^\s*)|(\s*$)/gi, '' );
		},

		/**
		 * @method: DOM에서 배열변환
		 */
		dom2Array: function( _dom ) {
			var return_arr = [],
				len = 0,
				i = 0;

			if ( _dom && _dom.hasOwnProperty( 'length' ) ) {
				for ( i = 0; i < _dom.length; i++ ) {
					return_arr.push( _dom[ i ] );
				}
			} else {
				return_arr.push( _dom );
			}

			return return_arr;
		},

		/**
		 * @method: 버튼 이벤트 설정
		 */
		setBtnEvent: function( _doms, _evts, _callback ) {
			var evt_arr = _evts.split( ',' ),
				evt_idx = evt_arr.length,
				idx = _doms.length,
				evt = '';

			while( --evt_idx > -1 ) {
				while( --idx > -1 ) {
					evt = helper.trim( evt_arr[ evt_idx ] );

					( function( __idx ) {
						_doms[ idx ].addEventListener( evt, function( e ) {
							_callback( __idx );
							e.preventDefault( );
						} );
					}( idx ) );
				}
			}
		}
	};

	var helperCss3 = { // css3 보조 함수

		/**
		 * @method: 애니메이션 만들기
		 */
		getAnimateRuleTxt: function( _name, _from_pos, _to_pos ) {
			var ani_arr = ANIMATION_VENDORS,
				trn_arr = TRANSITION_VENDORS,
				ani_idx = ani_arr.length,
				trn_idx = 0,
				css_txt = '';

			while( --ani_idx > -1 ) {
				trn_idx = trn_arr.length;
				css_txt +=	'@' + ani_arr[ ani_idx ] + 'keyframes ' + _name + '{';
				css_txt +=		'from {';

				while( --trn_idx > -1 ) {
					css_txt += trn_arr[ trn_idx ] + 'transform: translateX(' + _from_pos + '%);';
				}

				trn_idx = trn_arr.length;
				css_txt +=		'}'
				css_txt +=		'to {';

				while( --trn_idx > -1 ) {
					css_txt += trn_arr[ trn_idx ] + 'transform: translateX(' + _to_pos + '%);';
				}

				css_txt +=		'}'
				css_txt +=	'}';
			}

			return css_txt;
		},

		/**
		 * @method: 애니메이션 설정
		 */
		setAnimate: function( _dom, _name, _time ) {
			var arr = ANIMATION_VENDORS,
				idx = arr.length,
				dom_style = _dom.style;

			while( --idx > -1 ) {
				dom_style.setProperty( arr[ idx ] + 'animation', _name + ' ' + _time + 'ms' );
			}
		},

		/**
		 * @method: 애니메이션 제거
		 */
		removeAnimate: function( _dom ) {
			var arr = ANIMATION_VENDORS,
				idx = arr.length,
				dom_style = _dom.style,
				css_text = dom_style.cssText,
				tmp_reg = null;

			while( --idx > -1 ) {
				dom_style[ arr[ idx ] + 'animation' ] = '';
			}
		},

		/**
		 * @method: 애니메이션 종료 이벤트
		 */
		setAnimateEnd: function( _dom, _callback ) {
			var arr = ANIMATIONEVENT_VENDORS,
				idx = arr.length;

			while( --idx > -1 ) {
				_dom.addEventListener( arr[ idx ], _callback, false );
			}
		},

		/**
		 * @method: 애니메이션 종료 이벤트 제거
		 */
		removeAnimateEnd: function( _dom, _callback ) {
			var arr = ANIMATIONEVENT_VENDORS,
				idx = arr.length;

			while( --idx > -1 ) {
				_dom.removeEventListener( arr[ idx ], _callback, false );
			}
		},

		/**
		 * @method: Transit 설정
		 */
		setTransit: function( _dom, _pos, _time ) {
			var arr = TRANSITION_VENDORS,
				idx = arr.length,
				dom_style = _dom.style;

			while( --idx > -1 ) {
				dom_style.setProperty( arr[ idx ] + 'transform', 'translateX('+ _pos + '%)' );
				dom_style.setProperty( arr[ idx ] + 'transition', ( _time ? _time : 0 ) + 'ms' );
			}
		},

		/**
		 * @method: Transit 리스트 설정
		 */
		setTransitList: function( _is_set, _add_pos, _time ) {
			var pos = 0,
				len = 0,
				i = 0;

			for ( i = 0; i < list_Len; i++ ) {
				pos = list_Pos_Arr[ i ];

				if ( _add_pos ) {
					pos += _add_pos;
				}

				if ( _is_set ) {
					list_Pos_Arr[ i ] = pos;
				}

				helperCss3.setTransit( list_Dom[ i ], pos, _time );
			}
		},

		/**
		 * @method: Transit 종료 이벤트
		 */
		setTransitEnd: function( _dom, _callback ) {
			var arr = TRANSITIONENDEVENT_VENDORS,
				idx = arr.length;

			while( --idx > -1 ) {
				_dom.addEventListener( arr[ idx ], _callback, false );
			}
		},

		/**
		 * @method: Transit 종료 이벤트 제거
		 */
		removeTransitEnd: function( _dom, _callback ) {
			var arr = TRANSITIONENDEVENT_VENDORS,
				idx = arr.length;

			while( --idx > -1 ) {
				_dom.removeEventListener( arr[ idx ], _callback, false );
			}
		},

		/**
		 * @method: 보통 css3 설정
		 */
		setCommonRule: function( _dom, _prop, _value, _vendors ) {
			var dom_style = _dom.style,
				arr = null,
				idx = 0;

			if ( _vendors ) {
				arr = _vendors;
				idx = arr.length;
				dom_style = _dom.style;

				while( --idx > -1 ) {
					dom_style.setProperty( arr[ idx ] + _prop, _value );
				}
			} else {
				dom_style.setProperty( _prop, _value );				
			}
		}
	};

	var touchEvents = { // 이벤트 함수
		is_touch_start: false,
		touch_start_x: 0,
		touch_start_y: 0,
		move_dx: 0,

		/**
		 * @method: 변수 초기화
		 */
		setInitVaiable: function( ) {
			touchEvents.is_touch_start = false;
			touchEvents.touch_start_x = 0;
			touchEvents.touch_start_y = 0;
			touchEvents.move_dx = 0;
		},

		/**
		 * @method: 이전으로 이동가능한가
		 */
		canPrevMove: function( ) {

			if ( !setting.loop && getPrevIdx( ) === -1 ) { // 루프가 아니면서 가장자리에 있을때
				return false;
			}

			return true;
		},

		/**
		 * @method: 이후로 이동가능한가
		 */
		canNextMove: function( ) {
			var next_idx = getNextIdx( ),
				len = ( is_Loop_Len_2 ? list_Len - 2 : list_Len ) - 1;

			if ( !setting.loop && ( next_idx === -1 || next_idx > len ) ) { // 루프가 아니면서 가장자리에 있을때
				return false;
			}

			return true;
		},

		/**
		 * @method: 터치 시작 이벤트
		 * @param: {Object} 이벤트 객체
		 */
		setStart: function( e ) {

			if ( touchEvents.is_touch_start || is_Move ) {
				return false;
			}

			setMoveBefore( );

			if ( !touchEvents.is_touch_start && e.type === 'touchstart' && e.touches.length === 1 ) {
				touchEvents.is_touch_start = true;
				touchEvents.touch_start_x = e.touches[ 0 ].pageX;
				touchEvents.touch_start_y = e.touches[ 0 ].pageY;
			}
		},

		/**
		 * @method: 터치 중 이벤트
		 * @param: {Object} 이벤트 객체
		 */
		setMove: function( e ) {
			var drag_dist = 0,
				scroll_dist = 0;

			if ( touchEvents.is_touch_start && e.type === 'touchmove' && e.touches.length === 1 ) {
				drag_dist = e.touches[ 0 ].pageX - touchEvents.touch_start_x;	// 가로 이동 거리
				scroll_dist = e.touches[ 0 ].pageY - touchEvents.touch_start_y;	// 세로 이동 거리
				touchEvents.move_dx = ( drag_dist / list_Width ) * 100;			// 가로 이동 백분률

				if ( Math.abs( drag_dist ) > Math.abs( scroll_dist ) ) { // 드래그길이가 스크롤길이 보다 클때
					touchEvents.move_dx = Math.max( -MAX_TOUCH_MOVE, Math.min( MAX_TOUCH_MOVE, touchEvents.move_dx ) );
					helperCss3.setTransitList( false, touchEvents.move_dx );
					e.preventDefault( );
				}
			}
		},

		/**
		 * @method: 터치 완료 이벤트
		 * @param: {Object} 이벤트 객체
		 */
		setEnd: function( e ) {
			var over_touch = Math.abs( touchEvents.move_dx ) > setting.touchMinumRange,
				is_to_next = touchEvents.move_dx < 0,
				can_move = is_to_next ? touchEvents.canNextMove( ) : touchEvents.canPrevMove( ),
				time = 0,
				pos = 0,
				idx = 0;

			if ( touchEvents.is_touch_start && e.type === 'touchend' && e.touches.length === 0 ) {

				if ( over_touch && can_move ) {
					time = Math.floor( ( touchEvents.move_dx / 100 ) * setting.duration );
					time = setting.duration - Math.abs( time );
					time = Math.max( 0, Math.min( setting.duration, time ) );
					pos = is_to_next ? -100 : 100;
					idx = getIdx( );

					setIdx( is_to_next ? idx + 1 : idx - 1 );
				} else {
					time = setting.duration;
					pos = 0;
				}

				helperCss3.setTransitList( true, pos, time );
				touchEvents.setInitVaiable( );
				e.preventDefault( );
			}
		}
	};

	/**
	 * @method: 지원하나?
	 */
	function isSupport( ) {
		var tmp_dom = null;

		if ( typeof window.addEventListener !== 'function' ) {
			return false;
		}

		return true;
	}

	/**
	 * @method: 생성자
	 */
	function constructor( ) {

		// 플러그인에서 배열로 넘겨줄때 패스, javascrit로 바로 들어오면 dom2Array로..
		setting = helper.extend( default_Option, __setting );
		list_P_Dom = helper.isArray( setting.wrap ) ? setting.wrap : helper.dom2Array( setting.wrap );
		pages_Dom = helper.isArray( setting.pages ) ? setting.pages : helper.dom2Array( setting.pages );
		to_Start_Dom = helper.isArray( setting.toStart ) ? setting.toStart : helper.dom2Array( setting.toStart );
		to_Stop_Dom = helper.isArray( setting.toStop ) ? setting.toStop : helper.dom2Array( setting.toStop );
		to_Prev_Dom = helper.isArray( setting.toPrev ) ? setting.toPrev : helper.dom2Array( setting.toPrev );
		to_Next_Dom = helper.isArray( setting.toNext ) ? setting.toNext : helper.dom2Array( setting.toNext );
		list_P_Dom = list_P_Dom[ 0 ];
		wrap_Dom = list_P_Dom.parentNode;
		setting.touchMinumRange = Math.max( 1, Math.min( 100, setting.touchMinumRange ) );

		if ( setting.slideShowTime ) { // 슬라이드쇼 옵션 존재
			if ( typeof setting.slideShowTime === 'boolean' ) {
				is_Slide_Show = is_Slide_Showing = setting.slideShowTime;

				if ( is_Slide_Show ) { // true일때, 숫자값 대입
					setting.slideShowTime = 3000;
				}
			}

			if ( typeof setting.slideShowTime === 'string' ) {
				setting.slideShowTime = parseInt( setting.slideShowTime, 10 );
			}

			if ( isNaN( setting.slideShowTime ) ) { // 타입이 숫자가 아니면
				is_Slide_Show = is_Slide_Showing = false;
			} else {
				is_Slide_Show = is_Slide_Showing = true;

				if ( setting.duration * 2 >= setting.slideShowTime ) { // 슬라이드쇼가 애니메이션 시간보다 짧을때
					setting.slideShowTime = setting.duration * 2;
				}
			}
		}

		if ( to_Start_Dom ) { // 애니메이션 시작 버튼
			helper.setBtnEvent( to_Start_Dom, setting.startEvents, function( ) {
				is_Slide_Showing = true;
				startSlideShow( );
			} );
		}

		if ( to_Stop_Dom ) { // 애니메이션 멈춤 버튼
			helper.setBtnEvent( to_Stop_Dom, setting.stopEvents, function( ) {
				is_Slide_Showing = false;
				stopSlideShow( );
			} );
		}

		if ( to_Prev_Dom ) { // 왼쪽 버튼
			helper.setBtnEvent( to_Prev_Dom, setting.moveEvents, toPrev );
		}

		if ( to_Next_Dom ) { // 오른쪽 버튼
			helper.setBtnEvent( to_Next_Dom, setting.moveEvents, toNext );
		}

		if ( pages_Dom ) { // 페이징 이동
			helper.setBtnEvent( pages_Dom, setting.moveEvents, function( _idx ) {
				toSlide( _idx );
			} );
		}

		window.addEventListener( 'load', setInitStyle, false );
		wrap_Dom.addEventListener( 'touchstart', touchEvents.setStart );
		wrap_Dom.addEventListener( 'touchmove', touchEvents.setMove );
		wrap_Dom.addEventListener( 'touchend', touchEvents.setEnd );
		wrap_Dom.addEventListener( 'touchcancel', touchEvents.setEnd );

		return true;
	}

	/**
	 * @method: 초기화 스타일
	 */
	function setInitStyle( ) {
		var css_txt = '',
			pos = 0,
			len = 0,
			i = 0;

		list_Width = wrap_Dom.offsetWidth;

		wrap_Dom.style.cssText = 'overflow: hidden;'
		list_P_Dom.style.cssText = 'position: relative; width: 100%; height: 100%; ';
		helperCss3.setCommonRule( list_P_Dom, 'TransformStyle', 'preserve-3d' , TRANSITION_VENDORS );

		// 페인트 타임으로 인하여, css3의 animate로 접근해야 함
		css_txt = helperCss3.getAnimateRuleTxt( 'next-to-now', 100, 0 );
		css_txt += helperCss3.getAnimateRuleTxt( 'now-to-prev', 0, -100 );
		css_txt += helperCss3.getAnimateRuleTxt( 'prev-to-now', -100, 0 );
		css_txt += helperCss3.getAnimateRuleTxt( 'now-to-next', 0, 100 );

		style_Dom = document.createElement( 'style' );
		style_Dom.setAttribute( 'type', 'text/css' );
		style_Dom.innerHTML = css_txt;
		wrap_Dom.appendChild( style_Dom );

		update( setting.list );
		helperCss3.setTransitList( );

		setIdx( 0 );
		startSlideShow( );

		if ( typeof setting.create === 'function' ) { // 생성 후 콜백
			setting.create( getIdx( ) );
		}
	}

	/**
	 * @method: 업데이트
	 */
	function update( _list_dom ) {
		var tmp_dom = null,
			css_txt = '',
			pos_arr = [],
			pos = 0,
			len = 0,
			idx = getIdx( );

		if ( is_Move ) {
			// return false;	
		}

		list_Dom = helper.isArray( _list_dom ) ? _list_dom : helper.dom2Array( _list_dom );
		list_Len = len = list_Dom.length;

		if ( list_Len < 2 ) { // 리스트가 한개일때
			return false;
		}

		if ( is_Loop_Len_2 ) {
			list_Len = len = len - 2;
		}

		if ( list_Len === 2 && setting.loop ) { // 루프이면서 리스트가 두개일때
			tmp_dom = list_Dom[ 0 ].cloneNode( true ); // 처음 노드 복사
			list_Dom.push( tmp_dom );
			list_P_Dom.appendChild( tmp_dom );

			tmp_dom = list_Dom[ 1 ].cloneNode( true ); // 두번째 노드 복사
			list_Dom.push( tmp_dom );
			list_P_Dom.appendChild( tmp_dom );

			is_Loop_Len_2 = true;
			list_Len = len = 4;
		}

		for( var i = 0; i < len; i++ ) {

			if ( list_Dom[ i ].getAttribute( 'data-mark' ) === 's4s-item' ) { // 설정되어있으면 다음으로
				continue;
			}

			// 루프이면서 마지막노드는 왼쪽으로 재설정
			pos = setting.loop && len - 1 === i ? -100 : ( i * 100 ) - ( idx * 100 ); 
			pos_arr.push( pos );

			// 스타일
			list_Dom[ i ].style.cssText = 'position: absolute; width: 100%; height: 100%; ';
			list_Dom[ i ].setAttribute( 'data-mark', 's4s-item' );
			helperCss3.setCommonRule( list_Dom[ i ], 'user-select', 'none', BASE_VENDORS );

			// 이벤트
			list_Dom[ i ].addEventListener( 'focus', stopSlideShow, false );
			list_Dom[ i ].addEventListener( 'blur', startSlideShow, false );
			helperCss3.setTransitEnd( list_Dom[ i ], setMoveAfter );
			helperCss3.setAnimateEnd( list_Dom[ i ], animationEnd );

			console.log( i, pos )
			console.log( list_Dom[ i ] );
			console.log('===============================')
		}

		list_Pos_Arr = list_Pos_Arr.concat( pos_arr );
		helperCss3.setTransitList( );
	}

	/**
	 * @method: 제거
	 */
	function destory( ) {
		wrap_Dom.removeChild( style_Dom );
		window.removeEventListener( 'load', setInitStyle, false );
		wrap_Dom.removeEventListener( 'touchstart', touchEvents.setStart );
		wrap_Dom.removeEventListener( 'touchmove', touchEvents.setMove );
		wrap_Dom.removeEventListener( 'touchend', touchEvents.setEnd );
		wrap_Dom.removeEventListener( 'touchcancel', touchEvents.setEnd );

		while( --idx > -1 ) {
			list_Dom[ idx ].removeEventListener( 'focus', stopSlideShow, false );
			list_Dom[ idx ].removeEventListener( 'blur', startSlideShow, false );
			helperCss3.removeTransitEnd( list_Dom[ idx ], setMoveAfter );
			helperCss3.removeAnimateEnd( list_Dom[ idx ], animationEnd );
		}
	}

	/**
	 * @method: 애니메이션 시작
	 */
	function startSlideShow( ) {
		if ( is_Slide_Show && is_Slide_Showing && slide_Show_Timer === null ) {
			slide_Show_Timer = setInterval( toNext, setting.slideShowTime );
		}
	}

	/**
	 * @method: 애니메이션 멈춤
	 */
	function stopSlideShow( ) {
		clearInterval( slide_Show_Timer );
		slide_Show_Timer = null;
	}

	/**
	 * @method: 화면 리사이즈
	 */
	function refreshSize( ) {
		list_Width = wrap_Dom.offsetWidth;
	}

	/**
	 * @method: 현재 포지션 얻기
	 */
	function getIdx( ) {
		return now_Idx;
	}

	/**
	 * @method: 현재 포지션 셋팅
	 */
	function setIdx( _idx ) {

		if ( _idx < 0 ) {
			now_Idx = setting.loop ? list_Len - 1 : now_Idx;
		} else if ( _idx > list_Len - 1 ) {
			now_Idx = setting.loop ? 0 : now_Idx;
		} else {
			now_Idx = _idx;
		}
	}

	/**
	 * @method: 이전 인덱스 얻기
	 */
	function getPrevIdx( ) {
		var idx = getIdx( );

		if ( --idx < 0 ) {
			idx = setting.loop ? list_Len - 1 : -1;
		}

		return idx;
	}

	/**
	 * @method: 다음 인덱스 얻기
	 */
	function getNextIdx( ) {
		var idx = getIdx( );

		if ( ++idx > list_Len - 1 ) {
			idx = setting.loop ? 0 : -1;
		}

		return idx;
	}

	/**
	 * @method: 이전 슬라이더 이동
	 */
	function toPrev( ) {
		toSlide( getPrevIdx( ), 'prev' );
	}

	/**
	 * @method: 이후 슬라이더 이동
	 */
	function toNext( ) {
		toSlide( getNextIdx( ), 'next' );
	}

	/**
	 * @method: 슬라이더로 이동
	 */
	function toSlide( _to_idx, _way ) {
		var now_idx = getIdx( ),
			gap = _to_idx - now_idx,
			is_direct_access = arguments.length === 1;

		if ( is_Move ) { // 이동중이면 종료
			return false;
		}

		if ( _to_idx === now_idx ) { // 현재 슬라이면 종료
			return false;
		}

		if ( _to_idx < 0 || _to_idx > list_Len - 1 ) { // 범위 초과면 종료
			return false;
		}

		// 루프이면서 길이가 2이면서 다이렉트 접근시 범위 초과이거나 같은 위치일때
		if ( is_Loop_Len_2 && is_direct_access && ( _to_idx > 1 || _to_idx % 2 === now_idx % 2 ) ) {
			return false;
		}

		if ( typeof _way === 'undefined' ) { // toSlide 함수를 직접 들어왔을 시
			_way = gap > 0 ? 'next' : 'prev';
		}

		// 방향 교정
		if ( is_Loop_Len_2 && is_direct_access && ( _to_idx % 2 === 1 && now_idx % 2 === 0 ) ) {
			_way = 'next';
		}

		setIdx( _to_idx );
		toSlideBefore( now_idx, _to_idx );
		toSlideAnimate( now_idx, _to_idx, _way );
	}

	/**
	 * @method: 슬라이더 애니메이션 이전
	 */
	function toSlideBefore( _now_idx, _to_idx ) {
		var i = list_Len;

		setMoveBefore( );

		if ( typeof setting.before === 'function' ) {
			setting.before( is_Loop_Len_2 ? getIdx( ) % 2 : getIdx( ) );
		}

		while( --i > -1 ) { // 선택 화면만 보이기
			list_Dom[ i ].style.visibility = ( i === _now_idx || i === _to_idx ) ? 'visible' : 'hidden';
		}
	}

	/**
	 * @method: 슬라이더 애니메이션
	 */
	function toSlideAnimate( _now_idx, _to_idx, _way ) {
		helperCss3.setAnimate( list_Dom[ _now_idx ], _way === 'next' ? 'now-to-prev' : 'now-to-next', setting.duration );
		helperCss3.setAnimate( list_Dom[ _to_idx ], _way === 'next' ? 'next-to-now' : 'prev-to-now', setting.duration );
	}

	/**
	 * @method: 슬라이더 애니메이션 이후
	 */
	function animationEnd( e ) {
		helperCss3.removeAnimate( e.target );
		setMoveAfter( );
	}

	/**
	 * 애니메이션 이전
	 */
	function setMoveBefore( ) {
		is_Move = true;
		stopSlideShow( );
	}

	/**
	 * 애니메이션 이후
	 */
	function setMoveAfter( ) {
		var now_idx = getIdx( ),
			prev_idx = getPrevIdx( ),
			next_idx = getNextIdx( ),
			idx = list_Len;

		list_Pos_Arr[ now_idx ] = 0;

		if ( prev_idx !== -1 ) {
			list_Pos_Arr[ prev_idx ] = -100;
		}

		if ( next_idx !== -1 ) {
			list_Pos_Arr[ next_idx ] = 100;
		}

		while( --idx > -1 ) { // 선택 화면만 보이기
			list_Dom[ idx ].style.visibility = ( 
				idx === now_idx || idx === prev_idx || idx === next_idx ) ? 'visible' : 'hidden';
		}

		helperCss3.setTransitList( );
		startSlideShow( );
		is_Move = false;

		if ( typeof setting.active === 'function' ) {
			setting.active( is_Loop_Len_2 ? now_idx % 2 : now_idx );
		}
	}

	if ( isSupport( ) && constructor( ) ) {

		return {
			startSlideShow: startSlideShow,
			stopSlideShow: stopSlideShow,
			refreshSize: refreshSize,
			getIdx: getIdx,
			toNext: toNext,
			toPrev: toPrev,
			toSlide: toSlide,
			destory: destory,
			update: update
		};
	}
}