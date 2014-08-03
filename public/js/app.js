'use strict';

var subNode = angular.module('subNode', ['ngResource', 'ngCookies', 'ngAnimate', 'pascalprecht.translate', 'LocalStorageModule', 'ui.router', 'restangular']);

subNode.config(['$stateProvider', '$locationProvider', '$urlRouterProvider', function($stateProvider, $locationProvider, $urlRouterProvider, config) {
	$urlRouterProvider.otherwise("/");

	$stateProvider.state('subNode', {
			views: {
				"mainView": {}
			}
		}
	).state('index', {
			parent: 'subNode',
			url: "/", // root route
			views: {
				"mainView@": {
					templateUrl: "partials/home.html",
					controller: 'HomeCtrl'
				}
			}
		}
	).state('show', {
			parent: 'subNode',
			url: "/show/:showId",
			views: {
				"mainView@": {
					templateUrl: "partials/show.html",
					controller: 'ShowCtrl'
				}
			}
		}
	);

	// Without server side support html5 must be disabled.
	return $locationProvider.html5Mode(false);
}]);
;'use strict';

subNode.controller('ConfigCtrl', ['$scope', '$rootScope', '$translate', '$rest', function($scope, $rootScope, $translate, $rest) {
	$scope.params.lang = $translate.uses();
	$scope.params.password2 = $scope.params.password;

	$scope.selectLangChange = function() {
		$translate.uses($scope.params.lang);
	}

	$scope.languages = [
		{
			id: 'fr',
			name: 'Français'
		},
		{
			id: 'en',
			name: 'English'
		},
		{
			id: 'nl',
			name: 'Dutch'
		}
	];

	$scope.saveParams = function() {
		$scope.params.post().then(function(res) {
			if(res) {
				$scope.error = res;
			} else {
				window.location.reload();
			}
		});
	}
}]);
;'use strict';

subNode.controller('HomeCtrl', ['$scope', '$translate', 'Restangular', '$loader', function($scope, $translate, $rest, $loader) {
	$("#selectedTVShow").val('').trigger('liszt:updated'); // update select

	var getLastEpisodes = function(refresh) {
		$scope.lastEpisodes = [];
		$loader.loading('home', true);
		$rest.all('lastEpisodes/'+(refresh === true)).getList().then(function(lastEpisodes) {
			$loader.loading('home', false);
			$scope.lastEpisodes = lastEpisodes;
		});
	}
	getLastEpisodes();

	$scope.refresh = function(refresh) {
		getLastEpisodes(refresh);
	}

	$scope.copyright = $translate('COPYRIGHT');
}]);
;'use strict';

