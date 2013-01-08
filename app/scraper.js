exports.scrape = function(fileName) {
	fileName = fileName.replace(/\\/g,'/');
    var data = false,
        regular = /[\.\-_\s\[\(]+s?(\d{1,2}|\d)[xe\.\-_]p?(\d{2})/i,
        alternate = /[\.\-_\s\[\(]+(?!720\s?p|[xh]264)(\d{1,2}|\d)(\d{2})/i,
	    alternate2 = /[\.\-_\s\[\(]+s?(\d{1,2}|\d)[x\.\-_\s]*e?p?(\d{2})/i;
    var info = regular.exec(fileName) || alternate.exec(fileName) || alternate2.exec(fileName);
    if(info != null) {
        data = getData(fileName, info);
    }
    return data;
}

var getData = function(fileName, info) {
	var start = fileName.lastIndexOf('/');
	var data = {
		name: fileName.substr(fileName.lastIndexOf('/') + 1, fileName.length),
		file: fileName,
		season: parseInt(info[1], 10),
		episode: parseInt(info[2], 10),
		show: fileName.substring(start > 0 ? (start+1) : 0, fileName.indexOf(info[0])).replace(/[\._]/gi, ' ')
	};
	if(/\.(mp4|avi|mkv|mpeg)$/i.test(fileName)) {
		data.type = 'video';
	} else if(/\.(srt|ass|sub)$/i.test(fileName)) {
		data.type = 'subtitle';
	}
	return data;
}