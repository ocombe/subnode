subNode
=======

An app to download subtitles for your TV Shows


# Features
* Automagically parse your TV Shows folder and let you download subtitles for your episodes

* Multi languages. Currently english and french support. If you want another language, feel free to [open an issue](https://github.com/ocombe/subNode/issues) or to [send me an email](mailto:olivier.combe+githubsubnode@gmail.com?subject=subNode)

* Auto update: it checks github for new releases and let you update your app with one click

* Quality coloring & automatic rating to let you choose your subtitles accordingly to the source

* Autorename your subtitles to the name of your video file (optionnal)

* And many more...


# Installation & usage :
1. Download and install [nodeJS](http://nodejs.org/download/).


2. Go to the subNode folder and launch the init script, it will download and compile the modules for your environment

  On Windows : ```./scripts/init.bat```

  On Linux : ```sudo sh scripts/init.sh```

  Or via the command line :```npm install --production --unsafe-perm```


3. Launch the server :

  On Windows : ```./scripts/launch.bat```

  On Linux : ```sudo sh scripts/launch.sh```

  Or via the command line :```node app.js```

4. Go to http://localhost:3000/ and enjoy !

# Screenshots
* Home

[![Home](http://ocombe.github.io/subNode/img/home.jpg)](http://ocombe.github.io/subNode/img/home.jpg)


* Parameters

[![Parameters](http://ocombe.github.io/subNode/img/params.jpg)](http://ocombe.github.io/subNode/img/params.jpg)


* Show page

[![Show page](http://ocombe.github.io/subNode/img/shows.jpg)](http://ocombe.github.io/subNode/img/shows.jpg)


* Subtitles

[![Subtitles](http://ocombe.github.io/subNode/img/subtitles.jpg)](http://ocombe.github.io/subNode/img/subtitles.jpg)