subNode.controller('ShowCtrl', ['$scope', '$translate', 'Restangular', '$stateParams', '$loader', '$timeout', '$q', function($scope, $translate, $rest, $stateParams, $loader, $timeout, $q) {
	$scope.compact = false;
	$scope.selectedEpisode = {};
	$scope.subtitlesListShow = false;
	$scope.showId = $stateParams.showId;
	$scope.showInfo = false;
	$scope.hideOverview();

	$scope.filter = function(season) {
		$scope.seasonFilter = season;
		$scope.expand();
	}

	$scope.unsubs = function(episodes) {
		return _.filter(episodes, {'subtitle': undefined}).length;
	}

	$scope.refresh = function() {
		$scope.show = null;
		$rest.one('show/' + $stateParams.showId).get().then(function(show) {
			$scope.show = show;
			if(show.length > 0) {
				$scope.seasonFilter = show[show.length - 1].season; // default filter on last season
			}
			$("#selectedTVShow").val($scope.showList.indexOf($stateParams.showId)).trigger('liszt:updated');
		});
	}

	$scope.searchSubs = function(e) {
		$loader.loading('subtitles', true);
		$scope.compact = true;
		$scope.loadingDone = false;
		$scope.selectedEpisode = this.ep;
		$('.episode.active').removeClass('active');
		$(e.currentTarget).addClass('active');
		$('.seasonsList').addClass('col-lg-1').removeClass('col-lg-3');
		$('.episodesList').addClass('col-lg-1').removeClass('col-lg-9');
		$timeout(function() {
			$scope.subtitlesListShow = true;
		}, 600);
		$timeout(function() {
			$('.episodesList, .seasonsList').addClass('compacted');
		}, 750);

		$scope.subList = [];

		var providers = [];
		if($scope.params.providers.indexOf('addic7ed') !== -1) {
			var addic7ed = $rest.one('addic7ed/' + $stateParams.showId + '/' + this.ep.name).get();
			addic7ed.then(function(subtitles) {
				if(subtitles[0] && subtitles[0].content[0].episode === $scope.selectedEpisode.episode && subtitles[0].content[0].season === $scope.selectedEpisode.season) {
					$scope.subList = $scope.subList.concat(subtitles);
				}
			});
			providers.push(addic7ed);
		}

		if($scope.params.providers.indexOf('betaSeries') !== -1) {
			var betaSeries = $rest.one('betaSeries/' + $stateParams.showId + '/' + this.ep.name).get();
			betaSeries.then(function(subtitles) {
				if(subtitles[0] && subtitles[0].content[0].episode === $scope.selectedEpisode.episode && subtitles[0].content[0].season === $scope.selectedEpisode.season) {
					$scope.subList = $scope.subList.concat(subtitles);
				}
			});
			providers.push(betaSeries);
		}

		$q.all(providers).then(function() {
			$loader.loading('subtitles', false);
			$scope.loadingDone = true;
		});
	}

	$scope.downloadSub = function(e) {
		$loader.loading('subtitles', true);
		$scope.selectedEpisode.subtitle = this.sub;
		$rest.one('download').post("", {
			episode: $scope.selectedEpisode.file,
			url: this.subPack.url,
			subtitle: this.sub.file
		}).then(function(res) {
				$loader.loading('subtitles', false);
				var name = $(e.currentTarget).find('.name'),
					icons = name.find('i');
				if(icons.length > 0) {
					icons.remove();
				}
				if(res.success) {
					name.append(' <i class="success glyphicon glyphicon-ok"></i>');
					$('.episode.active').addClass('alert-success');
				} else {
					name.append(' <i class="error glyphicon glyphicon-remove"></i>');
				}
			});
	}

	$scope.expand = function() {
		$loader.loading('subtitles', false);
		$scope.compact = false;
		$('.seasonsList').addClass('col-lg-3').removeClass('col-lg-1');
		$('.episodesList').addClass('col-lg-9').removeClass('col-lg-1');
		$('.episode.active').removeClass('active');
		$scope.subtitlesListShow = false;
		$timeout(function() {
			$('.episodesList, .seasonsList').removeClass('compacted');
		}, 750);
	}

	var getShowInfo = function(lang) {

	}

	$scope.refresh(); // init

	$timeout(function() {
		$rest.one('info/' + $stateParams.showId + '/' + $translate.uses()).get().then(function(res) {
			$scope.showInfo = res;
		});
	});
}]);
;'use strict';

subNode.controller('SubnodeCtrl', ['$scope', '$state', 'Restangular', '$timeout', '$translate', '$loader', function($scope, $state, $rest, $timeout, $translate, $loader) {
	$scope.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if(phase == '$apply' || phase == '$digest') {
			if(fn && (typeof(fn) === 'function')) {
				fn();
			}
		} else {
			this.$apply(fn);
		}
	};

	$rest.one('params').get().then(function(params) {
		$scope.params = params;
		if(typeof params.rootFolder === 'undefined') {
			$scope.openModal('partials/config.html');
		}
	});

	$rest.all('showList').getList().then(function(data) {
		$scope.showList = data;
	});

	$scope.changeShow = function() {
		$state.transitionTo('show', {showId: $scope.selectedTVShow});
	}

	var checkUpdate = function() {
		$rest.one('checkUpdate').get().then(function(res) {
			if(res.upToDate === false) {
				$scope.updateMsg = res;
			} else {
				$scope.updateMsg = false;
				$timeout(function() {
					checkUpdate();
				}, 24*60*60*1000);
			}
		});
	}
	checkUpdate();

	$scope.updateApp = function() {
		$loader.loading('update', true);
		$scope.updateError = false;
		if(confirm($translate('UPDATE_CONFIRM'))) {
			$rest.one('update').get().then(function(res) {
				if(res.success) {
					$timeout(function() {
						$loader.loading('update', false);
						window.location.reload();
					}, 5000);
				} else {
					$scope.updateError = res;
					$loader.loading('update', false);
				}
			});
		} else {
			$loader.loading('update', false);
		}
	}
}]);
;'use strict';

