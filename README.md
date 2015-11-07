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
1. Download the release for your operating system on [the releases page](https://github.com/ocombe/subNode/releases).

2. Unzip and launch subnode (subnode.exe on Windows) at the root of the folder than you just unzipped.

# Installation on a headless server (for advanced users) :
1. Download and install [nodeJS > v0.10.42](http://nodejs.org/download/).

2. Download/clone this repository on your computer.

3. Go to the subNode folder and install the node modules (it will download and compile the modules for your environment) :

  ```sh
  npm install --production --unsafe-perm
  ```

4. Launch the server :

  ```sh
  node app.js
  ```

5. Go to http://localhost:3000/ and enjoy !

# Troubleshooting

* I have an error "EADDRINUSE" when I try to start the app :
  subNode uses the port 3000 by default. If this port is already used by another program you will get this error. You can change the value of the variable "port" in the file appParams.json

# Screenshots
* Home

![Home](https://cloud.githubusercontent.com/assets/265378/11016792/8732ef2c-858b-11e5-8e81-4e4c1138a3a8.jpg)


* Parameters

![Parameters](https://cloud.githubusercontent.com/assets/265378/11016793/87338680-858b-11e5-938e-3c328932292d.jpg)


* Show page

![Show Page](https://cloud.githubusercontent.com/assets/265378/11016794/873425fe-858b-11e5-8301-2f9aa7d116e5.jpg)


