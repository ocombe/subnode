var isLoading = false;
$(document).ready(function() {
	$("[rel=tooltip]").tooltip();

	$("#settings").click(function (e) {
		e.preventDefault();
		$('#charms').charms('showSection', 'theme-charms-section');
	});
});

function toggleLoading(e, active) {
	isLoading = active;
	if(!isLoading) {
		$(e).siblings('.loader').addClass('hidden');
	} else {
		$(e).siblings('.loader').removeClass('hidden');
	}
}

function getSubs(e, episode) {
	if(!isLoading) {
		var $target = $(e.currentTarget).siblings('.subtitles');
		if(!$target.hasClass('active') && $target.html() == '') {
			toggleLoading($target, true);
			now.ready(function() {
				now.getSubs($('#showName').text(), episode, function(subtitles) {
					var text = '';
						for(var i in subtitles) {
							text = text + '<div class="tile wide text"><div class="column3-info tile wide text qualite'+subtitles[i].quality+'">Source: '+subtitles[i].source+'</div><div class="text-header">' + subtitles[i].file + '</div>';
							for(var j in subtitles[i].content) {
								if(subtitles[i].content[j].type == 'subtitle') {
									text = text + '<div><a onClick=\'download(event, "' + subtitles[i].url + '", "' + episode.substr(0, episode.lastIndexOf('/')) + '", "' + subtitles[i].content[j].name + '");\'>' + subtitles[i].content[j].name + '</a> <div class="loader hidden"></div></div>';
								}
							}
							text = text + '</div>';
						}
					if(text == '') {
						text = '<div class="tile wide text"><div class="text">Aucun sous titre disponible</div></div>';
					}
					$target.parent().find('.subtitles').append(text);
					$target.addClass('active');
					toggleLoading($target, false);
				});
			});
		} else {
			$target.removeClass('active');
		}
	}
}

function download(e, folder, url, subtitle) {
	var $target = $(e.currentTarget);
	if(!isLoading && !$target.hasClass('label-success')) {
		toggleLoading($target, true);
		now.download(folder, url, subtitle, function(success) {
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
	var dir = $('#baseFolder').val();
	if(dir != '')   {
		now.saveParams(dir);
		return true;
	} else {
		return false;
	}
}