subNode.directive('appVersion', [
	'$version', function($version) {
		return function(scope, elm, attrs) {
			return elm.text($version);
		};
	}
]);
;subNode.directive('chosen', ['$timeout', function($timeout) {
	var NG_OPTIONS_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w\d]*)|(?:\(\s*([\$\w][\$\w\d]*)\s*,\s*([\$\w][\$\w\d]*)\s*\)))\s+in\s+(.*)$/,
		CHOSEN_OPTION_WHITELIST = ['noResultsText', 'allowSingleDeselect', 'disableSearchThreshold', 'disableSearch', 'enableSplitWordSearch', 'inheritSelectClasses', 'maxSelectedOptions', 'placeholderTextMultiple', 'placeholderTextSingle', 'searchContains', 'singleBackstrokeDelete', 'displayDisabledOptions', 'displaySelectedOptions'],
		snakeCase = function(input) {
			return input.replace(/[A-Z]/g, function($1) {
				return "_" + ($1.toLowerCase());
			});
		},
		isEmpty = function(value) {
			var key, _i, _len;
			if(angular.isArray(value)) {
				return value.length === 0;
			} else if(angular.isObject(value)) {
				for(_i = 0, _len = value.length; _i < _len; _i++) {
					key = value[_i];
					if(value.hasOwnProperty(key)) {
						return false;
					}
				}
			}
			return true;
		},
		__indexOf = [].indexOf || function(item) {
			for(var i = 0, l = this.length; i < l; i++) {
				if(i in this && this[i] === item) return i;
			}
			return -1;
		};
	return {
		restrict: 'A',
		link: function($scope, $element, $attrs) {
			var match, valuesExpr,
				options = $scope.$eval($attrs.chosen) || {},
				startLoading = function() {
					return $element.addClass('loading').attr('disabled', true).trigger('chosen:updated');
				},
				stopLoading = function() {
					return $element.removeClass('loading').attr('disabled', false).trigger('chosen:updated');
				},
				disableWithMessage = function(message) {
					return $element.empty().append("<option selected>" + message + "</option>").attr('disabled', true).trigger('chosen:updated');
				};
			angular.forEach($attrs, function(value, key) {
				if(__indexOf.call(CHOSEN_OPTION_WHITELIST, key) >= 0) {
					return options[snakeCase(key)] = $scope.$eval(value);
				}
			});
			if($attrs.ngOptions) {
				match = $attrs.ngOptions.match(NG_OPTIONS_REGEXP);
				valuesExpr = match[7];
				if(angular.isUndefined($scope.$eval(valuesExpr))) {
					startLoading();
				}
				$scope.$watch(valuesExpr, function(newVal, oldVal) {
					if(newVal !== oldVal) {
						stopLoading();
						if(isEmpty(newVal)) {
							return disableWithMessage(options.no_results_text || 'No values available');
						} else {
							$timeout(function() {
								return $element.chosen(options);
							});
						}
					}
				});
			} else {
				$timeout(function() {
					return $element.chosen(options);
				});
			}
		}
	};
}]);

;subNode.directive('imageFallback', function () {
	return {
		link: function link($scope, $element, $attrs) {
			$element.bind('error', function() {
				$element.replaceWith('<h1>'+$attrs.imageFallback+'</h1>');
			});
		}
	};
});
;'use strict';

subNode.directive('loader', [function() {
	return {
		restrict: 'E',
		replace: true,
		scope: 'isolate',
		template: [
			'<div class="loader" ng-show="isLoading">',
				'<span class="loader-block"></span>',
				'<span class="loader-block"></span>',
				'<span class="loader-block"></span>',
				'<span class="loader-block"></span>',
				'<span class="loader-block"></span>',
				'<span class="loader-block"></span>',
				'<span class="loader-block"></span>',
				'<span class="loader-block"></span>',
				'<span class="loader-block"></span>',
			'</div>'
		].join(''),
		link: function link($scope, $element, attrs, ngModel) {
			$scope.isLoading = attrs.loaderActive;
			$scope.$on('loading.'+attrs.loaderId, function(e, isLoading) {
				$scope.isLoading = isLoading;
			});
		}
	}
}]).factory('$loader', ['$rootScope', function($rootScope) {
	var $loader = {
		loadCount: {},
		isLoading: {},

		checkExists: function(loaderId) {
			if(typeof $loader.loadCount[loaderId] === 'undefined') {
				$loader.loadCount[loaderId] = 0;
				$loader.isLoading[loaderId] = false;
			}
		},

		loading: function loading(loaderIdList, setLoad) {
			_.each(loaderIdList.split(' '), function(loaderId) {
				$loader.checkExists(loaderId);
				if(setLoad) {
					$loader.loadCount[loaderId]++;
				} else if($loader.loadCount[loaderId] > 0) {
					$loader.loadCount[loaderId]--;
				}
				if($loader.loadCount[loaderId] > 0 && !$loader.isLoading[loaderId]) {
					$loader.isLoading[loaderId] = true;
					$rootScope.$broadcast('loading.'+loaderId, true);
				} else if($loader.loadCount[loaderId] == 0 && $loader.isLoading[loaderId]) {
					$loader.isLoading[loaderId] = false;
					$rootScope.$broadcast('loading.'+loaderId, false);
				}
			})
		},

		stopLoading: function(loaderId) {
			$loader.checkExists(loaderId);
			$loader.loadCount[loaderId] = 0;
			$loader.isLoading[loaderId] = false;
			$rootScope.$broadcast('loading.'+loaderId, false);
		}
	};

	return $loader;
}]);
;'use strict';

