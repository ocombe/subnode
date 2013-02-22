$(document).ready(function() {
	$("[rel=tooltip]").tooltip();

	$("#settings").click(function (e) {
		e.preventDefault();
		$('#charms').charms('showSection', 'theme-charms-section');
	});
});

function toggleLoading($target, active) {
	$target.data('isLoading', active);
	if(!active) {
		$target.siblings('.loader').addClass('hidden');
	} else {
		$target.siblings('.loader').removeClass('hidden');
	}
}

function getSubs(target, episode) {
	var $target = $(target);
	if(!$target.data('isLoading') && ($target.hasClass('label-success') || $target.hasClass('label-important'))) {
		$newTarget = $target.siblings('.subtitles');
		if(!$newTarget.hasClass('active')) {
			if($newTarget.html() == '') {
				toggleLoading($target, true);
				now.ready(function() {
					now.getSubs($('#showName').text(), episode, function(subtitles, providerName) {
						var text = '';
							for(var i in subtitles) {
								text = text + '<div class="tile wide text"><div class="column3-info tile wide text qualite'+subtitles[i].quality+'">Source: '+subtitles[i].source+'</div><div class="text-header">' + subtitles[i].file + '</div>';
								for(var j in subtitles[i].content) {
									if(subtitles[i].content[j].type == 'subtitle') {
										text = text + '<div><span rel="tooltip" data-placement="right" title="Compatibility score: ' + subtitles[i].content[j].score + '">[' + subtitles[i].content[j].score + ']</span> <a http=\'\' onClick=\'downloadSub(this, "' + escape(episode) + '", "' + escape(subtitles[i].url) + '", "' + escape(subtitles[i].content[j].name) + '"); return false;\'>' + subtitles[i].content[j].name + '</a> <div class="loader hidden"></div></div>';
									}
								}
								text = text + '</div>';
							}
						if(text == '') {
							text = '<div class="tile wide text"><div class="text">No subtitles available on <b>' + providerName + '</b></div></div>';
						}
						$newTarget.parent().find('.subtitles').append(text);
						$newTarget.addClass('active');
						$("[rel=tooltip]").tooltip();
					}, function() {
						toggleLoading($target, false);
					});
				});
			} else {
				$newTarget.addClass('active');
			}
		} else {
			$newTarget.removeClass('active');
		}
	}
}

function downloadSub(target, episode, url, subtitle) {
	var $target = $(target);
	if(!$target.data('isLoading') && !$target.hasClass('label-success')) {
		toggleLoading($target, true);
		episode = unescape(episode);
		url = unescape(url);
		subtitle = unescape(subtitle);
		now.download(episode, url, subtitle, function(success) {
			toggleLoading($target, false);
			if(success) {
				$target.addClass('label label-success').removeClass('label-important');
				$target.closest('.subtitles').siblings('span.label').addClass('label-success').removeClass('label-important');
			} else {
				$target.addClass('label label-important');
			}
		});
	}
}

function saveParams() {
	var username = $('#username').val();
	var password = $('#password').val();
	var baseFolder = $('#baseFolder').val();
	var sickbeardUrl = $('#sickbeardUrl').val();
	var sickbeardApiKey = $('#sickbeardApiKey').val();
	var autorename = $('#autorename').is(':checked');
	var subLang = $('#subLang').val();
	if(baseFolder != '' || (sickbeardUrl != '' && sickbeardApiKey != ''))   {
		now.saveParams({
			username: password == '' ? '' : username,
			password: username == '' ? '' : password,
			baseFolder: baseFolder,
			sickbeardUrl: sickbeardUrl,
			sickbeardApiKey: sickbeardApiKey,
			autorename: autorename,
			subLang: subLang
		});
		return true;
	} else {
		return false;
	}
}