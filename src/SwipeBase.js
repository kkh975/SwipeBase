/*!*
 * @autor: Blim - Koo Chi Hoon(kkh975@naver.com)
 * @license http://blim.mit-license.org/
 * 
 * TODO: refreshSize / setHeight -> draw로 통합하기
 * TODO: events 방식에 대한 것 설명 추가하기
 * TODO: mouse 방식에 대한 것 추가하기
 */
'use strict';

/*!*
 * @method: SwipeBase 함수
 */
function SwipeBase( __setting ){
	let BASE_DISTANCE    = 100,
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
		touch_Disable    = false,	// 터치 가능여부
		is_Loop_Len_2    = false,	// 아이템 길이가 2인지
		is_Slide_Show    = false,	// 슬라이드쇼
		is_Move          = false,	// 현재 페이지 넘김 움직임 여부
		list_Width       = 0,
		list_Pos         = 0,
		list_Len         = 0,
		now_Idx          = 0,
		to_Idx           = 0,
		browser_Prefix   = {};

	let default_Option = {
		wrap             : null,	// require, 리스트 감싸는 태그
		list             : null,	// require, 리스트
		pages            : null,	// 슬라이더 페이징 이동
		toStart          : null,	// 애니메이션 시작 버튼
		toStop           : null,	// 애니메이션 멈춤 버튼
		toPrev           : null,	// 이전 이동 버튼
		toNext           : null,	// 다음 이동 버튼
		startEvents      : 'click',	// 슬라이드쇼 시작 이벤트
		stopEvents       : 'click',	// 슬라이드쇼 정지 이벤트
		moveEvents       : 'click',	// 이동 작동 이벤트
		pageEvents       : 'click',	// 페이징 작동 이벤트
		startIdx         : 0,		// 시작 인덱스
		slideShowTime    : 3000,	// 슬라이드쇼 시간
		touchMinumRange  : 10,		// 터치시 최소 이동 거리
		scrollMinumRange : 20,		// 스크롤시 최소 이동 거리
		sideTouchLock    : false,   // 무한이 아닐 시, 양쪽 터치 감추기
		loop             : true,	// 무한 여부
		duration         : 300,		// 애니메이션 시간
		create           : null,	// 생성 후 콜백함수
		before           : null,	// 액션 전 콜백함수
		active           : null,    // 액션 후 콜백함수
		start            : null,	// 애니메이션 시작 콜백함수
		stop             : null		// 애니메이션 종료 콜백함수
	};

	let helper = {
		/**
		 * @method: 배열 여부
		 */
		isArray: ( _arr ) => _arr && Object.prototype.toString.call( _arr ) === '[object Array]',

		/**
		 * @method: DOM에서 배열변환(Array.slice 안먹힘)
		 */
		dom2Array: ( _dom ) => {
			let arr = [],
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
		object2Array: ( _obj ) => {
			let arr = [];

			for ( let key in _obj ){
				arr.push( _obj[ key ] );
			}

			return arr;
		},

		/**
		 * @method: css3의 transition 접미사
		 */
		getCssPrefix: () => {
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
			let transitionsCss   = [ '-webkit-transition', 'transition' ],
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
		hasCss3Animation: () => browser_Prefix.transitionsJs in document.createElement( 'div' ).style,

		/**
		 * @method: 현재 위치 알아오기
		 */
		getCss3TransformPos: ( _dom ) => {
			let css_txt = '';

			css_txt = _dom.style[ browser_Prefix.transformsJs ];
			css_txt = css_txt.substring( css_txt.indexOf( '(' ) + 1, css_txt.indexOf( '%' ));

			return parseFloat( css_txt );
		},

		/**
		 * @method: 애니메이션 설정
		 */
		setCss3Transition: ( _dom, _speed, _pos ) => {
			helper.setCss3( _dom, 'transition', _speed + 'ms' );
			helper.setCss3( _dom, 'transform', 'translate3d('+ _pos + '%, 0, 0)' );
		},

		/**
		 * @method: css3 설정
		 */
		setCss3: ( _dom, _prop, _value ) => {
			if ( _prop === 'transition' ){
				_dom.style[ browser_Prefix.transitionsJs ] = 'ease-out ' + _value;
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
		setBtnEvent: ( _doms, _evts, _callback ) => {
			let evt_arr = _evts.split( ',' ),
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

	let touchEvents = {
		is_drag        : null,
		is_disable     : false,
		touch_start_x  : 0,
		touch_start_y  : 0,
		touch_move_x1  : 0,
		touch_move_y1  : 0,
		move_dx        : 0,

		/**
		 * @method: 변수 초기화
		 */
		setInitVaiable: () => {
			touchEvents.is_drag        = null;
			touchEvents.is_disable     = false;
			touchEvents.touch_start_x  = 0;
			touchEvents.touch_start_y  = 0;
			touchEvents.touch_move_x1  = 0;
			touchEvents.touch_move_y1  = 0;
			touchEvents.move_dx        = 0;
		},

		/**
		 * @method: 이전으로 이동가능한가
		 * 루프가 아니면서 가장자리에 있을때
		 */
		canPrevMove: () => !(!setting.loop && getPrevIdx() === -1),

		/**
		 * @method: 이후로 이동가능한가
		 */
		canNextMove: () => {
			let next_idx = getNextIdx(),
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
		setStart: ( e ) => {
			// 터치잠금이 아닐시, 슬라이드 애니메이션 움직임이 아닐시, 터치 이벤트시
			if ( touch_Disable !== true && !is_Move && e.type === 'touchstart' && e.touches.length === 1 ){
				stopSlideShow();
				touchEvents.is_drag       = null;
				touchEvents.touch_start_x = e.touches[ 0 ].pageX;
				touchEvents.touch_start_y = e.touches[ 0 ].pageY;
			}

			// 터치 이벤트
			D_Wrap.addEventListener( 'touchmove', touchEvents.setMove );
			D_Wrap.addEventListener( 'touchend', touchEvents.setEnd );
			D_Wrap.addEventListener( 'touchcancel', touchEvents.setEnd );
		},

		/**
		 * @method: 터치 중 이벤트
		 * @param: {Object} 이벤트 객체
		 */
		setMove: ( e ) => {
			if ( touch_Disable !== true && !is_Move ){
				let now_idx     = getNowIdx();
				let drag_dist   = 0;
				let scroll_dist = 0;
				let side_dist   = 0;
				let is_to_next  = false;

				// 이미 start된 동작이 있어야만 작동
				if ( e.type === 'touchmove' && e.touches.length === 1 ){
					touchEvents.touch_move_x1 = e.touches[ 0 ].pageX;
					touchEvents.touch_move_y1 = e.touches[ 0 ].pageY;

					// 가로/세로 이동 거리
					drag_dist   = touchEvents.touch_move_x1 - touchEvents.touch_start_x;
					scroll_dist = touchEvents.touch_move_y1 - touchEvents.touch_start_y;
					is_to_next  = drag_dist < 0;

					// 가로 이동 백분률
					touchEvents.move_dx    = ( drag_dist / list_Width ) * 100;
					touchEvents.move_dx    = Math.max( -100, Math.min( 100, touchEvents.move_dx ));
					touchEvents.is_disable =
							( (is_to_next && (touch_Disable === 'next' || touch_Disable === 'right')) ||
							  (!is_to_next && (touch_Disable === 'prev' || touch_Disable === 'left' )) );

					// 무한이 아니면서 양쪽 끝 터치가 잠겨있을 때,
					// 처음 노드에서는 왼쪽잠금
					// 마지막 노드에서는 오른쪽 잠금
					if ( !setting.loop && setting.sideTouchLock && ( ( !is_to_next && now_idx === 0 ) || ( is_to_next && now_idx === list_Len - 1 ) ) ){
						touchEvents.is_disable = true;
					}

					// 일종의 재귀함수. 한번 move로 인식되면
					// 다음 움직임에는 분기처리가 안되기 때문에 한번만 인식됨
					if ( touchEvents.is_drag == null ){
						touchEvents.is_drag = touchEvents.is_drag || Math.abs( drag_dist ) > Math.abs( scroll_dist );
					}

					if ( touchEvents.is_drag && !touchEvents.is_disable ){
						e.preventDefault();
						touchEvents.is_drag = true;
						helper.setCss3Transition( D_Plist, 0, (setting.loop ? 0 : list_Pos) + touchEvents.move_dx );
					}
				}
			}
		},

		/**
		 * @method: 터치 완료 이벤트
		 * @param: {Object} 이벤트 객체
		 */
		setEnd: ( e ) => {
			// 움직임이나 disable 상황이 아니면 무조건 처리함
			if ( !touchEvents.is_disable && !is_Move ){
				let over_touch = Math.abs( touchEvents.move_dx ) > setting.touchMinumRange;
				let is_to_next = touchEvents.move_dx < 0;
				let can_move   = is_to_next ? touchEvents.canNextMove() : touchEvents.canPrevMove();

				// 드래그 성공시
				if ( touchEvents.is_drag && over_touch && can_move ){
					is_to_next ? toNext() : toPrev();
				} else {
					helper.setCss3Transition( D_Plist, setting.duration, setting.loop ? 0 : list_Pos);
				}
			}

			// 터치 이벤트
			D_Wrap.removeEventListener( 'touchmove', touchEvents.setMove );
			D_Wrap.removeEventListener( 'touchend', touchEvents.setEnd );
			D_Wrap.removeEventListener( 'touchcancel', touchEvents.setEnd );

			touchEvents.setInitVaiable();
		}
	};

	/**
	 * @method: 생성자
	 */
	function constructor(){
		// 플러그인에서 배열로 넘겨줄때 패스
		// javascrit로 바로 들어오면 dom2Array
		setting = Object.assign( default_Option, __setting );
		D_Plist = helper.isArray( setting.wrap ) ? setting.wrap : helper.dom2Array( setting.wrap );
		D_List  = helper.isArray( setting.list ) ? setting.list : helper.dom2Array( setting.list );

		// 필수요소 체크
		if ( !D_List || !D_Plist ){
			return false;
		}

		list_Len = D_List.length;
		D_Plist  = D_Plist[ 0 ];
		D_Wrap   = D_Plist.parentNode;

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
			let tmp_dom = null;

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

		// 시작 인덱스 체크
		setting.startIdx = Math.max( setting.startIdx, 0 );
		setting.startIdx = Math.min( setting.startIdx, D_List.length );
		setNowIdx( setting.startIdx );

		// 이벤트
		window.addEventListener( 'resize', refreshSize );
		D_Wrap.addEventListener( 'touchstart', touchEvents.setStart );

		let idx = D_List.length;

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
		helper.setCss3Transition( D_Plist, 0, 0 );

		list_Width  = D_Wrap.offsetWidth;

		for ( let i = 0, pos = 0, len = list_Len, diff = getNowIdx() * -BASE_DISTANCE; i < len; i++ ){
			pos = BASE_DISTANCE * i;
			pos += diff;

			// 무한루프일때
			if ( setting.loop ){
				// 길이 이상은 앞으로 보냄
				if ( BASE_DISTANCE * (len - 1) === pos ){
					pos = BASE_DISTANCE * -1;
				}
				// -100이하는 방향 전환
				if ( BASE_DISTANCE * -1 > pos ){
					pos += BASE_DISTANCE * len;
				}
			}

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
		let idx = D_List.length;

		window.removeEventListener( 'resize', refreshSize );
		D_Wrap.removeEventListener( 'touchstart', touchEvents.setStart );

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
			
			if ( typeof setting.start === 'function' ){
				setting.start();
			}
		}
	}

	/**
	 * @method: 애니메이션 멈춤
	 */
	function stopSlideShow(){
		clearInterval( slide_Show_Timer );
		slide_Show_Timer = null;
		
		if ( typeof setting.stop === 'function' ){
			setting.stop();
		}
	}

	/**
	 * @method: 화면 리사이즈
	 */
	function refreshSize(){
		list_Width = _width || D_Wrap.offsetWidth;
	}

	/**
	 * @method: 높이값 설정
	 */
	function setHeight( _height ){
		D_Plist.style.height = _height || D_List[ getNowIdx() ].offsetHeight;
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
		let idx = getNowIdx();

		if ( --idx < 0 ){
			idx = setting.loop ? list_Len - 1 : -1;
		}

		return idx;
	}

	/**
	 * @method: 다음 인덱스 얻기
	 */
	function getNextIdx(){
		let idx = getNowIdx();

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
		let now_idx = getNowIdx(),
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

		// 실제 적용시 클릭 이벤트와 충돌나서, 변경
		D_Wrap.addEventListener( browser_Prefix.transitionsendJs, toSlideAnimateAfter, false );
		setToIdx( _to_idx );
		toSlideAnimateBefore( _way );
		toSlideAnimate( setting.duration, _way );
	}

	/**
	 * @method: 슬라이더 애니메이션 이전
	 */
	function toSlideAnimateBefore( _way ){
		let now_idx = getNowIdx(),
			to_idx  = getToIdx(),
			i       = list_Len;

		setAnimateBefore();

		// 위치 정해주기
		helper.setCss3Transition( D_List[ now_idx ], 0, 0 );
		helper.setCss3Transition( D_List[ to_idx ], 0, ( _way === 'next' ? BASE_DISTANCE : -BASE_DISTANCE ));

		if ( typeof setting.before === 'function'  ){
			setting.before( is_Loop_Len_2 ? now_idx % 2 : now_idx );
		}
	}

	/**
	 * @method: 슬라이더 애니메이션
	 */
	function toSlideAnimate( _time, _way ){
		let now_idx = getNowIdx(),
			to_idx  = getToIdx(),
			now_pos = helper.getCss3TransformPos( D_Plist );

		// 루프일때는, 컨테이너 이동
		let pos = list_Pos = _way === 'next' ? -BASE_DISTANCE : BASE_DISTANCE;

		// 셋팅
		setNowIdx( to_idx );

		// touch로 접근시, 사용자가 빠르게 터치해서 이미 끝으로 도달 했을 시
		if ( touchEvents.is_drag && now_pos % BASE_DISTANCE == 0 ){
			toSlideAnimateAfter();
		} else {
			if ( touchEvents.is_drag ){
				// swipe 탄력적으로
				// 거리:전체거리 = 남은거리(x):전체시간 -> 전체시간 * 거리 / 전체거리
				_time = _time * ( BASE_DISTANCE - Math.abs( now_pos )) / BASE_DISTANCE;
				_time = Math.abs( _time );
				_time = Math.max( _time, 10 );
			} else {
				_time = _time;
			}

			helper.setCss3Transition( D_Plist, _time, pos );

			// 체크하기
			// 움직였는데도 아직도 is_Move로 잠겨있으면 재시도 하기
			setTimeout( function(){
				if ( helper.getCss3TransformPos( D_List[ now_idx ] ) == 0 && is_Move ){
					toSlideAnimateAfter();
				}
			}, _time + 100 );
		}
	}

	/**
	 * @method: 슬라이더 애니메이션 이후
	 */
	function toSlideAnimateAfter(){
		let now_idx  = getNowIdx();
		let prev_idx = getPrevIdx();
		let next_idx = getNextIdx();
		let i = list_Len;

		// 루프일때는, 컨테이너 이동 후 초기화
		// 선택 화면만 보이기
		while( --i > -1 ){
			D_List[ i ].style.display = ( i == now_idx || i == prev_idx || i == next_idx ) ? 'block' : 'none';
		}

		// 현재 item는 이전으로, 다음 item은 현재로
		list_Pos = 0;
		helper.setCss3Transition( D_Plist, 0, list_Pos );
		helper.setCss3Transition( D_List[ now_idx ], 0, 0 );

		if ( prev_idx !== -1 ){
			helper.setCss3Transition( D_List[ prev_idx ], 0, -BASE_DISTANCE );
		}

		if ( next_idx !== -1 ){
			helper.setCss3Transition( D_List[ next_idx ], 0, BASE_DISTANCE );
		}

		// 실제 적용시 클릭 이벤트와 충돌남
		D_Wrap.removeEventListener( browser_Prefix.transitionsendJs, toSlideAnimateAfter, false );
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

	/**
	 * 터치 가능
	 */
	function touchEnable(){
		touch_Disable = false;
	}

	/**
	 * 터치 불가능
	 */
	function touchDisable( _direct ){
		touch_Disable = _direct || true;
	}

	if ( constructor()){
		setInitStyle();

		return {
			startSlideShow : startSlideShow,
			stopSlideShow  : stopSlideShow,
			refreshSize    : refreshSize,
			setHeight      : setHeight,
			getIdx         : getNowIdx,
			toNext         : toNext,
			toPrev         : toPrev,
			toSlide        : toSlide,
			destory        : destory,
			touchEnable    : touchEnable,
			touchDisable   : touchDisable
		};
	}
}

( function(){
	var DATA_NAME = 'SwipeBase';

	$.fn.swipeBase = function( _option, _param ){
		return this.each( function(){
			if ( typeof(_option) == 'string' && $.data(this, DATA_NAME) ){
				switch( _option ){
					case 'startSlideShow':
						$.data(this, DATA_NAME).startSlideShow();
						break;
					case 'stopSlideShow':
						$.data(this, DATA_NAME).stopSlideShow();
						break;
					case 'refreshSize':
						$.data(this, DATA_NAME).refreshSize();
						break;
					case 'setHeight':
						try {
							if ( isNaN(_param) ){
								throw new Error('check parameter!')
							}

							$.data(this, DATA_NAME).setHeight( _param );
						} catch (err) {
							console.log(err)
						}
						break;
					case 'toPrev':
						$.data(this, DATA_NAME).toPrev();
						break;
					case 'toNext':
						$.data(this, DATA_NAME).toNext();
						break;
					case 'toSlide':
						try {
							if ( isNaN(_param) ){
								throw new Error('check parameter!')
							}

							$.data(this, DATA_NAME).toSlide( _param );
						} catch (err) {
							console.log(err)
						}
						break;
					case 'destory':
						$.data(this, DATA_NAME).destory();
						break;
					case 'touchEnable':
						$.data(this, DATA_NAME).touchEnable( );
						break;
					case 'touchDisable':
						try {
							if ( typeof(_param) == 'boolean' ){
								throw new Error('check parameter!')
							}

							$.data(this, DATA_NAME).touchDisable( _param );	
						} catch (err) {
							console.log(err)
						}
						break;
				}
			} else if ( !$.data(this, DATA_NAME) ){
				var option = _option || {};

				option.$list   = option.$list || $( this ).find( '> ul > li' );
				option.$wrap   = option.$wrap || $( this ).find( '> ul' );
				option.wrap    = option.$wrap.toArray() || [];
				option.list    = option.$list.toArray() || [];
				option.pages   = ( option.$pages   && option.$pages.toArray )   ? option.$pages.toArray() : [];
				option.toStart = ( option.$toStart && option.$toStart.toArray ) ? option.$toStart.toArray() : [];
				option.toStop  = ( option.$toStop  && option.$toStop.toArray )  ? option.$toStop.toArray() : [];
				option.toPrev  = ( option.$toPrev  && option.$toPrev.toArray )  ? option.$toPrev.toArray() : [];
				option.toNext  = ( option.$toNext  && option.$toNext.toArray )  ? option.$toNext.toArray() : [];

				$.data(this, DATA_NAME, new SwipeBase(option));
			}
		})
	}


	/**
	 * Deprecated below!! 
	 */
	$.fn.swipeBase2start = function(){
		return this.each( function(){
			let inst = $( this ).data( DATA_NAME );

			if ( typeof inst !== 'undefined' && typeof inst.startSlideShow !== 'undefined' ){
				inst.startSlideShow();
			}
		});
	};

	$.fn.swipeBase2stop = function(){
		return this.each( function(){
			let inst = $( this ).data( DATA_NAME );

			if ( typeof inst !== 'undefined' && typeof inst.stopSlideShow !== 'undefined' ){
				inst.stopSlideShow();
			}
		});
	};

	$.fn.swipeBase2refresh = function(){
		return this.each( function(){
			let inst = $( this ).data( DATA_NAME );

			if ( typeof inst !== 'undefined' && typeof inst.refreshSize !== 'undefined' ){
				inst.refreshSize();
			}
		});
	};

	$.fn.swipeBase2setHeight = function( _hei ){
		return this.each( function(){
			let inst = $( this ).data( DATA_NAME );

			if ( typeof inst !== 'undefined' && typeof inst.setHeight !== 'undefined' ){
				inst.setHeight( _hei );
			}
		});
	};

	$.fn.swipeBase2prev = function(){
		return this.each( function(){
			let inst = $( this ).data( DATA_NAME );

			if ( typeof inst !== 'undefined' && typeof inst.toPrev !== 'undefined' ){
				inst.toPrev();
			}
		});
	};

	$.fn.swipeBase2next = function(){
		return this.each( function(){
			let inst = $( this ).data( DATA_NAME );

			if ( typeof inst !== 'undefined' && typeof inst.toNext !== 'undefined' ){
				inst.toNext();
			}
		});
	};

	$.fn.swipeBase2slide = function( _idx ){
		return this.each( function(){
			let inst = $( this ).data( DATA_NAME );

			if ( typeof inst !== 'undefined' && typeof inst.toSlide !== 'undefined' ){
				inst.toSlide( _idx );
			}
		});
	};

	$.fn.swipeBase2destory = function(){
		return this.each( function(){
			let inst = $( this ).data( DATA_NAME );

			if ( typeof inst !== 'undefined' && typeof inst.destory !== 'undefined' ){
				inst.destory();
			}
		});
	};

	$.fn.swipeBase2touchEnable = function(){
		return this.each( function(){
			let inst = $( this ).data( DATA_NAME );

			if ( typeof inst !== 'undefined' && typeof inst.touchEnable !== 'undefined' ){
				inst.touchEnable();
			}
		});
	};

	$.fn.swipeBase2touchDisable = function( _direct ){
		return this.each( function(){
			let inst = $( this ).data( DATA_NAME );

			if ( typeof inst !== 'undefined' && typeof inst.touchDisable !== 'undefined' ){
				inst.touchDisable( _direct );
			}
		});
	};
}( jQuery ));


module.exports = SwipeBase;