subNode.directive('modal', ['$rootScope', '$controller', '$location', '$timeout', function($rootScope, $controller, $location, $timeout) {
	return {
		restrict: 'E',
		replace: true,
		template: [
			'<div class="modal-wrapper fade-in" ng-show="modalShow">',
				'<div class="modal-backdrop fade in"></div>',
				'<div role="dialog" tabindex="-1" class="modal fade in">',
					'<div class="modal-dialog">',
						'<div class="modal-content" ng-include="modalView"></div>',
					'</div>',
				'</div>',
			'</div>'
		].join(''),

		link: function link($scope, $element, attrs) {
			var baseOverflow = document.body.style.overflow,
				modalParams = {},
				onClose = function() {
					if(typeof modalParams.onClose === 'function') {
						modalParams.onClose();
					}
					$scope.callbacksList = []; // forget all callbacks
					$scope.modalView = ''; // remove the current view
				}
			$scope.$watch('modalShow', function(show) {
				if(show) {
					document.body.style.overflow = 'hidden';
					if(typeof modalParams.onOpen === 'function') {
						modalParams.onOpen();
					}
					if(modalParams.closeOnEsc !== false) { // close modal on ESC key ?
						kd.ESC.press(function() {
							kd.ESC.unbindPress();
							$scope.$apply(function() {
								$scope.modalShow = false;
							});
						});
					}
				} else {
					document.body.style.overflow = baseOverflow;
					onClose();
				}
			});

			$rootScope.openModal = function(opt) {
				if(typeof opt === 'string') {
					opt = {
						url: opt
					}
				}
				if(typeof modalParams === 'object') {
					if($scope.modalShow === true && opt.url === modalParams.url && modalParams.path !== $location.path()) { // if modal already opened & same url but different path
						onClose();
						$timeout(function() { // let the ng-include detect that it's now empty
							$rootScope.openModal(opt);
						});
						return;
					}
					modalParams = opt;
					modalParams.path = $location.path();
					$scope.modalShow = true;

					var off = $scope.$on('$includeContentLoaded', function(event) { // on view load
						modalParams.scope = event.targetScope;
						if(typeof modalParams.controller === 'string') {
							$controller(modalParams.controller, {$scope: event.targetScope}); // inject controller
						}
						off();
					});

					$scope.modalView = modalParams.url; // load the view

					if(typeof callback === 'function') {
						$scope.callbacksList.push(callback);
					}
				}
			}

			$rootScope.closeModal = function() {
				$scope.modalShow = false;
			}
		}
	}
}]).directive('modalOpen', ['$rootScope', function($rootScope) {
	return {
		restrict: 'A',
		link: function($scope, $element, $attrs) {
			$element.on('click', function(e) {
				e.preventDefault();
				if(typeof $attrs.modalOpen === 'string') {
					$scope.$apply(function() {
						$rootScope.openModal({
							url: $attrs.modalOpen,
							controller: $attrs.modalCtrl
						});
					});
				}
			});
		}
	};
}]);
;'use strict';

subNode.directive('ngBlur', ['$parse', function($parse) {
    return function(scope, element, attr) {
        var fn = $parse(attr['ngBlur']);
        element.bind('blur', function(event) {
            scope.$apply(function() {
                fn(scope, {$event:event});
            });
        });
    }
}]);
;'use strict';

