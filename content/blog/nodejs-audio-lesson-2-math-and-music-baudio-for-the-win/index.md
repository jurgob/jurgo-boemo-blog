---
  slug: "/posts/nodejs-audio-lesson-2-math-and-music-baudio-for-the-win/"
  date: 2021-08-03
  title: "Nodejs audio lesson 2: Ear your voice from your speakers"
  draft: false
  description: "In the previous lesson we did the setup of our project, and we learned how to acquire audio from our mic and dump it into a file. remember, to make this package work, you neet to be sure you have…"
  categories: []
  keywords: []
---
  
In the [previous lesson](https://medium.com/@jurgo.boemo/nodejs-audio-lesson-1-enter-the-mic-9df64d0c1ad3) we did the setup of our project, and we learned how to acquire audio from our mic and dump it into a file.

In this article, we are gonna use your microphone.

Let’s start creating a file for this lesson:

```js
touch lesson_02__speaker.js
```

then lets install an npm packege called`speaker`:

```js
npm install -s speaker
```

remember, to make this package work, you neet to be sure you have installed [sox](http://sox.sourceforge.net/). That’s the same tool we have installed in the previous lesson to make the `mic` package work, so if you did the lesson 1, you don’t need to install sox now.

now inside the `lesson_02_spkeaker.js` add the following code:

![](/images/nodejs-audio-lesson-2-math-and-music-baudio-for-the-win-0.png)

go [here](https://github.com/jurgob/nodejs_audio_examples/blob/main/lesson_02__speaker.js) to find the full code

run the file with the command:

```js
node lesson_02__speaker.js
```

if you talk now, you will ear back your voice. press _ctrl + c_ to close the application.

### What have we done?

the mic is initialized as the previous lesson.

with those line we are gonna initialize the speaker:

```js
const speaker = new Speaker({  
    sampleRate: audioConfig.rate,  
    channels: audioConfig.channels,  
    bitDepth: audioConfig.bitDepth  
  });
```

the object \`speaker\` is now a Writable stream so we can “write” our audio in our speakers with the line:

```js
micInputStream.pipe(speaker);
```

**next lesson:** [Nodejs audio lesson 3: Math and Music, baudio for the win](https://medium.com/@jurgo.boemo/nodejs-audio-lesson-3-math-and-music-baudio-for-the-win-a9a8d28ef0a5)
  