subNode.directive('ngFocus', ['$parse', function($parse) {
    return function(scope, element, attr) {
        var fn = $parse(attr['ngFocus']);
        element.bind('focus', function(event) {
            scope.$apply(function() {
                fn(scope, {$event:event});
            });
        });
    }
}]);
;'use strict';

subNode.directive('overview', ['$rootScope', '$translate', '$filter', function($rootScope, $translate, $filter) {
	$rootScope.hideOverview = function() {
		$rootScope.overview = undefined;
	}
	return {
		restrict: 'A',
		scope: true,
		link: function($scope, $element, attrs) {
			var episodeInfo;
			$element.css('cursor', 'help');
			$element.on('click', function(e) {
				$scope.$apply(function() {
					if($scope.$parent.ep && !episodeInfo) {
						episodeInfo = $filter('episodeInfo')($scope.showInfo.episodes, $scope.$parent.ep);
					}
					$rootScope.overview = {
						header: episodeInfo ? $filter('decimalFormat')(episodeInfo.season) + 'x' + $filter('decimalFormat')(episodeInfo.number) + ' - ' + episodeInfo.name : $scope.showId,
						content: episodeInfo ? episodeInfo.overview : $scope.showInfo.tvShow.overview
					};
				});
				window.scrollTo(0,0);
				e.preventDefault();
			});
		}
	}
}]);
;'use strict';

subNode.directive('tooltip', ['$parse', function($parse) {
	return {
		restrict: 'A',
		link: function($scope, $element, attrs) {
			var title;
			$scope.$watch(function() {return $element.attr('title'); }, function(newVal, oldVal) {
				if(attrs.title && (!title || newVal != oldVal)) {
					title = attrs.title;
					$element.tooltip({
						title: attrs.title,
						placement: 'top'
					});
				}
			})
		}
	}
}]);
;'use strict';

subNode.filter('decimalFormat', function() {
		return function(input) {
			if(isNaN(input)) return input;

			return input < 10 ? '0' + input : input;
		};
	}
);
;'use strict';

subNode.filter('episodeInfo', function() {
		return function(input, query) {
			if(!input || !query) {
				return null;
			}
			return _.find(input, function(ep) {
				return ep.season == query.season && ep.number == query.episode;
			});
		};
	}
);
;'use strict';

subNode.filter('localDate', ['$filter', '$translate', function($filter, $translate) {
		return function(date) {
			return $filter('date')(date, $translate('DATE_FORMAT')) + ' ' + $translate('AT') + ' ' + $filter('date')(date, $translate('TIME_FORMAT'));
		};
	}
]);
;'use strict';

subNode.filter('qualitySort', function() {
		var cachedInput;
		return function(input) {
			if(!input || cachedInput === input) return input;

			cachedInput = input.sort(function(a, b) {
				return a.quality == b.quality ? _.max(b.content, 'score').score - _.max(a.content, 'score').score : b.quality - a.quality;
			});

			return cachedInput;
		};
	}
);
;'use strict';

subNode.filter('seasonFilter', function() {
		return function(input, query) {
			if(!query) return input;

			return  [_.find(input, function(obj) {
				return obj.season == query;
			})];
		};
	}
);
;'use strict';

subNode.factory('$rest', ['Restangular', function(Restangular) {
	var $rest = Restangular.withConfig(function(RestangularConfigurer) {
		// Modifie la récup des réponses pour pouvoir accéder à la réponse d'origine (data clean)
		RestangularConfigurer.setResponseExtractor(function(response) {
			var newResponse = response;
			if(angular.isArray(response)) {
				angular.forEach(newResponse, function(value, key) {
					newResponse[key].originalElement = angular.copy(value);
				});
			} else {
				newResponse.originalElement = angular.copy(response);
			}

			return newResponse;
		});
	});

	// nettoye un objet Restangular des propriétés & fonctions ajoutées
	$rest.clean = function clean(obj) {
		return _.omit(obj, _.functions(obj), ['originalElement', 'parentResource', 'restangularCollection', 'route']);
	}

	return $rest;
}]);
;'use strict';

subNode.config(['$translateProvider', function($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'i18n/locale-',
        suffix: '.json'
    });

    $translateProvider.useLocalStorage();
	var userLang = navigator.language.split('-')[0]; // use navigator lang if available
	$translateProvider.preferredLanguage(/(fr|en)/gi.test(userLang) ? userLang : 'en');
    $translateProvider.translations();
}]);
;